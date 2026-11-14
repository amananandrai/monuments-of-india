// Voices the film's narration with Sarvam AI text-to-speech (Bulbul) and lays out the timeline.
//
// Reads  video/narration/narrations.json  { id: { travel, story, details } }, hand-written
//        video/narration/pronounce.json   spelling -> how the voice should say it
// Writes video/narration/timing.json      every monument's slot and shots, read by sync-site.mjs
//        video/assets/audio/narration-master.mp3
//        video/assets/audio/narration/     voiced clips, cached by text (git-ignored)
//
// Each monument's slot is: the 3D map flight (the travel line), the orbit (the story), then the
// close-ups of its crown and base (the details). Each line is voiced on its own, so every shot
// starts exactly when its line does. The slots follow the voice; only if the film would run past an
// hour and a half is the voice re-rendered a little faster.
//
//   node tools/generate-narration.mjs                     # voice what changed, build timeline
//   node tools/generate-narration.mjs --voice ritu        # another Bulbul v3 speaker
//   node tools/generate-narration.mjs --sample taj-mahal  # one monument in several voices
//
// Needs SARVAM_API_KEY in the repository's .env (git-ignored), and ffmpeg/ffprobe on PATH.
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { MONUMENTS } from '../js/data.js';
import { narrDir, audioDir, clipDir, MODEL, PARTS, NARR, RETAKES, spoken, clipFile, voice, seconds, pool } from './lib/narration.mjs';

const arg = (name, dflt) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > 0 ? process.argv[i + 1] : dflt;
};
const VOICE = arg('voice', 'aditya');
const LIMIT = 5400; // the whole film may run up to an hour and a half; the voice keeps its natural pace

// Shot layout inside a slot, in seconds.
const LEAD = 0.8; // map is up before the travel line starts
const MAP_MIN = 6; // the map flight and drone dive
const GAP = 0.7; // breath between lines
const DETAIL_MIN = 8; // two close-ups need at least this long
const TAIL = 1.8; // after the last word, before the dip

/* ---------- --sample: one monument in several voices, to choose from ---------- */
const sample = arg('sample');
if (sample) {
  const n = NARR[sample];
  if (!n) throw new Error(`No narration for ${sample}`);
  const outDir = join(narrDir, 'samples');
  mkdirSync(outDir, { recursive: true });
  const text = spoken([n.travel, n.story, n.details].join(' '));
  for (const speaker of (arg('voices', 'aditya,rahul,shubh,ritu,priya')).split(',')) {
    const wav = await voice(text, clipFile(text, speaker, 1), speaker, 1);
    const mp3 = join(outDir, `${sample}-${speaker}.mp3`);
    execFileSync('ffmpeg', ['-y', '-v', 'error', '-i', wav, '-b:a', '160k', mp3]);
    console.log(`${speaker}: ${seconds(mp3).toFixed(1)} s -> ${mp3}`);
  }
  process.exit(0);
}

/* ---------- voice every line, at a pace that fits the hour ---------- */
const missing = MONUMENTS.filter((m) => !NARR[m.id]).map((m) => m.id);
if (missing.length) throw new Error(`No narration for: ${missing.join(', ')}`);

async function voiceAll(pace) {
  const jobs = MONUMENTS.flatMap((m) => PARTS.map((p) => ({ m, p, text: spoken(NARR[m.id][p]) })));
  let done = 0;
  await pool(jobs, 2, async (j) => {
    // A line that had a hiccup is voiced again as a new take (check-narration.mjs --retake).
    j.file = await voice(j.text, clipFile(j.text, VOICE, pace, RETAKES[`${j.m.id}:${j.p}`] || 0), VOICE, pace);
    j.dur = seconds(j.file);
    if (++done % 30 === 0) console.log(`  voiced ${done}/${jobs.length}`);
  });
  return MONUMENTS.map((m) => Object.fromEntries(PARTS.map((p) => [p, jobs.find((j) => j.m === m && j.p === p)])));
}

function layout(lines) {
  let t = 0;
  return lines.map((L, i) => {
    const travelAt = LEAD;
    const mapEnd = Math.max(MAP_MIN, travelAt + L.travel.dur + 0.35);
    const storyAt = mapEnd + 0.25;
    const detailsAt = storyAt + L.story.dur + GAP;
    const duration = +(detailsAt + Math.max(L.details.dur + TAIL, DETAIL_MIN)).toFixed(2);
    const slot = {
      index: i + 1, id: MONUMENTS[i].id, start: +t.toFixed(2), duration,
      shots: { map: [0, +mapEnd.toFixed(2)], orbit: [+mapEnd.toFixed(2), +detailsAt.toFixed(2)], details: [+detailsAt.toFixed(2), duration] },
      lines: Object.fromEntries(PARTS.map((p) => [p, { at: +({ travel: travelAt, story: storyAt, details: detailsAt })[p].toFixed(2), duration: +L[p].dur.toFixed(2) }]))
    };
    t += duration;
    return slot;
  });
}

let pace = Number(arg('pace', 1));
console.log(`Voicing ${MONUMENTS.length * 3} lines with Sarvam ${MODEL} (${VOICE}, pace ${pace})...`);
let lines = await voiceAll(pace);
let slots = layout(lines);
let total = slots.reduce((s, x) => s + x.duration, 0);
if (total > LIMIT && !process.argv.includes('--pace')) {
  // Speech scales with 1/pace; the fixed parts of each slot do not.
  const speech = lines.reduce((s, L) => s + PARTS.reduce((a, p) => a + L[p].dur, 0), 0);
  pace = Math.min(1.3, +(pace * speech / (speech - (total - LIMIT) - 15)).toFixed(2));
  console.log(`  ${total.toFixed(0)} s is over the limit of ${LIMIT} s; voicing again at pace ${pace}...`);
  lines = await voiceAll(pace);
  slots = layout(lines);
  total = slots.reduce((s, x) => s + x.duration, 0);
}
total = +total.toFixed(2);
writeFileSync(join(narrDir, 'timing.json'), JSON.stringify({ voice: VOICE, model: MODEL, pace, total, slots }, null, 2) + '\n');
console.log(`Timeline: ${slots.length} slots, ${total} s (${Math.floor(total / 60)} min ${Math.round(total % 60)} s).`);

/* ---------- the master narration track ---------- */
console.log('Mixing the master narration track...');
const tmp = join(clipDir, '_slots');
rmSync(tmp, { recursive: true, force: true });
mkdirSync(tmp, { recursive: true });
const list = [];
slots.forEach((s, i) => {
  const out = join(tmp, `${String(i + 1).padStart(3, '0')}.wav`);
  const ins = PARTS.flatMap((p) => ['-i', lines[i][p].file]);
  const delays = PARTS.map((p, k) => `[${k}:a]aresample=44100,aformat=channel_layouts=mono,adelay=${Math.round(s.lines[p].at * 1000)}:all=1[a${k}]`).join(';');
  execFileSync('ffmpeg', ['-y', '-v', 'error', ...ins, '-filter_complex',
    `${delays};[a0][a1][a2]amix=inputs=3:normalize=0,apad=whole_dur=${s.duration},atrim=0:${s.duration}[out]`,
    '-map', '[out]', '-ar', '44100', '-ac', '1', out]);
  list.push(`file '${out.replace(/\\/g, '/')}'`);
});
writeFileSync(join(tmp, 'list.txt'), list.join('\n'));
execFileSync('ffmpeg', ['-y', '-v', 'error', '-f', 'concat', '-safe', '0', '-i', join(tmp, 'list.txt'),
  '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11', '-ar', '44100', '-ac', '1', '-c:a', 'libmp3lame', '-b:a', '64k',
  join(audioDir, 'narration-master.mp3')]);
rmSync(tmp, { recursive: true, force: true });
console.log(`Done: ${join(audioDir, 'narration-master.mp3')} (${seconds(join(audioDir, 'narration-master.mp3')).toFixed(1)} s)`);

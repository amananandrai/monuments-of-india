// Listens to every voiced narration line for the hiccups text-to-speech can make, since no one can
// sit through an hour of takes by ear:
//   - stutters and repeats: the clip is transcribed with Sarvam speech-to-text (Saarika) and aligned
//     word by word with the script; a word or phrase said twice, a run of extra words, or a run of
//     skipped words fails the take;
//   - hiccup pauses: a silence inside a line longer than a natural breath;
//   - glitches: clipping.
//
//   node tools/check-narration.mjs                  # check every line, report in narration/check-report.json
//   node tools/check-narration.mjs taj-mahal        # only these monuments
//   node tools/check-narration.mjs --retake         # also mark failed lines for a new take; then run
//                                                   # generate-narration.mjs to voice them and re-mix
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { MONUMENTS } from '../js/data.js';
import { KEY, narrDir, PARTS, NARR, RETAKES, saveRetakes, spoken, clipFile, seconds, pool } from './lib/narration.mjs';

const TIMING = JSON.parse(readFileSync(join(narrDir, 'timing.json'), 'utf8'));
const only = new Set(process.argv.slice(2).filter((a) => !a.startsWith('--')));
const retake = process.argv.includes('--retake');

/* ---------- speech-to-text ---------- */
async function transcribe(file) {
  for (let attempt = 1; attempt <= 6; attempt++) {
    if (attempt > 1) await new Promise((r) => setTimeout(r, 2000 * 2 ** (attempt - 2)));
    const fd = new FormData();
    fd.append('file', new Blob([readFileSync(file)], { type: 'audio/wav' }), 'clip.wav');
    fd.append('model', 'saarika:v2.5');
    fd.append('language_code', 'en-IN');
    const res = await fetch('https://api.sarvam.ai/speech-to-text', { method: 'POST', headers: { 'api-subscription-key': KEY }, body: fd });
    if (res.status === 429 || res.status >= 500) continue;
    if (!res.ok) throw new Error(`STT HTTP ${res.status}: ${await res.text()}`);
    return (await res.json()).transcript || '';
  }
  throw new Error('STT kept failing');
}

/* ---------- comparing what was said with the script ---------- */
const NUMBER_WORDS = new Set(('zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen ' +
  'seventeen eighteen nineteen twenty thirty forty fifty sixty seventy eighty ninety hundred thousand lakh million oh and point').split(' '));
// Words, lower case, without punctuation; numbers are left out on both sides, since the script
// spells them as the voice says them and the transcript writes them as digits.
const words = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
  .replace(/[’']/g, '').replace(/[^a-z0-9]+/g, ' ').trim().split(' ')
  .filter((w) => w && !/^\d+(st|nd|rd|th|s)?$/.test(w) && !NUMBER_WORDS.has(w));
function lev(a, b) {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++)
    d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[a.length][b.length];
}
// Names are often spelled differently by the transcriber (Kutub / Qutub): close enough is the same word.
const same = (a, b) => a === b || (Math.min(a.length, b.length) >= 4 && lev(a, b) / Math.max(a.length, b.length) <= 0.4);
function align(ref, hyp) {
  const n = ref.length, m = hyp.length, D = Array.from({ length: n + 1 }, () => new Int32Array(m + 1));
  for (let i = 0; i <= n; i++) D[i][0] = i;
  for (let j = 0; j <= m; j++) D[0][j] = j;
  for (let i = 1; i <= n; i++) for (let j = 1; j <= m; j++)
    D[i][j] = Math.min(D[i - 1][j] + 1, D[i][j - 1] + 1, D[i - 1][j - 1] + (same(ref[i - 1], hyp[j - 1]) ? 0 : 1));
  const ops = [];
  for (let i = n, j = m; i > 0 || j > 0;) {
    if (i > 0 && j > 0 && D[i][j] === D[i - 1][j - 1] + (same(ref[i - 1], hyp[j - 1]) ? 0 : 1)) { ops.push(same(ref[i - 1], hyp[j - 1]) ? ['=', ref[i - 1]] : ['~', ref[i - 1], hyp[j - 1]]); i--; j--; }
    else if (j > 0 && D[i][j] === D[i][j - 1] + 1) { ops.push(['+', hyp[j - 1]]); j--; }
    else { ops.push(['-', ref[i - 1]]); i--; }
  }
  return { ops: ops.reverse(), errors: D[n][m] };
}
const longestRun = (ops, kind) => { let best = 0, cur = 0, words = [], run = []; for (const o of ops) { if (o[0] === kind) { cur++; run.push(o[1]); if (cur > best) { best = cur; words = [...run]; } } else { cur = 0; run = []; } } return { n: best, words }; };
// A word or two-word phrase said twice in a row that the script does not repeat.
function repeats(hyp, ref) {
  const refText = ` ${ref.join(' ')} `, found = [];
  for (const n of [1, 2, 3]) for (let i = 0; i + 2 * n <= hyp.length; i++) {
    const a = hyp.slice(i, i + n).join(' '), b = hyp.slice(i + n, i + 2 * n).join(' ');
    // ...unless the two halves are one word of the script split by the transcriber ("raja raja").
    const joined = `${a}${b}`.replace(/ /g, '');
    if (a === b && !refText.includes(` ${a} ${b} `) && !ref.some((w) => same(w, joined))) found.push(`${a} ${b}`);
  }
  return found;
}

/* ---------- listening for pauses and glitches ---------- */
function audioCheck(file, dur) {
  // ffmpeg writes its filters' reports to stderr.
  const r = spawnSync('ffmpeg', ['-hide_banner', '-nostats', '-i', file, '-af',
    'silencedetect=noise=-42dB:d=0.85,astats=measure_perchannel=none:measure_overall=Peak_level+Peak_count', '-f', 'null', '-'], { encoding: 'utf8' });
  const log = r.stderr || '';
  const issues = [];
  const ends = [...log.matchAll(/silence_end: ([\d.]+) \| silence_duration: ([\d.]+)/g)].map((m) => [+m[1], +m[2]]);
  // A pause inside the line (not the lead-in or the tail) longer than a breath.
  for (const [end, len] of ends) {
    const start = end - len;
    if (start > 0.3 && end < dur - 0.3) issues.push(`pause ${len.toFixed(2)} s at ${start.toFixed(1)} s`);
  }
  // Speech is normalised to just under full scale, touching it a couple of times; clipping flattens
  // the wave against it for many samples.
  const peak = +(log.match(/Peak level dB: (-?[\d.]+)/) || [, -99])[1];
  const peaks = +(log.match(/Peak count: ([\d.]+)/) || [, 0])[1];
  if (peak >= -0.1 && peaks >= 8) issues.push(`clipping (${peaks} samples at ${peak.toFixed(2)} dB)`);
  return issues;
}

/* ---------- every line ---------- */
const jobs = MONUMENTS.filter((m) => !only.size || only.has(m.id)).flatMap((m) => PARTS.map((p) => {
  const key = `${m.id}:${p}`, text = NARR[m.id][p], take = RETAKES[key] || 0;
  return { key, id: m.id, part: p, text, take, file: clipFile(spoken(text), TIMING.voice, TIMING.pace, take) };
}));
console.log(`Checking ${jobs.length} narration lines (${TIMING.voice}, pace ${TIMING.pace})...`);
let done = 0;
await pool(jobs, 2, async (j) => {
  const dur = seconds(j.file);
  j.issues = audioCheck(j.file, dur);
  j.transcript = await transcribe(j.file);
  const ref = words(j.text), hyp = words(j.transcript);
  const { ops, errors } = align(ref, hyp);
  j.wer = +(errors / Math.max(1, ref.length)).toFixed(3);
  const rep = repeats(hyp, ref), ins = longestRun(ops, '+'), del = longestRun(ops, '-');
  if (rep.length) j.issues.push(`repeated: ${rep.join('; ')}`);
  if (ins.n >= 3) j.issues.push(`extra words: ${ins.words.join(' ')}`);
  if (del.n >= 3) j.issues.push(`skipped words: ${del.words.join(' ')}`);
  if (j.wer > 0.3) j.issues.push(`transcript differs from the script (${Math.round(j.wer * 100)}% of words)`);
  if (++done % 25 === 0) console.log(`  ${done}/${jobs.length}`);
});

const failed = jobs.filter((j) => j.issues.length);
writeFileSync(join(narrDir, 'check-report.json'), JSON.stringify({
  voice: TIMING.voice, checked: jobs.length, failed: failed.length,
  lines: jobs.map(({ key, take, wer, issues, transcript }) => ({ key, take, wer, issues, transcript }))
}, null, 2) + '\n');
console.log(`\n${jobs.length - failed.length} of ${jobs.length} lines are clean.`);
for (const j of failed) console.log(`  ${j.key} (take ${j.take}): ${j.issues.join(' | ')}\n    heard: ${j.transcript}`);
if (retake && failed.length) {
  for (const j of failed) RETAKES[j.key] = (RETAKES[j.key] || 0) + 1;
  saveRetakes(RETAKES);
  console.log(`\nMarked ${failed.length} lines for a new take: run node tools/generate-narration.mjs --voice ${TIMING.voice}`);
}

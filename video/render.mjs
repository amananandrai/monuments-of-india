// Renders the film with HyperFrames in 10-minute segments and measures it as it goes: one live status
// line with the phase, frames captured, speed and time left, and a summary at the end. The full
// HyperFrames output goes to renders/render.log.
//
// An hour of WebGL wears a browser out: a single long capture stalled after about two hours. So the
// film is captured in segments (HyperFrames' segmented capture), each with a fresh browser, and
// HyperFrames joins them, with the sound, into one MP4. Finished segments are kept in
// renders/.hf-segments/, so if a run fails it is started again and carries on from the last finished
// segment, up to five times, and running `npm run render` again after a crash also carries on.
//
//   npm run render:test                    # the first 30 s only: checks it works, measures the speed
//                                          # and projects how long the whole film will take
//   npm run render                         # the whole film -> renders/monuments-of-india.mp4
//   npm run render -- --workers 3          # more or fewer parallel browsers (default 2)
//   npm run render -- --segment 5          # segment length in minutes (default 10)
//   npm run render:test -- --test 60       # a longer trial
//   npm run render -- --quality standard   # any HyperFrames quality (default delivery)
//
// Ctrl+C stops the render and every browser it started.
import { spawn, spawnSync } from 'node:child_process';
import { createWriteStream, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
// The last value wins, so `npm run render:test -- --test 60` overrides the script's own --test 30.
const opt = (name, dflt) => { const i = args.lastIndexOf(`--${name}`); return i >= 0 && args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : dflt; };
const has = (name) => args.includes(`--${name}`);

const FPS = 30;
const ATTEMPTS = 5;
const test = has('test') ? Number(opt('test', 30)) : 0;
const workers = opt('workers', '2');
const quality = opt('quality', 'delivery');
const segmentMinutes = Number(opt('segment', 10));
const timing = JSON.parse(readFileSync(join(here, 'narration/timing.json'), 'utf8'));
const seconds = test ? Math.min(test, timing.total) : timing.total;
const totalFrames = Math.round(seconds * FPS);
// A trial uses short segments, so it exercises the same split-and-join as the full film.
const segmentFrames = Math.max(30, Math.round(test ? Math.min(segmentMinutes * 60, seconds / 3) * FPS : segmentMinutes * 60 * FPS));
const segments = Math.ceil(totalFrames / segmentFrames);
const output = opt('output', test ? `renders/test-${seconds}s.mp4` : 'renders/monuments-of-india.mp4');
mkdirSync(join(here, 'renders'), { recursive: true });

/* ---------- formatting ---------- */
const hms = (s) => {
  if (!isFinite(s) || s < 0) return '--';
  s = Math.round(s);
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
  return h ? `${h}h ${String(m).padStart(2, '0')}m` : m ? `${m}m ${String(sec).padStart(2, '0')}s` : `${sec}s`;
};
const num = (n) => n.toLocaleString('en-IN');
const clock = (d = new Date()) => d.toTimeString().slice(0, 8);
const tty = process.stdout.isTTY;
let lastLine = '';
const status = (line) => { lastLine = line; if (tty) process.stdout.write(`\r\x1b[2K${line}`); };
const say = (line) => {
  if (tty) process.stdout.write('\r\x1b[2K');
  console.log(line);
  if (tty && lastLine) process.stdout.write(lastLine);
};

/* ---------- 1. sync (cut short for a trial) ---------- */
console.log(`\nMonuments of India: ${test ? `trial render of the first ${seconds} s` : 'full render'}`);
console.log(`  ${num(totalFrames)} frames at ${FPS} fps in ${segments} segment${segments > 1 ? 's' : ''} of up to ${hms(segmentFrames / FPS)}, ${workers} workers, quality ${quality}`);
console.log(`  -> ${output}; full HyperFrames output in renders/render.log\n`);
const env = {
  ...process.env,
  ...(test ? { HF_RENDER_SECONDS: String(seconds) } : {}),
  HF_SEGMENTED_CAPTURE: 'true',
  HF_SEGMENT_FRAMES: String(segmentFrames),
  HF_SEGMENT_BROWSER_RECYCLE: '1' // a fresh browser for every segment
};
const sync = spawnSync(process.execPath, [join(here, 'sync-site.mjs')], { cwd: here, env, stdio: 'inherit' });
if (sync.status !== 0) process.exit(sync.status || 1);
const restore = () => { if (test) spawnSync(process.execPath, [join(here, 'sync-site.mjs')], { cwd: here, stdio: 'ignore' }); };

const hf = join(here, 'node_modules/hyperframes/bin/hyperframes.mjs');
if (!existsSync(hf)) { console.error('HyperFrames is not installed: run npm install in video/ first.'); process.exit(1); }

/* ---------- 2. one render attempt, watched ---------- */
const PHASES = { compile: 'Compiling', extract_video: 'Reading media', process_audio: 'Mixing audio', start_browsers: 'Starting browsers', capture: 'Capturing frames', encode: 'Encoding video', assemble: 'Joining segments and adding sound' };
const started = Date.now();
let child = null, stopping = false, frames = 0, phase = 'Starting', pct = 0, lastChange = Date.now();
let captureSecs = 0, captureFrom = 0, framesAtCaptureStart = 0, segmentsDone = 0, reusedFrames = 0;
let capturedHere = 0; // frames this script saw captured (not reused), for the speed
const samples = []; // [time, frames] for a rolling speed
// Workers capture different segments at once, so the frame numbers HyperFrames reports interleave
// ("frame 16 (segment 1/3)", "frame 137 (segment 2/3)"). Frames done is the sum, over segments, of
// how far each has got.
const reached = new Map(); // segment number -> highest frame number reported in it
const countDone = () => [...reached].reduce((sum, [k, f]) => sum + (k > 0 ? Math.max(0, Math.min(segmentFrames, f - (k - 1) * segmentFrames)) : 0), 0);

function attempt(n) {
  return new Promise((resolve) => {
    const log = createWriteStream(join(here, 'renders/render.log'), { flags: n === 1 ? 'w' : 'a' });
    if (n > 1) log.write(`\n\n===== attempt ${n} (resuming from finished segments) =====\n\n`);
    // Screenshot capture from the start: the fast drawElement capture fails its own self-check on
    // this WebGL scene. --resume reuses every segment an earlier run finished.
    child = spawn(process.execPath, [hf, 'render', '--quality', quality, '--workers', workers,
      '--no-experimental-fast-capture', '--resume', '--output', output], { cwd: here, env });
    // A new attempt reuses finished segments; partly captured ones start again from the beginning.
    phase = 'Starting'; pct = 0; lastChange = Date.now(); samples.length = 0; captureFrom = 0;
    for (const [k, f] of reached) if (k > 0 && f < Math.min(totalFrames, k * segmentFrames) - 2) { reached.delete(k); reached.delete(-k); }
    frames = countDone();
    let buffer = '';
    const onOutput = (chunk) => {
      log.write(chunk);
      buffer += chunk.toString().replace(/\r/g, '\n');
      const lines = buffer.split('\n');
      buffer = lines.pop();
      for (const raw of lines) {
        const line = raw.replace(/\x1b\[[0-9;?]*[a-zA-Z]/g, '').trim();
        if (!line) continue;
        // "Streaming frame 137/360 (segment 2/3)", or "(segment 3/3, skipped 1)" when resuming.
        const seg = line.match(/frame (\d+)\/\d+ \(segment (\d+)\/\d+[,)]/);
        if (seg) {
          const f = Number(seg[1]), k = Number(seg[2]);
          if (f > (reached.get(k) || 0)) {
            reached.set(k, f);
            // Progress lines are throttled, so the very last frame of a segment may go unreported.
            const end = Math.min(totalFrames, k * segmentFrames);
            if (f >= end - 2 && (reached.get(-k) || 0) === 0) {
              reached.set(-k, 1); // announced (negative keys are ignored by countDone)
              segmentsDone++;
              say(`[${clock()}] Segment ${k} captured (${segmentsDone} of ${segments} done)`);
            }
            const done = countDone();
            if (!captureFrom) { captureFrom = Date.now(); framesAtCaptureStart = done; }
            if (done !== frames) { capturedHere += Math.max(0, done - frames); frames = done; lastChange = Date.now(); }
          }
          continue;
        }
        const p = line.match(/^@hf-progress (\{.*\})/);
        if (p) {
          try {
            const { code, pct: q, done } = JSON.parse(p[1]);
            const name = PHASES[code] || code.replace(/_/g, ' ');
            if (name !== phase) { phase = name; say(`[${clock()}] ${name}`); lastChange = Date.now(); }
            if (q !== pct) { pct = q; lastChange = Date.now(); }
            // Unsegmented progress only (segmented progress is counted from the segment lines above).
            if (code === 'capture' && typeof done === 'number' && !reached.size && done > frames) {
              if (!captureFrom) { captureFrom = Date.now(); framesAtCaptureStart = done; }
              capturedHere += done - frames; frames = done; lastChange = Date.now();
            }
          } catch { /* not JSON after all */ }
          continue;
        }
        // Segments an earlier run finished are reused, not captured again.
        const resumed = line.match(/resuming: (\d+) segments complete/);
        if (resumed) say(`[${clock()}] Reusing ${resumed[1]} segment${resumed[1] === '1' ? '' : 's'} an earlier run finished`);
        const skipped = line.match(/segment skipped \(resume\).*"index":(\d+)/);
        if (skipped) {
          const k = Number(skipped[1]) + 1;
          reached.set(k, Math.min(totalFrames, k * segmentFrames)); reached.set(-k, 1);
          frames = countDone(); reusedFrames = frames;
        }
        if (/segment browser recycled \(retry\)/i.test(line)) say(`[${clock()}] A segment stalled: HyperFrames is retrying it with a fresh browser`);
        else if (/segment browser recycled/i.test(line)) say(`[${clock()}] Fresh browser for the next segment`);
        const joined = line.match(/Segmented capture complete: (\d+) segment/);
        if (joined) say(`[${clock()}] All ${joined[1]} segments captured; joining them`);
        // Problems, not the routine trace or shader chatter.
        if (/X3577|^\[INFO\]|^\[HyperFrames\] render runtime fps|^\[initSession|^Lint: 0 error|^Continuing render despite lint|[█░]|skills out of date|skills update/.test(line)) continue;
        if (/error|fail|✗|timed? ?out|stalled|not render-ready|crash/i.test(line)) say(`  ! ${line.slice(0, 300)}`);
      }
    };
    child.stdout.on('data', onOutput);
    child.stderr.on('data', onOutput);
    child.on('exit', (code) => {
      if (captureFrom) captureSecs += (Date.now() - captureFrom) / 1000;
      log.end();
      resolve(code ?? 1);
    });
  });
}

let warned = 0;
const tick = setInterval(() => {
  const now = Date.now(), n = frames;
  samples.push([now, n]);
  while (samples.length > 2 && now - samples[0][0] > 120000) samples.shift(); // the last two minutes
  const [t0, f0] = samples[0], rate = now > t0 ? ((n - f0) * 1000) / (now - t0) : 0;
  const elapsed = (now - started) / 1000;
  const line = n > 0 && phase === PHASES.capture
    ? `[${clock()}] Capturing ${num(n)} / ${num(totalFrames)} frames (${((100 * n) / totalFrames).toFixed(1)}%) · ${rate.toFixed(1)} fps · elapsed ${hms(elapsed)} · left ~${hms(rate > 0 ? (totalFrames - n) / rate : NaN)}`
    : `[${clock()}] ${phase} · ${pct}% · elapsed ${hms(elapsed)}`;
  status(line);
  if (!tty && Math.round(elapsed) % 60 < 5) console.log(line);
  const quiet = (now - lastChange) / 1000;
  if (quiet > 300 && now - warned > 300000) {
    warned = now;
    say(`  ! Nothing has changed for ${hms(quiet)} (${phase}, ${num(n)} frames). HyperFrames stops a stuck capture itself; this script then carries on from the last finished segment.`);
  }
}, 5000);

/* ---------- 3. Ctrl+C stops everything it started ---------- */
const stop = () => {
  if (stopping) return;
  stopping = true;
  say(`\n[${clock()}] Stopping the render and its browsers...`);
  if (!child) return;
  if (process.platform === 'win32') spawnSync('taskkill', ['/pid', String(child.pid), '/T', '/F'], { stdio: 'ignore' });
  else child.kill('SIGINT');
};
process.on('SIGINT', stop);
process.on('SIGTERM', stop);

/* ---------- 4. attempts, then the summary ---------- */
let code = 1, tries = 0;
for (tries = 1; tries <= ATTEMPTS && !stopping; tries++) {
  code = await attempt(tries);
  if (code === 0 || stopping) break;
  if (tries < ATTEMPTS) say(`\n[${clock()}] The render stopped (exit ${code}). Starting again from the last finished segment (attempt ${tries + 1} of ${ATTEMPTS})...`);
}
clearInterval(tick);
if (tty) process.stdout.write('\r\x1b[2K');
restore();
const wall = (Date.now() - started) / 1000;
const captured = code === 0 ? totalFrames : frames;
// Speed counts only frames captured by this run, not segments reused from an earlier one.
const fps = captureSecs > 0 ? capturedHere / captureSecs : 0;
const stats = { finished: new Date().toISOString(), ok: code === 0, test: !!test, seconds, frames: totalFrames, framesCaptured: captured,
  segments, segmentFrames, attempts: Math.min(tries, ATTEMPTS), workers: Number(workers), quality, wallSeconds: Math.round(wall), captureFps: +fps.toFixed(2), output };
if (code === 0) {
  console.log(`\n[${clock()}] Done in ${hms(wall)}${stats.attempts > 1 ? ` (${stats.attempts} attempts)` : ''}: ${output}`);
  if (fps > 0) console.log(`  captured ${num(capturedHere)} frames at ${fps.toFixed(1)} fps on average${reusedFrames ? `, reused ${num(reusedFrames)} from an earlier run` : ''}`);
  if (test && fps > 0 && !reusedFrames && stats.attempts === 1) {
    const full = Math.round(timing.total * FPS), projected = (wall - captureSecs) + full / fps;
    stats.projectedFullSeconds = Math.round(projected);
    console.log(`  the whole film is ${num(full)} frames: at this speed a full render takes about ${hms(projected)}`);
    console.log(`  (an upper bound: this trial's short segments restart the browser every ${hms(segmentFrames / FPS)} of film, the full render only every ${segmentMinutes} minutes)`);
    console.log(`  start it with: npm run render${workers !== '2' ? ` -- --workers ${workers}` : ''}`);
  }
} else if (stopping) {
  console.log(`[${clock()}] Stopped after ${hms(wall)}. Finished segments are kept: npm run render carries on from them.`);
} else {
  console.log(`\n[${clock()}] The render failed ${ATTEMPTS} times (exit ${code}) after ${hms(wall)}. See renders/render.log.`);
  console.log('  Finished segments are kept: run npm run render again to carry on, or try --workers 1.');
}
writeFileSync(join(here, `renders/render-stats${test ? '-test' : ''}.json`), JSON.stringify(stats, null, 2) + '\n');
process.exit(code);

// Shared by generate-narration.mjs and check-narration.mjs: what the voice is given to say, the
// Sarvam text-to-speech call, and where each voiced clip is cached.
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

export const repo = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
if (existsSync(join(repo, '.env'))) process.loadEnvFile(join(repo, '.env'));
export const KEY = process.env.SARVAM_API_KEY;
if (!KEY) throw new Error('SARVAM_API_KEY is not set (put it in .env at the repository root).');

export const narrDir = join(repo, 'video/narration');
export const audioDir = join(repo, 'video/assets/audio');
export const clipDir = join(audioDir, 'narration');
mkdirSync(clipDir, { recursive: true });

export const MODEL = 'bulbul:v3';
export const PARTS = ['travel', 'story', 'details'];
const readJson = (name, dflt) => (existsSync(join(narrDir, name)) ? JSON.parse(readFileSync(join(narrDir, name), 'utf8')) : dflt);
export const NARR = readJson('narrations.json');
export const PRONOUNCE = readJson('pronounce.json', {});
// Lines voiced again because a take had a hiccup: "id:part" -> take number (check-narration.mjs).
export const RETAKES = readJson('retakes.json', {});
export const saveRetakes = (r) => writeFileSync(join(narrDir, 'retakes.json'), JSON.stringify(r, null, 2) + '\n');

/* ---------- what the voice is given to say ---------- */
const ONES = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve',
  'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
const two = (n) => (n < 20 ? ONES[n] : TENS[Math.floor(n / 10)] + (n % 10 ? '-' + ONES[n % 10] : ''));
// Years as a narrator reads them: 1632 "sixteen thirty-two", 1905 "nineteen oh five",
// 1900 "nineteen hundred", 2009 "two thousand and nine", 2024 "twenty twenty-four".
export function year(y) {
  const hi = Math.floor(y / 100), lo = y % 100;
  if (y >= 2000 && y < 2010) return 'two thousand' + (lo ? ' and ' + ONES[lo] : '');
  if (lo === 0) return two(hi) + ' hundred';
  return two(hi) + ' ' + (lo < 10 ? 'oh ' + ONES[lo] : two(lo));
}
export function spoken(text) {
  let s = text.normalize('NFC');
  for (const [from, to] of Object.entries(PRONOUNCE)) s = s.replace(new RegExp(`\\b${from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g'), to);
  // A year is four digits on its own: not part of 1,444 or 26,500, and not a decimal.
  s = s.replace(/(?<![\d,.])\b(1[0-9]{3}|20[0-9]{2})\b(?!,?\d|\.\d)/g, (_, y) => year(Number(y)));
  s = s.replace(/ç/g, 'c');
  return s;
}

/* ---------- Sarvam text-to-speech, cached by what is said (and which take) ---------- */
export const clipFile = (text, speaker, pace, take = 0) =>
  join(clipDir, createHash('sha1').update(`${MODEL}|${speaker}|${pace}|${text}${take ? `|take${take}` : ''}`).digest('hex').slice(0, 16) + '.wav');

export async function voice(text, file, speaker, pace = 1) {
  if (existsSync(file)) return file;
  let last = '';
  for (let attempt = 1; attempt <= 8; attempt++) {
    if (attempt > 1) await new Promise((r) => setTimeout(r, Math.min(30000, 2000 * 2 ** (attempt - 2))));
    const res = await fetch('https://api.sarvam.ai/text-to-speech', {
      method: 'POST',
      headers: { 'api-subscription-key': KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text, language_code: 'en-IN', model: MODEL, speaker, pace,
        speech_sample_rate: 44100, output_audio_codec: 'wav', temperature: 0.5
      })
    });
    if (res.status === 429 || res.status >= 500) { last = `HTTP ${res.status} ${await res.text()}`; continue; }
    if (!res.ok) throw new Error(`TTS HTTP ${res.status}: ${await res.text()}\n  text: ${text}`);
    const { audios } = await res.json();
    writeFileSync(file, Buffer.concat(audios.map((a) => Buffer.from(a, 'base64'))));
    return file;
  }
  throw new Error(`TTS kept failing (${last}) for: ${text}`);
}

export const seconds = (file) => Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file]).toString().trim());

export async function pool(items, n, fn) {
  let next = 0;
  await Promise.all(Array.from({ length: n }, async () => { while (next < items.length) { const k = next++; await fn(items[k], k); } }));
}

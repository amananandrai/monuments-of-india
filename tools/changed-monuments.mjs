// Which monuments a set of changed files touches, for .github/workflows/screenshots.yml.
//   node changed-monuments.mjs <path> [<path> ...]     (repository-relative paths; or one per line on stdin)
// Prints the monuments' ids on one line (nothing, if none):
// - js/monuments/<file>.js and js/details/<file>.js belong to the monument whose builder is loaded
//   from js/monuments/<file>.js in js/data.js (the file's name is not always the monument's id);
// - any other file under js/details is a shared part (trees, domes, temple towers) that any
//   monument may use. It names no monument, so it is left out and noted on stderr: render every
//   monument by hand (the workflow's "Run workflow" button) when a shared part changes the look;
// - other paths are ignored.
// Runs in Node, without a browser.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const data = fs.readFileSync(path.join(root, 'js/data.js'), 'utf8');
// Each entry: id: '…', … load: () => import('./monuments/<file>.js')
const byFile = new Map();
for (const m of data.matchAll(/\{ id: '([^']+)'[^\n]*?import\('\.\/monuments\/([^']+)\.js'\)/g)) byFile.set(m[2], m[1]);

const args = process.argv.slice(2);
const paths = (args.length ? args : fs.readFileSync(0, 'utf8').split('\n')).map((p) => p.trim()).filter(Boolean);
const ids = new Set(), shared = [];
for (const p of paths) {
  const m = p.match(/^js\/(monuments|details)\/([^/]+)\.js$/);
  if (!m) continue;
  if (byFile.has(m[2])) ids.add(byFile.get(m[2]));
  else shared.push(p);
}
if (shared.length) console.error(`Shared parts changed (${shared.join(', ')}): not tied to one monument, so no picture is redrawn for them.`);
console.log([...ids].join(' '));

// Checks that the lists of monuments agree. The site loads each builder from js/data.js; the film
// in video/ imports them all from js/builders.js, a second list kept by hand; and each monument has
// a builder (js/monuments/<id>.js) and a detail file (js/details/<id>.js) named after its id.
//   node check-registry.mjs
// Runs in Node, without a browser. Exits 1 if a monument is missing from a list, a builder's name
// differs between the two, a file is not named after its monument, or a file belongs to none.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const data = read('js/data.js'), builders = read('js/builders.js');

const entries = [...data.matchAll(/^\s*\{ id: '([^']+)'([^\n]*)/gm)].map(([, id, rest]) => {
  const m = rest.match(/load: \(\) => import\('\.\/monuments\/([^']+)\.js'\), fn: '(\w+)'/);
  return { id, file: m && m[1], fn: m && m[2] };
});
const imported = new Map([...builders.matchAll(/^import \{ (\w+) \} from '\.\/monuments\/([^']+)\.js';/gm)].map((m) => [m[1], m[2]]));
const listed = new Set([...builders.slice(builders.indexOf('export const BUILDERS')).matchAll(/^\s+(\w+),/gm)].map((m) => m[1]));

const problems = [], seen = new Set();
for (const { id, file, fn } of entries) {
  if (seen.has(id)) problems.push(`${id}: listed twice in js/data.js`);
  seen.add(id);
  if (!file) { problems.push(`${id}: no load/fn in js/data.js`); continue; }
  if (file !== id) problems.push(`${id}: its builder is js/monuments/${file}.js, not named after the id`);
  for (const dir of ['monuments', 'details']) if (!fs.existsSync(path.join(root, 'js', dir, `${file}.js`))) problems.push(`${id}: js/${dir}/${file}.js is missing`);
  if (fs.existsSync(path.join(root, 'js/monuments', `${file}.js`)) && !new RegExp(`export function ${fn}\\b`).test(read(`js/monuments/${file}.js`))) problems.push(`${id}: js/monuments/${file}.js does not export ${fn}`);
  if (imported.get(fn) !== file) problems.push(`${id}: js/builders.js ${imported.has(fn) ? `imports ${fn} from ${imported.get(fn)}.js` : `does not import ${fn}`}`);
  if (!listed.has(fn)) problems.push(`${id}: ${fn} is not in BUILDERS (js/builders.js)`);
}
const files = new Set(entries.map((e) => e.file));
for (const dir of ['monuments', 'details']) {
  for (const f of fs.readdirSync(path.join(root, 'js', dir))) {
    if (f.endsWith('.js') && !files.has(f.slice(0, -3))) problems.push(`js/${dir}/${f} belongs to no monument in js/data.js`);
  }
}
for (const fn of imported.keys()) if (!entries.some((e) => e.fn === fn)) problems.push(`js/builders.js imports ${fn}, which js/data.js does not name`);

console.log(`${entries.length} monuments in js/data.js; ${imported.size} builders in js/builders.js.`);
if (problems.length) {
  for (const p of problems) console.log(`  ${p}`);
  process.exit(1);
}
console.log('The lists agree.');

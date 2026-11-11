// Rewrites the screenshot gallery in README.md from assets/views/<id>.png and the
// monument list. The workflow in .github/workflows/screenshots.yml runs this after
// shoot-views.mjs. Markers keep the rest of the README intact.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { MONUMENTS } from '../js/data.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const readmePath = path.join(root, 'README.md');
const views = path.join(root, 'assets/views');
const start = '<!-- gallery:start -->';
const end = '<!-- gallery:end -->';

const byState = new Map();
for (const m of MONUMENTS) {
  if (!byState.has(m.state)) byState.set(m.state, []);
  byState.get(m.state).push(m);
}

const lines = [
  start,
  '',
  'Home view of every model. [A GitHub Action](.github/workflows/screenshots.yml) renders these again when the models change and commits the new pictures here. They are the plain studio views from `tools/shoot-views.mjs` (the built model, its trees and water), so a run stays within a few minutes. The site\'s own shadows, photo textures and haze are the `--site` pictures described in [`tools/README.md`](tools/README.md).',
  '',
];
const missing = [];
for (const state of [...byState.keys()].sort((a, b) => a.localeCompare(b))) {
  const list = byState.get(state);
  lines.push(`### ${state} (${list.length})`, '');
  for (const m of list) {
    const file = `${m.id}.png`;
    if (!fs.existsSync(path.join(views, file))) missing.push(m.id);
    lines.push(`![${m.name}](assets/views/${file})`, '', `*${m.name} — ${m.place}*`, '');
  }
}
lines.push(end, '');

const block = lines.join('\n');
let readme = fs.readFileSync(readmePath, 'utf8');
if (readme.includes(start) && readme.includes(end)) {
  readme = readme.replace(new RegExp(`${start}[\\s\\S]*?${end}\\n?`), block);
} else {
  const anchor = '## States and monuments\n';
  if (!readme.includes(anchor)) throw new Error('README is missing the States and monuments heading');
  readme = readme.replace(anchor, `${block}\n${anchor}`);
}
fs.writeFileSync(readmePath, readme);
if (missing.length) {
  console.error(`No picture for: ${missing.join(', ')}`);
  process.exit(1);
}
console.log(`Gallery updated for ${MONUMENTS.length} monuments.`);

// Rewrites the state-by-state list in README.md so each monument appears once:
// its place, dates, style, material, view link, and one home-view picture.
// .github/workflows/screenshots.yml runs this after shoot-views.mjs.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { MONUMENTS } from '../js/data.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const readmePath = path.join(root, 'README.md');
const views = path.join(root, 'assets/views');
const site = 'https://monuments-of-india-nu.vercel.app';
const start = '<!-- monuments:start -->';
const end = '<!-- monuments:end -->';

// The catalogue's order. A state added later is appended, alphabetically, after these.
const STATE_ORDER = [
  'Andaman and Nicobar', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chandigarh',
  'Delhi', 'Goa', 'Gujarat', 'Himachal Pradesh', 'Jammu and Kashmir', 'Jharkhand', 'Karnataka',
  'Kerala', 'Ladakh', 'Madhya Pradesh', 'Maharashtra', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim',
  'Tamil Nadu', 'Telangana', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
];

const byState = new Map();
for (const m of MONUMENTS) {
  if (!byState.has(m.state)) byState.set(m.state, []);
  byState.get(m.state).push(m);
}
for (const list of byState.values()) list.sort((a, b) => a.name.localeCompare(b.name, 'en'));
const extra = [...byState.keys()].filter((s) => !STATE_ORDER.includes(s)).sort((a, b) => a.localeCompare(b, 'en'));
const states = [...STATE_ORDER.filter((s) => byState.has(s)), ...extra];

const lines = [
  start,
  '## States and monuments',
  '',
  'Each entry gives the place, the dates, the architectural style and the main material, as shown on',
  'the monument\'s plaque and used by the filters (all from `js/data.js`), then the home view of the model.',
  '[A GitHub Action](.github/workflows/screenshots.yml) renders that picture again when the models change.',
  'These are the plain studio views from `tools/shoot-views.mjs`. The site\'s shadows, photo textures and haze',
  'are the `--site` pictures described in [`tools/README.md`](tools/README.md).',
  '',
];
const missing = [];
for (const state of states) {
  const list = byState.get(state);
  lines.push(`### ${state} (${list.length})`, '');
  for (const m of list) {
    const file = `${m.id}.png`;
    if (!fs.existsSync(path.join(views, file))) missing.push(m.id);
    lines.push(
      `- **${m.name}**, ${m.place} · ${m.built} · ${m.style} · ${m.material} · [view](${site}/#${m.id})`,
      '',
      `![${m.name}](assets/views/${file})`,
      '',
    );
  }
}
lines.push(end, '');

const block = lines.join('\n');
let readme = fs.readFileSync(readmePath, 'utf8');
readme = readme.replace(/<!-- gallery:start -->[\s\S]*?<!-- gallery:end -->\n*/, '');
if (readme.includes(start) && readme.includes(end)) {
  readme = readme.replace(new RegExp(`${start}[\\s\\S]*?${end}\\n?`), block);
} else {
  const heading = '## States and monuments\n';
  const from = readme.indexOf(heading);
  if (from < 0) throw new Error('README is missing the States and monuments heading');
  const after = readme.slice(from + heading.length);
  const next = after.search(/\n## [^#]/);
  if (next < 0) throw new Error('README has no heading after States and monuments');
  readme = readme.slice(0, from) + block + after.slice(next + 1);
}
fs.writeFileSync(readmePath, readme);
if (missing.length) {
  console.error(`No picture for: ${missing.join(', ')}`);
  process.exit(1);
}
console.log(`One list for ${MONUMENTS.length} monuments.`);

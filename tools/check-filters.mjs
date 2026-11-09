// Checks the sidebar's filter groups (js/filters.js) against the monuments (js/data.js): every
// monument must fall into at least one style group and one material group. Lists each group with
// its monuments, and the monuments no group takes.
//   node check-filters.mjs [--list]
// Exits 1 if any monument is left out.
import { MONUMENTS } from '../js/data.js';
import { STYLE_GROUPS, MATERIAL_GROUPS } from '../js/filters.js';

const list = process.argv.includes('--list');
let bad = 0;
for (const [kind, groups, field] of [['Style', STYLE_GROUPS, 'style'], ['Material', MATERIAL_GROUPS, 'material']]) {
  console.log(`${kind}:`);
  for (const g of groups) {
    const hits = MONUMENTS.filter((m) => g.test.test(m[field]));
    console.log(`  ${g.label.padEnd(20)} ${String(hits.length).padStart(3)}${list ? '  ' + hits.map((m) => m.id).join(' ') : ''}`);
  }
  const left = MONUMENTS.filter((m) => !groups.some((g) => g.test.test(m[field])));
  for (const m of left) console.log(`  NO GROUP: ${m.id} (${m[field]})`);
  bad += left.length;
}
console.log(`\n${MONUMENTS.length} monuments; ${bad} without a group.`);
process.exit(bad ? 1 : 0);

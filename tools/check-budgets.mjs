// Builds every monument at both detail levels and checks its triangles against the budget for that
// level (js/detail.js: 600k on desktops, 300k on phones), counted before the trees are filled in.
//   node check-budgets.mjs [id ...] [--top N]
// Exits 1 if any monument is over.
import { openPage, PRELUDE } from './lib/browser.mjs';

const argv = process.argv.slice(2), top = Number(argv[argv.indexOf('--top') + 1]) || 10;
const ids = argv.filter((a, i) => !a.startsWith('--') && argv[i - 1] !== '--top');
const page = await openPage();
const rows = await page.run(PRELUDE + `
  const { BUDGET } = await import('/js/detail.js');
  const out = [];
  for (const m of MONUMENTS) {
    if (args.ids.length && !args.ids.includes(m.id)) continue;
    const row = { id: m.id, high: 0, low: 0, budget: BUDGET };
    for (const level of ['high', 'low']) { try { row[level] = tris((await build(m.id, level)).group); } catch (e) { row[level] = -1; row.error = e.message; } }
    out.push(row);
  }
  detail.level = 'high';
  return out;
`, { ids });
await page.close();

const { high: H, low: L } = rows[0]?.budget || { high: 600000, low: 300000 };
const k = (n) => (n < 0 ? 'error' : `${Math.round(n / 1000)}k`);
const over = rows.filter((r) => r.high > H || r.low > L || r.error);
for (const [level, cap] of [['high', H], ['low', L]]) {
  console.log(`\n${level === 'high' ? 'Desktop' : 'Phone'} (budget ${k(cap)}), top ${top}:`);
  for (const r of [...rows].sort((a, b) => b[level] - a[level]).slice(0, top)) console.log(`  ${r.id.padEnd(32)} ${k(r[level]).padStart(6)}${r[level] > cap ? '  OVER' : ''}`);
}
console.log(`\n${rows.length} monuments built.`);
if (over.length) {
  console.log('Over budget or failed:');
  for (const r of over) console.log(`  ${r.id}: desktop ${k(r.high)}, phone ${k(r.low)}${r.error ? ` (${r.error})` : ''}`);
  process.exit(1);
}
console.log('All within budget.');

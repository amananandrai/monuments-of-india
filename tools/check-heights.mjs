// Compares each monument's model with the real dimensions in its `refs` (js/data.js): the height
// of its focus from the ground (or from refs.base, for a building on a hill), or, with
// refs.top = 'rock', the height of the hill it stands on (the module's exported H). Spires, finials
// and flags stand above most stated heights, so a model may be up to 15% over (refs.tolerance to
// change it) and 5% under.
//   node check-heights.mjs [id ...]
// Exits 1 if any is out.
import { openPage, PRELUDE } from './lib/browser.mjs';

const ids = process.argv.slice(2);
const page = await openPage();
const rows = await page.run(PRELUDE + `
  const out = [];
  for (const m of MONUMENTS) {
    if (!m.refs?.height || (args.ids.length && !args.ids.includes(m.id))) continue;
    const mod = await m.load(), r = await build(m.id, 'high');
    let h;
    if (m.refs.top === 'rock') h = mod.H;
    else { const b = new THREE.Box3().setFromObject(r.focus); h = b.max.y - (m.refs.base ?? 0); }
    out.push({ id: m.id, real: m.refs.height, model: h, of: m.refs.of || '', tol: m.refs.tolerance ?? 0.15 });
  }
  return out;
`, { ids });
await page.close();

let bad = 0;
for (const r of rows) {
  const ratio = r.model / r.real, ok = ratio <= 1 + r.tol && ratio >= 0.95;
  if (!ok) bad++;
  console.log(`  ${r.id.padEnd(30)} real ${String(r.real).padStart(6)} m   model ${r.model.toFixed(1).padStart(6)} m   ${((ratio - 1) * 100).toFixed(0).padStart(4)}%${ok ? '' : '  OUT'}${r.of ? `   (${r.of})` : ''}`);
}
console.log(`\n${rows.length} monuments with refs; ${bad} out of tolerance.`);
process.exit(bad ? 1 : 0);

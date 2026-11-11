// How finely each monument is modelled, as a worklist: the coarsest first.
//   node check-detail.mjs [id ...] [--top N] [--level high|low] [--json file] [--against file]
// Measured on the building itself: the meshes the home view frames (js/framing.js: no trees, lamps
// or other dressing, nothing under 2.5 m), leaving out terrain, rock, foliage and water. For each
// monument:
//   tris     triangles in the building (instances counted)
//   walls m² the area of its upright faces, in square metres: walls, columns, spires and domes'
//            sides, without floors, roofs and plinth tops (faces within 45° of level). Faces hidden
//            inside the model are counted too, so read the figures against each other, not as exact.
//   per m²   triangles per square metre of those upright faces
//   piece    the size of an average piece of wall, in centimetres: the side of a square with the
//            area of an average triangle pair. Plain 3 m panels give 300; fine carving gives 10 to 30.
//   plain    the share of the upright faces that lies in large flat ones (triangles of 2 m² or more:
//            a bare panel at least 2 m across), which is what looks empty in a close view
// Sorted by `plain`, then `piece`. A report, not a test: it always exits 0.
// --json writes the figures to a file; --against reads such a file (detail-baseline.json holds the
// figures from before the detail work began) and adds how `piece` and `plain` have changed since.
import fs from 'node:fs';
import { openPage, PRELUDE } from './lib/browser.mjs';

const argv = process.argv.slice(2), opt = (k) => (argv.includes(k) ? argv[argv.indexOf(k) + 1] : null);
const top = Number(opt('--top')) || 0, level = opt('--level') || 'high';
const ids = argv.filter((a, i) => !a.startsWith('--') && !['--top', '--level', '--json', '--against'].includes(argv[i - 1]));
const page = await openPage();
const rows = await page.run(PRELUDE + `
  const NATURAL = new Set(['ground', 'rock', 'foliage', 'water']);
  const natural = (m) => !m || Array.isArray(m) || m.flatShading || NATURAL.has(m.userData && m.userData.surface) || !!(m.userData && m.userData.reflect);
  const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3(), box = new THREE.Box3(), m4 = new THREE.Matrix4();
  // The areas of a geometry's triangles under a matrix: [total, in faces of 2 m² or more, count].
  const measure = (g, mw, into) => {
    const p = g.attributes.position, ix = g.index, n = ix ? ix.count : p.count;
    for (let i = 0; i < n; i += 3) {
      a.fromBufferAttribute(p, ix ? ix.getX(i) : i).applyMatrix4(mw);
      b.fromBufferAttribute(p, ix ? ix.getX(i + 1) : i + 1).applyMatrix4(mw);
      c.fromBufferAttribute(p, ix ? ix.getX(i + 2) : i + 2).applyMatrix4(mw);
      const n3 = b.sub(a).cross(c.sub(a)), s = n3.length() / 2;
      into.tris++;
      if (s < 1e-9 || Math.abs(n3.y) / (2 * s) > 0.7071) continue;
      into.area += s; into.wall++;
      if (s >= 2) into.plain += s;
    }
  };
  const out = [];
  for (const m of MONUMENTS) {
    if (args.ids.length && !args.ids.includes(m.id)) continue;
    const row = { id: m.id, tris: 0, wall: 0, area: 0, plain: 0, all: 0 };
    try {
      const r = await build(m.id, args.level);
      row.all = tris(r.group);
      r.focus.updateMatrixWorld(true);
      r.focus.traverse((o) => {
        if (!o.isMesh || !o.visible || o.userData.dressing || natural(o.material)) return;
        box.setFromObject(o);
        if (box.isEmpty() || box.max.y - Math.max(0, box.min.y) < 2.5) return;
        if (o.isInstancedMesh) for (let k = 0; k < o.count; k++) { o.getMatrixAt(k, m4); measure(o.geometry, m4.premultiply(o.matrixWorld), row); }
        else measure(o.geometry, o.matrixWorld, row);
      });
    } catch (e) { row.error = e.message; }
    out.push(row);
  }
  detail.level = 'high';
  return out;
`, { ids, level });
await page.close();

for (const r of rows) {
  r.perM2 = r.area ? r.wall / r.area : 0;
  r.piece = r.wall ? Math.sqrt((2 * r.area) / r.wall) * 100 : 0;
  r.plainShare = r.area ? r.plain / r.area : 0;
}
rows.sort((x, y) => y.plainShare - x.plainShare || y.piece - x.piece);
const k = (n) => `${Math.round(n / 1000)}k`;
const before = opt('--against') ? new Map(JSON.parse(fs.readFileSync(opt('--against'), 'utf8')).map((r) => [r.id, r])) : null;
const change = (r) => {
  const was = before && before.get(r.id);
  if (!was) return '';
  const dp = Math.round(r.piece) - was.piece, dl = Math.round(r.plainShare * 100) - Math.round(was.plain * 100);
  return dp || dl ? `   piece ${dp > 0 ? '+' : ''}${dp} cm, plain ${dl > 0 ? '+' : ''}${dl} points` : '';
};
console.log(`Detail at the ${level === 'low' ? 'phone' : 'desktop'} level, coarsest first${top ? ` (top ${top})` : ''}:\n`);
console.log(`  ${'monument'.padEnd(32)} ${'tris'.padStart(6)} ${'walls m²'.padStart(9)} ${'per m²'.padStart(7)} ${'piece cm'.padStart(9)} ${'plain'.padStart(6)}`);
for (const r of top ? rows.slice(0, top) : rows) {
  if (r.error) { console.log(`  ${r.id.padEnd(32)} failed: ${r.error}`); continue; }
  console.log(`  ${r.id.padEnd(32)} ${k(r.tris).padStart(6)} ${String(Math.round(r.area)).padStart(9)} ${r.perM2.toFixed(1).padStart(7)} ${String(Math.round(r.piece)).padStart(9)} ${(Math.round(r.plainShare * 100) + '%').padStart(6)}${change(r)}`);
}
const ok = rows.filter((r) => !r.error), mid = (f) => [...ok].map(f).sort((x, y) => x - y)[Math.floor(ok.length / 2)] || 0;
console.log(`\n${rows.length} monuments. Median: ${mid((r) => r.perM2).toFixed(1)} triangles per m², pieces of ${Math.round(mid((r) => r.piece))} cm, ${Math.round(mid((r) => r.plainShare) * 100)}% plain.`);
if (opt('--json')) { fs.writeFileSync(opt('--json'), JSON.stringify(rows.map(({ id, tris, all, area, perM2, piece, plainShare, error }) => ({ id, tris, all, area: Math.round(area), perM2: +perM2.toFixed(2), piece: Math.round(piece), plain: +plainShare.toFixed(3), error })), null, 1)); console.log(`Written to ${opt('--json')}.`); }

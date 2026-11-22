import * as THREE from 'three';
import { M, mat, photo, flat, mesh, box, at, onFace, FACES, inst, sheet, kalash, bell, shikhara, pidaRoof, kalingaProfile, rng } from '../helpers.js';
import { mouldings, frieze, templeNiche, idol, medallion, jali, mergeByMaterial } from '../parts/components.js';
import { figureFrieze } from '../parts/sculpture.js';
import { templeDoorway } from '../parts/doorways.js';
import { trees, scatter, along, lampPosts, asiBoard, benches } from '../parts/realism.js';
import { detail } from '../detail.js';

// The Mukteswara's sandstone, a warm red-ochre weathered darker in the recesses; the laterite of
// the court's walls; and the grey stone of the tank's steps.
export const STONE = mat('#a8785e', 0.92);
export const SHADE = mat('#7e5845', 0.95);
const LATERITE = photo(mat('#8c5a42', 0.95), 'laterite');
const GHAT = mat('#9c907e', 0.95);

// Mukteswara, finer detail. From photographs: the plinth and the base of the walls are stacks of
// mouldings, the lower set carved with scrolls; the deul's walls hold small shrine niches with
// images and, between them, carved panels of nagas and nayikas; up the tower, chaitya medallions
// (bho) framed by dwarves and a kirtimukha sit in the middle of each face, ribbed stones mark the
// storeys at the corners, and lions crouch under the amalaka; the jagamohana carries a band of
// figures under its eave and the diamond lattice of its windows. Dimensions follow
// js/monuments/mukteswara-temple.js.
function architecture(f, { P, dz, BH, TH, jz, JW, JH }) {
  const d = new THREE.Group(), S = STONE, Sd = SHADE;
  d.add(at(mouldings(14, 16.4, [[0.05, 0.2, 0.06, frieze(S)]], Sd), 0, 0, -0.2));
  const base = [[0, 0.28, 0.16, Sd], [0.28, 0.3, 0.08, frieze(S)], [0.58, 0.22, 0.14, Sd], [BH * 0.52, 0.22, 0.08, Sd], [BH - 0.6, 0.3, 0.06, frieze(S)]];
  const up = (k, list = base) => list.map(([y, h, p, c]) => [P + y + k * 0.01, h, p, c]);
  const s = at(new THREE.Group(), 0, 0, dz);
  s.add(mouldings(5.6, 1.6, up(0), S), mouldings(1.6, 5.6, up(1), S), mouldings(5.2, 3.2, up(2), S), mouldings(3.2, 5.2, up(3), S), mouldings(4.6, 4.6, up(4), S));
  // The niches: a large image in the middle of the three outer faces, small ones on the corners.
  for (const a of [Math.PI, Math.PI / 2, -Math.PI / 2]) {
    s.add(onFace(at(templeNiche(0.75, 1.3, S, { figure: idol(1.1, Sd) }), 0, P + 0.95, 0), a, 2.82));
    for (const l of [-1, 1]) for (const y of [P + 0.85, P + BH * 0.52 + 0.3]) s.add(onFace(at(templeNiche(0.42, 0.95, S, { figure: detail.low ? null : idol(0.8, S), crown: false }), 0, y, 0), a, 2.32, l * 1.95));
  }
  d.add(s);
  // The chaitya medallion up the middle of each face of the tower, a lion's mask over it.
  for (const a of FACES) {
    const t = 0.32, w = 5.4 * kalingaProfile(t);
    const c = onFace(at(new THREE.Group(), 0, P + BH + t * TH, 0), a, w * 0.5 + 0.05);
    c.add(box(1.5, 1.8, 0.2, Sd, 0, -0.9, 0.1), at(medallion(0.62, S), 0, 0.1, 0.2), box(0.5, 0.45, 0.35, S, 0, 0.8, 0.18), box(1.8, 0.18, 0.3, S, 0, -1.0, 0.15));
    c.position.z += dz;
    d.add(c);
  }
  // The ribbed corner stones of the tower's storeys.
  const am = new THREE.SphereGeometry(1, detail.low ? 8 : 12, 5), sy = P + BH;
  for (let k = 1; k <= 4; k++) {
    const t = k / 5, wt = 5.4 * kalingaProfile(t), r = wt * 0.085;
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) { const o = mesh(am, flat(S), sx * wt * 0.42, sy + t * TH, dz + sz * wt * 0.42); o.scale.set(r, r * 0.42, r); d.add(o); }
  }
  // The jagamohana: base mouldings, a band of figures under its eave, its lattice windows.
  const j = at(new THREE.Group(), 0, 0, jz);
  j.add(mouldings(JW + 0.6, 3, up(5, base.slice(0, 3)), S), mouldings(3, JW + 0.6, up(6, base.slice(0, 3)), S), mouldings(JW, JW, up(7, base.slice(0, 3)), S));
  for (const a of [Math.PI / 2, -Math.PI / 2]) {
    const w = onFace(at(new THREE.Group(), 0, P + 1.2, 0), a, JW / 2 + 0.36);
    w.add(box(1.4, 1.3, 0.05, jali(S), 0, 0.05, 0.03), box(1.9, 0.22, 0.2, Sd, 0, 1.4, 0.06), box(1.9, 0.22, 0.2, Sd, 0, -0.17, 0.06));
    for (const s2 of [-1, 1]) w.add(box(0.22, 1.85, 0.2, Sd, s2 * 0.82, -0.17, 0.06));
    j.add(w);
    for (const l of [-1, 1]) j.add(onFace(at(templeNiche(0.45, 1.0, S, { figure: idol(0.85, Sd), crown: false }), 0, P + 0.9, 0), a, JW / 2 + 0.01, l * 2.6));
  }
  d.add(j);
  f.add(mergeByMaterial(d));
  if (!detail.low) for (const a of [Math.PI / 2, -Math.PI / 2, 0]) {
    const fr = onFace(at(figureFrieze(a === 0 ? 2.4 : JW - 0.6, 0.5, S, { pitch: 0.42, kinds: ['standing', 'dancer', 'musician', 'chauri'] }), 0, P + JH - 0.85, 0), a, (a === 0 ? JW / 2 + 0.3 : JW / 2) + 0.01, a === 0 ? -2.35 : 0);
    fr.position.z += jz;
    f.add(fr);
    if (a === 0) { const f2 = fr.clone(); f2.position.x += 4.7; f.add(f2); }
  }
}

// A small rekha shrine of the court, w wide, facing +z (one geometry shared by all of them).
let shrineGeo_ = null;
function shrineGeo() {
  if (shrineGeo_) return shrineGeo_;
  const g = new THREE.Group(), m = STONE;
  g.add(box(1, 0.9, 1, m), box(1.1, 0.9, 0.55, m), box(0.55, 0.9, 1.1, m));
  const n = detail.low ? 5 : 8;
  for (let i = 0; i < n; i++) { const w = kalingaProfile(i / n), y = 0.9 + i * (1.5 / n); g.add(box(w * 0.88, 1.5 / n, w * 0.88, m, 0, y, 0), box(w, 1.2 / n, w * 0.5, m, 0, y, 0)); }
  const a = mesh(new THREE.SphereGeometry(0.36, 10, 4), m, 0, 2.55, 0);
  a.scale.y = 0.42;
  g.add(a, at(kalash(0.25, m), 0, 2.68, 0));
  shrineGeo_ = mergeByMaterial(g).children[0].geometry;
  return shrineGeo_;
}

// The Siddheswara, the taller, plainer temple of the same court, standing north-east of the
// Mukteswara: a rekha deul 15 m high and a pidha jagamohana.
function siddheswara() {
  const g = new THREE.Group(), S = STONE, Sd = SHADE;
  g.add(box(13, 0.6, 18, Sd, 0, 0, -1));
  g.add(box(6.4, 5, 6.4, S, 0, 0.6, -5), box(7.2, 5, 3.6, S, 0, 0.6, -5), box(3.6, 5, 7.2, S, 0, 0.6, -5));
  g.add(at(shikhara(7.2, 8.5, S, kalingaProfile, 16, S, 0.6), 0, 5.6, -5));
  g.add(box(7.4, 4, 7.4, S, 0, 0.6, 2.6));
  const r = pidaRoof(8.2, 3.2, 7, 0.36, S, Sd), y = 4.6 + r.userData.top;
  g.add(at(r, 0, 4.6, 2.6), at(bell(1.2, S), 0, y, 2.6), at(kalash(0.6, S), 0, y + 1.3, 2.6));
  g.add(at(templeDoorway(1.1, 2.2, { m: S, guardians: false, shakha: false }), 0, 0.6, 6.3));
  return mergeByMaterial(g);
}

// Mukteswara in the Old Town of Bhubaneswar: the sunken court paved round the temple and walled in
// laterite, with the Siddheswara and a crowd of small shrines in it; behind it the Marichi Kund,
// the little tank whose water is said to cure barrenness; lawns, coconut palms, mango and banyan
// trees round about, and the ASI's board at the gate.
export function addDetails(f, g, dims) {
  architecture(f, dims);
  g.add(box(220, 0.1, 220, M.grass, 0, -0.12, 0));
  // The court, a little below the lawns round it, paved and walled.
  const cx = 6, cz = -2, CW = 44, CD = 46;
  g.add(box(CW, 0.08, CD, M.path, cx, -0.06, cz));
  const wall = new THREE.Group();
  // [x0, x1] runs of the front wall either side of the way in, on the temple's axis.
  const front = [[cx - CW / 2 - 0.6, -2.4], [2.4, cx + CW / 2 + 0.6]];
  wall.add(box(CW + 1.2, 1.3, 0.6, LATERITE, cx, -0.1, cz - CD / 2), box(CW + 1.4, 0.15, 0.8, SHADE, cx, 1.2, cz - CD / 2));
  for (const s of [-1, 1]) wall.add(box(0.6, 1.3, CD - 0.6, LATERITE, cx + s * CW / 2, -0.1, cz), box(0.8, 0.15, CD - 0.8, SHADE, cx + s * CW / 2, 1.2, cz));
  for (const [a, b] of front) wall.add(box(b - a, 1.3, 0.6, LATERITE, (a + b) / 2, -0.1, cz + CD / 2), box(b - a + 0.2, 0.15, 0.8, SHADE, (a + b) / 2, 1.2, cz + CD / 2));
  g.add(mergeByMaterial(wall));
  g.add(at(siddheswara(), 19, 0, -12));
  // The small shrines.
  const R = rng(7), spots = scatter(detail.low ? 10 : 18, [cx - CW / 2 + 3, cx + CW / 2 - 3, cz - CD / 2 + 3, cz + CD / 2 - 3], { seed: 4, gap: 4, avoid: [[-9, 9, -10, 25], [11, 27, -24, -1]] });
  const list = spots.map(([x, z]) => { const w = 0.55 + R() * 0.6; return [x, 0, z, w, w, w, R() < 0.5 ? 0 : Math.PI / 2]; });
  g.add(inst(shrineGeo(), list, STONE));
  // Marichi Kund, behind the temple: a small square tank with steps down on every side.
  const tz = -36, t = new THREE.Group();
  g.add(sheet(14, 14, M.lake, 0, -1.2, tz));
  for (let k = 0; k < 4; k++) { const o = 7 + k * 0.7, y = -1.3 + k * 0.32; for (const s of [-1, 1]) t.add(box(2 * o + 0.7, 0.32, 0.7, GHAT, 0, y, tz + s * o), box(0.7, 0.32, 2 * o, GHAT, s * o, y, tz)); }
  g.add(mergeByMaterial(t));
  g.add(asiBoard('Mukteswara Temple', -6, cz + CD / 2 + 4, 0));
  g.add(lampPosts([...along(3, [-3.5, 24], [-3.5, 50]), ...along(3, [3.5, 24], [3.5, 50])]));
  g.add(box(5, 0.06, 30, M.path, 0, -0.07, 36));
  g.add(benches([[-8, 30, Math.PI / 2], [8, 30, -Math.PI / 2]]));
  const keep = [[cx - CW / 2 - 4, cx + CW / 2 + 4, cz - CD / 2 - 22, cz + CD / 2 + 4], [-6, 6, 20, 120]];
  g.add(trees(scatter(detail.low ? 14 : 26, [-100, 100, -100, 100], { seed: 3, gap: 11, avoid: keep }), { kind: 'palm', seed: 3 }));
  g.add(trees(scatter(detail.low ? 10 : 20, [-110, 110, -110, 110], { seed: 8, gap: 14, avoid: keep }), { kind: 'mango', seed: 8 }));
  g.add(trees([[-34, -30], [40, 28], [-36, 24]], { kind: 'banyan', seed: 5, h: 11 }));
}

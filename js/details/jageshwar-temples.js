import * as THREE from 'three';
import { M, mat, surface, flat, mesh, box, cyl, at, onFace, inst, sheet, hipRoof, nagaraProfile, rng } from '../helpers.js';
import { mouldings, frieze, templeNiche, idol, medallion, mergeByMaterial } from '../parts/components.js';
import { carvedPillar } from '../parts/temples.js';
import { heightField, fbm, ridged, smooth } from '../parts/terrain.js';
import { trees, shrubs, scatter, along, asiBoard, stalls, townHouses } from '../parts/realism.js';
import { detail } from '../detail.js';

// Jageshwar's stone: a grey Himalayan sandstone gone dark with damp and lichen; the timber of the
// canopies; and the grey slate of the halls' roofs.
export const STONE = mat('#8c877c', 0.94);
export const SHADE = mat('#6d695f', 0.95);
export const TIMBER = surface(mat('#4e3a2a', 0.85), 'ground');
const SLATE = mat('#5f6266', 0.9);
const PAVING = surface(mat('#9b9588', 0.95), 'paving');

// A hall before a sanctum, w wide and d deep, h high to its beams: a stone floor, carved pillars in
// rows (the front ones free, the rest against low parapets), beams, and a roof of grey slate
// sloping four ways. Its back (z = -d/2) meets the sanctum's wall. Stands on y = 0, faces +z.
export function porch(w, d, h) {
  const g = new THREE.Group(), cols = w > 6 ? [-w / 2 + 0.5, -w / 6, w / 6, w / 2 - 0.5] : [-w / 2 + 0.5, w / 2 - 0.5];
  g.add(box(w, 0.15, d, SHADE, 0, 0, 0));
  for (let z = -d / 2 + 1; z <= d / 2 - 0.4; z += 2.2) for (const x of cols) g.add(at(carvedPillar(h, STONE), x, 0.15, z));
  for (const s of [-1, 1]) g.add(box(0.35, 0.9, d - 1.4, STONE, s * (w / 2 - 0.3), 0.15, -0.7));
  g.add(box(w + 0.4, 0.4, d + 0.4, STONE, 0, 0.15 + h, 0), box(w + 1.4, 0.15, d + 1.2, SHADE, 0, 0.55 + h, 0.2));
  g.add(at(hipRoof(w + 1.4, d + 1.2, w * 0.32, SLATE), 0, 0.7 + h, 0.2));
  return mergeByMaterial(g);
}

// A small rekha shrine, 1 wide and about 3.4 high, as one geometry for all the court's little
// temples: a plinth, walls, a cornice, the curved spire in courses, and an amalaka.
let shrine_ = null;
function shrineGeo() {
  if (shrine_) return shrine_;
  const g = new THREE.Group(), m = STONE, n = detail.low ? 5 : 9;
  g.add(box(1.25, 0.2, 1.25, m), box(1, 1.05, 1, m, 0, 0.2, 0), box(1.08, 1.05, 0.5, m, 0, 0.2, 0), box(0.5, 1.05, 1.08, m, 0, 0.2, 0), box(1.14, 0.1, 1.14, m, 0, 1.2, 0));
  for (let i = 0; i < n; i++) { const w = nagaraProfile(i / n), y = 1.3 + i * (1.75 / n); g.add(box(w * 0.86, 1.75 / n, w * 0.86, m, 0, y, 0), box(w, 1.4 / n, w * 0.5, m, 0, y, 0), box(w * 0.5, 1.4 / n, w, m, 0, y, 0)); }
  g.add(box(0.26, 0.1, 0.26, m, 0, 3.05, 0));
  const a = mesh(new THREE.SphereGeometry(0.3, 12, 4), m, 0, 3.22, 0);
  a.scale.y = 0.42;
  g.add(a);
  shrine_ = mergeByMaterial(g).children[0].geometry;
  return shrine_;
}
// The canopy over a small shrine, as one geometry: on top of shrineGeo at y = 3.3.
let shrineCanopy_ = null;
function shrineCanopyGeo() {
  if (shrineCanopy_) return shrineCanopy_;
  const g = new THREE.Group(), w = 0.7;
  g.add(cyl(0.04, 0.05, 0.25, TIMBER, 0, 3.3, 0, 6), box(w, 0.04, w, TIMBER, 0, 3.55, 0), at(hipRoof(w * 1.3, w * 1.3, 0.24, TIMBER), 0, 3.59, 0));
  shrineCanopy_ = mergeByMaterial(g).children[0].geometry;
  return shrineCanopy_;
}

// The two great temples, finer: moulded plinths and wall bases, the image niches on the three
// closed faces, the ribbed corner stones up the spires, and the chaitya medallion at the foot of
// each spire's front.
function architecture(f, { mx, mz, jx, jz }) {
  const d = new THREE.Group();
  for (const [x, z, W, H, T, P] of [[mx, mz, 8, 4.6, 10.8, 0.8], [jx, jz, 6.4, 3.8, 7.6, 0.7]]) {
    const t = at(new THREE.Group(), x, 0, z);
    const base = [[P, 0.3, 0.14, SHADE], [P + 0.3, 0.25, 0.07, frieze(STONE)], [P + H * 0.55, 0.2, 0.08, SHADE]];
    t.add(mouldings(W + 0.6, W * 0.5, base, STONE), mouldings(W * 0.5, W + 0.6, base.map(([y, h, p, c]) => [y + 0.01, h, p, c]), STONE), mouldings(W, W, base.map(([y, h, p, c]) => [y + 0.02, h, p, c]), STONE));
    for (const a of [Math.PI, Math.PI / 2, -Math.PI / 2]) t.add(onFace(at(templeNiche(0.9, 1.7, STONE, { figure: idol(1.45, SHADE) }), 0, P + 0.8, 0), a, (W + 0.6) / 2 + 0.01));
    const am = new THREE.SphereGeometry(1, detail.low ? 8 : 12, 5);
    for (let k = 1; k <= 4; k++) {
      const tt = k / 5, wt = (W + 0.4) * nagaraProfile(tt), r = wt * 0.07;
      for (const sx of [-1, 1]) for (const sz of [-1, 1]) { const o = mesh(am, flat(STONE), sx * wt * 0.42, P + H + tt * T, sz * wt * 0.42); o.scale.set(r, r * 0.42, r); t.add(o); }
    }
    for (const a of [Math.PI, Math.PI / 2, -Math.PI / 2]) t.add(onFace(at(medallion(W * 0.09, STONE), 0, P + H + T * 0.3, 0), a, (W + 0.4) * nagaraProfile(0.3) * 0.5 + 0.03));
    d.add(t);
  }
  f.add(mergeByMaterial(d));
}

// The valley: level ground for the court and the road, the stream (the Jata Ganga) on the south,
// and hills rising steeply on both sides, dark with deodar.
const STREAM_Z = 46;
function valleyY(x, z) {
  const across = Math.abs(z - 10 - 0.12 * x) - 70;
  const t = smooth(0, 160, across);
  return t * (90 + 80 * ridged(x, z, { scale: 0.004, octaves: 4 }) + 30 * fbm(x, z, { scale: 0.008, octaves: 3 })) - 0.4 - (Math.abs(z - STREAM_Z) < 9 ? 1.4 * (1 - Math.abs(z - STREAM_Z) / 9) : 0);
}

// Jageshwar: the walled court, paved in stone, with the crowd of small shrines round the two
// great temples, some under canopies, some without; the gate on the stream side; a row of shops
// and houses along the road; the Jata Ganga flowing past under deodars, and the forested hills.
export function addDetails(f, g, dims) {
  architecture(f, dims);
  const CW = 64, CD = 50, cz = -4;
  g.add(heightField(1600, 1400, detail.low ? 100 : 160, valleyY, { rock: ['#6f6a5f', '#7b766a'], cover: '#3f5a33', steep: 0.74, band: 22 }));
  g.add(box(CW, 0.2, CD, PAVING, 0, -0.15, cz));
  // The court's wall, 1.6 m high, with its gate in the south side.
  const wall = new THREE.Group();
  wall.add(box(CW + 1, 1.6, 0.8, SHADE, 0, 0, cz - CD / 2));
  for (const s of [-1, 1]) wall.add(box(0.8, 1.6, CD, SHADE, s * CW / 2, 0, cz), box(CW / 2 - 3, 1.6, 0.8, SHADE, s * (CW / 4 + 1.5), 0, cz + CD / 2));
  for (const s of [-1, 1]) wall.add(box(1.2, 3.2, 1.2, STONE, s * 3.2, 0, cz + CD / 2));
  wall.add(box(7.6, 0.6, 1.4, STONE, 0, 3.2, cz + CD / 2), at(hipRoof(8.4, 2.4, 1.4, SLATE), 0, 3.8, cz + CD / 2));
  g.add(mergeByMaterial(wall));
  // The small shrines, of every size from waist-high to six metres; two in three have a canopy.
  const R = rng(17), keep = [[-15, -3, -12, 6], [-14, -4, 6, 10], [4.5, 13.5, -8, 12], [-3, 3, 4, CD / 2 + cz + 1]];
  const spots = scatter(detail.low ? 50 : 90, [-CW / 2 + 2, CW / 2 - 2, cz - CD / 2 + 2, cz + CD / 2 - 2], { seed: 12, gap: 3.1, avoid: keep });
  const list = [], tops = [];
  for (const [x, z] of spots) {
    const s = 0.5 + R() * R() * 1.6, ry = R() < 0.6 ? 0 : (R() < 0.5 ? 1 : -1) * Math.PI / 2;
    list.push([x, 0, z, s, s, s, ry]);
    if (R() < 0.66) tops.push([x, 0, z, s, s, s, ry]);
  }
  // Rows of shrines before the great temples, in lines as at the site.
  for (let k = 0; k < 6; k++) { const s = 0.9 + (k % 3) * 0.2; list.push([-21 + k * 3, 0, 14, s, s, s, 0]); tops.push([-21 + k * 3, 0, 14, s, s, s, 0]); }
  f.add(inst(shrineGeo(), list, STONE), inst(shrineCanopyGeo(), tops, TIMBER));
  // The Jata Ganga: a stony stream along the south of the court, under a little bridge.
  g.add(sheet(1200, 9, M.river, 0, -0.9, STREAM_Z));
  const bridge = new THREE.Group();
  bridge.add(box(3.6, 0.4, 10, STONE, 0, 0.1, STREAM_Z), box(0.3, 0.8, 10, SHADE, -1.7, 0.5, STREAM_Z), box(0.3, 0.8, 10, SHADE, 1.7, 0.5, STREAM_Z));
  g.add(mergeByMaterial(bridge));
  g.add(box(3.4, 0.08, STREAM_Z - CD / 2 - cz - 5, PAVING, 0, -0.05, (STREAM_Z + cz + CD / 2) / 2 - 2.5));
  g.add(asiBoard('Jageshwar Group of Temples', -6, cz + CD / 2 + 4, 0));
  // The road along the valley, its shops and houses (stone below, timber and slate above).
  g.add(box(400, 0.08, 6, M.asphalt, 0, -0.08, 34));
  g.add(stalls([...along(6, [-34, 30], [-12, 30])].map(([x, z]) => [x, z, Math.PI])));
  g.add(townHouses([[-60, 22, 8, 9, 2], [-74, 20, 9, 9, 3], [40, 24, 8, 10, 2], [54, 26, 9, 9, 2], [70, 28, 10, 9, 3], [-92, 18, 8, 8, 2]], { seed: 3, roof: 'pitched', roofs: ['#5f6266', '#6a5a4a'], paint: ['#e9e3d6', '#d8cdb8', '#c9b9a0'], tanks: 0 }));
  // Deodars: round the court (old trees stand inside it too) and thick on the hillsides.
  const inside = [[-29, -26], [28, -24], [-2, -26], [30, 6]];
  g.add(trees(inside, { kind: 'deodar', seed: 4, h: 26 }));
  const nearKeep = [[-CW / 2 - 3, CW / 2 + 3, cz - CD / 2 - 3, cz + CD / 2 + 3], [-200, 200, 26, 38], [-170, 40, 20, 260]];
  const far = scatter(detail.low ? 90 : 200, [-420, 420, -380, 360], { seed: 9, gap: 14, avoid: nearKeep }).map(([x, z]) => [x, z, 18 + 14 * fbm(x, z, { scale: 0.05, octaves: 2 }), valleyY(x, z)]);
  g.add(trees(far, { kind: 'deodar', seed: 9 }));
  g.add(shrubs(scatter(30, [-90, 90, -60, 60], { seed: 5, gap: 5, avoid: nearKeep }).map(([x, z]) => [x, z]), { seed: 5, size: 1.4 }));
}

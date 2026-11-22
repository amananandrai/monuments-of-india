import * as THREE from 'three';
import { mat, box, cyl, at, inst, unitBox, unitCyl, photo } from '../helpers.js';
import { fortGate, rampart, bastionCrowns } from '../parts/forts.js';
import { heightField, rough, smooth, fbm, ridged } from '../parts/terrain.js';
import { detail } from '../detail.js';
import { addDetails } from '../details/kumbhalgarh-fort.js';

// Kumbhalgarh's yellow-grey stone, laid in lime; and the darker courses and copings.
export const STONE = photo(mat('#b9a98a', 0.9), 'rubble');
export const TRIM = photo(mat('#9a8b6f', 0.92), 'rubble');

// Kumbhalgarh on its ridge of the Aravallis, compressed: the real wall runs 36 km over the hills
// round a valley of temples, with Kartargarh, the citadel, on the highest peak in the middle, 1,100 m
// above the sea and some 200 m above the valley. Here the wall runs round a loop about 500 m across,
// along a crest of hills (its height at angle a: crestH), dipping to a saddle at the front (+z) where
// the Ram Pol stands; the citadel's peak rises H above the plain, its top a little plateau R0 wide.
export const H = 130, R0 = 30;
// The loop's radius at angle a (a = atan2(z, x); a = π/2 is +z, the front).
export const loopR = (a) => 240 * (1 + 0.1 * Math.sin(2 * a + 0.5) + 0.06 * Math.sin(3 * a + 1.3));
const front = (a) => { const t = ((a - Math.PI / 2 + Math.PI * 3) % (Math.PI * 2)) - Math.PI; return Math.exp(-(t * t) / 0.12); };
export const crestH = (a) => (72 + 26 * Math.sin(3 * a + 0.7) + 12 * Math.sin(5 * a)) * (1 - 0.7 * front(a));

// The citadel's peak: a level top R0 across, falling in steep slopes to the valley floor.
const peak = (r) => (r < R0 ? H : H * (1 - smooth(R0, 175, r)) ** 1.25);
// The ground's height at (x, z): the peak, the valley floor inside the loop, the crest the wall
// runs along, and beyond it the outer ranges of the Aravallis, lower in front where the road comes up.
export function hill(x, z) {
  const r = Math.hypot(x, z), a = Math.atan2(z, x), d = r - loopR(a);
  const floor = 26 + 6 * fbm(x, z, { scale: 0.01, octaves: 3 });
  const crest = crestH(a) * Math.exp(-((d / (d < 0 ? 75 : 60)) ** 2)) + rough(x, z, 2.5, 0.8);
  const outer = (35 + 75 * ridged(x, z, { scale: 0.004, octaves: 4 })) * smooth(70, 300, d) * (1 - 0.65 * front(a) * smooth(500, 260, z));
  const plain = 10 * smooth(-40, 120, d) * (1 - front(a));
  // The peak's flanks are cut by spurs and gullies; its top and the rings of wall round it stay level.
  const spurs = (22 * fbm(x, z, { scale: 0.016, octaves: 4 }) + 18 * ridged(x, z, { scale: 0.011, octaves: 3 }) - 8) * smooth(68, 100, r) * smooth(200, 140, r);
  return Math.max(peak(r) + rough(x * 0.7, z * 0.7, 1.2, 1) + spurs, crest, outer, d < 0 ? floor : plain + 4) - 0.3;
}

// The wall's line, as runs of short straight lengths [x, y, z, len, h, t, ry] (for inst() and
// rampart()), stepping up and down with the crest; and the half-round bastions on its outer face,
// [x, y, z, r, h], every few lengths. The Ram Pol's gap is left at GATE.
export const WALL_H = 8, WALL_T = 5;
export const GATE = (() => { const a = Math.PI / 2, r = loopR(a); return [0, r]; })();
export function wallLine() {
  const segs = [], towers = [], N = 300;
  for (let k = 0; k < N; k++) {
    const a0 = (k / N) * Math.PI * 2, a1 = ((k + 1) / N) * Math.PI * 2;
    const x0 = Math.cos(a0) * loopR(a0), z0 = Math.sin(a0) * loopR(a0), x1 = Math.cos(a1) * loopR(a1), z1 = Math.sin(a1) * loopR(a1);
    const mx = (x0 + x1) / 2, mz = (z0 + z1) / 2;
    if (Math.hypot(mx - GATE[0], mz - GATE[1]) < 9) continue;
    const y = Math.min(hill(x0, z0), hill(x1, z1), hill(mx, mz)) - 2.5;
    segs.push([mx, y, mz, Math.hypot(x1 - x0, z1 - z0) + 0.5, WALL_H + 2.5, WALL_T, Math.atan2(z0 - z1, x1 - x0)]);
    if (k % 4 === 2) { const r = Math.hypot(mx, mz), o = 3.2; towers.push([mx + (mx / r) * o, y, mz + (mz / r) * o, 4.6, WALL_H + 4]); }
  }
  return { segs, towers };
}

// Kartargarh's two rings of terraced wall round the peak, [r, base y] each, and the buildings on
// the top: the Badal Mahal (the Palace of Clouds) and, below it, Kumbha's palace.
export const RINGS = [[R0 + 2, H - 7], [62, 0]];

export function buildKumbhalgarh() {
  const g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  g.add(box(2400, 0.2, 2400, mat('#a39a6c', 0.95), 0, -0.4, 0));
  g.add(heightField(1500, 1500, detail.low ? 110 : 240, hill, { rock: ['#8a7d63', '#978a6f', '#7d725c'], cover: '#7f8450', steep: 0.82, band: 14 }));
  const { segs, towers } = wallLine();
  f.add(inst(unitBox(), segs, STONE), inst(unitCyl(14), towers.map(([x, y, z, r, h]) => [x, y, z, 2 * r, h, 2 * r]), STONE));
  f.add(rampart(segs, STONE, { trim: TRIM, size: 0.8, kerb: false, every: 1.3 }), bastionCrowns(towers.map(([x, y, z, r, h]) => [x, y + h, z, r]), STONE, { trim: TRIM, size: 0.8, seg: 14 }));
  // The Ram Pol, in the saddle at the front: a tall gate between two great bastions.
  const gy = hill(GATE[0], GATE[1]);
  f.add(at(fortGate(17, 13, 9, 5, 8, { m: STONE, trim: TRIM, box: true, towers: { r: 5, h: 15, cap: 'merlons', seg: 16 } }), GATE[0], gy - 0.2, GATE[1]));
  f.add(box(17, 3, 9, TRIM, GATE[0], gy - 3.2, GATE[1]));
  // Kartargarh: the terraced rings of wall round the peak, with round bastions.
  const ring = [], rt = [];
  RINGS.forEach(([r, y0], i) => {
    const n = Math.round((2 * Math.PI * r) / 5);
    for (let k = 0; k < n; k++) {
      const a = ((k + 0.5) / n) * Math.PI * 2, x = Math.cos(a) * r, z = Math.sin(a) * r, base = i === 0 ? y0 : peak(r) - 6;
      ring.push([x, base, z, (2 * Math.PI * r) / n + 0.3, i === 0 ? 9 : 12, 3, -a - Math.PI / 2]);
      if (k % (i === 0 ? 5 : 7) === 0) rt.push([x * 1.05, base, z * 1.05, i === 0 ? 3.4 : 4.2, i === 0 ? 10.5 : 13.5]);
    }
  });
  f.add(inst(unitBox(), ring, STONE), inst(unitCyl(14), rt.map(([x, y, z, r, h]) => [x, y, z, 2 * r, h, 2 * r]), STONE));
  f.add(rampart(ring, STONE, { trim: TRIM, size: 0.7, kerb: false, slits: false }), bastionCrowns(rt.map(([x, y, z, r, h]) => [x, y + h, z, r]), STONE, { trim: TRIM, size: 0.7, seg: 14 }));
  // A stepped ramp from the valley up the peak's south face to the citadel's gate.
  const ramp = [];
  for (let k = 0; k < 40; k++) { const z = 175 - k * 3.6, x = 14 + 10 * Math.sin(k * 0.3), y = hill(x, z); ramp.push([x, y - 2, z, 5, 2.3, 3.8, 0]); }
  g.add(inst(unitBox(), ramp, TRIM));
  f.add(cyl(R0 + 1, R0 + 3, 4, TRIM, 0, H - 4, 0, 32));
  addDetails(f, g, { gy });
  // From the south-east, the wall climbing the hills either side of the Ram Pol and the Badal
  // Mahal on the peak behind.
  return { group: g, focus: f, view: [0.45, 0.3, 1], zoom: 0.4, target: [0, 72, 60] };
}

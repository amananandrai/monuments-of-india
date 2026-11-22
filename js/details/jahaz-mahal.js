import * as THREE from 'three';
import { M, box, cyl, at, onFace, sheet, tube, starPrism } from '../helpers.js';
import { chhajja, bracketGeo, placeAll, alongFace, merlons, jharokha, petalRing, mergeByMaterial } from '../parts/components.js';
import { steps } from '../parts/doorways.js';
import { heightField, fbm, smooth } from '../parts/terrain.js';
import { trees, shrubs, asiBoard, scatter, along } from '../parts/realism.js';
import { detail } from '../detail.js';
import { STONE } from '../monuments/jahaz-mahal.js';

// Jahaz Mahal, finer detail. From photographs: a thin eave on brackets runs over the arcades; the
// roof terrace is edged by a parapet of rounded merlons; balconies on brackets, under little domed
// roofs, jut from the terrace over Munj Talao on the west; at the north end of the terrace a
// lotus-shaped pool is fed by a channel winding in a spiral, and stairs climb from the shore at
// each end. Dimensions follow js/monuments/jahaz-mahal.js: the block L by D, the lower storey H1
// high on a plinth P, the terrace at Y.
function architecture(f, { L, D, H1, P, Y }) {
  const S = STONE, d = new THREE.Group();
  for (const a of [0, Math.PI]) {
    d.add(onFace(at(chhajja(L, 0.9, 0.4, 0.1, S.shade), 0, P + H1 - 0.35, 0), a, D / 2));
    d.add(placeAll(bracketGeo(0.55, 0.8, 0.2), alongFace(a, D / 2, L - 4, 24, P + H1 - 0.8), S.shade));
    // The parapet, broken for the pavilions and the porch.
    for (const [x0, x1] of [[-L / 2 + 14, -7], [7, L / 2 - 14]]) d.add(onFace(at(merlons(x1 - x0, 0.7, 0.85, 0.35, S.wall, 0.3), 0, Y, 0), a, D / 2 + 0.1, (a === 0 ? 1 : -1) * (x0 + x1) / 2));
  }
  for (const a of [Math.PI / 2, -Math.PI / 2]) d.add(onFace(at(chhajja(D, 0.9, 0.4, 0.1, S.shade), 0, P + H1 - 0.35, 0), a, L / 2));
  // Balconies over the west lake, on brackets, each under a little dome.
  for (const x of [-38, -14, 14, 38]) d.add(onFace(at(jharokha(2.6, 2.4, S.wall, { d: 1.3, roof: 'dome', trim: S.trim }), 0, P + H1 - 3.2, 0), Math.PI, D / 2, -x));
  // Stairs from the shore to the terrace at both ends, along the east face.
  for (const s of [-1, 1]) {
    const st = at(steps(2.6, P + H1 + 0.5, 22, S.shade, 0.5), s * (L / 2 + 6.2), 0, 2);
    st.rotation.y = -s * Math.PI / 2;
    d.add(st, box(2.8, P + H1, 1, S.wall, s * (L / 2 + 6.2), 0, 3.4).translateX(0));
  }
  // The lotus pool on the north terrace: a star-shaped basin, its rim cut in petals.
  const px = 36, pz = 0;
  d.add(at(starPrism(16, 3.6, 3.0, 0.6, S.shade), px, Y, pz), at(petalRing(3.3, 16, 0.7, 0.55, 0.2, S.wall, 0.15), px, Y + 0.6, pz));
  f.add(mergeByMaterial(d));
  f.add(at(cyl(3.0, 3.0, 0.05, M.water, 0, 0, 0, 32), px, Y + 0.56, pz));
  // The spiral channel that feeds it, coiling in four turns beside the pool.
  const pts = [], cx = px - 8, n = 120;
  for (let k = 0; k <= n; k++) { const t = k / n, a = t * Math.PI * 8, r = 0.4 + 2.6 * t; pts.push(new THREE.Vector3(cx + Math.cos(a) * r, Y + 0.12, pz + Math.sin(a) * r)); }
  pts.push(new THREE.Vector3(px - 3.6, Y + 0.12, pz));
  f.add(tube(pts, 0.14, S.wall, detail.low ? 160 : 320, 6), tube(pts.map((p) => p.clone().setY(Y + 0.2)), 0.07, M.water, detail.low ? 160 : 320, 4));
}

// The plateau round the lakes: low ground rising to the ridges of Mandu.
function groundY(x, z) {
  const w = 60 * (fbm(x + 300, z, { scale: 0.006, octaves: 3 }) - 0.5), lake = Math.min(1, Math.max(smooth(150, 110, Math.abs(x + 20 + w)) * smooth(9, 30, z) * smooth(260, 210, z - w),
    smooth(140, 100, Math.abs(x - 10 - w)) * smooth(-9, -30, z) * smooth(-260, -210, z + w)));
  return 1.2 - 2.8 * lake + smooth(300, 700, Math.hypot(x, z)) * 40 * (0.6 + fbm(x, z, { scale: 0.004, octaves: 4 }));
}

// Jahaz Mahal between its two lakes, Kapur Talao to the east and Munj Talao to the west: the water
// round the palace, stone ghats down to it, and the tamarind and neem of Mandu's plateau.
export function addDetails(f, g, dims) {
  architecture(f, dims);
  const { L, D } = dims;
  g.add(heightField(1400, 1400, detail.low ? 110 : 170, groundY, { rock: ['#8c7b62', '#9a8a70'], cover: '#7a8450', steep: 0.8 }));
  // The two lakes, at the foot of the palace's plinth.
  g.add(sheet(380, 300, M.lake, -20, 0.15, 150), sheet(360, 300, M.lake, 10, 0.15, -150));
  // The strip of land the palace stands on, its ends running out to the shore.
  g.add(box(L + 40, 1.3, D + 6, M.path, 0, -0.1, 0));
  // Ghats: flights of steps down to each lake beside the palace.
  for (const [x, z, a] of [[-30, D / 2 + 3, 0], [30, D / 2 + 3, 0], [-20, -D / 2 - 3, Math.PI], [20, -D / 2 - 3, Math.PI]]) {
    const s = at(steps(8, 1.2, 5, STONE.shade), x, -1, z);
    s.rotation.y = a;
    g.add(s);
  }
  const shore = (x, z) => groundY(x, z) > 0.9;
  g.add(trees(scatter(46, [-260, 260, -260, 260], { seed: 4, gap: 18 }).filter(([x, z]) => shore(x, z) && (Math.abs(x) > L / 2 + 25 || Math.abs(z) > 40)), { kind: 'tamarind', seed: 6 }));
  g.add(trees(scatter(30, [-300, 300, -300, 300], { seed: 9, gap: 22 }).filter(([x, z]) => shore(x, z) && (Math.abs(x) > L / 2 + 25 || Math.abs(z) > 40)), { kind: 'neem', seed: 3 }));
  g.add(shrubs(along(10, [-L / 2 - 18, 9], [-L / 2 - 18, -9]).concat(along(10, [L / 2 + 18, 9], [L / 2 + 18, -9])).map(([x, z]) => [x, z, 1, 0.6]), { seed: 8, dry: true }));
  g.add(asiBoard('Jahaz Mahal', L / 2 + 14, 12, Math.PI / 2, { y: 0.6 }));
}

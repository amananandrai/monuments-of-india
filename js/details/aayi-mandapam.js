import * as THREE from 'three';
import { M, mat, box, cyl, at, onFace, FACES, sheet } from '../helpers.js';
import { dentils, keystone, rosette, mergeByMaterial } from '../parts/components.js';
import { trees, shrubs, lampPosts, benches, fountains, scatter, along, around, traffic, cityAround } from '../parts/realism.js';
import { detail } from '../detail.js';

const WHITE = mat('#f4f2ec', 0.75), SHADE = mat('#dcd7cc', 0.85), YELLOW = mat('#e9c46a', 0.85), TRIM = mat('#f7f3ea', 0.8);
const ROAD = mat('#57575a', 0.92), KERB = mat('#bdb7ab', 0.9), HEDGE_BED = mat('#5f4a36', 0.95);

// Aayi Mandapam, finer detail: a keystone and a ring of rosettes over each arch, dentils under the
// cornice, a dark tablet on the attic of the south face, and fleurons at the corners of the attic.
// Dimensions follow js/monuments/aayi-mandapam.js: plinth P high, pavilion W square and BH high,
// entablature at E, attic at A, drum at D.
function architecture(f, { P, W, BH, E, A }) {
  const d = new THREE.Group();
  for (const a of FACES) {
    const face = new THREE.Group();
    face.add(at(keystone(0.55, 0.8, 0.25, SHADE), 0, 4.3, 0.02));
    for (const s of [-1, 1]) face.add(at(rosette(0.35, SHADE), s * 2.85, BH - 1.2, 0.33));
    face.add(at(dentils(W + 1.6, 0.16, 0.18, 0.12, SHADE), 0, BH + 0.55, 0.6));
    d.add(onFace(at(face, 0, P, 0), a, W / 2));
  }
  // The tablet with Aayi's name, on the upper step of the attic's south face.
  d.add(box(3.6, 0.62, 0.06, mat('#3b3a38', 0.6), 0, A + 2.04, (W - 0.6) / 2 + 0.03));
  for (const [x, z] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) d.add(cyl(0.05, 0.28, 0.6, SHADE, x * (W / 2 + 0.2), A + 1.9, z * (W / 2 + 0.2), 8), cyl(0.18, 0.06, 0.5, SHADE, x * (W / 2 + 0.2), A + 2.5, z * (W / 2 + 0.2), 8));
  f.add(mergeByMaterial(d));
}

// A French colonial house of the White Town: a two-storey block in yellow or white, its windows
// tall and shuttered, a cornice and a parapet with a balustered terrace, on a street front.
function villa(w, d, h, wall) {
  const g = new THREE.Group();
  g.add(box(w, h, d, wall), box(w + 0.4, 0.35, d + 0.4, TRIM, 0, h, 0), box(w, 0.9, d, TRIM, 0, h + 0.35, 0), box(w + 0.3, 0.25, d + 0.3, TRIM, 0, 3.6, 0));
  const n = Math.max(2, Math.floor(w / 3));
  for (let k = 0; k < n; k++) {
    const x = -w / 2 + (k + 0.5) * (w / n);
    for (const y of [0.9, 4.4]) g.add(box(1.1, 2.2, 0.08, mat('#3d6e5a', 0.8), x, y, d / 2 + 0.02), box(1.4, 0.18, 0.2, TRIM, x, y + 2.25, d / 2 + 0.08));
  }
  return g;
}

// Bharathi Park: the lawns and their paths meeting at the monument, palms and rain trees, flower
// beds, lamps and benches; the yellow Raj Nivas, the governor's house, on the north side, and the
// streets of the French quarter round the park.
export function addDetails(f, g, dims) {
  architecture(f, dims);
  const PW = 150, PD = 120;
  g.add(sheet(900, 900, M.grass, 0, 0, 0));
  // The roads round the park and the town beyond.
  const s = new THREE.Group();
  s.add(box(PW + 28, 0.1, 14, ROAD, 0, 0, PD / 2 + 7), box(PW + 28, 0.1, 14, ROAD, 0, 0, -PD / 2 - 7), box(14, 0.1, PD, ROAD, PW / 2 + 7, 0, 0), box(14, 0.1, PD, ROAD, -PW / 2 - 7, 0, 0));
  s.add(box(PW, 0.18, 1, KERB, 0, 0, PD / 2), box(PW, 0.18, 1, KERB, 0, 0, -PD / 2), box(1, 0.18, PD, KERB, PW / 2, 0, 0), box(1, 0.18, PD, KERB, -PW / 2, 0, 0));
  g.add(mergeByMaterial(s));
  g.add(sheet(PW - 1, PD - 1, M.grass, 0, 0.12, 0));
  // The paths: a ring round the plinth and eight walks radiating to the park's edges.
  const p = new THREE.Group();
  p.add(cyl(14, 14, 0.06, M.path, 0, 0.12, 0, 48));
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * Math.PI * 2, L = k % 2 ? 64 : (k % 4 === 0 ? PD / 2 : PW / 2), w = k % 4 === 0 ? 5 : 3;
    const walk = box(w, 0.06, L - 13, M.path, 0, 0.13, 0);
    walk.position.set(Math.sin(a) * (13 + L) / 2, 0.13, Math.cos(a) * (13 + L) / 2);
    walk.rotation.y = a;
    p.add(walk);
  }
  p.add(box(PW - 8, 0.06, 3, M.path, 0, 0.125, -PD / 2 + 6), box(PW - 8, 0.06, 3, M.path, 0, 0.125, PD / 2 - 6));
  g.add(mergeByMaterial(p));
  // Flower beds and clipped hedges in the quarters, palms along the walks, rain trees and banyans
  // shading the lawns, and fountains in two round pools.
  const beds = [];
  for (const [x, z] of [[-28, 22], [28, 22], [-28, -22], [28, -22]]) { beds.push(cyl(6, 6, 0.2, HEDGE_BED, x, 0.12, z, 24)); }
  g.add(mergeByMaterial(new THREE.Group().add(...beds)));
  for (const [x, z] of [[-28, 22], [28, 22], [-28, -22], [28, -22]]) g.add(shrubs(around(10, 5, x, z), { seed: 3 + x, y: 0.3, size: 1.1, flowers: ['#d43a5c', '#f2a11c', '#e8e2d8', '#c2352b'][(x > 0 ? 1 : 0) + (z > 0 ? 2 : 0)] }));
  g.add(shrubs(around(36, 16.5, 0, 0, 0.09), { seed: 5, y: 0.12, size: 1.0 }));
  for (const [x, z] of [[-48, 32], [48, -32]]) { g.add(cyl(5, 5, 0.5, SHADE, x, 0.12, z, 28), sheet(9.4, 9.4, M.water, x, 0.55, z)); g.add(fountains([[x, z]], { y: 0.55, h: 2.4 })); }
  const walks = [];
  for (let k = 0; k < 8; k++) { const a = (k / 8) * Math.PI * 2 + 0.22; for (const r of [22, 34, 46]) walks.push([Math.sin(a) * r, Math.cos(a) * r]); }
  g.add(trees(walks.filter(([x, z]) => Math.abs(x) < PW / 2 - 4 && Math.abs(z) < PD / 2 - 4), { kind: 'palm', seed: 4, y: 0.12 }));
  const lawn = scatter(detail.low ? 14 : 26, [-PW / 2 + 6, PW / 2 - 6, -PD / 2 + 8, PD / 2 - 8], { seed: 7, gap: 13, avoid: [[-20, 20, -20, 20], [-55, -40, 25, 40], [40, 55, -40, -25]] });
  g.add(trees(lawn.filter((_, i) => i % 3 === 0), { kind: 'banyan', seed: 2, y: 0.12 }));
  g.add(trees(lawn.filter((_, i) => i % 3 === 1), { kind: 'tamarind', seed: 3, y: 0.12 }));
  g.add(trees(lawn.filter((_, i) => i % 3 === 2), { kind: 'neem', seed: 9, y: 0.12 }));
  g.add(lampPosts([...around(8, 15, 0, 0, Math.PI / 8), ...along(6, [-PW / 2 + 4, PD / 2 - 3], [PW / 2 - 4, PD / 2 - 3])], { y: 0.12 }));
  g.add(benches([[-10, 16.5, Math.PI], [10, 16.5, Math.PI], [-10, -16.5, 0], [10, -16.5, 0], [16.5, -8, -Math.PI / 2], [-16.5, 8, Math.PI / 2]], { y: 0.12 }));
  // Raj Nivas on the north side of the park, and white and yellow houses of the French quarter.
  const town = new THREE.Group();
  const raj = villa(70, 26, 7.2, YELLOW);
  town.add(at(raj, 0, 0, -PD / 2 - 14 - 14 - 13).rotateY(0));
  town.add(at(villa(20, 14, 7, WHITE), -PW / 2 - 14 - 10, 0, 20).rotateY(Math.PI / 2), at(villa(26, 14, 7, YELLOW), -PW / 2 - 14 - 10, 0, -24).rotateY(Math.PI / 2));
  town.add(at(villa(30, 14, 7, WHITE), PW / 2 + 14 + 10, 0, 18).rotateY(-Math.PI / 2), at(villa(22, 14, 7, mat('#e3a66b', 0.85)), PW / 2 + 14 + 10, 0, -26).rotateY(-Math.PI / 2));
  town.add(at(villa(34, 14, 7, WHITE), -36, 0, PD / 2 + 14 + 10).rotateY(Math.PI), at(villa(30, 14, 7, YELLOW), 34, 0, PD / 2 + 14 + 10).rotateY(Math.PI));
  g.add(mergeByMaterial(town));
  g.add(cityAround([-PW / 2 - 50, PW / 2 + 50, -PD / 2 - 70, PD / 2 + 44], { rows: detail.low ? 1 : 2, every: detail.low ? 2 : 1, fine: !detail.low, gap: 8, storeys: [2, 3], seed: 44,
    paint: ['#f1e6cf', '#e9c46a', '#f4f2ec', '#e3a66b', '#d9e0d3', '#f0d9a8'] }));
  g.add(traffic([[PD / 2 + 4.5, 1], [PD / 2 + 9.5, -1]], -PW / 2 - 14, PW / 2 + 14, { y: 0.1, gap: 22, seed: 5, buses: 0.05, trucks: 0 }));
}

import * as THREE from 'three';
import { M, mat, box, cyl, at, onFace, FACES, inst, unitBox, tricolour, mown } from '../helpers.js';
import { mergeByMaterial, railing } from '../parts/components.js';
import { haraRow, kuta } from '../parts/sculpture.js';
import { detail } from '../detail.js';
import { trees, shrubs, lampPosts, fountains, scatter, along } from '../parts/realism.js';
import { VS, GR, LT } from '../monuments/vidhana-soudha.js';

// Vidhana Soudha, finer detail. From photographs: the parapets are in the Dravidian manner, a
// hara of miniature shrines (kutas at the corners, barrel-roofed shalas between) along every roof,
// round the corner towers and over the porch; a horseshoe gable (a kudu) with the state emblem
// stands over the middle of the porch; flat pilasters mark the piers between the ground storey's
// arches. Dimensions follow js/monuments/vidhana-soudha.js (VS).
function architecture(f) {
  const d = new THREE.Group(), { W, D, FZ, G, T, CW, PZ, TW, TH } = VS, hx = W / 2, hz = D / 2, s = detail.low ? 2.0 : 1.25;
  const tx = hx - TW / 2 + 1.5, tz = hz - TW / 2 + 1.5, fx0 = CW / 2, fx1 = tx - TW / 2, py = T + 0.36;
  // The parapet wall and its hara, along each stretch of the outer walls.
  const run = (len, a, dist, lat = 0) => d.add(onFace(box(len, 0.8, 0.4, GR, 0, py, -0.3), a, dist, lat), onFace(at(haraRow(len - 1, s, LT), 0, py + 0.8, -0.3 - 0.1), a, dist, lat));
  for (const sx of [-1, 1]) { run(fx1 - fx0, 0, FZ, sx * (fx0 + fx1) / 2); if (!detail.low) run(2 * (tz - TW / 2), sx * Math.PI / 2, hx); }
  if (!detail.low) run(2 * fx1, Math.PI, hz);
  // Round the roof of each corner tower.
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    const t = at(new THREE.Group(), sx * tx, 0, sz * tz);
    for (const a of FACES) if (!detail.low || (a === 0) === (sz > 0) && Math.abs(Math.sin(a)) < 0.5) t.add(onFace(at(haraRow(TW - 3, s, LT), 0, TH + 1.46, 0), a, TW / 2 - 1));
    for (const x of [-1, 1]) for (const z of [-1, 1]) t.add(at(kuta(s * 1.2, LT), x * (TW / 2 - 1), TH + 1.46, z * (TW / 2 - 1)));
    d.add(t);
  }
  // Over the porch block: the hara along its front, and the kudu gable on the axis.
  d.add(at(haraRow(18, s, LT), -15, 24.36, PZ - 1), at(haraRow(18, s, LT), 15, 24.36, PZ - 1));
  const sh = new THREE.Shape();
  sh.absarc(0, 0, 3.6, -0.25, Math.PI + 0.25, false); sh.closePath();
  const rim = new THREE.Shape();
  rim.absarc(0, 0, 4.3, -0.3, Math.PI + 0.3, false); rim.absarc(0, 0, 3.6, Math.PI + 0.3, -0.3, true);
  d.add(box(10, 1.0, 1.6, GR, 0, 24.36, PZ - 1.1));
  d.add(at(new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: 0.6, bevelEnabled: false, curveSegments: 24 }), GR), 0, 26.3, PZ - 1.5));
  d.add(at(new THREE.Mesh(new THREE.ExtrudeGeometry(rim, { depth: 1.2, bevelEnabled: false, curveSegments: 24 }), LT), 0, 26.3, PZ - 1.7));
  d.add(cyl(1.5, 1.5, 0.2, M.gild, 0, 0, 0, 24).rotateX(Math.PI / 2).translateY(PZ - 0.85).translateZ(-27.2), at(kuta(1.4, LT), 0, 30.5, PZ - 1.1));
  // Pilasters on the piers of the ground storey, front only on phones.
  const pil = [];
  for (const sx of [-1, 1]) { const len = fx1 - fx0, n = Math.round(len / 3.6); for (let k = 0; k <= n; k++) pil.push([sx * (fx0 + (k * len) / n), 0, FZ + 0.06, 0.7, G, 0.16]); }
  d.add(inst(unitBox(), pil, LT));
  f.add(mergeByMaterial(d));
  // The national flag on its mast over the porch.
  f.add(at(tricolour(8, 3.6), 0, 24.4, PZ - 5));
}

// The setting: lawns and beds before the east front, the iron fence along Dr Ambedkar Veedhi, the
// wide road, and the old rain trees and tamarinds of Cubbon Park beyond it and round the building.
export function addDetails(f, g) {
  architecture(f);
  const { W, D, PZ } = VS, IRON = mat('#2b2e2c', 0.6, 0.5), KERB = mat('#d6d2c8', 0.85);
  g.add(mown(box(420, 0.15, 400, M.grass, 0, 0, 50)));
  g.add(box(420, 0.2, 30, M.asphalt, 0, 0, 152), box(420, 0.22, 0.4, mat('#e8e6df', 0.8), 0, 0, 152), box(420, 0.24, 5, M.path, 0, 0, 134.5), box(420, 0.24, 5, M.path, 0, 0, 169.5));
  // The paved court at the foot of the steps, the drives round the building and to the gates.
  g.add(box(90, 0.22, 26, M.path, 0, 0, PZ + 29), box(W + 40, 0.21, 9, M.path, 0, 0, PZ + 12), box(12, 0.2, 40, M.path, 0, 0, 113));
  for (const s of [-1, 1]) g.add(box(9, 0.2, D + 60, M.path, s * (W / 2 + 15.5), 0, 0), box(10, 0.2, 40, M.path, s * 80, 0, 113));
  // The fence along the road, open at the three gates.
  const fence = new THREE.Group();
  for (const [x0, x1] of [[-205, -86], [-74, -7], [7, 74], [86, 205]]) fence.add(at(railing(x1 - x0, 2.2, 0.12, IRON, 3.2), (x0 + x1) / 2, 0.5, 131), box(x1 - x0, 0.5, 0.5, GR, (x0 + x1) / 2, 0, 131));
  for (const x of [-86, -74, -7, 7, 74, 86]) fence.add(box(1.4, 3.6, 1.4, GR, x, 0, 131), box(1.8, 0.3, 1.8, LT, x, 3.6, 131));
  g.add(mergeByMaterial(fence));
  // Lawns with round beds and fountains either side of the court.
  const jets = [];
  for (const s of [-1, 1]) {
    g.add(cyl(9, 9, 0.5, KERB, s * 40, 0, 108, 36), cyl(8.4, 8.4, 0.56, M.water, s * 40, 0, 108, 36));
    jets.push([s * 40, 108], [s * 44, 108], [s * 36, 108], [s * 40, 112], [s * 40, 104]);
  }
  g.add(fountains(jets, { y: 0.56, h: 3.2 }));
  g.add(shrubs([-1, 1].flatMap((s) => [...along(detail.low ? 4 : 10, [s * 14, 82], [s * 14, 124]), ...along(detail.low ? 5 : 12, [s * 52, 96], [s * 104, 96]), ...along(detail.low ? 5 : 12, [s * 52, 120], [s * 104, 120])]).map(([x, z]) => [x, z, 1.2]), { flowers: '#d8442f', seed: 5 }));
  g.add(shrubs(along(detail.low ? 24 : 60, [-200, 128.6], [200, 128.6]).filter(([x]) => ![80, 0].some((c) => Math.abs(Math.abs(x) - c) < 9)).map(([x, z]) => [x, z, 1.3]), { seed: 14 }));
  // Trees: ashoka by the drives, rain trees (as banyans) and tamarinds round the building, the
  // park across the road.
  g.add(trees([-1, 1].flatMap((s) => [...along(9, [s * (W / 2 + 9), -60], [s * (W / 2 + 9), 76]), ...along(5, [s * 120, 104], [s * 196, 104])]), { kind: 'ashoka', seed: 3 }));
  g.add(trees(scatter(22, [-200, 200, 90, 126], { seed: 17, gap: 16, avoid: [[-112, 112, 60, 130]] }), { kind: 'banyan', seed: 17, h: 13 }));
  g.add(trees(scatter(34, [-205, 205, -140, -64], { seed: 23, gap: 13 }), { kind: 'tamarind', seed: 23 }));
  g.add(trees([-1, 1].flatMap((s) => scatter(12, [s > 0 ? 128 : -205, s > 0 ? 205 : -128, -60, 84], { seed: 40 + s, gap: 14 })), { kind: 'mango', seed: 41 }));
  g.add(trees(scatter(detail.low ? 30 : 46, [-205, 205, 174, 240], { seed: 51, gap: 11 }), { kind: 'banyan', seed: 51, h: 14 }));
  g.add(lampPosts([...along(12, [-190, 133.5], [190, 133.5]), ...along(12, [-190, 170.5], [190, 170.5]), ...along(5, [-40, PZ + 17], [40, PZ + 17]).filter(([x]) => Math.abs(x) > 5)], { h: 5 }));
}

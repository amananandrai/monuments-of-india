import * as THREE from 'three';
import { M, mat, box, at, inst, unitBox, archPanel, hemi, photo } from '../helpers.js';
import { mergeByMaterial, merlons } from '../parts/components.js';
import { trees, shrubs, scatter, along, asiBoard, bollards, cityAround } from '../parts/realism.js';
import { detail } from '../detail.js';
import { STONE, SHADE } from '../monuments/agrasen-ki-baoli.js';

// Agrasen ki Baoli, the setting: an iron railing round the trench at ground level, the gate on
// the north at the head of the steps, the little mosque of three bays on the west side by the
// well, a strip of lawn and trees, and the office and apartment blocks of Hailey Road and
// Connaught Place crowding round. Dimensions follow js/monuments/agrasen-ki-baoli.js.
const IRON = mat('#2e3134', 0.6, 0.4);

export function addDetails(f, g, { D, HW, WT, Z0, ZE, WZ }) {
  const d = new THREE.Group();
  // The railing round the trench and the well, posts and two rails.
  const posts = [], rails = [], X = HW + WT + 0.6;
  for (let z = ZE - WT - 0.6; z <= Z0; z += 2) for (const s of [-1, 1]) posts.push([s * X, D, z, 0.06, 1.1, 0.06]);
  for (const s of [-1, 1]) for (const y of [0.5, 1.05]) rails.push([s * X, D + y, (Z0 + ZE - WT) / 2, 0.05, 0.05, Z0 - ZE + WT + 0.6]);
  for (const y of [0.5, 1.05]) rails.push([0, D + y, ZE - WT - 0.6, 2 * X, 0.05, 0.05]);
  d.add(inst(unitBox(), posts, IRON), inst(unitBox(), rails, IRON));
  // The gate at the head of the steps: two piers and a lintel.
  for (const s of [-1, 1]) d.add(box(1.4, 3.4, 1.4, SHADE, s * (HW + 0.6), D, Z0 + 1));
  d.add(box(2 * HW + 2.6, 0.7, 1.6, SHADE, 0, D + 3.4, Z0 + 1));
  // The mosque on the west side: a prayer hall of three arched bays under a flat roof with a
  // parapet of merlons, its back to the west.
  const mq = new THREE.Group(), mx = -HW - WT - 9, mz = WZ + 4;
  mq.add(box(10, 0.6, 7, STONE, 0, 0, 0), box(10, 4.6, 4.5, STONE, 0, 0.6, -1.2), box(10.4, 0.35, 4.9, SHADE, 0, 5.2, -1.2));
  for (const x of [-3.2, 0, 3.2]) mq.add(at(archPanel(2.2, 3.4, true, M.recess, 0.06), x, 0.6, 1.06));
  mq.add(at(merlons(10, 0.6, 0.7, 0.3, SHADE), 0, 5.55, 0.9), at(hemi(1.4, STONE), 0, 5.55, -1.2));
  mq.rotation.y = Math.PI / 2;
  d.add(at(mq, mx, D, mz));
  f.add(mergeByMaterial(d));
  // Paving round the railing, a lawn and the lane to the gate.
  g.add(box(2 * X + 8, 0.04, Z0 - ZE + 20, M.path, 0, D, (Z0 + ZE) / 2 - 2), box(5, 0.04, 26, M.path, 0, D, Z0 + 15));
  g.add(bollards([...along(7, [-3, Z0 + 4], [-3, Z0 + 26]), ...along(7, [3, Z0 + 4], [3, Z0 + 26])], { y: D }));
  g.add(asiBoard('Agrasen ki Baoli', 5, Z0 + 6, -0.3, { y: D }));
  // Trees: neem and peepal round the site.
  const keep = [[-30, 30, -54, 60]];
  g.add(trees([[-16, 20], [16, 8], [-18, -14], [17, -30], [-14, 44], [14, 46], [24, -50], [-26, 10]], { kind: 'neem', seed: 3, y: D }));
  g.add(trees([[20, 30], [-24, -40]], { kind: 'peepal', seed: 6, y: D }));
  g.add(shrubs(scatter(20, [-28, 28, -50, 56], { seed: 4, gap: 4, avoid: [[-HW - WT - 1.5, HW + WT + 1.5, -45, Z0 + 2], [-4, 4, Z0, 60]] }).map(([x, z]) => [x, z, 1]), { seed: 4, y: D }));
  // The city: office and apartment blocks of six to twelve storeys on every side.
  g.add(cityAround([-34, 34, -62, 66], { rows: 2, gap: 4, storeys: [4, 12], width: [14, 24], depth: [14, 20], seed: 9, tanks: 0.3, every: detail.low ? 2 : 1, y: D }));
}

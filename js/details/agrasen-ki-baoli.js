import * as THREE from 'three';
import { M, mat, mesh, box, at, inst, unitBox, archPanel, doubleSided } from '../helpers.js';
import { mergeByMaterial, archRing, medallion, chhajja } from '../parts/components.js';
import { pierced } from '../parts/mughal.js';
import { trees, shrubs, scatter, along, asiBoard, bollards, cityAround } from '../parts/realism.js';
import { detail } from '../detail.js';
import { STONE, SHADE } from '../monuments/agrasen-ki-baoli.js';

// Agrasen ki Baoli, the setting: an iron railing round the trench and the well at ground level,
// the gate on the south at the head of the steps, the little mosque on its high platform at the
// south-west, a strip of lawn and trees, and the office and apartment blocks of Hailey Road and
// Connaught Place crowding round. Dimensions follow js/monuments/agrasen-ki-baoli.js.
const IRON = mat('#2e3134', 0.6, 0.4);
// The mosque's weathered lime plaster.
const PLASTER = mat('#8e877a', 0.95);

// The mosque, from photographs: a prayer hall of three bays on a high solid platform, open to the
// east through pointed arches on heavy clustered piers of sandstone, stucco medallions in the
// spandrels and in the mihrabs' frames, an eave on a deep attic band, and over it not a dome but a
// "whale-back": one long vault rounded down at its ends. The south bay has fallen, roof and arch,
// leaving its mihrab open to the sky. Faces +z; the hall is 3 * bay long.
function mosque() {
  const q = new THREE.Group(), bay = 3.3, L = 3 * bay, dp = 4.6, ph = 1.4, h = 3.9, x0 = -L / 2 + bay;
  q.add(box(L + 2.4, ph, dp + 3.6, STONE, 0, 0, 0.6), box(L + 2.6, 0.14, dp + 3.8, SHADE, 0, ph, 0.6));
  for (let k = 0; k < 4; k++) q.add(box(3, ph - (k + 1) * 0.28, 0.4, SHADE, 0, 0, dp / 2 + 2.6 + k * 0.4));
  const y = ph + 0.14;
  // The west wall with its three mihrabs, each in a frame with two medallions.
  q.add(box(L, h, 0.7, PLASTER, 0, y, -dp / 2 + 0.35));
  for (let k = 0; k < 3; k++) {
    const x = (k - 1) * bay;
    q.add(at(archPanel(1.5, 2.5, true, M.recess, 0.05), x, y, -dp / 2 + 0.7), at(archRing(1.5, 2.5, true, 0.16, 0.08, PLASTER), x, y, -dp / 2 + 0.7));
    for (const s of [-1, 1]) q.add(at(medallion(0.2, PLASTER), x + s * 0.72, y + 2.75, -dp / 2 + 0.71));
  }
  // The two bays still standing: their arches, the end wall, the piers, the eave and the vault.
  const two = 2 * bay, xc = bay / 2;
  q.add(at(pierced(two + 0.5, h, [[-bay / 2, 0, 2.3, 3.1], [bay / 2, 0, 2.3, 3.1]], 0.7, PLASTER), xc, y, dp / 2 - 0.7));
  q.add(box(0.7, h, dp, PLASTER, L / 2 - 0.35 + 0.25, y, 0), box(0.5, h * 0.62, 0.7, PLASTER, -L / 2 + 0.25, y, -dp / 2 + 0.9));
  for (let k = 0; k < 3; k++) {
    const x = x0 + k * bay - (k === 2 ? 0.1 : 0);
    q.add(box(0.95, 0.5, 0.95, STONE, x, y, dp / 2 - 0.35), box(0.9, 0.22, 0.9, STONE, x, y + 1.75, dp / 2 - 0.35));
    if (k < 2) for (const s of [-1, 1]) q.add(at(medallion(0.17, PLASTER), x + bay / 2 + s * 0.95, y + 3.05, dp / 2 + 0.01));
  }
  q.add(at(chhajja(two + 0.9, 0.55, 0.12, 0.1, SHADE), xc, y + h + 0.05, dp / 2), box(two + 0.5, 0.75, dp, PLASTER, xc, y + h, 0));
  // The whale-back: half an ellipsoid, cut off ragged where the south bay fell.
  const vault = mesh(new THREE.SphereGeometry(1, 20, 14, 0, Math.PI, 1.2, Math.PI - 1.2).rotateZ(Math.PI / 2).rotateX(-Math.PI / 2), doubleSided(PLASTER));
  vault.scale.set(L / 2 + 0.2, 1.7, dp / 2);
  q.add(at(vault, 0.25, y + h + 0.75, 0));
  return q;
}

export function addDetails(f, g, { D, HW, WT, Z0, ZE, WZ, WR }) {
  const d = new THREE.Group();
  // The railing round the trench and the well, posts and two rails.
  const posts = [], rails = [], X = HW + WT + 0.6, ZR = WZ - WR - 1.6;
  for (let z = ZR; z <= Z0; z += 2) for (const s of [-1, 1]) posts.push([s * X, D, z, 0.06, 1.1, 0.06]);
  for (const s of [-1, 1]) for (const y of [0.5, 1.05]) rails.push([s * X, D + y, (Z0 + ZR) / 2, 0.05, 0.05, Z0 - ZR]);
  for (const y of [0.5, 1.05]) rails.push([0, D + y, ZR, 2 * X, 0.05, 0.05]);
  d.add(inst(unitBox(), posts, IRON), inst(unitBox(), rails, IRON));
  // The entrance at the head of the steps: two low piers with an iron gate between.
  for (const s of [-1, 1]) d.add(box(0.9, 1.6, 0.9, SHADE, s * (HW + 0.9), D, Z0 + 1.2));
  const bars = [];
  for (let x = -HW; x <= HW; x += 0.15) bars.push([x, D, Z0 + 1.2, 0.03, 1.3, 0.03]);
  bars.push([0, D + 0.2, Z0 + 1.2, 2 * HW, 0.06, 0.05], [0, D + 1.2, Z0 + 1.2, 2 * HW, 0.06, 0.05]);
  d.add(inst(unitBox(), bars, IRON));
  // The mosque at the south-west, by the head of the steps, its back to the west.
  const mq = mosque();
  mq.rotation.y = Math.PI / 2;
  d.add(at(mq, -HW - WT - 9.5, D, Z0 - 9));
  f.add(mergeByMaterial(d));
  // Paving round the railing, a lawn and the lane to the gate.
  const pw = X + 4 - (HW + WT), pz0 = ZR - 6, pz1 = Z0 + 4;
  for (const s of [-1, 1]) g.add(box(pw, 0.04, pz1 - pz0, M.path, s * (HW + WT + pw / 2), D, (pz0 + pz1) / 2));
  g.add(box(2 * (HW + WT), 0.04, 4, M.path, 0, D, Z0 + 2), box(5, 0.04, 26, M.path, 0, D, Z0 + 17));
  g.add(bollards([...along(7, [-3, Z0 + 4], [-3, Z0 + 26]), ...along(7, [3, Z0 + 4], [3, Z0 + 26])], { y: D }));
  g.add(asiBoard('Agrasen ki Baoli', 5, Z0 + 6, -0.3, { y: D }));
  // Trees: neem and peepal round the site.
  g.add(trees([[-30, 0], [18, 4], [-18, -14], [17, -30], [-24, 46], [26, 44], [24, -50], [-26, 6]], { kind: 'neem', seed: 3, y: D }));
  g.add(trees([[-32, 30], [-24, -40]], { kind: 'peepal', seed: 6, y: D }));
  g.add(shrubs(scatter(20, [-28, 28, -50, 56], { seed: 4, gap: 4, avoid: [[-X - 5, X + 5, -50, Z0 + 5], [-4, 4, Z0, 60]] }).map(([x, z]) => [x, z, 1]), { seed: 4, y: D }));
  // The city: office and apartment blocks of six to twelve storeys on every side.
  g.add(cityAround([-34, 34, -62, 66], { rows: 2, gap: 4, storeys: [4, 12], width: [14, 24], depth: [14, 20], seed: 9, tanks: 0.3, every: detail.low ? 2 : 1, y: D }));
}

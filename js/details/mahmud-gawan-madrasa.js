import * as THREE from 'three';
import { M, mat, box, at, rng, inst, unitBox } from '../helpers.js';
import { windowFrame, mergeByMaterial } from '../parts/components.js';
import { trees, shrubs, asiBoard, scatter, along, townHouses, traffic } from '../parts/realism.js';
import { detail } from '../detail.js';
import { STONE, DRESSED, TILE_G, TILE_B, TILE_Y, TILE_W, C, FH, BH, FX0 } from '../monuments/mahmud-gawan-madrasa.js';

// A line of Quranic text in white glazed letters len long and h high, as strokes standing just
// proud of their ground: tall uprights, bowls on a broken baseline and dots.
function script(len, h, seed) {
  const R = rng(seed), out = [], p = h * 0.24;
  for (let x = -len / 2 + p; x < len / 2 - p; x += p) {
    const r = R();
    if (r < 0.42) out.push([x, h * 0.14, 0, h * 0.06, h * (0.5 + 0.28 * R()), 0.04]);
    else if (r < 0.8) out.push([x, h * 0.14, 0, p * 1.05, h * 0.07, 0.04], [x + p * 0.4, h * 0.14, 0, h * 0.06, h * 0.26, 0.04]);
    else out.push([x, h * 0.14, 0, p * 0.8, h * 0.07, 0.04], [x, h * 0.36 + h * 0.3 * R(), 0, h * 0.09, h * 0.09, 0.04]);
  }
  return inst(unitBox(), out, TILE_W);
}

// The madrasa in the old town of Bidar. On the piece of the east front that stands: three doors
// in tall sunk panels with a small window over each, two rows of three great arched openings with
// small niches between them and a strip of tile over each, and along the top the broad frieze of
// white script on blue between yellow borders; traces of tile on the wall's broken south edge and
// round the bays of the halls, whose three outer faces have small windows on each floor. A modern
// rail closes the gap where the entrance stood, the fallen masonry lies before it, and the town's
// houses, neem trees and the Chaubara road lie all round. Dimensions follow
// js/monuments/mahmud-gawan-madrasa.js: the building W x D on its basement, its front at z = D / 2.
export function addDetails(f, g, { W, D, H }) {
  const d = new THREE.Group(), fw = W / 2 - FX0 - 4, xc = FX0 + fw / 2 + 0.3, z = D / 2, PANEL = mat('#8f4f35', 0.92), RAIL = mat('#c9c6bd', 0.6, 0.3);
  for (const k of [-1, 0, 1]) {
    const x = xc + k * 3.7;
    d.add(box(2.3, 5.6, 0.05, PANEL, x, 0.3, z + 0.025), box(0.95, 2.1, 0.08, M.recess, x, 0.3, z + 0.05), box(1.25, 0.2, 0.12, DRESSED, x, 2.4, z + 0.06), at(windowFrame(0.7, 1.3, DRESSED, { frame: 0.14 }), x, 3.6, z + 0.05));
    for (const y of [6.6, 11.6]) d.add(at(windowFrame(2.1, 3.6, DRESSED, { frame: 0.28 }), x, y, z + 0.02), box(2.9, 0.4, 0.05, TILE_B, x, y + 4.1, z + 0.03));
  }
  for (const x of [xc - 5.6, xc - 1.85, xc + 1.85, xc + 5.6]) for (const y of [8, 13]) d.add(at(windowFrame(0.55, 1.1, DRESSED, { frame: 0.1 }), x, y, z + 0.02));
  // The frieze, and the same bands returning along the wall's north end behind the minaret.
  const fy = FH - 2.9;
  d.add(box(fw + 1, 2.1, 0.06, TILE_B, xc, fy, z + 0.03), box(fw + 1, 0.16, 0.08, TILE_Y, xc, fy - 0.16, z + 0.04), box(fw + 1, 0.16, 0.08, TILE_Y, xc, fy + 2.1, z + 0.04), box(fw + 1, 0.3, 0.06, TILE_G, xc, fy + 2.3, z + 0.03));
  d.add(at(script(fw + 0.4, 1.9, 5), xc, fy + 0.1, z + 0.08));
  d.add(box(fw + 1, 0.3, 0.05, TILE_G, xc, 6, z + 0.025));
  // Windows up the three outer faces of each hall's bay.
  for (const [x, zz, a0] of [[0, -D / 2 - 1.2, Math.PI], [W / 2 + 1.2, 0, Math.PI / 2], [-W / 2 - 1.2, 0, -Math.PI / 2]]) for (const q of [-1, 0, 1]) for (const y of [2, 6.6, 11.2, 15.6]) {
    const a = a0 + q * Math.PI / 4, w = at(windowFrame(y > 15 ? 1.1 : 0.9, y > 15 ? 1.9 : 2.2, DRESSED, { frame: 0.16 }), x + Math.sin(a) * 5.28, y, zz + Math.cos(a) * 5.28);
    w.rotation.y = a;
    d.add(w);
  }
  // The rail across the gap in the front.
  const rz = D / 2 - 2, x0 = -C / 2 - 4, len = FX0 - x0;
  for (const y of [0.25, 1.9]) d.add(box(len, 0.06, 0.06, RAIL, (x0 + FX0) / 2, y, rz));
  for (let k = 0; k <= 12; k++) d.add(box(0.07, 2, 0.07, RAIL, x0 + (k / 12) * len, 0, rz));
  if (!detail.low) for (let k = 0; k < len / 0.5; k++) d.add(box(0.025, 1.65, 0.025, RAIL, x0 + k * 0.5, 0.25, rz));
  f.add(at(mergeByMaterial(d), 0, BH, 0));
  const R = rng(17), heap = [];
  for (let k = 0; k < 40; k++) heap.push([-22 + R() * 30, BH, D / 2 - 9 + R() * 8, 0.6 + R() * 2.4, 0.3 + R() * 1.1, 0.6 + R() * 2.2, R() * 3]);
  f.add(inst(unitBox(), heap, STONE));
  g.add(box(W + 50, 0.12, D + 70, mat('#76914f', 0.95), 0, 0, 10), box(700, 0.08, 700, mat('#b0a184', 0.96), 0, -0.05, 0));
  g.add(box(6, 0.06, 14, M.path, 8, 0.12, D / 2 + 31));
  // The road along the front.
  const rd = D / 2 + 46;
  g.add(box(700, 0.1, 12, M.asphalt, 0, 0.05, rd));
  g.add(traffic([[rd - 3, 1], [rd + 3, -1]], -340, 340, { y: 0.15, gap: 24, seed: 5, taxis: 0.2, buses: 0.08 }));
  g.add(trees([...along(6, [-W / 2 - 18, -D / 2 - 14], [-W / 2 - 18, D / 2 + 14]), ...along(6, [W / 2 + 18, -D / 2 - 14], [W / 2 + 18, D / 2 + 14]), ...along(5, [-W / 2, -D / 2 - 18], [W / 2, -D / 2 - 18])], { kind: 'neem', seed: 3 }));
  g.add(shrubs(along(10, [-W / 2 - 6, D / 2 + 30], [W / 2 + 6, D / 2 + 30]).map(([x, zz]) => [x, zz, 1]), { y: 0.12, seed: 2 }));
  const spots = scatter(detail.low ? 50 : 110, [-320, 320, -320, 320], { seed: 7, gap: 14, avoid: [[-W / 2 - 28, W / 2 + 28, -D / 2 - 28, D / 2 + 40], [-400, 400, rd - 10, rd + 10]] });
  g.add(townHouses(spots.map(([x, zz], i) => [x, zz, 7 + (i % 3) * 2, 9, 1 + (i % 3), (i % 4) * Math.PI / 2]), { seed: 7, fine: false }));
  g.add(asiBoard('Mahmud Gawan Madrasa', 14, D / 2 + 34, 0));
}

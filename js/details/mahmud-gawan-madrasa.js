import { M, mat, box, rng, inst, unitBox } from '../helpers.js';
import { trees, shrubs, asiBoard, scatter, along, townHouses, traffic } from '../parts/realism.js';
import { detail } from '../detail.js';
import { STONE } from '../monuments/mahmud-gawan-madrasa.js';

// The madrasa in the old town of Bidar: a lawn and a low fence round it, the fallen masonry of the
// south half of its front heaped where it fell, the Chaubara road before it with its traffic, and
// the town's houses and neem trees all round. Dimensions follow js/monuments/mahmud-gawan-madrasa.js:
// the building W x D, its front at z = D / 2.
export function addDetails(f, g, { W, D }) {
  const R = rng(17), heap = [];
  for (let k = 0; k < 40; k++) heap.push([4 + R() * 26, 0, D / 2 + 1 + R() * 8, 0.6 + R() * 2.4, 0.4 + R() * 1.4, 0.6 + R() * 2.2, R() * 3]);
  f.add(inst(unitBox(), heap, STONE));
  g.add(box(W + 50, 0.12, D + 50, mat('#76914f', 0.95), 0, 0, 0), box(700, 0.08, 700, mat('#b0a184', 0.96), 0, -0.05, 0));
  g.add(box(6, 0.06, 25, M.path, -2, 0.12, D / 2 + 12.5));
  // The road along the front.
  const rz = D / 2 + 34;
  g.add(box(700, 0.1, 12, M.asphalt, 0, 0.05, rz));
  g.add(traffic([[rz - 3, 1], [rz + 3, -1]], -340, 340, { y: 0.15, gap: 24, seed: 5, taxis: 0.2, buses: 0.08 }));
  g.add(trees([...along(6, [-W / 2 - 16, -D / 2 - 14], [-W / 2 - 16, D / 2 + 14]), ...along(6, [W / 2 + 16, -D / 2 - 14], [W / 2 + 16, D / 2 + 14]), ...along(5, [-W / 2, -D / 2 - 16], [W / 2, -D / 2 - 16])], { kind: 'neem', seed: 3 }));
  g.add(shrubs(along(10, [-W / 2 - 6, D / 2 + 5], [-8, D / 2 + 5]).map(([x, z]) => [x, z, 1]), { y: 0.12, seed: 2 }));
  const spots = scatter(detail.low ? 50 : 110, [-320, 320, -320, 320], { seed: 7, gap: 14, avoid: [[-W / 2 - 25, W / 2 + 25, -D / 2 - 25, D / 2 + 25], [-400, 400, rz - 10, rz + 10]] });
  g.add(townHouses(spots.map(([x, z], i) => [x, z, 7 + (i % 3) * 2, 9, 1 + (i % 3), (i % 4) * Math.PI / 2]), { seed: 7, fine: false }));
  g.add(asiBoard('Mahmud Gawan Madrasa', 4, D / 2 + 22, 0));
}

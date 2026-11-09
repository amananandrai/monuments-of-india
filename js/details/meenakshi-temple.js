import { mat } from '../helpers.js';
import { trees, stalls, along, cityAround } from './realism.js';
import { detail } from '../detail.js';
import { rideElephant } from './animals.js';

// The Meenakshi Amman temple at Madurai: the temple elephant, flower and pooja stalls outside the
// gopurams, and coconut palms in the streets round the walls.
export function addDetails(f, g) {
  const tusker = rideElephant(mat('#5e5650', 0.9), 0.9, { cloth: '#b3262e', howdah: false });
  tusker.position.set(-20, 0, 70);
  tusker.rotation.y = 0.4;
  g.add(tusker);
  const st = [];
  for (const [x0, z0, x1, z1, ry] of [[-12, 134, -12, 150, Math.PI / 2], [12, 134, 12, 150, -Math.PI / 2], [124, -12, 140, -12, 0], [124, 12, 140, 12, Math.PI]]) st.push(...along(5, [x0, z0], [x1, z1]).map(([x, z]) => [x, z, ry]));
  g.add(stalls(st));
  g.add(trees([...along(10, [-130, -140], [130, -140]), ...along(10, [-135, -130], [-135, 130])], { kind: 'palm', seed: 6 }));
  // Madurai is laid out round the temple: the Chithirai streets run outside its walls, then rings of
  // houses along the Avani Moola and Masi streets, the four axial streets leading out from the
  // gopurams kept open.
  // The temple alone is close to the budget (js/detail.js): two rows of plain houses on desktops,
  // and on phones one row with every other plot built.
  g.add(cityAround([-122, 122, -132, 132], { rows: detail.low ? 1 : 2, every: detail.low ? 2 : 1, fine: false, gap: 24, seed: 91, paint: ['#efe2c4', '#e3c08f', '#d9a37a', '#cfe0d6', '#f1e6cf', '#e7b9b0', '#d6b06a'],
    keep: [[-16, 16, -400, 400], [-400, 400, -16, 16]] }));
}

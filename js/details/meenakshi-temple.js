import { mat } from '../helpers.js';
import { trees, people, PILGRIMS, stalls, scatter, along } from './realism.js';
import { rideElephant } from './animals.js';

// The Meenakshi Amman temple at Madurai: crowds of devotees in the courts and round the Golden
// Lotus tank, the temple elephant, flower and pooja stalls outside the gopurams, and coconut palms
// in the streets round the walls.
export function addDetails(f, g) {
  const palette = [...PILGRIMS, '#e26a9c', '#2f7a3f', '#2f5d9a', '#f4f1ea', '#b3262e'];
  g.add(people(scatter(120, [-115, 115, -125, 125], { seed: 3, avoid: [[-55, 55, -62, 62], [-108, -64, -16, 36], [62, 102, 64, 104]] }), { seed: 3, palette }));
  g.add(people(scatter(40, [-50, 50, -58, 58], { seed: 4, avoid: [[0, 34, -28, -12], [0, 44, 14, 46], [-39, -5, -48, -8]] }), { seed: 4, palette }));
  const tusker = rideElephant(mat('#5e5650', 0.9), 0.9, { cloth: '#b3262e', howdah: false });
  tusker.position.set(-20, 0, 70);
  tusker.rotation.y = 0.4;
  g.add(tusker);
  const st = [];
  for (const [x0, z0, x1, z1, ry] of [[-12, 134, -12, 150, Math.PI / 2], [12, 134, 12, 150, -Math.PI / 2], [124, -12, 140, -12, 0], [124, 12, 140, 12, Math.PI]]) st.push(...along(5, [x0, z0], [x1, z1]).map(([x, z]) => [x, z, ry]));
  g.add(stalls(st), people(scatter(30, [-10, 10, 134, 152], { seed: 5 }), { seed: 5, palette }));
  g.add(trees([...along(10, [-130, -140], [130, -140]), ...along(10, [-135, -130], [-135, 130])], { kind: 'palm', seed: 6 }));
}

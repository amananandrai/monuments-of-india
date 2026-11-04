import { mat } from '../helpers.js';
import { trees, stalls, along } from './realism.js';
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
}

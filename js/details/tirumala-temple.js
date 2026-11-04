import { mat } from '../helpers.js';
import { trees, stalls, scatter, along } from './realism.js';
import { rideElephant } from './animals.js';

// Tirumala: the temple elephant, flower and prasadam stalls along the approach, and the trees of
// the Seshachalam hills round the town.
export function addDetails(f, g) {
  const tusker = rideElephant(mat('#5e5650', 0.9), 0.9, { cloth: '#e3b54a', howdah: false });
  tusker.position.set(14, 0, 64);
  tusker.rotation.y = -0.4;
  g.add(tusker);
  g.add(stalls([...along(8, [-14, 60], [-14, 100]).map(([x, z]) => [x, z, Math.PI / 2]), ...along(8, [14, 60], [14, 100]).map(([x, z]) => [x, z, -Math.PI / 2])]));
  g.add(trees(scatter(40, [-108, 108, -108, 108], { seed: 6, gap: 12 }).filter(([x, z]) => Math.hypot(x, z) > 108 || (Math.hypot(x, z) > 46 && Math.hypot(x, z) < 70)), { kind: 'mango', seed: 6 }));
}

import { mat } from '../helpers.js';
import { trees, people, PILGRIMS, stalls, scatter, along } from './realism.js';
import { rideElephant } from './animals.js';

// Tirumala, the busiest temple in the world: pilgrims everywhere, in the courts, at the gopuram
// and round the Swami Pushkarini tank, the temple elephant, flower and prasadam stalls along the
// approach, and the trees of the Seshachalam hills round the town.
export function addDetails(f, g) {
  const palette = [...PILGRIMS, '#f2d23a', '#f4f1ea', '#2f5d9a', '#e26a9c'];
  f.add(people(scatter(70, [-38, 38, -50, 50], { seed: 3, avoid: [[-8, 8, -8, 8], [-26, 26, -22, 22]] }), { seed: 3, palette }));
  g.add(people(scatter(90, [-100, 100, 54, 100], { seed: 4 }), { seed: 4, palette }));
  g.add(people(scatter(40, [-82, -42, -21, 13], { seed: 5, avoid: [[-77, -47, -16, 8]] }), { seed: 5, palette }));
  const tusker = rideElephant(mat('#5e5650', 0.9), 0.9, { cloth: '#e3b54a', howdah: false });
  tusker.position.set(14, 0, 64);
  tusker.rotation.y = -0.4;
  g.add(tusker);
  g.add(stalls([...along(8, [-14, 60], [-14, 100]).map(([x, z]) => [x, z, Math.PI / 2]), ...along(8, [14, 60], [14, 100]).map(([x, z]) => [x, z, -Math.PI / 2])]));
  g.add(trees(scatter(40, [-108, 108, -108, 108], { seed: 6, gap: 12 }).filter(([x, z]) => Math.hypot(x, z) > 108 || (Math.hypot(x, z) > 46 && Math.hypot(x, z) < 70)), { kind: 'mango', seed: 6 }));
}

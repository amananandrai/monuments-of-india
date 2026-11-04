import { rng } from '../helpers.js';
import { trees, people, lampPosts, vehicles, autos, scatter, along } from './realism.js';

// The Rumi Darwaza at Lucknow: the road still runs through the gate, with its traffic of
// auto-rickshaws, cars and buses; lawns either side with neem trees; lamps; and people stopping to
// look up at the gate.
export function addDetails(f, g) {
  const R = rng(17), cars = [], three = [];
  for (const [x, ry] of [[-3.5, 0], [3.5, Math.PI]]) for (let z = -76; z < 76; z += 9 + R() * 18) { if (Math.abs(z) < 7) continue; (R() < 0.5 ? three : cars).push([x, 0.25, z, ry]); }
  g.add(vehicles(cars, { seed: 18, busShare: 0.1 }), autos(three));
  g.add(people([...scatter(20, [-40, -10, 6, 20], { seed: 19 }), ...scatter(20, [10, 40, 6, 20], { seed: 20 })], { seed: 19 }));
  g.add(trees(scatter(26, [-95, 95, -75, 75], { seed: 21, gap: 14, avoid: [[-36, 36, -8, 10], [-10, 10, -80, 80]] }), { kind: 'neem', seed: 21 }));
  g.add(lampPosts([...along(8, [-8.5, -75], [-8.5, 75]), ...along(8, [8.5, -75], [8.5, 75])]));
}

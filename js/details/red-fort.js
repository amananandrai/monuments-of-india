import { rng } from '../helpers.js';
import { trees, people, lampPosts, vehicles, autos, asiBoard, scatter, along } from './realism.js';

// The Red Fort, from Netaji Subhash Marg: Old Delhi's traffic of auto-rickshaws, cars and buses on
// the road in front, visitors gathered at the Lahori Gate, the neem trees on the strip of lawn
// along the moat, lamps, and the ASI board.
export function addDetails(f, g) {
  const R = rng(13), cars = [], three = [];
  for (const [z, ry] of [[29, Math.PI / 2], [33, Math.PI / 2], [39, -Math.PI / 2], [43, -Math.PI / 2]]) for (let x = -145; x < 145; x += 8 + R() * 16) (R() < 0.4 ? three : cars).push([x, 0.2, z, ry]);
  g.add(vehicles(cars, { seed: 14, busPaints: ['#c4262e', '#2f7a3f'], busShare: 0.15 }), autos(three));
  f.add(people(scatter(40, [-16, 16, 12, 24], { seed: 15 }), { seed: 15 }));
  g.add(trees(along(14, [-140, 18], [140, 18]).filter(([x]) => Math.abs(x) > 20), { kind: 'neem', seed: 16 }));
  g.add(lampPosts([...along(12, [-140, 25.5], [140, 25.5]), ...along(12, [-140, 46.5], [140, 46.5])]));
  g.add(asiBoard('Red Fort Complex', 22, 24, 0, { line2: 'WORLD HERITAGE SITE' }));
}

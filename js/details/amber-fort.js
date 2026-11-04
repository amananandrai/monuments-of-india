import * as THREE from 'three';
import { mat } from '../helpers.js';
import { trees, shrubs, people, lampPosts, scatter, along } from './realism.js';
import { rideElephant } from './animals.js';

// Amber Fort: the painted elephants carrying visitors up from the lake to the Suraj Pol, the
// saffron beds of the Kesar Kyari garden, scrub and dhok trees on the Aravalli slopes, lamps along
// the lake road, and visitors in the Jaleb Chowk.
const HIDE = mat('#7d726a', 0.9);
export function addDetails(f, g) {
  [[-18, 37.5, '#b3262e'], [-31, 37.5, '#1f5f8b'], [-44, 37.5, '#2f7a3f']].forEach(([x, z, c]) => {
    const e = rideElephant(HIDE, 0.95, { cloth: c });
    e.position.set(x, 0, z);
    e.rotation.y = -Math.PI / 2;
    f.add(e);
  });
  g.add(shrubs([[-6, 60], [6, 60], [-6, 72], [6, 72], [-3, 63], [3, 69], [-9, 66], [9, 66]].map(([x, z]) => [x, z, 2.2]), { y: 1.4, flowers: '#f08a1c' }));
  // Scrub on the hillsides either side of the fort
  for (const [x0, x1, z0, z1, y] of [[-100, -84, -34, 34, 10], [84, 100, -34, 34, 10], [-85, -72, -70, -12, 22], [72, 85, -70, -12, 22], [-75, -52, -104, -58, 34], [52, 75, -104, -58, 34]]) {
    const spots = scatter(6, [x0, x1, z0, z1], { seed: x0 * 3 + y, gap: 5 });
    g.add(trees(spots, { kind: 'mango', seed: y, y, h: 6 }), shrubs(spots.map(([x, z]) => [x + 2.5, z - 2, 2]), { y, dry: true, seed: y + 1 }));
  }
  g.add(lampPosts(along(8, [-75, 39.5], [75, 39.5])));
  f.add(people(scatter(24, [-32, 32, -37, -12], { seed: 4 }).map(([x, z]) => [x, z, 23]), { seed: 4 }));
  f.add(people(scatter(10, [-70, -10, 36, 39.5], { seed: 5 }), { seed: 5 }));
}

import { trees, shrubs, lampPosts, scatter, along } from './realism.js';
import { rideElephant } from './animals.js';
import { mat } from '../helpers.js';

// The Mysore Palace at Dasara: the caparisoned elephants of the procession on the forecourt lawn,
// one under the golden howdah, palms and flower beds, and lamps along the drive.
export function addDetails(f, g) {
  [[-24, 55, '#b3262e', '#e3b54a'], [-12, 58, '#2f5d9a', '#e3b54a'], [12, 58, '#2f7a3f', '#e3b54a'], [24, 55, '#7a1f5a', '#e3b54a']].forEach(([x, z, c, t], i) => {
    const e = rideElephant(mat('#6a605a', 0.9), 1, { cloth: c, trim: t, howdah: i === 1 });
    e.position.set(x, 0.15, z);
    e.rotation.y = Math.PI;
    g.add(e);
  });
  g.add(trees([...along(6, [-75, 35], [-75, 112]), ...along(6, [75, 35], [75, 112])], { kind: 'palm', seed: 4 }));
  g.add(shrubs(scatter(20, [-60, 60, 70, 110], { seed: 5, gap: 5, avoid: [[-8, 8, 30, 120]] }).map(([x, z]) => [x, z, 1.4]), { flowers: '#f08a1c', seed: 5 }));
  g.add(lampPosts([...along(6, [-8, 32], [-8, 112]), ...along(6, [8, 32], [8, 112])]));
}

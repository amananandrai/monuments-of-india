import { mat } from '../helpers.js';
import { trees, along } from './realism.js';
import { rideElephant } from './animals.js';

// The Sree Padmanabhaswamy temple at Thiruvananthapuram: the temple elephant, and coconut palms
// round the Padma Theertham tank and the walls.
export function addDetails(f, g) {
  const tusker = rideElephant(mat('#4f4844', 0.9), 0.95, { cloth: '#e3b54a', trim: '#e3b54a', howdah: false });
  tusker.position.set(-14, 0.3, 40);
  tusker.rotation.y = 0.3;
  f.add(tusker);
  g.add(trees([...along(8, [-34, 66], [-34, 120]), ...along(8, [34, 66], [34, 120]), ...along(10, [-60, -70], [-60, 60]), ...along(10, [60, -70], [60, 60])], { kind: 'palm', seed: 6 }));
}

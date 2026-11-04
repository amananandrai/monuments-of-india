import { at, flag, mat } from '../helpers.js';
import { lampPosts, garland, along } from './realism.js';

// Mahakaleshwar at Ujjain: saffron flags along the colonnade, garlands on the gate, and lamps on
// the approach.
const SAFFRON = mat('#f08a1c', 0.8, 0, { side: 2 });
export function addDetails(f, g) {
  for (const x of [-30, -10, 10, 30]) f.add(at(flag(5, SAFFRON), x, 5.8, 50));
  g.add(lampPosts([...along(6, [-70, 56], [70, 56]), ...along(6, [-70, -56], [70, -56])]));
  f.add(garland([-6, 4.6, 50.6], [6, 4.6, 50.6], { sag: 0.8, strands: 2 }));
}

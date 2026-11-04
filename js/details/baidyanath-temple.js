import { at, flag, mat } from '../helpers.js';
import { trees, lampPosts, along } from './realism.js';

// Baidyanath Dham at Deoghar: saffron flags on the shrines, a sacred peepal tree, and lamps along
// the outer path.
const SAFFRON = mat('#f08a1c', 0.8, 0, { side: 2 });
export function addDetails(f, g) {
  for (const [x, z] of [[-32, -30], [-32, -8], [-32, 14], [32, -30], [32, -8], [32, 14], [-16, -38], [16, -38], [-20, 30], [20, 30]]) f.add(at(flag(4, SAFFRON), x + 1.2, 9.5, z));
  f.add(trees([[-40, 40], [40, 40]], { kind: 'banyan', seed: 4, h: 12 }), trees([[-40, -42], [40, -42]], { kind: 'neem', seed: 5 }));
  g.add(lampPosts([...along(6, [-60, -60], [-60, 60]), ...along(6, [60, -60], [60, 60])]));
}

import { at, flag, mat } from '../helpers.js';
import { lampPosts, along } from './realism.js';

// Somnath on the Arabian Sea: saffron flags, and the lamps of the promenade along the sea wall by
// the Baan Stambh (the arrow pillar that marks no land between here and the South Pole).
const SAFFRON = mat('#f08a1c', 0.8, 0, { side: 2 });
export function addDetails(f, g) {
  g.add(lampPosts(along(10, [-54, -35.6], [54, -35.6]), { y: 3 }));
  for (const x of [-40, -20, 20, 40]) f.add(at(flag(6, SAFFRON), x, 0, 40));
}

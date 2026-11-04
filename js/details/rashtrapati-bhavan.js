import { at, tricolour } from '../helpers.js';
import { trees, lampPosts, along } from './realism.js';

// Rashtrapati Bhavan: the tricolour on the dome, and lamps and trees along the avenue to the Jaipur
// Column.
export function addDetails(f, g) {
  f.add(at(tricolour(10), 0, 45.6, 0));
  g.add(trees([...along(8, [-38, 70], [-38, 200]), ...along(8, [38, 70], [38, 200])], { kind: 'neem', seed: 5 }));
  g.add(lampPosts([...along(8, [-20, 70], [-20, 200]), ...along(8, [20, 70], [20, 200])]));
}

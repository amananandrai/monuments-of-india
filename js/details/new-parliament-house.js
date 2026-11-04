import { trees, shrubs, lampPosts, around } from './realism.js';
import { at, tricolour } from '../helpers.js';

// The new Parliament House in Delhi: the tricolour over the building, lawns and hedges round the
// triangle, neem trees on the edge of the grounds, and lamps.
export function addDetails(f, g) {
  f.add(at(tricolour(12), 18, 24, 0));
  g.add(trees(around(30, 120, 0, 0, 0.05), { kind: 'neem', seed: 3 }), shrubs(around(48, 102).map(([x, z]) => [x, z, 1.4]), { seed: 4 }));
  g.add(lampPosts(around(18, 96, 0, 0, 0.17)));
}

import { trees, lampPosts, along } from './realism.js';

// Chhatrapati Shivaji Maharaj Terminus: lamps along the forecourt and the road in front, and the
// rain trees along the road.
export function addDetails(f, g) {
  g.add(lampPosts([...along(9, [-100, 58], [100, 58]), ...along(9, [-100, 90], [100, 90])], { h: 5 }));
  g.add(trees(along(8, [-100, 95], [100, 95]), { kind: 'banyan', seed: 7, h: 12 }));
}

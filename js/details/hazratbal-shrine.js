import { trees, lampPosts, boats, houseboats, along } from './realism.js';

// Hazratbal on the shore of Dal Lake: shikaras with their canopies out on the water, houseboats
// moored along the far shore, and more chinars along the lakeside promenade with its lamps.
export function addDetails(f, g) {
  g.add(boats([[-60, 70, 0.4], [-20, 90, 1.2], [40, 76, -0.6], [90, 110, 2.0], [-120, 130, 0.9], [10, 140, 2.6], [150, 80, 1.5]], { y: 0.4, size: 1.3, canopy: true, colours: ['#8a3a2a', '#5a3d2a', '#2f5d9a', '#8a6a2a'] }));
  g.add(houseboats([[-200, 260, 0.1], [-160, 262, -0.05], [-120, 258, 0.08], [130, 266, 0], [172, 262, -0.1]], { y: 0.4 }));
  g.add(trees([...along(7, [-100, 40], [-30, 42]), ...along(7, [30, 42], [100, 40])], { kind: 'banyan', seed: 3, h: 13 }));
  g.add(lampPosts(along(12, [-105, 44], [105, 44])));
}

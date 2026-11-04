import { trees, shrubs, people, lampPosts, asiBoard, fountains, scatter, along } from './realism.js';

// The Chota Imambara at Lucknow, the "palace of lights": fountains in the long water channel,
// the rows of lamps that line it, hedges and shade trees in the garden, and visitors.
export function addDetails(f, g) {
  f.add(fountains(along(7, [0, 2], [0, 60]), { y: 0.5, h: 1.6 }));
  f.add(lampPosts([...along(8, [-7, 0], [-7, 64]), ...along(8, [7, 0], [7, 64])], { h: 3.6 }));
  f.add(shrubs([...along(10, [-12, 4], [-12, 60]), ...along(10, [12, 4], [12, 60])].map(([x, z]) => [x, z, 1]), { seed: 3 }));
  g.add(trees(scatter(18, [-75, 75, -60, 120], { seed: 4, gap: 14, avoid: [[-28, 28, -34, 80], [-40, 40, 8, 28]] }), { kind: 'neem', seed: 4 }));
  f.add(people([...scatter(20, [-5, 5, 0, 66], { seed: 5 }).map(([x, z]) => [x > 0 ? 4.6 : -4.6, z]), ...scatter(14, [-24, 24, -6, 2], { seed: 6 })], { seed: 5 }));
  g.add(asiBoard('Chota Imambara', 10, 82, 0));
}

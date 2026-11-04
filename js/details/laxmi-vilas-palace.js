import { trees, shrubs, lampPosts, fountains, scatter, along } from './realism.js';

// Laxmi Vilas Palace at Vadodara: the long drive to the porch lined with palms and lamps, the
// fountain on the forecourt lawn, flower beds, and the great trees of the 700-acre grounds.
export function addDetails(f, g) {
  g.add(trees([...along(9, [-12, 40], [-12, 160]), ...along(9, [12, 40], [12, 160])], { kind: 'palm', seed: 3 }));
  g.add(lampPosts([...along(8, [-8.5, 40], [-8.5, 160]), ...along(8, [8.5, 40], [8.5, 160])]));
  g.add(fountains([[-40, 60], [40, 60]], { h: 3 }), shrubs([...scatter(14, [-70, -18, 40, 90], { seed: 4, gap: 5 }), ...scatter(14, [18, 70, 40, 90], { seed: 5, gap: 5 })].map(([x, z]) => [x, z, 1.6]), { flowers: '#d0306f', seed: 4 }));
  g.add(trees(scatter(40, [-195, 195, -100, 185], { seed: 6, gap: 18, avoid: [[-115, 115, -25, 40], [-20, 20, 30, 170], [-75, 75, 35, 95]] }), { kind: 'banyan', seed: 6 }));
}

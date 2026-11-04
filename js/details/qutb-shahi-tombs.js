import { trees, shrubs, people, lampPosts, scatter, along } from './realism.js';

// The Qutb Shahi tombs at Hyderabad: the restored heritage park round them, with lawns, hedges,
// palms and neem trees, lamps along the walks, and visitors on the platforms.
export function addDetails(f, g) {
  g.add(trees(scatter(40, [-125, 125, -105, 105], { seed: 3, gap: 13, avoid: [[-25, 25, -25, 25], [-80, -40, -40, 0], [36, 76, -44, -4], [-58, -22, 32, 68], [22, 58, 36, 72], [-106, -74, 24, 56], [72, 108, 4, 36], [-24, 24, -80, -58]] }), { kind: 'palm', seed: 3 }));
  g.add(shrubs(along(20, [-110, -95], [110, -95]).map(([x, z]) => [x, z, 1.2]), { seed: 4 }));
  g.add(lampPosts([...along(8, [-6, -55], [-6, 100]), ...along(8, [6, -55], [6, 100])]));
  f.add(people([...scatter(30, [-30, 30, -30, 30], { seed: 5, avoid: [[-17, 17, -17, 17]] }), ...scatter(16, [-4, 4, 30, 100], { seed: 6 })], { seed: 5 }));
}

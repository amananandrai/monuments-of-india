import { trees, shrubs, lampPosts, scatter, along } from './realism.js';

// The Victoria Memorial at Kolkata: flower beds along the main walk, the trees of the 64-acre
// garden, and lamps along the walk.
export function addDetails(f, g) {
  g.add(shrubs([...along(14, [-8, 48], [-8, 160]), ...along(14, [8, 48], [8, 160])].map(([x, z]) => [x, z, 1.2]), { flowers: '#d0306f', seed: 5 }));
  g.add(trees(scatter(40, [-115, 115, -85, 165], { seed: 6, gap: 16, avoid: [[-60, 60, -45, 45], [-36, 36, 60, 160], [-10, 10, 40, 170]] }), { kind: 'banyan', seed: 6 }));
  g.add(lampPosts([...along(8, [-5.5, 44], [-5.5, 165]), ...along(8, [5.5, 44], [5.5, 165])]));
}

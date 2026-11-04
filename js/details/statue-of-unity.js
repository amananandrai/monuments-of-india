import { trees, shrubs, lampPosts, scatter, along } from './realism.js';

// The Statue of Unity at Kevadia: the beds of the Valley of Flowers laid out on the bank below it,
// and lamps.
export function addDetails(f, g) {
  const beds = ['#d0306f', '#f2c21c', '#f08a1c', '#7a3f8f', '#f4f1ea', '#d9342b'];
  beds.forEach((c, i) => g.add(shrubs(scatter(14, [-78, 78, 46 + i * 5, 50 + i * 5], { seed: 6 + i, gap: 2.5 }).map(([x, z]) => [x, z, 1.4]), { y: 0.3, flowers: c, seed: 6 + i })));
  g.add(trees([...along(8, [-78, -78], [-78, 78]), ...along(8, [78, -78], [78, 78])], { kind: 'neem', seed: 13, y: 0.3 }));
  g.add(lampPosts([...along(6, [-46, -46], [-46, 46]), ...along(6, [46, -46], [46, 46])], { y: 0.3 }));
}

import { trees, shrubs, people, lampPosts, scatter, along } from './realism.js';

// Jallianwala Bagh at Amritsar: visitors in the garden, at the Martyrs' Well and coming in
// through the narrow lane that was its only way out in 1919; the garden's trees and hedges; lamps.
export function addDetails(f, g) {
  f.add(people([...scatter(40, [-52, 52, -36, 36], { seed: 3, avoid: [[-16, 16, -22, 10], [-40, -32, 16, 24]] }), ...scatter(8, [-1.8, 1.8, 40, 66], { seed: 4 }), ...scatter(8, [-42, -30, 14, 26], { seed: 5 })], { seed: 3 }));
  f.add(trees(scatter(14, [-54, 54, -40, 40], { seed: 6, gap: 13, avoid: [[-18, 18, -24, 12], [-42, -30, 14, 26]] }), { kind: 'neem', seed: 6 }));
  f.add(shrubs([...along(10, [-50, 37], [50, 37]), ...along(10, [-50, -37], [50, -37])].map(([x, z]) => [x, z, 1.1]), { seed: 7 }));
  f.add(lampPosts([...along(4, [-3.5, 40], [-3.5, 64]), ...along(4, [3.5, 40], [3.5, 64])]));
}

import { trees, shrubs, lampPosts, scatter, along } from './realism.js';

// Jallianwala Bagh at Amritsar: the garden's trees and hedges round the Martyrs' Well and along the
// narrow lane that was its only way out in 1919, and lamps.
export function addDetails(f, g) {
  f.add(trees(scatter(14, [-54, 54, -40, 40], { seed: 6, gap: 13, avoid: [[-18, 18, -24, 12], [-42, -30, 14, 26]] }), { kind: 'neem', seed: 6 }));
  f.add(shrubs([...along(10, [-50, 37], [50, 37]), ...along(10, [-50, -37], [50, -37])].map(([x, z]) => [x, z, 1.1]), { seed: 7 }));
  f.add(lampPosts([...along(4, [-3.5, 40], [-3.5, 64]), ...along(4, [3.5, 40], [3.5, 64])]));
}

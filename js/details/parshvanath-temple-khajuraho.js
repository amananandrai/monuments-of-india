import { trees, shrubs, asiBoard, scatter, along } from './realism.js';

// The Parshvanath temple in Khajuraho's eastern group: the lawns, hedges and trees of the temple
// park, and the ASI board.
export function addDetails(f, g) {
  g.add(trees(scatter(14, [-46, 46, -46, 46], { seed: 4, gap: 14, avoid: [[-17, 17, -20, 28]] }), { kind: 'neem', seed: 4 }));
  g.add(shrubs([...along(8, [-16, -18], [-16, 26]), ...along(8, [16, -18], [16, 26])].map(([x, z]) => [x, z, 1]), { seed: 5 }));
  g.add(asiBoard('Parshvanath Temple, Khajuraho', 8, 40, 0, { line2: 'WORLD HERITAGE SITE' }));
}

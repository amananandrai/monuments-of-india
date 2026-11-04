import { trees, shrubs, people, asiBoard, scatter, along } from './realism.js';

// The Parshvanath temple in Khajuraho's eastern group: Jain pilgrims and visitors, the lawns,
// hedges and trees of the temple park, and the ASI board.
export function addDetails(f, g) {
  f.add(people(scatter(14, [-12, 12, -14, 22], { seed: 3, avoid: [[-8, 8, -14, 14]] }).map(([x, z]) => [x, z, 3]), { seed: 3, palette: ['#f4f1ea', '#f7f7f7', '#f2d23a', '#2f5d9a', '#d9342b'] }));
  g.add(trees(scatter(14, [-46, 46, -46, 46], { seed: 4, gap: 14, avoid: [[-17, 17, -20, 28]] }), { kind: 'neem', seed: 4 }));
  g.add(shrubs([...along(8, [-16, -18], [-16, 26]), ...along(8, [16, -18], [16, 26])].map(([x, z]) => [x, z, 1]), { seed: 5 }));
  g.add(asiBoard('Parshvanath Temple, Khajuraho', 8, 40, 0, { line2: 'WORLD HERITAGE SITE' }));
}

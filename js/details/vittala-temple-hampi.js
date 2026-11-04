import { trees, asiBoard, scatter } from './realism.js';

// The Vittala temple at Hampi: coconut palms and banana groves among the boulders, and the ASI
// board.
export function addDetails(f, g) {
  g.add(trees(scatter(40, [-140, 140, -140, 140], { seed: 4, gap: 14 }).filter(([x, z]) => (Math.abs(x) > 58 || Math.abs(z) > 82)), { kind: 'palm', seed: 4 }));
  g.add(asiBoard('Vittala Temple, Hampi', 10, 90, 0, { line2: 'WORLD HERITAGE SITE' }));
}

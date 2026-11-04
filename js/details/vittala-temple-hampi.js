import { trees, people, asiBoard, scatter, along } from './realism.js';

// The Vittala temple at Hampi: visitors round the stone chariot and in the pillared halls (the
// "musical" pillars of the main hall draw crowds), coconut palms and banana groves among the
// boulders, and the ASI board.
export function addDetails(f, g) {
  f.add(people(scatter(60, [-48, 48, -72, 72], { seed: 3, avoid: [[-17, 17, -36, 8], [-9, 9, -36, -20], [-40, -20, 18, 38], [21, 39, -49, -31], [-5, 5, 22, 38]] }), { seed: 3 }));
  g.add(trees(scatter(40, [-140, 140, -140, 140], { seed: 4, gap: 14 }).filter(([x, z]) => (Math.abs(x) > 58 || Math.abs(z) > 82)), { kind: 'palm', seed: 4 }));
  g.add(people(scatter(16, [-8, 8, 80, 120], { seed: 5 }), { seed: 5 }));
  g.add(asiBoard('Vittala Temple, Hampi', 10, 90, 0, { line2: 'WORLD HERITAGE SITE' }));
}

import { trees, shrubs, people, asiBoard, scatter } from './realism.js';

// Kailasa at Ellora: visitors in the great court cut down into the rock and crossing the bridge to
// the Nandi mandapa, and the scrub and trees on the basalt above the scarp.
export function addDetails(f, g) {
  const H = 32;
  f.add(people(scatter(40, [-28, 28, -45, 60], { seed: 3, avoid: [[-20, 20, -44, 20], [-6, 6, 26, 40], [-17, -13, 12, 32], [13, 17, 12, 32]] }), { seed: 3 }));
  f.add(people(scatter(8, [-1.5, 1.5, 19, 29], { seed: 4 }).map(([x, z]) => [x, z, 8]), { seed: 4 }));
  const top = [...scatter(30, [-74, 74, -84, -52], { seed: 5, gap: 8 }), ...scatter(16, [-74, -30, -48, 48], { seed: 6, gap: 9 }), ...scatter(16, [30, 74, -48, 48], { seed: 7, gap: 9 })];
  g.add(trees(top.filter((_, i) => i % 2 === 0), { kind: 'mango', seed: 8, y: H, h: 7 }), shrubs(top.filter((_, i) => i % 2).map(([x, z]) => [x, z, 2.4]), { y: H, dry: true, seed: 9 }));
  g.add(asiBoard('Kailasa Temple, Ellora (Cave 16)', 10, 62, 0, { line2: 'WORLD HERITAGE SITE' }));
}

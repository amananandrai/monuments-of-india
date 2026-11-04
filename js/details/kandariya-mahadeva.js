import { trees, shrubs, people, asiBoard, scatter, along } from './realism.js';

// The Kandariya Mahadeva in the western group at Khajuraho: the kept lawns of the temple park,
// with clipped hedges, flowering bougainvillea and shade trees, visitors on the platform and the
// paths, and the ASI board.
export function addDetails(f, g) {
  g.add(trees(scatter(18, [-44, 44, -54, 54], { seed: 3, gap: 12, avoid: [[-20, 20, -36, 42]] }), { kind: 'neem', seed: 3 }));
  g.add(shrubs([...along(10, [-20, -38], [-20, 40]), ...along(10, [20, -38], [20, 40])].map(([x, z]) => [x, z, 1.1]), { seed: 4 }));
  g.add(shrubs(scatter(10, [-44, 44, 42, 54], { seed: 5, gap: 5 }).map(([x, z]) => [x, z, 1.8]), { flowers: '#d0306f', seed: 5 }));
  f.add(people(scatter(20, [-15, 15, -30, 30], { seed: 6, avoid: [[-12, 12, -26, 26]] }).map(([x, z]) => [x, z, 3]), { seed: 6 }));
  g.add(people(scatter(12, [-10, 10, 42, 54], { seed: 7 }), { seed: 7 }));
  g.add(asiBoard('Khajuraho Group of Monuments', 14, 52, 0, { line2: 'WORLD HERITAGE SITE' }));
}

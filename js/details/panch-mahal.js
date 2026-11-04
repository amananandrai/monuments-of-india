import { trees, people, asiBoard, scatter } from './realism.js';

// The Panch Mahal at Fatehpur Sikri: visitors on its open storeys and in the court round it, by
// the pool; neem trees on the ridge; the ASI board.
export function addDetails(f, g) {
  f.add(people(scatter(14, [-20, 20, -11, 11], { seed: 3 }).map(([x, z]) => [x, z, 1.2]), { seed: 3 }));
  f.add(people(scatter(8, [-13, 13, -9, 9], { seed: 4 }).map(([x, z]) => [x, z, 6.4]), { seed: 4 }));
  g.add(people(scatter(20, [-58, 58, -48, 48], { seed: 5, avoid: [[-26, 26, -17, 17], [-56, -24, 7, 33]] }), { seed: 5 }));
  g.add(trees(scatter(12, [-58, 58, -48, 48], { seed: 6, gap: 14, avoid: [[-30, 30, -20, 20], [-58, -20, 4, 36]] }), { kind: 'neem', seed: 6 }));
  g.add(asiBoard('Panch Mahal, Fatehpur Sikri', 30, 46, 0, { line2: 'WORLD HERITAGE SITE' }));
}

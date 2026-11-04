import { trees, people, asiBoard, scatter } from './realism.js';

// Buland Darwaza at Fatehpur Sikri: visitors climbing the great flight of steps and gathered on
// the platform under the gate, and neem trees on the ridge either side.
export function addDetails(f, g) {
  const P = 13, climb = [];
  for (let k = 0; k < 10; k++) for (const x of scatter(2, [-20 + k, 20 - k, 0, 1], { seed: k + 3 }).map(([x]) => x)) climb.push([x, 12.5 + k * 3, P - k * 1.3]);
  f.add(people(climb, { seed: 3, face: Math.PI }));
  f.add(people(scatter(16, [-30, 30, 3, 10], { seed: 4, avoid: [[-12, 12, 3, 10]] }).map(([x, z]) => [x, z, P]), { seed: 4 }));
  f.add(people(scatter(14, [-40, 40, 45, 80], { seed: 5 }), { seed: 5 }));
  g.add(trees(scatter(16, [-105, 105, -75, 115], { seed: 6, gap: 15, avoid: [[-70, 70, -25, 45]] }), { kind: 'neem', seed: 6 }));
  g.add(asiBoard('Buland Darwaza, Fatehpur Sikri', 30, 60, 0, { line2: 'WORLD HERITAGE SITE' }));
}

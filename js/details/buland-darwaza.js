import { trees, asiBoard, scatter } from './realism.js';

// Buland Darwaza at Fatehpur Sikri: neem trees on the ridge either side of the great flight of
// steps, and the ASI board.
export function addDetails(f, g) {
  g.add(trees(scatter(16, [-105, 105, -75, 115], { seed: 6, gap: 15, avoid: [[-70, 70, -25, 45]] }), { kind: 'neem', seed: 6 }));
  g.add(asiBoard('Buland Darwaza, Fatehpur Sikri', 30, 60, 0, { line2: 'WORLD HERITAGE SITE' }));
}

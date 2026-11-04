import { trees, asiBoard, scatter } from './realism.js';

// The Panch Mahal at Fatehpur Sikri: neem trees on the ridge, and the ASI board.
export function addDetails(f, g) {
  g.add(trees(scatter(12, [-58, 58, -48, 48], { seed: 6, gap: 14, avoid: [[-30, 30, -20, 20], [-58, -20, 4, 36]] }), { kind: 'neem', seed: 6 }));
  g.add(asiBoard('Panch Mahal, Fatehpur Sikri', 30, 46, 0, { line2: 'WORLD HERITAGE SITE' }));
}

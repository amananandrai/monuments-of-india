import { trees, shrubs, asiBoard, along } from './realism.js';

// Rani ki Vav at Patan: the lawns and neem trees round the well, and the ASI board.
export function addDetails(f, g) {
  const D = 27;
  g.add(trees([...along(7, [-40, -45], [-40, 45]), ...along(7, [40, -45], [40, 45])], { kind: 'neem', seed: 6, y: D }));
  g.add(shrubs([...along(10, [-22, -36], [-22, 36]), ...along(10, [22, -36], [22, 36])].map(([x, z]) => [x, z, 1]), { y: D, seed: 7 }));
  g.add(asiBoard('Rani-ki-Vav, Patan', 14, 44, 0, { y: D, line2: 'WORLD HERITAGE SITE' }));
}

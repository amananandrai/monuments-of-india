import { trees, boats, asiBoard, scatter, along } from './realism.js';

// The Shore Temple at Mamallapuram: fishing boats drawn up on the sand and out at sea, casuarina
// and coconut palms behind the beach, and the ASI board.
export function addDetails(f, g) {
  g.add(boats(along(7, [60, -28], [100, -20]).map(([x, z], i) => [x, z, 0.3 + i * 0.15]), { y: 0.35, size: 1.6, colours: ['#2f5d9a', '#c2512a', '#f2d23a', '#3c8a5a'] }));
  g.add(boats([[-60, -110, 1.2], [20, -140, 2.2], [90, -120, 0.4], [-130, -150, 2.8]], { y: 0.3, size: 1.8 }));
  g.add(trees([...along(12, [-105, 92], [105, 92]), ...scatter(14, [-105, 105, 60, 95], { seed: 5, gap: 9 })], { kind: 'palm', seed: 5, y: 0.3 }));
  g.add(asiBoard('Shore Temple, Mamallapuram', 30, 40, 0, { y: 0.3, line2: 'WORLD HERITAGE SITE' }));
}

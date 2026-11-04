import { trees, shrubs, boats, asiBoard, scatter } from './realism.js';

// Bekal Fort: coconut palms along the shore and on the headland, fishing boats drawn up on the
// beach below the walls and more out at sea, and grass and scrub inside the walls.
export function addDetails(f, g) {
  const shore = scatter(40, [-190, 190, 135, 330], { seed: 3, gap: 7, avoid: [[-30, 30, 125, 170]] });
  g.add(trees(shore, { kind: 'palm', seed: 3, y: 0.3 }));
  g.add(trees(scatter(14, [-60, 60, -60, 60], { seed: 4, gap: 10 }).filter(([x, z]) => Math.hypot(x, z) > 14 && Math.hypot(x, z) < 62), { kind: 'palm', seed: 4, y: 8 }));
  g.add(shrubs(scatter(30, [-60, 60, -60, 60], { seed: 5, gap: 5 }).filter(([x, z]) => Math.hypot(x, z) > 12 && Math.hypot(x, z) < 64).map(([x, z]) => [x, z, 2]), { y: 8, seed: 5 }));
  g.add(boats([[-120, 104, 0.3], [-108, 102, 0.1], [95, 104, -0.2], [118, 106, 0.4]], { y: 0.4, size: 1.6 }));
  g.add(boats([[-220, -160, 1.2], [180, -240, 2.1], [260, 40, 0.4], [-300, 60, 2.8], [60, -320, 1.7]], { y: 0.2, size: 2 }));
  g.add(asiBoard('Bekal Fort', 26, 150, 0));
}

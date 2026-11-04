import { trees, people, asiBoard, fountains, scatter, along } from './realism.js';

// Safdarjung's Tomb, the last great Mughal garden tomb: fountains along the water channels of the
// charbagh, palms and neem trees in its squares, visitors on the terrace and the walks, and the
// ASI board at the gate.
export function addDetails(f, g) {
  const jets = [];
  for (const s of [-1, 1]) jets.push(...along(3, [0, s * 40], [0, s * 74]), ...along(3, [s * 40, 0], [s * 74, 0]));
  g.add(fountains(jets, { y: 0.35, h: 1.8 }));
  const sq = scatter(36, [-80, 80, -80, 80], { seed: 3, gap: 12 }).filter(([x, z]) => Math.abs(x) > 7 && Math.abs(z) > 7 && (Math.abs(x) > 36 || Math.abs(z) > 36));
  g.add(trees(sq.slice(0, 18), { kind: 'palm', seed: 4 }), trees(sq.slice(18), { kind: 'neem', seed: 5 }));
  f.add(people(scatter(20, [-29, 29, -29, 29], { seed: 6, avoid: [[-15, 15, -15, 15]] }).map(([x, z]) => [x, z, 8]), { seed: 6 }));
  g.add(people(scatter(14, [-3, 3, 32, 80], { seed: 7 }), { seed: 7 }));
  g.add(asiBoard("Safdarjung's Tomb", 9, 96, 0));
}

import { trees, asiBoard, fountains, scatter, along } from './realism.js';

// Safdarjung's Tomb, the last great Mughal garden tomb: fountains along the water channels of the
// charbagh, palms and neem trees in its squares, and the ASI board at the gate.
export function addDetails(f, g) {
  const jets = [];
  for (const s of [-1, 1]) jets.push(...along(3, [0, s * 40], [0, s * 74]), ...along(3, [s * 40, 0], [s * 74, 0]));
  g.add(fountains(jets, { y: 0.35, h: 1.8 }));
  const sq = scatter(36, [-80, 80, -80, 80], { seed: 3, gap: 12 }).filter(([x, z]) => Math.abs(x) > 7 && Math.abs(z) > 7 && (Math.abs(x) > 36 || Math.abs(z) > 36));
  g.add(trees(sq.slice(0, 18), { kind: 'palm', seed: 4 }), trees(sq.slice(18), { kind: 'neem', seed: 5 }));
  g.add(asiBoard("Safdarjung's Tomb", 9, 96, 0));
}

import { trees, asiBoard, fountains, scatter, along } from './realism.js';

// Humayun's Tomb: fountains along the water channels that quarter the charbagh, the tall palms and
// shade trees of its squares, and the ASI board.
export function addDetails(f, g) {
  const jets = [];
  for (const s of [-1, 1]) jets.push(...along(5, [0, s * 60], [0, s * 130]).map(([x, z]) => [x, z]), ...along(5, [s * 60, 0], [s * 130, 0]));
  g.add(fountains(jets, { y: 0.35, h: 1.8 }));
  const squares = scatter(48, [-136, 136, -136, 136], { seed: 3, gap: 12 }).filter(([x, z]) => Math.abs(x) > 8 && Math.abs(z) > 8 && (Math.abs(x) > 62 || Math.abs(z) > 62));
  g.add(trees(squares.slice(0, 24), { kind: 'palm', seed: 4 }), trees(squares.slice(24), { kind: 'neem', seed: 5 }));
  g.add(asiBoard("Humayun's Tomb", 8, 136, 0, { line2: 'WORLD HERITAGE SITE' }));
}

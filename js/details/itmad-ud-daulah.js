import { trees, shrubs, boats, asiBoard, fountains, scatter, along } from './realism.js';

// Itmad-ud-Daulah, the "Baby Taj" on the Yamuna: fountains in the four water channels, hedges and
// trees in the garden squares, and boats on the river behind.
export function addDetails(f, g) {
  const jets = [];
  for (const s of [-1, 1]) jets.push(...along(3, [0, 20 + s * 32], [0, 20 + s * 66]), ...along(3, [s * 32, 20], [s * 66, 20]));
  g.add(fountains(jets, { y: 0.35, h: 1.5 }));
  const sq = scatter(28, [-70, 70, -50, 92], { seed: 3, gap: 11 }).filter(([x, z]) => Math.abs(x) > 6 && Math.abs(z - 20) > 6 && (Math.abs(x) > 28 || Math.abs(z) > 30));
  g.add(trees(sq, { kind: 'neem', seed: 3 }), shrubs([...along(10, [-4.5, 50], [-4.5, 92]), ...along(10, [4.5, 50], [4.5, 92])].map(([x, z]) => [x, z, 0.9]), { seed: 4 }));
  g.add(boats([[-120, -120, 0.3], [60, -140, 1.9], [150, -100, 2.6]], { y: 0.3, size: 1.6 }));
  g.add(asiBoard("Itimad-ud-Daulah's Tomb", 8, 92, 0));
}

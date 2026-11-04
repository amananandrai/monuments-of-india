import { trees, shrubs, asiBoard, scatter } from './realism.js';

// Daulatabad: scrub and thorn trees round the foot of the Devagiri hill and between the outer
// walls, and the ASI board.
export function addDetails(f, g) {
  const ring = scatter(70, [-125, 125, -125, 125], { seed: 3, gap: 8 }).filter(([x, z]) => { const r = Math.hypot(x, z); return r > 78 && r < 124 && Math.hypot(x - 40, z - 96) > 12; });
  g.add(trees(ring.slice(0, 30), { kind: 'mango', seed: 4, h: 7 }), shrubs(ring.slice(30).map(([x, z]) => [x, z, 2.2]), { dry: true, seed: 5 }));
  g.add(asiBoard('Daulatabad Fort', 52, 132, 0.6));
}

import { trees, shrubs, people, asiBoard, scatter } from './realism.js';

// Daulatabad: scrub and thorn trees round the foot of the Devagiri hill and between the outer
// walls, visitors at the Chand Minar and on the way in from the gate, and the ASI board.
export function addDetails(f, g) {
  const ring = scatter(70, [-125, 125, -125, 125], { seed: 3, gap: 8 }).filter(([x, z]) => { const r = Math.hypot(x, z); return r > 78 && r < 124 && Math.hypot(x - 40, z - 96) > 12; });
  g.add(trees(ring.slice(0, 30), { kind: 'mango', seed: 4, h: 7 }), shrubs(ring.slice(30).map(([x, z]) => [x, z, 2.2]), { dry: true, seed: 5 }));
  f.add(people([...scatter(14, [30, 50, 86, 106], { seed: 6, avoid: [[35, 45, 91, 101]] }), ...scatter(16, [30, 60, 100, 125], { seed: 7 })], { seed: 6 }));
  g.add(asiBoard('Daulatabad Fort', 52, 132, 0.6));
}

import { trees, shrubs, people, asiBoard, scatter, along } from './realism.js';

// Rani ki Vav at Patan: visitors going down the stepped corridor to the water and looking over the
// railings from the top, the lawns and neem trees round the well, and the ASI board.
export function addDetails(f, g) {
  const D = 27, L = 64, z0 = L / 2, steps = 32, run = (L - 12) / steps, down = [];
  for (let i = 1; i < steps; i += 2) down.push([Math.sin(i * 2.3) * 6, z0 - (i + 0.5) * run, D - (i + 1) * (D / steps)]);
  f.add(people(down, { seed: 3, face: Math.PI }));
  g.add(people([...scatter(12, [-17, -12, -34, 34], { seed: 4 }), ...scatter(12, [12, 17, -34, 34], { seed: 5 })].map(([x, z]) => [x, z, D]), { seed: 4 }));
  g.add(trees([...along(7, [-40, -45], [-40, 45]), ...along(7, [40, -45], [40, 45])], { kind: 'neem', seed: 6, y: D }));
  g.add(shrubs([...along(10, [-22, -36], [-22, 36]), ...along(10, [22, -36], [22, 36])].map(([x, z]) => [x, z, 1]), { y: D, seed: 7 }));
  g.add(asiBoard('Rani-ki-Vav, Patan', 14, 44, 0, { y: D, line2: 'WORLD HERITAGE SITE' }));
}

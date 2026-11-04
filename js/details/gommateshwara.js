import { trees, shrubs, asiBoard, scatter } from './realism.js';

// Gommateshwara at Shravanabelagola: scrub on the bare granite of the Vindhyagiri, coconut palms
// and tamarinds in the town fields below, and the ASI board at the foot of the steps.
export function addDetails(f, g) {
  const H = 40;
  const rock = scatter(30, [-75, 75, -75, 75], { seed: 5, gap: 7 }).filter(([x, z]) => { const r = Math.hypot(x, z); return r > 26 && r < 72 && Math.abs(x) > 4; });
  g.add(shrubs(rock.map(([x, z]) => [x, z, 2, H * Math.sqrt(Math.max(0, 1 - (Math.hypot(x, z) / 80) ** 2)) - 0.3]), { dry: true, seed: 5 }));
  g.add(trees(scatter(30, [-145, 145, -145, 145], { seed: 6, gap: 14 }).filter(([x, z]) => Math.hypot(x, z) > 88), { kind: 'palm', seed: 6 }));
  g.add(asiBoard('Gommateshwara, Shravanabelagola', 6, 82, 0));
}

import { trees, shrubs, people, asiBoard, scatter } from './realism.js';

// Gommateshwara at Shravanabelagola: Jain pilgrims climbing the steps cut into the Vindhyagiri and
// gathered before the statue, scrub on the bare granite of the hill, coconut palms and tamarinds
// in the town fields below, and the ASI board at the foot of the steps.
export function addDetails(f, g) {
  const H = 40, climb = [];
  for (let k = 1; k < 24; k += 1.4) climb.push([(Math.sin(k * 2.1) * 1.6), 77 - Math.round(k) * 2.6, Math.round(k) * 1.6 + 1]);
  g.add(people(climb, { seed: 3, face: Math.PI, palette: ['#f4f1ea', '#f7f7f7', '#f2d23a', '#f08a1c', '#d9342b'] }));
  f.add(people(scatter(24, [-15, 15, 0, 15], { seed: 4, avoid: [[-6, 6, -8, 4]] }).map(([x, z]) => [x, z, H]), { seed: 4, palette: ['#f4f1ea', '#f7f7f7', '#f2d23a', '#f08a1c'] }));
  const rock = scatter(30, [-75, 75, -75, 75], { seed: 5, gap: 7 }).filter(([x, z]) => { const r = Math.hypot(x, z); return r > 26 && r < 72 && Math.abs(x) > 4; });
  g.add(shrubs(rock.map(([x, z]) => [x, z, 2, H * Math.sqrt(Math.max(0, 1 - (Math.hypot(x, z) / 80) ** 2)) - 0.3]), { dry: true, seed: 5 }));
  g.add(trees(scatter(30, [-145, 145, -145, 145], { seed: 6, gap: 14 }).filter(([x, z]) => Math.hypot(x, z) > 88), { kind: 'palm', seed: 6 }));
  g.add(asiBoard('Gommateshwara, Shravanabelagola', 6, 82, 0));
}

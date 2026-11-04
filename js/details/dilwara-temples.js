import { trees, people, scatter } from './realism.js';

// The Dilwara temples on Mount Abu: Jain pilgrims, mostly in white, in the courtyard and at the
// gate; the mango and jamun woods of the Aravalli round the plain outer walls.
export function addDetails(f, g) {
  f.add(people(scatter(26, [-20, 20, -30, 30], { seed: 3, avoid: [[-6, 6, -22, 18], [-9, 9, 0, 18]] }).map(([x, z]) => [x, z, 1.5]), { seed: 3, palette: ['#f4f1ea', '#f7f7f7', '#f2d23a', '#e8e2d2', '#d9342b'] }));
  g.add(people(scatter(12, [-10, 10, 37, 55], { seed: 4 }), { seed: 4, palette: ['#f4f1ea', '#f7f7f7', '#f2d23a', '#d9342b'] }));
  g.add(trees(scatter(30, [-62, 62, -68, 68], { seed: 5, gap: 10, avoid: [[-30, 30, -42, 42], [-8, 8, 30, 70]] }), { kind: 'mango', seed: 5 }));
}

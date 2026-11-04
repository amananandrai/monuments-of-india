import { trees, scatter } from './realism.js';

// The Dilwara temples on Mount Abu: the mango and jamun woods of the Aravalli round the plain outer
// walls.
export function addDetails(f, g) {
  g.add(trees(scatter(30, [-62, 62, -68, 68], { seed: 5, gap: 10, avoid: [[-30, 30, -42, 42], [-8, 8, 30, 70]] }), { kind: 'mango', seed: 5 }));
}

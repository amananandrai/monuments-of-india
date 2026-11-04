import { trees, people, scatter } from './realism.js';

// The Chaumukha temple at Ranakpur, in a valley of the Aravalli: Jain pilgrims in white at its
// four doors and on its steps, and the wooded hills round it.
export function addDetails(f, g) {
  f.add(people(scatter(40, [-45, 45, -45, 45], { seed: 3 }).filter(([x, z]) => Math.max(Math.abs(x), Math.abs(z)) > 34), { seed: 3, palette: ['#f4f1ea', '#f7f7f7', '#f2d23a', '#d9342b', '#f4f1ea'] }));
  g.add(trees(scatter(50, [-74, 74, -74, 74], { seed: 4, gap: 10 }).filter(([x, z]) => Math.max(Math.abs(x), Math.abs(z)) > 50), { kind: 'mango', seed: 4 }));
}

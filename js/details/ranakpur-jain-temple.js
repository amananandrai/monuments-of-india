import { trees, scatter } from './realism.js';

// The Chaumukha temple at Ranakpur, in a valley of the Aravalli: the wooded hills round it.
export function addDetails(f, g) {
  g.add(trees(scatter(50, [-74, 74, -74, 74], { seed: 4, gap: 10 }).filter(([x, z]) => Math.max(Math.abs(x), Math.abs(z)) > 50), { kind: 'mango', seed: 4 }));
}

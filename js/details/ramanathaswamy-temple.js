import { trees, stalls, scatter, along } from './realism.js';

// Ramanathaswamy at Rameswaram: flower stalls at the east gate, and coconut palms on the island.
export function addDetails(f, g) {
  g.add(stalls([...along(5, [-22, 102], [-22, 124]).map(([x, z]) => [x, z, Math.PI / 2]), ...along(5, [22, 102], [22, 124]).map(([x, z]) => [x, z, -Math.PI / 2])]));
  g.add(trees(scatter(40, [-155, 155, -145, 140], { seed: 5, gap: 12 }).filter(([x, z]) => Math.abs(x) > 76 || Math.abs(z) > 100), { kind: 'palm', seed: 5 }));
}

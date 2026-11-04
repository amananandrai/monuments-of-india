import { trees, people, PILGRIMS, stalls, scatter, along } from './realism.js';

// Ramanathaswamy at Rameswaram: pilgrims bathing in the sea at Agni Theertham before they enter,
// crowds in the courts and the pillared corridors, flower stalls at the east gate, and coconut
// palms on the island.
export function addDetails(f, g) {
  g.add(people(scatter(50, [-120, 120, 150, 166], { seed: 3 }).map(([x, z]) => [x, z, z > 156 ? -0.4 : 0.5]), { seed: 3, palette: [...PILGRIMS, '#2f5d9a', '#e26a9c'] }));
  f.add(people(scatter(90, [-66, 66, -90, 90], { seed: 4, avoid: [[-30, 30, -30, 2]] }), { seed: 4, palette: PILGRIMS }));
  g.add(stalls([...along(5, [-22, 102], [-22, 124]).map(([x, z]) => [x, z, Math.PI / 2]), ...along(5, [22, 102], [22, 124]).map(([x, z]) => [x, z, -Math.PI / 2])]));
  g.add(trees(scatter(40, [-155, 155, -145, 140], { seed: 5, gap: 12 }).filter(([x, z]) => Math.abs(x) > 76 || Math.abs(z) > 100), { kind: 'palm', seed: 5 }));
}

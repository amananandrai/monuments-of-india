import { at, flag, mat } from '../helpers.js';
import { trees, people, PILGRIMS, stalls, scatter, along } from './realism.js';

// Mallikarjuna at Srisailam, in the Nallamala forest: pilgrims in the court and at the gopurams,
// flower stalls outside the east gate, saffron flags on the walls, and the forest of the hills
// coming down to the temple town.
const SAFFRON = mat('#f08a1c', 0.8, 0, { side: 2 });
export function addDetails(f, g) {
  f.add(people(scatter(60, [-46, 46, -56, 56], { seed: 3, avoid: [[-12, 12, -40, 30]] }), { seed: 3, palette: PILGRIMS }));
  g.add(stalls([...along(6, [-24, 74], [-24, 96]).map(([x, z]) => [x, z, Math.PI / 2]), ...along(6, [24, 74], [24, 96]).map(([x, z]) => [x, z, -Math.PI / 2])]));
  g.add(people(scatter(26, [-18, 18, 64, 105], { seed: 4 }), { seed: 4, palette: PILGRIMS }));
  for (const [x, z] of [[-50, -60], [50, -60], [-50, 60], [50, 60]]) f.add(at(flag(6, SAFFRON), x, 9, z));
  g.add(trees(scatter(60, [-108, 108, -108, 108], { seed: 5, gap: 12 }).filter(([x, z]) => Math.abs(x) > 62 || Math.abs(z) > 72), { kind: 'mango', seed: 5 }));
}

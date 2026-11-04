import { at, flag, mat } from '../helpers.js';
import { trees, stalls, scatter, along } from './realism.js';

// Mallikarjuna at Srisailam, in the Nallamala forest: flower stalls outside the east gate, saffron
// flags on the walls, and the forest of the hills coming down to the temple town.
const SAFFRON = mat('#f08a1c', 0.8, 0, { side: 2 });
export function addDetails(f, g) {
  g.add(stalls([...along(6, [-24, 74], [-24, 96]).map(([x, z]) => [x, z, Math.PI / 2]), ...along(6, [24, 74], [24, 96]).map(([x, z]) => [x, z, -Math.PI / 2])]));
  for (const [x, z] of [[-50, -60], [50, -60], [-50, 60], [50, 60]]) f.add(at(flag(6, SAFFRON), x, 9, z));
  g.add(trees(scatter(60, [-108, 108, -108, 108], { seed: 5, gap: 12 }).filter(([x, z]) => Math.abs(x) > 62 || Math.abs(z) > 72), { kind: 'mango', seed: 5 }));
}

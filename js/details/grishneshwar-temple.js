import { at, flag, mat } from '../helpers.js';
import { trees, garland, scatter } from './realism.js';

// Grishneshwar, near Ellora: saffron flags at the corners of the walled court, marigold garlands
// over the gateway, and neem trees in the village round the wall.
const SAFFRON = mat('#f08a1c', 0.8, 0, { side: 2 });
export function addDetails(f, g) {
  for (const [x, z] of [[-33, -38], [33, -38], [-33, 38], [33, 38]]) f.add(at(flag(7, SAFFRON), x, 4, z));
  f.add(garland([-8, 3.8, 41.2], [8, 3.8, 41.2], { sag: 0.8, strands: 2 }));
  g.add(trees(scatter(22, [-68, 68, -68, 68], { seed: 4, gap: 14 }).filter(([x, z]) => Math.abs(x) > 40 || Math.abs(z) > 45), { kind: 'neem', seed: 4 }));
}

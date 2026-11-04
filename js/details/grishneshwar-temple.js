import { at, flag, mat } from '../helpers.js';
import { trees, people, PILGRIMS, garland, scatter, along } from './realism.js';

// Grishneshwar, near Ellora: pilgrims in the walled court (men enter the sanctum bare-chested, in
// dhotis), saffron flags at the corners, marigold garlands over the gateway, and neem trees in the
// village round the wall.
const SAFFRON = mat('#f08a1c', 0.8, 0, { side: 2 });
export function addDetails(f, g) {
  f.add(people(scatter(34, [-33, 33, -38, 38], { seed: 3, avoid: [[-12, 12, -26, 16]] }), { seed: 3, palette: [...PILGRIMS, '#f4f1ea', '#f4f1ea'] }));
  for (const [x, z] of [[-33, -38], [33, -38], [-33, 38], [33, 38]]) f.add(at(flag(7, SAFFRON), x, 4, z));
  f.add(garland([-8, 3.8, 41.2], [8, 3.8, 41.2], { sag: 0.8, strands: 2 }));
  g.add(trees(scatter(22, [-68, 68, -68, 68], { seed: 4, gap: 14 }).filter(([x, z]) => Math.abs(x) > 40 || Math.abs(z) > 45), { kind: 'neem', seed: 4 }));
  g.add(people(scatter(14, [-20, 20, 42, 66], { seed: 5 }), { seed: 5, palette: PILGRIMS }));
}

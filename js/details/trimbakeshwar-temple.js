import { at, flag, mat } from '../helpers.js';
import { trees, stalls, garland, scatter, along } from './realism.js';

// Trimbakeshwar below the Brahmagiri hill, source of the Godavari: the stalls of the temple street,
// saffron flags, marigolds over the gateway, and trees on the lower slopes of the hill.
const SAFFRON = mat('#f08a1c', 0.8, 0, { side: 2 });
export function addDetails(f, g) {
  g.add(stalls([...along(6, [-16, 54], [-16, 90]).map(([x, z]) => [x, z, Math.PI / 2]), ...along(6, [16, 54], [16, 90]).map(([x, z]) => [x, z, -Math.PI / 2])]));
  for (const [x, z] of [[-38, -43], [38, -43], [-38, 43], [38, 43]]) f.add(at(flag(7, SAFFRON), x, 6, z));
  f.add(garland([-8, 9.4, 49.1], [8, 9.4, 49.1], { sag: 0.8, strands: 3 }));
  g.add(trees(scatter(30, [-95, 95, -100, -70], { seed: 5, gap: 10 }), { kind: 'mango', seed: 5 }));
}

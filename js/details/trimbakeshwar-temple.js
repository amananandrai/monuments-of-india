import { at, flag, mat } from '../helpers.js';
import { trees, people, PILGRIMS, stalls, garland, scatter, along } from './realism.js';

// Trimbakeshwar below the Brahmagiri hill, source of the Godavari: pilgrims in the court and at
// the gate, the stalls of the temple street, saffron flags, marigolds over the gateway, and trees
// on the lower slopes of the hill.
const SAFFRON = mat('#f08a1c', 0.8, 0, { side: 2 });
export function addDetails(f, g) {
  f.add(people(scatter(60, [-38, 38, -43, 43], { seed: 3, avoid: [[-12, 12, -36, 14]] }), { seed: 3, palette: PILGRIMS }));
  g.add(stalls([...along(6, [-16, 54], [-16, 90]).map(([x, z]) => [x, z, Math.PI / 2]), ...along(6, [16, 54], [16, 90]).map(([x, z]) => [x, z, -Math.PI / 2])]));
  g.add(people(scatter(40, [-12, 12, 50, 95], { seed: 4 }), { seed: 4, palette: PILGRIMS }));
  for (const [x, z] of [[-38, -43], [38, -43], [-38, 43], [38, 43]]) f.add(at(flag(7, SAFFRON), x, 6, z));
  f.add(garland([-8, 8.2, 49.1], [8, 8.2, 49.1], { sag: 0.8, strands: 3 }));
  g.add(trees(scatter(30, [-95, 95, -100, -70], { seed: 5, gap: 10 }), { kind: 'mango', seed: 5 }));
}

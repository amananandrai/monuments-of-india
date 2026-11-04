import { M, at, flag, mat } from '../helpers.js';
import { trees, people, PILGRIMS, lampPosts, scatter, along, around } from './realism.js';

// Baidyanath Dham at Deoghar: crowds of kanwariya pilgrims in saffron in the temple court (in the
// month of Shravan they carry Ganga water here from Sultanganj), saffron flags on the shrines, a
// sacred peepal tree, and lamps along the outer path.
const SAFFRON = mat('#f08a1c', 0.8, 0, { side: 2 });
export function addDetails(f, g) {
  f.add(people(scatter(60, [-46, 46, -46, 46], { seed: 3, avoid: [[-8, 8, -24, 6], [-36, -28, -34, 18], [28, 36, -34, 18], [-24, 24, -42, -34], [-24, 24, 26, 34]] }), { seed: 3, palette: PILGRIMS }));
  for (const [x, z] of [[-32, -30], [-32, -8], [-32, 14], [32, -30], [32, -8], [32, 14], [-16, -38], [16, -38], [-20, 30], [20, 30]]) f.add(at(flag(4, SAFFRON), x + 1.2, 9.5, z));
  f.add(trees([[-40, 40], [40, 40]], { kind: 'banyan', seed: 4, h: 12 }), trees([[-40, -42], [40, -42]], { kind: 'neem', seed: 5 }));
  g.add(lampPosts([...along(6, [-60, -60], [-60, 60]), ...along(6, [60, -60], [60, 60])]));
  g.add(people(scatter(18, [-68, 68, 52, 68], { seed: 6 }), { seed: 6, palette: PILGRIMS }));
}

import { M, box, at, flag, mat } from '../helpers.js';
import { trees, lampPosts, garland, along } from './realism.js';

// The Ram Mandir at Ayodhya: the paved parikrama round the plinth with lawns beyond it, saffron
// flags, lamps, and garlands on the entrance pavilion.
const SAFFRON = mat('#f08a1c', 0.8, 0, { side: 2 });
export function addDetails(g) {
  g.add(box(160, 0.2, 200, M.path, 0, -0.2, 0));
  for (const s of [-1, 1]) g.add(box(40, 0.3, 160, M.grass, s * 64, -0.15, 0));
  for (const [x, z] of [[-29, -46], [29, -46], [-29, 46], [29, 46]]) g.add(at(flag(8, SAFFRON), x, 6.5, z));
  g.add(lampPosts([...along(8, [-34, -60], [-34, 90]), ...along(8, [34, -60], [34, 90])]));
  g.add(trees([...along(8, [-82, -90], [-82, 90]), ...along(8, [82, -90], [82, 90])], { kind: 'ashoka', seed: 6 }));
  g.add(garland([-5, 13, 40.2], [5, 13, 40.2], { sag: 0.7, strands: 3 }));
}

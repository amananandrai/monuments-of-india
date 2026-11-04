import { at, flag, mat } from '../helpers.js';
import { people, PILGRIMS, garland, scatter } from './realism.js';
import { lamp } from './doorways.js';

// Bhimashankar: pilgrims in the paved court of the temple, saffron flags, marigold garlands strung
// between the posts of the bell frame, and oil lamps lit by the great bell.
const SAFFRON = mat('#f08a1c', 0.8, 0, { side: 2 });
export function addDetails(f, g) {
  f.add(people(scatter(28, [-19, 19, -21, 21], { seed: 3, avoid: [[-8, 8, -20, 12], [-13, -7, 6, 10]] }), { seed: 3, palette: PILGRIMS }));
  f.add(garland([-12, 5.4, 8.3], [-8, 5.4, 8.3], { sag: 0.6, strands: 2 }));
  for (const [x, z] of [[-18, -20], [18, -20], [-18, 20], [18, 20]]) f.add(at(flag(6, SAFFRON), x, 0, z));
  for (const x of [-11, -9]) f.add(at(lamp(1.4), x, 0.4, 10.5));
  g.add(people(scatter(14, [-40, 40, 22, 60], { seed: 4 }), { seed: 4, palette: PILGRIMS }));
}

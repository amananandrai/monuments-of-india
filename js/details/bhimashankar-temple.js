import { at, flag, mat } from '../helpers.js';
import { garland } from './realism.js';
import { lamp } from './doorways.js';

// Bhimashankar: saffron flags, marigold garlands strung between the posts of the bell frame, and
// oil lamps lit by the great bell.
const SAFFRON = mat('#f08a1c', 0.8, 0, { side: 2 });
export function addDetails(f, g) {
  f.add(garland([-12.2, 6.6, 8.45], [-7.8, 6.6, 8.45], { sag: 0.6, strands: 2 }));
  for (const [x, z] of [[-18, -20], [18, -20], [-18, 20], [18, 20]]) f.add(at(flag(6, SAFFRON), x, 0, z));
  for (const x of [-11, -9]) f.add(at(lamp(1.4), x, 0.4, 10.5));
}

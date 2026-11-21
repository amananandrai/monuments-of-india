import { at, flag, mat } from '../helpers.js';
import { deepmala, nandiMandapa } from '../parts/temples.js';
import { garland } from '../parts/realism.js';
import { lamp } from '../parts/doorways.js';

// Bhimashankar, finer detail. Dimensions follow js/monuments/bhimashankar-temple.js: the temple at
// z = -8 with its stair down to about z = 13.6, the bell frame at x = -10, z = 8. On the axis before
// the stair the Nandi lies in a small open mandapa facing the sanctum, and across from the bell a
// deepmala of the same dark basalt. Then saffron flags, marigold garlands strung between the posts
// of the bell frame, and oil lamps lit by the great bell.
const SAFFRON = mat('#f08a1c', 0.8, 0, { side: 2 });
const BASALT = mat('#4f4a45', 0.85), SHADE = mat('#3b3734', 0.9);
export function addDetails(f, g) {
  f.add(at(nandiMandapa(5, 3.4, BASALT, SHADE, { nandiM: mat('#2f2c2a', 0.6) }), 0, 0, 18.5));
  f.add(at(deepmala(7.5, BASALT), 13.5, 0, 12));
  f.add(garland([-12.2, 6.6, 8.45], [-7.8, 6.6, 8.45], { sag: 0.6, strands: 2 }));
  for (const [x, z] of [[-18, -20], [18, -20], [-18, 20], [18, 20]]) f.add(at(flag(6, SAFFRON), x, 0, z));
  for (const x of [-11, -9]) f.add(at(lamp(1.4), x, 0.4, 10.5));
}

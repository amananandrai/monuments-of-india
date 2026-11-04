import { stalls, along } from './realism.js';

// The Jama Masjid in Old Delhi: the stalls of the bazaar that crowds the foot of its steps.
export function addDetails(f, g) {
  g.add(stalls([...along(8, [-80, 80], [-25, 80]).map(([x, z]) => [x, z, 0]), ...along(8, [25, 80], [80, 80]).map(([x, z]) => [x, z, 0])]));
}

import { at, flag, mat } from '../helpers.js';
import { people, PILGRIMS, lampPosts, garland, scatter, along } from './realism.js';

// Mahakaleshwar at Ujjain: crowds of devotees in the colonnaded court and at the Kot Tirtha tank,
// saffron flags along the colonnade, garlands on the gate, and lamps on the approach.
const SAFFRON = mat('#f08a1c', 0.8, 0, { side: 2 });
export function addDetails(f, g) {
  f.add(people(scatter(70, [-43, 43, -48, 48], { seed: 3, avoid: [[2, 18, -42, 6], [-42, -14, -26, -2]] }), { seed: 3, palette: PILGRIMS }));
  for (const x of [-30, -10, 10, 30]) f.add(at(flag(5, SAFFRON), x, 5.8, 50));
  g.add(lampPosts([...along(6, [-70, 56], [70, 56]), ...along(6, [-70, -56], [70, -56])]));
  g.add(people(scatter(20, [-60, 60, 52, 72], { seed: 4 }), { seed: 4, palette: PILGRIMS }));
  f.add(garland([-6, 4.6, 50.6], [6, 4.6, 50.6], { sag: 0.8, strands: 2 }));
}

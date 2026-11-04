import { at, flag, mat } from '../helpers.js';
import { people, PILGRIMS, lampPosts, scatter, along } from './realism.js';

// Somnath on the Arabian Sea: pilgrims in the court and along the sea wall by the Baan Stambh (the
// arrow pillar that marks no land between here and the South Pole), saffron flags, and the lamps of
// the promenade.
const SAFFRON = mat('#f08a1c', 0.8, 0, { side: 2 });
export function addDetails(f, g) {
  f.add(people(scatter(60, [-70, 70, -34, 75], { seed: 3, avoid: [[-16, 16, -32, 30]] }), { seed: 3, palette: PILGRIMS }));
  f.add(people(scatter(26, [-54, 54, -36.5, -35.2], { seed: 4 }).map(([x, z]) => [x, z, 3]), { seed: 4, palette: PILGRIMS, face: Math.PI }));
  g.add(lampPosts(along(10, [-54, -35.6], [54, -35.6]), { y: 3 }));
  for (const x of [-40, -20, 20, 40]) f.add(at(flag(6, SAFFRON), x, 0, 40));
}

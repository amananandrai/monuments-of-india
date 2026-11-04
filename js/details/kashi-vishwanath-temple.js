import { rng } from '../helpers.js';
import { people, PILGRIMS, umbrellas, boats, scatter, along } from './realism.js';

// The Kashi Vishwanath corridor at Varanasi: the ghat steps down to the Ganga crowded with pilgrims
// and bathers, the cane umbrellas the priests sit under, boats of every size on the river, and
// devotees in the temple court.
export function addDetails(f, g) {
  const R = rng(5), ghat = [];
  for (let k = 0; k < 9; k++) for (let i = 0; i < 9; i++) ghat.push([-56 + R() * 112, 78 + k * 3 + R() * 2.2, 9 - k + 0.02]);
  g.add(people(ghat, { seed: 3, palette: [...PILGRIMS, '#f4f1ea', '#f4f1ea', '#2f5d9a', '#e26a9c'] }));
  g.add(umbrellas([...along(9, [-52, 95], [52, 95]), ...along(6, [-40, 89], [40, 89])].map(([x, z], i) => [x + (i % 2) * 2, z]), { y: 9 - Math.round((95 - 78) / 3) }));
  const fleet = [];
  for (let i = 0; i < 26; i++) fleet.push([-280 + R() * 560, 112 + R() * 120, R() * 6.28]);
  g.add(boats(fleet, { y: 0.3, size: 1.7, canopy: false, colours: ['#2f5d9a', '#f2d23a', '#c2512a', '#3c8a5a', '#f4f1ea'] }));
  g.add(boats(along(6, [-50, 108], [50, 108]).map(([x, z], i) => [x, z, Math.PI / 2 + i * 0.1]), { y: 0.3, size: 1.5 }));
  f.add(people(scatter(44, [-26, 26, -6, 74], { seed: 6, avoid: [[-12, 12, -40, -14]] }).map(([x, z]) => [x, z, 9]), { seed: 6, palette: PILGRIMS }));
}

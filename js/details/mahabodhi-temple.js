import { people, MONKS, prayerFlags, scatter, around } from './realism.js';
import { lamp } from './doorways.js';
import { at } from '../helpers.js';

// The Mahabodhi Temple at Bodh Gaya: monks and pilgrims from every Buddhist country walking round
// the temple and sitting under the Bodhi tree, prayer flags strung across the courtyard, and butter
// lamps lit on the steps.
export function addDetails(f, g) {
  f.add(people(around(28, 21, 0, 0, 0.1), { seed: 3, palette: [...MONKS, '#f4f1ea', '#8a8a8a', '#f2d23a'] }));
  f.add(people(scatter(20, [-14, 14, -36, -20], { seed: 4, avoid: [[-3, 3, -31, -25]] }), { seed: 4, palette: MONKS }));
  for (const [a, b] of [[[0, 30, 0], [-18, 2.6, -18]], [[0, 30, 0], [18, 2.6, -18]], [[0, 30, 0], [-18, 2.6, 18]], [[0, 30, 0], [18, 2.6, 18]], [[-18, 2.6, -18], [0, 18, -28]], [[18, 2.6, -18], [0, 18, -28]]]) f.add(prayerFlags(a, b, { sag: 2, size: 0.45 }));
  for (let k = 0; k < 6; k++) f.add(at(lamp(0.9), -2.2 + k * 0.9, 5, 13.6));
}

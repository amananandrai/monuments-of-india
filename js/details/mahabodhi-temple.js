import { prayerFlags } from './realism.js';
import { lamp } from './doorways.js';
import { at } from '../helpers.js';

// The Mahabodhi Temple at Bodh Gaya: prayer flags strung across the courtyard, and butter lamps lit
// on the steps.
export function addDetails(f, g) {
  for (const [a, b] of [[[0, 30, 0], [-18, 2.6, -18]], [[0, 30, 0], [18, 2.6, -18]], [[0, 30, 0], [-18, 2.6, 18]], [[0, 30, 0], [18, 2.6, 18]], [[-18, 2.6, -18], [0, 18, -28]], [[18, 2.6, -18], [0, 18, -28]]]) f.add(prayerFlags(a, b, { sag: 2, size: 0.45 }));
  for (let k = 0; k < 6; k++) f.add(at(lamp(0.9), -2.2 + k * 0.9, 5, 13.6));
}

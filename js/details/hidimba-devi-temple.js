import { garland } from './realism.js';
import { yaks } from './animals.js';

// The Hidimba Devi temple in the deodar wood above Manali: yaks in the clearing, and marigolds over
// the carved door.
export function addDetails(f, g) {
  f.add(yaks([[13, 16, -0.8], [-14, 18, 0.6]]));
  f.add(garland([-1.4, 5.1, 7.2], [1.4, 5.1, 7.2], { sag: 0.4, strands: 2 }));
}

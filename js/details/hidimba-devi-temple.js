import { mat } from '../helpers.js';
import { people, garland, scatter } from './realism.js';
import { yaks } from './animals.js';

// The Hidimba Devi temple in the deodar wood above Manali: visitors in warm clothes in the
// clearing, the yaks that wait to be photographed with them, and marigolds over the carved door.
export function addDetails(f, g) {
  f.add(people(scatter(26, [-20, 20, -14, 26], { seed: 3, avoid: [[-9, 9, -10, 13]] }), { seed: 3, palette: ['#b3262e', '#2f5d9a', '#1f2d3d', '#e26a9c', '#3c8a5a', '#f2d23a', '#6b5a48'] }));
  f.add(yaks([[13, 16, -0.8], [-14, 18, 0.6]]));
  f.add(garland([-1.4, 5.1, 7.2], [1.4, 5.1, 7.2], { sag: 0.4, strands: 2 }));
}

import { mat, box, cyl, at } from '../helpers.js';
import { garland } from './realism.js';

// The Jagannath temple at Puri: the Aruna Stambha, the sixteen-sided pillar crowned by Aruna,
// charioteer of the Sun, that stands before the Lion Gate (brought from Konark); and garlands over
// the gate.
const STONE = mat('#5a544c', 0.75);
export function addDetails(f, g) {
  g.add(box(4, 1.5, 4, STONE, 0, 0, 74), cyl(0.85, 1, 10, STONE, 0, 1.5, 74, 16), cyl(1.3, 0.8, 1.2, STONE, 0, 11.5, 74, 16));
  g.add(cyl(0.45, 0.5, 1.2, STONE, 0, 12.7, 74, 10), at(cyl(0.38, 0.45, 0.4, STONE, 0, 0, 0, 10), 0, 13.9, 74.15));
  g.add(garland([-3.4, 6.6, 64.3], [3.4, 6.6, 64.3], { sag: 0.6, strands: 3 }));
}

import { mat, box, cyl, at } from '../helpers.js';
import { people, PILGRIMS, garland, scatter } from './realism.js';

// The Jagannath temple at Puri: the Aruna Stambha, the sixteen-sided pillar crowned by Aruna,
// charioteer of the Sun, that stands before the Lion Gate (brought from Konark); crowds of
// pilgrims on the Bada Danda outside and in the court; garlands over the gate.
const STONE = mat('#5a544c', 0.75);
export function addDetails(f, g) {
  g.add(box(4, 1.5, 4, STONE, 0, 0, 74), cyl(0.85, 1, 10, STONE, 0, 1.5, 74, 16), cyl(1.3, 0.8, 1.2, STONE, 0, 11.5, 74, 16));
  g.add(cyl(0.45, 0.5, 1.2, STONE, 0, 12.7, 74, 10), at(cyl(0.38, 0.45, 0.4, STONE, 0, 0, 0, 10), 0, 13.9, 74.15));
  g.add(people(scatter(70, [-60, 60, 68, 130], { seed: 3, avoid: [[-3, 3, 71, 77]] }), { seed: 3, palette: [...PILGRIMS, '#f4f1ea', '#f4f1ea', '#d9342b', '#2f5d9a'] }));
  f.add(people(scatter(44, [-42, 42, -56, 56], { seed: 4, avoid: [[-16, 16, -44, 42]] }).map(([x, z]) => [x, z, 1.2]), { seed: 4, palette: PILGRIMS }));
  g.add(garland([-3.4, 6.6, 64.3], [3.4, 6.6, 64.3], { sag: 0.6, strands: 3 }));
}

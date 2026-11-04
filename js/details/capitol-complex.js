import { M, box } from '../helpers.js';
import { trees, along } from './realism.js';

// Le Corbusier's Capitol Complex at Chandigarh: the shallow reflecting pools in front of the Palace
// of Assembly, and the rows of trees planted along the edges of the great concrete esplanade.
export function addDetails(f, g) {
  g.add(box(70, 0.35, 14, M.water, 0, 0, 62), box(14, 0.35, 40, M.water, 60, 0, 120));
  g.add(trees([...along(14, [-230, 220], [230, 220]), ...along(10, [-230, -140], [-230, 200]), ...along(10, [230, -140], [230, 200])], { kind: 'mango', seed: 5 }));
}

import { M, box } from '../helpers.js';
import { trees, people, scatter, along } from './realism.js';

// Le Corbusier's Capitol Complex at Chandigarh: people crossing the great concrete esplanade
// between the buildings and round the Open Hand, the shallow reflecting pools in front of the
// Palace of Assembly, and the rows of trees planted along the edges of the plaza.
export function addDetails(f, g) {
  g.add(box(70, 0.35, 14, M.water, 0, 0, 62), box(14, 0.35, 40, M.water, 60, 0, 120));
  g.add(people([...scatter(40, [-200, 200, -40, 160], { seed: 3, gap: 4, avoid: [[-36, 36, -36, 50], [-190, 70, -100, -78], [10, 110, 160, 200]] }), ...scatter(10, [-160, -140, 110, 130], { seed: 4 })], { seed: 3 }));
  g.add(trees([...along(14, [-230, 220], [230, 220]), ...along(10, [-230, -140], [-230, 200]), ...along(10, [230, -140], [230, 200])], { kind: 'mango', seed: 5 }));
}

import { mat, box, cyl, at } from '../helpers.js';
import { trees, people, PILGRIMS, garland, asiBoard, scatter, along } from './realism.js';
import { lamp } from './doorways.js';

// The Chennakesava temple at Belur: the tall stone lamp pillar (deepa stambha) that stands in the
// court without being fixed to its base, devotees round the star-shaped platform, marigolds over
// the hall's doorway, coconut palms outside the cloister, and the ASI board at the gate.
const SOAP = mat('#8f877b', 0.85), SOAP_DARK = mat('#6f685e', 0.85);
export function addDetails(f, g) {
  const p = [-12, 24];
  f.add(box(3.2, 1, 3.2, SOAP_DARK, p[0], 0, p[1]), box(2.4, 1.2, 2.4, SOAP, p[0], 1, p[1]), cyl(0.55, 0.7, 11, SOAP, p[0], 2.2, p[1], 16));
  f.add(cyl(1.1, 0.6, 0.8, SOAP_DARK, p[0], 13.2, p[1], 16), box(1.6, 1.2, 1.6, SOAP, p[0], 14, p[1]), cyl(0, 0.9, 1.6, SOAP_DARK, p[0], 15.2, p[1], 4));
  f.add(garland([-1.4, 5.5, 15.1], [1.4, 5.5, 15.1], { sag: 0.4, strands: 2 }));
  for (const x of [-2.2, 2.2]) f.add(at(lamp(1.3), x, 1.8, 16.2));
  f.add(people(scatter(34, [-27, 27, -30, 33], { seed: 3, avoid: [[-15, 15, -10, 18], [-5, 5, 17, 22], [-16, -8, 20, 28]] }), { seed: 3, palette: [...PILGRIMS, '#f4f1ea', '#2f5d9a', '#b3262e'] }));
  g.add(trees([...along(8, [-48, -55], [-48, 55]), ...along(8, [48, -55], [48, 55]), ...along(6, [-40, -52], [40, -52])], { kind: 'palm', seed: 4 }));
  g.add(asiBoard('Chennakesava Temple, Belur', 12, 44, 0));
}

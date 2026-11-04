import { mat, at, tricolour } from '../helpers.js';
import { trees, people, lampPosts, along } from './realism.js';
import { horse } from './animals.js';

// Rashtrapati Bhavan: the tricolour on the dome, the President's Bodyguard drawn up on horseback in
// scarlet before the forecourt, sentries at the steps, lamps and trees along the avenue to the
// Jaipur Column, and visitors.
const BAY = mat('#5a3a26', 0.85);
export function addDetails(f, g) {
  f.add(at(tricolour(10), 0, 45.6, 0));
  for (let k = 0; k < 8; k++) {
    const x = -28 + k * 8, h = horse(BAY);
    h.scale.setScalar(0.42);
    h.position.set(x, 0, 64);
    g.add(h);
  }
  g.add(people(along(8, [-28, 64.9], [28, 64.9]).map(([x, z]) => [x, z, 1.4]), { seed: 3, palette: ['#c4262e'], face: 0 }));
  g.add(people([[-30, 52], [30, 52], [-10, 52], [10, 52]], { seed: 4, palette: ['#c4262e'], face: 0 }));
  g.add(trees([...along(8, [-38, 70], [-38, 200]), ...along(8, [38, 70], [38, 200])], { kind: 'neem', seed: 5 }));
  g.add(lampPosts([...along(8, [-20, 70], [-20, 200]), ...along(8, [20, 70], [20, 200])]));
  g.add(people([[-6, 140], [4, 150], [-3, 160], [8, 175], [-10, 185], [2, 195]], { seed: 6 }));
}

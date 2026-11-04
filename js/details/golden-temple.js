import { mat, box, cyl, at } from '../helpers.js';
import { trees, lampPosts } from './realism.js';

// Harmandir Sahib: the two Nishan Sahibs, tall saffron-clad poles with their saffron pennants and
// the khanda, by the Akal Takht; the old ber trees at the water's edge; and the golden lanterns
// along the marble parikrama.
const SAFFRON = mat('#f08a1c', 0.8, 0, { side: 2 }), GOLD = mat('#e3b54a', 0.3, 0.85);
export function addDetails(f, g) {
  // The Nishan Sahibs
  for (const z of [-6, 6]) {
    g.add(cyl(0.35, 0.45, 32, SAFFRON, -96, 0.8, z, 10), at(cyl(0.25, 0, 1.6, GOLD, 0, 0, 0, 10), -96, 32.8, z));
    const p = box(0.06, 3, 7, SAFFRON, 0, 0, 0);
    p.position.set(-96, 29.5, z + 3.6);
    g.add(p, box(0.1, 1, 1, GOLD, -96, 30.2, z + 1.2));
  }
  g.add(trees([[60, -72], [-70, 70], [72, 68]], { kind: 'mango', seed: 8, h: 9, y: 0.8 }));
  const lamps = [];
  for (let t = -72; t <= 72; t += 18) lamps.push([t, -76], [t, 76], [-76, t], [76, t]);
  g.add(lampPosts(lamps, { y: 0.8, h: 3.6 }));
}

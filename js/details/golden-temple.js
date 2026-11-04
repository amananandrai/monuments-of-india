import { mat, box, cyl, at } from '../helpers.js';
import { trees, people, lampPosts, scatter, along } from './realism.js';

// Harmandir Sahib: devotees walking the marble parikrama round the Amrit Sarovar and crossing the
// causeway, almost all with their heads covered; the two Nishan Sahibs, tall saffron-clad poles
// with their saffron pennants and the khanda, by the Akal Takht; the old ber trees at the
// water's edge; and the golden lanterns along the walk.
const SAFFRON = mat('#f08a1c', 0.8, 0, { side: 2 }), GOLD = mat('#e3b54a', 0.3, 0.85);
const DEVOTEES = ['#f4f1ea', '#f7f7f7', '#f08a1c', '#2f5d9a', '#e26a9c', '#d9342b', '#f2d23a', '#1f2d3d', '#3c8a5a'];
export function addDetails(f, g) {
  const walk = [];
  for (const s of [-1, 1]) {
    walk.push(...scatter(28, [-98, 98, s * 80 - 6, s * 80 + 6], { seed: s + 3 }));
    walk.push(...scatter(22, [s * 80 - 6, s * 80 + 6, -74, 74], { seed: s + 5 }));
  }
  g.add(people(walk.map(([x, z]) => [x, z, 0.8]), { seed: 3, palette: DEVOTEES }));
  f.add(people(scatter(26, [-74, -14, -2.2, 2.2], { seed: 7 }).map(([x, z]) => [x, z, 1.6]), { seed: 7, palette: DEVOTEES }));
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

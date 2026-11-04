import { at, flag, mat, rng } from '../helpers.js';
import { trees, shrubs, people, scatter } from './realism.js';

// Mehrangarh above Jodhpur: the rhyolite scrub of the Rao Jodha desert park on the hill, visitors
// along the ramparts and at the Loha Pol, and the five-coloured flag of Marwar over the palace.
const FLAG = mat('#d9342b', 0.8, 0, { side: 2 });
export function addDetails(f, g) {
  const H = 45, R = rng(4), slope = [];
  for (let i = 0; i < 70; i++) {
    const a = R() * Math.PI * 2, t = 0.15 + R() * 0.75, r = 130 - 60 * t, x = Math.cos(a) * r, z = Math.sin(a) * r * 0.5;
    if (Math.abs(x) < 70 && z > 10) continue;
    slope.push([x, z, 2.2, t * H - 0.4]);
  }
  g.add(shrubs(slope, { dry: true, seed: 5 }));
  f.add(people(scatter(26, [-62, 62, 22, 25], { seed: 6 }).map(([x, z]) => [x, z, H + 24]), { seed: 6 }));
  f.add(people(scatter(12, [8, 22, 30, 40], { seed: 7 }).map(([x, z]) => [x, z, H]), { seed: 7 }));
  f.add(at(flag(9, FLAG), 0, H + 38, 0));
}

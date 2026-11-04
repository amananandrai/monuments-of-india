import { at, flag, mat } from '../helpers.js';
import { trees, scatter } from './realism.js';

// Kamakhya on the Nilachal hill above Guwahati: the forest that covers the hill, and the red flags
// of the goddess on the temple terrace.
const RED = mat('#c62a2a', 0.8, 0, { side: 2 });
export function addDetails(f, g) {
  const T = 40, slope = scatter(90, [-145, 145, -145, 145], { seed: 3, gap: 11 }).filter(([x, z]) => { const r = Math.hypot(x, z); return r > 66 && r < 146; });
  for (const s of slope) s.push(T * (150 - Math.hypot(s[0], s[1])) / 90 - 0.6);
  // Each tree stands on the slope, at the hill's height where it grows.
  g.add(trees(slope.map(([x, z, y]) => [x, z, null, y]), { kind: 'mango', seed: 4, h: 9 }));
  for (const [x, z] of [[-30, -36], [30, -36], [-30, 36], [30, 36], [0, 46]]) f.add(at(flag(6, RED), x, T, z));
}

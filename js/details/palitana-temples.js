import { trees, scatter } from './realism.js';

// The Jain temple city on Shatrunjaya hill at Palitana: scrub and trees on the lower slopes below
// the 3,800 steps to the summit.
export function addDetails(f, g) {
  const H = 44, HILLS = [[-40, 1], [45, 0.85]];
  const ground = (x, z) => Math.max(0, ...HILLS.map(([hx, s]) => { const d = Math.hypot(x - hx, z / 0.7), rb = 120 * s, rt = 42 * s; return d <= rt ? H : d >= rb ? 0 : (H * (rb - d)) / (rb - rt); }));
  for (let k = 0; k < 30; k += 1) { const x = 60 - k * 1.2 + Math.sin(k * 0.6) * 10, z = 80 - k * 2.2;  }
  const slope = scatter(80, [-160, 160, -100, 100], { seed: 5, gap: 9 }).map(([x, z]) => [x, z, ground(x, z)]).filter(([, , y]) => y > 1 && y < H - 6);
  g.add(trees(slope.map(([x, z, y]) => [x, z, null, y - 0.5]), { kind: 'mango', seed: 6, h: 6 }));
}

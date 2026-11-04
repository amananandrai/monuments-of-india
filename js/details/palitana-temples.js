import { trees, people, scatter } from './realism.js';

// The Jain temple city on Shatrunjaya hill at Palitana: pilgrims in white climbing the 3,800
// steps (many before dawn, some carried in dolis), and in the temple courts on the summit; scrub
// and trees on the lower slopes.
export function addDetails(f, g) {
  const H = 44, HILLS = [[-40, 1], [45, 0.85]];
  const ground = (x, z) => Math.max(0, ...HILLS.map(([hx, s]) => { const d = Math.hypot(x - hx, z / 0.7), rb = 120 * s, rt = 42 * s; return d <= rt ? H : d >= rb ? 0 : (H * (rb - d)) / (rb - rt); }));
  const climb = [];
  for (let k = 0; k < 30; k += 1) { const x = 60 - k * 1.2 + Math.sin(k * 0.6) * 10, z = 80 - k * 2.2; climb.push([x + Math.sin(k * 3.1), z, ground(x, z) + 0.3]); }
  g.add(people(climb, { seed: 3, face: Math.PI, palette: ['#f4f1ea', '#f7f7f7', '#f2d23a', '#d9342b', '#f4f1ea'] }));
  f.add(people(scatter(60, [-75, 75, -25, 25], { seed: 4 }).filter(([x, z]) => HILLS.some(([hx, s]) => Math.hypot(x - hx, z / 0.7) < 34 * s)).map(([x, z]) => [x, z, H + 0.4]), { seed: 4, palette: ['#f4f1ea', '#f7f7f7', '#f2d23a', '#f4f1ea'] }));
  const slope = scatter(80, [-160, 160, -100, 100], { seed: 5, gap: 9 }).map(([x, z]) => [x, z, ground(x, z)]).filter(([, , y]) => y > 1 && y < H - 6);
  g.add(trees(slope.map(([x, z, y]) => [x, z, null, y - 0.5]), { kind: 'mango', seed: 6, h: 6 }));
}

import { trees, scatter } from './realism.js';
import { shatrunjaya } from '../monuments/palitana-temples.js';

// The Jain temple city on Shatrunjaya hill at Palitana: scrub and trees on the lower slopes below
// the 3,800 steps to the summit, and none on the pilgrim stair (x -54 to -26, z 30 to 96, from
// js/monuments/palitana-temples.js).
export function addDetails(f, g) {
  const H = 44, ground = (x, z) => Math.max(0, shatrunjaya(x, z));
  const slope = scatter(80, [-160, 160, -100, 100], { seed: 5, gap: 9 }).map(([x, z]) => [x, z, ground(x, z)]).filter(([x, z, y]) => y > 1 && y < H - 6 && !(x > -56 && x < -24 && z > 26 && z < 100));
  g.add(trees(slope.map(([x, z, y]) => [x, z, null, y - 0.5]), { kind: 'dhok', seed: 6, h: 4 }));
}

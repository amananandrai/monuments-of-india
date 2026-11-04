import { trees, people, scatter } from './realism.js';

// Shikharji in the Parasnath hills: Jain pilgrims in white climbing the 27 km path to the summit
// shrines (and gathered among them on the ridge), and the forest that covers the hills.
export function addDetails(f, g) {
  const H = 90, L = 200, climb = [];
  for (let k = 1; k < 40; k += 1.5) { const kk = Math.round(k); climb.push([90 - kk * 2 + Math.sin(kk * 0.4) * 15, 90 - kk * 2, kk * (H / 40) + 0.6]); }
  g.add(people(climb, { seed: 3, palette: ['#f4f1ea', '#f7f7f7', '#f2d23a', '#d9342b'] }));
  f.add(people(scatter(40, [-90, 90, -14, 14], { seed: 4 }).map(([x, z]) => [x, z, H + 0.4]), { seed: 4, palette: ['#f4f1ea', '#f7f7f7', '#f2d23a'] }));
  // The forest on the ridge: the hill narrows from 160 × 96 at its foot to 100 × 60 at the top.
  const slope = [];
  for (let i = 0; i < 110; i++) {
    const t = 0.1 + ((i * 37) % 100) / 115, a = (i * 2.399) % (Math.PI * 2), rx = 160 - 60 * t, rz = 96 - 36 * t;
    slope.push([Math.cos(a) * rx * 0.98, Math.sin(a) * rz * 0.98, null, t * H - 0.5]);
  }
  g.add(trees(slope, { kind: 'mango', seed: 5, h: 10 }));
}

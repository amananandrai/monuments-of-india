import * as THREE from 'three';
import { M, box, at } from '../helpers.js';
import { heightField, fbm, smooth, mountainRing } from '../parts/terrain.js';
import { arcadeSkin } from '../parts/mughal.js';
import { mergeByMaterial } from '../parts/components.js';
import { trees, lampPosts, scatter, townHouses } from '../parts/realism.js';
import { detail } from '../detail.js';
import { nishanSahib } from '../parts/sikh.js';

// The height of the levelled hilltop on which Keshgarh Sahib stands.
export const TOP = 16;
const FLAT = 46, STAIR = [42, 112];

// The hill: a level top FLAT out from the shrine, falling to the plain over some 60 m, with a
// straight cutting for the stair on the south (+z) side that runs evenly down from the top.
function hill(x, z) {
  const r = Math.max(Math.abs(x), Math.abs(z) * 0.9) + 8 * fbm(x, z, { scale: 0.02, octaves: 2 });
  let y = TOP * smooth(FLAT + 64, FLAT + 2, r) - 0.4 + 2.5 * fbm(x, z, { scale: 0.01, octaves: 3 }) * smooth(FLAT, FLAT + 30, r);
  if (Math.abs(x) < 9 && z > STAIR[0] - 2) {
    const ramp = TOP * (1 - Math.min(1, Math.max(0, (z - STAIR[0]) / (STAIR[1] - STAIR[0])))) - 0.5;
    y = THREE.MathUtils.lerp(y, ramp, smooth(9, 6, Math.abs(x)));
  }
  return Math.min(y, TOP - 0.1);
}

// Keshgarh Sahib's hill at Anandpur: the terrace with its white ranges and parapet, the long stair
// on the south, the town below and the Shivalik hills to the north.
export function addDetails(f, g) {
  g.add(heightField(900, 900, detail.low ? 120 : 180, hill, { rock: ['#9a8c74', '#a5977d'], cover: '#7c8a4e', steep: 0.7 }));
  // The terrace: marble paving with a parapet along its edge, and pilgrims' ranges along the back.
  const T = new THREE.Group();
  T.add(box(2 * FLAT, 0.4, 2 * FLAT, M.marble, 0, TOP - 0.3, 0));
  for (const s of [-1, 1]) T.add(box(2 * FLAT, 1.1, 0.5, M.marble, 0, TOP + 0.1, s * (FLAT - 0.25)), box(0.5, 1.1, 2 * FLAT, M.marble, s * (FLAT - 0.25), TOP + 0.1, 0));
  const range = (len, x, z, ry) => {
    const n = Math.floor(len / 4.8), cells = [];
    for (let k = 0; k < n; k++) cells.push([-len / 2 + (k + 0.5) * (len / n), 0.4, 2.8, 3.6, 'room']);
    const r = new THREE.Group();
    r.add(box(len, 5.5, 6, M.lime, 0, 0, -3.6), arcadeSkin(len, 5.5, cells, 0.6, M.lime, { trim: M.marble }), box(len, 0.4, 1, M.marble, 0, 5.5, 0));
    T.add(at(mergeByMaterial(r), x, TOP + 0.1, z).rotateY(ry));
  };
  range(70, 0, -FLAT + 8, 0);
  range(40, -FLAT + 8, -14, Math.PI / 2);
  range(40, FLAT - 8, -14, -Math.PI / 2);
  // The stair: a long flight of marble treads down the cutting, with a landing every twenty.
  const n = 84, run = STAIR[1] - STAIR[0], d = run / n;
  for (let k = 0; k < n; k++) {
    const top = TOP * (1 - (k + 0.5) / n);
    T.add(box(7, top + 0.6, d + 0.01, M.marble, 0, -0.5, STAIR[0] + (k + 0.5) * d));
  }
  for (const s of [-1, 1]) for (let k = 0; k < n; k += 6) { const top = TOP * (1 - (k + 3) / n); T.add(box(0.4, top + 1.5, d * 6, M.marbleShade, s * 3.7, -0.5, STAIR[0] + (k + 3) * d)); }
  g.add(mergeByMaterial(T));
  g.add(at(nishanSahib(30), -20, TOP + 0.1, 20), lampPosts([[-14, 30], [14, 30], [-30, 14], [30, 14]], { y: TOP + 0.1 }));
  g.add(trees([[-26, 30, 7], [26, 30, 7]], { kind: 'ashoka', seed: 2, y: TOP + 0.1 }));
  // Trees on the slopes; the town on the plain; the Shivaliks behind.
  const slope = scatter(70, [-150, 150, -150, 150], { seed: 7, gap: 10, avoid: [[-FLAT - 6, FLAT + 6, -FLAT - 6, FLAT + 6], [-12, 12, 40, 150]] });
  g.add(trees(slope.map(([x, z]) => [x, z, null, hill(x, z) - 0.2]), { kind: 'neem', seed: 7 }));
  const homes = [];
  for (const [x, z] of scatter(detail.low ? 50 : 110, [-260, 260, 90, 300], { seed: 11, gap: 16, avoid: [[-16, 16, 90, 300]] })) homes.push([x, z, 8 + (x * 7 % 4), 10, 2 + Math.abs(Math.round(z)) % 2, 0, hill(x, z) - 0.2]);
  g.add(townHouses(homes, { seed: 11, fine: false }));
  g.add(mountainRing({ inner: 380, outer: 900, h: 200, size: 2600, cz: -200, snow: Infinity, rock: ['#7d7462', '#8a7f69'], cover: '#5f7240' }));
}

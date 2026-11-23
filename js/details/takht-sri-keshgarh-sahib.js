import * as THREE from 'three';
import { M, box, at, onFace, FACES, chhatri } from '../helpers.js';
import { heightField, fbm, smooth, mountainRing } from '../parts/terrain.js';
import { arcadeSkin, cellRow } from '../parts/mughal.js';
import { mergeByMaterial, merlons } from '../parts/components.js';
import { trees, lampPosts, scatter, townHouses } from '../parts/realism.js';
import { detail } from '../detail.js';
import { nishanSahib } from '../parts/sikh.js';

// The height of the levelled hilltop on which Keshgarh Sahib stands.
export const TOP = 16;
// The top terrace is FLAT out from the shrine and the lower one LOW; the lower terrace's floor is
// T1 high, and the natural mound they are built against HB.
const FLAT = 46, LOW = 56, T1 = 10, HB = 4, STAIR = [FLAT + 0.6, 116];

// The mound under the terraces, falling gently to the plain.
function hill(x, z) {
  const r = Math.max(Math.abs(x), Math.abs(z) * 0.9) + 8 * fbm(x, z, { scale: 0.02, octaves: 2 });
  const y = HB * smooth(LOW + 70, LOW + 6, r) - 0.4 + 2.5 * fbm(x, z, { scale: 0.01, octaves: 3 }) * smooth(LOW + 10, LOW + 40, r);
  return Math.min(y, HB + 1.5);
}

// A parapet of leaf-shaped merlons round a square terrace of half-width hw, at height y.
function parapet(hw, y, m) {
  const g = new THREE.Group(), w = detail.low ? 1.6 : 0.9;
  for (const a of FACES) g.add(onFace(box(2 * hw + 0.5, 0.6, 0.4, m, 0, y, 0), a, hw + 0.05), onFace(at(merlons(2 * hw, w, w * 1.1, 0.3, m), 0, y + 0.6, 0), a, hw + 0.05));
  return g;
}

// Keshgarh Sahib's hill at Anandpur, faced with built terraces as it is seen from the town: a lower
// tier of two rows of small white arches and an upper tier of taller ones, each under a parapet of
// leaf merlons with domed kiosks at the corners; the marble court on top with its ranges; the long
// stair on the south; the town below and the Shivalik hills to the north.
export function addDetails(f, g) {
  g.add(heightField(900, 900, detail.low ? 120 : 180, hill, { rock: ['#9a8c74', '#a5977d'], cover: '#7c8a4e', steep: 0.7 }));
  const T = new THREE.Group(), W = M.marble, L = M.lime, gate = [[-6, 6]];
  // The two tiers, and the arcades on their faces (left open where the stair comes down).
  T.add(box(2 * LOW, T1 - 0.3, 2 * LOW, L, 0, 0, 0), box(2 * LOW + 1.4, 0.3, 2 * LOW + 1.4, W, 0, T1 - 0.3, 0), box(2 * FLAT, TOP - 0.3 - T1, 2 * FLAT, L, 0, T1, 0));
  const p1 = detail.low ? 8 : 4, n1 = Math.floor((2 * LOW) / p1), p2 = detail.low ? 9 : 4.6, n2 = Math.floor((2 * FLAT) / p2);
  for (const a of FACES) {
    const skip = a === 0 ? gate : [];
    T.add(onFace(at(arcadeSkin(2 * LOW + 1.2, T1 - 0.3 - HB, [...cellRow(n1, p1, 0.3, 2.2, 2.3, skip), ...cellRow(n1, p1, 3.1, 2.2, 2.3, skip)], 0.6, L, { trim: W, fill: 'room' }), 0, HB, 0), a, LOW));
    T.add(onFace(at(arcadeSkin(2 * FLAT + 1.2, TOP - 0.3 - T1, cellRow(n2, p2, 0.2, 2.8, 4.3, skip), 0.6, L, { trim: W, fill: 'room' }), 0, T1, 0), a, FLAT));
  }
  T.add(parapet(LOW + 0.4, T1, W), parapet(FLAT + 0.4, TOP + 0.1, W));
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) T.add(at(chhatri(1.5, 4.4, W), sx * (LOW - 1.2), T1, sz * (LOW - 1.2)), at(chhatri(1.7, 5, W), sx * (FLAT - 1.4), TOP + 0.1, sz * (FLAT - 1.4)));
  // The court on top: marble paving, and pilgrims' ranges along the back and sides.
  T.add(box(2 * FLAT + 1.4, 0.4, 2 * FLAT + 1.4, W, 0, TOP - 0.3, 0));
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
  // The stair: a long flight of marble treads from the court down across the terraces to the town.
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
  const slope = scatter(70, [-150, 150, -150, 150], { seed: 7, gap: 10, avoid: [[-LOW - 6, LOW + 6, -LOW - 6, LOW + 6], [-12, 12, 40, 150]] });
  g.add(trees(slope.map(([x, z]) => [x, z, null, hill(x, z) - 0.2]), { kind: 'neem', seed: 7 }));
  const homes = [];
  for (const [x, z] of scatter(detail.low ? 50 : 110, [-260, 260, 90, 300], { seed: 11, gap: 16, avoid: [[-16, 16, 90, 300]] })) homes.push([x, z, 8 + (x * 7 % 4), 10, 2 + Math.abs(Math.round(z)) % 2, 0, hill(x, z) - 0.2]);
  g.add(townHouses(homes, { seed: 11, fine: false }));
  g.add(mountainRing({ inner: 380, outer: 900, h: 200, size: 2600, cz: -200, snow: Infinity, rock: ['#7d7462', '#8a7f69'], cover: '#5f7240' }));
}

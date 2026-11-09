import * as THREE from 'three';
import { M, mat, box, cyl, at, pidaRoof } from '../helpers.js';
import { nagaraTemple, trabeateGate, wallWithGaps } from '../details/temples.js';
import { addDetails } from '../details/baidyanath-temple.js';

const WHITE = mat('#f0e9de', 0.85);
const SHADE = mat('#d8c9b0', 0.9);

// The panchashula: a five-pointed trident in place of the usual three.
function panchashula(h) {
  const g = new THREE.Group();
  g.add(cyl(0.12, 0.16, h, M.gild, 0, 0, 0, 8), box(2.8, 0.25, 0.25, M.gild, 0, h * 0.72));
  for (let k = 0; k < 5; k++) {
    const x = -1.3 + k * 0.65;
    g.add(cyl(0, 0.12, h * 0.3, M.gild, x, h * 0.72, 0, 6));
  }
  return g;
}

export function buildBaidyanath() {
  const g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  g.add(box(140, 0.15, 140, M.path));
  // The court wall, open on the east (+z) through a gate.
  f.add(box(100, 5, 2, SHADE, 0, 0, -50), wallWithGaps('x', 100, 5, 2, SHADE, [[0, 12.4]], 0, 50));
  for (const s of [-1, 1]) f.add(box(2, 5, 100, SHADE, s * 50, 0, 0));
  f.add(at(trabeateGate(14, 7.5, 4, 3.6, 5, { m: WHITE, trim: SHADE }), 0, 0, 50), at(pidaRoof(14, 6, 3, 0.8, WHITE, SHADE), 0, 7.5, 50));
  // The main temple, its spire crowned by a panchashula
  const main = nagaraTemple({ w: 12, h: 24, m: WHITE, shade: SHADE, plinth: 2, urus: 0, halls: [[12, 7, 4]], prof: (t) => 1 - 0.68 * t, crown: panchashula(6) });
  f.add(at(main, 0, 0, -14));
  // The other twenty-one temples of the court, in three sizes, along its walls facing in and
  // facing east, and Parvati's, the tallest of them, beside the main temple. [x, z, facing, size]
  const sizes = [{ w: 6, h: 12, plinth: 1 }, { w: 5, h: 9, plinth: 0.8 }, { w: 4, h: 6.5, plinth: 0.7 }];
  const E = Math.PI / 2, spots = [
    ...[-36, -22, -8, 6, 20].map((z, k) => [-36, z, E, [1, 2, 0, 2, 1][k]]),
    ...[-36, -22, -8, 6, 20].map((z, k) => [36, z, -E, [2, 1, 2, 0, 1][k]]),
    ...[-20, -7, 7, 20].map((x, k) => [x, -40, 0, [0, 1, 1, 0][k]]),
    ...[-36, -25, -12, 12, 25, 36].map((x, k) => [x, 30, 0, [2, 1, 2, 2, 1, 2][k]]),
    [-19, -4, 0, 0],
  ];
  for (const [x, z, ry, k] of spots) {
    const t = nagaraTemple({ ...sizes[k], m: WHITE, shade: SHADE, urus: 0, halls: [], apron: 3 });
    t.rotation.y = ry;
    f.add(at(t, x, 0, z));
  }
  addDetails(f, g);
  return { group: g, focus: f, view: [0.85, 0.42, 1.15] };
}

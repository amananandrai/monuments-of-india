import * as THREE from 'three';
import { M, mat, box, cyl, at, nagaraTemple } from '../helpers.js';

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
  g.add(box(140, 0.2, 140, M.path));
  for (const s of [-1, 1]) f.add(box(100, 5, 2, SHADE, 0, 0, s * 50), box(2, 5, 100, SHADE, s * 50, 0, 0));
  // The main temple, its spire crowned by a panchashula
  const main = nagaraTemple({ w: 12, h: 24, m: WHITE, shade: SHADE, plinth: 2, urus: 0, halls: [[12, 7, 4]], prof: (t) => 1 - 0.68 * t, crown: panchashula(6) });
  f.add(at(main, 0, 0, -14));
  // The smaller temples of the complex grouped around it
  const spots = [[-32, -30], [-32, -8], [-32, 14], [32, -30], [32, -8], [32, 14], [-16, -38], [16, -38], [-20, 30], [20, 30]];
  for (const [x, z] of spots) f.add(at(nagaraTemple({ w: 5, h: 9, m: WHITE, shade: SHADE, plinth: 0.8, urus: 0, halls: [] }), x, 0, z));
  return { group: g, focus: f, view: [0.85, 0.42, 1.15] };
}

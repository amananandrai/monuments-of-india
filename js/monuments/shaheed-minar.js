import * as THREE from 'three';
import { M, mat, box, cyl, ring, at, ribbed, hemi, lathe } from '../helpers.js';

const STONE = mat('#e6dcc8', 0.85);
const SHADE = mat('#c8bba1', 0.9);

// A 48 m column: Egyptian-style base, fluted Syrian shaft, two balconies and a Turkish cupola.
export function buildShaheedMinar() {
  const g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  g.add(box(400, 0.15, 300, M.grass, 0, 0, 40), box(60, 0.25, 60, M.path));
  f.add(box(16, 2, 16, SHADE), at(lathe([[6.4, 0], [5.6, 6], [4.6, 7.2], [0, 7.2]], STONE, 4).rotateY(Math.PI / 4), 0, 2, 0));
  f.add(at(ribbed(cyl(2.4, 3, 30, STONE, 0, 0, 0, 32), 16, 0.06), 0, 9.2 + 15, 0));
  for (const y of [39, 43]) f.add(cyl(3.6, 2.6, 0.8, SHADE, 0, y, 0, 24), ring(3.6, 0.9, STONE, y + 0.8, 24));
  f.add(cyl(2.2, 2.4, 3, STONE, 0, 44.6, 0, 16), at(hemi(2.4, STONE, 20), 0, 47.6, 0), cyl(0.1, 0.25, 2, SHADE, 0, 49.8, 0, 8));
  return { group: g, focus: f, view: [0.6, 0.18, 1.25] };
}

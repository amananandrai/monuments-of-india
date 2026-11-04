import * as THREE from 'three';
import { M, mat, mesh, box, at, surface } from '../helpers.js';
import { railing, mergeByMaterial } from './components.js';
import { trees, shrubs, lampPosts, scatter, along } from './realism.js';

// Jallianwala Bagh, finer detail. From photographs: the base of the flame memorial is lettered on
// its faces; a low railing edges the reflecting pool; and on the preserved wall the bullet marks
// of 13 April 1919 are each outlined in a white painted square. Dimensions follow
// js/monuments/jallianwala-bagh.js: the pool 24 square at (0, -6), the base 10 square and 1.6 high,
// the wall 16 × 4 × 1.2 at (40, 0, 26).
const LETTERS = surface(mat('#e8dcc4', 0.8), 'script'), WHITE = mat('#f2efe8', 0.8);
function architecture(f) {
  const d = new THREE.Group();
  for (const [x, z, ry] of [[0, -0.98, 0], [0, -11.02, Math.PI], [4.98 + 0.04, -6, Math.PI / 2], [-5.02, -6, -Math.PI / 2]]) {
    const b = box(7, 0.8, 0.04, LETTERS, 0, 1.2, 0);
    b.position.set(x, 1.2, z);
    b.rotation.y = ry;
    d.add(b);
  }
  for (const [x, z, ry, len] of [[0, 6.3, 0, 26], [0, -18.3, 0, 26], [12.3, -6, Math.PI / 2, 24], [-12.3, -6, Math.PI / 2, 24]]) {
    const r = railing(len, 0.8, 0.12, mat('#3a3633', 0.5, 0.4), 2, mat('#3a3633', 0.5, 0.4));
    r.position.set(x, 0.8, z);
    r.rotation.y = ry;
    d.add(r);
  }
  // Bullet marks on the wall's face towards the garden (z = 25.4).
  const holes = [[-5.5, 1.2], [-4.1, 2.3], [-3.2, 0.9], [-1.6, 2.8], [-0.4, 1.6], [0.9, 2.2], [2.1, 1.1], [3.4, 2.6], [4.6, 1.5], [5.8, 2.9], [-6.4, 3.0], [1.7, 3.2]];
  for (const [x, y] of holes) {
    d.add(mesh(new THREE.CircleGeometry(0.08, 8), M.recess, 40 + x, y, 25.38).rotateY(Math.PI));
    for (const [w, h, dx, dy] of [[0.5, 0.05, 0, 0.22], [0.5, 0.05, 0, -0.22], [0.05, 0.5, 0.22, 0], [0.05, 0.5, -0.22, 0]]) d.add(box(w, h, 0.02, WHITE, 40 + x + dx, y + dy - h / 2, 25.39));
  }
  mergeByMaterial(d);
  f.add(d);
}

// Jallianwala Bagh at Amritsar: the garden's trees and hedges round the Martyrs' Well and along the
// narrow lane that was its only way out in 1919, and lamps.
export function addDetails(f, g) {
  architecture(f);
  f.add(trees(scatter(14, [-54, 54, -40, 40], { seed: 6, gap: 13, avoid: [[-18, 18, -24, 12], [-42, -30, 14, 26]] }), { kind: 'neem', seed: 6 }));
  f.add(shrubs([...along(10, [-50, 37], [50, 37]), ...along(10, [-50, -37], [50, -37])].map(([x, z]) => [x, z, 1.1]), { seed: 7 }));
  f.add(lampPosts([...along(4, [-3.5, 40], [-3.5, 64]), ...along(4, [3.5, 40], [3.5, 64])]));
}

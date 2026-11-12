import * as THREE from 'three';
import { M, mat, mesh, box, cyl, at, hemi, surface, inst, unitBox } from '../helpers.js';
import { mergeByMaterial } from './components.js';
import { trees, shrubs, lampPosts, scatter, along } from './realism.js';

// Jallianwala Bagh, finer detail. From photographs: the base of the flame memorial is lettered on
// its faces; and on the preserved wall the bullet marks
// of 13 April 1919 are each outlined in a white painted square; the garden walls have piers and a
// coping; a canopy stands over the Martyrs' Well; and the Amar Jyoti and the firing-point pyramid
// stand beside the walk from the lane. Dimensions follow
// js/monuments/jallianwala-bagh.js: the garden 200 × 135 inside its walls, the memorial's base
// 10 square and 1.6 high at (0, -6), standing on the lawn (y = 0.2),
// the wall 16 × 4 × 1.2 at (40, 0, 26).
const STONE = mat('#d9cbb2', 0.85), RED_ = mat('#a5473a', 0.85), PAVE = mat('#c2b59c', 0.95), BRICK_ = surface(mat('#8c5a45', 0.95), 'brick');
const FLAME = surface(mat('#ffb347', 0.4, 0, { emissive: '#ff7a1a', emissiveIntensity: 1.5 }), 'none');
const LETTERS = surface(mat('#e8dcc4', 0.8), 'script'), WHITE = mat('#f2efe8', 0.8);
function architecture(f) {
  const d = new THREE.Group();
  for (const [x, z, ry] of [[0, -0.98, 0], [0, -11.02, Math.PI], [4.98 + 0.04, -6, Math.PI / 2], [-5.02, -6, -Math.PI / 2]]) {
    const b = box(7, 0.8, 0.04, LETTERS, 0, 0.6, 0);
    b.position.set(x, 0.6, z);
    b.rotation.y = ry;
    d.add(b);
  }
  // Bullet marks on the wall's face towards the garden (z = 25.4).
  const holes = [[-5.5, 1.2], [-4.1, 2.3], [-3.2, 0.9], [-1.6, 2.8], [-0.4, 1.6], [0.9, 2.2], [2.1, 1.1], [3.4, 2.6], [4.6, 1.5], [5.8, 2.9], [-6.4, 3.0], [1.7, 3.2]];
  for (const [x, y] of holes) {
    d.add(mesh(new THREE.CircleGeometry(0.08, 8), M.recess, 40 + x, y, 25.38).rotateY(Math.PI));
    for (const [w, h, dx, dy] of [[0.5, 0.05, 0, 0.22], [0.5, 0.05, 0, -0.22], [0.05, 0.5, 0.22, 0], [0.05, 0.5, -0.22, 0]]) d.add(box(w, h, 0.02, WHITE, 40 + x + dx, y + dy - h / 2, 25.39));
  }
  // The garden's brick walls (200 × 135, 6 m high, 2 m thick): piers every 8 m on the garden side,
  // a stone coping along the top and a plinth course at the foot.
  const piers = [], W = 200, D = 135;
  for (const s of [-1, 1]) {
    for (let x = -W / 2 + 4; x < W / 2; x += 8) piers.push([x, 0, s * (D / 2 - 1.15), 0.9, 6.3, 0.5]);
    for (let z = -D / 2 + 4; z < D / 2; z += 8) piers.push([s * (W / 2 - 1.15), 0, z, 0.5, 6.3, 0.9]);
    d.add(box(W + 2.4, 0.35, 2.5, STONE, 0, 6, s * D / 2), box(2.5, 0.35, D + 2.4, STONE, s * W / 2, 6.01, 0));
    d.add(box(W - 2, 0.6, 0.3, STONE, 0, 0, s * (D / 2 - 1.1)), box(0.3, 0.6, D - 2, STONE, s * (W / 2 - 1.1), 0, 0));
  }
  f.add(inst(unitBox(), piers, BRICK_));
  // The paved walk from the lane to the memorial, and steps round the pylon's base.
  d.add(box(5, 0.26, 58, PAVE, 0, 0, 37.5));
  for (let k = 0; k < 3; k++) d.add(box(13.6 - k * 1.2, 0.3, 13.6 - k * 1.2, RED_, 0, 0.2 + k * 0.3, -6));
  // The Martyrs' Well (at -36, 20): a canopy of red sandstone over it, eight columns carrying a
  // ring beam, a deep eave and a low dome.
  const well = at(new THREE.Group(), -36, 0, 20);
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * Math.PI * 2 + Math.PI / 8, x = Math.sin(a) * 4.9, z = Math.cos(a) * 4.9;
    well.add(box(0.9, 0.4, 0.9, RED_, x, 0, z), cyl(0.28, 0.32, 4.2, RED_, x, 0.4, z, 10), box(0.8, 0.3, 0.8, RED_, x, 4.6, z));
  }
  well.add(cyl(5.5, 5.5, 0.7, RED_, 0, 4.9, 0, 32), cyl(6.6, 5.6, 0.25, RED_, 0, 5.6, 0, 32), cyl(4.6, 5.2, 0.6, RED_, 0, 5.85, 0, 32));
  const dome = hemi(4.4, STONE, 32);
  dome.scale.y = 0.6;
  well.add(at(dome, 0, 6.45, 0), cyl(0.15, 0.4, 1.2, RED_, 0, 9.05, 0, 8), box(11.6, 0.2, 11.6, PAVE, 0, 0.05, 0));
  d.add(well);
  // The Amar Jyoti, the eternal flame, under a small canopy beside the walk.
  const jyoti = at(new THREE.Group(), 12, 0, 46);
  for (const [x, z] of [[-1.6, -1.6], [1.6, -1.6], [-1.6, 1.6], [1.6, 1.6]]) jyoti.add(box(0.3, 3.2, 0.3, STONE, x, 0.3, z));
  jyoti.add(box(4.4, 0.3, 4.4, STONE), box(4.2, 0.3, 4.2, RED_, 0, 3.5, 0), box(1.2, 0.9, 1.2, RED_, 0, 0.3, 0), cyl(0.5, 0.3, 0.3, M.bronze, 0, 1.2, 0, 12));
  const fl = mesh(new THREE.ConeGeometry(0.22, 0.7, 8), FLAME, 0, 1.85, 0);
  fl.castShadow = false;
  jyoti.add(fl);
  d.add(jyoti);
  // The low stone pyramid that marks where the soldiers stood and fired.
  d.add(mesh(new THREE.ConeGeometry(1.6, 1.6, 4).rotateY(Math.PI / 4), STONE, -9, 0.8, 52), box(3, 0.2, 3, PAVE, -9, 0, 52));
  mergeByMaterial(d);
  f.add(d);
}

// Jallianwala Bagh at Amritsar: the garden's trees and hedges round the Martyrs' Well and along the
// narrow lane that was its only way out in 1919, and lamps.
export function addDetails(f, g) {
  architecture(f);
  f.add(trees(scatter(26, [-92, 92, -60, 60], { seed: 6, gap: 14, avoid: [[-20, 20, -26, 14], [-42, -30, 14, 26], [30, 50, 22, 30]] }), { kind: 'neem', seed: 6 }));
  f.add(shrubs([...along(16, [-92, 62], [92, 62]), ...along(16, [-92, -62], [92, -62])].map(([x, z]) => [x, z, 1.1]), { seed: 7 }));
  f.add(lampPosts([...along(4, [-3.5, 64], [-3.5, 88]), ...along(4, [3.5, 64], [3.5, 88])]));
}

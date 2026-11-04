import * as THREE from 'three';
import { M, V, mat, mesh, box, cyl, at, ellipsoid, capsule, tube, surface, face, fingers } from '../helpers.js';
import { nagaraTemple } from '../details/temples.js';
import { shivaBody } from '../details/figures.js';

const PINK = mat('#e4b7a0', 0.85);
const SHADE = mat('#c4937c', 0.9);
// A plain surface: block joints would run across the face and the chest.
const SHIVA = surface(mat('#5d6f86', 0.6, 0.1), 'none');

// The great seated Shiva in the temple garden, about 25 m tall: cross-legged on a lotus, the
// right hand raised in blessing, a serpent round the neck and the crescent moon in his hair.
function seatedShiva() {
  const g = new THREE.Group(), S = SHIVA, PETAL = mat('#e3a6b4', 0.75);
  g.add(cyl(7.5, 8.5, 3, SHADE, 0, 0, 0, 48), cyl(8.2, 8.2, 1.4, PETAL, 0, 3, 0, 48));
  for (let k = 0; k < 18; k++) {
    const a = (k / 18) * Math.PI * 2, p = ellipsoid(1.9, 0.7, 3.2, PETAL, Math.sin(a) * 7.4, 4.3, Math.cos(a) * 7.4);
    p.rotation.set(-0.5, a, 0, 'YXZ');
    g.add(p);
  }
  // The body as one carved skin: crossed legs on the lotus, the chest and belly, the right arm
  // raised in abhaya mudra and the left hand resting on the knee
  g.add(shivaBody(S));
  // The serpent coiled round the neck
  const snake = [];
  for (let k = 0; k <= 30; k++) { const a = (k / 30) * Math.PI * 2.4; snake.push([Math.sin(a) * 2.4, 17.4 + k * 0.03, Math.cos(a) * 2.1]); }
  // The cobra rises beside the right cheek, clear of the face
  snake.push([2.4, 19.0, 1.6], [2.9, 20.4, 1.5]);
  g.add(tube(snake, 0.34, mat('#3f5866', 0.5, 0.1), 80, 8), ellipsoid(0.7, 0.5, 0.9, mat('#3f5866', 0.5, 0.1), 2.95, 20.8, 1.7));
  // The fingers of the raised hand, and its thumb
  g.add(fingers(V(6.9, 18.0, 3.1), V(6.9, 18.0, 4.3), V(0, 1, 0.1).normalize(), 1.15, 0.2, S), capsule(V(6.95, 16.4, 4.5), V(7.0, 17.3, 5.1), 0.2, S, 0.17));
  // Head with matted locks gathered in a tall knot, the crescent moon and the third eye
  g.add(at(face(2.2, 2.8, 2.3, S), 0, 21.2, 0.3), ellipsoid(0.22, 0.32, 0.1, mat('#d14b3a', 0.6), 0, 22.4, 2.45));
  for (const sd of [-1, 1]) g.add(ellipsoid(0.4, 1.0, 0.5, S, sd * 2.2, 21.2, 0.2));
  g.add(capsule(V(0, 23.4, -0.2), V(0, 26.4, -0.6), 1.4, S, 0.9), ellipsoid(1.9, 1.0, 1.9, S, 0, 23.6, -0.1));
  const moon = mesh(new THREE.TorusGeometry(1.0, 0.2, 8, 24, Math.PI * 1.1), M.gild, -1.1, 25.2, 0.6);
  moon.rotation.set(0, 0.3, 0.9);
  g.add(moon);
  // The trident with its little drum (damaru)
  g.add(cyl(0.18, 0.18, 24, M.steel, 7.6, 3, 2, 8));
  for (const [x, h] of [[7.6, 2.6], [6.7, 1.9], [8.5, 1.9]]) g.add(cyl(0, 0.3, h, M.steel, x, 27, 2, 8));
  g.add(tube([[6.7, 27, 2], [7.1, 26.4, 2], [7.6, 26.3, 2], [8.1, 26.4, 2], [8.5, 27, 2]], 0.14, M.steel, 16, 6));
  g.add(cyl(0.6, 0.1, 0.6, mat('#8a5a3a', 0.7), 7.6, 24.6, 2.3, 12), cyl(0.1, 0.6, 0.6, mat('#8a5a3a', 0.7), 7.6, 25.2, 2.3, 12));
  return g;
}

export function buildNageshwar() {
  const g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  g.add(box(180, 0.2, 180, M.path), box(80, 0.2, 60, M.grass, 0, 0, 60));
  f.add(at(nagaraTemple({ w: 11, h: 19, m: PINK, shade: SHADE, plinth: 2, urus: 4, halls: [[14, 7, 5]] }), -26, 0, -20));
  f.add(at(seatedShiva(), 26, 0, 10));
  return { group: g, focus: f, view: [0.6, 0.3, 1.25] };
}

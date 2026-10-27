import * as THREE from 'three';
import { M, V, mat, mesh, box, cyl, at, nagaraTemple, ellipsoid, capsule, tube, smoothLathe, surface } from '../helpers.js';

const PINK = mat('#e4b7a0', 0.85);
const SHADE = mat('#c4937c', 0.9);
const SHIVA = surface(mat('#5d6f86', 0.6, 0.1), 'marble');

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
  // Crossed legs, thighs and shins resting on the lotus
  for (const sd of [-1, 1]) {
    g.add(capsule(V(sd * 2.6, 6.6, 0), V(sd * 6.2, 5.8, 3.2), 2.3, S, 1.9));
    g.add(capsule(V(sd * 6.2, 5.6, 3.4), V(-sd * 3.6, 5.4, 4.6), 1.7, S, 1.4));
    g.add(ellipsoid(1.1, 0.8, 2.2, S, -sd * 4.2, 6.6, 4.4));
  }
  g.add(ellipsoid(5.2, 2.3, 3.9, S, 0, 6.6, 0.6));
  // Torso, shoulders and the serpent coiled round the neck
  g.add(smoothLathe([[4.2, 0], [4.0, 2.2], [4.6, 5.2], [5.4, 7.6], [4.6, 9.2], [1.8, 10], [0.1, 10.1]], S).translateY(7.6));
  g.children[g.children.length - 1].scale.z = 0.72;
  for (const sd of [-1, 1]) g.add(ellipsoid(1.9, 1.7, 1.7, S, sd * 4.6, 16.2, 0));
  const snake = [];
  for (let k = 0; k <= 30; k++) { const a = (k / 30) * Math.PI * 2.4; snake.push([Math.sin(a) * 2.4, 17.4 + k * 0.03, Math.cos(a) * 2.1]); }
  snake.push([0.6, 19.6, 3.0], [0.4, 20.6, 3.4]);
  g.add(tube(snake, 0.34, mat('#3f5866', 0.5, 0.1), 80, 8), ellipsoid(0.7, 0.5, 0.9, mat('#3f5866', 0.5, 0.1), 0.4, 20.9, 3.5));
  // Right arm raised in abhaya mudra; left hand resting on the knee
  g.add(capsule(V(4.8, 16, 0.2), V(6.6, 12.4, 1.6), 1.2, S, 1), capsule(V(6.6, 12.4, 1.6), V(6.9, 15.8, 3.4), 1, S, 0.8));
  const palm = ellipsoid(0.55, 1.5, 1.1, S, 6.9, 16.8, 3.7);
  palm.rotation.x = -0.25;
  g.add(palm);
  g.add(capsule(V(-4.8, 16, 0.2), V(-6.4, 12.2, 1.4), 1.2, S, 1), capsule(V(-6.4, 12.2, 1.4), V(-6.2, 8.4, 3.6), 1, S, 0.8), ellipsoid(1.1, 0.7, 1.6, S, -6.1, 7.7, 4.1));
  // Head with matted locks gathered in a tall knot, the crescent moon and the third eye
  g.add(capsule(V(0, 17.6, 0), V(0, 19.4, 0.2), 1.2, S, 1.3));
  g.add(ellipsoid(2.2, 2.7, 2.3, S, 0, 21.4, 0.3), ellipsoid(1.9, 0.9, 2.0, S, 0, 19.9, 0.7));
  g.add(ellipsoid(0.45, 0.8, 0.6, S, 0, 21.3, 2.5), ellipsoid(0.22, 0.32, 0.1, mat('#d14b3a', 0.6), 0, 22.4, 2.45));
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

import * as THREE from 'three';
import { M, mat, mesh, box, cyl, lathe, at, nagaraTemple } from '../helpers.js';

const PINK = mat('#e4b7a0', 0.85);
const SHADE = mat('#c4937c', 0.9);
const SHIVA = mat('#5d6f86', 0.6, 0.1);

// The great seated Shiva in the temple garden, about 25 m tall.
function seatedShiva() {
  const g = new THREE.Group();
  g.add(cyl(7.5, 8.5, 3, SHADE, 0, 0, 0, 32), at(lathe([[8, 0], [9, 1.2], [8.4, 2], [0, 2]], mat('#d9a5b0', 0.8), 24), 0, 3, 0));
  const legs = mesh(new THREE.SphereGeometry(6.2, 28, 14), SHIVA, 0, 7.2, 0.6);
  legs.scale.set(1.15, 0.42, 0.85);
  g.add(legs);
  g.add(at(lathe([[3.6, 0], [4.2, 3], [4.4, 6], [3.8, 8.4], [2, 9.6], [0, 9.8]], SHIVA, 28), 0, 8.4, 0));
  for (const s of [-1, 1]) {
    const arm = cyl(0.9, 1.2, 7, SHIVA, 0, 0, 0, 12);
    arm.position.set(s * 4.4, 11.8, 1.2);
    arm.rotation.set(0.3, 0, s * 0.18);
    g.add(arm);
  }
  g.add(cyl(1.1, 1.3, 1.6, SHIVA, 0, 18.2, 0, 16), at(mesh(new THREE.SphereGeometry(2.4, 20, 16), SHIVA), 0, 21.4, 0.2));
  g.add(cyl(0.6, 1.4, 2.6, SHIVA, 0, 23, -0.3, 12));
  g.add(cyl(0.18, 0.18, 24, M.steel, 7, 3, 2, 8), cyl(0, 0.3, 2.2, M.steel, 7, 27, 2, 6), cyl(0, 0.3, 1.8, M.steel, 6.2, 26, 2, 6), cyl(0, 0.3, 1.8, M.steel, 7.8, 26, 2, 6));
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

import * as THREE from 'three';
import { mat, mesh, box, at, surface } from '../helpers.js';
import { mergeByMaterial } from './components.js';

// The Kargil War Memorial, finer detail. From photographs: the curved pink sandstone wall is set
// with bronze-lettered tablets bearing the names of the fallen, in a row along its inner face; and
// the plinth of the flame carries a lettered tablet on its front.
// Dimensions follow js/monuments/kargil-war-memorial.js: the wall on the ellipse 34 × 26 (opening
// to +z), 1.4 thick, from 0.6 to 6.6; the flame's plinth 4 square at (0, 0.6, -6).
const TABLET = surface(mat('#5a4636', 0.5), 'script');
function architecture(f) {
  const d = new THREE.Group(), from = Math.PI * 0.15 - 0.057, to = Math.PI * 0.85 + 0.057, n = 36;
  for (let k = 0; k < n; k++) {
    const a = from + ((k + 0.5) / n) * (to - from), x = 34 * Math.cos(a), z = -26 * Math.sin(a);
    const nx = Math.cos(a) / 34, nz = Math.sin(a) / -26, l = Math.hypot(nx, nz), ry = Math.atan2(-nx / l, -nz / l);
    const t = box(1.6, 2.2, 0.06, TABLET, 0, 2.4, 0);
    t.position.set(x - (nx / l) * 0.73, 2.4, z - (nz / l) * 0.73);
    t.rotation.y = ry;
    d.add(t);
  }
  d.add(box(3, 1.4, 0.05, TABLET, 0, 1.2, -3.97));
  mergeByMaterial(d);
  f.add(d);
}

// The Kargil War Memorial at Drass: the guns captured or used in the war, shown on the lawn.
const OLIVE = mat('#4d5a3a', 0.8), GUN = mat('#3c4433', 0.6, 0.4);
function fieldGun() {
  const g = new THREE.Group();
  g.add(box(1.8, 0.6, 2.6, OLIVE, 0, 0.6, 0), box(1.6, 1.0, 1.2, GUN, 0, 1.2, 0.2));
  g.add(at(mesh(new THREE.CylinderGeometry(0.11, 0.16, 6.5, 10).rotateX(Math.PI / 2 - 0.25), GUN), 0, 2.2, 3.1));
  for (const x of [-1.05, 1.05]) g.add(at(mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.3, 14).rotateZ(Math.PI / 2), mat('#1d1d1d', 0.9)), x, 0.55, 0.2));
  for (const s of [-1, 1]) g.add(at(box(0.18, 0.18, 4.2, OLIVE), s * 0.5, 0.3, -2.4).rotateY(s * 0.25));
  return g;
}
export function addDetails(f, g) {
  architecture(f);
  for (const [x, z, ry] of [[24, 14, -0.6], [32, 6, -1.0], [-14, 30, 0.3]]) f.add(at(fieldGun(), x, 0.6, z).rotateY(ry));
}

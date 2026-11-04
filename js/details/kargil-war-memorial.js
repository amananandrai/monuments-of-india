import * as THREE from 'three';
import { mat, mesh, box, at } from '../helpers.js';

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
  for (const [x, z, ry] of [[24, 14, -0.6], [32, 6, -1.0], [-14, 30, 0.3]]) f.add(at(fieldGun(), x, 0.6, z).rotateY(ry));
}

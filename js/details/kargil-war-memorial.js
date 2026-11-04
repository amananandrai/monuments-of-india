import * as THREE from 'three';
import { mat, mesh, box, cyl, at } from '../helpers.js';
import { people, vehicles } from './realism.js';

// The Kargil War Memorial at Drass: the guns captured or used in the war, shown on the lawn; army
// trucks drawn up by the road; soldiers and visitors at the Amar Jawan Jyoti and the epitaphs.
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
  g.add(vehicles([[-40, 0.2, 48, 0], [-34, 0.2, 48, 0], [-28, 0.2, 48, 0]], { paints: ['#4d5a3a'], busPaints: ['#4d5a3a'], busShare: 1, seed: 3 }));
  f.add(people([[-2, -2.5], [2, -2.5], [-4, 0], [4, 0], [-8, 24], [0, 25], [8, 24], [16, 25], [-20, 22], [10, 10], [-12, 8], [20, 18]], { seed: 4, palette: ['#4d5a3a', '#4d5a3a', '#4d5a3a', '#f4f1ea', '#2f5d9a', '#b3262e'], y: 0.6 }));
}

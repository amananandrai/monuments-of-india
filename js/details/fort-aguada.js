import * as THREE from 'three';
import { mat, mesh, cyl, at } from '../helpers.js';
import { trees, people, boats, asiBoard, scatter } from './realism.js';

// Fort Aguada: iron cannon on the ramparts looking out to sea, coconut palms and cashew scrub on
// the headland, the beach below with visitors, and fishing boats in the Mandovi's mouth.
const IRON = mat('#2a2826', 0.55, 0.5), WOOD = mat('#4a3424', 0.85);
function cannon() {
  const g = new THREE.Group(), barrel = mesh(new THREE.CylinderGeometry(0.22, 0.32, 2.6, 12).rotateX(Math.PI / 2), IRON, 0, 0.75, 0.3);
  g.add(barrel, cyl(0.36, 0.36, 0.2, IRON, 0, 0.55, -1.0, 12));
  for (const x of [-0.35, 0.35]) g.add(at(mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.12, 10).rotateZ(Math.PI / 2), WOOD), x, 0.32, 0.4), at(mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.12, 10).rotateZ(Math.PI / 2), WOOD), x, 0.32, -0.6));
  return g;
}
export function addDetails(f, g) {
  const H = 24;
  for (const [x, z, ry] of [[-44, -30, Math.PI + 0.3], [30, -36, Math.PI], [54, -6, Math.PI / 2], [-54, 4, -Math.PI / 2]]) f.add(at(cannon(), x, H + 7, z).rotateY(ry));
  const head = scatter(60, [-140, 140, -95, 95], { seed: 3, gap: 9 }).filter(([x, z]) => { const r = Math.hypot(x / 125, z / 85); return r < 0.9 && !(x > -66 && x < 66 && z > -46 && z < 46); });
  g.add(trees(head, { kind: 'palm', seed: 3, y: H }));
  g.add(people([...scatter(20, [10, 110, 108, 132], { seed: 4 }), ...scatter(12, [-30, 20, -20, 20], { seed: 5 }).map(([x, z]) => [x, z, H + 0.6])], { seed: 4 }));
  g.add(boats([[30, 150, 0.4], [80, 160, -0.3], [-60, 190, 1.2], [140, 210, 0.8], [-200, -40, 2.4], [210, -60, 1.9]], { y: 0.3, size: 1.8 }));
  g.add(asiBoard('Fort Aguada', 52, 34, 0.2, { y: H }));
}

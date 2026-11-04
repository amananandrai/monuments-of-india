import * as THREE from 'three';
import { mat, mesh, box, at } from '../helpers.js';
import { trees, shrubs, people, lampPosts, scatter, along } from './realism.js';
import { horse } from './animals.js';

// The Victoria Memorial at Kolkata: the horse-drawn Victoria carriages that wait for visitors on
// the road by the gardens, visitors on the terrace and the walks, flower beds, the trees of the
// 64-acre garden, and lamps along the main walk.
const WHITE = mat('#f4f1ea', 0.6), GILT = mat('#e3b54a', 0.35, 0.8), HORSE = mat('#ece6da', 0.85);
function carriage() {
  const g = new THREE.Group();
  g.add(box(1.5, 0.9, 2.2, WHITE, 0, 0.8, -1.6), box(1.5, 0.1, 2.4, GILT, 0, 1.7, -1.6), at(mesh(new THREE.CylinderGeometry(0.85, 0.85, 1.4, 12, 1, true, -Math.PI / 2, Math.PI).rotateZ(Math.PI / 2), WHITE), 0, 1.75, -2.1));
  for (const x of [-0.85, 0.85]) for (const z of [-0.9, -2.4]) g.add(at(mesh(new THREE.TorusGeometry(0.55, 0.05, 6, 16).rotateY(Math.PI / 2), GILT), x, 0.55, z));
  for (const x of [-0.5, 0.5]) { const h = horse(HORSE, { coarse: true }); h.scale.setScalar(0.38); h.position.set(x, 0, 0.6); g.add(h); }
  return g;
}
export function addDetails(f, g) {
  for (const [x, z] of [[-12, 150], [-12, 158], [-12, 166], [12, 140], [12, 132]]) g.add(at(carriage(), x, 0, z).rotateY(x < 0 ? 0 : Math.PI));
  f.add(people(scatter(40, [-50, 50, -36, 38], { seed: 3, avoid: [[-44, 44, -30, 30], [-14, 14, 28, 40]] }).map(([x, z]) => [x, z, 3.5]), { seed: 3 }));
  g.add(people(scatter(40, [-5, 5, 44, 165], { seed: 4 }), { seed: 4 }));
  g.add(shrubs([...along(14, [-8, 48], [-8, 160]), ...along(14, [8, 48], [8, 160])].map(([x, z]) => [x, z, 1.2]), { flowers: '#d0306f', seed: 5 }));
  g.add(trees(scatter(40, [-115, 115, -85, 165], { seed: 6, gap: 16, avoid: [[-60, 60, -45, 45], [-36, 36, 60, 160], [-10, 10, 40, 170]] }), { kind: 'banyan', seed: 6 }));
  g.add(lampPosts([...along(8, [-5.5, 44], [-5.5, 165]), ...along(8, [5.5, 44], [5.5, 165])]));
}

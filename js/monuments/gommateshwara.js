import * as THREE from 'three';
import { mat, mesh, box, cyl, lathe, at, limb, V, chhatri, inst, unitBox, aroundRect } from '../helpers.js';

const GRANITE = mat('#c9c3b6', 0.8);
const HILL = mat('#9a917f', 0.95, 0, { flatShading: true });
const VINE = mat('#5c7a44', 0.9);

// Bahubali standing in kayotsarga: upright, arms straight at his sides, vines climbing his limbs.
function bahubali() {
  const g = new THREE.Group(), G = GRANITE;
  for (const s of [-1, 1]) {
    g.add(box(1.6, 0.8, 2.8, G, s * 1.3, 0, 0.5), limb(V(s * 1.3, 0.6, 0), V(s * 1.4, 4.8, 0), 0.85, 1.05, G), limb(V(s * 1.4, 4.8, 0), V(s * 1.5, 8.4, 0), 1.05, 1.35, G));
    g.add(limb(V(s * 3.4, 15.2, 0), V(s * 3.6, 11.4, 0.1), 0.9, 0.8, G), limb(V(s * 3.6, 11.4, 0.1), V(s * 3.5, 7.4, 0.2), 0.8, 0.65, G));
    for (let k = 0; k < 4; k++) g.add(cyl(1.2, 1.2, 0.15, VINE, s * 1.45, 1.8 + k * 1.6, 0, 10));
  }
  const torso = at(lathe([[2.6, 0], [2.9, 1.6], [3.2, 4], [3.6, 6.2], [3.2, 7.2], [1.2, 7.8], [0, 7.9]], G, 24), 0, 8.2, 0);
  torso.scale.z = 0.7;
  g.add(torso);
  const head = mesh(new THREE.SphereGeometry(1.5, 18, 14), G, 0, 17.2, 0.1);
  head.scale.set(0.9, 1.15, 0.95);
  g.add(cyl(0.7, 0.8, 1, G, 0, 15.6, 0, 12), head, at(mesh(new THREE.SphereGeometry(1.45, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), mat('#8d877a', 0.9)), 0, 17.6, 0));
  return g;
}

export function buildGommateshwara() {
  const g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  // Vindhyagiri: a bare granite hill, with steps cut up its face
  const H = 40;
  const hill = mesh(new THREE.SphereGeometry(80, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2), HILL);
  hill.scale.y = H / 80;
  g.add(hill, box(300, 0.2, 300, mat('#7d8c5a', 0.95)));
  for (let k = 0; k < 24; k++) g.add(box(5, 1, 3, GRANITE, 0, k * 1.6, 77 - k * 2.6));
  // The hilltop enclosure, with pillared cloisters round the statue
  f.add(box(40, 1, 40, GRANITE, 0, H - 0.5, 0));
  const walls = [];
  aroundRect(36, 36, 3).forEach(([x, z, ry]) => walls.push([x, H + 0.5, z, 3, 4.5, 2.2, ry]));
  f.add(inst(unitBox(), walls, GRANITE));
  for (const x of [-14, 14]) f.add(at(chhatri(2.2, 6, GRANITE), x, H + 5, 18));
  // The 17.4 m monolith of Bahubali
  f.add(at(bahubali(), 0, H + 0.5, -4));
  return { group: g, focus: f, view: [0.4, 0.2, 1.25] };
}

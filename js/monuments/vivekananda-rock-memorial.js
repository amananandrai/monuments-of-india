import * as THREE from 'three';
import { M, mat, mesh, box, cyl, lathe, at, limb, V, pidaRoof, kalash, hemi, inst, unitCyl, aroundRect } from '../helpers.js';

const STONE = mat('#c9a98a', 0.85);
const SHADE = mat('#9c7e62', 0.9);
const ROCK = mat('#4c4640', 0.95, 0, { flatShading: true });
const GREY = mat('#a7a39a', 0.8);

function thiruvalluvar() {
  const g = new THREE.Group();
  g.add(box(10, 11.6, 10, GREY));
  const robe = at(lathe([[4.2, 0], [4.4, 6], [3.6, 14], [3.8, 20], [4.4, 24], [2, 26], [0, 26.2]], GREY, 24), 0, 11.6, 0);
  robe.scale.z = 0.7;
  g.add(robe, limb(V(-4, 34.4, 0), V(-4.6, 26, 1.6), 1, 0.8, GREY), limb(V(4, 34.4, 0), V(3.6, 31, 2.4), 1, 0.8, GREY));
  g.add(at(mesh(new THREE.SphereGeometry(2.6, 18, 14), GREY), 0, 40, 0.4), cyl(1.2, 1.6, 2, GREY, 0, 37.4, 0, 12), cyl(0.9, 1.1, 2.4, GREY, 0, 42, -0.6, 12));
  return g;
}

export function buildVivekanandaRock() {
  const g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  // Where three seas meet, off the southern tip of India
  g.add(box(1400, 0.4, 1400, M.water, 0, -0.1, 0), box(600, 0.3, 120, mat('#dcc9a3', 0.95), 0, 0, 380));
  for (const [x, z, s] of [[0, 0, 40], [-75, 18, 22]]) {
    const r = mesh(new THREE.IcosahedronGeometry(s, 1), ROCK, x, 0, z);
    r.scale.set(1, 0.22, 0.75);
    g.add(r);
  }
  const T = 8.8;
  // Vivekananda Mandapam: a temple-like hall under a stepped roof, and the smaller Shripada Mandapam
  const cols = [];
  aroundRect(22, 22, 2.6).forEach(([x, z]) => cols.push([x, T + 1.4, z + 4, 1.2, 8, 1.2]));
  f.add(box(34, 1.4, 44, STONE, 0, T, 0), inst(unitCyl(10), cols, STONE), box(18, 8, 18, STONE, 0, T + 1.4, 4));
  const r = pidaRoof(26, 10, 5, 1, STONE, SHADE);
  f.add(box(26, 1, 26, SHADE, 0, T + 9.4, 4), at(r, 0, T + 10.4, 4), at(hemi(4, STONE, 20), 0, T + 10.4 + r.userData.top, 4), at(kalash(2.4), 0, T + 14.4 + r.userData.top, 4));
  f.add(box(12, 6, 10, STONE, 0, T + 1.4, -16), at(pidaRoof(12, 6, 3, 0.8, STONE, SHADE), 0, T + 7.4, -16));
  // The Thiruvalluvar statue on the neighbouring rock
  f.add(at(thiruvalluvar(), -75, 4.6, 18));
  return { group: g, focus: f, view: [0.7, 0.3, 1.2] };
}

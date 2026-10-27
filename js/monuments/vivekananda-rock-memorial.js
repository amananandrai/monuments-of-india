import * as THREE from 'three';
import { surface } from '../surface.js';
import { M, mat, mesh, box, cyl, at, V, pidaRoof, kalash, hemi, inst, unitCyl, aroundRect, ellipsoid, capsule, tube, smoothLathe, drape, sheet } from '../helpers.js';

const STONE = mat('#c9a98a', 0.85);
const SHADE = mat('#9c7e62', 0.9);
const ROCK = mat('#4c4640', 0.95, 0, { flatShading: true });
const GREY = surface(mat('#a7a39a', 0.8), 'marble');

// The poet Thiruvalluvar: robed, hair gathered in a knot, a long beard, the right hand raised with
// three fingers lifted and the left holding a palm-leaf manuscript. The 38 ft pedestal and 95 ft
// figure stand for the 38 and 95 chapters of the three books of the Thirukkural.
function thiruvalluvar() {
  const g = new THREE.Group(), Gr = GREY;
  g.add(box(10, 11.6, 10, Gr), box(11, 0.8, 11, mat('#8f8b83', 0.8), 0, 11.6));
  const robe = drape(smoothLathe([[4.4, 0], [4.6, 4], [4.0, 10], [3.7, 15], [4.0, 20], [4.5, 24], [2.6, 26], [0.1, 26.3]], Gr), 18, 0.07, 0, 18);
  robe.position.y = 12.4;
  robe.scale.z = 0.72;
  g.add(robe, tube([[3.6, 36.5, 1.6], [1.2, 33, 3.2], [-2.4, 29, 3.0], [-3.8, 25, 2.0]], 0.9, Gr, 40, 10));
  for (const s of [-1, 1]) g.add(ellipsoid(1.6, 1.5, 1.4, Gr, s * 4, 36.4, 0));
  g.add(capsule(V(4.2, 36.2, 0), V(5.2, 31.2, 1.6), 1.05, Gr, 0.9), capsule(V(5.2, 31.2, 1.6), V(5.0, 35.6, 3.6), 0.9, Gr, 0.7));
  g.add(ellipsoid(0.5, 1.0, 0.75, Gr, 5.0, 36.4, 3.9));
  for (const dx of [-0.3, 0, 0.3]) g.add(capsule(V(5.0 + dx, 37.0, 3.9), V(5.0 + dx, 38.2, 3.95), 0.13, Gr));
  g.add(capsule(V(-4.2, 36.2, 0), V(-4.8, 31.2, 1.4), 1.05, Gr, 0.9), capsule(V(-4.8, 31.2, 1.4), V(-3.2, 29.6, 3.6), 0.9, Gr, 0.7));
  g.add(box(3.4, 0.5, 1.0, mat('#b9a27c', 0.8), -2.6, 29.3, 3.8));
  g.add(capsule(V(0, 37.4, 0), V(0, 38.8, 0.3), 1.25, Gr, 1.2));
  g.add(ellipsoid(2.3, 2.8, 2.4, Gr, 0, 40.8, 0.4), ellipsoid(1.8, 2.4, 1.2, Gr, 0, 38.8, 1.9), ellipsoid(0.4, 0.7, 0.5, Gr, 0, 40.6, 2.7));
  g.add(ellipsoid(1.4, 1.2, 1.4, Gr, 0, 43.2, -0.4));
  return g;
}

export function buildVivekanandaRock() {
  const g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  // Where three seas meet, off the southern tip of India
  g.add(sheet(1400, 1400, M.sea, 0, 0.3, 0), box(600, 0.3, 120, mat('#dcc9a3', 0.95), 0, 0, 380));
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

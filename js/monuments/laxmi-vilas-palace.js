import * as THREE from 'three';
import { M, mat, box, cyl, at, onionDome, hemi, finial, chhatri, guldasta } from '../helpers.js';
import { arcadeSkin } from '../details/mughal.js';
import { classicalDoor, porch } from '../details/colonial.js';
import { addDetails } from '../details/laxmi-vilas-palace.js';

const OCHRE = mat('#c2774f', 0.85);
const CREAM = mat('#eadfc6', 0.85);

// A long range with cream bands, for the palace wings: its front two storeys of arcades 1.6 m deep,
// open onto verandahs.
function wing(w, h, d) {
  const g = new THREE.Group(), dd = 1.6, n = Math.floor(w / 5), cells = [];
  for (let k = 0; k < n; k++) {
    const x = -w / 2 + (k + 0.5) * (w / n);
    cells.push([x, 0.6, 3, h * 0.36, 'room'], [x, h * 0.5 + 1, 3, h * 0.36, 'room']);
  }
  g.add(box(w, h, d - dd, OCHRE, 0, 0, -dd / 2), at(arcadeSkin(w, h, cells, dd, OCHRE, { trim: CREAM }), 0, 0, d / 2 - dd));
  g.add(box(w + 0.6, 0.7, d + 0.6, CREAM, 0, h * 0.5), box(w + 0.6, 0.9, d + 0.6, CREAM, 0, h));
  for (let x = -w / 2; x <= w / 2 + 0.1; x += w / 4) g.add(at(guldasta(3.2, 0.4, CREAM), x, h + 0.9, d / 2 - 0.4));
  return g;
}

export function buildLaxmiVilas() {
  const g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  g.add(box(400, 0.15, 300, M.grass, 0, 0, 40), box(14, 0.25, 150, M.path, 0, 0, 90));
  // Wings stretching from the central block, with domed pavilions at the ends
  f.add(at(wing(200, 16, 26), 0, 0, 0), at(wing(46, 22, 34), 0, 0, 6));
  for (const x of [-100, 100]) f.add(box(20, 20, 30, OCHRE, x, 0, 0), cyl(6, 6, 3, CREAM, x, 20, 0, 24), at(onionDome(6.4, CREAM), x, 23, 0), at(finial(3), x, 34.6, 0));
  for (const x of [-60, -36, 36, 60]) f.add(at(chhatri(3, 8, CREAM), x, 16.9, 8));
  // The central clock tower
  f.add(box(14, 44, 14, OCHRE, 0, 0, 22), box(15, 1, 15, CREAM, 0, 30, 22), box(15, 1, 15, CREAM, 0, 44, 22));
  const face = cyl(3.2, 3.2, 0.4, CREAM, 0, 0, 0, 24);
  face.rotation.x = Math.PI / 2;
  face.position.set(0, 37, 29.2);
  f.add(face, at(chhatri(5.5, 14, CREAM), 0, 45, 22));
  // The entrance porch at the foot of the tower, over a pointed door
  const door = classicalDoor(3, 5, { m: OCHRE, trim: CREAM, shape: 'pointed', top: null, depth: 0.45 });
  f.add(at(porch(14, 7, 7, { m: OCHRE, trim: CREAM, colM: CREAM, cols: 4, r: 0.45, top: 'balustrade', door, stepsDown: 0.6 }), 0, 0.6, 29));
  f.add(box(16, 0.6, 7, CREAM, 0, 0, 32.5));
  addDetails(f, g);
  return { group: g, focus: f, view: [0.45, 0.25, 1.25] };
}

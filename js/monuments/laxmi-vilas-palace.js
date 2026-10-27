import * as THREE from 'three';
import { M, mat, box, cyl, at, onFace, archPanel, onionDome, hemi, finial, chhatri, guldasta } from '../helpers.js';

const OCHRE = mat('#c2774f', 0.85);
const CREAM = mat('#eadfc6', 0.85);

// A long arcaded range with cream bands, for the palace wings.
function wing(w, h, d) {
  const g = new THREE.Group();
  g.add(box(w, h, d, OCHRE), box(w + 0.6, 0.7, d + 0.6, CREAM, 0, h * 0.5), box(w + 0.6, 0.9, d + 0.6, CREAM, 0, h));
  const n = Math.floor(w / 5);
  for (let k = 0; k < n; k++) for (const y of [0.6, h * 0.5 + 1]) g.add(onFace(at(archPanel(3, h * 0.36, true, M.recess, 0.25), 0, y, 0), 0, d / 2, -w / 2 + (k + 0.5) * (w / n)));
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
  return { group: g, focus: f, view: [0.45, 0.25, 1.25] };
}

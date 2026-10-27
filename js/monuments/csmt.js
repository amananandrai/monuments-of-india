import * as THREE from 'three';
import { M, mat, mesh, box, cyl, lathe, at, onFace, archPanel, ribbed, hipRoof } from '../helpers.js';

const SLATE = mat('#5b6067', 0.8);
const BAND = mat('#7e7c78', 0.9);

// A Gothic range: stone block with banded courses, rows of pointed windows and a slate roof.
function range(w, h, d, rows) {
  const g = new THREE.Group();
  g.add(box(w, h, d, M.cream));
  for (let r = 1; r < rows; r++) g.add(box(w + 0.3, 0.5, d + 0.3, BAND, 0, (h / rows) * r - 0.25));
  const n = Math.max(2, Math.floor(w / 3.6));
  for (let r = 0; r < rows; r++) for (let k = 0; k < n; k++) {
    const x = -w / 2 + (k + 0.5) * (w / n), y = (h / rows) * r + 0.9;
    g.add(onFace(at(archPanel(1.6, h / rows - 1.8, true, M.recess, 0.2), 0, y, 0), 0, d / 2, x));
  }
  g.add(at(hipRoof(w + 0.6, d + 0.6, Math.min(w, d) * 0.32, SLATE), 0, h, 0));
  return g;
}
function turret(h, r) {
  const g = new THREE.Group();
  g.add(cyl(r, r, h, M.cream, 0, 0, 0, 8), cyl(r * 1.15, r * 1.15, 0.6, BAND, 0, h * 0.6, 0, 8));
  g.add(cyl(0, r * 1.15, r * 4, SLATE, 0, h, 0, 8));
  return g;
}

export function buildCsmt() {
  const g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  g.add(box(220, 0.2, 160, M.asphalt, 0, 0, 30));
  f.add(box(124, 1, 56, M.concrete, 0, 0, 2));
  // Central block under the great ribbed dome
  f.add(at(range(36, 22, 26, 3), 0, 1, 0));
  for (const x of [-18, 18]) for (const z of [-13, 13]) f.add(at(turret(25, 1.5), x, 1, z));
  const dt = 23;
  f.add(cyl(9, 9, 8, M.cream, 0, dt, 0, 8), cyl(9.5, 9.5, 0.6, BAND, 0, dt + 8, 0, 8));
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * Math.PI * 2 + Math.PI / 8;
    f.add(at(archPanel(2.2, 5.6, true, M.recess, 0.25), Math.sin(a) * 8.6, dt + 1.2, Math.cos(a) * 8.6).rotateY(a));
  }
  f.add(at(ribbed(lathe([[9, 0], [8.8, 3.4], [7.3, 7.6], [4.2, 10.8], [0, 12.6]], M.cream, 8), 8, 0.05), 0, dt + 8.6, 0));
  const lt = dt + 8.6 + 12;
  f.add(cyl(1.4, 1.8, 3, M.cream, 0, lt, 0, 8), cyl(0.5, 0.8, 1.2, M.bronze, 0, lt + 3, 0, 8));
  f.add(cyl(0.45, 0.7, 3.4, M.bronze, 0, lt + 4.2, 0, 10), at(mesh(new THREE.SphereGeometry(0.5, 12, 10), M.bronze), 0, lt + 8, 0));
  f.add(cyl(0.12, 0.12, 3.6, M.bronze, 0.7, lt + 6.4, 0, 6));
  // Side ranges and the two forward wings that frame the forecourt, each ending in a gable and turrets
  for (const s of [-1, 1]) {
    f.add(at(range(30, 16, 16, 2), s * 33, 1, -5));
    f.add(at(range(16, 18, 30, 2).rotateY(s * Math.PI / 2), s * 52, 1, 14));
    for (const x of [s * 44, s * 60]) f.add(at(turret(21, 1.3), x, 1, 29));
    const gable = new THREE.Shape();
    gable.moveTo(-8, 0); gable.lineTo(8, 0); gable.lineTo(0, 7); gable.closePath();
    const gm = mesh(new THREE.ExtrudeGeometry(gable, { depth: 1, bevelEnabled: false }), M.cream, s * 52, 19, 29);
    f.add(gm, onFace(at(archPanel(5, 6, true, M.recess, 0.2), 0, 19.5, 0), 0, 30.05, s * 52));
  }
  return { group: g, focus: f, view: [0.35, 0.3, 1.2] };
}

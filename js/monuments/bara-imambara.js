import * as THREE from 'three';
import { M, mat, box, at, onFace, archPanel, onionDome, finial, hemi, minaret, guldasta } from '../helpers.js';

const LIME = mat('#e6d8b8', 0.85);
const LIME_DARK = mat('#cbb994', 0.85);

// A two-storey Awadhi range: rows of cusped arches and a parapet of guldasta turrets.
function range(w, h, d) {
  const g = new THREE.Group();
  g.add(box(w, h, d, LIME), box(w + 0.6, 0.8, d + 0.6, LIME_DARK, 0, h * 0.5), box(w + 0.6, 0.8, d + 0.6, LIME_DARK, 0, h));
  const n = Math.floor(w / 6.4);
  for (let k = 0; k < n; k++) {
    const x = -w / 2 + (k + 0.5) * (w / n);
    g.add(onFace(at(archPanel(4.4, h * 0.4, true, M.recess, 0.3), 0, 0.6, 0), 0, d / 2, x));
    g.add(onFace(at(archPanel(3.4, h * 0.3, true, M.recess, 0.3), 0, h * 0.55, 0), 0, d / 2, x));
  }
  for (let x = -w / 2; x <= w / 2 + 0.01; x += w / n) g.add(at(guldasta(3.4, 0.45, LIME), x, h + 0.8, d / 2 - 0.4));
  return g;
}

export function buildBaraImambara() {
  const g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  g.add(box(240, 0.15, 230, M.grass, 0, 0, 30), box(14, 0.2, 120, M.path, 0, 0, 50));
  // The imambara: the great vaulted hall, with the Bhool Bhulaiya maze in the roof above it
  f.add(box(90, 1.2, 34, LIME_DARK, 0, 0, -10), at(range(82, 17, 26), 0, 1.2, -10));
  for (const x of [-41, 41]) for (const z of [-23, 3]) f.add(at(guldasta(24, 1.6, LIME), x, 1.2, z));
  for (const x of [-22, 0, 22]) f.add(box(12, 4, 10, LIME, x, 19, -12), at(hemi(4, LIME, 20), x, 23, -12), at(finial(2.4), x, 27, -12));
  // Gateway into the forecourt
  f.add(at(range(40, 15, 10), 0, 0, 62));
  f.add(onFace(at(archPanel(9, 12, true, M.recess, 0.4), 0, 0.3, 0), 0, 67.4));
  // The Asfi Mosque: three domes between two minarets
  const m = new THREE.Group();
  m.add(box(40, 3, 22, LIME_DARK), at(range(36, 13, 16), 0, 3, 0));
  [[-11, 4.2], [0, 5.6], [11, 4.2]].forEach(([x, r]) => m.add(at(onionDome(r, LIME), x, 16.8, -1), at(finial(r * 0.8), x, 16.8 + r * 1.78, -1)));
  for (const x of [-20, 20]) m.add(at(minaret(32, 1.6, LIME, { cap: 'onion' }), x, 3, 8));
  m.rotation.y = Math.PI / 2;
  m.position.set(-78, 0, 24);
  f.add(m);
  return { group: g, focus: f, view: [0.6, 0.35, 1.25] };
}

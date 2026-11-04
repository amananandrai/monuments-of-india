import * as THREE from 'three';
import { M, mat, box, at, onFace, onionDome, finial, hemi, minaret, guldasta } from '../helpers.js';
import { iwan, arcadeSkin } from '../details/mughal.js';
import { addDetails } from '../details/bara-imambara.js';

const LIME = mat('#e6d8b8', 0.85);
const LIME_DARK = mat('#cbb994', 0.85);

// A two-storey Awadhi range: two tiers of arched cells 1.2 m deep along its front (open arcades
// below, screened windows above) and a parapet of guldasta turrets. gap: [from, to] along x left
// clear of cells and of the string course, for an iwan.
function range(w, h, d, gap = null) {
  const g = new THREE.Group(), cd = 1.2;
  g.add(box(w, h, d - cd, LIME, 0, 0, -cd / 2), box(w + 0.6, 0.8, d + 0.6, LIME_DARK, 0, h));
  const spans = gap ? [[-w / 2 - 0.3, gap[0]], [gap[1], w / 2 + 0.3]] : [[-w / 2 - 0.3, w / 2 + 0.3]];
  for (const [a, b] of spans) g.add(box(b - a, 0.8, d + 0.6, LIME_DARK, (a + b) / 2, h * 0.5));
  const n = Math.floor(w / 6.4), cells = [];
  for (let k = 0; k < n; k++) {
    const x = -w / 2 + (k + 0.5) * (w / n);
    if (gap && x > gap[0] - 2 && x < gap[1] + 2) continue;
    cells.push([x, 0.6, 4.4, h * 0.4, 'room'], [x, h * 0.55, 3.4, h * 0.3, 'jali']);
  }
  g.add(at(arcadeSkin(w, h, cells, cd, LIME, { trim: LIME_DARK }), 0, 0, d / 2 - cd));
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
  f.add(at(range(40, 15, 10, [-6, 6]), 0, 0, 62));
  f.add(onFace(iwan(9, 12, { m: LIME, trim: LIME_DARK, shade: LIME_DARK, depth: 1.6, frame: 1.4, top: 1.6 }), 0, 67));
  // The Asfi Mosque: three domes between two minarets
  const m = new THREE.Group();
  m.add(box(40, 3, 22, LIME_DARK), at(range(36, 13, 16), 0, 3, 0));
  [[-11, 4.2], [0, 5.6], [11, 4.2]].forEach(([x, r]) => m.add(at(onionDome(r, LIME), x, 16.8, -1), at(finial(r * 0.8), x, 16.8 + r * 1.78, -1)));
  for (const x of [-20, 20]) m.add(at(minaret(32, 1.6, LIME, { cap: 'onion' }), x, 3, 8));
  m.rotation.y = Math.PI / 2;
  m.position.set(-78, 0, 24);
  f.add(m);
  addDetails(f, g);
  return { group: g, focus: f, view: [0.6, 0.35, 1.25] };
}

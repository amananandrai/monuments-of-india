import * as THREE from 'three';
import { M, mat, box, cyl, at, onFace, FACES, archPanel, onionDome, finial, guldasta, minaret } from '../helpers.js';

const STONE = mat('#a59a86', 0.9);
const PLASTER = mat('#cfc4ae', 0.85);

// A Qutb Shahi tomb: a square chamber on a terrace, ringed by an arcade, under a bulbous dome on a petalled drum.
function tomb(s) {
  const g = new THREE.Group(), w = 20 * s, h = 12 * s;
  g.add(box(w * 1.7, 2 * s, w * 1.7, STONE));
  for (const a of FACES) for (let k = -2; k <= 2; k++) g.add(onFace(at(archPanel(w * 0.2, 3.4 * s, true, M.recess, 0.25), 0, 0.1, 0), a, w * 0.85, k * w * 0.32));
  g.add(box(w * 1.3, 6 * s, w * 1.3, PLASTER, 0, 2 * s));
  for (const a of FACES) for (let k = -1; k <= 1; k++) g.add(onFace(at(archPanel(w * 0.28, 5 * s, true, M.recess, 0.25), 0, 2.4 * s, 0), a, w * 0.65, k * w * 0.4));
  g.add(box(w, h, w, PLASTER, 0, 8 * s));
  for (const x of [-w / 2, w / 2]) for (const z of [-w / 2, w / 2]) g.add(at(guldasta(4 * s, 0.5 * s, PLASTER), x, 8 * s + h, z));
  const top = 8 * s + h;
  g.add(cyl(w * 0.36, w * 0.4, 2 * s, PLASTER, 0, top, 0, 24), at(onionDome(w * 0.38, PLASTER), 0, top + 2 * s, 0), at(finial(3 * s), 0, top + 2 * s + w * 0.68, 0));
  return g;
}

export function buildQutbShahiTombs() {
  const g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  g.add(box(260, 0.15, 220, M.grass));
  for (const [x, z, s] of [[0, 0, 1.3], [-60, -20, 1], [56, -24, 1.05], [-40, 50, 0.85], [40, 54, 0.9], [-90, 40, 0.7], [90, 20, 0.75]]) f.add(at(tomb(s), x, 0, z));
  // The great mosque, with its two minarets
  f.add(box(40, 12, 14, PLASTER, 0, 0, -70));
  for (let k = -3; k <= 3; k++) f.add(onFace(at(archPanel(3.6, 8, true, M.recess, 0.25), 0, 0.4, 0), 0, -63, k * 5.4));
  for (const x of [-20, 20]) f.add(at(minaret(28, 1.6, PLASTER, { cap: 'onion' }), x, 0, -63));
  return { group: g, focus: f, view: [0.6, 0.38, 1.2] };
}

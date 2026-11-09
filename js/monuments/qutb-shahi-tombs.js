import * as THREE from 'three';
import { M, mat, box, cyl, at, onFace, FACES, lathe, finial, guldasta, minaret } from '../helpers.js';
import { arcadeSkin, cellRow } from '../details/mughal.js';
import { addDetails } from '../details/qutb-shahi-tombs.js';

const STONE = mat('#a59a86', 0.9);
const PLASTER = mat('#cfc4ae', 0.85);
const DOME = mat('#a8a49a', 0.9);

// A Qutb Shahi tomb: a square chamber on a high terrace, ringed by an arcade, under a globular grey
// dome on a petalled drum.
function tomb(s) {
  const g = new THREE.Group(), w = 20 * s, h = 12 * s;
  // The terrace, with low arched cells round it, and the arcade round the chamber, whose arches
  // open on a gallery: both built as faces of cells set into the blocks.
  const td = 0.8 * s, ad = 1.2 * s, faceLen = (a, L, d) => (a === 0 || a === Math.PI ? L : L - 2 * d);
  g.add(box(w * 1.7 - 2 * td, 2 * s, w * 1.7 - 2 * td, STONE));
  for (const a of FACES) g.add(onFace(arcadeSkin(faceLen(a, w * 1.7, td), 2 * s, cellRow(5, w * 0.32, 0.1 * s, 1.6 * s, 1.7 * s), td, STONE, { fill: 'none' }), a, w * 0.85 - td));
  g.add(box(w * 1.3 - 2 * ad, 6 * s, w * 1.3 - 2 * ad, PLASTER, 0, 2 * s));
  for (const a of FACES) g.add(onFace(at(arcadeSkin(faceLen(a, w * 1.3, ad), 6 * s, cellRow(3, w * 0.4, 0.4 * s, w * 0.28, 5 * s), ad, PLASTER, { fill: 'room' }), 0, 2 * s, 0), a, w * 0.65 - ad));
  g.add(box(w, h, w, PLASTER, 0, 8 * s));
  for (const x of [-w / 2, w / 2]) for (const z of [-w / 2, w / 2]) g.add(at(guldasta(4 * s, 0.5 * s, PLASTER), x, 8 * s + h, z));
  const top = 8 * s + h;
  // The dome: globular, nearly a sphere swelling out past its drum and drawn in at its foot, in
  // weathered grey plaster (not the pointed onion of the Mughals), with a short finial.
  const r = w * 0.38, prof = [[0.8, 0], [0.98, 0.2], [1.06, 0.5], [1.02, 0.85], [0.86, 1.18], [0.6, 1.42], [0.3, 1.56], [0, 1.6]];
  g.add(cyl(w * 0.36, w * 0.4, 2 * s, PLASTER, 0, top, 0, 24), at(lathe(prof.map(([a, b]) => [a * r, b * r]), DOME, 40), 0, top + 2 * s, 0), at(finial(2.4 * s), 0, top + 2 * s + r * 1.58, 0));
  return g;
}

export function buildQutbShahiTombs() {
  const g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  g.add(box(260, 0.06, 220, M.grass));
  for (const [x, z, s] of [[0, 0, 1.3], [-60, -20, 1], [56, -24, 1.05], [-40, 50, 0.85], [40, 54, 0.9], [-90, 40, 0.7], [90, 20, 0.75]]) f.add(at(tomb(s), x, 0, z));
  // The great mosque, with its two minarets
  f.add(box(40, 12, 13, PLASTER, 0, 0, -70.5));
  f.add(at(arcadeSkin(40, 12, cellRow(7, 5.4, 0.4, 3.6, 8).map((c) => [...c, c[0] === 0 ? 'door' : 'room']), 1, PLASTER), 0, 0, -64));
  for (const x of [-20, 20]) f.add(at(minaret(28, 1.6, PLASTER, { cap: 'onion' }), x, 0, -63));
  addDetails(f, g);
  // Framed on the monument itself, closer than its grounds would set.
  return { group: g, focus: f, view: [0.6, 0.38, 1.2], zoom: 0.65 };
}

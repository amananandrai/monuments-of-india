import * as THREE from 'three';
import { M, mat, at, cyl, onFace, FACES, lathe } from '../helpers.js';
import { star, petalRing, jharokha, merlons, mergeByMaterial } from './components.js';
import { iwan } from './mughal.js';
import { trees, asiBoard, fountains, scatter, along } from './realism.js';

// Safdarjung's Tomb, finer detail. From photographs: either side of each great iwan the face is
// opened in two storeys of small iwans; buff stars are inlaid in the spandrels; the polygonal
// corner towers are banded and carry a small balcony on each storey; merlons run along the roof;
// and the marble dome ends in an inverted lotus.
// Dimensions follow js/monuments/safdarjung-tomb.js: plinth P = 8, the tomb 28 square, 14 high.
//
// Its stone has weathered to a soft brownish red and buff, and its dome is a buff-tinted marble,
// not the white of the Taj; the dome swells well out over its drum before narrowing to the neck.
export const STONE = { red: mat('#b27a5c', 0.88), redLight: mat('#c28f70', 0.88), buff: mat('#d8bd93', 0.86), dome: mat('#e6d8bd', 0.6) };
export function bulbousDome(r, m) {
  return lathe([[0.8, 0], [0.98, 0.1], [1.13, 0.34], [1.17, 0.6], [1.05, 0.9], [0.78, 1.17], [0.45, 1.42], [0.18, 1.63], [0.05, 1.79], [0, 1.85]].map(([a, b]) => [a * r, b * r]), m, 48);
}
function architecture(f) {
  const d = new THREE.Group(), P = 8, Rd = STONE.red, Bf = STONE.buff, Mb = STONE.dome;
  for (const a of FACES) {
    for (const lat of [-9.2, 9.2]) for (const [y, fill] of [[0.6, 'door'], [7.4, 'jali']]) {
      d.add(onFace(at(iwan(3.2, 5, { m: Rd, trim: Bf, shade: STONE.redLight, depth: 0.8, frame: 0.5, top: 0.4, fill }), 0, P + y, 0), a, 14, lat));
    }
    for (const x of [-3.3, 3.3]) d.add(onFace(at(star(8, 0.55, Mb), 0, P + 13.4, 0), a, 15.82, x));
    d.add(onFace(at(merlons(23, 0.7, 0.9, 0.3, Rd, 0.35), 0, P + 14.8, 0), a, 14.2));
  }
  for (const x of [-14, 14]) for (const z of [-14, 14]) {
    const t = at(new THREE.Group(), x, P, z), out = Math.atan2(x, z);
    for (const y of [4.6, 9.4]) t.add(cyl(2.55, 2.55, 0.35, Bf, 0, y, 0, 8));
    for (const y of [5.2, 10]) t.add(onFace(at(jharokha(1.3, 1.9, Rd, { d: 0.7, roof: 'dome', trim: Bf }), 0, y, 0), out, 2.4 * Math.cos(Math.PI / 8) + 0.02));
    d.add(t);
  }
  d.add(at(petalRing(1.2, 14, 1.8, 0.85, Math.PI - 0.55, Mb), 0, P + 18.8 + 9.4 * 1.8, 0));
  mergeByMaterial(d);
  f.add(d);
}

// Safdarjung's Tomb, the last great Mughal garden tomb: fountains along the water channels of the
// charbagh, cypresses and mango trees in its squares as a Mughal garden had, and the ASI board at
// the gate.
export function addDetails(f, g) {
  architecture(f);
  const jets = [];
  for (const s of [-1, 1]) jets.push(...along(3, [0, s * 40], [0, s * 74]), ...along(3, [s * 40, 0], [s * 74, 0]));
  g.add(fountains(jets, { y: 0.35, h: 1.8 }));
  const sq = scatter(36, [-80, 80, -80, 80], { seed: 3, gap: 12 }).filter(([x, z]) => Math.abs(x) > 7 && Math.abs(z) > 7 && (Math.abs(x) > 36 || Math.abs(z) > 36));
  g.add(trees(sq.slice(0, 18), { kind: 'cypress', seed: 4 }), trees(sq.slice(18), { kind: 'mango', seed: 5 }));
  g.add(asiBoard("Safdarjung's Tomb", 9, 96, 0));
}

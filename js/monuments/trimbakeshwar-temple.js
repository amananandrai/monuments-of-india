import * as THREE from 'three';
import { M, mat, mesh, box, cyl, at, kalash, flag, shikhara } from '../helpers.js';
import { nagaraTemple, bhumijaRows, trabeateGate, wallWithGaps } from '../details/temples.js';
import { steps } from '../details/doorways.js';
import { instances, miniSpireGeo } from '../details/sculpture.js';
import { heightField, rough, smooth } from '../details/terrain.js';
import { addDetails } from '../details/trimbakeshwar-temple.js';

const BASALT = mat('#3d3a37', 0.8);
const SHADE = mat('#2c2a28', 0.85);

export function buildTrimbakeshwar() {
  const g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  // The flat-topped Brahmagiri hills behind, where the Godavari rises
  // Brahmagiri: a long flat-topped Deccan trap ridge, its sides basalt cliffs in level steps above
  // grassy slopes, behind the town to the north.
  g.add(heightField(900, 360, 160, (x, z) => {
    const dz = (z + 430) / 110, dx = (x + 60) / 330, e = Math.pow(Math.abs(dx) ** 3 + Math.abs(dz) ** 3, 1 / 3) + rough(x, z, 0.04, 0.6);
    const step = Math.floor(smooth(1.6, 0.95, e) * 4) / 4;
    return Math.max(0, 140 * (0.25 * smooth(1.9, 1.2, e) + 0.75 * step) + rough(x, z, 3, 0.5) * smooth(1.9, 1, e)) - 0.5;
  }, { cz: -430, cx: -60, rock: ['#4d4943', '#5c5750'], cover: '#6c7650', steep: 0.7, band: 30 }), box(200, 0.2, 200, M.path));
  // Walled courtyard round the black basalt temple
  const WALL = mat('#5d5853', 0.9);
  f.add(box(80, 6, 2, WALL, 0, 0, -45), wallWithGaps('x', 80, 6, 2, WALL, [[0, 19.6]], 0, 45));
  for (const s of [-1, 1]) f.add(box(2, 6, 90, WALL, s * 40, 0, 0));
  // The south gate: a passage through the gatehouse on a raised sill, with steps up to it from the
  // street and down from it into the court.
  f.add(box(20, 1.2, 8, SHADE, 0, 0, 45), at(trabeateGate(20, 9, 8, 4.4, 6, { m: BASALT, trim: SHADE }), 0, 1.2, 45));
  f.add(at(steps(6, 1.2, 4, SHADE, 0.4), 0, 0, 49), at(steps(6, 1.2, 4, SHADE, 0.4), 0, 0, 41).rotateY(Math.PI));
  // The temple Nanasaheb Peshwa built: its tall spire banded with rows of miniature spires (the
  // Maratha Bhumija manner), under a great gilded kalash and the flag.
  const prof = (t) => 1 - 0.6 * Math.pow(t, 1.45);
  const crown = new THREE.Group().add(kalash(3, M.gold), at(flag(4.5, M.saffron), 0, 3, 0));
  f.add(at(nagaraTemple({ w: 13, h: 28, m: BASALT, shade: SHADE, plinth: 2.4, urus: 0, prof, crown, halls: [[15, 8, 5], [11, 6, 4]] }), 0, 0, -24));
  f.add(at(instances(miniSpireGeo(), bhumijaRows(13, 28, prof, 10), BASALT), 0, 2.4 + 13 * 0.7, -24));
  // The Kushavarta tank in the town, where the Godavari is held to surface: a square kund stepping
  // down on all sides to the water, a veranda of arches round it, and a small shrine at each corner.
  // It stands on a podium 2.4 m high, so its steps can drop within it to the water.
  const k = at(new THREE.Group(), 78, 0, 6), KS = mat('#6e6760', 0.9), P = 2.4;
  const frame = (wo, wi, y0, h, m) => { const t = (wo - wi) / 2; for (const s of [-1, 1]) k.add(box(wo, h, t, m, 0, y0, s * (wo - t) / 2), box(t, h, wi, m, s * (wo - t) / 2, y0, 0)); };
  frame(40, 34, 0, P, KS);
  for (let i = 0; i < 6; i++) frame(34 - i * 2.4, 34 - (i + 1) * 2.4, 0.2, P - 0.2 - i * 0.34, KS);
  k.add(box(19.6, 0.5, 19.6, M.lake, 0, 0.2, 0));
  for (const s of [-1, 1]) for (const ax of ['x', 'z']) {
    k.add(ax === 'x' ? box(40, 4, 1.6, KS, 0, P, s * 19.2) : box(1.6, 4, 37.2, KS, s * 19.2, P, 0));
    k.add(ax === 'x' ? box(41, 0.6, 5, SHADE, 0, P + 4, s * 18) : box(5, 0.6, 41, SHADE, s * 18, P + 4, 0));
    for (let j = -3; j <= 3; j++) k.add(ax === 'x' ? cyl(0.3, 0.3, 4, KS, j * 5, P, s * 16.4, 8) : cyl(0.3, 0.3, 4, KS, s * 16.4, P, j * 5, 8));
  }
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) k.add(box(4, 3, 4, BASALT, sx * 17.5, P + 4.6, sz * 17.5), at(shikhara(3.6, 4, BASALT, prof, 6), sx * 17.5, P + 7.6, sz * 17.5));
  g.add(k);
  addDetails(f, g);
  return { group: g, focus: f, view: [0.85, 0.36, 1.15] };
}

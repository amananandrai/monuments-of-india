import * as THREE from 'three';
import { M, box, at, onFace, FACES, archWall } from '../helpers.js';
import { arcadeSkin, cellRow } from '../details/mughal.js';
import { charminarMinaret, addCharminarDetails } from '../details/charminar.js';
import { addDetails } from '../details/charminar.js';

export function buildCharminar() {
  const m = M.plaster, g = new THREE.Group();
  g.add(box(32, 0.8, 32, M.granite));
  const b = 0.8;
  // Four arched faces round the open square at the centre, so each arch looks through to the others.
  const t = 2;
  for (const sz of [-1, 1]) g.add(at(archWall(20, 21, t, 11, 16.5, true, m), 0, b, sz * (10 - t / 2)));
  for (const sx of [-1, 1]) g.add(at(archWall(20 - 2 * t, 21, t, 11, 16.5, true, m), sx * (10 - t / 2), b, 0).rotateY(Math.PI / 2));
  g.add(box(21.6, 0.9, 21.6, m, 0, b + 21));
  // The two galleries: arcades 0.6 m deep opening onto the dim galleries behind them.
  const d1 = 0.6, d2 = 0.5, len = (a, L, d) => (a === 0 || a === Math.PI ? L : L - 2 * d);
  g.add(box(19.6 - 2 * d1, 4.6, 19.6 - 2 * d1, m, 0, b + 21.9));
  for (const a of FACES) g.add(onFace(at(arcadeSkin(len(a, 19.6, d1), 4.6, cellRow(5, 3.2, 0.5, 1.8, 3.2), d1, m, { ring: false, fill: 'room' }), 0, b + 21.9, 0), a, 9.8 - d1));
  g.add(box(21, 0.7, 21, m, 0, b + 26.5));
  g.add(box(18.6 - 2 * d2, 3.6, 18.6 - 2 * d2, m, 0, b + 27.2));
  for (const a of FACES) g.add(onFace(at(arcadeSkin(len(a, 18.6, d2), 3.6, cellRow(7, 2.4, 0.4, 1.5, 2.6), d2, m, { ring: false, fill: 'room' }), 0, b + 27.2, 0), a, 9.3 - d2));
  g.add(box(19.2, 1, 19.2, m, 0, b + 30.8));
  // The minarets, with their balconies, windows and domes, and the carving, clocks, galleries and
  // parapet of the faces: see js/details/charminar.js.
  for (const x of [-10, 10]) for (const z of [-10, 10]) g.add(at(charminarMinaret(m, Math.atan2(x, z)), x, b, z));
  addCharminarDetails(g, { b });
  addDetails(g, g);
  return { group: g };
}

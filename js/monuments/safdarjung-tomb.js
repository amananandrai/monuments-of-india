import * as THREE from 'three';
import { M, box, cyl, at, onFace, FACES, onionDome, finial, chhatri } from '../helpers.js';
import { iwan, arcadeSkin, cellRow } from '../details/mughal.js';

export function buildSafdarjung() {
  const Rd = M.red, Bf = M.buff, Mb = M.marble, g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  // Walled charbagh with water channels and corner pavilions
  g.add(box(170, 0.15, 170, M.grass));
  for (const [w, d] of [[4, 170], [170, 4]]) g.add(box(w + 4, 0.25, d + 4, M.path), box(w, 0.35, d, M.water));
  for (const s of [-1, 1]) g.add(box(172, 6, 2, Rd, 0, 0, s * 85), box(2, 6, 172, Rd, s * 85, 0, 0));
  for (const x of [-85, 85]) for (const z of [-85, 85]) g.add(box(10, 7, 10, Rd, x, 0, z), at(chhatri(3, 7, Rd, Mb), x, 7, z));
  g.add(box(30, 14, 12, Rd, 0, 0, 85), onFace(iwan(9, 11, { m: Rd, trim: Bf, shade: M.redLight, depth: 1.8, frame: 1.6, top: 1.8 }), 0, 91));
  // Arcaded plinth: arched cells 1.3 m deep, each with a door at its back
  const cd = 1.3;
  f.add(box(60 - 2 * cd, 8, 60 - 2 * cd, Rd), box(61, 0.6, 61, Bf, 0, 7.6));
  for (const a of FACES) f.add(onFace(arcadeSkin(a === 0 || a === Math.PI ? 60 : 60 - 2 * cd, 7.6, cellRow(9, 6.2, 0.6, 3.8, 6), cd, Rd, { trim: Bf }), a, 30 - cd));
  // The tomb: buff-framed iwans, polygonal corner towers and the marble dome
  const P = 8;
  f.add(box(28, 14, 28, Rd, 0, P), box(29, 0.8, 29, Bf, 0, P + 14));
  for (const a of FACES) f.add(onFace(at(iwan(8, 12.5, { m: Bf, trim: Mb, shade: M.redLight, depth: 1.8, frame: 2, top: 2.5 }), 0, P, 0), a, 14));
  for (const x of [-14, 14]) for (const z of [-14, 14]) f.add(cyl(2.4, 2.4, 18, Rd, x, P, z, 8), cyl(2.8, 2.8, 0.5, Bf, x, P + 14, z, 8), at(chhatri(2.2, 6, Bf, Mb), x, P + 18, z));
  f.add(cyl(9, 9, 4, Mb, 0, P + 14.8, 0, 40), at(onionDome(9.4, Mb), 0, P + 18.8, 0), at(finial(5), 0, P + 18.8 + 16.7, 0));
  return { group: g, focus: f, view: [0.7, 0.34, 1.25] };
}

import * as THREE from 'three';
import { M, box, cyl, at, onFace, FACES, finial, chhatri, chamferPrism, persianDome } from '../helpers.js';
import { iwan, arcadeSkin, cellRow } from '../details/mughal.js';

export function buildHumayun() {
  const Rd = M.red, Mb = M.marble, g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  g.add(box(280, 0.15, 280, M.grass));
  for (const [w, d] of [[4, 280], [280, 4]]) g.add(box(w + 4, 0.25, d + 4, M.path), box(w, 0.35, d, M.water));
  // Arcaded plinth: a ring of arched cells 1.4 m deep, the stairs rising between them in the middle
  // of each side.
  const P = 6.5, S = 48, cd0 = 1.4;
  f.add(box(96 - 2 * cd0, P, 96 - 2 * cd0, Rd), box(97, 0.6, 97, Mb, 0, P - 0.6, 0));
  for (const a of FACES) {
    const len = a === 0 || a === Math.PI ? 96 : 96 - 2 * cd0;
    f.add(onFace(arcadeSkin(len, P - 0.6, cellRow(15, 6, 0.5, 3.6, 5, [[-1, 1]]), cd0, Rd, { trim: Mb }), a, S - cd0));
    for (let k = 0; k < 4; k++) f.add(onFace(box(10, P - k * 1.6, 2, Rd, 0, 0, 0), a, S + 1 + k * 2));
  }
  // The tomb: chamfered square with white-framed iwans
  const s = 24, c = 8, H = 18;
  f.add(at(chamferPrism(s, c, H, Rd), 0, P, 0), box(2 * s + 0.6, 1.6, 2 * s + 0.6, Mb, 0, P + H - 1));
  // Each face: a deep iwan in red sandstone outlined in white marble, a door at its back; on each
  // chamfer, a smaller iwan with a door below and a screened one above.
  for (const a of FACES) {
    f.add(onFace(at(iwan(13, 17, { m: Rd, trim: Mb, shade: M.redLight, depth: 2.4, frame: 2.5, top: 3, crest: true }), 0, P, 0), a, s));
    const ca = a + Math.PI / 4, cd = (s - c / 2) * Math.SQRT2;
    for (const [y, fill] of [[1, 'door'], [10, 'jali']]) f.add(onFace(at(iwan(5, 7.5, { m: Rd, trim: Mb, shade: M.redLight, depth: 1.1, frame: 0.7, top: 0.45, fill }), 0, P + y, 0), ca, cd));
  }
  for (const x of [-14, 14]) for (const z of [-14, 14]) f.add(at(chhatri(3, 8, Rd, Mb), x, P + H, z));
  f.add(cyl(12.5, 12.5, 5, Mb, 0, P + H, 0, 48), cyl(13, 13, 0.6, Rd, 0, P + H + 4.4, 0, 48));
  f.add(at(persianDome(12, Mb), 0, P + H + 5, 0), at(finial(5), 0, P + H + 5 + 15, 0));
  return { group: g, focus: f, view: [0.9, 0.36, 1.25] };
}

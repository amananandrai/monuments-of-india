import * as THREE from 'three';
import { M, box, at, onFace, FACES, chhatri, minaret } from '../helpers.js';
import { iwan, arcadeSkin, cellRow } from '../details/mughal.js';
import { addDetails } from '../details/akbars-tomb.js';

export function buildAkbarsTomb() {
  const Rd = M.red, Rl = M.redLight, Mb = M.marble, g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  g.add(box(220, 0.15, 300, M.grass, 0, 0, 40), box(10, 0.25, 110, M.path, 0, 0, 90));
  // The arcaded ground storey: cells 1.4 m deep, and a tall iwan in the middle of each side
  const cd = 1.4;
  f.add(box(100 - 2 * cd, 9, 100 - 2 * cd, Rd), box(101, 0.8, 101, Mb, 0, 8.2));
  for (const a of FACES) {
    f.add(onFace(arcadeSkin(a === 0 || a === Math.PI ? 100 : 100 - 2 * cd, 8.2, cellRow(15, 6.4, 0.5, 4.4, 7, [[-9, 9]]), cd, Rd, { trim: Mb }), a, 50 - cd));
    f.add(onFace(iwan(10, 14, { m: Rd, trim: Mb, shade: Rl, depth: 2.6, frame: 3, top: 2 }), a, 50));
  }
  // Three pavilioned storeys stepping inward
  let y = 9;
  for (const [w, h] of [[72, 6], [58, 5], [46, 4.5]]) {
    f.add(box(w, h, w, Rd, 0, y), box(w + 0.8, 0.6, w + 0.8, Rl, 0, y + h));
    y += h + 0.6;
    for (const x of [-1, 0, 1]) for (const z of [-1, 0, 1]) if (x || z) f.add(at(chhatri(2.4, 7, Rd, Mb), x * (w / 2 - 3), y, z * (w / 2 - 3)));
  }
  // The open white marble terrace on top, with screen walls and corner kiosks
  f.add(box(40, 1, 40, Mb, 0, y), box(3, 1.2, 1.6, Mb, 0, y + 1, 0));
  for (const s of [-1, 1]) f.add(box(40, 3.4, 0.5, Mb, 0, y + 1, s * 19.8), box(0.5, 3.4, 40, Mb, s * 19.8, y + 1, 0));
  for (const x of [-19, 19]) for (const z of [-19, 19]) f.add(at(chhatri(1.7, 5, Mb), x, y + 1, z));
  // The southern gateway, the first Mughal gate with four marble minarets
  const gw = new THREE.Group();
  gw.add(box(40, 22, 16, Rd), box(41, 1, 17, Mb, 0, 22), onFace(iwan(14, 18, { m: Mb, trim: Rl, shade: M.marbleShade, depth: 2.5, frame: 3, top: 2 }), 0, 8));
  for (const x of [-18, 18]) for (const z of [-6.5, 6.5]) gw.add(at(minaret(20, 1.3, Mb, { balconies: 2 }), x, 23, z));
  g.add(at(gw, 0, 0, 140));
  addDetails(f, g);
  return { group: g, focus: f, view: [0.7, 0.34, 1.2] };
}

import * as THREE from 'three';
import { M, box, cyl, at, chhatri, onionDome } from '../helpers.js';
import { iwan } from '../details/mughal.js';
import { addDetails } from '../details/buland-darwaza.js';

export function buildBulandDarwaza() {
  const Rd = M.red, Rl = M.redLight, Mb = M.marble, g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  g.add(box(220, 0.2, 200, M.path, 0, 0, 20));
  // The high platform and its broad flight of steps
  const P = 13;
  f.add(box(70, P, 30, Rd, 0, 0, -4));
  for (let k = 0; k < 10; k++) f.add(box(48 - k * 0.8, P - k * 1.3, 3, Rl, 0, 0, 12.5 + k * 3));
  // The gate: a great iwan 6 m deep under its half-dome, outlined in white marble, with the
  // doorway and a screened window at its back; flanked by angled wings
  f.add(box(42, 38, 14, Rd, 0, P, -5), box(43, 1, 21, Mb, 0, P + 38, -2));
  for (const s of [-1, 1]) f.add(box(5.5, 38, 6, Rd, s * 18.25, P, 5));
  f.add(box(31, 3, 6, Rd, 0, P + 35, 5));
  f.add(at(iwan(26, 32, { m: Rd, trim: Mb, shade: Rl, depth: 6, frame: 2.5, top: 3, door: [6, 8.5], rosettes: true }), 0, P, 2));
  for (const s of [-1, 1]) {
    const w = box(12, 30, 14, Rd, 0, P, 0);
    w.position.set(s * 24.5, P + 15, 1);
    w.rotation.y = -s * Math.PI / 5;
    f.add(w);
    for (const y of [P + 2, P + 15]) f.add(at(iwan(4, 8, { m: Rd, trim: Mb, shade: Rl, depth: 0.8, frame: 0.5, top: 0.6, fill: 'jali', band: false }), s * 24.5 + s * 2.6, y, 6.6).rotateY(-s * Math.PI / 5));
    f.add(cyl(1.7, 1.7, 41, Rd, s * 21, P, 8.2, 8), at(onionDome(1.8, Mb), s * 21, P + 41, 8.2));
  }
  // Rows of kiosks along the top
  for (let k = 0; k < 13; k++) f.add(at(chhatri(1.25, 4.2, Rd, Mb), -18 + k * 3, P + 39, 6.5));
  for (const x of [-13, 0, 13]) f.add(at(chhatri(3, 8, Rd, Mb), x, P + 39, -5));
  // Courtyard wall of the Jama Masjid behind
  f.add(box(130, 10, 3, Rd, 0, P, -14));
  addDetails(f, g);
  return { group: g, focus: f, view: [0.5, 0.25, 1.25] };
}

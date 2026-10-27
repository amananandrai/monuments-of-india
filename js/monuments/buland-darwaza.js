import * as THREE from 'three';
import { M, box, cyl, at, onFace, archPanel, chhatri, onionDome } from '../helpers.js';

export function buildBulandDarwaza() {
  const Rd = M.red, Rl = M.redLight, Mb = M.marble, g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  g.add(box(220, 0.2, 200, M.path, 0, 0, 20));
  // The high platform and its broad flight of steps
  const P = 13;
  f.add(box(70, P, 30, Rd, 0, 0, -4));
  for (let k = 0; k < 10; k++) f.add(box(48 - k * 0.8, P - k * 1.3, 3, Rl, 0, 0, 12.5 + k * 3));
  // The gate: a great iwan framed in white marble, flanked by angled wings
  f.add(box(42, 38, 20, Rd, 0, P, -2), box(43, 1, 21, Mb, 0, P + 38, -2));
  f.add(onFace(box(31, 35, 1, Mb, 0, P), 0, 8.5));
  f.add(onFace(at(archPanel(26, 32, true, Rl, 0.5), 0, P + 0.4, 0), 0, 9));
  f.add(onFace(at(archPanel(19, 26, true, M.recess, 0.4), 0, P + 0.4, 0), 0, 9.5));
  f.add(onFace(at(archPanel(6.5, 11, true, M.stoneDark, 0.3), 0, P + 0.4, 0), 0, 9.9));
  for (const s of [-1, 1]) {
    const w = box(12, 30, 14, Rd, 0, P, 0);
    w.position.set(s * 24.5, P + 15, 1);
    w.rotation.y = -s * Math.PI / 5;
    f.add(w);
    for (const y of [P + 2, P + 15]) f.add(at(archPanel(4, 8, true, M.recess, 0.3), s * 24.5 + s * 2.6, y, 6.6).rotateY(-s * Math.PI / 5));
    f.add(cyl(1.7, 1.7, 41, Rd, s * 21, P, 8.2, 8), at(onionDome(1.8, Mb), s * 21, P + 41, 8.2));
  }
  // Rows of kiosks along the top
  for (let k = 0; k < 13; k++) f.add(at(chhatri(1.25, 4.2, Rd, Mb), -18 + k * 3, P + 39, 6.5));
  for (const x of [-13, 0, 13]) f.add(at(chhatri(3, 8, Rd, Mb), x, P + 39, -5));
  // Courtyard wall of the Jama Masjid behind
  f.add(box(130, 10, 3, Rd, 0, P, -14));
  return { group: g, focus: f, view: [0.5, 0.25, 1.25] };
}

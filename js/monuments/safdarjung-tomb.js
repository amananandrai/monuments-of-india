import * as THREE from 'three';
import { M, box, cyl, at, onFace, FACES, archPanel, onionDome, finial, chhatri } from '../helpers.js';

export function buildSafdarjung() {
  const Rd = M.red, Bf = M.buff, Mb = M.marble, g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  // Walled charbagh with water channels and corner pavilions
  g.add(box(170, 0.15, 170, M.grass));
  for (const [w, d] of [[4, 170], [170, 4]]) g.add(box(w + 4, 0.25, d + 4, M.path), box(w, 0.35, d, M.water));
  for (const s of [-1, 1]) g.add(box(172, 6, 2, Rd, 0, 0, s * 85), box(2, 6, 172, Rd, s * 85, 0, 0));
  for (const x of [-85, 85]) for (const z of [-85, 85]) g.add(box(10, 7, 10, Rd, x, 0, z), at(chhatri(3, 7, Rd, Mb), x, 7, z));
  g.add(box(30, 14, 12, Rd, 0, 0, 85), onFace(at(archPanel(9, 11, true, M.recess, 0.3), 0, 0.3, 0), 0, 91));
  // Arcaded plinth
  f.add(box(60, 8, 60, Rd), box(61, 0.6, 61, Bf, 0, 7.6));
  for (const a of FACES) for (let k = -4; k <= 4; k++) f.add(onFace(at(archPanel(3.8, 6, true, M.recess, 0.25), 0, 0.6, 0), a, 30, k * 6.2));
  // The tomb: buff-framed iwans, polygonal corner towers and the marble dome
  const P = 8;
  f.add(box(28, 14, 28, Rd, 0, P), box(29, 0.8, 29, Bf, 0, P + 14));
  for (const a of FACES) {
    f.add(onFace(box(12, 15, 0.8, Bf, 0, P), a, 14.4));
    f.add(onFace(at(archPanel(8, 12.5, true, M.recess, 0.3), 0, P + 0.4, 0), a, 14.82));
  }
  for (const x of [-14, 14]) for (const z of [-14, 14]) f.add(cyl(2.4, 2.4, 18, Rd, x, P, z, 8), cyl(2.8, 2.8, 0.5, Bf, x, P + 14, z, 8), at(chhatri(2.2, 6, Bf, Mb), x, P + 18, z));
  f.add(cyl(9, 9, 4, Mb, 0, P + 14.8, 0, 40), at(onionDome(9.4, Mb), 0, P + 18.8, 0), at(finial(5), 0, P + 18.8 + 16.7, 0));
  return { group: g, focus: f, view: [0.7, 0.34, 1.25] };
}

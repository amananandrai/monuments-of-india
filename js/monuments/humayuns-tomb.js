import * as THREE from 'three';
import { M, box, cyl, group, at, onFace, FACES, archPanel, finial, chhatri, chamferPrism, persianDome } from '../helpers.js';

export function buildHumayun() {
  const Rd = M.red, Mb = M.marble, g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  g.add(box(280, 0.15, 280, M.grass));
  for (const [w, d] of [[4, 280], [280, 4]]) g.add(box(w + 4, 0.25, d + 4, M.path), box(w, 0.35, d, M.water));
  // Arcaded plinth
  const P = 6.5, S = 48;
  f.add(box(96, P, 96, Rd), box(97, 0.6, 97, Mb, 0, P - 0.6, 0));
  for (const a of FACES) {
    for (let k = -7; k <= 7; k++) if (k) f.add(onFace(at(archPanel(3.6, 5, true, M.recess, 0.2), 0, 0.5, 0), a, S, k * 6));
    for (let k = 0; k < 4; k++) f.add(onFace(box(10, P - k * 1.6, 2, Rd, 0, 0, 0), a, S + 1 + k * 2));
  }
  // The tomb: chamfered square with white-framed iwans
  const s = 24, c = 8, H = 18;
  f.add(at(chamferPrism(s, c, H, Rd), 0, P, 0), box(2 * s + 0.6, 1, 2 * s + 0.6, Mb, 0, P + H - 1));
  for (const a of FACES) {
    f.add(onFace(box(18, H + 2, 1.2, Mb, 0, P), a, s + 0.6));
    f.add(onFace(at(archPanel(13, 17, true, M.redLight, 0.3), 0, P + 0.4, 0), a, s + 1.2));
    f.add(onFace(at(archPanel(6, 9, true, M.recess, 0.3), 0, P + 0.4, 0), a, s + 1.52));
    const ca = a + Math.PI / 4, cd = (s - c / 2) * Math.SQRT2;
    for (const y of [1, 10]) f.add(onFace(at(archPanel(5, 7.5, true, M.recess, 0.25), 0, P + y, 0), ca, cd));
  }
  for (const x of [-14, 14]) for (const z of [-14, 14]) f.add(at(chhatri(3, 8, Rd, Mb), x, P + H, z));
  f.add(cyl(12.5, 12.5, 5, Mb, 0, P + H, 0, 48), cyl(13, 13, 0.6, Rd, 0, P + H + 4.4, 0, 48));
  f.add(at(persianDome(12, Mb), 0, P + H + 5, 0), at(finial(5), 0, P + H + 5 + 15, 0));
  return { group: g, focus: f, view: [0.9, 0.36, 1.25] };
}

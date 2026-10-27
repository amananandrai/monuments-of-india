import * as THREE from 'three';
import { M, mat, box, cyl, at, onFace, FACES, archPanel, onionDome, finial, chhatri, minaret, chamferPrism } from '../helpers.js';

const PLASTER = mat('#ebe4d6', 0.8);

export function buildBibiKaMaqbara() {
  const Mb = M.marble, g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  // Garden with the long water channel leading from the gateway
  g.add(box(180, 0.15, 260, M.grass, 0, 0, 50), box(6, 0.4, 110, M.water, 0, 0, 95), box(10, 0.3, 112, M.path, 0, 0, 95));
  g.add(box(36, 14, 10, PLASTER, 0, 0, 155), onFace(at(archPanel(10, 11, true, M.recess, 0.3), 0, 0.3, 0), 0, 160));
  // Raised platform with a minaret at each corner, as at the Taj Mahal
  f.add(box(72, 5, 72, PLASTER), box(73, 0.6, 73, M.marbleShade, 0, 4.4));
  for (const x of [-33, 33]) for (const z of [-33, 33]) f.add(at(minaret(30, 1.8, PLASTER, { capM: Mb }), x, 5, z));
  // Chamfered tomb with tall iwans, a marble dome and corner kiosks
  const P = 5, s = 16, c = 5.5, H = 18;
  f.add(at(chamferPrism(s, c, H, PLASTER), 0, P, 0), box(2 * s + 0.6, 0.8, 2 * s + 0.6, M.marbleShade, 0, P + H - 0.8));
  for (const a of FACES) {
    f.add(onFace(box(13, H + 2, 1, PLASTER, 0, P), a, s + 0.5));
    f.add(onFace(at(archPanel(9, 15, true, M.marbleShade, 0.3), 0, P + 0.4, 0), a, s + 1));
    f.add(onFace(at(archPanel(4.4, 7, true, M.recess, 0.3), 0, P + 0.4, 0), a, s + 1.32));
  }
  for (const x of [-s + 2.5, s - 2.5]) for (const z of [-s + 2.5, s - 2.5]) f.add(at(chhatri(2.4, 7, PLASTER, Mb), x, P + H, z));
  f.add(cyl(8.4, 8.4, 4.4, Mb, 0, P + H, 0, 40), at(onionDome(8.8, Mb), 0, P + H + 4.4, 0), at(finial(5), 0, P + H + 4.4 + 15.6, 0));
  return { group: g, focus: f, view: [0.6, 0.32, 1.25] };
}

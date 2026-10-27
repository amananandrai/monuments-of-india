import * as THREE from 'three';
import { M, box, at, onFace, FACES, archPanel, chhatri, minaret } from '../helpers.js';

export function buildAkbarsTomb() {
  const Rd = M.red, Rl = M.redLight, Mb = M.marble, g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  g.add(box(220, 0.15, 300, M.grass, 0, 0, 40), box(10, 0.25, 110, M.path, 0, 0, 90));
  // The arcaded ground storey
  f.add(box(100, 9, 100, Rd), box(101, 0.8, 101, Mb, 0, 8.2));
  for (const a of FACES) {
    for (let k = -7; k <= 7; k++) if (k) f.add(onFace(at(archPanel(4.4, 7, true, M.recess, 0.25), 0, 0.5, 0), a, 50, k * 6.4));
    f.add(onFace(box(16, 16, 2, Rd, 0, 0), a, 51), onFace(at(archPanel(10, 14, true, M.recess, 0.3), 0, 0.5, 0), a, 52));
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
  gw.add(box(40, 22, 16, Rd), box(41, 1, 17, Mb, 0, 22), onFace(box(20, 20, 1, Mb, 0, 0), 0, 8.4), onFace(at(archPanel(14, 18, true, M.recess, 0.4), 0, 0.3, 0), 0, 8.9));
  for (const x of [-18, 18]) for (const z of [-6.5, 6.5]) gw.add(at(minaret(20, 1.3, Mb, { balconies: 2 }), x, 23, z));
  f.add(at(gw, 0, 0, 140));
  return { group: g, focus: f, view: [0.7, 0.34, 1.2] };
}

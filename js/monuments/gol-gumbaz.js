import * as THREE from 'three';
import { M, box, cyl, group, at, onFace, FACES, archPanel, onionDome, hemi, finial } from '../helpers.js';

export function buildGolGumbaz() {
  const D = M.deccan, Dl = M.deccanLight, g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  g.add(box(120, 0.25, 120, M.path));
  f.add(box(60, 1.5, 60, D));
  const b = 1.5, H = 27, s = 23.75;
  f.add(box(47.5, H, 47.5, D, 0, b, 0));
  f.add(box(50.5, 1.2, 50.5, Dl, 0, b + H - 5.2));
  for (const a of FACES) {
    f.add(onFace(at(archPanel(15, 22, true, Dl, 0.4), 0, b + 0.5, 0), a, s));
    f.add(onFace(at(archPanel(4, 6, true, M.recess, 0.3), 0, b + 0.5, 0), a, s + 0.42));
    for (const lat of [-13.5, 13.5]) for (const y of [1, 11.5]) f.add(onFace(at(archPanel(7, 9, true, Dl, 0.4), 0, b + y, 0), a, s, lat));
    for (let k = -7; k <= 7; k++) f.add(onFace(at(archPanel(1.6, 2.6, true, M.recess, 0.2), 0, b + H - 3.6, 0), a, s, k * 2.6));
  }
  // Seven-storey octagonal towers at the corners
  for (const x of [-s, s]) for (const z of [-s, s]) {
    for (let i = 0; i < 7; i++) {
      f.add(cyl(3.9, 4.1, 4.6, D, x, b + i * 5, z, 8));
      f.add(cyl(4.5, 4.5, 0.4, Dl, x, b + i * 5 + 4.6, z, 8));
    }
    f.add(at(onionDome(3.7, Dl), x, b + 35, z), at(finial(3), x, b + 35 + 6.6, z));
  }
  // Drum ringed with leaf-shaped petals, then the great dome
  f.add(cyl(23.5, 23.5, 2.6, D, 0, b + H, 0, 64));
  for (let k = 0; k < 40; k++) f.add(onFace(at(archPanel(3.4, 4.4, true, Dl, 0.5), 0, b + H + 1.6, 0), (k / 40) * Math.PI * 2, 21.8));
  f.add(at(hemi(22, Dl, 64), 0, b + H + 2.6, 0));
  f.add(at(finial(4), 0, b + H + 2.6 + 21.9, 0));
  return { group: g, focus: f };
}

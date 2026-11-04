import * as THREE from 'three';
import { M, box, cyl, at, onFace, FACES, archPanel, onionDome, hemi, finial } from '../helpers.js';
import { iwan, arcadeSkin, cellRow } from '../details/mughal.js';
import { addDetails } from '../details/gol-gumbaz.js';

export function buildGolGumbaz() {
  const D = M.deccan, Dl = M.deccanLight, g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  g.add(box(120, 0.25, 120, M.path));
  f.add(box(60, 1.5, 60, D));
  const b = 1.5, H = 27, s = 23.75;
  f.add(box(47.5, H, 47.5, D, 0, b, 0));
  f.add(box(50.5, 1.2, 50.5, Dl, 0, b + H - 5.2));
  // Each face: the great blind arch with a doorway and a screened window at its foot, two tiers of
  // smaller screened arches either side, and a gallery of small open arches along the top.
  for (const a of FACES) {
    f.add(onFace(at(iwan(15, 22, { m: D, trim: Dl, shade: Dl, depth: 1.2, frame: 1, top: 1, door: [4, 6], band: false }), 0, b + 0.5, 0), a, s));
    for (const lat of [-13.5, 13.5]) for (const y of [1, 11.5]) f.add(onFace(at(iwan(7, 9, { m: D, trim: Dl, shade: Dl, depth: 0.7, frame: 0.4, top: 0.4, fill: 'jali', band: false }), 0, b + y, 0), a, s, lat));
    f.add(onFace(at(arcadeSkin(39, 3.4, cellRow(15, 2.6, 0.3, 1.6, 2.6), 0.6, D, { trim: Dl, fill: 'room' }), 0, b + H - 3.9, 0), a, s));
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
  addDetails(f, g);
  return { group: g, focus: f };
}

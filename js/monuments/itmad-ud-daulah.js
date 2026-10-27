import * as THREE from 'three';
import { M, mat, box, cyl, lathe, at, onFace, FACES, archPanel, chhatri, finial, inst, unitBox } from '../helpers.js';

// Pietra dura: inlaid panels of coloured stone set into the white marble.
const INLAY = [mat('#8a5a3c', 0.5), mat('#c9a24a', 0.45), mat('#4f6b4a', 0.5), mat('#2f2b2a', 0.5)];

export function buildItmadUdDaulah() {
  const Mb = M.marble, g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  // Charbagh garden on the bank of the Yamuna
  g.add(box(150, 0.15, 150, M.grass, 0, 0, 20), box(400, 0.4, 120, M.water, 0, -0.1, -110));
  for (const [w, d] of [[5, 150], [150, 5]]) g.add(box(w + 3, 0.25, d + 3, M.path, 0, 0, 20), box(w, 0.35, d, M.water, 0, 0, 20));
  f.add(box(50, 1.5, 50, M.red), box(36, 2, 36, Mb, 0, 1.5));
  const B = 3.5, s = 11;
  // The tomb: three arches a side, panels of inlay, and an octagonal tower at each corner
  f.add(box(22, 8, 22, Mb, 0, B), box(23, 0.6, 23, M.marbleShade, 0, B + 8));
  const tiles = INLAY.map(() => []);
  for (const a of FACES) {
    for (const lat of [-6, 0, 6]) f.add(onFace(at(archPanel(3.2, 6, true, M.recess, 0.3), 0, B + 0.6, 0), a, s, lat));
    for (let k = 0; k < 18; k++) for (const [row, y] of [[0, B + 7.2], [1, B + 0.3]]) {
      const lat = -8.5 + k * 1, o = onFace(new THREE.Object3D(), a, s + 0.05, lat);
      tiles[(k + row) % 4].push([o.position.x, y, o.position.z, a === 0 || a === Math.PI ? 0.7 : 0.12, 0.45, a === 0 || a === Math.PI ? 0.12 : 0.7]);
    }
  }
  tiles.forEach((t, i) => f.add(inst(unitBox(), t, INLAY[i])));
  for (const x of [-s, s]) for (const z of [-s, s]) f.add(cyl(1.9, 2.1, 13, Mb, x, B, z, 8), at(chhatri(1.9, 5.4, Mb), x, B + 13, z));
  // The upper pavilion with its canopy roof
  f.add(box(10, 4.5, 10, Mb, 0, B + 8.6), onFace(box(6, 3, 0.2, M.recess, 0, B + 9.3), 0, 5.05));
  f.add(at(lathe([[6.6, 0], [6.4, 0.6], [5.2, 1.6], [3, 2.4], [0.4, 2.7], [0, 2.7]], Mb, 4).rotateY(Math.PI / 4), 0, B + 13.1, 0));
  f.add(at(finial(2.6), 0, B + 15.7, 0));
  for (const x of [-4.6, 4.6]) for (const z of [-4.6, 4.6]) f.add(at(finial(1.6), x, B + 13.4, z));
  return { group: g, focus: f, view: [0.85, 0.42, 1.2] };
}

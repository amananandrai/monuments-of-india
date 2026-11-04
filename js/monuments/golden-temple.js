import * as THREE from 'three';
import { M, mat, mesh, box, cyl, lathe, at, onFace, FACES, archPanel, onionDome, hemi, finial, kalash, chhatri, ribbed, sheet } from '../helpers.js';
import { fortGate } from '../details/forts.js';
import { mughalDoorway } from '../details/mughal.js';

const SILVER = mat('#cfd3d8', 0.3, 0.85);

export function buildGoldenTemple() {
  const G = M.gild, Gd = M.gildDeep, W = M.marble, g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  // Parikrama walkway around the Amrit Sarovar, with the complex's buildings beyond it
  for (const s of [-1, 1]) {
    g.add(box(200, 0.8, 25, W, 0, 0, s * 87.5), box(25, 0.8, 150, W, s * 87.5, 0, 0));
    g.add(box(220, 9, 10, M.lime, 0, 0, s * 105), box(10, 9, 200, M.lime, s * 105, 0, 0));
  }
  g.add(sheet(150, 150, M.lake, 0, 0.3, 0));
  const b = 1.6;
  f.add(box(20, b, 20, W));
  // Guru's Bridge from the Darshani Deori gateway
  f.add(box(64, b, 6, W, -43, 0, 0));
  for (const z of [-2.9, 2.9]) {
    f.add(box(64, 0.6, 0.25, W, -43, b, z));
    for (let x = -72; x <= -14; x += 8) {
      f.add(cyl(0.08, 0.08, 2.2, G, x, b, z, 6));
      f.add(at(mesh(new THREE.SphereGeometry(0.28, 10, 8), G), x, b + 2.4, z));
    }
  }
  // The Darshani Deori: a passage through the gateway, its silver doors standing open
  f.add(at(fortGate(16, 9, 14, 4.2, 7, { m: W, trim: G, crest: false, spikes: false, leafM: SILVER }), -86, 0.8, 0).rotateY(-Math.PI / 2), box(12.5, 3.5, 14.5, G, -86, 9.8, 0));
  for (const z of [-5, 5]) f.add(at(chhatri(1.4, 4.4, G), -86, 13.3, z));
  // Harmandir Sahib: marble lower storey, gilded upper storeys
  f.add(box(12.25, 6, 12.25, W, 0, b));
  f.add(box(12.6, 0.4, 12.6, Gd, 0, b + 6));
  f.add(box(12.25, 6.5, 12.25, G, 0, b + 6.4));
  f.add(box(13.4, 0.6, 13.4, G, 0, b + 12.9));
  for (const a of FACES) {
    // A doorway on every side, with silver doors, between two arched panels
    for (const lat of [-3.6, 3.6]) f.add(onFace(at(archPanel(1.8, 4.4, true, Gd, 0.2), 0, b + 0.4, 0), a, 6.13, lat));
    f.add(onFace(at(mughalDoorway(1.8, 4.4, { m: W, trim: G, depth: 0.5, leafM: SILVER }), 0, b, 0), a, 6.13));
    for (let k = -2; k <= 2; k++) f.add(onFace(at(archPanel(1.3, 3, true, Gd, 0.2), 0, b + 7.6, 0), a, 6.13, k * 2.1));
    for (let k = -2.5; k <= 2.5; k++) {
      const d = onFace(new THREE.Group(), a, 6.3, k * 2.1);
      d.add(cyl(0.42, 0.42, 0.6, G, 0, b + 13.5, 0, 10), at(hemi(0.45, G, 12), 0, b + 14.1, 0));
      f.add(d);
    }
  }
  for (const x of [-5.4, 5.4]) for (const z of [-5.4, 5.4]) f.add(at(chhatri(1.2, 4.5, G), x, b + 13.5, z));
  const top = b + 13.5;
  f.add(cyl(3.6, 3.6, 1.6, G, 0, top, 0, 32));
  f.add(at(lathe([[2.8, 0], [4.4, 0.7], [4.7, 1.1], [3.8, 1.2], [0, 1.2]], G, 32), 0, top + 1.6, 0));
  f.add(at(ribbed(onionDome(4, G), 16, 0.06), 0, top + 2.6, 0));
  f.add(at(kalash(2.6, G), 0, top + 2.6 + 7.3, 0));
  f.add(at(finial(3), 0, top + 2.6 + 10, 0));
  return { group: g, focus: f, view: [-1.1, 0.36, 0.75] };
}

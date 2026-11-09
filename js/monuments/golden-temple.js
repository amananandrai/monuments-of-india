import * as THREE from 'three';
import { M, mat, mesh, box, cyl, lathe, at, onFace, FACES, archPanel, onionDome, hemi, finial, kalash, chhatri, ribbed, sheet } from '../helpers.js';
import { fortGate } from '../details/forts.js';
import { wallWithGaps } from '../details/temples.js';
import { steps } from '../details/doorways.js';
import { mughalDoorway, arcadeSkin } from '../details/mughal.js';
import { detail } from '../detail.js';
import { addDetails } from '../details/golden-temple.js';

const SILVER = mat('#cfd3d8', 0.3, 0.85);
// The gilded copper, lit warmly so it reads as gold and not as dark bronze on the shaded faces.
const GILT = mat('#e3b54a', 0.35, 0.6, { emissive: '#4a3306' });

export function buildGoldenTemple() {
  const G = GILT, Gd = M.gildDeep, W = M.marble, g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  // Parikrama walkway around the Amrit Sarovar, with the complex's buildings beyond it
  for (const s of [-1, 1]) {
    g.add(box(200, 0.8, 25, W, 0, 0, s * 87.5), box(25, 0.8, 150, W, s * 87.5, 0, 0));
    g.add(box(220, 9, 10, M.lime, 0, 0, s * 105));
    // The west range parts for the plaza before the Akal Takht.
    if (s > 0) g.add(box(10, 9, 200, M.lime, 105, 0, 0));
    else g.add(wallWithGaps('z', 200, 9, 10, M.lime, [[0, 34]], -105, 0));
  }
  // On desktops (js/detail.js), the ranges' faces towards the pool: two storeys of arches, rooms
  // below and screened windows above, under a moulded parapet with small domed kiosks along it.
  if (!detail.low) {
    const face = (len, x, z, ry) => {
      const n = Math.floor(len / 5.5), cells = [];
      for (let k = 0; k < n; k++) { const cx = -len / 2 + (k + 0.5) * (len / n); cells.push([cx, 0.9, 3, 4.2, 'room'], [cx, 5.3, 2.4, 2.8, 'jali']); }
      const r = new THREE.Group();
      r.add(arcadeSkin(len, 9, cells, 1.2, M.lime, { trim: W }), box(len, 0.5, 1.6, W, 0, 9, 0.4));
      for (let k = 0; k < Math.floor(len / 30); k++) r.add(at(chhatri(1.3, 3.6, W), -len / 2 + 15 + k * 30, 9.5, 0.6));
      g.add(at(r, x, 0, z).rotateY(ry));
    };
    face(200, 0, -100, 0);
    face(200, 0, 100, Math.PI);
    face(190, 100, 0, -Math.PI / 2);
    for (const sz of [-1, 1]) face(83, -100, sz * 58.5, Math.PI / 2);
  }
  g.add(sheet(150, 150, M.lake, 0, 0.3, 0));
  // Bathing ghats: flights cut from the parikrama's edge down into the water between low marble
  // cheeks, on the north, south and east sides (between the lamps along the edge).
  for (const [x, z, ry] of [[-45, -75, 0], [45, -75, 0], [-45, 75, Math.PI], [45, 75, Math.PI], [75, -27, -Math.PI / 2], [75, 27, -Math.PI / 2]]) {
    const gh = new THREE.Group();
    gh.add(steps(9, 0.8, 6, W, 0.45));
    for (const sx of [-1, 1]) gh.add(box(0.5, 1.3, 3.4, W, sx * 4.75, 0, 1.4));
    g.add(at(gh, x, 0, z).rotateY(ry));
  }
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
  // The Har ki Pauri: steps down from the back of the temple's platform into the water.
  f.add(at(steps(6, b, 6, W, 0.42), 10, 0, 0).rotateY(Math.PI / 2));
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
  addDetails(f, g);
  // Seen across the pool from the south-east, the Harmandir Sahib in front and the Akal Takht behind.
  // Hundreds of separate parts: merged into a few draw calls once built (js/batch.js).
  return { group: g, focus: f, view: [0.85, 0.34, 1.0], zoom: 0.8, batch: true };
}

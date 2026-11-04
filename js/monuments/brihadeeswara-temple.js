import * as THREE from 'three';
import { M, flat, mesh, box, cyl, group, at, onFace, FACES, kalash, pidaRoof } from '../helpers.js';
import { templeDoorway, doorFrame, guardian } from '../details/doorways.js';
import { mergeByMaterial } from '../details/components.js';
import { nandi } from '../details/animals.js';
import { kuta, shala } from '../details/sculpture.js';
import { gopuram, wallWithGaps } from '../details/temples.js';
import { addDetails } from '../details/brihadeeswara-temple.js';

export function buildBrihadeeswara() {
  const m = M.granite, d = M.graniteDark, g = new THREE.Group();
  g.add(box(70, 0.4, 150, M.path, 0, 0, 30), box(100, 0.3, 200, M.grass, 0, -0.1, 70));
  g.add(box(31, 4, 31, d));
  g.add(box(29, 12, 29, m, 0, 4));
  for (const a of FACES) {
    for (let k = -3; k <= 3; k++) g.add(onFace(box(1.4, 12, 0.6, m, 0, 4), a, 14.5, k * 3.8));
    // A niche (devakoshta) framed in stepped bands, with its deity
    const n = new THREE.Group();
    n.add(doorFrame(3, 6, { bands: 2, bw: 0.3, depth: 0.6, d0: 0.35, m }), box(3, 6, 0.05, d, 0, 0, 0.03), at(guardian(4.4, m), 0, 0.1, 0.3));
    g.add(onFace(at(mergeByMaterial(n), 0, 7, 0), a, 14.5));
  }
  g.add(box(31, 1.2, 31, d, 0, 16));
  let y = 17.2, w = 27.5;
  const tiers = 13, th = 2.9, w1 = 9.5, hara = new THREE.Group();
  for (let i = 0; i < tiers; i++) {
    g.add(box(w, th * 0.72, w, m, 0, y));
    g.add(box(w + 0.9, th * 0.28, w + 0.9, d, 0, y + th * 0.72));
    const k = Math.max(0.8, w * 0.07), ky = y + th;
    // The storey's parapet of miniature shrines: a domed kuta on each corner, a barrel-roofed shala
    // in the middle of each side.
    if (i < tiers - 1) for (const x of [-1, 1]) for (const z of [-1, 1]) hara.add(at(kuta(k, m), x * (w / 2 - k / 2), ky, z * (w / 2 - k / 2)));
    if (i < tiers - 1) for (const a of FACES) hara.add(onFace(at(shala(w * 0.3, k, m), 0, ky, 0), a, w / 2 - k / 2));
    y += th;
    w -= (27.5 - w1) / tiers;
  }
  g.add(mergeByMaterial(hara));
  g.add(box(8, 2.6, 8, d, 0, y));
  const dome = mesh(new THREE.SphereGeometry(7, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2), flat(m), 0, y + 2.6, 0);
  dome.rotation.y = Math.PI / 8;
  dome.scale.y = 0.85;
  g.add(dome);
  g.add(at(kalash(3.4), 0, y + 2.6 + 5.9, 0));
  // Mandapas leading east to the Nandi pavilion
  g.add(box(16, 10, 10, m, 0, 0, 20));
  g.add(box(22, 11, 34, m, 0, 0, 41));
  g.add(box(23, 1, 35, d, 0, 11, 41));
  for (let z = 25; z <= 57; z += 4) for (const x of [-10.5, 10.5]) g.add(box(1.5, 1.4, 1.5, m, x, 12, z));
  g.add(box(18, 9, 12, m, 0, 0, 64));
  g.add(box(19, 0.8, 13, d, 0, 9, 64));
  g.add(box(10, 1, 5, d, 0, 0, 72));
  // The doorway into the halls, under its giant door guardians (dvarapalas)
  g.add(at(templeDoorway(2.6, 5, { m, bands: 4, guardianH: 3.6 }), 0, 1, 70));
  const n = new THREE.Group();
  n.add(box(15, 1.5, 15, d));
  for (const x of [-6, -2, 2, 6]) for (const z of [-6, 6]) n.add(cyl(0.45, 0.5, 7, m, x, 1.5, z, 8));
  for (const z of [-2, 2]) for (const x of [-6, 6]) n.add(cyl(0.45, 0.5, 7, m, x, 1.5, z, 8));
  n.add(box(16, 1.2, 16, d, 0, 8.5));
  n.add(at(pidaRoof(13, 6, 3, 1, m, d), 0, 9.7, 0));
  // The great monolithic Nandi, polished dark, facing the shrine
  n.add(at(nandi(M.stoneDark, 1.08), 0, 1.5, 0.2).rotateY(Math.PI));
  g.add(at(n, 0, 0, 96));
  // The enclosure and its two gateways on the east: the Rajarajan gopuram in the inner wall and,
  // beyond it, the larger Keralantakan gopuram in the outer; both of bare granite, their storeys
  // lined with small shrines and figures.
  const STONE = ['#a08d70', '#8f7d62', '#b09c7e', '#9a8669'];
  g.add(box(90, 0.4, 70, M.path, 0, 0, 140));
  for (const s of [-1, 1]) g.add(box(2, 6, 158, d, s * 46, 0, 40));
  g.add(box(94, 6, 2, d, 0, 0, -40), wallWithGaps('x', 94, 6, 2, d, [[0, 22]], 0, 120));
  g.add(at(gopuram(24, 13, 30, 5, 3, STONE), 0, 0, 120), at(gopuram(30, 16, 36, 5, 4, STONE), 0, 0, 168));
  addDetails(g, g);
  // Framed on the monument itself, closer than its grounds would set.
  return { group: g, view: [1.0, 0.42, 1.0], zoom: 0.65 };
}

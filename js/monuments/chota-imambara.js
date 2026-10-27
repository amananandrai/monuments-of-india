import * as THREE from 'three';
import { M, mat, box, cyl, at, onFace, archPanel, onionDome, finial, ribbed, guldasta } from '../helpers.js';

const WHITE = mat('#f1ede6', 0.8);
const SHADE = mat('#d9d2c6', 0.85);

function tajReplica(m) {
  const g = new THREE.Group();
  g.add(box(10, 1, 10, SHADE), box(7, 5, 7, m, 0, 1), at(onionDome(2.8, m), 0, 6, 0), at(finial(2), 0, 11, 0));
  for (const x of [-4.4, 4.4]) for (const z of [-4.4, 4.4]) g.add(at(guldasta(6, 0.35, m), x, 1, z));
  return g;
}

export function buildChotaImambara() {
  const g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  g.add(box(160, 0.15, 190, M.grass, 0, 0, 30));
  // Forecourt with its long water channel, entered through a gateway
  f.add(box(7, 0.5, 70, M.water, 0, 0, 30), box(11, 0.4, 72, SHADE, 0, 0, 30));
  f.add(box(30, 12, 8, WHITE, 0, 0, 72), onFace(at(archPanel(8, 10, true, M.recess, 0.3), 0, 0.3, 0), 0, 76));
  for (const x of [-15, 15]) f.add(at(guldasta(14, 0.8, WHITE), x, 0, 76));
  // The imambara: white arcaded hall with a band of black calligraphy and a ribbed white dome
  f.add(box(50, 1.2, 26, SHADE, 0, 0, -18), box(44, 12, 20, WHITE, 0, 1.2, -18));
  f.add(box(44.4, 1.1, 0.25, M.stoneDark, 0, 10.8, -7.9), box(45, 0.6, 21, SHADE, 0, 13.2, -18));
  for (let k = -3; k <= 3; k++) f.add(onFace(at(archPanel(3.8, 7.6, true, M.recess, 0.3), 0, 1.6, 0), 0, -8, k * 5.8));
  f.add(cyl(7, 7, 3, WHITE, 0, 13.8, -18, 32), at(ribbed(onionDome(7.4, WHITE), 24, 0.04), 0, 16.8, -18), at(finial(6), 0, 16.8 + 13.2, -18));
  for (const x of [-22, 22]) for (const z of [-27.5, -8.5]) f.add(at(guldasta(18, 1, WHITE), x, 1.2, z));
  for (let x = -18; x <= 18; x += 6) f.add(at(guldasta(3, 0.35, WHITE), x, 13.8, -8.6));
  // The two small replicas of the Taj Mahal in the garden
  for (const x of [-32, 32]) f.add(at(tajReplica(WHITE), x, 0, 18));
  return { group: g, focus: f, view: [0.6, 0.32, 1.25] };
}

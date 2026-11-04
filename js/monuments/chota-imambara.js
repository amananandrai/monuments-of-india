import * as THREE from 'three';
import { M, mat, box, cyl, at, onFace, onionDome, finial, ribbed, guldasta } from '../helpers.js';
import { iwan, arcadeSkin, cellRow } from '../details/mughal.js';
import { addDetails } from '../details/chota-imambara.js';

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
  f.add(box(30, 12, 8, WHITE, 0, 0, 72), onFace(iwan(8, 10, { m: WHITE, trim: SHADE, shade: SHADE, depth: 1.4, frame: 1.2, top: 1.2 }), 0, 76));
  for (const x of [-15, 15]) f.add(at(guldasta(14, 0.8, WHITE), x, 0, 76));
  // The imambara: white arcaded hall with a band of black calligraphy and a ribbed white dome
  const cd = 1.2;
  f.add(box(50, 1.2, 26, SHADE, 0, 0, -18), box(44, 12, 20 - cd, WHITE, 0, 1.2, -18 - cd / 2));
  f.add(box(44.4, 1.1, 0.25, M.stoneDark, 0, 10.8, -7.9), box(45, 0.6, 21, SHADE, 0, 13.2, -18));
  // The arcade along its front: seven arches 1.2 m deep, the middle one the door.
  const cells = cellRow(7, 5.8, 0.4, 3.8, 7.6).map((c) => [...c, c[0] === 0 ? 'door' : 'jali']);
  f.add(at(arcadeSkin(44, 12, cells, cd, WHITE, { trim: SHADE }), 0, 1.2, -8 - cd));
  f.add(cyl(7, 7, 3, WHITE, 0, 13.8, -18, 32), at(ribbed(onionDome(7.4, WHITE), 24, 0.04), 0, 16.8, -18), at(finial(6), 0, 16.8 + 13.2, -18));
  for (const x of [-22, 22]) for (const z of [-27.5, -8.5]) f.add(at(guldasta(18, 1, WHITE), x, 1.2, z));
  for (let x = -18; x <= 18; x += 6) f.add(at(guldasta(3, 0.35, WHITE), x, 13.8, -8.6));
  // The two small replicas of the Taj Mahal in the garden
  for (const x of [-32, 32]) f.add(at(tajReplica(WHITE), x, 0, 18));
  addDetails(f, g);
  return { group: g, focus: f, view: [0.6, 0.32, 1.25] };
}

import * as THREE from 'three';
import { M, mat, box, cyl, at, mesh, surface } from '../helpers.js';
import { mergeByMaterial, faravahar, steppedMerlons } from '../parts/components.js';
import { trees, lampPosts, along, cityAround, traffic } from '../parts/realism.js';
import { detail } from '../detail.js';

// The temple's whitewashed plaster walls, its cream trim and the grey stone of its plinth.
export const WHITE = surface(mat('#eee9de', 0.85), 'none');
// The portico's back wall, in shade, and its columns of pale stone.
export const PORCH = surface(mat('#bdb19b', 0.88), 'none');
export const COLUMN = surface(mat('#e7dcc4', 0.6), 'marble');
export const CREAM = mat('#d9ccb0', 0.85);
export const GREY = mat('#8c877e', 0.9);
const IRON = mat('#2a2c2e', 0.5, 0.5);

// The Wadiaji Atash Behram, finer detail and setting. From photographs: the Faravahar over the
// portico; stepped merlons along the parapet; a moulded cornice; the forecourt behind a low wall with
// iron railings and a gate between two piers topped by lamps; and Princess Street, with the
// crowded buildings of Kalbadevi round it. Dimensions follow js/monuments/wadiaji-atash-behram.js:
// the front FW wide and FH high on a plinth P, the portico MW wide, its columns CH high.
function architecture(f, { FW, FH, P, CH }) {
  const d = new THREE.Group();
  d.add(at(faravahar(5.4, CREAM), 0, P + CH + 1.9, 0.16));
  d.add(box(FW + 0.6, 0.5, 0.7, CREAM, 0, P + FH - 0.5, -0.05));
  d.add(at(steppedMerlons(FW, 0.8, 1.2, WHITE), 0, P + FH, 0));
  // The forecourt's wall and railings, 9 m in front, and the gate.
  const wz = 9;
  for (const s of [-1, 1]) {
    d.add(box(FW / 2 - 3, 0.9, 0.5, GREY, s * (FW / 4 + 1.5), 0, wz));
    const n = 14;
    for (let k = 0; k <= n; k++) d.add(box(0.05, 1.3, 0.05, IRON, s * (3 + k * (FW / 2 - 3) / n), 0.9, wz));
    d.add(box(FW / 2 - 3, 0.06, 0.06, IRON, s * (FW / 4 + 1.5), 2.1, wz));
    d.add(box(1, 3.2, 1, CREAM, s * 3, 0, wz), cyl(0.25, 0.3, 0.5, IRON, s * 3, 3.2, wz, 8), at(mesh(new THREE.SphereGeometry(0.32, 12, 8), CREAM), s * 3, 3.9, wz));
  }
  d.add(box(FW + 2, 0.12, wz - 1, GREY, 0, 0, wz / 2 + 0.5));
  f.add(mergeByMaterial(d));
}

export function addDetails(f, g, dims) {
  architecture(f, dims);
  g.add(box(400, 0.2, 400, M.asphalt, 0, -0.2, 0));
  g.add(box(160, 0.2, 3, M.path, 0, 0, 11), box(160, 0.2, 3, M.path, 0, 0, 25));
  g.add(traffic([[16, 1], [20, -1]], -80, 80, { y: 0.02, gap: 11, seed: 5, taxis: 0.45, buses: 0.06, trucks: 0.03 }));
  g.add(trees([[-30, 11.5], [32, 11.5]], { kind: 'peepal', seed: 3, h: 10 }));
  g.add(lampPosts(along(6, [-60, 11], [60, 11])));
  // The old city round the temple: tall buildings close on either side, and across the street
  // beyond an open ground.
  g.add(cityAround([-18, 18, -26, 12], { rows: detail.low ? 1 : 2, every: detail.low ? 2 : 1, gap: 1.5, storeys: [3, 6], seed: 52, fine: !detail.low,
    paint: ['#e8d8b8', '#cfd8d4', '#f1e6cf', '#d9b48f', '#9fc3c9', '#e7b9b0'], keep: [[-400, 400, 9.5, 400]] }));
  g.add(cityAround([-70, 70, 25, 26.5], { rows: 1, gap: 0.5, storeys: [3, 6], seed: 9, fine: false, keep: [[-400, 400, -400, 26.5], [-50, 50, 26.5, 95]] }));
  // Across the street, a small open ground with trees, from where the temple is seen.
  g.add(trees([[-40, 34], [-36, 70], [38, 36], [40, 72]], { kind: 'neem', seed: 8 }), box(100, 0.25, 66, M.grass, 0, 0, 61));
}

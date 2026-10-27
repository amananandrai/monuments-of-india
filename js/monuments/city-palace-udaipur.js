import * as THREE from 'three';
import { M, mat, box, cyl, at, rng, chhatri, onFace, archPanel, hemi, finial, inst, unitBox } from '../helpers.js';

const CREAM = mat('#efe6d2', 0.8);
const SHADE = mat('#d3c6a8', 0.85);

export function buildCityPalaceUdaipur() {
  const g = new THREE.Group(), f = new THREE.Group(), R = rng(101);
  g.add(f);
  // Lake Pichola in front, the Lake Palace on its island, and the ridge behind
  g.add(box(800, 0.4, 400, M.water, 0, -0.1, 160), box(800, 0.2, 200, mat('#8c8a5e', 0.95), 0, 0, -140));
  g.add(box(70, 3, 50, SHADE, 30, 0, 160), box(60, 9, 40, CREAM, 30, 3, 160));
  for (const [x, z] of [[8, 145], [52, 145], [8, 175], [52, 175]]) g.add(at(chhatri(3, 8, CREAM), x, 12, z));
  // The palace: a 244 m front built up over four centuries, blocks of differing heights crowned with kiosks
  f.add(box(250, 14, 30, SHADE, 0, 0, -6));
  const blocks = [[-110, 22, 16, 26], [-84, 34, 22, 28], [-54, 28, 20, 26], [-26, 40, 26, 30], [6, 32, 22, 28], [34, 44, 24, 30], [64, 30, 22, 28], [94, 26, 20, 26], [116, 20, 14, 24]];
  for (const [x, h, w, d] of blocks) {
    f.add(box(w, h, d, CREAM, x, 14, -6), box(w + 0.8, 0.8, d + 0.8, SHADE, x, 14 + h, -6));
    const n = Math.max(2, Math.floor(w / 4));
    for (let fl = 0; fl < Math.floor(h / 7); fl++) for (let k = 0; k < n; k++) f.add(onFace(at(archPanel(2, 3.4, true, M.recess, 0.2), 0, 16 + fl * 7, 0), 0, d / 2 - 6, x - w / 2 + (k + 0.5) * (w / n)));
    f.add(at(chhatri(2.2, 6, CREAM), x - w / 4, 14.8 + h, 4), at(chhatri(2.2, 6, CREAM), x + w / 4, 14.8 + h, 4));
  }
  for (const x of [-72, -40, 20, 50, 80]) f.add(cyl(4, 4.4, 50, CREAM, x, 0, 8, 8), at(hemi(4.2, CREAM, 16), x, 50, 8), at(finial(2.4), x, 54, 8));
  return { group: g, focus: f, view: [0.25, 0.2, 1.25] };
}

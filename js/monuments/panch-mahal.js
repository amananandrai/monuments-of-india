import * as THREE from 'three';
import { M, box, at, chhatri, inst, unitCyl } from '../helpers.js';
import { addDetails } from '../details/panch-mahal.js';

// Columns across and deep per storey, and each storey's centre (x, z). The four upper storeys
// diminish asymmetrically on the ground floor, stepping towards one corner rather than stacking
// centred; each stays on the 3.6 m column grid of the storey below.
export const LEVELS = [[12, 7, 0, 0], [8, 7, 3.6, 0], [5, 4, 5.4, -1.8], [4, 3, 7.2, -3.6], [2, 2, 10.8, -5.4]];
export const GAP = 3.6, H = 4.2;

export function buildPanchMahal() {
  const Rd = M.red, Rl = M.redLight, g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  g.add(box(120, 0.2, 100, M.path), box(30, 0.6, 24, M.water, -40, 0, 20));
  f.add(box(50, 1.2, 32, Rd));
  // Five open storeys on 84, 56, 20, 12 and 4 columns: 176 in all
  let y = 1.2, top = LEVELS[0];
  for (const lv of LEVELS) {
    const [nx, nz, cx, cz] = lv, w = (nx - 1) * GAP, d = (nz - 1) * GAP, cols = [];
    for (let i = 0; i < nx; i++) for (let j = 0; j < nz; j++) cols.push([cx - w / 2 + i * GAP, y, cz - d / 2 + j * GAP, 0.7, H, 0.7]);
    f.add(inst(unitCyl(8), cols, Rd));
    f.add(box(w + 2.6, 0.5, d + 2.6, Rl, cx, y + H, cz), box(w + 1.4, 0.5, d + 1.4, Rd, cx, y + H + 0.5, cz));
    y += H + 1;
    top = lv;
  }
  f.add(at(chhatri(2.6, 7, Rd), top[2], y, top[3]));
  addDetails(f, g);
  return { group: g, focus: f, view: [0.95, 0.4, 1.1] };
}

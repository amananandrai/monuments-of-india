import * as THREE from 'three';
import { M, box, at, chhatri, inst, unitCyl } from '../helpers.js';
import { addDetails } from '../details/panch-mahal.js';

export function buildPanchMahal() {
  const Rd = M.red, Rl = M.redLight, g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  g.add(box(120, 0.2, 100, M.path), box(30, 0.6, 24, M.water, -40, 0, 20));
  f.add(box(50, 1.2, 32, Rd));
  // Five open storeys on 84, 56, 20, 12 and 4 columns: 176 in all. Each upper floor is smaller
  // and set into the same corner, not centred, so the pavilion reads as the real asymmetric stack.
  const levels = [[12, 7], [8, 7], [5, 4], [4, 3], [2, 2]], gap = 3.6, h = 4.2;
  const gw = (levels[0][0] - 1) * gap, gd = (levels[0][1] - 1) * gap, ox = -gw / 2, oz = -gd / 2;
  let y = 1.2;
  for (const [nx, nz] of levels) {
    const w = (nx - 1) * gap, d = (nz - 1) * gap, cols = [];
    for (let i = 0; i < nx; i++) for (let j = 0; j < nz; j++) cols.push([ox + i * gap, y, oz + j * gap, 0.7, h, 0.7]);
    f.add(inst(unitCyl(8), cols, Rd));
    f.add(box(w + 2.6, 0.5, d + 2.6, Rl, ox + w / 2, y + h, oz + d / 2), box(w + 1.4, 0.5, d + 1.4, Rd, ox + w / 2, y + h + 0.5, oz + d / 2));
    y += h + 1;
  }
  f.add(at(chhatri(2.6, 7, Rd), ox + gap / 2, y, oz + gap / 2));
  addDetails(f, g);
  return { group: g, focus: f, view: [0.95, 0.4, 1.1] };
}

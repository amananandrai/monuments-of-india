import * as THREE from 'three';
import { M, box, at, chhatri, inst, unitCyl } from '../helpers.js';

export function buildPanchMahal() {
  const Rd = M.red, Rl = M.redLight, g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  g.add(box(120, 0.2, 100, M.path), box(30, 0.6, 24, M.water, -40, 0, 20));
  f.add(box(50, 1.2, 32, Rd));
  // Five open storeys on 84, 56, 20, 12 and 4 columns: 176 in all
  const levels = [[12, 7], [8, 7], [5, 4], [4, 3], [2, 2]], gap = 3.6, h = 4.2;
  let y = 1.2;
  for (const [nx, nz] of levels) {
    const w = (nx - 1) * gap, d = (nz - 1) * gap, cols = [];
    for (let i = 0; i < nx; i++) for (let j = 0; j < nz; j++) cols.push([-w / 2 + i * gap, y, -d / 2 + j * gap, 0.7, h, 0.7]);
    f.add(inst(unitCyl(8), cols, Rd));
    f.add(box(w + 2.6, 0.5, d + 2.6, Rl, 0, y + h), box(w + 1.4, 0.5, d + 1.4, Rd, 0, y + h + 0.5));
    y += h + 1;
  }
  f.add(at(chhatri(2.6, 7, Rd), 0, y, 0));
  return { group: g, focus: f, view: [0.95, 0.4, 1.1] };
}

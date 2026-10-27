import * as THREE from 'three';
import { M, V, box, cyl, lathe, group, at, kalash, bell, shikhara, pidaRoof, nagaraProfile, ribbed, inst, unitBox, unitCyl, unitSpire, aroundRect, hoopArch } from '../helpers.js';

export function buildDilwara() {
  const Mb = M.marble, Sh = M.marbleShade, g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  g.add(box(130, 0.2, 140, M.grass));
  f.add(box(48, 1.5, 70, Sh), box(48.6, 5, 0.8, M.plaster, 0, 1.5, 35));
  // Rows of shrine cells (devakulikas) with little spires, behind a pillared cloister
  const cells = aroundRect(44, 66, 3.2, 1.6), cellList = [], spires = [], posts = [];
  cells.forEach(([x, z, ry]) => {
    cellList.push([x, 1.5, z, 3, 4, 3, ry]);
    spires.push([x, 5.5, z, 2.6, 3.4, 2.6, ry]);
    posts.push([x + Math.sin(ry) * 3.2, 1.5, z + Math.cos(ry) * 3.2, 0.5, 3.6, 0.5]);
  });
  f.add(inst(unitBox(), cellList, Mb), inst(unitSpire(), spires, Mb), inst(unitCyl(10), posts, Mb));
  f.add(at(group(...[[44, 3.6, -29.4], [44, 3.6, 29.4]].map(([w, d, z]) => box(w - 6, 0.4, d, Sh, 0, 5.1, z)), ...[-19.4, 19.4].map((x) => box(3.6, 0.4, 60, Sh, x, 5.1, 0)))));
  // Main shrine, closed hall and the open Ranga Mandapa with its ribbed dome and hoop arches
  f.add(box(10, 8, 10, Mb, 0, 1.5, -16), at(shikhara(9, 12, Mb, nagaraProfile, 12), 0, 9.5, -16));
  const gm = pidaRoof(10, 5, 4, 0.8, Mb, Sh);
  f.add(box(10, 7, 10, Mb, 0, 1.5, -5), at(gm, 0, 8.5, -5), at(bell(2.6, Mb), 0, 8.5 + gm.userData.top, -5));
  const rz = 9, pc = [];
  for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) pc.push([-6 + i * 4, 2.5, rz - 6 + j * 4, 0.9, 6.5, 0.9]);
  f.add(box(17, 1, 17, Sh, 0, 1.5, rz), inst(unitCyl(12), pc, Mb));
  for (const j of [0, 3]) for (let i = 0; i < 3; i++) f.add(hoopArch(V(-6 + i * 4, 7.3, rz - 6 + j * 4), V(-2 + i * 4, 7.3, rz - 6 + j * 4), Mb));
  for (const i of [0, 3]) for (let j = 0; j < 3; j++) f.add(hoopArch(V(-6 + i * 4, 7.3, rz - 6 + j * 4), V(-6 + i * 4, 7.3, rz - 2 + j * 4), Mb));
  f.add(cyl(9.2, 9.2, 1.2, Mb, 0, 9, rz, 8));
  f.add(at(ribbed(lathe([[8.4, 0], [7.8, 1.1], [6.2, 2.3], [4, 3.3], [1.5, 3.9], [0, 4]], Mb, 48), 24, 0.04), 0, 10.2, rz), at(kalash(1.6), 0, 14.2, rz));
  return { group: g, focus: f, view: [0.85, 0.55, 1.15] };
}

import * as THREE from 'three';
import { M, mesh, box, cyl, group, at, hemi, finial, chhatri } from '../helpers.js';

export function buildRashtrapatiBhavan() {
  const Rd = M.red, Cr = M.cream, g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  g.add(box(240, 0.2, 200, M.path, 0, 0, 110));
  for (const s of [-1, 1]) g.add(box(70, 0.25, 160, M.grass, s * 70, 0, 110));
  f.add(box(196, 10, 64, Rd), box(186, 12, 58, Cr, 0, 10, 0), box(190, 1, 62, M.buff, 0, 21.6, 0));
  for (const s of [-1, 1]) {
    f.add(box(36, 10, 30, Rd, s * 80, 0, 44), box(34, 12, 28, Cr, s * 80, 10, 44), box(36, 1, 30, M.buff, s * 80, 22, 44));
    f.add(at(chhatri(3, 8, Cr), s * 80, 23, 44), at(chhatri(3, 8, Cr), s * 86, 22.6, -24));
  }
  // Durbar Hall portico: twelve columns over a broad flight of steps
  f.add(box(70, 10, 10, Rd, 0, 0, 37));
  for (let k = 0; k < 5; k++) f.add(box(60, 10 - k * 2, 3, Rd, 0, 0, 43.5 + k * 3));
  for (let k = 0; k < 12; k++) f.add(cyl(1.3, 1.4, 13, Cr, -27.5 + k * 5, 10, 38, 16));
  f.add(box(64, 2.4, 8, Cr, 0, 23, 37), box(66, 0.8, 9, M.buff, 0, 25.4, 37));
  // The great dome on its drum, with a railing band like the one at Sanchi
  f.add(cyl(15, 15, 5, Cr, 0, 22.6, 0, 48), cyl(15.6, 15.6, 1.4, Rd, 0, 27.6, 0, 48));
  f.add(at(hemi(14.5, Cr, 48), 0, 29, 0), cyl(1.4, 2, 2.4, Cr, 0, 43.2, 0, 16));
  const col = group(box(7, 6, 7, Rd), cyl(1.3, 1.7, 30, Cr, 0, 6, 0, 16), at(mesh(new THREE.SphereGeometry(1.6, 16, 12), M.bronze), 0, 37.2, 0), at(finial(4), 0, 38.6, 0));
  g.add(at(col, 0, 0, 120));
  return { group: g, focus: f, view: [0.5, 0.26, 1.2] };
}

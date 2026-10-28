import * as THREE from 'three';
import { M, mat, mesh, box, cyl, at, rng, onFace, FACES, archPanel, archWall, hemi, finial, inst, unitBox, ellipseWall } from '../helpers.js';

const GRANITE = mat('#9a917f', 0.9);
const BOULDER = mat('#8c8270', 0.95, 0, { flatShading: true });

export function buildGolconda() {
  const g = new THREE.Group(), f = new THREE.Group(), R = rng(97);
  g.add(f);
  g.add(box(500, 0.2, 500, mat('#a69b7a', 0.95)));
  // The granite hill, strewn with boulders
  const H = 60;
  g.add(mesh(new THREE.ConeGeometry(110, H, 12).translate(0, H / 2, 0), BOULDER));
  for (let i = 0; i < 30; i++) {
    const a = R() * Math.PI * 2, d = 20 + R() * 80, y = H * (1 - d / 110), r = 3 + R() * 5;
    g.add(mesh(new THREE.IcosahedronGeometry(r, 0), BOULDER, Math.cos(a) * d, y + r * 0.3, Math.sin(a) * d));
  }
  // Rings of walls climbing the hill to the Bala Hissar citadel
  for (const [r, n] of [[100, 70], [64, 46], [30, 24]]) {
    const y = H * (1 - r / 110);
    f.add(ellipseWall(r, r, 0, Math.PI * 2, 2.6, y - 1, y + 6, GRANITE));
    for (let k = 0; k < 8; k++) {
      const a = (k / 8) * Math.PI * 2 + 0.2;
      f.add(cyl(4, 4.6, 10, GRANITE, Math.cos(a) * r, y - 1, Math.sin(a) * r, 14));
    }
  }
  // Fateh Darwaza at the outer wall, and the Bala Hissar pavilion on the summit
  f.add(at(archWall(16, 14, 6, 6, 11, true, GRANITE), 0, 0, 100));
  f.add(box(20, 9, 12, mat('#d9d1c0', 0.85), 0, H - 3, 0));
  for (const a of [0, Math.PI]) for (let k = -1; k <= 1; k++) f.add(onFace(at(archPanel(4, 6, true, M.recess, 0.25), 0, H - 2.4, 0), a, 6, k * 6));
  for (const x of [-7, 7]) f.add(at(hemi(2.4, mat('#d9d1c0', 0.85), 16), x, H + 6, 0), at(finial(2), x, H + 8.4, 0));
  return { group: g, focus: f, view: [0.45, 0.35, 1.2] };
}

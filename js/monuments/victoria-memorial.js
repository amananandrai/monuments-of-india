import * as THREE from 'three';
import { M, mat, mesh, box, cyl, lathe, at, onFace, FACES, archPanel, hemi, group } from '../helpers.js';

export function buildVictoriaMemorial() {
  const Mb = M.marble, Sh = M.marbleShade, g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  g.add(box(240, 0.15, 260, M.grass, 0, 0, 40));
  for (const s of [-1, 1]) g.add(box(16, 0.4, 90, M.water, s * 24, 0, 110), box(19, 0.3, 93, Mb, s * 24, 0, 110));
  g.add(box(12, 0.2, 200, M.path, 0, 0, 70));
  // Terrace and the main block, with projecting corner pavilions
  f.add(box(110, 2.5, 80, Sh), box(104, 1, 74, Mb, 0, 2.5, 0));
  const b = 3.5;
  f.add(box(84, 18, 56, Mb, 0, b, 0), box(86, 1.2, 58, Sh, 0, b + 18, 0));
  for (const a of FACES) {
    const half = a === 0 || a === Math.PI ? 28 : 42;
    for (let k = -3; k <= 3; k++) {
      if (k === 0) continue;
      f.add(onFace(at(archPanel(4, 8, false, M.recess, 0.3), 0, b + 2, 0), a, half, k * (half > 30 ? 6 : 9)));
      f.add(onFace(at(archPanel(3, 4.5, false, M.recess, 0.3), 0, b + 12, 0), a, half, k * (half > 30 ? 6 : 9)));
    }
  }
  for (const x of [-38, 38]) for (const z of [-24, 24]) {
    f.add(box(14, 22, 14, Mb, x, b, z), box(15, 1, 15, Sh, x, b + 22, z));
    f.add(cyl(4.6, 4.6, 3, Mb, x, b + 23, z, 24), at(hemi(4.6, Mb, 24), x, b + 26, z), cyl(0.6, 0.9, 2.4, Mb, x, b + 30.4, z, 10));
  }
  // Entrance porch with paired columns
  f.add(box(26, 2.5, 10, Sh, 0, 0, 33));
  for (let k = 0; k < 6; k++) f.add(cyl(0.9, 1, 14, Mb, -10 + k * 4, b, 32, 14));
  f.add(box(26, 3, 9, Mb, 0, b + 14, 32), box(27, 0.8, 10, Sh, 0, b + 17, 32));
  // Drum, Renaissance dome, lantern and the bronze Angel of Victory
  const top = b + 19.2;
  f.add(cyl(15, 15, 9, Mb, 0, top, 0, 48), cyl(15.8, 15.8, 1, Sh, 0, top + 9, 0, 48));
  for (let k = 0; k < 24; k++) {
    const a = (k / 24) * Math.PI * 2;
    f.add(cyl(0.5, 0.55, 8, Mb, Math.cos(a) * 15.6, top + 0.5, Math.sin(a) * 15.6, 8));
  }
  f.add(at(lathe([[14.4, 0], [14.3, 3], [13.2, 7], [10.6, 10.8], [6.8, 13.6], [2.6, 15], [0, 15.2]], Mb, 48), 0, top + 10, 0));
  const lt = top + 10 + 14.9;
  f.add(cyl(2.4, 2.6, 3.2, Mb, 0, lt, 0, 16), at(hemi(2.4, Mb, 16), 0, lt + 3.2, 0), cyl(0.5, 0.8, 1.6, M.bronze, 0, lt + 5.4, 0, 10));
  const angel = group(
    cyl(0.45, 0.7, 2.8, M.bronze, 0, 0, 0, 10),
    at(mesh(new THREE.SphereGeometry(0.42, 12, 10), M.bronze), 0, 3.2, 0),
    box(0.15, 2.2, 1.6, M.bronze, -0.5, 1.4, -0.4).rotateZ(0.35),
    box(0.15, 2.2, 1.6, M.bronze, 0.5, 1.4, -0.4).rotateZ(-0.35),
    cyl(0.06, 0.2, 2, M.bronze, 0.6, 2.4, 0.5, 6).rotateX(-0.9),
  );
  f.add(at(angel, 0, lt + 7, 0));
  return { group: g, focus: f, view: [0.55, 0.3, 1.2] };
}

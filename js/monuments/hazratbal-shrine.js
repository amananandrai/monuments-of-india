import * as THREE from 'three';
import { M, mat, mesh, box, cyl, at, rng, onFace, FACES, archPanel, onionDome, finial, minaret } from '../helpers.js';

const HILL = mat('#5d6b4a', 0.95, 0, { flatShading: true });
const CHINAR = mat('#c8642c', 0.9, 0, { flatShading: true });

export function buildHazratbal() {
  const Mb = M.marble, g = new THREE.Group(), f = new THREE.Group(), R = rng(13);
  g.add(f);
  // Dal Lake in front, the lawns, and the Zabarwan hills across the water
  g.add(box(600, 0.4, 300, M.water, 0, 0, 200), box(220, 0.3, 110, M.grass, 0, 0, -10));
  for (let i = 0; i < 5; i++) {
    const h = 70 + R() * 50, x = -260 + i * 130 + R() * 40;
    g.add(mesh(new THREE.ConeGeometry(h * 1.6, h, 8).translate(0, h / 2, 0), HILL, x, 0, 420 + R() * 60));
  }
  for (let i = 0; i < 9; i++) {
    const x = (R() < 0.5 ? -1 : 1) * (45 + R() * 50), z = -50 + R() * 70;
    f.add(cyl(0.8, 1.1, 6, M.wood, x, 0, z, 8), at(mesh(new THREE.IcosahedronGeometry(6 + R() * 2, 1), CHINAR), x, 10, z));
  }
  f.add(box(60, 1.2, 50, M.marbleShade, 0, 0, 0));
  const b = 1.2;
  // The shrine: arcaded marble hall, a single great dome and one minaret
  f.add(box(40, 12, 30, Mb, 0, b, 0), box(41, 0.8, 31, M.marbleShade, 0, b + 12, 0));
  for (const a of FACES) {
    const wide = a === 0 || a === Math.PI;
    for (let k = -3; k <= 3; k++) f.add(onFace(at(archPanel(3.4, 7, true, M.recess, 0.3), 0, b + 1.5, 0), a, wide ? 15 : 20, k * (wide ? 5.2 : 3.8)));
  }
  f.add(cyl(10, 10, 4, Mb, 0, b + 12.8, 0, 40), cyl(10.6, 10.6, 0.6, M.marbleShade, 0, b + 16.4, 0, 40));
  f.add(at(onionDome(10.5, Mb), 0, b + 16.8, 0), at(finial(5), 0, b + 16.8 + 18.7, 0));
  f.add(at(minaret(34, 2, Mb, { balconies: 3, cap: 'onion' }), 24, b, 12));
  return { group: g, focus: f, view: [0.6, 0.3, 1.25] };
}

import * as THREE from 'three';
import { M, mat, mesh, box, cyl, at, rng, nagaraTemple, bell, inst } from '../helpers.js';

const BASALT = mat('#4f4a45', 0.85);
const SHADE = mat('#3b3734', 0.9);
const FOREST = mat('#3f5e34', 0.95, 0, { flatShading: true });

export function buildBhimashankar() {
  const g = new THREE.Group(), f = new THREE.Group(), R = rng(43);
  g.add(f);
  // A forested valley in the Sahyadri hills
  g.add(box(260, 0.2, 260, mat('#5a7242', 0.95)));
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + 0.3, d = 140 + R() * 40, h = 40 + R() * 40;
    g.add(mesh(new THREE.CylinderGeometry(h * 0.5, h * 1.6, h, 9).translate(0, h / 2, 0), FOREST, Math.cos(a) * d, 0, Math.sin(a) * d));
  }
  const trees = [];
  for (let i = 0; i < 80; i++) {
    const a = R() * Math.PI * 2, d = 40 + R() * 80;
    trees.push([Math.cos(a) * d, 0, Math.sin(a) * d, 6 + R() * 4, 8 + R() * 6, 6 + R() * 4]);
  }
  g.add(inst(new THREE.IcosahedronGeometry(0.5, 0).translate(0, 0.5, 0), trees, FOREST));
  // The dark basalt temple, and the great bell hung in its own frame
  f.add(box(40, 0.4, 44, M.path), at(nagaraTemple({ w: 8, h: 13, m: BASALT, shade: SHADE, plinth: 1.5, urus: 4, halls: [[11, 6, 4]] }), 0, 0, -8));
  f.add(cyl(0.3, 0.3, 6, M.wood, -12, 0, 8, 8), cyl(0.3, 0.3, 6, M.wood, -8, 0, 8, 8), box(5, 0.4, 0.6, M.wood, -10, 6, 8));
  f.add(at(bell(1.3, M.bronze).rotateX(Math.PI), -10, 6, 8));
  return { group: g, focus: f, view: [0.85, 0.36, 1.15] };
}

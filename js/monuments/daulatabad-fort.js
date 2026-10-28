import * as THREE from 'three';
import { M, mat, mesh, box, cyl, at, hemi, finial, inst, unitBox, ellipseWall } from '../helpers.js';

const STONE = mat('#8e8172', 0.9);
const HILL = mat('#7d7258', 0.95, 0, { flatShading: true });
const TILE = mat('#3f78a8', 0.5);

// The Chand Minar, a tapering victory tower with balconies.
function chandMinar() {
  const g = new THREE.Group();
  g.add(box(9, 2, 9, STONE));
  let y = 2;
  for (const [r0, r1, h] of [[3, 2.6, 12], [2.5, 2.1, 9], [2, 1.6, 7]]) {
    g.add(cyl(r1, r0, h, mat('#c9b48a', 0.85), 0, y, 0, 16), cyl(r1 * 1.05, r1 * 1.05, 1, TILE, 0, y + h * 0.7, 0, 16));
    y += h;
    g.add(cyl(r1 * 1.7, r1 * 1.1, 0.7, STONE, 0, y - 0.7, 0, 16));
  }
  g.add(at(hemi(1.6, mat('#c9b48a', 0.85), 16), 0, y, 0), at(finial(1.6), 0, y + 1.6, 0));
  return g;
}

export function buildDaulatabad() {
  const g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  g.add(box(500, 0.2, 500, mat('#a39a72', 0.95)));
  // The conical hill, its base cut away into a sheer scarp above a moat
  g.add(cyl(70, 74, 0.5, M.water, 0, 0, 0, 40));
  f.add(cyl(62, 62, 24, mat('#6f6552', 0.95), 0, 0, 0, 32));
  g.add(mesh(new THREE.ConeGeometry(60, 70, 16).translate(0, 24 + 35, 0), HILL));
  // Walls stepping up, and the citadel at the summit
  for (const [r, y] of [[60, 24], [38, 24 + 70 * (22 / 60)], [18, 24 + 70 * (42 / 60)]]) {
    f.add(ellipseWall(r, r, 0, Math.PI * 2, 1.8, y, y + 4, STONE));
  }
  f.add(box(10, 6, 8, STONE, 0, 90, 0), at(hemi(3, STONE, 16), 0, 96, 0));
  // Outer walls on the plain, with the Chand Minar inside them
  g.add(ellipseWall(130, 130, 0, Math.PI * 2, 2.6, 0, 7, STONE));
  f.add(at(chandMinar(), 40, 0, 96));
  return { group: g, focus: f, view: [0.5, 0.3, 1.2] };
}

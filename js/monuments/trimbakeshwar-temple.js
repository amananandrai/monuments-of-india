import * as THREE from 'three';
import { M, mat, mesh, box, at, nagaraTemple } from '../helpers.js';

const BASALT = mat('#3d3a37', 0.8);
const SHADE = mat('#2c2a28', 0.85);
const HILL = mat('#6c7650', 0.95, 0, { flatShading: true });

export function buildTrimbakeshwar() {
  const g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  // The flat-topped Brahmagiri hills behind, where the Godavari rises
  const hill = mesh(new THREE.CylinderGeometry(120, 170, 70, 10).translate(0, 35, 0), HILL, -40, 0, -260);
  hill.scale.z = 0.6;
  g.add(hill, box(200, 0.2, 200, M.path));
  // Walled courtyard round the black basalt temple
  for (const s of [-1, 1]) f.add(box(80, 6, 2, mat('#5d5853', 0.9), 0, 0, s * 45), box(2, 6, 90, mat('#5d5853', 0.9), s * 40, 0, 0));
  f.add(box(20, 9, 8, BASALT, 0, 0, 45));
  f.add(at(nagaraTemple({ w: 13, h: 26, m: BASALT, shade: SHADE, plinth: 2.4, urus: 8, halls: [[15, 8, 5], [11, 6, 4]] }), 0, 0, -24));
  return { group: g, focus: f, view: [0.85, 0.36, 1.15] };
}

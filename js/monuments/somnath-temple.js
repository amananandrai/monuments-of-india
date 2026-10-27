import * as THREE from 'three';
import { M, mat, box, cyl, at, nagaraTemple } from '../helpers.js';

const STONE = mat('#d8b07a', 0.85);
const SHADE = mat('#b8905c', 0.9);

export function buildSomnath() {
  const g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  // The Arabian Sea behind, and the sea wall with its arrow pillar
  g.add(box(600, 0.4, 300, M.water, 0, -0.1, -190), box(160, 0.2, 140, M.path, 0, 0, 10));
  f.add(box(110, 3, 4, SHADE, 0, 0, -38));
  f.add(cyl(0.8, 1, 9, STONE, 30, 3, -38, 10), cyl(0, 0.9, 2.4, M.gild, 30, 12, -38, 8));
  // The temple in Chalukya (Maru-Gurjara) style: tall spire with two rings of minor spires, and two halls
  f.add(at(nagaraTemple({ w: 14, h: 26, m: STONE, shade: SHADE, plinth: 3, urus: 8, halls: [[18, 9, 6], [16, 8, 5]] }), 0, 0, -20));
  return { group: g, focus: f, view: [0.85, 0.32, 1.15] };
}

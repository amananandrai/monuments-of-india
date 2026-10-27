import * as THREE from 'three';
import { M, mat, box, at, nagaraTemple, inst, unitCyl, aroundRect } from '../helpers.js';

const STONE = mat('#e2c79a', 0.85);
const SHADE = mat('#b98f5f', 0.9);
const SPIRE = mat('#d79a55', 0.8);

export function buildMahakaleshwar() {
  const g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  g.add(box(150, 0.2, 150, M.path), box(70, 0.4, 20, M.water, -20, 0, -62));
  // Courtyard colonnade, and the Koti Teerth tank beside the temple
  const cols = [];
  aroundRect(90, 100, 3).forEach(([x, z]) => cols.push([x, 0, z, 0.8, 5, 0.8]));
  f.add(inst(unitCyl(8), cols, SHADE));
  for (const s of [-1, 1]) f.add(box(92, 0.8, 4, SHADE, 0, 5, s * 50), box(4, 0.8, 102, SHADE, s * 45, 5, 0));
  f.add(box(26, 1, 22, SHADE, -28, 0, -14), box(22, 1.1, 18, M.water, -28, 0, -14));
  // Three-level temple under a tall spire ringed with smaller spires
  f.add(at(nagaraTemple({ w: 12, h: 24, m: STONE, shade: SHADE, spireM: SPIRE, plinth: 2, urus: 8, halls: [[14, 8, 5], [12, 7, 4]] }), 10, 0, -20));
  return { group: g, focus: f, view: [0.85, 0.42, 1.15] };
}

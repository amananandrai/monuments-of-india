import * as THREE from 'three';
import { M, mat, box, at, starPrism, pidaRoof, kalash, inst, unitCyl, unitBox, aroundRect } from '../helpers.js';

const DOLERITE = mat('#4d4a47', 0.8);
const SAND = mat('#b49a7c', 0.9);
const BRICK = mat('#a5674c', 0.9);

export function buildRamappa() {
  const g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  g.add(box(110, 0.2, 110, M.grass));
  for (const s of [-1, 1]) f.add(box(80, 2.4, 1.6, SAND, 0, 0, s * 40), box(1.6, 2.4, 80, SAND, s * 40, 0, 0));
  // Star-shaped platform (upapitha)
  f.add(at(starPrism(20, 22, 19, 1.6, SAND), 0, 0, -2), at(starPrism(20, 19, 16.5, 1.4, DOLERITE), 0, 1.6, -2));
  const B = 3;
  // Mandapa: dark dolerite pillars, a broad eave, and bracket figures (madanikas) at the corners
  const cols = [];
  for (let x = -7.5; x <= 7.5; x += 3) for (let z = -1; z <= 13; z += 3.5) cols.push([x, B, z, 1, 5, 1]);
  f.add(box(18, 0.6, 18, DOLERITE, 0, B - 0.6, 6), inst(unitCyl(8), cols, DOLERITE));
  f.add(box(22, 0.7, 22, DOLERITE, 0, B + 5, 6), box(18, 1.2, 18, SAND, 0, B + 5.7, 6));
  const figs = [];
  aroundRect(19, 19, 4.6).forEach(([x, z, ry]) => figs.push([x, B + 2.6, z + 6, 0.5, 2.2, 0.4, ry]));
  f.add(inst(unitBox(), figs, mat('#2f2d2b', 0.6)));
  // Sanctum on its dark base, under the light-brick tower
  f.add(box(12, 7, 12, DOLERITE, 0, B, -10), box(13, 0.6, 13, SAND, 0, B + 7, -10));
  const tower = pidaRoof(12, 4.5, 7, 1.1, BRICK, mat('#8a523c', 0.9));
  f.add(at(tower, 0, B + 7.6, -10), at(kalash(2.2, SAND), 0, B + 7.6 + tower.userData.top, -10));
  // Nandi pavilion facing the shrine
  f.add(box(8, 1.2, 8, DOLERITE, 0, 0, 30), box(3, 1.6, 5, mat('#2f2d2b', 0.6), 0, 1.2, 30), box(1.6, 1.4, 1.4, mat('#2f2d2b', 0.6), 0, 2.4, 27.6));
  return { group: g, focus: f, view: [0.95, 0.45, 1.15] };
}

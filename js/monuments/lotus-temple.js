import * as THREE from 'three';
import { M, box, cyl, group, petal } from '../helpers.js';

export function buildLotusTemple() {
  const g = new THREE.Group(), f = new THREE.Group(), deg = Math.PI / 180;
  g.add(f);
  g.add(cyl(85, 85, 0.2, M.grass, 0, 0, 0, 64));
  f.add(cyl(40, 42, 2, M.plaster, 0, 0.2, 0, 9), cyl(34, 36, 2, M.marble, 0, 2.2, 0, 9));
  const B = 4.2;
  for (let k = 0; k < 9; k++) {
    const t = k * 40 * deg, t2 = t + 20 * deg;
    f.add(petal([11, B], [14.5, B + 20], [1.2, B + 30], 5.6, 0.35).rotateY(t));
    f.add(petal([16, B], [22, B + 15], [13, B + 23.5], 7.6, 0.35).rotateY(t2));
    f.add(petal([22, B], [31, B + 12.5], [36, B + 3.5], 8, -0.3).rotateY(t));
    const pool = new THREE.Group();
    pool.add(box(22, 0.7, 12, M.marble, 0, 0.2, 52), box(19, 0.75, 9, M.water, 0, 0.2, 52));
    f.add(pool.rotateY(t2));
  }
  for (let k = 0; k < 9; k++) g.add(group(box(5, 0.3, 40, M.path, 0, 0.2, 60)).rotateY(k * 40 * deg));
  return { group: g, focus: f, view: [0.9, 0.3, 1.25] };
}

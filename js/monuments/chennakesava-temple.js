import * as THREE from 'three';
import { M, box, group, at, pidaRoof, inst, unitCyl, aroundRect, starPrism, stellateTower } from '../helpers.js';

export function buildChennakesava() {
  const m = M.soap, md = M.soapDark, g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  g.add(box(110, 0.2, 120, M.grass), box(70, 0.25, 80, M.path));
  // Cloister of 64 cells around the courtyard, entered through a gateway
  for (const [w, d, x, z] of [[66, 5, 0, -37.5], [5, 80, -32.5, 0], [5, 80, 32.5, 0], [24, 5, -21, 37.5], [24, 5, 21, 37.5]]) f.add(box(w, 4.5, d, m, x, 0, z));
  const posts = [];
  aroundRect(58, 72, 3).forEach(([x, z]) => posts.push([x, 0, z, 0.6, 4, 0.6]));
  f.add(inst(unitCyl(8), posts, m), box(18, 7, 6, m, 0, 0, 37.5), at(pidaRoof(18, 8, 3, 0.9, m, md), 0, 7, 37.5));
  // Star-shaped platform carrying three star-shaped shrines around a pillared hall
  const B = 1.8, shrines = [[0, -10], [-11, 0], [11, 0]];
  f.add(box(28, B, 26, md, 0, 0, 4), box(16, 6, 16, m, 0, B, 6), box(18, 0.8, 18, md, 0, B + 6, 6), at(pidaRoof(14, 6, 3, 0.8, m, md), 0, B + 6.8, 6));
  for (const [x, z] of shrines) {
    f.add(at(starPrism(16, 9, 7.6, B, md), x, 0, z), at(starPrism(16, 6, 5, 7, m), x, B, z));
    for (const y of [0.5, 1.6, 2.7]) f.add(at(starPrism(16, 6.25, 5.2, 0.6, md), x, B + y, z));
    f.add(at(stellateTower(5.6, 9, m, md), x, B + 7, z));
  }
  return { group: g, focus: f, view: [0.85, 0.55, 1.15] };
}

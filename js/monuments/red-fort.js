import * as THREE from 'three';
import { M, box, cyl, group, at, onFace, archPanel, chhatri, flag, instBoxes, tricolour } from '../helpers.js';

export function buildRedFort() {
  const Rd = M.red, Rl = M.redLight, g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  g.add(box(300, 0.25, 12, M.grass, 0, 0, 18), box(300, 0.2, 22, M.asphalt, 0, 0, 36));
  const merlons = [];
  const wall = (x0, x1, focus) => {
    const t = focus ? f : g;
    t.add(box(x1 - x0, 18, 10, Rd, (x0 + x1) / 2, 0, 0), box(x1 - x0, 0.8, 10.4, Rl, (x0 + x1) / 2, 17.2, 0));
    for (let x = x0 + 1.3; x < x1; x += 2.6) merlons.push([x, 18, 4.6, 1.5, 1.8, 0.8]);
  };
  const bastion = (x, focus) => {
    const t = focus ? f : g;
    t.add(cyl(8, 9, 20, Rd, x, 0, 2, 24), cyl(8.4, 8.4, 0.8, Rl, x, 19.2, 2, 24), at(chhatri(4.5, 10, Rd, M.marble), x, 20, 2));
  };
  for (const s of [-1, 1]) {
    wall(s < 0 ? -60 : 16, s < 0 ? -16 : 60, true);
    wall(s < 0 ? -140 : 60, s < 0 ? -60 : 140, false);
    bastion(s * 60, true);
    bastion(s * 140, false);
  }
  g.add(instBoxes(merlons, Rd));
  // Lahori Gate: arched gatehouse between octagonal towers, a row of chhatris, and the national flag
  f.add(box(32, 23, 18, Rd, 0, 0, 2), box(32.6, 1, 18.6, Rl, 0, 23, 2));
  f.add(onFace(at(archPanel(13, 20, true, Rl, 0.4), 0, 0.5, 0), 0, 11));
  f.add(onFace(at(archPanel(9, 15, true, M.recess, 0.3), 0, 0.5, 0), 0, 11.42));
  for (const x of [-17.5, 17.5]) {
    f.add(cyl(4, 4.3, 26, Rd, x, 0, 9, 8));
    for (const y of [8, 16, 23]) f.add(cyl(4.6, 4.6, 0.5, Rl, x, y, 9, 8));
    f.add(at(chhatri(3.4, 8, Rd, M.marble), x, 26, 9));
  }
  for (let k = -3; k <= 3; k++) f.add(at(chhatri(1.25, 4.5, Rd, M.marble), k * 3.5, 24, 9.5));
  f.add(at(tricolour(14), 0, 24, -2));
  return { group: g, focus: f, view: [0.5, 0.28, 1.2] };
}

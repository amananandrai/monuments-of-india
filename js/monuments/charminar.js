import * as THREE from 'three';
import { M, box, cyl, ring, group, at, onFace, FACES, archWall, archPanel, onionDome, finial } from '../helpers.js';

export function buildCharminar() {
  const m = M.plaster, g = new THREE.Group();
  g.add(box(32, 0.8, 32, M.granite));
  const b = 0.8;
  // Four arched faces round the open square at the centre, so each arch looks through to the others.
  const t = 2;
  for (const sz of [-1, 1]) g.add(at(archWall(20, 21, t, 11, 16.5, true, m), 0, b, sz * (10 - t / 2)));
  for (const sx of [-1, 1]) g.add(at(archWall(20 - 2 * t, 21, t, 11, 16.5, true, m), sx * (10 - t / 2), b, 0).rotateY(Math.PI / 2));
  g.add(box(21.6, 0.9, 21.6, m, 0, b + 21));
  for (const a of FACES) {
    for (let k = -2; k <= 2; k++) g.add(onFace(at(archPanel(1.8, 3.2, true, M.recess, 0.2), 0, b + 22.4, 0), a, 9.8, k * 3.2));
  }
  g.add(box(19.6, 4.6, 19.6, m, 0, b + 21.9));
  g.add(box(21, 0.7, 21, m, 0, b + 26.5));
  g.add(box(18.6, 3.6, 18.6, m, 0, b + 27.2));
  for (const a of FACES) for (let k = -3; k <= 3; k++) g.add(onFace(at(archPanel(1.5, 2.6, true, M.recess, 0.2), 0, b + 27.6, 0), a, 9.3, k * 2.4));
  g.add(box(19.2, 1, 19.2, m, 0, b + 30.8));
  for (const x of [-10, 10]) for (const z of [-10, 10]) {
    const t = new THREE.Group();
    t.add(cyl(2.4, 2.7, 31.5, m, 0, 0, 0, 12));
    for (const y of [21, 31.5]) t.add(cyl(3.8, 2.7, 0.8, m, 0, y - 0.8, 0, 12), ring(3.8, 0.9, m, y, 12));
    t.add(cyl(2.2, 2.4, 7.5, m, 0, 31.5, 0, 12));
    t.add(cyl(3.4, 2.2, 0.7, m, 0, 38.3, 0, 12), ring(3.4, 0.8, m, 39, 12));
    t.add(cyl(2.0, 2.2, 6.5, m, 0, 39, 0, 12));
    t.add(cyl(3.0, 2.0, 0.6, m, 0, 44.9, 0, 12), ring(3.0, 0.7, m, 45.5, 12));
    t.add(at(onionDome(2.3, m), 0, 45.5, 0));
    t.add(at(finial(4), 0, 49.6, 0));
    g.add(at(t, x, b, z));
  }
  return { group: g };
}

import * as THREE from 'three';
import { M, box, cyl, lathe, group, at, archWall, hemi, finial } from '../helpers.js';

export function buildIndiaGate() {
  const m = M.buff, r = M.red, g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  f.add(box(36, 1, 22, r));
  f.add(box(31, 1.4, 17, r, 0, 1));
  const b = 2.4;
  f.add(at(archWall(24, 30, 12, 9.2, 21, false, m), 0, b, 0));
  f.add(at(archWall(11.9, 17, 23.9, 4.4, 11, false, m), 0, b, 0).rotateY(Math.PI / 2));
  f.add(box(24.4, 0.9, 12.4, r, 0, b + 15.5));
  for (const s of [-1, 1]) for (const z of [-6.15, 6.15]) f.add(box(1.4, 28, 0.4, m, s * 8.4, b, z));
  f.add(box(25.2, 1, 13.2, m, 0, b + 30));
  f.add(box(23, 5.5, 11, m, 0, b + 31));
  f.add(box(23.8, 0.8, 11.8, m, 0, b + 36.5));
  f.add(box(20, 1.6, 9.2, m, 0, b + 37.3));
  f.add(box(16, 1.3, 7.6, m, 0, b + 38.9));
  f.add(cyl(3.4, 3.8, 1, m, 0, b + 40.2, 0, 40));
  f.add(at(lathe([[0, 0], [2.6, 0], [3.8, 0.6], [4.4, 1.3], [4.5, 1.5], [3.9, 1.5], [0, 0.9]], m, 40), 0, b + 41.2, 0));
  const c = new THREE.Group();
  c.add(box(12, 1, 12, r));
  for (const x of [-4.2, 4.2]) for (const z of [-4.2, 4.2]) c.add(box(1.6, 10, 1.6, m, x, 1, z));
  c.add(box(11, 1.6, 11, m, 0, 11));
  c.add(at(hemi(4, m), 0, 12.6, 0));
  c.add(at(finial(3.5), 0, 16.4, 0));
  g.add(at(c, 0, 0, 70));
  g.add(box(18, 0.2, 260, M.path, 0, 0, 60));
  for (const x of [-34, 34]) g.add(box(48, 0.15, 260, M.grass, x, 0, 60));
  return { group: g, focus: f };
}

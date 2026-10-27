import * as THREE from 'three';
import { M, box, cyl, group, at, archWall, onionDome, hemi, finial } from '../helpers.js';

export function buildGateway() {
  const m = M.basalt, g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  f.add(box(50, 1.5, 22, M.concrete));
  const b = 1.5;
  f.add(at(archWall(18, 18, 14, 8.5, 14.5, false, m), 0, b, 0));
  f.add(at(archWall(13.9, 12, 17.9, 5, 10, false, m), 0, b, 0).rotateY(Math.PI / 2));
  f.add(box(19, 2.6, 15, m, 0, b + 18));
  f.add(box(19.8, 0.8, 15.8, M.plaster, 0, b + 20.6));
  f.add(cyl(5, 5, 2, m, 0, b + 21.4, 0, 32));
  f.add(at(hemi(5, m), 0, b + 23.4, 0));
  f.add(at(finial(3.5), 0, b + 28.2, 0));
  for (const x of [-8.6, 8.6]) for (const z of [-6.6, 6.6]) {
    f.add(cyl(1.4, 1.5, 23.5, m, x, b, z, 8));
    f.add(cyl(1.9, 1.9, 0.6, M.plaster, x, b + 18, z, 8));
    f.add(at(onionDome(1.55, m), x, b + 23.5, z));
    f.add(at(finial(1.8), x, b + 26.3, z));
  }
  for (const s of [-1, 1]) {
    f.add(at(archWall(9, 11, 9, 4.2, 8.5, true, m), s * 13.5, b, 0));
    f.add(box(9.8, 1, 9.8, M.plaster, s * 13.5, b + 11));
    for (const z of [-4.2, 4.2]) {
      f.add(cyl(0.9, 1, 13.5, m, s * 17.8, b, z, 8));
      f.add(at(onionDome(1, m), s * 17.8, b + 13.5, z));
    }
  }
  g.add(box(70, 0.25, 30, M.path, 0, 0, -12));
  g.add(box(600, 0.4, 300, M.water, 0, -0.3, 160));
  return { group: g, focus: f, view: [-0.9, 0.32, 1.25] };
}

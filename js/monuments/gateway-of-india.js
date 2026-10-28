import * as THREE from 'three';
import { M, box, cyl, group, at, archWall, onionDome, hemi, finial, sheet } from '../helpers.js';

export function buildGateway() {
  const m = M.basalt, g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  // The central hall is four thin faces round an open floor, so the arches show through to the
  // far side; a low pavement replaces the old sill. The side pavilions keep their 1.5 m podium.
  const p = 0.35, b = 1.5, t = 1.7;
  f.add(box(18, p, 22, M.concrete));
  for (const s of [-1, 1]) f.add(box(16, b, 22, M.concrete, s * 17, 0, 0));
  for (const sz of [-1, 1]) f.add(at(archWall(18, 20, t, 8.5, 16, false, m), 0, p, sz * (7 - t / 2)));
  for (const sx of [-1, 1]) f.add(at(archWall(14 - 2 * t, 19.2, t, 5.2, 11, false, m), sx * (9 - t / 2), p, 0).rotateY(Math.PI / 2));
  f.add(box(19, 2.6, 15, m, 0, b + 18));
  f.add(box(19.8, 0.8, 15.8, M.plaster, 0, b + 20.6));
  f.add(cyl(5, 5, 2, m, 0, b + 21.4, 0, 32));
  f.add(at(hemi(5, m), 0, b + 23.4, 0));
  f.add(at(finial(3.5), 0, b + 28.2, 0));
  for (const x of [-8.6, 8.6]) for (const z of [-6.6, 6.6]) {
    f.add(cyl(1.4, 1.5, 23.5 + b - p, m, x, p, z, 8));
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
  g.add(sheet(600, 300, M.sea, 0, 0.1, 160));
  return { group: g, focus: f, view: [-0.9, 0.32, 1.25] };
}

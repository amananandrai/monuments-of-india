import * as THREE from 'three';
import { M, mat, mesh, box, cyl, at, rng, hipRoof, tibetanBlock, TIBETAN, inst, unitBox } from '../helpers.js';

const HILL = mat('#4e6e3c', 0.95, 0, { flatShading: true });
const YELLOW = mat('#e6b94a', 0.8);

export function buildRumtek() {
  const g = new THREE.Group(), f = new THREE.Group(), R = rng(59);
  g.add(f);
  // Forested Sikkim hills
  g.add(box(300, 0.2, 300, mat('#58783f', 0.95)));
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2, d = 220 + R() * 80, h = 90 + R() * 80;
    g.add(mesh(new THREE.ConeGeometry(h * 1.2, h, 8).translate(0, h / 2, 0), HILL, Math.cos(a) * d, 0, Math.sin(a) * d));
  }
  // Courtyard ringed by monks' quarters
  f.add(box(70, 0.4, 70, M.path));
  const q = [];
  for (const s of [-1, 1]) q.push([0, 0, s * 32, 70, 7, 6], [s * 32, 0, 0, 6, 7, 58]);
  f.add(inst(unitBox(), q, YELLOW), inst(unitBox(), q.map(([x, y, z, w, h, d]) => [x, h, z, w + 0.4, 0.8, d + 0.4]), TIBETAN.maroon));
  // The main shrine hall: four storeys under a gilded roof with its golden finial
  f.add(at(tibetanBlock(28, 14, 22, 3), 0, 0, -12), box(18, 5, 14, TIBETAN.white, 0, 14, -14), box(18.4, 0.8, 14.4, TIBETAN.maroon, 0, 18.2, -14));
  f.add(at(hipRoof(22, 18, 5, M.gild), 0, 19, -14), cyl(0.4, 1, 3, M.gild, 0, 24, -14, 10));
  for (const x of [-12, 12]) f.add(cyl(0.6, 0.9, 3, M.gild, x, 14, -1, 8));
  f.add(box(12, 6, 6, TIBETAN.white, 0, 0, 2), at(hipRoof(14, 8, 2.4, M.gild), 0, 6, 2));
  return { group: g, focus: f, view: [0.6, 0.4, 1.25] };
}

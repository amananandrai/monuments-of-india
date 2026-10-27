import * as THREE from 'three';
import { M, mat, box, cyl, group, at, hemi, finial, surface } from '../helpers.js';

const JALI = surface(mat('#d98a73', 0.85), 'lattice');

export function buildHawaMahal() {
  const P = M.hawa, L = M.hawaLight, g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  g.add(box(100, 0.2, 14, M.asphalt, 0, 0, 12), box(100, 0.3, 4, M.path, 0, 0, 3.5));
  const floors = [[46, 3.6], [46, 3.0], [30, 3.0], [20, 3.0], [11, 3.0]];
  let y = 0;
  floors.forEach(([w, h], fi) => {
    f.add(box(w, h, 5, P, 0, y, -2.5));
    const n = Math.floor(w / 1.9), step = w / n;
    for (let i = 0; i < n; i++) {
      const x = -w / 2 + step * (i + 0.5);
      const bay = cyl(0.85, 0.85, h * 0.6, P, x, y + h * 0.1, 0.25, 6);
      bay.rotation.y = Math.PI / 6;
      f.add(bay);
      f.add(box(0.78, h * 0.38, 0.08, JALI, x, y + h * 0.18, 1.0));
      f.add(at(hemi(0.85, L, 10), x, y + h * 0.7, 0.25));
    }
    f.add(box(w + 0.4, 0.22, 6.6, M.lime, 0, y + h - 0.22, -2.0));
    const next = floors[fi + 1];
    if (next && next[0] < w) for (const s of [-1, 1]) f.add(box((w - next[0]) / 2, 0.8, 5, L, s * (w + next[0]) / 4, y + h, -2.5));
    y += h;
  });
  f.add(box(3.4, 1.4, 3, P, 0, y, -1.2), at(hemi(1.6, L, 16), 0, y + 1.4, -1.2), at(finial(2), 0, y + 2.9, -1.2));
  for (const x of [-3.8, 3.8]) f.add(box(2, 0.9, 2, P, x, y, -1.2), at(hemi(1, L, 12), x, y + 0.9, -1.2), at(finial(1.3), x, y + 1.85, -1.2));
  return { group: g, focus: f, view: [0.4, 0.2, 1.2] };
}

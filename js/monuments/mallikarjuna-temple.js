import * as THREE from 'three';
import { M, mat, mesh, box, at, rng, gopuram, pidaRoof, hemi, kalash, inst, unitBox, aroundRect } from '../helpers.js';

const CREAM = ['#efe7d6', '#e2d3b7', '#d6c5a4', '#f4efe4'];
const WALL = mat('#b9a586', 0.9);
const HILL = mat('#557040', 0.95, 0, { flatShading: true });

export function buildMallikarjuna() {
  const g = new THREE.Group(), f = new THREE.Group(), R = rng(47);
  g.add(f);
  // Srisailam hill in the Nallamala forest
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2, d = 230 + R() * 60, h = 50 + R() * 50;
    g.add(mesh(new THREE.ConeGeometry(h * 2, h, 9).translate(0, h / 2, 0), HILL, Math.cos(a) * d, 0, Math.sin(a) * d));
  }
  g.add(box(220, 0.2, 220, M.path));
  // High enclosure walls carved with friezes, and a gopuram on each side
  const W = 100, D = 120, frieze = [];
  for (const s of [-1, 1]) f.add(box(W, 9, 3, WALL, 0, 0, s * D / 2), box(3, 9, D, WALL, s * W / 2, 0, 0));
  for (const y of [2, 5]) aroundRect(W + 3.2, D + 3.2, 1.8).forEach(([x, z, ry]) => frieze.push([x, y, z, 1.2, 1.6, 0.3, ry]));
  f.add(inst(unitBox(), frieze, mat('#8f7c60', 0.9)));
  f.add(at(gopuram(22, 12, 34, 9, 5, CREAM), 0, 0, D / 2), at(gopuram(18, 10, 26, 7, 6, CREAM), 0, 0, -D / 2));
  for (const s of [-1, 1]) f.add(at(gopuram(18, 10, 26, 7, 7 + s, CREAM).rotateY(Math.PI / 2), s * W / 2, 0, 0));
  // The shrine of Mallikarjuna under its gilded vimana, and Bhramaramba's shrine behind
  for (const [z, w, sc] of [[0, 14, 1], [-30, 10, 0.75]]) {
    const r = pidaRoof(w, w * 0.45, 4, 1, M.gild, M.gildDeep);
    f.add(box(w * 1.1, 8 * sc, w * 1.1, mat('#e9e0cc', 0.85), 0, 0, z), at(r, 0, 8 * sc, z), at(hemi(w * 0.24, M.gild, 20), 0, 8 * sc + r.userData.top, z), at(kalash(w * 0.15), 0, 8 * sc + r.userData.top + w * 0.24, z));
  }
  f.add(box(22, 6, 18, mat('#e9e0cc', 0.85), 0, 0, 20));
  return { group: g, focus: f, view: [0.75, 0.38, 1.2] };
}

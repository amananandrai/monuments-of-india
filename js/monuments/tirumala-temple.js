import * as THREE from 'three';
import { M, mat, mesh, box, cyl, at, rng, gopuram, pidaRoof, hemi, kalash, ribbed, inst, unitBox } from '../helpers.js';

const WHITE = ['#f2ede2', '#e9e1cf', '#f6f2ea', '#dcd3c0'];
const LIME = mat('#efe9dd', 0.85);
const HILL = mat('#55703f', 0.95, 0, { flatShading: true });

export function buildTirumala() {
  const g = new THREE.Group(), f = new THREE.Group(), R = rng(29);
  g.add(f);
  // The Seshachalam hills around the temple town
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2, d = 260 + R() * 80, h = 50 + R() * 60;
    g.add(mesh(new THREE.ConeGeometry(h * 2.2, h, 9).translate(0, h / 2, 0), HILL, Math.cos(a) * d, 0, Math.sin(a) * d));
  }
  g.add(box(220, 0.2, 220, M.path));
  const town = [];
  for (let i = 0; i < 30; i++) {
    const a = R() * Math.PI * 2, d = 80 + R() * 25;
    town.push([Math.cos(a) * d, 0, Math.sin(a) * d, 8 + R() * 8, 4 + R() * 8, 8 + R() * 6, a]);
  }
  g.add(inst(unitBox(), town, mat('#e2d8c4', 0.9)));
  // Swami Pushkarini tank beside the temple
  g.add(box(36, 1, 30, M.granite, -62, 0, -4), box(30, 1.1, 24, M.water, -62, 0, -4));
  // Walled complex with the white Mahadwara gopuram at the entrance
  for (const s of [-1, 1]) f.add(box(80, 8, 2.5, LIME, 0, 0, s * 52), box(2.5, 8, 104, LIME, s * 40, 0, 0));
  f.add(at(gopuram(22, 12, 30, 7, 2, WHITE), 0, 0, 52), at(gopuram(14, 9, 18, 5, 4, WHITE), 0, 0, 22));
  for (const s of [-1, 1]) f.add(box(52, 6, 2, LIME, 0, 0, s * 22), box(2, 6, 44, LIME, s * 26, 0, 0));
  // Ananda Nilayam: the gold-covered vimana over the sanctum, and the gold flagstaff
  f.add(box(12, 7, 12, M.gild, 0, 0, 0));
  const r = pidaRoof(12, 6, 3, 1.1, M.gild, M.gildDeep);
  f.add(at(r, 0, 7, 0), at(ribbed(hemi(3.6, M.gild, 24), 12, 0.06), 0, 7 + r.userData.top, 0), at(kalash(2.4), 0, 10.6 + r.userData.top, 0));
  f.add(box(2.4, 1.6, 2.4, M.granite, 0, 0, 14), cyl(0.4, 0.6, 15, M.gild, 0, 1.6, 14, 10), cyl(1, 0.3, 1, M.gild, 0, 16.6, 14, 10));
  return { group: g, focus: f, view: [0.7, 0.42, 1.2] };
}

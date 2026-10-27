import * as THREE from 'three';
import { M, mat, mesh, box, cyl, at, chhatri, onFace, FACES, archPanel, hemi, finial, inst, unitBox } from '../helpers.js';

const STONE = mat('#c8b28c', 0.9);
const RUIN = mat('#a8916d', 0.95);
const CLIFF = mat('#7b7055', 0.95, 0, { flatShading: true });

// The nine-storey Vijay Stambh (Tower of Victory), about 37 m.
function vijayStambh() {
  const g = new THREE.Group();
  g.add(box(14, 3, 14, STONE));
  let y = 3;
  for (let i = 0; i < 9; i++) {
    const w = 10 - i * 0.25, h = 3.6;
    g.add(box(w, h, w, STONE, 0, y), box(w + 1.6, 0.4, w + 1.6, RUIN, 0, y + h - 0.4));
    for (const a of FACES) g.add(onFace(at(archPanel(2, 2.6, true, M.recess, 0.2), 0, y + 0.4, 0), a, w / 2));
    y += h;
  }
  g.add(at(chhatri(3.6, 6, STONE), 0, y, 0));
  return g;
}

export function buildChittorgarh() {
  const g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  g.add(box(700, 0.2, 400, mat('#9c9a63', 0.95)));
  // The long plateau, ringed by walls
  const H = 40, L = 300, W = 90;
  const mesa = mesh(new THREE.CylinderGeometry(1, 1.3, 1, 14).translate(0, 0.5, 0), CLIFF);
  mesa.scale.set(L / 2, H, W / 2);
  g.add(mesa);
  const wall = [];
  for (let k = 0; k < 90; k++) {
    const a = (k / 90) * Math.PI * 2;
    wall.push([Math.cos(a) * (L / 2 - 3), H, Math.sin(a) * (W / 2 - 3), 11, 5, 2, Math.atan2(-Math.cos(a) * (W / 2), -Math.sin(a) * (L / 2))]);
  }
  g.add(inst(unitBox(), wall, STONE));
  // Vijay Stambh, Rana Kumbha's palace ruins, and Padmini's palace in its pool
  f.add(at(vijayStambh(), 20, H, 0));
  const ruins = [];
  for (const [x, z, w, d, h] of [[-30, -10, 30, 18, 10], [-46, 8, 14, 12, 7], [-20, 14, 10, 8, 5], [-60, -14, 8, 8, 12]]) ruins.push([x, H, z, w, h, d]);
  f.add(inst(unitBox(), ruins, RUIN));
  f.add(box(30, 0.6, 22, M.water, 70, H, 8), box(10, 6, 8, mat('#efe7d6', 0.85), 70, H + 0.6, 8), at(hemi(3, mat('#efe7d6', 0.85), 16), 70, H + 6.6, 8));
  return { group: g, focus: f, view: [0.5, 0.3, 1.2] };
}

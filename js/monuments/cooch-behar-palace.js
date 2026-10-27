import * as THREE from 'three';
import { M, mat, box, cyl, lathe, at, onFace, archPanel, ribbed, inst, unitBox, surface } from '../helpers.js';

const BRICK = surface(mat('#a9583f', 0.85), 'brick');
const WHITE = mat('#ece6da', 0.8);
const METAL = mat('#8a9097', 0.45, 0.5);

export function buildCoochBehar() {
  const g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  g.add(box(300, 0.15, 260, M.grass, 0, 0, 40), box(60, 0.5, 30, M.water, -70, 0, 80), box(10, 0.25, 120, M.path, 0, 0, 80));
  // Two storeys of classical arcades in brick, with white pilasters and cornices
  const W = 120, D = 30, H = 18;
  f.add(box(W, H, D, BRICK), box(W + 1, 1, D + 1, WHITE, 0, H / 2), box(W + 1.2, 1.2, D + 1.2, WHITE, 0, H));
  const pil = [];
  for (let k = 0; k <= 24; k++) for (const y of [0, H / 2 + 1]) {
    const x = -W / 2 + k * (W / 24);
    pil.push([x, y, D / 2 + 0.3, 0.8, H / 2 - 1, 0.6]);
    if (k < 24) f.add(onFace(at(archPanel(3, 6, false, M.recess, 0.25), 0, y + 0.6, 0), 0, D / 2, x + W / 48));
  }
  f.add(inst(unitBox(), pil, WHITE));
  // Projecting portico and the tall dome over the Durbar Hall
  f.add(box(26, H + 4, 12, BRICK, 0, 0, D / 2 + 4), box(27, 1.4, 13, WHITE, 0, H + 4, D / 2 + 4));
  for (let k = -2; k <= 2; k++) f.add(cyl(0.9, 1, H + 3, WHITE, k * 5, 0, D / 2 + 9.6, 16));
  f.add(cyl(9, 9, 8, WHITE, 0, H + 1.2, 0, 32), cyl(9.6, 9.6, 0.8, BRICK, 0, H + 9.2, 0, 32));
  f.add(at(ribbed(lathe([[9, 0], [8.8, 4], [7.6, 9], [5, 13], [2, 15.4], [0, 16]], METAL, 32), 16, 0.04), 0, H + 10, 0));
  f.add(cyl(1.4, 1.8, 3, WHITE, 0, H + 25.6, 0, 12), cyl(0, 0.8, 2.4, METAL, 0, H + 28.6, 0, 8));
  return { group: g, focus: f, view: [0.55, 0.28, 1.25] };
}

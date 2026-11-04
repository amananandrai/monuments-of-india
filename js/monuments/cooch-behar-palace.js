import * as THREE from 'three';
import { M, mat, box, cyl, lathe, at, ribbed, inst, unitBox, surface } from '../helpers.js';
import { arcadeSkin } from '../details/mughal.js';
import { classicalDoor, porch } from '../details/colonial.js';

const BRICK = surface(mat('#a9583f', 0.85), 'brick');
const WHITE = mat('#ece6da', 0.8);
const METAL = mat('#8a9097', 0.45, 0.5);

export function buildCoochBehar() {
  const g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  g.add(box(300, 0.15, 260, M.grass, 0, 0, 40), box(60, 0.5, 30, M.water, -70, 0, 80), box(10, 0.25, 120, M.path, 0, 0, 80));
  // Two storeys of round-arched arcades 1.6 m deep in brick, open onto verandahs, between white
  // pilasters and cornices
  const W = 120, D = 30, H = 18, dd = 1.6, pil = [], cells = [];
  f.add(box(W, H, D - dd, BRICK, 0, 0, -dd / 2), box(W + 1, 1, D + 1, WHITE, 0, H / 2), box(W + 1.2, 1.2, D + 1.2, WHITE, 0, H));
  for (let k = 0; k <= 24; k++) for (const y of [0, H / 2 + 1]) {
    const x = -W / 2 + k * (W / 24), cx = x + W / 48;
    // The two middle bays of the ground floor are left clear for the main door.
    if (!(y === 0 && Math.abs(x) < 4)) pil.push([x, y, D / 2 + 0.3, 0.8, H / 2 - 1, 0.6]);
    if (k < 24 && !(y === 0 && Math.abs(cx) < 4)) cells.push([cx, y + 0.6, 3, 6, 'room']);
  }
  f.add(at(arcadeSkin(W, H, cells, dd, BRICK, { trim: WHITE, pointed: false }), 0, 0, D / 2 - dd));
  f.add(inst(unitBox(), pil, WHITE));
  // The projecting portico over the main door, and the tall dome over the Durbar Hall
  const door = classicalDoor(4, 8, { m: BRICK, trim: WHITE, depth: 0.5, frame: 0.7 });
  f.add(at(porch(26, 10, H + 3, { m: BRICK, trim: WHITE, colM: WHITE, cols: 5, r: 0.9, top: 'balustrade', door, stepsDown: 0.5 }), 0, 0.5, D / 2));
  f.add(box(28, 0.5, 10, WHITE, 0, 0, D / 2 + 5));
  f.add(cyl(9, 9, 8, WHITE, 0, H + 1.2, 0, 32), cyl(9.6, 9.6, 0.8, BRICK, 0, H + 9.2, 0, 32));
  f.add(at(ribbed(lathe([[9, 0], [8.8, 4], [7.6, 9], [5, 13], [2, 15.4], [0, 16]], METAL, 32), 16, 0.04), 0, H + 10, 0));
  f.add(cyl(1.4, 1.8, 3, WHITE, 0, H + 25.6, 0, 12), cyl(0, 0.8, 2.4, METAL, 0, H + 28.6, 0, 8));
  return { group: g, focus: f, view: [0.55, 0.28, 1.25] };
}

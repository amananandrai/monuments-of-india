import * as THREE from 'three';
import { M, mat, mesh, box, at, inst, unitBox, unitCyl } from '../helpers.js';

const ROCK = mat('#7a6c5c', 0.95);
const ROCK_LIGHT = mat('#968672', 0.95);
const DARK = mat('#231d19', 0.9);
const FOREST = mat('#4f6a3a', 0.95);

// The horseshoe-shaped cliff above the Waghora river, with the caves cut in a row along it.
export function buildAjanta() {
  const g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  g.add(box(500, 0.2, 400, FOREST), box(18, 0.4, 260, M.water, 0, 0, 40));
  const R = 70, H = 40, a0 = -0.15 * Math.PI, a1 = 1.15 * Math.PI, N = 30;
  const cliff = [], top = [], caves = [], porch = [];
  for (let k = 0; k <= 80; k++) {
    const t = a0 + (k / 80) * (a1 - a0), x = Math.cos(t) * R, z = -Math.sin(t) * R * 0.8;
    const ry = Math.atan2(x, z);
    const ox = Math.sin(ry), oz = Math.cos(ry);
    cliff.push([x + ox * 26, 0, z + oz * 26, 9, H, 52, ry]);
    top.push([x + ox * 30, H - 1, z + oz * 30, 10, 4, 60, ry]);
  }
  g.add(inst(unitBox(), cliff, ROCK), inst(unitBox(), top, FOREST));
  // Thirty cave fronts: dark doorways with pillared verandahs; two chaitya halls with arched windows
  for (let i = 0; i < N; i++) {
    const t = a0 + 0.06 + (i / (N - 1)) * (a1 - a0 - 0.12), x = Math.cos(t) * R, z = -Math.sin(t) * R * 0.8;
    const ry = Math.atan2(-x, -z), y = 14 + Math.sin(i * 1.7) * 3, ux = Math.sin(ry), uz = Math.cos(ry);
    const chaitya = i === 18 || i === 25;
    caves.push([x + ux * 0.2, y, z + uz * 0.2, chaitya ? 7 : 8, chaitya ? 12 : 5, 1, ry]);
    if (!chaitya) for (let c = -3; c <= 3; c += 2) porch.push([x + ux * 1.4 + Math.cos(ry) * c, y, z + uz * 1.4 - Math.sin(ry) * c, 0.8, 5, 0.8]);
    else {
      const win = mesh(new THREE.TorusGeometry(3, 0.5, 6, 18, Math.PI), ROCK_LIGHT, x + ux * 0.8, y + 10, z + uz * 0.8);
      win.rotation.y = ry;
      f.add(win);
    }
    f.add(at(box(10, 0.8, 4, ROCK_LIGHT), x + ux * 2, y - 0.8, z + uz * 2).rotateY(ry));
  }
  f.add(inst(unitBox(), caves, DARK), inst(unitCyl(8), porch, ROCK_LIGHT));
  return { group: g, focus: f, view: [0.15, 0.28, 1.2] };
}

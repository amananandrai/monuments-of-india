import * as THREE from 'three';
import { M, mat, box, cyl, ring, inst, unitBox, unitCyl } from '../helpers.js';

const SAND = mat('#c8a57c', 0.9);
const SAND_DARK = mat('#a3825d', 0.9);

// The stepwell is cut into the ground: the surrounding land is modelled as raised blocks
// at ground level (y = D), and the trench steps down seven levels to the well at y = 0.
export function buildRaniKiVav() {
  const g = new THREE.Group(), f = new THREE.Group(), D = 27, W = 20, L = 64;
  g.add(f);
  const z0 = L / 2, z1 = -L / 2;
  for (const s of [-1, 1]) g.add(box(70, D, L + 40, M.grass, s * (W / 2 + 35), 0, 0));
  g.add(box(W, D, 20, M.grass, 0, 0, z1 - 10), box(W, D, 20, M.grass, 0, 0, z0 + 10));
  for (const s of [-1, 1]) f.add(box(1.6, 1.2, L + 4, SAND_DARK, s * (W / 2 + 0.8), D, 0));
  // Steps, landing by landing, from ground level down to the well
  const steps = 32, run = (L - 12) / steps;
  for (let i = 0; i < steps; i++) f.add(box(W, D - (i + 1) * (D / steps), run, SAND, 0, 0, z0 - (i + 0.5) * run));
  // Sculpted side walls: rows of niches facing into the trench
  const niches = [];
  for (let row = 0; row < 6; row++) for (let k = 0; k < 18; k++) {
    const z = z0 - 3 - k * 3.2, y = 3 + row * 4;
    if (y > D - 3) continue;
    for (const s of [-1, 1]) niches.push([s * (W / 2 - 0.15), y, z, 0.3, 2.4, 1.4]);
  }
  f.add(inst(unitBox(), niches, SAND_DARK));
  // Pillared pavilions spanning the trench at three landings
  const cols = [];
  for (const lv of [0.3, 0.55, 0.8]) {
    const z = z0 - lv * (L - 12), floor = D * (1 - lv);
    for (const x of [-8, -3, 3, 8]) for (const dz of [-3, 3]) cols.push([x, floor, z + dz, 0.9, D - floor, 0.9]);
    for (let y = floor + 4; y < D; y += 4) f.add(box(W, 0.8, 7, SAND, 0, y, z));
  }
  f.add(inst(unitCyl(10), cols, SAND));
  // The well shaft at the far end
  const shaft = ring(5.5, D, SAND, 0, 32);
  shaft.position.z = z1 + 6;
  f.add(box(W, 0.6, 12, SAND_DARK, 0, 0, z1 + 6), shaft, cyl(5.4, 5.4, 0.8, M.water, 0, 0.2, z1 + 6, 32));
  return { group: g, focus: f, view: [0.55, 0.95, 1.0] };
}

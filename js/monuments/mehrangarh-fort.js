import * as THREE from 'three';
import { M, mat, mesh, box, cyl, at, rng, chhatri, inst, unitBox, surface } from '../helpers.js';

const SAND = mat('#b9774f', 0.9);
const SAND_LIGHT = mat('#cf9a6e', 0.85);
const ROCK = mat('#8b6a4e', 0.95, 0, { flatShading: true });
const BLUE = mat('#6f9fd0', 0.85);

export function buildMehrangarh() {
  const g = new THREE.Group(), f = new THREE.Group(), R = rng(83);
  g.add(f);
  g.add(box(600, 0.2, 500, mat('#c9b48c', 0.95)));
  // The rocky hill, about 120 m above Jodhpur (scaled to fit), with the blue city at its foot
  const H = 45;
  const hill = mesh(new THREE.CylinderGeometry(70, 130, H, 9, 2).translate(0, H / 2, 0), ROCK);
  hill.scale.z = 0.5;
  g.add(hill);
  const houses = [];
  for (let i = 0; i < 160; i++) {
    const x = (R() - 0.5) * 360, z = 80 + R() * 120;
    houses.push([x, 0, z, 6 + R() * 6, 4 + R() * 6, 6 + R() * 6, R()]);
  }
  g.add(inst(unitBox(), houses, BLUE));
  // Sheer walls rising straight from the rock, bastions, and the palaces on the summit
  f.add(box(130, 30, 44, SAND, 0, H - 6, 0));
  for (const x of [-60, -30, 0, 30, 60]) f.add(cyl(8, 9, 32, SAND, x, H - 6, 20, 16));
  f.add(box(70, 14, 28, SAND_LIGHT, -10, H + 24, -2), box(40, 10, 20, SAND_LIGHT, 34, H + 24, 4));
  const jali = [];
  for (let k = 0; k < 22; k++) jali.push([-42 + k * 3, H + 28, 12.2, 2, 4, 0.4]);
  f.add(inst(unitBox(), jali, surface(mat('#c48a62', 0.85), 'lattice')));
  for (const x of [-38, -18, 2, 20, 46]) f.add(at(chhatri(2.6, 7, SAND_LIGHT), x, H + 38, 8));
  return { group: g, focus: f, view: [0.35, 0.22, 1.25] };
}

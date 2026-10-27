import * as THREE from 'three';
import { mat, mesh, box, at, rng, inst, unitBox, unitCyl, unitSpire, chhatri } from '../helpers.js';

const GOLD = mat('#d9a85a', 0.85);
const GOLD_DARK = mat('#b8873f', 0.9);
const SAND = mat('#e3c48d', 0.95);

// The golden fort on Trikuta hill: a double ring of walls with 99 bastions, and a town still living inside.
export function buildJaisalmer() {
  const g = new THREE.Group(), f = new THREE.Group(), R = rng(89);
  g.add(f);
  g.add(box(600, 0.2, 600, SAND));
  const hill = mesh(new THREE.CylinderGeometry(95, 125, 22, 16).translate(0, 11, 0), mat('#c49c62', 0.95, 0, { flatShading: true }));
  hill.scale.z = 0.6;
  g.add(hill);
  const H = 22, RX = 92, RZ = 54, wall = [], bastions = [];
  for (let k = 0; k < 99; k++) {
    const a = (k / 99) * Math.PI * 2, x = Math.cos(a) * RX, z = Math.sin(a) * RZ;
    bastions.push([x, H, z, 8, 13, 8]);
    wall.push([x, H, z, 7, 10, 2.6, Math.atan2(-Math.cos(a) * RZ, -Math.sin(a) * RX)]);
  }
  f.add(inst(unitCyl(12), bastions, GOLD), inst(unitBox(), wall, GOLD));
  // Houses, havelis, the palace and the spires of the Jain temples within the walls
  const houses = [];
  for (let i = 0; i < 220; i++) {
    const a = R() * Math.PI * 2, d = Math.sqrt(R()) * 0.85;
    houses.push([Math.cos(a) * RX * d, H, Math.sin(a) * RZ * d, 5 + R() * 5, 5 + R() * 9, 5 + R() * 5, R()]);
  }
  f.add(inst(unitBox(), houses, GOLD_DARK));
  f.add(box(30, 20, 16, GOLD, -20, H, 10));
  for (const x of [-30, -20, -10]) f.add(at(chhatri(2.4, 6, GOLD), x, H + 20, 14));
  f.add(inst(unitSpire(), [[30, H + 14, -10, 6, 12, 6], [38, H + 12, -4, 5, 10, 5], [24, H + 12, -18, 5, 9, 5]], GOLD));
  f.add(inst(unitBox(), [[30, H, -10, 7, 14, 7], [38, H, -4, 6, 12, 6], [24, H, -18, 6, 12, 6]], GOLD));
  return { group: g, focus: f, view: [0.5, 0.3, 1.2] };
}

import * as THREE from 'three';
import { M, box, cyl, ring, group, at, hemi, inst, unitBox, unitCyl } from '../helpers.js';

export function buildOldParliament() {
  const Rd = M.red, Bf = M.buff, g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  g.add(cyl(135, 135, 0.15, M.grass, 0, 0, 0, 64));
  f.add(cyl(88, 89, 2, M.redLight, 0, 0, 0, 96), cyl(85, 85, 8, Rd, 0, 2, 0, 96));
  const wins = [], cols = [];
  for (let k = 0; k < 72; k++) { const a = (k / 72) * Math.PI * 2; wins.push([Math.sin(a) * 85.05, 3.5, Math.cos(a) * 85.05, 2.4, 4, 0.3, a]); }
  for (let k = 0; k < 144; k++) { const a = (k / 144) * Math.PI * 2; cols.push([Math.sin(a) * 84.4, 10.8, Math.cos(a) * 84.4, 1.5, 9, 1.5]); }
  f.add(inst(unitBox(), wins, M.recess), inst(unitCyl(14), cols, Bf));
  f.add(cyl(86, 86, 0.8, Rd, 0, 10, 0, 96), cyl(81, 81, 10, Bf, 0, 10, 0, 96));
  f.add(cyl(86.2, 86.2, 1.6, Bf, 0, 19.8, 0, 96), ring(86, 1.4, Rd, 21.4, 96));
  f.add(cyl(80.5, 80.5, 0.6, M.concrete, 0, 20, 0, 96));
  // Three chambers radiating from the domed Central Hall
  for (let k = 0; k < 3; k++) {
    const c = group(box(30, 4, 44, Bf, 0, 20.6, 45), box(31, 0.6, 45, Rd, 0, 24.6, 45), at(hemi(8, Bf, 24), 0, 25.2, 45));
    f.add(c.rotateY((k * 2 * Math.PI) / 3 + Math.PI / 3));
  }
  f.add(cyl(18, 18, 8, Bf, 0, 20, 0, 48), cyl(18.6, 18.6, 1, Rd, 0, 27, 0, 48));
  const dome = hemi(18, Bf, 48);
  dome.position.y = 28;
  dome.scale.y = 0.45;
  f.add(dome);
  for (let k = 0; k < 6; k++) {
    const p = group(box(20, 13, 9, Bf, 0, 2, 89), box(24, 2, 12, Rd, 0, 0, 90), box(21, 1, 10, Rd, 0, 15, 89));
    f.add(p.rotateY((k * Math.PI) / 3));
  }
  return { group: g, focus: f, view: [0.8, 0.42, 1.2] };
}

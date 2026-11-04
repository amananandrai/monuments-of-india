import * as THREE from 'three';
import { M, mat, box, cyl, at, inst, unitBox, hipRoof, surface, sheet } from '../helpers.js';
import { arcadeSkin } from '../details/mughal.js';

const BRICK = surface(mat('#a4573f', 0.9), 'brick');
const LIME = mat('#e9e3d6', 0.85);
const DARK = mat('#2b2523', 0.8);

// One three-storey wing: a row of cells, their small vents high in the outer wall, facing a
// corridor 1.8 m deep behind a brick arcade, one arch to each cell, with the cell's iron-grilled
// door at the back. The wings overlap where they meet the tower, so each is built a centimetre
// taller than the last to keep their tops out of one plane.
const GRILLE = mat('#24201e', 0.55, 0.4);
function wing(len, h) {
  const g = new THREE.Group(), vents = [], doors = [], arches = [], dd = 1.8;
  g.add(box(9 - dd, h, len, BRICK, dd / 2, 0, len / 2), box(9.6, 0.6, len, LIME, 0, h, len / 2));
  for (let fl = 0; fl < 3; fl++) for (let k = 0; k < Math.floor(len / 3); k++) {
    vents.push([4.55, 1.6 + fl * 4.2, 1.5 + k * 3, 0.1, 1, 0.6]);
    arches.push([-len / 2 + 1.5 + k * 3, 0.5 + fl * 4.2, 2.1, 3.2]);
    doors.push([-4.5 + dd + 0.03, 0.55 + fl * 4.2, 1.5 + k * 3, 0.06, 2.2, 0.9]);
  }
  const skin = arcadeSkin(len, h, arches, dd, BRICK, { trim: BRICK, ring: false, fill: 'none', pointed: false });
  skin.rotation.y = -Math.PI / 2;
  g.add(at(skin, -4.5 + dd, 0, len / 2));
  g.add(inst(unitBox(), vents, DARK), inst(unitBox(), doors, GRILLE));
  return g;
}

export function buildCellularJail() {
  const g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  g.add(sheet(900, 900, M.sea, 0, 0.3, 0), box(320, 0.7, 300, mat('#6f8c4a', 0.95)));
  // Seven wings once radiated from the central tower like spokes; three survive in full
  const lens = [100, 100, 100, 14, 14, 14, 14];
  for (let k = 0; k < 7; k++) {
    const w = wing(lens[k], 13 + k * 0.01);
    w.rotation.y = (k / 7) * Math.PI * 2 + 0.4;
    w.position.set(Math.sin(w.rotation.y) * 9, 0, Math.cos(w.rotation.y) * 9);
    f.add(w);
  }
  // The central watchtower
  f.add(cyl(9, 9, 16, BRICK, 0, 0, 0, 8), cyl(9.6, 9.6, 0.6, LIME, 0, 16, 0, 8), cyl(6, 6, 6, LIME, 0, 16.6, 0, 8), at(hipRoof(13, 13, 4, mat('#7c7a76', 0.8)), 0, 22.6, 0));
  f.add(box(4, 1, 4, LIME, 0, 26.6, 0), cyl(0.15, 0.15, 8, LIME, 0, 27.6, 0, 6));
  return { group: g, focus: f, view: [0.6, 0.55, 1.15] };
}

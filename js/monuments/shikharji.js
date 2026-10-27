import * as THREE from 'three';
import { mat, mesh, box, cyl, at, rng, hemi, kalash, nagaraTemple, inst, unitBox, unitHemi } from '../helpers.js';

const WHITE = mat('#f2eee6', 0.7);
const SHADE = mat('#d8d1c2', 0.85);
const HILL = mat('#47693a', 0.95, 0, { flatShading: true });

// Parasnath Hill, with a tonk (small shrine) for each Tirthankara strung along the ridge.
export function buildShikharji() {
  const g = new THREE.Group(), f = new THREE.Group(), R = rng(73);
  g.add(f);
  g.add(box(600, 0.2, 600, mat('#5b7a43', 0.95)));
  const H = 90, L = 200;
  const ridge = mesh(new THREE.CylinderGeometry(1, 1.6, 1, 14, 3).translate(0, 0.5, 0), HILL);
  ridge.scale.set(L / 2, H, 60);
  g.add(ridge);
  // Tonks along the crest: square shrines with domed roofs and footprint shrines inside
  const bodies = [], domes = [];
  for (let i = 0; i < 20; i++) {
    const x = -L / 2 + 12 + (i / 19) * (L - 24), z = Math.sin(i * 0.9) * 8, y = H + Math.cos(i * 1.3) * 0.2;
    bodies.push([x, y, z, 4, 3.6, 4]);
    domes.push([x, y + 3.6, z, 4, 3, 4]);
  }
  f.add(box(L * 0.9, 1, 30, SHADE, 0, H - 0.6, 0), inst(unitBox(), bodies, WHITE), inst(unitHemi(16), domes, WHITE));
  // The tonk of Parshvanath on the highest point, and the Jal Mandir temple
  f.add(box(9, 7, 9, WHITE, 40, H, -4), at(hemi(4.5, WHITE, 20), 40, H + 7, -4), at(kalash(2.2), 40, H + 11.4, -4));
  f.add(at(nagaraTemple({ w: 8, h: 12, m: WHITE, shade: SHADE, plinth: 1, urus: 4, halls: [[10, 5, 0, 'dome']] }), -30, H, 0));
  // Pilgrim path climbing the forested slope
  for (let k = 0; k < 40; k++) g.add(box(3, 0.6, 3, SHADE, 90 - k * 2 + Math.sin(k * 0.4) * 15, k * (H / 40), 90 - k * 2));
  return { group: g, focus: f, view: [0.4, 0.42, 1.25] };
}

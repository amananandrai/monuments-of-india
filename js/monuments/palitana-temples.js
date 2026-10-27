import * as THREE from 'three';
import { M, mat, mesh, box, at, rng, nagaraTemple, inst, unitBox, unitSpire } from '../helpers.js';

const MARBLE = mat('#f1ede4', 0.6);
const SHADE = mat('#d6cebd', 0.8);
const HILL = mat('#8b8a5c', 0.95, 0, { flatShading: true });

// Shatrunjaya hill: two summits crowded with more than 800 shrines inside fortified enclosures (tuks).
export function buildPalitana() {
  const g = new THREE.Group(), f = new THREE.Group(), R = rng(71);
  g.add(f);
  g.add(box(500, 0.2, 500, mat('#9aa166', 0.95)));
  const H = 44;
  for (const [x, s] of [[-40, 1], [45, 0.85]]) {
    const hill = mesh(new THREE.CylinderGeometry(42 * s, 120 * s, H, 12, 2).translate(0, H / 2, 0), HILL, x, 0, 0);
    hill.scale.z = 0.7;
    g.add(hill);
  }
  // The pilgrim path of stone steps winding up
  for (let k = 0; k < 30; k++) g.add(box(4, 1, 4, SHADE, 60 - k * 1.2 + Math.sin(k * 0.6) * 10, k * (H / 30), 80 - k * 2.2));
  const bodies = [], spires = [], walls = [];
  for (const [cx, s] of [[-40, 1], [45, 0.85]]) {
    const r0 = 40 * s;
    for (let i = 0; i < 150; i++) {
      const a = R() * Math.PI * 2, d = Math.sqrt(R()) * r0 * 0.9, x = cx + Math.cos(a) * d, z = Math.sin(a) * d * 0.7, w = 2 + R() * 3;
      bodies.push([x, H, z, w, w * 0.8, w, R() * 0.4]);
      spires.push([x, H + w * 0.8, z, w * 0.8, w * (1 + R() * 0.8), w * 0.8, R() * 0.4]);
    }
    for (let k = 0; k < 40; k++) {
      const a = (k / 40) * Math.PI * 2;
      walls.push([cx + Math.cos(a) * r0, H, Math.sin(a) * r0 * 0.7, 7, 3.2, 1.4, -a + Math.PI / 2]);
    }
    f.add(box(r0 * 2.1, 0.6, r0 * 1.5, SHADE, cx, H - 0.3, 0));
  }
  f.add(inst(unitBox(), bodies, MARBLE), inst(unitSpire(), spires, MARBLE), inst(unitBox(), walls, SHADE));
  // The principal temple of Adinath on the higher summit
  f.add(at(nagaraTemple({ w: 9, h: 15, m: MARBLE, shade: SHADE, plinth: 1.2, urus: 8, halls: [[11, 6, 4]] }), -40, H, -6));
  return { group: g, focus: f, view: [0.55, 0.45, 1.2] };
}

import * as THREE from 'three';
import { M, mat, mesh, box, at, rng, nagaraTemple, inst, unitBox, unitSpire, ellipseWall } from '../helpers.js';

const MARBLE = mat('#f1ede4', 0.6);
const SHADE = mat('#d6cebd', 0.8);
const HILL = mat('#8b8a5c', 0.95, 0, { flatShading: true });

// Shatrunjaya hill: two summits crowded with more than 800 shrines inside fortified enclosures (tuks).
export function buildPalitana() {
  const g = new THREE.Group(), f = new THREE.Group(), R = rng(71);
  g.add(f);
  g.add(box(500, 0.2, 500, mat('#9aa166', 0.95)));
  const H = 44, HILLS = [[-40, 1], [45, 0.85]];
  for (const [x, s] of HILLS) {
    const hill = mesh(new THREE.CylinderGeometry(42 * s, 120 * s, H, 12, 2).translate(0, H / 2, 0), HILL, x, 0, 0);
    hill.scale.z = 0.7;
    g.add(hill);
  }
  // The pilgrim path of stone steps winding up. Each block is set into the slope under it, from
  // below its lowest point to above its highest (the hills bulge out by up to 7%), so the hillside
  // never crosses a step's top.
  const ground = (x, z, bulge) => Math.max(0, ...HILLS.map(([hx, s]) => {
    const d = Math.hypot(x - hx, z / 0.7) / bulge, rb = 120 * s, rt = 42 * s;
    return d <= rt ? H : d >= rb ? 0 : (H * (rb - d)) / (rb - rt);
  }));
  for (let k = 0; k < 30; k++) {
    const x = 60 - k * 1.2 + Math.sin(k * 0.6) * 10, z = 80 - k * 2.2, corners = [[-2, -2], [2, -2], [-2, 2], [2, 2]];
    const lo = Math.min(...corners.map(([dx, dz]) => ground(x + dx, z + dz, 1))) - 0.3;
    const hi = Math.max(...corners.map(([dx, dz]) => ground(x + dx, z + dz, 1.07))) + 0.25;
    g.add(box(4, hi - lo, 4, SHADE, x, lo, z));
  }
  const bodies = [], spires = [];
  for (const [cx, s] of [[-40, 1], [45, 0.85]]) {
    const r0 = 40 * s;
    for (let i = 0; i < 150; i++) {
      const a = R() * Math.PI * 2, d = Math.sqrt(R()) * r0 * 0.9, x = cx + Math.cos(a) * d, z = Math.sin(a) * d * 0.7, w = 2 + R() * 3;
      bodies.push([x, H, z, w, w * 0.8, w, R() * 0.4]);
      spires.push([x, H + w * 0.8, z, w * 0.8, w * (1 + R() * 0.8), w * 0.8, R() * 0.4]);
    }
    f.add(ellipseWall(r0, r0 * 0.7, 0, Math.PI * 2, 1.4, H, H + 3.2, SHADE, cx, 0));
    // The temple platform stands 0.4 m proud of the hilltop, its base clear of the top steps' bases.
    f.add(box(r0 * 2.1, 0.6, r0 * 1.5, SHADE, cx, H - 0.2, 0));
  }
  f.add(inst(unitBox(), bodies, MARBLE), inst(unitSpire(), spires, MARBLE));
  // The principal temple of Adinath on the higher summit
  f.add(at(nagaraTemple({ w: 9, h: 15, m: MARBLE, shade: SHADE, plinth: 1.2, urus: 8, halls: [[11, 6, 4]] }), -40, H, -6));
  return { group: g, focus: f, view: [0.55, 0.45, 1.2] };
}

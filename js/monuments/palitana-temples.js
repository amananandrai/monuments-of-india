import * as THREE from 'three';
import { mat, mesh, box, at, rng, inst, unitBox, ellipseWall } from '../helpers.js';
import { nagaraTemple, trabeateGate } from '../details/temples.js';
import { miniSpireGeo } from '../details/sculpture.js';
import { addDetails } from '../details/palitana-temples.js';

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
  // The pilgrim stair: about 3,800 steps in life, here a switchback of some 250 treads in seven legs
  // across the face of the higher summit, with a landing at every turn, up to the gate of the
  // Adinath tuk. Each tread is set into the slope under it, from below its lowest corner to above its
  // highest (the hills bulge out by up to 7%), so the hillside never crosses a step's top, and no
  // tread is lower than the one before.
  const ground = (x, z, bulge) => Math.max(0, ...HILLS.map(([hx, s]) => {
    const d = Math.hypot(x - hx, z / 0.7) / bulge, rb = 120 * s, rt = 42 * s;
    return d <= rt ? H : d >= rb ? 0 : (H * (rb - d)) / (rb - rt);
  }));
  const CX = -40, TOP = H + 0.4, TW = 3.2, TD = 0.6, treads = [];
  const nodes = [[CX + 14, 96], ...[0, 1, 2, 3, 4, 5, 6].map((i) => [CX + (i % 2 ? -9 : 9), 84 - i * 7.4]), [CX, 30.6]];
  let top = 0;
  const put = (x, z, w, d, ry) => {
    const c = Math.cos(ry), sn = Math.sin(ry), corners = [[-w / 2, -d / 2], [w / 2, -d / 2], [-w / 2, d / 2], [w / 2, d / 2]].map(([u, v]) => [x + u * c + v * sn, z - u * sn + v * c]);
    const lo = Math.min(...corners.map(([px, pz]) => ground(px, pz, 1))) - 0.3;
    top = Math.min(TOP, Math.max(top, ...corners.map(([px, pz]) => ground(px, pz, 1.07) + 0.2)));
    treads.push([x, lo, z, w, top - lo, d, ry]);
  };
  for (let k = 1; k < nodes.length; k++) {
    const [x0, z0] = nodes[k - 1], [x1, z1] = nodes[k], len = Math.hypot(x1 - x0, z1 - z0), ry = Math.atan2(x1 - x0, z1 - z0), n = Math.floor(len / TD);
    for (let i = 1; i < n; i++) put(x0 + ((x1 - x0) * i) / n, z0 + ((z1 - z0) * i) / n, TW, TD + 0.02, ry);
    put(x1, z1, TW + 0.6, TW + 0.6, ry);
  }
  g.add(inst(unitBox(), treads, SHADE));
  const bodies = [], spires = [];
  for (const [cx, s] of [[-40, 1], [45, 0.85]]) {
    const r0 = 40 * s;
    for (let i = 0; i < 150; i++) {
      const a = R() * Math.PI * 2, d = Math.sqrt(R()) * r0 * 0.9, x = cx + Math.cos(a) * d, z = Math.sin(a) * d * 0.7, w = 2 + R() * 3;
      bodies.push([x, H, z, w, w * 0.8, w, R() * 0.4]);
      // Spires of every height, a few of them standing well above the rest.
      const tall = R() < 0.12 ? 2 + R() : 1;
      spires.push([x, H + w * 0.8, z, w * 0.8, w * (0.7 + R() * 1.1) * tall, w * 0.8, R() * 0.4]);
    }
    // The tuk's fortified wall; on the higher summit it opens on the south where the stair arrives.
    if (cx === CX) f.add(ellipseWall(r0, r0 * 0.7, Math.PI / 2 + 0.1, Math.PI * 2.5 - 0.1, 1.4, H, H + 3.2, SHADE, cx, 0), at(trabeateGate(10, 4.6, 2.2, 3.2, 3.4, { m: MARBLE, trim: SHADE }), cx, H + 0.4, r0 * 0.7));
    else f.add(ellipseWall(r0, r0 * 0.7, 0, Math.PI * 2, 1.4, H, H + 3.2, SHADE, cx, 0));
    // The temple platform stands 0.4 m proud of the hilltop, its base clear of the top steps' bases.
    f.add(box(r0 * 2.1, 0.6, r0 * 1.5, SHADE, cx, H - 0.2, 0));
  }
  f.add(inst(unitBox(), bodies, MARBLE), inst(miniSpireGeo(), spires, MARBLE));
  // The principal temple of Adinath on the higher summit
  f.add(at(nagaraTemple({ w: 9, h: 15, m: MARBLE, shade: SHADE, plinth: 1.2, urus: 8, halls: [[11, 6, 4]] }), -40, H, -6));
  addDetails(f, g);
  return { group: g, focus: f, view: [0.55, 0.45, 1.2] };
}

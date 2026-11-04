import * as THREE from 'three';
import { M, mat, mesh, box, cyl, at, hemi, finial, ellipseWall, inst, unitBox } from '../helpers.js';
import { fortGate } from '../details/forts.js';
import { heightField, rough, smooth } from '../details/terrain.js';
import { addDetails } from '../details/daulatabad-fort.js';

const STONE = mat('#8e8172', 0.9);
const TILE = mat('#3f78a8', 0.5);

// The Chand Minar, a tapering victory tower with balconies.
function chandMinar() {
  const g = new THREE.Group();
  g.add(box(9, 2, 9, STONE));
  let y = 2;
  for (const [r0, r1, h] of [[3, 2.6, 12], [2.5, 2.1, 9], [2, 1.6, 7]]) {
    g.add(cyl(r1, r0, h, mat('#c9b48a', 0.85), 0, y, 0, 16), cyl(r1 * 1.05, r1 * 1.05, 1, TILE, 0, y + h * 0.7, 0, 16));
    y += h;
    g.add(cyl(r1 * 1.7, r1 * 1.1, 0.7, STONE, 0, y - 0.7, 0, 16));
  }
  g.add(at(hemi(1.6, mat('#c9b48a', 0.85), 16), 0, y, 0), at(finial(1.6), 0, y + 1.6, 0));
  return g;
}

// The rim of the scarp at angle a, and the ground of the hill at (x, z).
const rimAt = (a) => 62 * (1 + 0.07 * Math.sin(a * 3 + 0.6) + 0.03 * Math.sin(a * 7 + 1));
function devagiri(x, z) {
  const r = Math.hypot(x, z), a = Math.atan2(z, x), rim = rimAt(a);
  if (r > rim + 0.6) return -0.5;
  const sx = 6, sz = -5, q = Math.min(1, Math.hypot(x - sx, z - sz) / (rim * 0.98));
  const spur = 4.5 * Math.pow(Math.abs(Math.sin(a * 5 + 0.9)), 2) * q * (1 - q) * 4;
  const gully = -3 * Math.pow(Math.abs(Math.sin(a * 13 + r * 0.05)), 8) * smooth(0.2, 0.6, q);
  return 24 + 70 * Math.pow(1 - q, 1.25) + spur + gully + rough(x, z, 1.2, 1.5) * smooth(0.05, 0.2, q);
}

export function buildDaulatabad() {
  const g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  g.add(box(500, 0.2, 500, mat('#a39a72', 0.95)));
  // The conical hill, its base cut away into a sheer scarp above a moat
  g.add(cyl(70, 74, 0.5, M.water, 0, 0, 0, 40));
  // Devagiri: the lower 24 m of the hill was cut away into a sheer scarp all round, so nothing could
  // climb it; above the scarp the natural rock rises unevenly, in spurs and gullies, to a summit set
  // towards the north-east. The rings of wall up the hill follow its ground.
  f.add(heightField(150, 150, 210, (x, z) => devagiri(x, z), { rock: ['#6f6552', '#766a56'], cover: '#7f7656', steep: 0.7, band: 30 }));
  const segs = [];
  for (const q of [1, 0.62, 0.3]) {
    const n = Math.round(q * 140);
    for (let k = 0; k < n; k++) {
      const a = (k / n) * Math.PI * 2, a1 = ((k + 1) / n) * Math.PI * 2, r0 = q * rimAt(a) - (q === 1 ? 1.2 : 0), r1 = q * rimAt(a1) - (q === 1 ? 1.2 : 0);
      const x0 = Math.cos(a) * r0, z0 = Math.sin(a) * r0, x1 = Math.cos(a1) * r1, z1 = Math.sin(a1) * r1, xm = (x0 + x1) / 2, zm = (z0 + z1) / 2;
      const y = q === 1 ? 24 : devagiri(xm, zm);
      const ry = Math.atan2(x1 - x0, z1 - z0), len = Math.hypot(x1 - x0, z1 - z0);
      segs.push([xm, y - 2.5, zm, 1.8, 6.5, len + 0.15, ry]);
      // A merlon on the outer edge of every other length.
      if (k % 2 === 0) segs.push([xm + (Math.cos(a) * 0.6), y + 4, zm + (Math.sin(a) * 0.6), 0.6, 1.1, Math.min(1.1, len * 0.6), ry]);
    }
  }
  f.add(inst(unitBox(), segs, STONE));
  f.add(box(10, 6, 8, STONE, 6, 91, -5), at(hemi(3, STONE, 16), 6, 97, -5));
  // Outer walls on the plain, with the Chand Minar inside them
  // open at the gate, whose doors still carry their elephant spikes
  const ga = 1.2;
  g.add(ellipseWall(130, 130, ga + 0.05, ga - 0.05 + Math.PI * 2, 2.6, 0, 7, STONE));
  g.add(at(fortGate(14, 9, 8, 4.5, 7, { m: STONE, trim: mat('#a49784', 0.9), towers: { r: 3.8, h: 11, cap: 'merlons', seg: 16 } }), Math.cos(ga) * 130, 0, Math.sin(ga) * 130).rotateY(Math.PI / 2 - ga));
  f.add(at(chandMinar(), 40, 0, 96));
  addDetails(f, g);
  return { group: g, focus: f, view: [0.5, 0.3, 1.2] };
}

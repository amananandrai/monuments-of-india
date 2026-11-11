import * as THREE from 'three';
import { M, mat, mesh, box, cyl, at, rng, onFace, archPanel, archWall, hemi, finial, ellipseWall, curvedBand, inst, unitBox, photo } from '../helpers.js';
import { fortGate } from '../details/forts.js';
import { heightField, fbm, smooth } from '../details/terrain.js';
import { detail } from '../detail.js';
import { addDetails } from '../details/golconda-fort.js';

const GRANITE = photo(mat('#9a917f', 0.9), 'rubble');
const BOULDER = mat('#8c8270', 0.95, 0, { flatShading: true });

// The hill's outline wanders: its foot lies at hillRadius(a) from the summit in direction a, and
// the slope rises evenly to the summit at H. ringPoint(q, a) is the point a fraction q of the way
// out from the summit to the foot, on the slope, with the walls' contours at RINGS.
const H = 60;
export const RINGS = [0.9, 0.58, 0.27];
export function hillRadius(a) { return 110 * (1 + 0.16 * Math.sin(3 * a + 1) + 0.08 * Math.sin(5 * a + 2)); }
export function ringPoint(q, a) { const r = q * hillRadius(a) + 2 * Math.sin(7 * a) * q; return [Math.cos(a) * r, H * (1 - q), Math.sin(a) * r]; }
export function hillY(x, z) { const q = Math.hypot(x, z) / hillRadius(Math.atan2(z, x)); return q < 1 ? H * (1 - q) : 0; }
// The rock's surface: the even slope (on which the walls stand) with granite relief that only ever
// raises it (by up to 1.4 m), so a wall may sink a little into the rock but never floats; the foot
// sinks under the plain. Read by the shrubs in js/details/golconda-fort.js.
export function hillSurface(x, z) {
  const y = hillY(x, z);
  return y + smooth(0.5, 6, y) * 0.7 * (1 + fbm(x, z, { scale: 0.05, octaves: 3 })) - 0.4 * (1 - smooth(0, 3, y));
}

export function buildGolconda() {
  const g = new THREE.Group(), f = new THREE.Group(), R = rng(97);
  g.add(f);
  g.add(box(500, 0.2, 500, mat('#a69b7a', 0.95)));
  // The granite hill, irregular in plan and strewn with boulders
  g.add(heightField(320, 320, detail.low ? 120 : 180, hillSurface, { rock: ['#8c8270', '#958b78', '#857b69'], cover: '#9a8f72', steep: 0.9, band: 400 }));
  for (let i = 0; i < 30; i++) {
    const a = R() * Math.PI * 2, q = 0.18 + R() * 0.72, r = 3 + R() * 5, [x, y, z] = ringPoint(q, a);
    g.add(mesh(new THREE.IcosahedronGeometry(r, 0), BOULDER, x, y + r * 0.3, z));
  }
  // Rings of walls climbing the hill to the Bala Hissar citadel, following its contours: a solid
  // lower wall, and above it the parapet broken into lengths of uneven height, with gaps where it
  // has fallen.
  const par = [];
  for (const q of RINGS) {
    const pts = [], n = Math.round(q * 150);
    for (let k = 0; k <= n; k++) {
      const a = (k / n) * Math.PI * 2, [x, , z] = ringPoint(q, a), [x1, , z1] = ringPoint(q, a + 0.01), l = Math.hypot(x1 - x, z1 - z);
      pts.push([x, z, (z1 - z) / l, -(x1 - x) / l]);
    }
    const y = H * (1 - q);
    f.add(curvedBand(pts, -1.3, 1.3, y - 1.5, y + 4, GRANITE, true));
    for (let k = 0; k < n; k++) {
      const [x, z, nx, nz] = pts[k], [x2, z2] = pts[k + 1], hgt = 1.2 + 2.4 * (0.5 + 0.5 * Math.sin(k * 0.7 + q * 9) * Math.cos(k * 0.23));
      if (hgt < 1.4) continue;
      par.push([(x + x2) / 2, y + 4, (z + z2) / 2, 2.2, hgt, Math.hypot(x2 - x, z2 - z) * 0.7, Math.atan2(nx, nz)]);
    }
    for (let k = 0; k < 8; k++) { const [x, , z] = ringPoint(q, (k / 8) * Math.PI * 2 + 0.2); f.add(cyl(4, 4.6, 10, GRANITE, x, y - 1, z, 14)); }
  }
  f.add(inst(unitBox(), par, GRANITE));
  // Roofless ruins of palaces and barracks on the slopes, their arched walls standing open.
  for (const [q, a, w, rot] of [[0.52, 0.6, 14, 0.3], [0.5, 2.3, 12, -0.4], [0.78, 3.6, 16, 0.9], [0.8, 5.0, 12, 0.2], [0.45, 4.3, 10, 1.2], [0.82, 1.4, 13, -0.6]]) {
    const [x, y, z] = ringPoint(q, a), ru = at(new THREE.Group(), x, y, z);
    ru.rotation.y = rot;
    ru.add(box(w + 2, 5, w * 0.7 + 2, GRANITE, 0, -4.5, 0));
    ru.add(at(archWall(w, 6, 1, 3, 4.4, true, GRANITE), 0, 0.5, w * 0.35), at(archWall(w * 0.7, 4.5, 1, 2.6, 3.6, true, GRANITE), -w / 2, 0.5, 0).rotateY(Math.PI / 2));
    ru.add(box(w * 0.5, 3, 1, GRANITE, w * 0.2, 0.5, -w * 0.35));
    f.add(ru);
  }
  // Fateh Darwaza at the outer wall, and the Bala Hissar pavilion on the summit
  // in a stretch of the outer town wall on the plain, below the hill, between two bastions
  const GR = 120;
  for (const [a0, a1] of [[Math.PI / 2 + 0.07, Math.PI / 2 + 0.55], [Math.PI / 2 - 0.55, Math.PI / 2 - 0.07]]) f.add(ellipseWall(GR, GR, a0, a1, 2.6, 0, 9, GRANITE));
  for (const a of [Math.PI / 2 + 0.55, Math.PI / 2 - 0.55]) f.add(cyl(4.4, 5, 12, GRANITE, Math.cos(a) * GR, 0, Math.sin(a) * GR, 14));
  f.add(at(fortGate(18, 14, 8, 5.5, 10, { m: GRANITE, trim: mat('#b5ac98', 0.9), towers: { r: 3.4, h: 16, cap: 'merlons', seg: 14 } }), 0, 0, GR));
  f.add(box(20, 9, 12, mat('#d9d1c0', 0.85), 0, H - 3, 0));
  for (const a of [0, Math.PI]) for (let k = -1; k <= 1; k++) f.add(onFace(at(archPanel(4, 6, true, M.recess, 0.25), 0, H - 2.4, 0), a, 6, k * 6));
  for (const x of [-7, 7]) f.add(at(hemi(2.4, mat('#d9d1c0', 0.85), 16), x, H + 6, 0), at(finial(2), x, H + 8.4, 0));
  addDetails(f, g);
  // Framed on the monument itself, closer than its grounds would set.
  return { group: g, focus: f, view: [0.45, 0.35, 1.2], zoom: 0.68 };
}

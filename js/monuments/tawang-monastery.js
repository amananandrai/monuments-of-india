import * as THREE from 'three';
import { M, mat, mesh, box, cyl, at, rng, inst, unitBox, hipRoof, onFace } from '../helpers.js';

const WHITE = mat('#efece4', 0.85);
const MAROON = mat('#6b2a22', 0.85);
const WINDOW = mat('#2a2220', 0.8);
const RIDGE = mat('#6f7a55', 0.95, 0, { flatShading: true });
const PEAK = mat('#8a8c8f', 0.95, 0, { flatShading: true });
const SNOW = mat('#f4f6f8', 0.8, 0, { flatShading: true });

// A Tibetan block: whitewashed walls, tapering dark windows and a maroon parapet band.
function tibetan(w, h, d, floors) {
  const g = new THREE.Group();
  g.add(box(w, h, d, WHITE), box(w + 0.3, h * 0.12, d + 0.3, MAROON, 0, h * 0.88));
  const n = Math.max(1, Math.floor(w / 3.4));
  for (let fl = 0; fl < floors; fl++) for (let k = 0; k < n; k++) {
    const x = -w / 2 + (k + 0.5) * (w / n), y = 1 + fl * ((h * 0.85) / floors);
    g.add(onFace(box(1.2, 1.6, 0.2, WINDOW, 0, y), 0, d / 2, x));
  }
  return g;
}

export function buildTawang() {
  const g = new THREE.Group(), f = new THREE.Group(), R = rng(5);
  g.add(f);
  // The ridge it stands on, and snow peaks of the eastern Himalaya beyond
  const ridge = mesh(new THREE.CylinderGeometry(70, 140, 24, 14, 2), RIDGE, 0, 12 - 0.6, 0);
  g.add(ridge);
  for (let i = 0; i < 6; i++) {
    const a = -Math.PI * 0.85 + i * 0.35, d = 380 + R() * 120, h = 150 + R() * 120;
    const x = Math.cos(a) * d, z = Math.sin(a) * d;
    g.add(mesh(new THREE.ConeGeometry(h * 0.7, h, 7).translate(0, h / 2, 0), PEAK, x, 0, z), mesh(new THREE.ConeGeometry(h * 0.21, h * 0.3, 7).translate(0, h * 0.85, 0), SNOW, x, 0, z));
  }
  const T = 24;
  f.add(box(110, 0.6, 90, M.path, 0, T - 0.6, 0));
  for (const s of [-1, 1]) f.add(box(110, 3, 1.5, WHITE, 0, T, s * 45), box(1.5, 3, 90, WHITE, s * 55, T, 0));
  // The three-storey Dukhang (assembly hall) with its gilded roof
  f.add(at(tibetan(30, 15, 24, 3), 0, T, -16));
  f.add(box(16, 5, 12, WHITE, 0, T + 15, -18), box(16.4, 0.8, 12.4, MAROON, 0, T + 19.2, -18));
  f.add(at(hipRoof(19, 15, 5, M.gild), 0, T + 20, -18), cyl(0.3, 0.7, 2.4, M.gild, 0, T + 25, -18, 8));
  for (const x of [-13, 13]) f.add(cyl(0.6, 0.9, 3, M.gild, x, T + 15, -5, 8));
  f.add(box(18, 2, 6, WHITE, 0, T, 0), box(18.4, 0.6, 6.4, MAROON, 0, T + 2, 0));
  // Monks' quarters stepping round the courtyard
  const blocks = [];
  for (let i = 0; i < 26; i++) {
    const a = (i / 26) * Math.PI * 2, rx = 44 + R() * 6, rz = 34 + R() * 5;
    blocks.push([Math.cos(a) * rx, T, Math.sin(a) * rz, 7 + R() * 5, 5 + R() * 4, 6 + R() * 3, -a]);
  }
  f.add(inst(unitBox(), blocks, WHITE));
  f.add(inst(unitBox(), blocks.map(([x, y, z, sx, sy, sz, ry]) => [x, y + sy, z, sx + 0.2, 0.7, sz + 0.2, ry]), MAROON));
  // Prayer-flag lines strung from the courtyard poles
  for (const x of [-20, 20]) {
    f.add(cyl(0.12, 0.12, 10, WINDOW, x, T, 20, 6));
    for (let k = 0; k < 8; k++) f.add(box(0.8, 0.6, 0.05, [M.flagRed, M.saffron, M.flagGreen, M.navy, M.flagWhite][k % 5], x - Math.sign(x) * (1 + k * 1.6), T + 9.4 - k * 0.6, 20));
  }
  return { group: g, focus: f, view: [0.6, 0.38, 1.25] };
}

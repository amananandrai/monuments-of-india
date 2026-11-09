import * as THREE from 'three';
import { M, mat, mesh, box, cyl, lathe, at, onFace, ribbed, hipRoof, wheel, surface } from '../helpers.js';
import { figure } from '../details/sculpture.js';
import { mergeByMaterial } from '../details/components.js';
import { gothicDoor, gothicWindow, oculus } from '../details/colonial.js';
import { addDetails } from '../details/csmt.js';

const SLATE = mat('#5b6067', 0.8);
// Stevens' polychromy: buff sandstone walls coursed with blue-grey basalt (js/surface.js,
// 'banded'), basalt for the string courses and window surrounds, and a buff stone dome with basalt
// ribs.
const STONE = surface(mat('#d8c196', 0.85), 'banded');
const BAND = mat('#6c7681', 0.85);
const DOME = mat('#d3bb8f', 0.8);

// A Gothic range: stone block with banded courses, rows of pointed two-light windows in stone
// surrounds, and a slate roof. skip: [[x0, x1, rows]], spans left clear on the lowest rows.
function range(w, h, d, rows, skip = []) {
  const g = new THREE.Group(), wins = new THREE.Group();
  g.add(box(w, h, d, STONE));
  for (let r = 1; r < rows; r++) g.add(box(w + 0.3, 0.5, d + 0.3, BAND, 0, (h / rows) * r - 0.25));
  const n = Math.max(2, Math.floor(w / 3.6)), win = gothicWindow(1.6, h / rows - 1.8, { m: M.cream, trim: BAND, depth: 0.22, frame: 0.3 });
  for (let r = 0; r < rows; r++) for (let k = 0; k < n; k++) {
    const x = -w / 2 + (k + 0.5) * (w / n), y = (h / rows) * r + 0.9;
    if (skip.some(([a, b, rs]) => x > a && x < b && r < rs)) continue;
    wins.add(onFace(at(win.clone(), 0, y, 0), 0, d / 2, x));
  }
  g.add(mergeByMaterial(wins));
  g.add(at(hipRoof(w + 0.6, d + 0.6, Math.min(w, d) * 0.32, SLATE), 0, h, 0));
  return g;
}
function turret(h, r) {
  const g = new THREE.Group();
  g.add(cyl(r, r, h, STONE, 0, 0, 0, 8), cyl(r * 1.15, r * 1.15, 0.6, BAND, 0, h * 0.6, 0, 8));
  g.add(cyl(0, r * 1.15, r * 4, SLATE, 0, h, 0, 8));
  return g;
}

export function buildCsmt() {
  const g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  g.add(box(220, 0.2, 160, M.asphalt, 0, 0, 30));
  f.add(box(124, 1, 56, M.concrete, 0, 0, 2));
  // Central block under the great ribbed dome
  f.add(at(range(36, 22, 26, 3, [[-5, 5, 2]]), 0, 1, 0));
  // The main entrance: a Gothic portal of three receding orders under a crocketed gable
  f.add(at(gothicDoor(4, 7, { m: M.cream, trim: BAND, step: 0.5, depth: 1.5, stepsDown: 1 }), 0, 1, 13));
  for (const x of [-18, 18]) for (const z of [-13, 13]) f.add(at(turret(25, 1.5), x, 1, z));
  const dt = 23;
  f.add(cyl(9, 9, 8, STONE, 0, dt, 0, 8), cyl(9.5, 9.5, 0.6, BAND, 0, dt + 8, 0, 8));
  const dw = gothicWindow(2, 5.2, { m: M.cream, trim: BAND, depth: 0.2, frame: 0.3, sill: false }), drum = new THREE.Group();
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * Math.PI * 2 + Math.PI / 8, r = 9 * Math.cos(Math.PI / 8) + 0.005;
    drum.add(at(dw.clone(), Math.sin(a) * r, dt + 1.2, Math.cos(a) * r).rotateY(a));
  }
  f.add(mergeByMaterial(drum));
  const prof = [[9, 0], [8.8, 3.4], [7.3, 7.6], [4.2, 10.8], [0, 12.6]];
  f.add(at(ribbed(lathe(prof, DOME, 8), 8, 0.05), 0, dt + 8.6, 0));
  // Basalt ribs up the eight arrises of the dome, from the drum to the lantern.
  const ribs = new THREE.Group();
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * Math.PI * 2, pts = [];
    for (let j = 0; j <= 16; j++) {
      const t = j / 16, i = Math.min(3, Math.floor(t * 4)), u = t * 4 - i, [r0, y0] = prof[i], [r1, y1] = prof[i + 1], r = (r0 + (r1 - r0) * u) * 1.05 + 0.1;
      if (r > 1.5) pts.push(new THREE.Vector3(Math.sin(a) * r, dt + 8.6 + y0 + (y1 - y0) * u, Math.cos(a) * r));
    }
    ribs.add(mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 24, 0.28, 6, false), BAND));
  }
  f.add(mergeByMaterial(ribs));
  const lt = dt + 8.6 + 12;
  f.add(cyl(1.4, 1.8, 3, M.cream, 0, lt, 0, 8), cyl(0.5, 0.8, 1.2, M.bronze, 0, lt + 3, 0, 8));
  // The statue of Progress crowning the dome: a woman holding a flaming torch up over her shoulder,
  // a spoked wheel at her side.
  f.add(at(figure(4.4, M.bronze, 'chauri'), 0, lt + 4.2, 0), at(mesh(new THREE.ConeGeometry(0.22, 0.7, 8), M.gild), 0.17, lt + 8.75, 0.05));
  f.add(at(wheel(0.55, M.bronze), -0.9, lt + 5.0, 0.15));
  // Side ranges and the two forward wings that frame the forecourt, each ending in a gable and turrets
  for (const s of [-1, 1]) {
    f.add(at(range(30, 16, 16, 2), s * 33, 1, -5));
    f.add(at(range(16, 18, 30, 2).rotateY(s * Math.PI / 2), s * 52, 1, 14));
    for (const x of [s * 44, s * 60]) f.add(at(turret(21, 1.3), x, 1, 29));
    const gable = new THREE.Shape();
    gable.moveTo(-8, 0); gable.lineTo(8, 0); gable.lineTo(0, 7); gable.closePath();
    const gm = mesh(new THREE.ExtrudeGeometry(gable, { depth: 1, bevelEnabled: false }), STONE, s * 52, 19, 29);
    // A rose window in each gable
    f.add(gm, onFace(at(oculus(1.8, { m: M.cream, trim: BAND, frame: 0.5 }), 0, 22, 0), 0, 30, s * 52));
  }
  addDetails(f, g);
  // The home view matches the best-known photograph: its front and dome from the street.
  return { group: g, focus: f, view: [0.35, 0.18, 1], zoom: 0.5 };
}

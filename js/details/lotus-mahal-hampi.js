import * as THREE from 'three';
import { M, mat, mesh, box, at, rng, pidaRoof, hemi, kalash, surface } from '../helpers.js';
import { cuspedArchGeo, mergeByMaterial } from '../parts/components.js';
import { heightField, fbm, ridged, smooth } from '../parts/terrain.js';
import { trees, shrubs, asiBoard, along, scatter } from '../parts/realism.js';
import { detail } from '../detail.js';

// The lime stucco of the pavilion, warm cream; its mouldings a shade darker; Hampi's granite.
export const STUCCO = mat('#e3d4b5', 0.85);
export const TRIM = mat('#cbb690', 0.88);
export const STONE = mat('#a1876a', 0.92);
export const RECESS = M.recess;
const WALL = surface(mat('#9b8366', 0.93), 'blocks');
const BOULDER = mat('#9c7b5c', 0.95, 0, { flatShading: true });

// The plan's outer corners, clockwise seen from above: a square 12 m across, each face with a bay
// 4 m wide stepping 3 m out from its middle.
export const PLAN = [[-6, -6], [-2, -6], [-2, -9], [2, -9], [2, -6], [6, -6], [6, -2], [9, -2], [9, 2], [6, 2], [6, 6], [2, 6], [2, 9], [-2, 9], [-2, 6], [-6, 6], [-6, 2], [-9, 2], [-9, -2], [-6, -2]];
// Heights: the base; the open storey and the walled one; the cusped arches' depth in each.
export const H = { base: 1.2, g1: 5, g2: 3.6, archLow: 3.2, archHigh: 2.2 };

// A watchtower of the enclosure's wall: a square tower of two storeys with arched openings and a
// stepped pyramidal roof, in the same manner as the pavilion.
function watchtower(w, h) {
  const g = new THREE.Group();
  g.add(box(w + 1, 1, w + 1, STONE), box(w, h, w, STUCCO, 0, 1, 0), box(w + 1.2, 0.4, w + 1.2, TRIM, 0, 1 + h * 0.5, 0), box(w + 1, 0.5, w + 1, TRIM, 0, 1 + h, 0));
  for (const a of [0, Math.PI / 2, Math.PI, -Math.PI / 2]) for (const y of [1 + h * 0.48, 1 + h - 0.1]) {
    const o = mesh(cuspedArchGeo(w * 0.55, h * 0.36, 0.12), RECESS, Math.sin(a) * (w / 2 + 0.03), y, Math.cos(a) * (w / 2 + 0.03));
    o.rotation.y = a;
    g.add(o);
  }
  const r = pidaRoof(w, w * 0.3, 4, 0.5, STUCCO, TRIM);
  g.add(at(r, 0, 1.5 + h, 0), at(kalash(w * 0.12, TRIM), 0, 1.5 + h + r.userData.top, 0));
  return mergeByMaterial(g);
}

// The Elephant Stables: a long hall of eleven chambers in a row, each with a tall arched door and its
// own dome, the domes alternately ribbed and smooth, a raised tower over the middle one.
function elephantStables() {
  const g = new THREE.Group(), n = 11, cw = 7.4, L = n * cw;
  g.add(box(L + 1, 0.8, 11, STONE), box(L, 8, 9.6, STUCCO, 0, 0.8, 0), box(L + 0.8, 0.5, 10.4, TRIM, 0, 8.8, 0));
  for (let k = 0; k < n; k++) {
    const x = -L / 2 + cw / 2 + k * cw;
    const door = mesh(cuspedArchGeo(4, 6, 0.1), RECESS, x, 7.6, 4.83);
    g.add(door, box(4, 1.6, 0.05, RECESS, x, 0.8, 4.84));
    if (k === 5) {
      g.add(box(6, 4, 6, STUCCO, x, 9.3, 0), box(6.6, 0.4, 6.6, TRIM, x, 13.3, 0), at(pidaRoof(5.6, 1.8, 3, 0.5, STUCCO, TRIM), x, 13.7, 0));
    } else {
      const d = hemi(k % 2 ? 2.8 : 2.5, STUCCO);
      d.position.set(x, 9.3, 0);
      if (k % 2 === 0) d.scale.y = 1.25;
      g.add(box(6, 0.5, 6, TRIM, x, 9.3 - 0.5 + 0.02, 0), d);
    }
  }
  return mergeByMaterial(g);
}

// Hampi's ground: level lawns inside the walls, rising to the boulder hills round the royal centre.
function groundY(x, z) {
  const r = Math.hypot(x, z), t = smooth(170, 360, r);
  return t * (30 + 40 * ridged(x, z, { scale: 0.006, octaves: 3 })) + 0.3 * fbm(x, z, { scale: 0.04, octaves: 2 }) - 0.3;
}

// The Zenana Enclosure: its high granite walls round a lawn, a watchtower at three corners, the
// plinth of the queen's palace, and beyond the wall the Elephant Stables; Hampi's boulder hills,
// coconut palms and the ASI board.
export function addDetails(f, g) {
  const R = rng(13);
  g.add(heightField(1000, 1000, detail.low ? 90 : 140, groundY, { rock: ['#9c7b5c', '#8d6f52', '#a88a69'], cover: '#a2a06a', steep: 0.82 }));
  g.add(box(100, 0.12, 120, mat('#76924f', 0.95), 0, -0.05, 0));
  g.add(box(4, 0.06, 50, M.path, 0, 0.06, 35), box(50, 0.06, 4, M.path, 0, 0.06, 0));
  // The enclosure's walls (about 9 m high, tapering), with a gate on the south (+z).
  const W = 100, D = 120, wh = 9, walls = new THREE.Group();
  const wall = (len, x, z, along) => { const o = box(along ? len : 2.4, wh, along ? 2.4 : len, WALL, x, 0, z); walls.add(o, box(along ? len : 1.6, 0.5, along ? 1.6 : len, STONE, x, wh, z)); };
  wall(W, 0, -D / 2, true);
  for (const s of [-1, 1]) { wall(D, s * W / 2, 0, false); wall(W / 2 - 4, s * (W / 4 + 2), D / 2, true); }
  g.add(walls);
  g.add(at(watchtower(7, 9), -W / 2 + 2, 0, -D / 2 + 2), at(watchtower(7, 9), W / 2 - 2, 0, -D / 2 + 2), at(watchtower(6, 8), W / 2 - 2, 0, D / 2 - 2));
  // The plinth of the queen's palace, all that is left of it, north-west of the pavilion.
  g.add(box(30, 1.6, 22, STONE, -24, 0, -32), box(28, 0.3, 20, TRIM, -24, 1.6, -32));
  g.add(at(elephantStables(), 10, 0, -D / 2 - 30));
  for (let i = 0; i < 18; i++) {
    const a = R() * Math.PI * 2, d = 120 + R() * 80, r = 4 + R() * 9, b = mesh(new THREE.IcosahedronGeometry(r, 1), BOULDER, Math.cos(a) * d, r * 0.5, Math.sin(a) * d);
    b.scale.y = 0.75;
    g.add(b);
  }
  g.add(trees([...along(6, [-40, 50], [-40, -45]), ...along(6, [40, 50], [40, -45])], { kind: 'palm', seed: 3 }));
  g.add(trees([...scatter(detail.low ? 8 : 16, [-150, 150, 70, 160], { seed: 6, gap: 14 }), ...scatter(8, [-150, -60, -140, 60], { seed: 7, gap: 14 })], { kind: 'neem', seed: 4 }));
  g.add(shrubs([...along(8, [-14, 14], [14, 14]), ...along(8, [-14, -14], [14, -14])], { size: 1, flowers: '#d9516b' }));
  g.add(asiBoard('Lotus Mahal, Hampi', 6, 30, -0.3, { line2: 'WORLD HERITAGE SITE' }));
}

import * as THREE from 'three';
import { M, mat, box, at, onFace, hipRoof, surface } from '../helpers.js';
import { mergeByMaterial, windowFrame, beltCourse } from '../parts/components.js';
import { GLASS, cutSlab } from '../parts/colonial.js';
import { addDetails } from '../details/howrah-station.js';

// Halsey Ricardo's station of 1905: red brick banded with pale stone, round-arched throughout.
export const BRICK = surface(mat('#9a4733', 0.85), 'brick');
export const STONE = mat('#e6d6b2', 0.85);
export const TILE = mat('#7b4334', 0.8);
const ROOF = mat('#77706a', 0.9);

// The site stands on the river's bank, BANK above the water; the front is LEN long, HT to its
// parapet, and its face is at z = FRONT. The eight towers stand at TOWERS along it, 9 m square.
export const BANK = 3.5, LEN = 204, HT = 17.5, DEPTH = 30, FRONT = 15;
export const TOWERS = [-98, -72, -45, -13, 13, 45, 72, 98];
// The storeys' floors above the plinth, and the height of each one's windows.
export const FLOORS = [[1, 4.7], [8.2, 3.3], [13.2, 2.5]];

const arched = (w, h, back = GLASS) => windowFrame(w, h, STONE, { shape: 'round', back, frame: Math.min(0.24, w * 0.14) });

// The windows of one length of wall, x0 to x1 along a face (angle as onFace, `dist` out): a tall
// round arch to each bay of the ground floor, an arched window over it, and a pair of small ones
// under the cornice.
export function bays(g, x0, x1, angle, dist, { pitch = 4.2, ground = true } = {}) {
  const n = Math.max(1, Math.round((x1 - x0) / pitch)), w = (x1 - x0) / n;
  const a = arched(2.5, FLOORS[0][1], M.recess), b = arched(1.7, FLOORS[1][1]), c = arched(0.95, FLOORS[2][1]);
  for (let k = 0; k < n; k++) {
    const x = x0 + (k + 0.5) * w;
    if (ground) g.add(onFace(at(a.clone(), 0, FLOORS[0][0], 0), angle, dist, x));
    g.add(onFace(at(b.clone(), 0, FLOORS[1][0], 0), angle, dist, x));
    for (const s of [-0.75, 0.75]) g.add(onFace(at(c.clone(), 0, FLOORS[2][0], 0), angle, dist, x + s));
  }
}

// A tower 9 m square and h high: brick to above the roofs, with a window to each storey on its
// free faces, then the pale stone top stage with three arched openings a side under a deep
// cornice, and a low pyramid of tiles with a finial.
function tower(h, faces = [0, Math.PI / 2, -Math.PI / 2]) {
  const g = new THREE.Group(), w = 9, top = h - 5.2;
  g.add(box(w, top, w, BRICK), box(w, 5.2, w, STONE, 0, top, 0));
  for (const y of [1, 7.4, 12.5, HT, top - 0.7]) g.add(beltCourse(w, w, y, 0.55, 0.16, STONE));
  g.add(box(w + 1.4, 0.5, w + 1.4, STONE, 0, h, 0), box(w + 0.7, 0.35, w + 0.7, STONE, 0, h - 0.4, 0), box(w + 0.4, 0.9, w + 0.4, STONE, 0, h + 0.5, 0));
  g.add(at(hipRoof(w - 0.4, w - 0.4, 3.4, TILE), 0, h + 1.4, 0), box(0.3, 1.6, 0.3, STONE, 0, h + 4.6, 0));
  const a = arched(2.6, FLOORS[0][1], M.recess), b = arched(1.9, FLOORS[1][1]), c = arched(1.1, FLOORS[2][1]), d = arched(1.3, 3.2), e = arched(1.5, 3.4, M.recess);
  for (const f of faces) {
    const r = w / 2;
    g.add(onFace(at(a.clone(), 0, FLOORS[0][0], 0), f, r), onFace(at(b.clone(), 0, FLOORS[1][0], 0), f, r));
    for (const s of [-1, 1]) g.add(onFace(at(c.clone(), 0, FLOORS[2][0], 0), f, r, s));
  }
  // Above the roofs the tower is free on all four sides.
  for (const f of [0, Math.PI / 2, Math.PI, -Math.PI / 2]) {
    if (top - HT > 6) for (const s of [-1.6, 1.6]) g.add(onFace(at(d.clone(), 0, HT + 1.6, 0), f, w / 2, s));
    for (const s of [-2.7, 0, 2.7]) g.add(onFace(at(e.clone(), 0, top + 0.7, 0), f, w / 2, s));
  }
  return g;
}

// The frontispiece between the two middle towers: three doors, a great arched window lighting the
// concourse, and a gable with the clock's place in it (the clock itself is in the detail file).
function centre() {
  const g = new THREE.Group(), w = 17, h = 22.5;
  g.add(box(w, h, 6, BRICK, 0, 0, FRONT - 2));
  const gable = new THREE.Shape();
  gable.moveTo(-w / 2, 0); gable.lineTo(w / 2, 0); gable.lineTo(0, 6); gable.closePath();
  g.add(at(new THREE.Mesh(new THREE.ExtrudeGeometry(gable, { depth: 6, bevelEnabled: false }), BRICK), 0, h, FRONT - 5));
  // Stone copings up the gable.
  for (const s of [-1, 1]) {
    const cop = box(Math.hypot(w / 2, 6) + 0.6, 0.45, 6.5, STONE, 0, 0, 0);
    cop.position.set(s * w / 4, h + 3.1, FRONT - 1.9);
    cop.rotation.z = -s * Math.atan2(6, w / 2);
    g.add(cop);
  }
  g.add(box(1.2, 1.6, 1.2, STONE, 0, h + 5.6, FRONT + 0.4));
  const z = FRONT + 1;
  for (const x of [-5, 0, 5]) g.add(at(arched(3.2, 5.6, M.recess), x, 1, z));
  g.add(at(arched(9, 10.2), 0, 8.8, z));
  // The great window's bars.
  for (const x of [-3, -1.5, 0, 1.5, 3]) g.add(box(0.14, x ? (Math.abs(x) > 2 ? 8.4 : 9.6) : 10.1, 0.06, STONE, x, 8.8, z + 0.06));
  for (const y of [11.2, 13.6]) g.add(box(8.9, 0.14, 0.06, STONE, 0, y, z + 0.06));
  for (const y of [7.4, 20.4]) g.add(box(w, 0.55, 0.16, STONE, 0, y, z + 0.08));
  return g;
}

// The porte-cochère: a brick arcade one storey high before the middle of the front, carriages
// driving through it from end to end under a flat roof with a stone parapet.
function porteCochere() {
  const g = new THREE.Group(), w = 62, d = 11, h = 7.6, z0 = FRONT + 2, holes = [];
  for (let k = 0; k < 11; k++) holes.push([-w / 2 + 3.4 + k * 5.52, 0, 3.9, 5.9, 'round']);
  g.add(at(cutSlab(w, h, holes, 1.1, BRICK), 0, 0, z0 + d - 1.1));
  for (const s of [-1, 1]) {
    const end = cutSlab(d, h, [[0, 0, 6.4, 6.3, 'round']], 1.1, BRICK);
    end.rotation.y = s * Math.PI / 2;
    end.position.set(s * (w / 2 - (s > 0 ? 1.1 : 0)) + (s < 0 ? 1.1 : 0), 0, z0 + d / 2);
    g.add(end);
  }
  g.add(box(w + 0.8, 0.5, d + 0.4, STONE, 0, h, z0 + d / 2), box(w + 0.3, 1.0, 0.35, STONE, 0, h + 0.5, z0 + d - 0.2));
  for (const s of [-1, 1]) g.add(box(0.35, 1.0, d - 0.4, STONE, s * (w / 2), h + 0.5, z0 + d / 2 - 0.2));
  g.add(box(w, 0.4, 0.14, STONE, 0, 4.0 - 1.05, z0 + d + 0.07));
  return g;
}

export function buildHowrahStation() {
  const g = new THREE.Group(), s = at(new THREE.Group(), 0, BANK, 0), f = new THREE.Group(), b = new THREE.Group();
  g.add(s);
  s.add(f);
  // The long front block on its plinth, with its bands of stone and its parapet.
  b.add(box(LEN + 1, 1, DEPTH + 1, STONE, 0, 0, 0), box(LEN, HT - 1, DEPTH, BRICK, 0, 1, 0));
  for (const y of [7.4, 12.5]) b.add(beltCourse(LEN, DEPTH, y, 0.55, 0.16, STONE));
  b.add(box(LEN + 0.9, 0.6, DEPTH + 0.9, STONE, 0, HT - 0.5, 0), box(LEN + 0.3, 1.1, DEPTH + 0.3, BRICK, 0, HT + 0.1, 0), box(LEN + 0.6, 0.3, DEPTH + 0.6, STONE, 0, HT + 1.2, 0), box(LEN - 1.2, 0.2, DEPTH - 1.2, ROOF, 0, HT + 1.4, 0));
  // Towers: the middle pair taller, the rest alike; each stands 2 m proud of the front.
  for (const x of TOWERS) {
    const mid = Math.abs(x) < 20, end = Math.abs(x) > 90;
    b.add(at(tower(mid ? 34 : 29, end ? [0, x > 0 ? Math.PI / 2 : -Math.PI / 2] : [0]), x, 0, FRONT + 2 - 4.5 + (end ? 0 : 0)));
  }
  // The ranges between the towers, and the two ends.
  const w = new THREE.Group();
  for (let k = 0; k < TOWERS.length - 1; k++) {
    if (k === 3) continue;
    bays(w, TOWERS[k] + 4.9, TOWERS[k + 1] - 4.9, 0, FRONT);
  }
  for (const sx of [-1, 1]) bays(w, -6.5 * sx - 8.5, -6.5 * sx + 8.5, sx * Math.PI / 2, LEN / 2);
  b.add(w, centre(), porteCochere());
  f.add(mergeByMaterial(b));
  addDetails(f, g, s);
  // The home view: the brick front and its towers from across the forecourt, on the river side.
  return { group: g, focus: f, view: [0.42, 0.11, 1], zoom: 0.6, target: [0, BANK + 11, 0] };
}

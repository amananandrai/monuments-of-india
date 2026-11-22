import * as THREE from 'three';
import { M, mat, box, at, rng, inst, unitBox, surface, sheet, photo } from '../helpers.js';
import { steps } from '../parts/doorways.js';
import { mergeByMaterial } from '../parts/components.js';
import { addDetails } from '../details/dholavira.js';

// The pale sandstone and limestone of Khadir: dressed blocks for the castle's faces, rubble for
// the walls of the town, and the honey-coloured ground of the island.
export const STONE = photo(surface(mat('#bba684', 0.95), 'masonry'), 'rubble');
export const STONE_DARK = photo(surface(mat('#9a8768', 0.95), 'masonry'), 'rubble');
export const DRESSED = photo(surface(mat('#a99a82', 0.9), 'blocks'), 'blocks');
export const EARTH = surface(mat('#c6ab80', 0.97), 'ground');

// Dholavira, the Harappan city on Khadir Bet in the Rann of Kutch, c. 3000–1500 BCE. From the
// excavated plan: a walled city of about 771 by 617 m (drawn here at a little under half that, so
// the whole fits the view) with the castle (citadel) on its highest mound, the bailey beside it to
// the west, a broad ceremonial ground to the north, the middle town and lower town beyond, and
// great reservoirs cut into the rock between the castle and the city wall. Facing +z (north): the
// castle's north gate, two raised chambers flanking a sunken passage, looks out over the ground.
//
// The castle's sides are battered: courses of stone step back as they rise, ragged at the top where
// they have fallen. The ground about the castle is a skin of slabs with the reservoirs left open.
export const CASTLE = { w: 118, d: 92, h: 12 };
export const RES = [
  // [x, z, width (x), length (z), depth]: the east reservoir, the long one, and a south reservoir.
  [112, 2, 30, 74, 7],
  [-20, -86, 64, 22, 5],
];
export const CITY = { w: 380, d: 320, cz: 50 };

// A battered wall face len long and h high, n courses stepping back `set` each, built along +x,
// its outer face towards +z at z = 0. The top course is broken into lengths of uneven height.
function battered(len, h, n, set, R, m, top) {
  const list = [], ch = h / n;
  for (let k = 0; k < n - 1; k++) list.push([0, k * ch, -k * set - 1.5, len - k * set * 0.2, ch + 0.02, 3]);
  const g = new THREE.Group();
  g.add(inst(unitBox(), list.map(([x, y, z, w, hh, d]) => [x, y, z, w, hh, d, 0]), m));
  // The broken top course: lengths of 2 to 5 m, missing here and there.
  const tops = [];
  for (let x = -len / 2; x < len / 2 - 1;) {
    const l = 2 + R() * 3, hh = ch * (0.3 + R() * 1.4);
    if (R() > 0.15) tops.push([x + l / 2, (n - 1) * ch, -(n - 1) * set - 1.5, l, hh, 3, 0]);
    x += l;
  }
  g.add(inst(unitBox(), tops, top));
  return g;
}

// Low ruined walls of houses on a grid: rooms round small courts, standing knee- to chest-high.
export function houses(x0, x1, z0, z1, y, R, cell = 9) {
  const list = [];
  let i = 0;
  for (let x = x0; x < x1 - cell * 0.5; x += cell, i++) for (let z = z0, j = 0; z < z1 - cell * 0.5; z += cell, j++) {
    // Streets: every fourth row and fifth column left open; and a few houses lost altogether.
    if (i % 5 === 4 || j % 4 === 3 || R() < 0.15) continue;
    const w = cell * (0.7 + R() * 0.2), d = cell * (0.7 + R() * 0.2), h = 0.4 + R() * 1.1, t = 0.6;
    list.push([x + cell / 2, y, z + cell / 2 - d / 2, w, h, t, 0], [x + cell / 2, y, z + cell / 2 + d / 2, w, h * (0.6 + R() * 0.6), t, 0]);
    list.push([x + cell / 2 - w / 2, y, z + cell / 2, t, h * (0.7 + R() * 0.5), d, 0]);
    if (R() < 0.6) list.push([x + cell / 2 + w / 2, y, z + cell / 2, t, h, d, 0]);
    if (R() < 0.5) list.push([x + cell / 2 + (R() - 0.5) * w * 0.4, y, z + cell / 2, t, h * 0.7, d * 0.6, 0]);
  }
  return list;
}

// The ground of the site: slabs with holes for the reservoirs. Cuts the rectangle into strips at
// each hole's edges and lays the strips round the holes.
function ground(x0, x1, z0, z1, holes, m) {
  const xs = [x0, x1, ...holes.flatMap(([x, , w]) => [x - w / 2, x + w / 2])].sort((a, b) => a - b), g = new THREE.Group();
  for (let i = 0; i < xs.length - 1; i++) {
    const a = xs[i], b = xs[i + 1], cx = (a + b) / 2;
    if (b - a < 0.01) continue;
    const zs = [z0, z1, ...holes.filter(([x, , w]) => cx > x - w / 2 && cx < x + w / 2).flatMap(([, z, , l]) => [z - l / 2, z + l / 2])].sort((p, q) => p - q);
    for (let k = 0; k < zs.length - 1; k += 2) if (zs[k + 1] - zs[k] > 0.01) g.add(box(b - a, 0.6, zs[k + 1] - zs[k], m, cx, -0.6, (zs[k] + zs[k + 1]) / 2));
  }
  return g;
}

// A reservoir cut into the ground: its sides stepping down in ledges, a flight of steps down one
// end, and water standing in the bottom.
function reservoir(w, l, depth, R) {
  const g = new THREE.Group(), n = Math.round(depth / 0.9), rings = [];
  for (let k = 0; k < n; k++) {
    const iw = w - k * 1.6, il = l - k * 1.6, y = -(k + 1) * 0.9, t = 0.8;
    rings.push([0, y, -il / 2 + t / 2, iw, 0.9, t, 0], [0, y, il / 2 - t / 2, iw, 0.9, t, 0], [-iw / 2 + t / 2, y, 0, t, 0.9, il - 2 * t, 0], [iw / 2 - t / 2, y, 0, t, 0.9, il - 2 * t, 0]);
  }
  g.add(inst(unitBox(), rings, DRESSED));
  const bw = w - n * 1.6, bl = l - n * 1.6;
  g.add(box(bw + 0.2, 0.4, bl + 0.2, STONE_DARK, 0, -depth - 0.4, 0));
  g.add(at(steps(4, depth * 0.85, Math.round(depth * 3), DRESSED, 0.6), 0, -depth, -bl / 2 + 1).rotateY(Math.PI));
  g.add(sheet(bw - 0.2, bl - 0.2, M.river, 0, -depth + 1.4 + R() * 0.6, 0));
  return g;
}

export function buildDholavira() {
  const g = new THREE.Group(), f = new THREE.Group(), R = rng(31);
  g.add(f);
  const { w, d, h } = CASTLE;
  // The ground of the walled city, open over the reservoirs.
  const cx0 = -CITY.w / 2, cx1 = CITY.w / 2, cz0 = CITY.cz - CITY.d / 2, cz1 = CITY.cz + CITY.d / 2;
  g.add(ground(cx0 - 40, cx1 + 40, cz0 - 40, cz1 + 40, RES, EARTH));
  for (const [x, z, rw, rl, dep] of RES) g.add(at(reservoir(rw, rl, dep, R), x, 0, z));
  // The castle: its battered faces on all four sides, the north face broken by the gate, and its
  // top a platform of rammed earth and stone.
  const n = 5, set = 1.1, faces = new THREE.Group();
  for (const [a, len, dist] of [[Math.PI, w, d / 2], [Math.PI / 2, d, w / 2], [-Math.PI / 2, d, w / 2]]) {
    const o = at(battered(len, h, n, set, R, DRESSED, STONE), 0, 0, 0);
    o.rotation.y = a;
    o.position.set(Math.sin(a) * dist, 0, Math.cos(a) * dist);
    faces.add(o);
  }
  const gap = 16;
  for (const s of [-1, 1]) faces.add(at(battered((w - gap) / 2, h, n, set, R, DRESSED, STONE), s * (w + gap) / 4, 0, d / 2));
  f.add(faces);
  const top = h - 1.2;
  f.add(box(w - 2 * n * set - 2, top, d - 2 * n * set - 2, STONE_DARK, 0, 0, 0), box(w - 2 * n * set - 4, 0.3, d - 2 * n * set - 4, EARTH, 0, top, 0));
  // The north gate: a ramp climbing from the ground between the two halves of the north face, two
  // raised chambers either side of a sunken passage, and the platform of the gate behind.
  const gz = d / 2, gate = new THREE.Group(), pf = top - 1;
  for (const sx of [-1, 1]) gate.add(box(5.5, top + 2.4, 20, DRESSED, sx * 5.25, 0, gz - 8));
  gate.add(box(5, pf, 22, STONE_DARK, 0, 0, gz - 9));
  gate.add(at(steps(5, pf, Math.round(pf / 0.3), DRESSED, 0.45), 0, 0, gz + 2));
  f.add(mergeByMaterial(gate));
  // Houses and halls within the castle: low walls on a grid.
  f.add(inst(unitBox(), houses(-w / 2 + 10, w / 2 - 10, -d / 2 + 10, d / 2 - 18, top + 0.3, R, 10), STONE));
  // The bailey, west of the castle: a lower walled enclosure, and its houses.
  const bx = -w / 2 - 50;
  f.add(box(96, 5.5, d, STONE_DARK, bx, 0, 0));
  for (const s of [-1, 1]) f.add(box(96, 2, 3, DRESSED, bx, 5.5, s * (d / 2 - 1.5)));
  f.add(box(3, 2, d, DRESSED, bx - 46.5, 5.5, 0));
  f.add(inst(unitBox(), houses(bx - 44, bx + 46, -d / 2 + 5, d / 2 - 5, 5.5, R, 9), STONE));
  // The city wall: thick, low and ragged, with a bastion at each corner.
  const cw = [];
  const run = (x0, z0, x1, z1) => {
    const len = Math.hypot(x1 - x0, z1 - z0), k = Math.round(len / 6), ry = Math.atan2(x1 - x0, z1 - z0);
    for (let i = 0; i < k; i++) { const u = (i + 0.5) / k; if (R() < 0.06) continue; cw.push([x0 + (x1 - x0) * u, 0, z0 + (z1 - z0) * u, 9, 2.2 + R() * 2.6, len / k + 0.05, ry]); }
  };
  run(cx0, cz0, cx1, cz0); run(cx0, cz1, cx1, cz1); run(cx0, cz0, cx0, cz1); run(cx1, cz0, cx1, cz1);
  for (const x of [cx0, cx1]) for (const z of [cz0, cz1]) cw.push([x, 0, z, 22, 5.5, 22, 0]);
  g.add(inst(unitBox(), cw, STONE));
  addDetails(f, g, { ...CASTLE, top, gap, pf: top - 1, cx0, cx1, cz0, cz1, bx, R });
  // From the north-east, over the ceremonial ground to the castle and its gate.
  return { group: g, focus: f, view: [0.75, 0.38, 1], zoom: 0.8 };
}

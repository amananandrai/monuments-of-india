import * as THREE from 'three';
import { M, mat, mesh, box, cyl, at, rng, inst, unitBox, surface, sheet, photo } from '../helpers.js';
import { steps } from '../parts/doorways.js';
import { mergeByMaterial } from '../parts/components.js';
import { addDetails } from '../details/dholavira.js';

// The pale sandstone and limestone of Khadir: dressed blocks for the castle's faces, rubble for
// the walls of the town, and the honey-coloured ground of the island.
export const STONE = photo(surface(mat('#bba684', 0.95), 'masonry'), 'rubble');
export const STONE_DARK = photo(surface(mat('#9a8768', 0.95), 'masonry'), 'rubble');
export const DRESSED = photo(surface(mat('#a99a82', 0.9), 'blocks'), 'blocks');
export const EARTH = surface(mat('#c6ab80', 0.97), 'ground');
const SHAFT = mat('#2a241d', 0.95);

// Dholavira, the Harappan city on Khadir Bet in the Rann of Kutch, c. 3000–1500 BCE. From the
// excavated plan (R. S. Bisht; the layout on Wikimedia Commons, "Dholavira-layout-en.svg") and
// photographs of the site: a walled city of about 771 by 617 m (drawn here at a little under half
// that, so the whole fits the view, with the castle and the reservoirs at their own size) with the
// castle (citadel) on its highest mound inside double ramparts, the bailey beside it to the west,
// a broad ceremonial ground to the north with stepped stands along the castle's foot, the middle
// town and lower town beyond, and reservoirs cut into the rock between the castle and the city
// wall: the great one on the east, and a row of tanks along the south. Facing +z (north): the
// castle's north gate, two raised chambers flanking a sunken passage, looks out over the ground;
// the east gate looks towards the east reservoir.
//
// The castle's sides are battered: courses of stone step back as they rise, ragged at the top where
// they have fallen. The ground about the castle is a skin of slabs with the reservoirs left open;
// the whole site stands LIFT above the open land, so that they can be sunk in it.
export const LIFT = 11.5;
export const CASTLE = { w: 118, d: 92, h: 12 };
// The east gate: where it stands along the east face (z), and the width of the break in the face.
export const EAST_GATE = { z: 8, gap: 13 };
export const RES = [
  // [x, z, width (x), length (z), floor levels from north to south, corners with stairs]. The
  // east reservoir, 73.4 m north to south by 29.3 m: its floor cut in three levels, the deepest
  // 10.6 m down, a flight of 30 steps at each of three corners, and a rock-cut well in its floor.
  [112, 2, 29.3, 73.4, [6.4, 8.6, 10.6], [[-1, 1], [1, 1], [1, -1]], true],
  // The row of tanks along the south of the castle and the bailey, cut in the rock one below
  // the next.
  [-112, -80, 34, 24, [3.2, 4.4], [[1, 1]]], [-70, -80, 40, 24, [4.4, 6], [[-1, -1]]], [-22, -80, 44, 24, [6, 7.6], [[1, 1], [-1, -1]]],
  [28, -80, 44, 24, [5, 6.4], [[-1, 1]]], [72, -80, 34, 24, [3.6, 5], [[1, -1]]],
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

// A reservoir cut into the ground, w by l: sheer sides, of dressed masonry above and the living
// rock below; its floor cut in levels (their depths, from one end of its length to the other);
// a flight of 30 steps down the side wall from each of the corners given ([x, z] signs); a
// rock-cut well in the floor of its deepest part, entered by a few steps; and a little water
// standing in the bottom.
function reservoir(w, l, levels, corners, well) {
  const g = new THREE.Group(), long = l >= w, t = 1, deep = Math.max(...levels), iw = w - 2 * t, il = l - 2 * t, n = levels.length;
  const upper = Math.min(deep, 3.4);
  for (const s of [-1, 1]) {
    g.add(box(w, upper, t, DRESSED, 0, -upper, s * (l / 2 - t / 2)), box(t, upper, il, DRESSED, s * (w / 2 - t / 2), -upper, 0));
    if (deep > upper) g.add(box(w, deep - upper, t, STONE_DARK, 0, -deep, s * (l / 2 - t / 2)), box(t, deep - upper, il, STONE_DARK, s * (w / 2 - t / 2), -deep, 0));
  }
  // The floor: a block of rock under each level, lengthways.
  const len = (long ? il : iw) / n;
  levels.forEach((lv, i) => {
    const c = (long ? il : iw) / 2 - (i + 0.5) * len;
    g.add(long ? box(iw, deep - lv + 0.5, len, STONE_DARK, 0, -deep - 0.5, c) : box(len, deep - lv + 0.5, il, STONE_DARK, c, -deep - 0.5, 0));
  });
  const at0 = levels.indexOf(deep), dc = (long ? il : iw) / 2 - (at0 + 0.5) * len;
  g.add(long ? sheet(iw - 0.1, len - 0.1, M.river, 0, -deep + 0.45, dc) : sheet(len - 0.1, il - 0.1, M.river, dc, -deep + 0.45, 0));
  // The stairs: each runs down along a side wall from its corner to the floor at that end, with
  // a pier of masonry under it.
  for (const [sx, sz] of corners) {
    const lv = long ? levels[sz > 0 ? 0 : n - 1] : levels[sx > 0 ? 0 : n - 1], run = 30 * 0.42, st = new THREE.Group();
    st.add(at(steps(1.8, lv, 30, DRESSED, 0.42), 0, -lv, 0));
    if (long) { st.position.set(sx * (iw / 2 - 0.9), 0, sz * il / 2); st.rotation.y = sz > 0 ? Math.PI : 0; } else { st.position.set(sx * iw / 2, 0, sz * (il / 2 - 0.9)); st.rotation.y = sx > 0 ? -Math.PI / 2 : Math.PI / 2; }
    void run;
    g.add(st);
  }
  if (well) {
    const wz = dc - Math.sign(dc || 1) * len * 0.1;
    g.add(mesh(new THREE.CylinderGeometry(2.3, 2.3, 0.4, 24, 1, true), DRESSED, 0, -deep + 0.2, wz), mesh(new THREE.RingGeometry(1.9, 2.3, 24).rotateX(-Math.PI / 2), DRESSED, 0, -deep + 0.4, wz));
    g.add(cyl(1.9, 1.9, 0.02, SHAFT, 0, -deep + 0.5, wz, 24));
    for (let k = 0; k < 4; k++) g.add(box(0.9, 0.5 + 0.22 * (3 - k), 0.5, STONE_DARK, 1.2, -deep, wz - 0.9 + k * 0.5));
  }
  return mergeByMaterial(g);
}

export function buildDholavira() {
  const g = new THREE.Group(), site = at(new THREE.Group(), 0, LIFT, 0), f = new THREE.Group(), R = rng(31);
  g.add(site);
  site.add(f);
  const { w, d, h } = CASTLE;
  // The ground of the walled city, open over the reservoirs.
  const cx0 = -CITY.w / 2, cx1 = CITY.w / 2, cz0 = CITY.cz - CITY.d / 2, cz1 = CITY.cz + CITY.d / 2;
  site.add(ground(cx0 - 40, cx1 + 40, cz0 - 40, cz1 + 40, RES, EARTH));
  for (const [x, z, rw, rl, levels, corners, well] of RES) f.add(at(reservoir(rw, rl, levels, corners, well), x, 0, z));
  // The castle: its battered faces on all four sides, the north face broken by the north gate
  // and the east by the east gate, and its top a platform of rammed earth and stone.
  const n = 5, set = 1.1, faces = new THREE.Group(), gap = 16;
  for (const [a, len, dist, breaks] of [[0, w, d / 2, [[0, gap]]], [Math.PI, w, d / 2, []], [Math.PI / 2, d, w / 2, [[-EAST_GATE.z, EAST_GATE.gap]]], [-Math.PI / 2, d, w / 2, []]]) {
    const side = at(new THREE.Group(), Math.sin(a) * dist, 0, Math.cos(a) * dist);
    side.rotation.y = a;
    let p = -len / 2;
    for (const [c, gw] of [...breaks, [len / 2, 0]]) { side.add(at(battered(c - gw / 2 - p, h, n, set, R, DRESSED, STONE), (p + c - gw / 2) / 2, 0, 0)); p = c + gw / 2; }
    faces.add(side);
  }
  f.add(faces);
  const top = h - 1.2;
  f.add(box(w - 2 * n * set - 2, top, d - 2 * n * set - 2, STONE_DARK, 0, 0, 0), box(w - 2 * n * set - 4, 0.3, d - 2 * n * set - 4, EARTH, 0, top, 0));
  // The north gate: a stair climbing from the ground between the two halves of the north face,
  // two raised chambers either side of a sunken passage, and the platform of the gate behind.
  const gz = d / 2, gate = new THREE.Group(), pf = top - 1;
  for (const sx of [-1, 1]) gate.add(box(5.5, top + 2.4, 20, DRESSED, sx * 5.25, 0, gz - 8));
  gate.add(box(5, pf, 22, STONE_DARK, 0, 0, gz - 9));
  gate.add(at(steps(5, pf, Math.round(pf / 0.3), DRESSED, 0.45), 0, 0, gz + 2));
  f.add(mergeByMaterial(gate));
  // The east gate, built the same way but smaller: a sunken passage between two chambers, a
  // stair up to it from the ground outside and a short flight from its inner end to the top.
  const eg = new THREE.Group(), ep = top - 2.4;
  for (const s of [-1, 1]) eg.add(box(4.5, top + 1.2, 15, DRESSED, s * 4.25, 0, -6.5));
  eg.add(box(4, ep, 17, STONE_DARK, 0, 0, -7.5), at(steps(4, ep, Math.round(ep / 0.3), DRESSED, 0.42), 0, 0, 1));
  eg.add(at(steps(4, top - ep, 9, DRESSED, 0.4), 0, ep, -12.4).rotateY(Math.PI));
  f.add(at(mergeByMaterial(eg), w / 2, 0, EAST_GATE.z).rotateY(Math.PI / 2));
  // Houses and halls within the castle: low walls on a grid.
  f.add(inst(unitBox(), houses(-w / 2 + 16, w / 2 - 22, -d / 2 + 16, d / 2 - 22, top + 0.3, R, 10), STONE));
  // The bailey, west of the castle: a lower walled enclosure, and its houses.
  const bx = -w / 2 - 50;
  f.add(box(96, 5.5, d, STONE_DARK, bx, 0, 0));
  for (const s of [-1, 1]) f.add(box(96, 2, 3, DRESSED, bx, 5.5, s * (d / 2 - 1.5)));
  f.add(box(3, 2, d, DRESSED, bx - 46.5, 5.5, 0));
  f.add(inst(unitBox(), houses(bx - 44, bx + 22, -d / 2 + 5, d / 2 - 5, 5.5, R, 9), STONE));
  // The city wall: thick, low and ragged, with a bastion at each corner.
  const cw = [];
  const run = (x0, z0, x1, z1) => {
    const len = Math.hypot(x1 - x0, z1 - z0), k = Math.round(len / 6), ry = Math.atan2(x1 - x0, z1 - z0);
    for (let i = 0; i < k; i++) { const u = (i + 0.5) / k; if (R() < 0.06) continue; cw.push([x0 + (x1 - x0) * u, 0, z0 + (z1 - z0) * u, 9, 2.2 + R() * 2.6, len / k + 0.05, ry]); }
  };
  run(cx0, cz0, cx1, cz0); run(cx0, cz1, cx1, cz1); run(cx0, cz0, cx0, cz1); run(cx1, cz0, cx1, cz1);
  for (const x of [cx0, cx1]) for (const z of [cz0, cz1]) cw.push([x, 0, z, 22, 5.5, 22, 0]);
  site.add(inst(unitBox(), cw, STONE));
  addDetails(f, site, g, { ...CASTLE, top, gap, pf, ep, cx0, cx1, cz0, cz1, bx, R });
  // From the north-east, over the ceremonial ground to the castle and its gates, the east
  // reservoir before it.
  return { group: g, focus: f, view: [0.75, 0.4, 1], zoom: 0.8 };
}

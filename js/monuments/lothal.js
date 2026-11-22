import * as THREE from 'three';
import { M, mat, box, at, rng, inst, unitBox, surface, sheet } from '../helpers.js';
import { steps } from '../parts/doorways.js';
import { addDetails } from '../details/lothal.js';

// Fired brick, red-brown and weathered, for the dock and the drains; sun-dried mud brick, greyer,
// for the great platforms; and the silty earth of the plain.
export const BRICK = surface(mat('#97644b', 0.95), 'terracotta');
export const BRICK_DARK = surface(mat('#7c523e', 0.95), 'terracotta');
export const MUD = surface(mat('#a98d6c', 0.97), 'masonry');
export const EARTH = surface(mat('#ad9a72', 0.97), 'ground');

// Lothal, the Harappan port on the plain of Saurashtra, c. 2400–1900 BCE. From the excavated plan
// (S. R. Rao, 1955–62): a walled town of about 280 by 225 m; along its east side the dock, a
// basin of fired brick 214 by 36 m and some 4 m deep, with an inlet from the old course of the
// Sabarmati and a spillway; on its west side a brick wharf; in the south-east the acropolis, a
// mud-brick platform with the warehouse, its plinth cut into cubical blocks with air passages
// between, the ruler's quarter and its baths and drains; and to the north the lower town with its
// streets, houses and bead factory. Drawn with the dock's long side towards the viewer (+z).
export const DOCK = { l: 214, w: 36, depth: 4.2, z: 62 };
export const ACRO = { x: 20, z: -38, w: 126, d: 60, h: 3.6 };

// The ground: slabs round a hole for the dock (as for the reservoirs at Dholavira).
function ground(x0, x1, z0, z1, [hx, hz, hw, hl], m) {
  const g = new THREE.Group(), a = hx - hw / 2, b = hx + hw / 2, c = hz - hl / 2, d = hz + hl / 2;
  g.add(box(a - x0, 0.6, z1 - z0, m, (x0 + a) / 2, -0.6, (z0 + z1) / 2), box(x1 - b, 0.6, z1 - z0, m, (b + x1) / 2, -0.6, (z0 + z1) / 2));
  g.add(box(hw, 0.6, c - z0, m, hx, -0.6, (z0 + c) / 2), box(hw, 0.6, z1 - d, m, hx, -0.6, (d + z1) / 2));
  return g;
}

// Low walls of houses on a grid of streets (y their footing).
export function houses(x0, x1, z0, z1, y, R, cell = 8) {
  const list = [];
  let i = 0;
  for (let x = x0; x < x1 - cell * 0.5; x += cell, i++) for (let z = z0, j = 0; z < z1 - cell * 0.5; z += cell, j++) {
    if (i % 4 === 3 || j % 5 === 4 || R() < 0.14) continue;
    const w = cell * (0.72 + R() * 0.18), d = cell * (0.72 + R() * 0.18), h = 0.3 + R() * 0.9, t = 0.55, cx = x + cell / 2, cz = z + cell / 2;
    list.push([cx, y, cz - d / 2, w, h, t, 0], [cx, y, cz + d / 2, w, h * (0.6 + R() * 0.6), t, 0], [cx - w / 2, y, cz, t, h * (0.7 + R() * 0.5), d, 0]);
    if (R() < 0.6) list.push([cx + w / 2, y, cz, t, h, d, 0]);
    if (R() < 0.5) list.push([cx, y, cz + (R() - 0.5) * d * 0.4, w, h * 0.7, t, 0]);
  }
  return list;
}

export function buildLothal() {
  const g = new THREE.Group(), f = new THREE.Group(), R = rng(17);
  g.add(f);
  const { l, w, depth, z: dz } = DOCK;
  g.add(ground(-500, 500, -420, 500, [0, dz, l, w], EARTH));
  // The dock: walls of fired brick in offsets, stepping back a little as they rise, the floor of
  // silt, and shallow water. The inlet breaks the side towards the river (+z), near the east end.
  const dock = new THREE.Group(), t = 1.6, n = 4, ch = depth / n;
  for (let k = 0; k < n; k++) {
    const y = -depth + k * ch, s = k * 0.25, L = l - 2 * s, W = w - 2 * s;
    const m = k % 2 ? BRICK : BRICK_DARK, g0 = l / 2 - 22, g1 = l / 2 - 9.2;
    dock.add(box(L, ch, t, m, 0, y, dz - W / 2 + t / 2));
    dock.add(box(g0 + L / 2, ch, t, m, (g0 - L / 2) / 2, y, dz + W / 2 - t / 2), box(L / 2 - g1, ch, t, m, (g1 + L / 2) / 2, y, dz + W / 2 - t / 2));
    dock.add(box(t, ch, W - 2 * t, m, -L / 2 + t / 2, y, dz), box(t, ch, W - 2 * t, m, L / 2 - t / 2, y, dz));
  }
  dock.add(box(l, 0.3, w, surface(mat('#7c7a52', 0.97), 'ground'), 0, -depth - 0.3, dz), sheet(l * 0.55, w - 14, M.river, l * 0.12, -depth + 0.12, dz + 2));
  // The inlet's sill, which held water in the basin at low tide.
  dock.add(box(12.8, 1.5, 2.4, BRICK_DARK, l / 2 - 15.6, -depth, dz + w / 2 - 1.2));
  f.add(dock);
  // The wharf along the dock's town side: a mud-brick platform, with ramps up from the dock edge.
  f.add(box(l, 1.2, 9, MUD, 0, 0, dz - w / 2 - 4.5));
  for (const x of [-60, 20, 80]) f.add(at(steps(5, 1.2, 4, BRICK, 0.5), x, 0, dz - w / 2).rotateY(Math.PI));
  // The acropolis: a platform of mud brick 3.6 m high with a facing of fired brick at its foot.
  const { x: ax, z: az, w: aw, d: ad, h: ah } = ACRO;
  f.add(box(aw, ah, ad, MUD, ax, 0, az), box(aw + 1, 0.8, ad + 1, BRICK_DARK, ax, 0, az));
  f.add(at(steps(6, ah, 10, BRICK, 0.5), ax - 30, 0, az + ad / 2));
  // The warehouse on the acropolis, at its dock end: a plinth 4 m higher still, cut into blocks
  // 3.6 m square with passages 1 m wide between them, twelve of them left by the fire that
  // destroyed the timber hall above.
  const wx = ax + 36, wz = az + 6, blocks = [];
  for (let i = 0; i < 6; i++) for (let j = 0; j < 4; j++) blocks.push([wx - 13 + i * 4.6, ah, wz - 7 + j * 4.6, 3.6, 1.2 + (i * 7 + j * 3) % 5 * 0.22, 3.6, 0]);
  f.add(inst(unitBox(), blocks, BRICK), box(30, 0.5, 21, MUD, wx - 1.5, ah, wz - 0.1));
  // Houses, baths and drains of the ruler's quarter, on the rest of the acropolis.
  f.add(inst(unitBox(), houses(ax - aw / 2 + 4, ax + 10, az - ad / 2 + 4, az + ad / 2 - 4, ah, R, 7), BRICK));
  // The lower town, north-west of the dock: streets of houses on their own platforms.
  f.add(box(110, 1.2, 70, MUD, -80, 0, -40));
  f.add(inst(unitBox(), houses(-132, -28, -72, -8, 1.2, R, 8), BRICK));
  // The town wall of mud brick, low and worn, round the acropolis and the lower town.
  const tw = [];
  const run = (x0, z0, x1, z1) => {
    const len = Math.hypot(x1 - x0, z1 - z0), k = Math.round(len / 5), ry = Math.atan2(x1 - x0, z1 - z0);
    for (let i = 0; i < k; i++) { const u = (i + 0.5) / k; if (R() < 0.08) continue; tw.push([x0 + (x1 - x0) * u, 0, z0 + (z1 - z0) * u, 7, 1 + R() * 1.8, len / k + 0.05, ry]); }
  };
  run(-142, -82, 90, -82); run(-142, -82, -142, 30); run(90, -82, 90, -8); run(-142, 30, -90, 30);
  f.add(inst(unitBox(), tw, MUD));
  addDetails(f, g, { ...DOCK, ...{ ax, az, aw, ad, ah, wx, wz }, R });
  // From the north-east, along the dock to the acropolis behind it.
  return { group: g, focus: f, view: [0.6, 0.5, 1], zoom: 0.8 };
}

import * as THREE from 'three';
import { M, mat, mesh, box, at, rng, inst, unitBox, surface, sheet } from '../helpers.js';
import { steps } from '../parts/doorways.js';
import { addDetails } from '../details/lothal.js';

// Fired brick, red-brown and weathered, for the dock and the drains; sun-dried mud brick, greyer,
// for the great platforms; and the silty earth of the plain.
export const BRICK = surface(mat('#97644b', 0.95), 'terracotta');
export const BRICK_DARK = surface(mat('#7c523e', 0.95), 'terracotta');
export const MUD = surface(mat('#a98d6c', 0.97), 'masonry');
export const EARTH = surface(mat('#ad9a72', 0.97), 'ground');
const SILT = surface(mat('#7c7a52', 0.97), 'ground');

// Lothal, the Harappan port on the plain of Saurashtra, c. 2400–1900 BCE. From the excavated plan
// (S. R. Rao, 1955–62; the layout on Wikimedia Commons, "Lothal-layout-en.svg") and photographs of
// the site: a town of about 285 m north to south by 228 m, inside a thick wall of mud brick.
// Along its east side lies the dock, a basin of fired brick 214 by 36 m and some 4 m deep: the
// main inlet, 12.8 m wide, in its long east wall, a second of 7 m and only 0.9 m deep in its north
// end towards the nullah, and in its south end a sluice a metre square for a spillway. A mud-brick
// wharf 220 m long runs along its town side. In the south-east of the town stands the acropolis,
// a platform of mud brick about 127 m east to west by 61 m, with the ruler's house, the baths,
// their drains and a well; south of it the warehouse on its own podium 3.5 m high, joined to the
// wharf by a ramp; north of them the lower town, its main street 6 to 8 m wide running north to
// south between the shops and houses; the bead factory in the west; and the cemetery outside the
// wall to the north-west.
//
// Drawn with east towards the viewer (+z) and north to the right (+x), the dock's long side in
// front. The whole site stands LIFT above the open land, so that the basin can be sunk in it.
export const LIFT = 5;
export const DOCK = { l: 214, w: 36, depth: 4.2, z: 62 };
// The town inside its wall; the acropolis and the warehouse's podium (their edges, and heights).
export const TOWN = { x0: -132, x1: 162, z0: -186, z1: 34, gate: -72 };
export const ACRO = { x0: -66, x1: -5, z0: -93, z1: 30, h: 3.4 };
export const WARE = { x: -98, z: 0, s: 44, h: 3.5 };
// The main street of the lower town (its centre line and width), and the inlets of the dock.
export const STREET = { z: -80, w: 7, x0: -5, x1: 156 };
// The bead factory, in the western quarter: its centre.
export const BEAD = [-24, -122];
export const INLET = { x0: DOCK.l / 2 - 22, x1: DOCK.l / 2 - 9.2, north: 7, sill: 0.9 };

// The ground: slabs laid round the holes ([x, z, width (x), length (z)]) left for the dock and the
// channels that feed it.
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

// A channel cut in the ground: its bed `depth` down, earthen sides, and water standing in it.
// Its ends are closed with earth unless open ('a': the low end of its length, 'b': the high end);
// gap: [from, to] along its length, left open in its low side where another channel joins it.
function channel([x, z, w, l], depth, water, { open = '', gap = null } = {}) {
  const g = new THREE.Group(), along = l > w, len = along ? l : w, wid = along ? w : l, c = along ? z : x;
  const put = (u0, u1, v, t) => { const o = box(along ? t : u1 - u0, depth, along ? u1 - u0 : t, EARTH, 0, -depth, 0); o.position.x = along ? x + v : (u0 + u1) / 2; o.position.z = along ? (u0 + u1) / 2 : z + v; g.add(o); };
  g.add(box(w, 0.3, l, SILT, x, -depth - 0.3, z), sheet(w - 0.1, l - 0.1, M.river, x, -depth + water, z));
  put(c - len / 2, c + len / 2, wid / 2 + 0.2, 0.4);
  if (gap) { put(c - len / 2, gap[0], -wid / 2 - 0.2, 0.4); put(gap[1], c + len / 2, -wid / 2 - 0.2, 0.4); } else put(c - len / 2, c + len / 2, -wid / 2 - 0.2, 0.4);
  for (const [e, s] of [['a', -1], ['b', 1]]) if (!open.includes(e)) { const o = box(along ? w : 0.4, depth, along ? 0.4 : l, EARTH, x + (along ? 0 : s * (w / 2 + 0.2)), -depth, z + (along ? s * (l / 2 + 0.2) : 0)); g.add(o); }
  return g;
}

// Low walls of houses on a grid of streets (y their footing).
export function houses(x0, x1, z0, z1, y, R, cell = 8, lost = 0.14) {
  const list = [];
  let i = 0;
  for (let x = x0; x < x1 - cell * 0.5; x += cell, i++) for (let z = z0, j = 0; z < z1 - cell * 0.5; z += cell, j++) {
    if (i % 4 === 3 || j % 5 === 4 || R() < lost) continue;
    const w = cell * (0.72 + R() * 0.18), d = cell * (0.72 + R() * 0.18), h = 0.3 + R() * 0.9, t = 0.55, cx = x + cell / 2, cz = z + cell / 2;
    list.push([cx, y, cz - d / 2, w, h, t, 0], [cx, y, cz + d / 2, w, h * (0.6 + R() * 0.6), t, 0], [cx - w / 2, y, cz, t, h * (0.7 + R() * 0.5), d, 0]);
    if (R() < 0.6) list.push([cx + w / 2, y, cz, t, h, d, 0]);
    if (R() < 0.5) list.push([cx, y, cz + (R() - 0.5) * d * 0.4, w, h * 0.7, t, 0]);
  }
  return list;
}

// A ramp w wide climbing from h0 to h1 over len, along -z from z = 0.
export function ramp(w, len, h0, h1, m) {
  const sh = new THREE.Shape([[0, 0], [len, 0], [len, h1], [0, h0]].map(([a, b]) => new THREE.Vector2(a, b)));
  return mesh(new THREE.ExtrudeGeometry(sh, { depth: w, bevelEnabled: false }).translate(0, 0, -w / 2).rotateY(Math.PI / 2), m);
}

export function buildLothal() {
  const g = new THREE.Group(), site = at(new THREE.Group(), 0, LIFT, 0), f = new THREE.Group(), R = rng(17);
  g.add(site);
  site.add(f);
  const { l, w, depth, z: dz } = DOCK, zw = dz - w / 2, ze = dz + w / 2;
  // The channels: from the main inlet east to the river's old course, from the north inlet to the
  // nullah that ran north of the town, and the spillway's outfall at the south.
  const ix = (INLET.x0 + INLET.x1) / 2, east = [ix, ze + 45, INLET.x1 - INLET.x0, 90], north = [l / 2 + 32, dz, 64, INLET.north];
  const nullah = [l / 2 + 71, dz - 30, 14, 260], spill = [-l / 2 - 9, dz, 18, 1];
  site.add(ground(-500, 500, -420, 500, [[0, dz, l, w], east, north, nullah, spill], EARTH));
  site.add(channel(east, depth - 1.5, 0.5, { open: 'a' }), channel(north, INLET.sill, 0.3, { open: 'ab' }), channel(nullah, 1.6, 0.6, { gap: [dz - INLET.north / 2, dz + INLET.north / 2] }), channel(spill, 1.05, 0.15, { open: 'b' }));
  // The dock: walls of fired brick laid in courses, the floor of silt, and water standing in it.
  // The main inlet breaks the east side near its north end; the second inlet the north end; and
  // the sluice, a slot a metre square, the top of the south end.
  const dock = new THREE.Group(), t = 1.6, n = 4, ch = depth / n;
  for (let k = 0; k < n; k++) {
    const y = -depth + k * ch, m = k % 2 ? BRICK : BRICK_DARK, wall = (a, b, z) => dock.add(box(b - a, ch, t, m, (a + b) / 2, y, z));
    const end = (a, b, x) => dock.add(box(t, ch, b - a, m, x, y, (a + b) / 2));
    wall(-l / 2, l / 2, zw + t / 2);
    wall(-l / 2, INLET.x0, ze - t / 2); wall(INLET.x1, l / 2, ze - t / 2);
    if (k < n - 1) end(zw + t, ze - t, -l / 2 + t / 2); else { end(zw + t, dz - 0.5, -l / 2 + t / 2); end(dz + 0.5, ze - t, -l / 2 + t / 2); }
    end(zw + t, dz - INLET.north / 2, l / 2 - t / 2); end(dz + INLET.north / 2, ze - t, l / 2 - t / 2);
  }
  dock.add(box(l, 0.3, w, SILT, 0, -depth - 0.3, dz), sheet(l - 2 * t - 0.2, w - 2 * t - 0.2, M.river, 0, -depth + 1.1, dz));
  // The sills of the inlets, which held water in the basin at low tide, and the brick piers of
  // the sluice, which a wooden gate closed.
  dock.add(box(INLET.x1 - INLET.x0, 1.5, 2.4, BRICK_DARK, ix, -depth, ze - 1.2), box(t, depth - INLET.sill, INLET.north, BRICK_DARK, l / 2 - t / 2, -depth, dz));
  for (const s of [-1, 1]) dock.add(box(3.2, 0.45, 1.5, BRICK, -l / 2 - 1.6, 0, dz + s * 1.25));
  f.add(dock);
  // The wharf along the dock's town side: a mud-brick platform 220 m long, with steps down to the
  // dock's edge, and the ramp from it up to the warehouse.
  f.add(box(220, 1.2, 9, MUD, 0, 0, zw - 4.5));
  for (const x of [-40, 20, 80]) f.add(at(steps(5, 1.2, 4, BRICK, 0.5), x, 0, zw).rotateY(Math.PI));
  f.add(at(ramp(7, zw - 9 - WARE.s / 2 + 0.5, 1.2, WARE.h, MUD), WARE.x + 6, 0, zw - 9));
  // The acropolis: a platform of mud brick with a facing of fired brick at its foot, and steps up
  // from the street on its north side.
  const A = ACRO, ax = (A.x0 + A.x1) / 2, az = (A.z0 + A.z1) / 2, aw = A.x1 - A.x0, ad = A.z1 - A.z0;
  f.add(box(aw, A.h, ad, MUD, ax, 0, az), box(aw + 1, 0.8, ad + 1, BRICK_DARK, ax, 0, az));
  f.add(at(steps(6, A.h, 10, BRICK, 0.5), A.x1, 0, STREET.z + 22).rotateY(Math.PI / 2));
  // The warehouse: a podium of mud brick 3.5 m high carrying 64 cubical blocks 3.6 m square with
  // passages 1.2 m wide between them, which let air under the timber store that stood on them.
  // The flood left twelve standing; the rest are worn down to stumps.
  const blocks = [], stumps = [], b0 = -(8 * 3.6 + 7 * 1.2) / 2 + 1.8;
  for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) {
    const x = WARE.x + b0 + i * 4.8, z = WARE.z + b0 + j * 4.8, stands = i >= 4 && j >= 1 && j <= 3;
    (stands ? blocks : stumps).push([x, WARE.h, z, 3.6, stands ? 1 + (i * 7 + j * 3) % 4 * 0.2 : 0.12 + (i * 5 + j * 3) % 4 * 0.07, 3.6, 0]);
  }
  f.add(box(WARE.s, WARE.h, WARE.s, MUD, WARE.x, 0, WARE.z), box(WARE.s + 1, 0.8, WARE.s + 1, BRICK_DARK, WARE.x, 0, WARE.z));
  f.add(inst(unitBox(), blocks, BRICK), inst(unitBox(), stumps, BRICK_DARK));
  // Houses of the acropolis: the ruler's quarter in the west of the platform, and the footings of
  // a public building at its east end, opposite the warehouse.
  f.add(inst(unitBox(), [...houses(A.x0 + 3, A.x1 - 20, A.z0 + 4, -22, A.h, R, 7), ...houses(A.x0 + 6, A.x1 - 22, 2, A.z1 - 4, A.h, R, 9, 0.4)], BRICK));
  // The lower town: blocks of houses and shops on their own low platforms of mud brick, either
  // side of the main street, and a poorer quarter in the west.
  const S = STREET, quarters = [[4, 150, S.z + S.w / 2, -30, 0.14], [4, 150, -134, S.z - S.w / 2, 0.14], [-104, -12, -172, -106, 0.45]], lower = [];
  for (const [x0, x1, z0, z1, lost] of quarters) {
    f.add(box(x1 - x0, 1.2, z1 - z0, MUD, (x0 + x1) / 2, 0, (z0 + z1) / 2));
    lower.push(...houses(x0 + 2, x1 - 2, z0 + 2, z1 - 2, 1.2, R, 8, lost).filter(([x, , z]) => Math.abs(x - BEAD[0]) > 12 || Math.abs(z - BEAD[1]) > 14));
  }
  f.add(inst(unitBox(), lower, BRICK));
  // The town wall of mud brick, thick, low and worn: along the south (with the entrance), the
  // west and the north; on the east the wharf closes the town.
  const tw = [], T = TOWN;
  const run = (x0, z0, x1, z1) => {
    const len = Math.hypot(x1 - x0, z1 - z0), k = Math.round(len / 5), ry = Math.atan2(x1 - x0, z1 - z0);
    for (let i = 0; i < k; i++) { const u = (i + 0.5) / k; if (R() < 0.08) continue; tw.push([x0 + (x1 - x0) * u, 0, z0 + (z1 - z0) * u, 11, 1 + R() * 1.8, len / k + 0.05, ry]); }
  };
  run(T.x0, T.z0, T.x0, T.gate - 5); run(T.x0, T.gate + 5, T.x0, T.z1); run(T.x0, T.z0, T.x1, T.z0); run(T.x1, T.z0, T.x1, T.z1);
  f.add(inst(unitBox(), tw, MUD));
  addDetails(f, site, g, { R });
  // From the north-east, along the dock to the warehouse and the acropolis behind it.
  return { group: g, focus: f, view: [0.4, 0.5, 1], zoom: 0.62 };
}

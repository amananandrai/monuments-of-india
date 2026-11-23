import * as THREE from 'three';
import { mat, mesh, box, cyl, lathe, at, rng, inst, unitBox, photo } from '../helpers.js';
import { iwan, arcadeSkin, cellRow } from '../parts/mughal.js';
import { carved, windowFrame, mergeByMaterial } from '../parts/components.js';
import { addDetails } from '../details/mahmud-gawan-madrasa.js';

// Bidar's red laterite and brick under an ochre wash, the paler dressed stone of the frames and
// basement, and the glazed tiles that once covered the front: blue, green, yellow and white.
export const STONE = photo(mat('#a8603f', 0.93), 'rubble');
export const DRESSED = mat('#bd8a66', 0.87);
export const BASE = photo(mat('#8f6a55', 0.92), 'blocks');
export const TILE_G = carved(mat('#3f8d76', 0.45), 'tiles');
export const TILE_B = carved(mat('#2c5aa6', 0.4), 'tiles');
export const TILE_Y = mat('#d8b24a', 0.45);
export const TILE_W = mat('#e9e4d4', 0.45);

// Mahmud Gawan's madrasa at Bidar (1472), a college in the manner of Khorasan: a rectangle about
// 62 m east to west by 55 m of three storeys of rooms round a court some 30 m square, on a high
// basement. A great arch (iwan) opens on the court in the middle of the north, west and south
// sides, each the mouth of a hall the full height of the building that ends in a semi-octagonal
// bay standing out of the outer wall under a dome. The east front had the entrance between two
// tall minarets faced in glazed tiles; in 1696 gunpowder stored in the building exploded and
// threw down the entrance, the south minaret and most of the front with the rooms behind it.
// What stands of the front today is its north end, a wall of three rows of openings under a broad
// tiled frieze, and beside it the north minaret, about 30 m high: an octagonal foot, a round shaft
// in three stages, the lowest faced in chevrons of coloured tile, and two balconies that swell out
// of the shaft in a curve without brackets.
// +z is east (the front); +x is north, where the minaret and the piece of the front stand.
// W × D is the building, C the court, H the wings' height, FH the front's, BH the basement's.
export const W = 55, D = 62, C = 30.5, H = 15, FH = 19, BH = 1.4, MINAR = 30.5;
// The piece of the front that stands: from x = FX0 to the north corner, FT thick.
export const FX0 = 12.3, FT = 4.5;

// A round dome of radius R on y = 0: a little over a hemisphere, drawn in at the foot.
export function roundDome(R, m, seg = 32) {
  const pts = [];
  for (let k = 0; k <= 12; k++) { const t = -0.3 + (k / 12) * (Math.PI / 2 + 0.3); pts.push([Math.max(0, R * Math.cos(t)), R * (Math.sin(t) + Math.sin(0.3))]); }
  return lathe(pts, m, seg);
}

// The minaret's radius at height y (of h): three stages, each a step narrower than the last.
const shaftR = (y, h, r) => (y < h * 0.62 ? r * (1 - 0.2 * (y / (h * 0.62))) : y < h * 0.86 ? r * 0.68 : r * 0.55);
// Bands of chevrons round the lowest stage, from y0 to y1: each band a zig-zag strip of tile lying
// just proud of the shaft, in turn green, yellow, white and blue.
function chevrons(h, r, y0, y1, bh) {
  const g = new THREE.Group(), n = 16, amp = bh * 1.6, cols = [TILE_G, TILE_Y, TILE_B, TILE_W], pos = cols.map(() => []);
  for (let j = 0, y = y0; y + bh + amp <= y1; j++, y += bh) {
    for (let k = 0; k < n; k++) {
      const a0 = (k / n) * Math.PI * 2, a1 = ((k + 1) / n) * Math.PI * 2, ya = y + (k % 2) * amp, yb = y + ((k + 1) % 2) * amp;
      const P = (a, yy) => { const rr = shaftR(yy, h, r) + 0.04; return [Math.sin(a) * rr, yy, Math.cos(a) * rr]; };
      pos[j % 4].push(...P(a0, ya), ...P(a1, yb), ...P(a1, yb + bh), ...P(a0, ya), ...P(a1, yb + bh), ...P(a0, ya + bh));
    }
  }
  cols.forEach((m, i) => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos[i], 3));
    geo.computeVertexNormals();
    g.add(mesh(geo, m));
  });
  return g;
}
function minaret(h, r) {
  const g = new THREE.Group(), y1 = h * 0.62, y2 = h * 0.86, y3 = h * 0.95;
  // The octagonal foot on its plinth, and the three stages of the round shaft.
  g.add(cyl(r * 1.75, r * 1.8, 0.9, BASE, 0, 0, 0, 8), cyl(r * 1.3, r * 1.45, 2.6, STONE, 0, 0.9, 0, 8), cyl(r * 1.4, r * 1.4, 0.3, DRESSED, 0, 3.3, 0, 8));
  g.add(cyl(shaftR(y1 - 0.01, h, r), r, y1, STONE, 0, 0, 0, 16), cyl(r * 0.66, r * 0.68, y2 - y1, STONE, 0, y1, 0, 16), cyl(r * 0.53, r * 0.55, y3 - y2, STONE, 0, y2, 0, 16));
  // The chevrons of the lowest stage, between plain bands; tile bands on the upper stages.
  g.add(chevrons(h, r, 5, y1 - 1.6, 0.62));
  for (const [y, m] of [[4.5, TILE_W], [y1 - 1.5, TILE_Y]]) g.add(cyl(shaftR(y, h, r) + 0.05, shaftR(y, h, r) + 0.05, 0.3, m, 0, y, 0, 16));
  g.add(cyl(r * 0.69, r * 0.7, 1.5, TILE_B, 0, y1 + 3.2, 0, 16), cyl(r * 0.69, r * 0.7, 0.9, TILE_G, 0, y1 + 5, 0, 16), cyl(r * 0.56, r * 0.57, 0.8, TILE_B, 0, y2 + 1.7, 0, 16));
  // The two balconies, swelling out of the shaft, each under a low parapet.
  for (const [y, rr] of [[y1 - 1.3, r * 0.8], [y2 - 1.1, r * 0.68]]) g.add(at(lathe([[rr, 0], [rr * 1.06, 0.5], [rr * 1.22, 0.95], [rr * 1.42, 1.3], [rr * 1.5, 1.45], [rr * 1.5, 2.3], [rr * 1.38, 2.3], [rr * 1.38, 1.5]], DRESSED, 24), 0, y, 0));
  // The cap: a small dome with its finial.
  g.add(cyl(r * 0.6, r * 0.6, 0.25, DRESSED, 0, y3, 0, 16), at(roundDome(r * 0.55, STONE, 16), 0, y3 + 0.25, 0), cyl(0.05, 0.12, 0.9, DRESSED, 0, h - 0.2, 0, 6));
  return g;
}

export function buildMahmudGawanMadrasa() {
  const g = new THREE.Group(), f = new THREE.Group(), d = new THREE.Group(), R = rng(3);
  g.add(f);
  const wz = (D - C) / 2, wx = (W - C) / 2;
  // The high basement, and the two terraces before the front.
  f.add(box(W + 5, BH, D + 5, BASE), box(W + 5.3, 0.2, D + 5.3, DRESSED, 0, BH - 0.2, 0));
  f.add(box(W + 5, BH * 0.62, 10, BASE, 0, 0, D / 2 + 7.5), box(W + 16, BH * 0.3, 12, BASE, 0, 0, D / 2 + 18.5));
  // The west, north and south wings stand; of the east wing only its north end.
  d.add(box(W, H, wz, STONE, 0, 0, -(C + wz) / 2), box(W + 0.3, 0.45, wz + 0.3, DRESSED, 0, H, -(C + wz) / 2));
  for (const s of [-1, 1]) d.add(box(wx, H, C, STONE, s * (C + wx) / 2, 0, 0), box(wx + 0.3, 0.45, C + 0.02, DRESSED, s * (C + wx) / 2, H, 0));
  d.add(box(W / 2 - FX0, FH, FT, STONE, (W / 2 + FX0) / 2, 0, D / 2 - FT / 2), box(W / 2 - FX0 + 0.2, 0.4, FT + 0.2, DRESSED, (W / 2 + FX0) / 2, FH, D / 2 - FT / 2));
  // Broken masonry: the rooms behind the standing front, the south wing's east end, and the
  // stumps of the rest of the east wing, each a field of blocks with a ragged top.
  const ragged = (x0, x1, z0, z1, top) => {
    const out = [], nx = Math.max(1, Math.round((x1 - x0) / 3)), nz = Math.max(1, Math.round((z1 - z0) / 3));
    for (let i = 0; i < nx; i++) for (let k = 0; k < nz; k++) {
      const x = x0 + (i + 0.5) * (x1 - x0) / nx, z = z0 + (k + 0.5) * (z1 - z0) / nz, h = top(x, z) * (0.75 + 0.25 * R());
      if (h > 0.3) out.push([x, 0, z, (x1 - x0) / nx + 0.05, h, (z1 - z0) / nz + 0.05, 0]);
    }
    return out;
  };
  const fall = (a, b, v) => Math.max(0, Math.min(1, (v - a) / (b - a)));
  d.add(inst(unitBox(), [
    ...ragged(C / 2, W / 2, C / 2, D / 2 - FT, (x, z) => H * (0.55 + 0.4 * fall(C / 2, W / 2, x))),
    ...ragged(-W / 2, -C / 2, C / 2, D / 2, (x, z) => H * (1 - fall(C / 2, D / 2 - 3, z)) + 1.2),
    ...ragged(-C / 2, FX0, D / 2 - 6, D / 2, (x) => 0.6 + 2.2 * Math.max(fall(FX0 - 9, FX0, x), fall(-C / 2 + 6, -C / 2, x))),
  ], STONE));
  // The bands at each floor round the standing wings.
  for (const y of [5, 10]) d.add(box(W + 0.24, 0.3, wz + 0.24, DRESSED, 0, y, -(C + wz) / 2), box(W + 0.24, 0.3, C + 0.02, DRESSED, 0, y, 0));
  // Outer faces: three storeys of small arched windows in the rooms' walls.
  const row = (len, cx, cz, ry, skip = () => false) => {
    const n = Math.floor(len / 4.2);
    for (let k = 0; k < n; k++) for (const y of [1.4, 6.2, 11]) {
      const l = -len / 2 + (k + 0.5) * (len / n);
      if (skip(l, y)) continue;
      const w = at(windowFrame(1.3, 2.4, DRESSED, { frame: 0.22 }), 0, y, 0);
      w.position.x = cx + Math.cos(ry) * l + Math.sin(ry) * 0.03; w.position.z = cz - Math.sin(ry) * l + Math.cos(ry) * 0.03; w.rotation.y = ry;
      d.add(w);
    }
  };
  const bay = (l) => Math.abs(l) < 6.6;
  row(W, 0, -D / 2, Math.PI, bay);
  row(D - wz - 0.5, W / 2, -(wz + 0.5) / 2, Math.PI / 2, (l) => bay(l - (wz + 0.5) / 2));
  row(D - wz - 0.5, -W / 2, -(wz + 0.5) / 2, -Math.PI / 2, (l) => bay(l + (wz + 0.5) / 2));
  // The court: three storeys of arched rooms on the three standing sides, a great iwan in the
  // middle of each.
  const court = [[0, -C / 2, 0], [-C / 2, 0, Math.PI / 2], [C / 2, 0, -Math.PI / 2]];
  for (const [x, z, ry] of court) {
    for (const s of [-1, 1]) {
      const l = (C - 10) / 2, part = new THREE.Group();
      for (const [y, h] of [[0, 4.9], [5, 4.9], [10, 4.9]]) part.add(at(arcadeSkin(l, h, cellRow(3, l / 3, 0.2, 2.1, 3.5), 0.6, STONE, { trim: DRESSED, fill: 'room' }), 0, y, 0));
      part.position.set(x + Math.cos(ry) * s * (5 + l / 2), 0, z - Math.sin(ry) * s * (5 + l / 2));
      part.rotation.y = ry;
      d.add(part);
    }
    const iw = at(iwan(7, 12.4, { m: STONE, trim: DRESSED, shade: DRESSED, depth: 2, frame: 1.4, top: 1.6, fill: 'door', band: true }), x, 0, z);
    iw.rotation.y = ry;
    d.add(iw);
  }
  // The court's floor.
  d.add(box(C, 0.2, C, DRESSED, 0, 0, 0));
  // The three halls' bays: half an octagon standing out of the outer wall and rising above it as
  // a drum, under a round dome.
  for (const [x, z] of [[0, -D / 2 - 1.2], [W / 2 + 1.2, 0], [-W / 2 - 1.2, 0]]) {
    const t = mesh(new THREE.CylinderGeometry(5.5, 6, H + 3.6, 8).rotateY(Math.PI / 8), STONE, x, (H + 3.6) / 2, z);
    d.add(t, mesh(new THREE.CylinderGeometry(5.75, 5.75, 0.4, 8).rotateY(Math.PI / 8), DRESSED, x, H + 3.6, z), mesh(new THREE.CylinderGeometry(5.9, 5.9, 0.3, 8).rotateY(Math.PI / 8), DRESSED, x, H + 0.2, z));
    d.add(at(roundDome(4.9, STONE), x, H + 3.8, z), cyl(0.06, 0.16, 1.1, DRESSED, x, H + 3.8 + 4.9 * 1.28, z, 6));
  }
  // The north minaret, at the corner of the front.
  d.add(at(minaret(MINAR, 2.25), W / 2 - 1.6, 0, D / 2 + 0.6));
  f.add(at(mergeByMaterial(d), 0, BH, 0));
  addDetails(f, g, { W, D, H });
  // From the south-east, as the ruin is always photographed: the open court where the front fell,
  // the piece of the front that stands, and the minaret beside it.
  return { group: g, focus: f, view: [-0.6, 0.3, 1], zoom: 0.8 };
}

import * as THREE from 'three';
import { M, mat, box, cyl, lathe, at, rng, inst, unitBox, photo, hemi } from '../helpers.js';
import { iwan, arcadeSkin, cellRow } from '../parts/mughal.js';
import { carved, windowFrame, mergeByMaterial } from '../parts/components.js';
import { addDetails } from '../details/mahmud-gawan-madrasa.js';

// Bidar's dark laterite-and-trap masonry, the lighter dressed stone of the frames, and the glazed
// tiles that once covered the front: green, yellow and white in chevrons and panels.
export const STONE = photo(mat('#7d6a58', 0.93), 'rubble');
export const DRESSED = mat('#a39380', 0.87);
export const TILE_G = carved(mat('#3f7d62', 0.45), 'tiles');
export const TILE_Y = mat('#d8b24a', 0.45);
export const TILE_W = mat('#e9e4d4', 0.45);

// Mahmud Gawan's madrasa at Bidar (1472), a college in the manner of Khorasan: a rectangle about
// 62 x 55 m of three storeys of rooms round a court, with a great arch (iwan) in the middle of each
// side of the court. Its east front had a tall minaret at each end, faced in glazed tiles, and a
// dome behind each; in 1696 gunpowder stored in it exploded and brought down the south half of the
// front, its minaret and its dome. The north minaret, about 30 m high, still stands.
// +z is east (the front); +x is south, where the front is broken.
export const W = 62, D = 55, CW = 32, CD = 30, H = 13.5;
const minaretGeo = (h, r) => {
  const g = new THREE.Group(), bands = 9, sh = h * 0.82;
  // The shaft, banded in tiles: green chevrons between narrow yellow and white rings.
  for (let k = 0; k < bands; k++) {
    const y0 = (k * sh) / bands, r0 = r * (1 - 0.12 * (k / bands));
    g.add(cyl(r0 * 0.99, r0, sh / bands - 0.25, k % 3 === 1 ? TILE_G : STONE, 0, y0, 0, 20), cyl(r0 * 1.01, r0 * 1.01, 0.25, k % 2 ? TILE_Y : TILE_W, 0, y0 + sh / bands - 0.25, 0, 20));
  }
  // Two balconies, the upper storey and a small cap.
  for (const t of [0.42, 0.72]) g.add(cyl(r * 1.35, r * 0.95, 0.7, DRESSED, 0, sh * t, 0, 20));
  g.add(cyl(r * 0.7, r * 0.75, h * 0.12, STONE, 0, sh, 0, 16), at(hemi(r * 0.75, DRESSED, 16), 0, sh + h * 0.12, 0));
  return g;
};

export function buildMahmudGawanMadrasa() {
  const g = new THREE.Group(), f = new THREE.Group(), d = new THREE.Group(), R = rng(3);
  g.add(f);
  const wz = (D - CD) / 2, wx = (W - CW) / 2;
  // The four wings round the court; the south half of the front (+x, +z) is broken down.
  d.add(box(W, H, wz, STONE, 0, 0, -(CD + wz) / 2));
  for (const s of [-1, 1]) d.add(box(wx, H, CD, STONE, s * (CW + wx) / 2, 0, 0));
  d.add(box(W / 2 + 4, H, wz, STONE, -(W / 4 - 2), 0, (CD + wz) / 2));
  const broken = [];
  for (let k = 0; k < 9; k++) broken.push([3 + k * 3.1, 0, (CD + wz) / 2 + (R() - 0.5) * 2, 3.2, 2 + R() * 6, wz * (0.4 + 0.5 * R()), 0]);
  d.add(inst(unitBox(), broken, STONE));
  // The bands at each floor and the parapet.
  for (const y of [4.6, 9.1]) d.add(box(W + 0.3, 0.3, D + 0.3, DRESSED, 0, y, 0));
  // Outer faces: three storeys of arched windows; the front's north half faced in tile panels
  // round the gateway.
  const row = (len, cx, cz, ry, skip = () => false) => {
    const n = Math.floor(len / 4.2);
    for (let k = 0; k < n; k++) for (const y of [1.2, 5.6, 10]) {
      const l = -len / 2 + (k + 0.5) * (len / n);
      if (skip(l, y)) continue;
      const w = at(windowFrame(1.6, 2.6, DRESSED, { frame: 0.25 }), 0, y, 0);
      w.position.x = cx + Math.cos(ry) * l; w.position.z = cz - Math.sin(ry) * l; w.rotation.y = ry;
      d.add(w);
    }
  };
  row(W, 0, -D / 2, Math.PI);
  row(D, -W / 2, 0, -Math.PI / 2);
  row(D, W / 2, 0, Math.PI / 2, (l) => l < -D / 2 + wz + 1);
  // The gateway in the middle of the front, under a tall frame, with tile panels either side.
  d.add(box(14, H + 3, 1.2, STONE, -2, 0, D / 2 + 0.6), at(iwan(6, 11, { m: STONE, trim: DRESSED, shade: DRESSED, depth: 1.6, frame: 1.6, top: 1.8, fill: 'door' }), -2, 0, D / 2 + 1.2));
  for (const [x, w] of [[-14, 9], [-25, 8]]) d.add(box(w, 7, 0.08, TILE_G, x, 4.4, D / 2 + 0.04), box(w, 0.6, 0.1, TILE_Y, x, 11.2, D / 2 + 0.05), box(w, 0.4, 0.1, TILE_W, x, 3.7, D / 2 + 0.05));
  // The court: three storeys of arched rooms on every side, a great iwan in the middle of each.
  const court = [[0, -CD / 2, 0, CW], [0, CD / 2, Math.PI, CW], [-CW / 2, 0, Math.PI / 2, CD], [CW / 2, 0, -Math.PI / 2, CD]];
  for (const [x, z, ry, len] of court) {
    for (const s of [-1, 1]) {
      const l = (len - 10) / 2, part = new THREE.Group();
      for (const [y, h] of [[0, 4.4], [4.6, 4.3], [9.1, 4.2]]) part.add(at(arcadeSkin(l, h, cellRow(Math.round(l / 3.2), l / Math.round(l / 3.2), 0.2, 2, 3.2), 0.6, STONE, { trim: DRESSED, fill: 'room' }), 0, y, 0));
      part.position.set(x + Math.cos(ry) * s * (5 + l / 2), 0, z - Math.sin(ry) * s * (5 + l / 2));
      part.rotation.y = ry;
      d.add(part);
    }
    const iw = at(iwan(7, 12, { m: STONE, trim: DRESSED, shade: DRESSED, depth: 2, frame: 1.4, top: 1, fill: 'door', band: true }), x, 0, z);
    iw.rotation.y = ry;
    d.add(iw);
  }
  // The court's floor, a little below the rooms.
  d.add(box(CW, 0.2, CD, DRESSED, 0, 0, 0));
  // The north minaret and its dome behind it; the stump of the south one.
  d.add(at(minaretGeo(30, 2.6), -W / 2 + 2.6, 0, D / 2 - 2.6), cyl(2.6, 2.9, 5, STONE, W / 2 - 2.6, 0, D / 2 - 2.6, 20));
  d.add(cyl(5.4, 5.6, 2, STONE, -W / 2 + 10, H, D / 2 - 7.5, 24));
  const dome = [];
  for (let k = 0; k <= 14; k++) { const t = (k / 14) * Math.PI / 2; dome.push([5.4 * Math.cos(t), 6.4 * Math.sin(t)]); }
  d.add(at(lathe(dome, STONE, 32), -W / 2 + 10, H + 2, D / 2 - 7.5));
  f.add(mergeByMaterial(d));
  addDetails(f, g, { W, D, H });
  // From the north-east: the standing minaret, the tiled front and the broken south half.
  return { group: g, focus: f, view: [-0.55, 0.42, 1], zoom: 0.9 };
}

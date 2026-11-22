import * as THREE from 'three';
import { M, mat, box, cyl, at, onFace, FACES, finial, onionDome, ribbed, chhatri } from '../helpers.js';
import { arcadeSkin, cellRow, iwan } from '../parts/mughal.js';
import { addDetails } from '../details/jahangir-mahal-orchha.js';

// Orchha's stone, plastered and weathered to a warm buff with dark streaks; a darker stone for
// the mouldings, and the turquoise and blue glazed tiles that once banded the walls.
export const STONE = { wall: mat('#b89c73', 0.9), shade: mat('#8f7758', 0.92), light: mat('#cdb58d', 0.88), tile: mat('#3f8a91', 0.5), tileBlue: mat('#2f5d8a', 0.5) };

// Jahangir Mahal, Orchha, early 17th century: built by Vir Singh Deo for the visit of the emperor
// Jahangir. From photographs: a square palace, here 66 m a side, round a square courtyard, rising
// in four storeys of galleries; a round tower at each corner and a square pavilion in the middle of
// each side rise above the roof, each under a large fluted dome, the eight domes linked by a
// balustrade with small chhatris between them. The outer walls are plain below and open above in
// rows of balconies under deep eaves. The gateway on the east (+z) projects from the wall, climbed
// by a flight of steps between two stone elephants.
export const W = 66, C = 34, H = 19, P = 2.4;
export function buildJahangirMahal() {
  const S = STONE, g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  // The plinth, and the four ranges round the courtyard.
  f.add(box(W + 4, P, W + 4, S.shade), box(W + 4.4, 0.3, W + 4.4, S.light, 0, P - 0.3, 0));
  const dr = (W - C) / 2, cd = 1.6;
  for (const a of FACES) f.add(onFace(box(W - 2 * cd, H, dr - 2 * cd, S.wall, 0, P, 0), a, C / 2 + dr / 2));
  // The outer faces: plain below, then two storeys of arched openings (a range of windows and a
  // range of open galleries), with a band of tiles between.
  const outer = [];
  for (const [n, pitch, sill, aw, ah, fill] of [[9, 5.6, 6.2, 2.2, 3.4, 'jali'], [9, 5.6, 11.4, 3, 4.6, 'room']]) outer.push(...cellRow(n, pitch, sill, aw, ah).map((c) => [...c, fill]));
  for (const a of FACES) {
    const skip = a === 0 ? outer.filter(([x]) => Math.abs(x) > 6) : outer;
    f.add(onFace(at(arcadeSkin(W, H, skip, cd, S.wall, { trim: S.light }), 0, P, 0), a, W / 2 - cd));
  }
  // The courtyard faces: three storeys of arcades.
  const inner = [];
  for (const [sill, ah] of [[0, 4.4], [6.4, 4.2], [12.4, 4]]) inner.push(...cellRow(7, 4.4, sill, 3, ah).map((c) => [...c, 'room']));
  for (const a of FACES) f.add(onFace(at(arcadeSkin(C, H, inner, cd, S.wall, { trim: S.light }), 0, P, 0), a + Math.PI, -(C / 2 + cd)));
  f.add(box(C - 0.2, 0.2, C - 0.2, S.light, 0, P - 0.05, 0));
  // Corner towers: round, rising 4.5 m above the roof, each under a fluted dome.
  const top = P + H, dome = (r, x, z, y) => [at(ribbed(onionDome(r, S.light), 20, 0.05), x, y, z), at(finial(r * 0.9, M.gold), x, y + r * 1.85, z)];
  for (const x of [-1, 1]) for (const z of [-1, 1]) {
    const tx = x * (W / 2 - 1), tz = z * (W / 2 - 1);
    f.add(cyl(5, 5.4, H + 4.5, S.wall, tx, P, tz, 16), cyl(5.6, 5.6, 0.5, S.shade, tx, top + 4.5, tz, 16), cyl(4.1, 4.1, 1.4, S.wall, tx, top + 5, tz, 16));
    f.add(...dome(4.3, tx, tz, top + 6.4));
  }
  // The pavilions in the middle of each side, square, under the four other great domes.
  for (const a of FACES) {
    const p = onFace(at(new THREE.Group(), 0, top, 0), a, W / 2 - 6);
    p.add(box(10, 4.6, 10, S.wall), box(11, 0.5, 11, S.shade, 0, 4.6, 0));
    for (const b of FACES) p.add(onFace(arcadeSkin(10, 4.6, cellRow(3, 3, 0, 2, 3.4), 0.5, S.wall, { trim: S.light, fill: 'room' }), b, 5));
    p.add(cyl(4.1, 4.1, 1.4, S.wall, 0, 5.1, 0, 16), ...dome(4.3, 0, 0, 6.5));
    f.add(p);
  }
  // Small chhatris on the roof between the domes.
  for (const a of FACES) for (const lat of [-16, 16]) f.add(onFace(at(chhatri(1.6, 4.6, S.light), 0, top, 0), a, W / 2 - 3, lat));
  // The gateway: a tall block projecting from the east face, its arch framed in light stone.
  f.add(box(16, H + 3, 6, S.wall, 0, P, W / 2 + 3), box(16.6, 0.5, 6.6, S.shade, 0, P + H + 3, W / 2 + 3));
  f.add(at(iwan(5.6, 10, { m: S.wall, trim: S.light, shade: S.shade, depth: 1.6, frame: 2.2, top: 2, cells: true }), 0, P, W / 2 + 6));
  for (const s of [-1, 1]) f.add(at(chhatri(1.5, 4.4, S.light), s * 6.2, P + H + 3.5, W / 2 + 3));
  addDetails(f, g, { W, C, H, P, top, dr, cd });
  // From the north-east, the gateway and two faces of the palace in view.
  return { group: g, focus: f, view: [0.85, 0.36, 1.2], zoom: 0.95 };
}

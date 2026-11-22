import * as THREE from 'three';
import { mat, box, cyl, lathe, at, onFace, inst, unitBox, photo } from '../helpers.js';
import { arcadeSkin, cellRow } from '../parts/mughal.js';
import { classicalDoor, porch, pediment } from '../parts/colonial.js';
import { grandStair } from '../parts/doorways.js';
import { addDetails } from '../details/hazarduari-palace.js';

// Hazarduari's lime plaster over brick, washed a pale ochre, and the white of its columns,
// cornices and pilasters.
export const WASH = photo(mat('#e4cf9c', 0.86), 'plaster');
export const WHITE = mat('#f2eee4', 0.8);

// The palace's measures, shared with js/details/hazarduari-palace.js. It is about 130 m long and
// 61 m deep, three storeys (FL each) high to the cornice at H. Its front faces north, over the
// lawn towards the Nizamat Imambara; here it faces +z, at z = D / 2. The portico (PW wide, PD
// deep) stands on a podium a storey high, reached by a broad flight of 37 steps whose bottom step
// is 33 m long; the Durbar Hall behind it is lit by a dome.
export const P = { W: 130, D: 50, FL: 6.2, H: 18.6, PW: 36, PD: 13, SKIN: 1.4 };

// Round-arched windows closed by green shutters, three storeys of them, every `pitch` along a
// face len long, leaving out any centred in `skip`.
export function windowCells(len, pitch, skip = []) {
  const n = Math.floor(len / pitch), out = [];
  for (let fl = 0; fl < 3; fl++) out.push(...cellRow(n, len / n, fl * P.FL + 1.1, 2.1, 4.2, skip).map((c) => [...c, 'shutters']));
  return out;
}

export function buildHazarduari() {
  const g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  const { W, D, FL, H, PW, PD, SKIN: d } = P, fz = D / 2;
  // The block, its four faces cut into storeys of shuttered windows.
  f.add(box(W - 2 * d, H, D - 2 * d, WASH));
  f.add(at(arcadeSkin(W, H, windowCells(W, 4.6, [[-PW / 2 - 0.5, PW / 2 + 0.5]]), d, WASH, { trim: WHITE, pointed: false }), 0, 0, fz - d));
  f.add(at(arcadeSkin(W, H, windowCells(W, 4.6), d, WASH, { trim: WHITE, pointed: false }), 0, 0, -fz + d).rotateY(Math.PI));
  for (const s of [-1, 1]) f.add(at(arcadeSkin(D - 2 * d, H, windowCells(D - 2 * d, 4.6), d, WASH, { trim: WHITE, pointed: false }), s * (W / 2 - d), 0, 0).rotateY(s * Math.PI / 2));
  // The bands between the storeys, the cornice and a parapet over it.
  for (const y of [FL - 0.3, 2 * FL - 0.3]) f.add(box(W + 0.5, 0.5, D + 0.5, WHITE, 0, y, 0));
  f.add(box(W + 1.2, 0.8, D + 1.2, WHITE, 0, H, 0), box(W + 0.4, 1.2, D + 0.4, WASH, 0, H + 0.8, 0), box(W + 0.7, 0.25, D + 0.7, WHITE, 0, H + 2, 0));
  // Pilasters every three bays, and the end pavilions standing forward of the front.
  const pil = [];
  for (let k = 0; k <= 9; k++) { const x = -W / 2 + k * (W / 9); if (Math.abs(x) > PW / 2) pil.push([x, 0, fz + 0.15, 1.1, H, 0.3]); }
  for (const s of [-1, 1]) {
    const px = s * (W / 2 - 7.5);
    f.add(box(15, H + 2.2, 2.2, WASH, px, 0, fz + 1.1), box(15.8, 0.8, 3, WHITE, px, H, fz + 1.1));
    f.add(at(pediment(15.8, 2.8, 3, WASH, WHITE), px, H + 2.2, fz - 0.4));
    for (const ex of [-7, 7]) pil.push([px + ex, 0, fz + 2.3, 1.2, H, 0.3]);
    for (let fl = 0; fl < 3; fl++) f.add(at(classicalDoor(2.2, 4.2, { m: WASH, trim: WHITE, fill: 'glass', top: fl === 1 ? 'pediment' : 'cornice', depth: 0.3, frame: 0.35 }), px, fl * FL + 1.1, fz + 2.2));
  }
  f.add(inst(unitBox(), pil, WHITE));
  // The podium a storey high under the portico, the flight of steps down from it, and the portico:
  // eight tall columns through the two upper storeys carrying a pediment.
  f.add(box(PW + 2, FL, PD, WASH, 0, 0, fz + PD / 2), box(PW + 2.4, 0.4, PD + 0.4, WHITE, 0, FL - 0.4, fz + PD / 2));
  for (const x of [-PW / 2 + 3, -6, 6, PW / 2 - 3]) f.add(onFace(classicalDoor(3, 4.4, { m: WASH, trim: WHITE, top: null, fill: 'room', depth: 0.3 }), 0, fz + PD, x));
  const stair = grandStair(FL, 33, WHITE, WASH, { n: 37, tread: 0.34, cheek: 0.9 });
  f.add(at(stair, 0, 0, fz + PD));
  const door = classicalDoor(3.6, 6.4, { m: WASH, trim: WHITE, depth: 0.5, frame: 0.6, top: 'cornice' });
  f.add(at(porch(PW, PD - 0.6, H - FL + 1.2, { m: WASH, trim: WHITE, cols: 8, r: 0.78, top: 'pediment', door, side: false }), 0, FL, fz));
  for (const x of [-11, 11]) f.add(at(classicalDoor(2.6, 5, { m: WASH, trim: WHITE, depth: 0.35, top: 'cornice' }), x, FL, fz + 0.02));
  // The dome over the Durbar Hall: a drum ringed by windows, a white dome and a finial.
  const dz = 2;
  f.add(cyl(7, 7, 3.2, WASH, 0, H + 2.2, dz, 36), cyl(7.5, 7.5, 0.6, WHITE, 0, H + 5.4, dz, 36));
  for (let k = 0; k < 12; k++) {
    const a = (k / 12) * Math.PI * 2;
    f.add(at(box(1, 2, 0.2, WHITE), Math.sin(a) * 7.02, H + 2.8, dz + Math.cos(a) * 7.02).rotateY(a));
  }
  f.add(at(lathe([[6.9, 0], [6.7, 1.8], [5.8, 3.8], [4, 5.4], [1.8, 6.4], [0, 6.6]], WHITE, 40), 0, H + 6, dz));
  f.add(cyl(0.9, 1.1, 1.4, WHITE, 0, H + 12.5, dz, 12), cyl(0, 0.5, 1.8, WHITE, 0, H + 13.9, dz, 8));
  addDetails(f, g);
  // From the north-east, over the lawn, the great stair in front.
  return { group: g, focus: f, view: [0.65, 0.26, 1.15], zoom: 0.9 };
}

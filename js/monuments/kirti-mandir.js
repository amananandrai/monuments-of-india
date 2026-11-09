import * as THREE from 'three';
import { M, mat, box, at, shikhara, nagaraProfile, hemi, chhatri, finial, surface } from '../helpers.js';
import { arcadeSkin } from '../details/mughal.js';
import { steps } from '../details/doorways.js';
import { addDetails } from '../details/kirti-mandir.js';

const CREAM = mat('#ecd9bd', 0.85);
const SHADE = mat('#c9ad87', 0.9);

const WALL = surface(mat('#eae2c6', 0.9), 'none'), BAND = surface(mat('#c9d6d0', 0.85), 'none'), WOOD = mat('#5a3a24', 0.8), WOOD_LIGHT = mat('#7b5434', 0.8), DARK = mat('#2a211b', 0.8);

// The three-storey haveli where Gandhi was born: whitewashed walls with pale painted bands at each
// floor, a front of dark timber (door frames, shuttered windows, posts), a carved wooden balcony
// running across the first floor on brackets, a smaller one above, and a flat roof with a parapet.
// 16 wide, 13 deep, its front at z = 6.5.
function haveli() {
  const g = new THREE.Group(), W = 16, D = 13, fl = [0, 3.8, 7.4], top = 10.8, zf = D / 2;
  g.add(box(W, top, D, WALL), box(W + 0.6, 0.7, D + 0.6, BAND, 0, top), box(W + 0.4, 0.9, 0.4, WALL, 0, top + 0.7, zf + 0.1));
  for (const y of fl.slice(1)) g.add(box(W + 0.3, 0.35, D + 0.3, BAND, 0, y - 0.2));
  // Ground floor: the carved door in its heavy frame, and shuttered windows either side.
  g.add(box(2.4, 3.1, 0.3, WOOD, 0, 0, zf + 0.15), box(1.7, 2.7, 0.1, DARK, 0, 0.1, zf + 0.32), box(2.9, 0.4, 0.45, WOOD_LIGHT, 0, 3.1, zf + 0.2));
  for (const x of [-5.2, -2.8, 2.8, 5.2]) g.add(box(1.3, 1.9, 0.25, WOOD, x, 0.9, zf + 0.12), box(1.0, 1.6, 0.1, DARK, x, 1.05, zf + 0.27));
  // Upper floors: a row of tall shuttered windows with timber frames behind each balcony.
  for (const [y, n] of [[fl[1], 5], [fl[2], 5]]) for (let k = 0; k < n; k++) {
    const x = -W / 2 + (k + 0.5) * (W / n);
    g.add(box(1.5, 2.5, 0.25, WOOD, x, y + 0.3, zf + 0.12), box(1.15, 2.2, 0.1, DARK, x, y + 0.45, zf + 0.27));
  }
  // The balconies: a floor on carved brackets, turned balusters between a rail and a skirting, and
  // posts carrying a small eave on the first.
  for (const [y, len, eave] of [[fl[1], W - 1, true], [fl[2], W * 0.55, false]]) {
    g.add(box(len, 0.25, 1.4, WOOD_LIGHT, 0, y - 0.05, zf + 0.7));
    for (let x = -len / 2 + 0.5; x <= len / 2 - 0.4; x += 1.1) g.add(box(0.22, 0.6, 1.1, WOOD, x, y - 0.65, zf + 0.55));
    for (let x = -len / 2 + 0.2; x <= len / 2 - 0.1; x += 0.32) g.add(box(0.08, 0.85, 0.08, WOOD, x, y + 0.2, zf + 1.35));
    g.add(box(len, 0.12, 0.2, WOOD_LIGHT, 0, y + 1.05, zf + 1.35), box(len, 0.2, 0.2, WOOD_LIGHT, 0, y + 0.2, zf + 1.35));
    if (eave) {
      for (let x = -len / 2 + 0.2; x <= len / 2; x += len / 4) g.add(box(0.2, 2.9, 0.2, WOOD, x, y + 0.2, zf + 1.35));
      g.add(box(len + 0.6, 0.15, 1.9, WOOD_LIGHT, 0, y + 3.1, zf + 0.85));
    }
  }
  return g;
}

// A memorial tower 79 feet (24 m) tall, one foot for each year of Gandhi's life.
export function buildKirtiMandir() {
  const g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  g.add(box(140, 0.2, 120, M.path), box(60, 0.15, 30, M.grass, 0, 0, 40));
  // The memorial hall, with domes and kiosks drawing on temple, mosque and church
  // Its front an arcade of seven pointed arches 1.4 m deep, the middle one the door
  const cells = [];
  for (let k = -3; k <= 3; k++) cells.push([k * 4.8, 0.6, 3, 6, k ? 'room' : 'door']);
  f.add(box(40, 1, 26, SHADE), box(36, 9, 20.6, CREAM, 0, 1, -0.7), box(37, 0.8, 23, SHADE, 0, 10));
  f.add(at(arcadeSkin(36, 9, cells, 1.4, CREAM, { trim: SHADE }), 0, 1, 9.6), at(steps(8, 1, 3, SHADE, 0.4), 0, 0, 13));
  for (const x of [-14, 14]) f.add(at(hemi(3.2, CREAM, 20), x, 10.8, 0), at(finial(2), x, 14, 0));
  for (const x of [-8, 8]) f.add(at(chhatri(1.8, 5, CREAM), x, 10.8, 7));
  // The central tower
  f.add(box(9, 6, 9, CREAM, 0, 10.8, -2), at(shikhara(8, 5, CREAM, nagaraProfile, 10, M.gold, 0.6), 0, 16.8, -2));
  // Gandhi's birthplace house next door, the photograph: see haveli().
  f.add(at(haveli(), -31, 0, -1));
  addDetails(f, g);
  return { group: g, focus: f, view: [-0.45, 0.3, 1.25] };
}

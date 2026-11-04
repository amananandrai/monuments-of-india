import * as THREE from 'three';
import { M, mat, box, at, shikhara, nagaraProfile, hemi, chhatri, finial } from '../helpers.js';
import { arcadeSkin } from '../details/mughal.js';
import { steps } from '../details/doorways.js';
import { addDetails } from '../details/kirti-mandir.js';

const CREAM = mat('#ecd9bd', 0.85);
const SHADE = mat('#c9ad87', 0.9);

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
  f.add(box(9, 6, 9, CREAM, 0, 10.8, -2), at(shikhara(8, 7, CREAM, nagaraProfile, 10), 0, 16.8, -2));
  // Gandhi's birthplace house next door
  f.add(box(16, 8, 14, mat('#e6dccb', 0.9), -32, 0, -4), box(16.6, 0.6, 14.6, mat('#9c6b4a', 0.85), -32, 8, -4));
  addDetails(f, g);
  return { group: g, focus: f, view: [0.55, 0.3, 1.25] };
}

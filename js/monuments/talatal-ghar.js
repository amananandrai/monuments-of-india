import * as THREE from 'three';
import { mat, box, at, onFace, surface } from '../helpers.js';
import { arcadeSkin, cellRow } from '../parts/mughal.js';
import { banglaRoof, mergeByMaterial } from '../parts/components.js';
import { addDetails } from '../details/talatal-ghar.js';

// Talatal Ghar's thin baked bricks, laid in a mortar of lime and rice paste, weathered a dull red
// and stained dark; its plaster has long gone.
export const BRICK = surface(mat('#a65a46', 0.92), 'terracotta');
export const BRICK_DARK = surface(mat('#86473a', 0.94), 'terracotta');
export const TRIM = mat('#c99a82', 0.9);

// The palace's measures, shared with js/details/talatal-ghar.js: its four storeys above ground,
// each set back from the one below as a terrace, [w, d, y, h] (x along its length, which runs
// east and west). The three storeys below ground are not shown.
export const T = {
  storeys: [[96, 42, 0.8, 4.4], [70, 30, 5.6, 4], [42, 20, 10, 3.8], [14, 10, 14.2, 3.6]],
  SKIN: 0.9,
};

// One storey: a brick core with a face of arched rooms on every side, a cornice over it, and the
// openings `pitch` apart.
function storey(w, d, y, h, pitch, { skip = [] } = {}) {
  const g = new THREE.Group(), s = T.SKIN, aw = Math.min(2.2, pitch * 0.62), ah = h - 1.2;
  g.add(box(w - 2 * s, h, d - 2 * s, BRICK, 0, y, 0));
  for (const [a, len, dist] of [[0, w, d / 2], [Math.PI, w, d / 2], [Math.PI / 2, d - 2 * s, w / 2], [-Math.PI / 2, d - 2 * s, w / 2]]) {
    const n = Math.max(1, Math.floor(len / pitch)), cells = cellRow(n, len / n, 0.4, aw, ah, a === 0 ? skip : []);
    g.add(onFace(at(arcadeSkin(len, h, cells, s, BRICK, { trim: TRIM, pointed: false, fill: 'room' }), 0, y, 0), a, dist - s));
  }
  g.add(box(w + 0.5, 0.45, d + 0.5, BRICK_DARK, 0, y + h, 0));
  return g;
}

export function buildTalatalGhar() {
  const g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  const [s0, s1, s2, s3] = T.storeys;
  // The plinth, and the four storeys stepping back.
  f.add(box(s0[0] + 3, 0.8, s0[1] + 3, BRICK_DARK));
  const body = new THREE.Group();
  body.add(storey(...s0, 4, { skip: [[-3, 3]] }), storey(...s1, 4), storey(...s2, 3.6), storey(...s3, 3.4));
  // Two wings rising a storey above the ground floor at the ends of the front, as the ruin stands.
  for (const x of [-41, 41]) body.add(at(storey(10, 14, s1[2], s1[3], 3.4), x, 0, 9));
  f.add(mergeByMaterial(body));
  // The main entrance in the middle of the front: a taller arch in a projecting frontispiece.
  f.add(box(9, 5.4, 1.4, BRICK, 0, 0.8, s0[1] / 2 + 0.7), box(9.6, 0.5, 1.8, BRICK_DARK, 0, 6.2, s0[1] / 2 + 0.7));
  f.add(at(arcadeSkin(9, 5.4, [[0, 0, 3.4, 4.6]], 0.6, BRICK, { trim: TRIM, pointed: true, fill: 'room' }), 0, 0.8, s0[1] / 2 + 1.4));
  // The pavilion on top under the Ahom roof, curved like an upturned boat.
  const [w3, d3] = s3, ry = s3[2] + s3[3] + 0.45;
  f.add(at(banglaRoof(w3 + 1.6, d3 + 1.6, 2.6, BRICK_DARK, { droop: 0.4 }), 0, ry, -(d3 + 1.6) / 2));
  addDetails(f, g);
  // From the south-east, over the lawn before the ruin.
  return { group: g, focus: f, view: [0.7, 0.24, 1], zoom: 0.9 };
}

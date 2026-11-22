import * as THREE from 'three';
import { mat, mesh, box, at, inst, unitBox, photo, nagaraProfile, flat } from '../helpers.js';
import { carved, mergeByMaterial } from '../parts/components.js';
import { brokenSpire } from '../parts/temples.js';
import { addDetails } from '../details/masrur-temples.js';

// The Masrur temples, in the Kangra valley: fifteen Nagara shrines of the 8th century cut, not
// built, out of one ridge of sandstone, and never finished. From photographs: the ridge was cut
// down into a mass some 50 m long and 28 m deep, facing east (+z) over a long tank; its top is a
// roof terrace from which the spires rise on a symmetrical plan, the tallest over the central
// shrine (the Thakurdwara), pairs of smaller ones stepping down to either side and behind. The
// front is cut with doorways between pilasters, before them the stumps of a pillared porch. The
// earthquake of 1905 broke many spires: most end in ragged stumps.
export const ROCK = photo(mat('#a69477', 0.94), 'sandstone');
export const ROCK_DARK = photo(mat('#85755c', 0.95), 'sandstone');
// The spires and walls are carved over their faces: the 'reliefs' surface.
export const CARVED = carved(mat('#a08d6f', 0.94), 'reliefs');

// The shrines: [x, z, width, spire height, how much of it stands]. The central one is the
// Thakurdwara; the rest stand in pairs either side of the axis.
export const SHRINES = [
  [0, -5, 10, 13, 1],
  [-9.5, 2, 5, 6.5, 0.85], [9.5, 2, 5, 6.5, 0.7],
  [-16, -4, 6.4, 8.5, 0.75], [16, -4, 6.4, 8.5, 0.9],
  [-11, -14.5, 5.4, 7, 0.6], [11, -14.5, 5.4, 7, 0.8],
  [-22.5, -6, 4.4, 5.5, 0.45], [22.5, -6, 4.4, 5.5, 0.55],
  [-4.5, -16, 3.8, 5, 0.5], [4.5, -16, 3.8, 5, 0.65],
  [-19, 4, 3.6, 4.5, 0.4], [19, 4, 3.6, 4.5, 0.5],
  [-22, -15, 3.4, 4.2, 0.35], [22, -15, 3.4, 4.2, 0.6],
];
export const TERRACE = 6.2;

export function buildMasrurTemples() {
  const g = new THREE.Group(), f = new THREE.Group(), d = new THREE.Group();
  g.add(f);
  // The cut mass: a terrace 6.2 m high, 52 m long, stepped back at its ends; its front at z = 7.
  const T = TERRACE;
  d.add(box(36, T, 26, ROCK, 0, 0, -6), box(52, T - 1.2, 22, ROCK, 0, 0, -8), box(26, 0.5, 27, ROCK_DARK, 0, T - 0.3, -6));
  // Each shrine: a block of walls on the cross plan from the terrace, a cornice, and its spire.
  for (const [x, z, w, h, keep] of SHRINES) {
    const wh = w * 0.42, t = at(new THREE.Group(), x, T - 0.3, z);
    t.add(box(w, wh, w, CARVED, 0, 0, 0), box(w + 0.5, wh, w * 0.5, CARVED, 0, 0, 0), box(w * 0.5, wh, w + 0.5, CARVED, 0, 0, 0), box(w + 0.7, w * 0.06, w + 0.7, ROCK_DARK, 0, wh, 0));
    t.add(at(brokenSpire(w * 0.96, h, keep, CARVED, { rubble: ROCK_DARK, amalakaM: ROCK }), 0, wh + w * 0.06, 0));
    d.add(t);
  }
  // The front: pilasters and dark doorways cut in the rock face, and the porch's pillar stumps.
  const pil = [], stumps = [];
  for (let k = -8; k <= 8; k++) pil.push([k * 2.6, 0, 7.15, 0.6, T - 0.9, 0.3]);
  d.add(inst(unitBox(), pil, ROCK_DARK));
  for (const x of [-15.6, -7.8, 0, 7.8, 15.6]) d.add(box(x === 0 ? 2.4 : 1.6, x === 0 ? 4 : 3, 0.06, mat('#352d25', 0.95), x, 0.4, 7.04));
  for (const x of [-6, -2, 2, 6]) for (const z of [9, 12]) stumps.push([x, 0, z, 0.9, 1 + ((x * 7 + z) % 5 + 5) % 5 * 0.7, 0.9]);
  d.add(inst(unitBox(), stumps, ROCK), box(16, 0.4, 7, ROCK_DARK, 0, 0, 10.5));
  // The stair cut up the north end to the roof terrace.
  for (let k = 0; k < 14; k++) d.add(box(2, (k + 1) * (T - 1.2) / 14, 0.5, ROCK, -24.6, 0, 1 + k * 0.5 - 14 * 0.5 + 6));
  f.add(mergeByMaterial(d));
  addDetails(f, g, { T });
  // From the south-east across the tank: the cut front and the broken spires against the hills.
  return { group: g, focus: f, view: [0.42, 0.17, 1], zoom: 0.74 };
}

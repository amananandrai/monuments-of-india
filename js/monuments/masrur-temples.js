import * as THREE from 'three';
import { M, mat, box, at, surface } from '../helpers.js';
import { carved, mergeByMaterial } from '../parts/components.js';
import { brokenSpire } from '../parts/temples.js';
import { addDetails } from '../details/masrur-temples.js';

// The Masrur temples, in the Kangra valley: one temple of many spires of the 8th century cut, not
// built, out of a ridge of sandstone, and never finished. From the Archaeological Survey's ground
// plan, roof plan and section (drawn in 1887, published by Hargreaves in 1915) and photographs:
// the ridge was cut into a mass some 47 m long, facing north-east (+z here) over a rock-cut pool,
// towards the Dhauladhar. The main spire stands over the sanctum in the middle, rising from a flat
// rock roof; on that roof a smaller spire to either side of it, two begun behind, and a pair at
// each end of the mass flanking a side entrance, with a half spire in relief beside each: eight
// round the one. In front of the sanctum was a hall (mandapa) 8.2 m square and 6.1 m high on four
// pillars, between two towers that hold the rock-cut stairs to the roof (their spires on a plan of
// turned squares); two small shrines flanked its entrance, and two free-standing shrines with
// sixteen-spined spires stand further out, by the pool. The earthquake of 1905 threw down the
// hall's roof and many of the spires: one pillar and the floor are left, and most spires end in
// ragged stumps.
// The living rock, cut and chiselled: no joints (the 'carved' surface).
export const ROCK = surface(mat('#a69477', 0.94), 'carved');
export const ROCK_DARK = surface(mat('#85755c', 0.95), 'carved');
// The walls of the shrines are carved with figures in panels (the 'reliefs' surface); the spires
// with a mesh of small horseshoe arches, worn soft ('frieze').
export const CARVED = carved(mat('#a08d6f', 0.94), 'reliefs');
export const SPIRE = carved(mat('#a3906f', 0.94), 'frieze');

// The roof the spires rise from, and the sanctum's centre behind the front of the hall.
export const TERRACE = 6.2, SANCTUM_Z = -10;
// The shelf of rock the temple stands on is this much above the water of the pool: everything
// here is measured from the shelf, and the whole temple is lifted by it.
export const SHELF = 0.6;
// The spires: [x, z, width, foot, wall height, spire height when whole, how much stands, turns of
// the square plan (1: four spines; 2: eight, the stair spires; 4: sixteen, the free shrines),
// depth as a fraction of the width (0.5: a half spire in relief)].
const T = TERRACE, Z = SANCTUM_Z;
export const SHRINES = {
  main: [[0, Z, 10.6, T - 0.2, 0.9, 15, 0.84]],
  roof: [[-9.5, Z, 4.7, T - 0.2, 0.7, 10, 0.9], [9.5, Z, 4.7, T - 0.2, 0.7, 10, 0.82], [-8.6, Z - 6.4, 4.4, T - 0.2, 0.6, 7, 0.3], [8.6, Z - 6.4, 4.4, T - 0.2, 0.6, 7, 0.42]],
  ends: [[-20.8, Z + 4.4, 5.2, 0, 4.2, 7.6, 0.8], [20.8, Z + 4.4, 5.2, 0, 4.2, 7.6, 0.5], [-20.8, Z - 4.4, 5.2, 0, 4.2, 7.6, 0.6], [20.8, Z - 4.4, 5.2, 0, 4.2, 7.6, 0.72]],
  half: [[-14.7, Z + 5.2, 4.4, 0, 4.2, 5.6, 0.72, 1, 0.5], [14.7, Z + 5.2, 4.4, 0, 4.2, 5.6, 0.4, 1, 0.5]],
  stair: [[-8.3, -1.4, 4.4, 0, T + 0.6, 8.4, 0.78, 2], [8.3, -1.4, 4.4, 0, T + 0.2, 8.4, 0.5, 2]],
  front: [[-4.5, 5.6, 4.2, 0, 2.4, 6, 0.14], [4.5, 5.6, 4.2, 0, 3.4, 6, 0.5]],
  free: [[-19.3, 5.2, 5.4, 0, 3.8, 8.2, 0.24, 4], [19.3, 5.2, 5.4, 0, 3.8, 8.2, 0.74, 4]],
};

// One shrine: walls on the cross plan with a plinth and a cornice, and its spire, the square plan
// turned to give eight or sixteen spines.
function shrine([x, z, w, y0, wh, h, keep, turns = 1, deep = 1]) {
  const t = new THREE.Group(), u = w * 0.06;
  for (let k = 0; k < turns; k++) {
    const p = new THREE.Group();
    if (!k || turns === 2) {
      if (wh > 1.5) p.add(box(w + 0.5, u * 1.6, w + 0.5, ROCK_DARK));
      p.add(box(w, wh, w, CARVED), box(w + 0.5, wh, w * 0.5, CARVED), box(w * 0.5, wh, w + 0.5, CARVED), box(w + 0.7, u, w + 0.7, ROCK_DARK, 0, wh, 0));
    }
    p.add(at(brokenSpire(w * 0.96, h, keep, SPIRE, { rubble: ROCK_DARK, amalakaM: ROCK }), 0, wh + u, 0));
    p.rotation.y = (k * Math.PI) / 2 / turns;
    t.add(p);
  }
  t.scale.z = deep;
  return at(t, x, y0, z);
}

export function buildMasrurTemples() {
  const g = new THREE.Group(), f = new THREE.Group(), d = new THREE.Group();
  g.add(at(f, 0, SHELF, 0));
  // The cut mass. Its core under the main spire, 25 m long, with the sanctum's porch cut into its
  // front under a heavy lintel of rock; the lower wings running out to the end spires; and the two
  // blocks either side of the hall that hold the stairs.
  d.add(box(25, T, 12, ROCK, 0, 0, Z - 2.2), box(24.4, 0.2, 11.4, ROCK_DARK, 0, T - 0.1, Z - 2.2));
  d.add(box(8.4, T - 4.9, 2, ROCK, 0, 4.9, -5.3), box(8.8, 0.35, 2.2, ROCK_DARK, 0, 4.9, -5.2));
  for (const s of [-1, 1]) {
    d.add(box(7.4, T - 0.15, 8, ROCK, s * 7.9, 0, -2.4), box(8.8, T - 0.8, 10.4, ROCK, s * 16.8, 0, Z - 0.4), box(2.8, T - 1.7, 4.4, ROCK, s * 22, 0, Z));
    // The unfinished side entrances, between the spires at each end: a door frame begun in the rock.
    d.add(box(0.06, 2.7, 1.5, M.recess, s * 23.42, 0.5, Z), box(0.3, 3.4, 2.3, ROCK_DARK, s * 23.3, 0.3, Z), box(0.5, 0.4, 2.9, ROCK_DARK, s * 23.4, 3.7, Z));
  }
  // The slabs of rock that slid forward on the north side in 1905, between the stair tower and the
  // half spire, and the rougher rock left standing at the back.
  for (const [x, y, z, w, h, dd, rx, rz] of [[13.6, 0, -2.8, 4.4, 5.2, 1.6, 0.5, 0.12], [16.6, 0, -3.4, 3.6, 4.4, 1.5, 0.42, -0.1], [12.6, 0, 0.2, 3, 2.6, 1.8, 0.3, 0.3], [15.4, 0, -0.6, 2.8, 2, 2.2, 0.2, -0.25], [-13.2, 0, -3.2, 2.6, 3.6, 2, 0.16, -0.08], [0, T - 0.6, Z - 7.6, 14, 2.6, 2.4, -0.1, 0.02], [-17, T - 1.6, Z - 5.2, 6, 2.2, 2, -0.12, 0.05], [17, T - 1.6, Z - 5.2, 6, 2.6, 2, -0.1, -0.04]]) {
    const b = box(w, h, dd, ROCK, x, y, z);
    b.rotation.set(-rx, 0, rz);
    d.add(b);
  }
  for (const list of Object.values(SHRINES)) for (const s of list) d.add(shrine(s));
  // The floor of the fallen hall, 8.2 m square and running back under the lintel into the porch,
  // with the low platforms of the plan either side of its entrance shrines.
  d.add(box(8.2, 0.45, 10.2, ROCK_DARK, 0, 0, -1.3), box(3.6, 0.3, 1, ROCK, 0, 0, 4.3), box(3.6, 0.15, 1, ROCK, 0, 0, 5.1));
  for (const s of [-1, 1]) d.add(box(3.6, 0.5, 5, ROCK_DARK, s * 10.6, 0, 6));
  f.add(mergeByMaterial(d));
  addDetails(f, g, { T });
  // From across the pool: the porch under the main spire, the stair towers either side.
  return { group: g, focus: f, view: [-0.12, 0.2, 1], zoom: 0.62 };
}

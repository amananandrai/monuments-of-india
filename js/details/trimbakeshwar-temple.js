import * as THREE from 'three';
import { at, flag, mat, box, onFace } from '../helpers.js';
import { pilasters, mouldings, merlons, frieze, mergeByMaterial } from './components.js';
import { deepmala, nandiMandapa } from './temples.js';
import { trees, stalls, garland, scatter, along } from './realism.js';

// Trimbakeshwar, finer detail. Dimensions follow js/monuments/trimbakeshwar-temple.js: the court
// 80 × 90 inside walls 6 high and 2 thick, the gatehouse 20 wide in the south wall (z = 45), the
// temple at z = -24 with its stair down to z = 15.5. Between the stair and the gate, on the axis,
// the Nandi lies in an open pillared mandapa facing the sanctum, and a pair of tall deepmalas of
// black basalt stand either side of it; the court walls are moulded at the foot, ribbed with
// pilasters and coped on their outer face. Then the stalls of the temple street, saffron flags,
// marigolds over the gateway, and trees on the lower slopes of the hill.
const SAFFRON = mat('#f08a1c', 0.8, 0, { side: 2 });
const WALL = mat('#5d5853', 0.9), TRIM = mat('#4a4642', 0.9);
const BASALT = mat('#3f3b38', 0.88);

function walls(f) {
  const d = new THREE.Group();
  for (const [a, dist, runs] of [[Math.PI, 45, [[-40, 40]]], [0, 45, [[-40, -10], [10, 40]]], [Math.PI / 2, 40, [[-45, 45]]], [-Math.PI / 2, 40, [[-45, 45]]]]) {
    for (const [p, q] of runs) {
      const l = q - p, mid = (p + q) / 2, lat = a === Math.PI || a === Math.PI / 2 ? -mid : mid;
      const g = new THREE.Group().add(box(l, 0.5, 0.22, TRIM, 0, 0, 0.11), box(l, 0.25, 0.14, TRIM, 0, 0.75, 0.07), box(l + 0.01, 0.4, 2.5, TRIM, 0, 6, -1));
      g.add(at(pilasters(l - 2, Math.max(2, Math.round(l / 5)), 0.6, 4.6, 0.14, WALL), 0, 1.1, 0));
      d.add(onFace(g, a, dist + 1, lat));
    }
  }
  // The gatehouse (20 wide, 9 high and 8 deep on its 1.2 m sill, the passage 4.4 wide and 6 high):
  // two moulded courses and a carved band above the passage, pilasters either side of it on both
  // faces, and a row of merlons along its top.
  const gh = at(new THREE.Group(), 0, 1.2, 45);
  gh.add(mouldings(20, 8, [[6.6, 0.35, 0.18, TRIM], [7.0, 0.8, 0.06, frieze(WALL)], [8.4, 0.5, 0.3, TRIM]], WALL));
  for (const a of [0, Math.PI]) {
    for (const x of [-8.6, -5, 5, 8.6]) gh.add(onFace(at(pilasters(0, 1, 0.7, 6.2, 0.16, WALL), 0, 0.2, 0), a, 4, x));
    gh.add(onFace(at(merlons(19.4, 0.9, 1.1, 0.4, WALL), 0, 9, 0), a, 3.7));
  }
  d.add(gh);
  f.add(mergeByMaterial(d));
}

export function addDetails(f, g) {
  walls(f);
  f.add(at(nandiMandapa(6, 4.2, BASALT, TRIM, { nandiM: mat('#2f2c2a', 0.6) }), 0, 0, 24));
  for (const x of [-10, 10]) f.add(at(deepmala(10, BASALT), x, 0, 26));
  g.add(stalls([...along(6, [-16, 54], [-16, 90]).map(([x, z]) => [x, z, Math.PI / 2]), ...along(6, [16, 54], [16, 90]).map(([x, z]) => [x, z, -Math.PI / 2])]));
  for (const [x, z] of [[-38, -43], [38, -43], [-38, 43], [38, 43]]) f.add(at(flag(7, SAFFRON), x, 6.4, z));
  f.add(garland([-8, 9.4, 49.1], [8, 9.4, 49.1], { sag: 0.8, strands: 3 }));
  g.add(trees(scatter(30, [-95, 95, -100, -70], { seed: 5, gap: 10 }), { kind: 'mango', seed: 5 }));
}

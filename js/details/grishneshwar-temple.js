import * as THREE from 'three';
import { at, flag, mat, box, onFace } from '../helpers.js';
import { pilasters, mergeByMaterial } from '../parts/components.js';
import { deepmala } from '../parts/temples.js';
import { trees, garland, scatter } from '../parts/realism.js';

// Grishneshwar, finer detail. The walled court (js/monuments/grishneshwar-temple.js: 70 × 80, walls
// 4 high and 2 thick, the gatehouse in the south wall at z = 40) gets a moulded foot, pilasters and
// a coping on the outer face of its walls; before the temple's stair, a pair of deepmalas in the
// dark basalt of the Deccan flank the way in. Saffron flags at the corners of the court, marigold
// garlands across the gateway, and neem trees in the village round the wall.
const SAFFRON = mat('#f08a1c', 0.8, 0, { side: 2 });
const WALL = mat('#a39079', 0.9), TRIM = mat('#8a7762', 0.9);
const BASALT = mat('#4a4541', 0.9);

function walls(f) {
  const d = new THREE.Group();
  // [face angle, distance to the wall's centre line, runs along the face as [from, to]]
  for (const [a, dist, runs] of [[Math.PI, 40, [[-35, 35]]], [0, 40, [[-35, -5], [5, 35]]], [Math.PI / 2, 35, [[-40, 40]]], [-Math.PI / 2, 35, [[-40, 40]]]]) {
    for (const [p, q] of runs) {
      const l = q - p, mid = (p + q) / 2, lat = a === Math.PI || a === Math.PI / 2 ? -mid : mid;
      const g = new THREE.Group().add(box(l, 0.4, 0.2, TRIM, 0, 0, 0.1), box(l + 0.01, 0.35, 2.5, TRIM, 0, 4, -1));
      g.add(at(pilasters(l - 2, Math.max(2, Math.round(l / 5)), 0.5, 3.2, 0.12, WALL), 0, 0.45, 0));
      d.add(onFace(g, a, dist + 1, lat));
    }
  }
  f.add(mergeByMaterial(d));
}

export function addDetails(f, g) {
  walls(f);
  for (const x of [-9, 9]) f.add(at(deepmala(8, BASALT), x, 0, 24));
  for (const [x, z] of [[-33, -38], [33, -38], [-33, 38], [33, 38]]) f.add(at(flag(7, SAFFRON), x, 4, z));
  f.add(garland([-1.5, 4.1, 42.3], [1.5, 4.1, 42.3], { sag: 0.4, strands: 2 }));
  g.add(trees(scatter(22, [-68, 68, -68, 68], { seed: 4, gap: 14 }).filter(([x, z]) => Math.abs(x) > 40 || Math.abs(z) > 45), { kind: 'neem', seed: 4 }));
}

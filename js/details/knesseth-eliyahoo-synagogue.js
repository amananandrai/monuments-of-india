import * as THREE from 'three';
import { M, mat, box, cyl } from '../helpers.js';
import { mergeByMaterial } from '../parts/components.js';
import { trees, lampPosts, along, townHouses, traffic } from '../parts/realism.js';
import { detail } from '../detail.js';
import { P, WHITE, BASE } from '../monuments/knesseth-eliyahoo-synagogue.js';

const IRON = mat('#1f2326', 0.5, 0.6);

// The synagogue's street in Kala Ghoda: a narrow forecourt behind iron railings on a low stone
// wall, with a gate in the middle; the pavement and V. B. Gandhi Marg before it, shaded by old
// rain trees; and the four- and five-storey buildings of the Fort district pressed against it on
// either side and facing it across the road.
export function addDetails(f, g) {
  const { W, D } = P, zs = 5.5;
  g.add(box(320, 0.06, 320, M.grass, 0, -0.06, 0));
  // The forecourt, the pavements and the road.
  g.add(box(W, 0.08, 4.4, M.path, 0, 0, 2.2));
  g.add(box(300, 0.12, 3.2, M.path, 0, 0, zs - 0.9), box(300, 0.05, 12, M.asphalt, 0, 0, zs + 6.7), box(300, 0.12, 3.2, M.path, 0, 0, zs + 14.3));
  // The railings on their wall, and the gate piers.
  const r = new THREE.Group(), zr = 4.5;
  for (const s of [-1, 1]) {
    const len = W / 2 - 2.2, cx = s * (2.2 + len / 2);
    r.add(box(len, 0.6, 0.4, BASE, cx, 0, zr), box(len, 0.08, 0.08, IRON, cx, 1.75, zr));
    for (let k = 0; k <= Math.floor(len / 0.18); k++) r.add(cyl(0.018, 0.018, 1.3, IRON, cx - len / 2 + k * 0.18, 0.6, zr, 5));
    r.add(box(0.9, 2.4, 0.9, WHITE, s * 1.8, 0, zr));
  }
  f.add(mergeByMaterial(r));
  // The neighbours either side and behind: tall stone and plastered blocks, built to the line.
  g.add(townHouses([[-W / 2 - 8.2, -D / 2 + 1, 16, D + 6, 5, 0], [W / 2 + 7.2, -D / 2 + 1, 14, D + 6, 4, 0], [-W / 2 - 24.4, -D / 2 + 1, 16, D + 6, 4, 0], [W / 2 + 22.4, -D / 2 + 1, 16, D + 6, 5, 0], [0, -D - 12, 24, 14, 5, Math.PI]], { seed: 7, tanks: 0.3, paint: ['#e5d6b8', '#d8c7a6', '#efe6d4', '#c9b79a'] }));
  // Across the road.
  g.add(townHouses([...Array(8)].map((_, k) => [-70 + k * 20, zs + 28, 18, 18, 3 + (k % 2), Math.PI]), { seed: 9, tanks: 0.3, paint: ['#e5d6b8', '#efe6d4', '#c9b79a', '#d7b98f'] }));
  // Rain trees along the road, cars parked and passing, and lamps.
  g.add(trees([...along(6, [-60, zs - 1.6], [60, zs - 1.6]), ...along(6, [-55, zs + 15], [65, zs + 15])].filter(([x]) => Math.abs(x) > 8), { kind: 'tamarind', seed: 4 }));
  if (!detail.low) g.add(traffic([[zs + 3.6, 1], [zs + 9.8, -1]], -140, 140, { y: 0.05, seed: 5, gap: 18, taxis: 0.35, buses: 0.08, trucks: 0 }));
  g.add(lampPosts([...along(5, [-50, zs + 0.3], [50, zs + 0.3])].filter(([x]) => Math.abs(x) > 4)));
}

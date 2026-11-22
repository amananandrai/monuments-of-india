import * as THREE from 'three';
import { M, box, at, cyl } from '../helpers.js';
import { mergeByMaterial } from '../parts/components.js';
import { trees, shrubs, lampPosts, benches, asiBoard, scatter, along, townHouses, traffic } from '../parts/realism.js';
import { detail } from '../detail.js';
import { P, LIME, TRIM, TILE } from '../monuments/st-francis-church-kochi.js';

// The memorial stones in the churchyard: low whitewashed tombs with a slab on top, and a few
// headstones, as along the north side of St Francis.
function graves(spots) {
  const d = new THREE.Group();
  for (const [x, z, k] of spots) {
    if (k % 3 === 0) d.add(box(0.7, 1.1, 0.18, TRIM, x, 0, z));
    else d.add(box(1, 0.5, 2.1, LIME, x, 0, z), box(1.15, 0.12, 2.25, TRIM, x, 0.5, z));
  }
  return mergeByMaterial(d);
}

// St Francis in Fort Kochi: its walled churchyard, open to the street through a gate between two
// whitewashed piers; the old graves along its side; the great rain trees of the Parade Ground
// beside it and the tiled colonial houses of Fort Kochi round about.
export function addDetails(f, g) {
  const { W, L, FZ } = P;
  g.add(box(420, 0.06, 420, M.grass, 0, -0.06, 0));
  const yz = FZ + 18, yb = FZ - L - 22;
  // Paths to the porch and round the church; the street in front.
  g.add(box(5, 0.05, 14, M.path, 0, 0, FZ + 11), box(W + 8, 0.05, L + 22, M.path, 0, -0.01, FZ - L / 2 - 4));
  g.add(box(320, 0.05, 10, M.asphalt, 0, 0, yz + 8));
  // The churchyard wall: low, whitewashed, with a tiled coping, open at the gate.
  const wl = new THREE.Group(), X = 26;
  for (const s of [-1, 1]) {
    wl.add(box(X - 3.5, 1.4, 0.45, LIME, s * (X + 3.5) / 2, 0, yz), box(X - 3.3, 0.14, 0.65, TRIM, s * (X + 3.5) / 2, 1.4, yz));
    wl.add(box(0.45, 1.4, yz - yb, LIME, s * X, 0, (yz + yb) / 2), box(0.65, 0.14, yz - yb, TRIM, s * X, 1.4, (yz + yb) / 2));
    // The gate piers, each with a cap and a ball.
    wl.add(box(1.2, 2.8, 1.2, LIME, s * 3, 0, yz), box(1.45, 0.25, 1.45, TRIM, s * 3, 2.8, yz), at(cyl(0.3, 0.3, 0.5, TRIM, 0, 0, 0, 10), s * 3, 3.05, yz));
  }
  wl.add(box(2 * X, 1.4, 0.45, LIME, 0, 0, yb), box(2 * X + 0.2, 0.14, 0.65, TRIM, 0, 1.4, yb));
  g.add(mergeByMaterial(wl));
  // The graves along the north side and behind the chancel.
  const gs = [];
  for (let k = 0; k < 14; k++) gs.push([-W / 2 - 6 - (k % 2) * 4, FZ - 6 - Math.floor(k / 2) * 5, k]);
  for (let k = 0; k < 6; k++) gs.push([-12 + k * 4.5, yb + 5, k + 1]);
  f.add(graves(gs));
  // Shrubs by the walls, a few palms in the yard, and the rain trees of the Parade Ground beyond.
  g.add(shrubs([...along(7, [-X + 2, yz - 1.6], [-6, yz - 1.6]), ...along(7, [6, yz - 1.6], [X - 2, yz - 1.6])].map(([x, z]) => [x, z, 1.2]), { flowers: '#e05a7a', seed: 4 }));
  g.add(trees([[X - 6, FZ - 4], [X - 5, FZ - 26], [-X + 4, FZ - 34], [X - 7, yb + 6]], { kind: 'palm', seed: 3 }));
  g.add(trees([[-48, 10], [-62, -26], [-50, -60], [52, 6], [60, -40], [46, -70], [-30, yb - 18], [24, yb - 20]], { kind: 'tamarind', seed: 7 }));
  g.add(trees(scatter(20, [-180, 180, -170, 150], { seed: 9, gap: 14, avoid: [[-70, 70, yb - 34, yz + 16], [-200, 200, yz + 1, yz + 40]] }), { kind: 'mango', seed: 9 }));
  // The houses of Fort Kochi across the street and on either side: two storeys under tiled roofs.
  g.add(townHouses([...Array(14)].map((_, k) => [-130 + k * 20, yz + 23, 16, 11, 2, Math.PI]), { seed: 5, roof: 'pitched', roofs: ['#8e4630', '#9a4a32', '#7d3e2a'], tanks: 0 }));
  g.add(townHouses([...Array(5)].map((_, k) => [-95, yz - 20 - k * 19, 15, 12, 2, Math.PI / 2]).concat([...Array(5)].map((_, k) => [95, yz - 20 - k * 19, 15, 12, 2, -Math.PI / 2])), { seed: 6, roof: 'pitched', roofs: ['#8e4630', '#9a4a32'], tanks: 0 }));
  if (!detail.low) g.add(traffic([[yz + 5.5, 1], [yz + 10.5, -1]], -150, 150, { y: 0.05, seed: 3, gap: 34, buses: 0, trucks: 0 }));
  g.add(lampPosts([...along(6, [-110, yz + 2.6], [110, yz + 2.6])]));
  g.add(benches([[-10, FZ + 9], [10, FZ + 9]]));
  g.add(asiBoard('St. Francis Church', 7, yz - 3, 0));
}

import * as THREE from 'three';
import { M, mat, mesh, box, at, photo, instBoxes } from '../helpers.js';
import { mergeByMaterial } from '../parts/components.js';
import { trees, shrubs, lampPosts, benches, asiBoard, scatter, along, townHouses, traffic } from '../parts/realism.js';
import { detail } from '../detail.js';
import { P, LIME, TRIM } from '../monuments/st-francis-church-kochi.js';

const RUBBLE = photo(mat('#4b423a', 0.95), 'rubble'), WHITE = mat('#f2f0ea', 0.8), STEP = mat('#6f6a60', 0.9), TABLET = mat('#3a3a36', 0.6);
const IRON = mat('#7f8c98', 0.6, 0.3), PIER = mat('#9a9382', 0.9);

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

// The cenotaph of the First World War on the front lawn: a tapering pylon of dark rubble with
// white-painted joints on a square base and two steps, white bands between its stages, a white
// pyramidal cap, a wreath on each face of the upper stage and a tablet on the shaft.
function cenotaph() {
  const g = new THREE.Group(), taper = (w0, w1, h, m, y) => mesh(new THREE.CylinderGeometry(w1 * Math.SQRT1_2, w0 * Math.SQRT1_2, h, 4).rotateY(Math.PI / 4), m, 0, y + h / 2, 0);
  g.add(box(4.4, 0.3, 4.4, STEP), box(3.5, 0.3, 3.5, STEP, 0, 0.3, 0), box(2.4, 1.6, 2.4, RUBBLE, 0, 0.6, 0), box(2.5, 0.1, 2.5, WHITE, 0, 2.2, 0));
  g.add(taper(2.2, 1.6, 2.4, RUBBLE, 2.3), box(1.75, 0.1, 1.75, WHITE, 0, 4.7, 0), taper(1.55, 1.15, 0.9, RUBBLE, 4.8), taper(1.2, 0, 0.6, WHITE, 5.7));
  for (const a of [0, Math.PI / 2, Math.PI, -Math.PI / 2]) {
    const w = mesh(new THREE.TorusGeometry(0.26, 0.05, 5, 16, Math.PI * 1.7).rotateZ(Math.PI * 0.65), WHITE);
    w.position.set(Math.sin(a) * 0.72, 5.25, Math.cos(a) * 0.72);
    w.rotation.set(-0.22, a, 0, 'YXZ');
    g.add(w);
  }
  const t = box(0.8, 1.1, 0.05, TABLET, 0, 2.9, 1.0);
  t.rotation.x = -0.12;
  g.add(t);
  return mergeByMaterial(g);
}

// A run of iron railings len long along x: spear-headed bars between two rails, with a stouter
// standard every 2.4 m, on a low kerb.
function ironRailing(len) {
  const g = new THREE.Group(), bars = [];
  g.add(box(len, 0.3, 0.4, STEP), box(len, 0.06, 0.05, IRON, 0, 0.6, 0), box(len, 0.06, 0.05, IRON, 0, 1.9, 0));
  for (let x = -len / 2 + 0.15; x < len / 2; x += 0.3) bars.push([x, 0.3, 0, 0.035, 2.1, 0.035]);
  for (let x = -len / 2 + 1.2; x < len / 2; x += 2.4) bars.push([x, 0.3, 0, 0.09, 2.2, 0.09]);
  g.add(instBoxes(bars, IRON));
  return g;
}

// St Francis in Fort Kochi: its churchyard, closed to the street by grey-blue iron railings between
// stone piers with pyramidal caps and walled on the other sides; the cenotaph on the lawn before
// the door, with a tall araucaria beside it; the old graves along its side; the great rain trees of
// the Parade Ground beside it and the tiled colonial houses of Fort Kochi round about.
export function addDetails(f, g) {
  const { W, L, FZ } = P;
  g.add(box(420, 0.06, 420, M.grass, 0, -0.06, 0));
  const yz = FZ + 18, yb = FZ - L - 22;
  // Paths to the porch and round the church; the street in front.
  g.add(box(4, 0.05, 16, M.path, 7, 0, FZ + 10), box(11, 0.05, 4, M.path, 3.5, 0, FZ + 2.5), box(W + 8, 0.05, L + 22, M.path, 0, -0.01, FZ - L / 2 - 4));
  g.add(box(320, 0.05, 10, M.asphalt, 0, 0, yz + 8));
  // The side and back walls, low, with a coping; along the street the railings, between stone
  // piers with pyramidal caps, open at the gate.
  const wl = new THREE.Group(), X = 26, pier = (x) => wl.add(box(1.1, 2.3, 1.1, PIER, x, 0, yz), at(mesh(new THREE.ConeGeometry(0.85, 0.6, 4).rotateY(Math.PI / 4), PIER), x, 2.6, yz));
  for (const s of [-1, 1]) wl.add(box(0.45, 1.4, yz - yb, LIME, s * X, 0, (yz + yb) / 2), box(0.65, 0.14, yz - yb, TRIM, s * X, 1.4, (yz + yb) / 2));
  const px = [-X, -15.5, -5.25, 5, 9, 17.5, X];
  px.forEach((x, k) => { pier(x); if (k && x !== 9) g.add(at(ironRailing(x - px[k - 1] - 1.1), (x + px[k - 1]) / 2, 0, yz)); });
  wl.add(box(2 * X, 1.4, 0.45, LIME, 0, 0, yb), box(2 * X + 0.2, 0.14, 0.65, TRIM, 0, 1.4, yb));
  g.add(mergeByMaterial(wl));
  // The graves along the north side and behind the chancel.
  const gs = [];
  for (let k = 0; k < 14; k++) gs.push([-W / 2 - 6 - (k % 2) * 4, FZ - 6 - Math.floor(k / 2) * 5, k]);
  for (let k = 0; k < 6; k++) gs.push([-12 + k * 4.5, yb + 5, k + 1]);
  f.add(graves(gs));
  g.add(at(cenotaph(), 0, 0, FZ + 9), trees([[-3.2, FZ + 4.5, 15]], { kind: 'casuarina', seed: 2 }));
  // Shrubs by the walls, a few palms in the yard, and the rain trees of the Parade Ground beyond.
  g.add(shrubs([...along(9, [-X + 2, yz - 1.6], [3, yz - 1.6]), ...along(5, [11, yz - 1.6], [X - 2, yz - 1.6])].map(([x, z]) => [x, z, 1.2]), { flowers: '#e05a7a', seed: 4 }));
  g.add(trees([[X - 6, FZ - 4], [X - 5, FZ - 26], [-X + 4, FZ - 34], [X - 7, yb + 6]], { kind: 'palm', seed: 3 }));
  g.add(trees([[-48, 10], [-62, -26], [-50, -60], [52, 6], [60, -40], [46, -70], [-30, yb - 18], [24, yb - 20]], { kind: 'tamarind', seed: 7 }));
  g.add(trees(scatter(20, [-180, 180, -170, 150], { seed: 9, gap: 14, avoid: [[-70, 70, yb - 34, yz + 16], [-200, 200, yz + 1, yz + 40]] }), { kind: 'mango', seed: 9 }));
  // The houses of Fort Kochi across the street and on either side: two storeys under tiled roofs.
  g.add(townHouses([...Array(14)].map((_, k) => [-130 + k * 20, yz + 23, 16, 11, 2, Math.PI]), { seed: 5, roof: 'pitched', roofs: ['#8e4630', '#9a4a32', '#7d3e2a'], tanks: 0 }));
  g.add(townHouses([...Array(5)].map((_, k) => [-95, yz - 20 - k * 19, 15, 12, 2, Math.PI / 2]).concat([...Array(5)].map((_, k) => [95, yz - 20 - k * 19, 15, 12, 2, -Math.PI / 2])), { seed: 6, roof: 'pitched', roofs: ['#8e4630', '#9a4a32'], tanks: 0 }));
  if (!detail.low) g.add(traffic([[yz + 5.5, 1], [yz + 10.5, -1]], -150, 150, { y: 0.05, seed: 3, gap: 34, buses: 0, trucks: 0 }));
  g.add(lampPosts([...along(6, [-110, yz + 2.6], [110, yz + 2.6])]));
  g.add(benches([[-10, FZ + 9], [12, FZ + 9]]));
  g.add(asiBoard('St. Francis Church', 12, yz - 3, 0));
}

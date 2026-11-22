import * as THREE from 'three';
import { M, box, at, hipRoof, sheet } from '../helpers.js';
import { mergeByMaterial } from '../parts/components.js';
import { trees, shrubs, lampPosts, scatter, along, townHouses, traffic } from '../parts/realism.js';
import { detail } from '../detail.js';
import { P, LIME, LATERITE, TILE } from '../monuments/cheraman-juma-masjid.js';

// Cheraman Juma Masjid on the Kodungallur road at Methala: its walled yard, entered from the road
// through a tiled gateway; the ablution tank (kulam) beside it with laterite steps down to the
// water; the old graves in the yard, each under a low whitewashed headstone; coconut palms
// everywhere; and the houses and shops of Methala along the road.
export function addDetails(f, g) {
  const { W, D } = P;
  g.add(box(420, 0.06, 420, M.grass, 0, -0.06, 0));
  const X = 40, zf = D / 2 + 26, zb = -D / 2 - 30;
  // The yard, sanded, and the road in front.
  g.add(box(2 * X - 1, 0.04, zf - zb - 1, M.path, 0, 0, (zf + zb) / 2));
  g.add(box(360, 0.05, 11, M.asphalt, 0, 0, zf + 9));
  // The yard's wall of laterite, whitewashed above a bare base, open at the gateway.
  const wl = new THREE.Group();
  for (const s of [-1, 1]) {
    wl.add(box(X - 4, 1.8, 0.5, LIME, s * (X + 4) / 2, 0, zf), box(X - 4, 0.5, 0.6, LATERITE, s * (X + 4) / 2, 0, zf));
    wl.add(box(0.5, 1.8, zf - zb, LIME, s * X, 0, (zf + zb) / 2));
  }
  wl.add(box(2 * X, 1.8, 0.5, LIME, 0, 0, zb));
  // The gateway: two laterite piers under a little tiled roof.
  wl.add(box(1.4, 3, 3, LATERITE, -3.2, 0, zf), box(1.4, 3, 3, LATERITE, 3.2, 0, zf), box(8, 0.4, 3.4, LATERITE, 0, 3, zf));
  wl.add(at(hipRoof(9.4, 5, 1.8, TILE), 0, 3.4, zf));
  g.add(mergeByMaterial(wl));
  // The ablution tank, south of the mosque: inside a low whitewashed rim, laterite steps go down
  // on every side to green water.
  const tk = new THREE.Group(), tx = W / 2 + 15, tz = -4, s0 = 16;
  for (let k = 0; k < 5; k++) {
    const s = s0 - k * 1.4, h = 1.25 - k * 0.25;
    for (const q of [-1, 1]) tk.add(box(s, h, 0.7, LATERITE, tx, 0, tz + q * (s / 2 - 0.35)), box(0.7, h, s - 1.4, LATERITE, tx + q * (s / 2 - 0.35), 0, tz));
  }
  for (const q of [-1, 1]) tk.add(box(s0 + 0.6, 0.35, 0.8, LIME, tx, 1.25, tz + q * (s0 / 2 - 0.1)), box(0.8, 0.35, s0 - 1, LIME, tx + q * (s0 / 2 - 0.1), 1.25, tz));
  g.add(mergeByMaterial(tk), sheet(s0 - 6.95, s0 - 6.95, M.water, tx, 0.12, tz));
  // The graves, north of the mosque.
  const gr = new THREE.Group();
  for (let k = 0; k < 18; k++) {
    const x = -W / 2 - 6 - (k % 3) * 3.2, z = -12 + Math.floor(k / 3) * 4;
    gr.add(box(0.9, 0.3, 2, LATERITE, x, 0, z), box(0.35, 0.9, 0.18, LIME, x, 0.3, z - 0.8));
  }
  f.add(mergeByMaterial(gr));
  // Palms in and round the yard; shrubs along the wall.
  g.add(trees([[-X + 5, zf - 6], [X - 5, zf - 5], [-X + 6, zb + 6], [X - 6, zb + 8], [-X + 4, -2], [8, zb + 5], [-14, zb + 4], [X - 4, 14]], { kind: 'palm', seed: 4 }));
  g.add(trees(scatter(55, [-190, 190, -190, 170], { seed: 5, gap: 10, avoid: [[-X - 6, X + 6, zb - 6, zf + 4], [-200, 200, zf + 2, zf + 40]] }), { kind: 'palm', seed: 5 }));
  g.add(trees([[-70, -40], [64, -60], [-58, 50], [80, 30]], { kind: 'mango', seed: 6 }));
  g.add(shrubs([...along(6, [-X + 3, zf - 1.5], [-7, zf - 1.5]), ...along(6, [7, zf - 1.5], [X - 3, zf - 1.5])].map(([x, z]) => [x, z, 1.1]), { flowers: '#d0306f', seed: 7 }));
  // Methala along the road: shops and houses, and the traffic on the road.
  g.add(townHouses([...Array(16)].map((_, k) => [-150 + k * 20, zf + 24, 15, 11, 2, Math.PI]), { seed: 3, roof: 'pitched', roofs: ['#8e4630', '#9a4a32', '#7d3e2a'], tanks: 0 }));
  g.add(townHouses([[-X - 16, -10, 14, 12, 2, Math.PI / 2], [-X - 16, 12, 14, 12, 2, Math.PI / 2], [X + 18, 20, 14, 12, 2, -Math.PI / 2]], { seed: 9, roof: 'pitched', roofs: ['#8e4630'], tanks: 0 }));
  if (!detail.low) g.add(traffic([[zf + 6.5, 1], [zf + 11.5, -1]], -170, 170, { y: 0.05, seed: 6, gap: 30, buses: 0.15, trucks: 0.05 }));
  g.add(lampPosts([...along(7, [-120, zf + 3], [120, zf + 3])]));
}

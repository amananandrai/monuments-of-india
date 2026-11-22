import * as THREE from 'three';
import { M, box, at, hipRoof } from '../helpers.js';
import { mergeByMaterial } from '../parts/components.js';
import { dwajasthambha } from '../parts/temples.js';
import { trees, shrubs, lampPosts, stalls, scatter, around, townHouses, traffic } from '../parts/realism.js';
import { detail } from '../detail.js';
import { P, LIME, LATERITE, TILE } from '../monuments/vadakkunnathan-temple.js';

// Vadakkunnathan's grounds and Thekkinkadu Maidan. Within the wall: paths of laterite from each
// gateway to the cloister, the gilded flagstaff before its east door, small shrines and the
// temple's tanks among the trees. Without it: the maidan, some 65 acres of open ground and great
// old trees, banyan, peepal and teak, where the Pooram is held; and round it the Swaraj Round,
// the ring road of Thrissur, lined with shops and buildings.
export function addDetails(f, g) {
  const { S, CD } = P, R = 205;
  g.add(box(760, 0.06, 760, M.grass, 0, -0.06, 0));
  // The paths within the wall, and the open sanded court round the cloister.
  g.add(box(S - 3, 0.03, S - 3, M.path, 0, 0, 0));
  g.add(box(8, 0.06, S / 2 - CD / 2, M.path, 0, 0.03, (S / 2 + CD / 2) / 2), box(8, 0.06, S / 2 - CD / 2, M.path, 0, 0.03, -(S / 2 + CD / 2) / 2));
  // The paths across the maidan from each gateway to the ring road.
  for (const [x, z, w, d] of [[0, S / 2 + 51, 9, 102], [0, -S / 2 - 51, 9, 102], [S / 2 + 51, 0, 102, 9], [-S / 2 - 51, 0, 102, 9]]) g.add(box(w, 0.05, d, M.path, x, 0, z));
  // The flagstaff before the cloister's east door.
  f.add(dwajasthambha(0, CD / 2 + 9, 14));
  // Small shrines round the court: laterite cells under tiled roofs.
  const sh = new THREE.Group();
  for (const [x, z] of [[-60, 40], [58, 44], [-62, -40], [60, -36], [42, 70], [-44, -70]]) sh.add(box(5, 3, 5, LIME, x, 0, z), box(5.6, 0.7, 5.6, LATERITE, x, 0, z), at(hipRoof(7, 7, 2.6, TILE), x, 3, z));
  f.add(mergeByMaterial(sh));
  // Trees within the wall, and the great trees of the maidan round it.
  g.add(trees([[-70, 70], [72, 64], [-74, -66], [70, -74], [-40, 78], [40, -80], [-82, 10], [82, -12]], { kind: 'banyan', seed: 4 }));
  g.add(trees([[-30, 74], [30, 78], [-78, -30], [80, 30]], { kind: 'palm', seed: 5 }));
  const ring = [];
  for (let k = 0; k < 44; k++) {
    const a = (k / 44) * Math.PI * 2 + 0.05, r = S / 2 + 18 + ((k * 37) % 5) * 9;
    const x = Math.sin(a) * r * 1.12, z = Math.cos(a) * r * 1.12;
    if (Math.abs(x) < 10 || Math.abs(z) < 10) continue;
    ring.push([x, z]);
  }
  g.add(trees(ring.filter((_, k) => k % 3 === 0), { kind: 'banyan', seed: 7 }), trees(ring.filter((_, k) => k % 3 === 1), { kind: 'peepal', seed: 8 }), trees(ring.filter((_, k) => k % 3 === 2), { kind: 'teak', seed: 9 }));
  g.add(shrubs(scatter(30, [-S / 2 + 4, S / 2 - 4, -S / 2 + 4, S / 2 - 4], { seed: 3, gap: 6, avoid: [[-45, 45, -75, 40], [-6, 6, 0, S / 2], [-6, 6, -S / 2, 0]] }).map(([x, z]) => [x, z, 1.3]), { seed: 3 }));
  // The Swaraj Round: a ring road round the maidan, and the buildings of the city along its far side.
  const road = new THREE.Group(), N = 64;
  for (let k = 0; k < N; k++) {
    const a = (k / N) * Math.PI * 2, b = box(2 * Math.PI * R / N + 0.6, 0.05, 14, M.asphalt, Math.sin(a) * R, 0, Math.cos(a) * R);
    b.rotation.y = a; road.add(b);
  }
  g.add(mergeByMaterial(road));
  const houses = [];
  for (let k = 0; k < 48; k++) { const a = (k / 48) * Math.PI * 2 + 0.03; houses.push([Math.sin(a) * (R + 22), Math.cos(a) * (R + 22), 18, 14, 3 + (k % 3), a + Math.PI]); }
  g.add(townHouses(houses, { seed: 6, tanks: 0.4 }));
  g.add(lampPosts(around(24, R - 9)));
  if (!detail.low) g.add(stalls(around(10, S / 2 + 12, 0, 0, 0.15).map(([x, z]) => [x, z, Math.atan2(x, z)])));
  // Traffic on the ring road: straight runs on the four sides where the curve is gentle.
  if (!detail.low) for (const a of [0, Math.PI / 2, Math.PI, -Math.PI / 2]) {
    const t = traffic([[-3.2, 1], [3.2, -1]], -60, 60, { y: 0.05, seed: 3 + a, gap: 30, buses: 0.2, trucks: 0.05 });
    t.position.set(Math.sin(a) * R, 0, Math.cos(a) * R); t.rotation.y = a;
    g.add(t);
  }
}

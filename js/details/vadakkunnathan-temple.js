import * as THREE from 'three';
import { M, mat, mesh, box, cyl, at, hipRoof, kalash, doubleSided } from '../helpers.js';
import { mergeByMaterial, gableRoof, frieze } from '../parts/components.js';
import { nandi } from '../parts/animals.js';
import { trees, shrubs, lampPosts, stalls, scatter, around, townHouses, traffic } from '../parts/realism.js';
import { detail } from '../detail.js';
import { P, LIME, LATERITE, TILE, TEAK, COPPER, BRASS } from '../monuments/vadakkunnathan-temple.js';

// A mural as a painted panel w × h on a wall at z = 0, in a teak frame on an ochre ground bordered
// in red: `vasuki`, Shiva reclining on the coils of the serpent Vasuki under its spread hoods;
// `nataraja`, Nrithanatha, the dancing Shiva with his twenty arms fanned out round him.
const PAINT = { ochre: mat('#c28a45', 0.8), red: mat('#8f2f22', 0.8), green: mat('#3f6b4f', 0.8), white: mat('#e9e0cc', 0.8), black: mat('#2b2420', 0.8) };
function mural(kind, w = 3.4, h = 2.3) {
  const g = new THREE.Group(), p = (m, pw, ph, x, y, rot = 0, z = 0.06) => { const b = box(pw, ph, 0.03, m, 0, -ph / 2, 0); b.rotation.z = rot; g.add(at(b, x, y, z)); return b; };
  g.add(box(w + 0.3, h + 0.3, 0.08, TEAK, 0, 0, 0.04), box(w, h, 0.03, PAINT.red, 0, 0.15, 0.085), box(w - 0.3, h - 0.3, 0.03, PAINT.ochre, 0, 0.3, 0.095));
  const y0 = 0.3;
  if (kind === 'vasuki') {
    for (let k = 0; k < 3; k++) p(PAINT.green, w * 0.62 - k * 0.25, 0.2, -0.1, y0 + 0.35 + k * 0.2, 0, 0.11);
    for (let k = -2; k <= 2; k++) p(PAINT.green, 0.2, 0.75, -w * 0.3 + k * 0.1, y0 + 1.55, -k * 0.28, 0.11);
    p(PAINT.white, w * 0.48, 0.3, 0, y0 + 1.1, 0.08, 0.125); p(PAINT.white, 0.34, 0.34, -w * 0.27, y0 + 1.32, 0, 0.125); p(PAINT.red, w * 0.2, 0.16, w * 0.08, y0 + 1.0, 0.08, 0.14);
    for (const x of [0.25, 0.42]) p(PAINT.black, 0.16, 0.55, w * x, y0 + 1.3, 0, 0.11);
  } else {
    p(PAINT.green, 1.5, 0.12, 0, y0 + 0.2, 0, 0.11);
    for (let k = 0; k < 10; k++) for (const s of [-1, 1]) p(PAINT.white, 0.07, 0.8, s * 0.12, y0 + 1.42, s * (0.35 + k * 0.26), 0.11);
    p(PAINT.white, 0.34, 0.75, 0, y0 + 1.15, 0, 0.125); p(PAINT.white, 0.28, 0.28, 0, y0 + 1.85, 0, 0.125); p(PAINT.red, 0.38, 0.3, 0, y0 + 0.92, 0, 0.14); p(PAINT.black, 0.2, 0.14, 0, y0 + 1.99, 0, 0.14);
    p(PAINT.white, 0.13, 0.55, -0.1, y0 + 0.5, 0.25, 0.125); p(PAINT.white, 0.13, 0.5, 0.2, y0 + 0.62, -0.9, 0.125);
  }
  return g;
}

// The smaller shrines of the outer court, each after its kind. All stand on a laterite base.
// - a square cell w across under a pyramid of tiles or copper, with a finial (`porch`: an open
//   gabled porch of four posts before its door);
// - `round`: a small round cell under a tiled cone.
function cell(w, { roofM = TILE, porch = 0, round = false, h = 2.8 } = {}) {
  const g = new THREE.Group();
  if (round) {
    g.add(cyl(w / 2 + 0.5, w / 2 + 0.6, 0.7, LATERITE, 0, 0, 0, 20), cyl(w / 2, w / 2, h, LIME, 0, 0.7, 0, 20));
    g.add(mesh(new THREE.ConeGeometry(w / 2 + 1, w * 0.6 + 0.6, 20, 1, true), doubleSided(roofM), 0, 0.7 + h + (w * 0.6 + 0.6) / 2, 0), at(kalash(0.28, BRASS), 0, 0.7 + h + w * 0.6 + 0.35, 0));
  } else {
    g.add(box(w + 1, 0.7, w + 1, LATERITE), box(w, h, w, LIME, 0, 0.7, 0), box(w + 0.2, 0.25, w + 0.2, frieze(TEAK), 0, 0.7 + h - 0.25, 0));
    g.add(at(hipRoof(w + 2.2, w + 2.2, w * 0.42 + 0.6, roofM), 0, 0.7 + h, 0), at(kalash(0.3, BRASS), 0, 0.7 + h + w * 0.42 + 0.4, 0));
  }
  g.add(box(1, 1.9, 0.1, TEAK, 0, 0.7, w / 2 + 0.04));
  if (porch) {
    g.add(box(w * 0.8 + 0.6, 0.5, porch + 0.4, LATERITE, 0, 0, w / 2 + porch / 2 + 0.5));
    for (const s of [-1, 1]) for (const z of [0.3, porch]) g.add(box(0.2, h, 0.2, TEAK, s * w * 0.36, 0.5, w / 2 + 0.4 + z));
    g.add(at(gableRoof(w * 0.8 + 1.4, porch + 1.2, 1.3, doubleSided(roofM)), 0, 0.5 + h, w / 2 + 0.5 + porch / 2));
  }
  return g;
}

// Vadakkunnathan's grounds and Thekkinkadu Maidan. Within the wall: paths of laterite from the east
// and west gateways to the cloister; on its verandah before Shiva's door the great white bull
// Nandikeswara under his own roof, facing the shrine, and beside the door the two murals that are
// worshipped daily, Vasukisayana and Nrithanatha; round the outer court, going clockwise, the
// shrines of Gosala Krishna, Parashurama, Simhodara, Ayyappa and Vettekkaran, the platform of the
// serpent stones under its tree and the samadhi of Adi Shankara with the conch and discus beside it.
// There is no flagstaff: the temple keeps no annual festival of its own. Without the wall: the
// maidan, some 65 acres of open ground and great old trees, banyan, peepal and teak, where the
// Pooram is held; and round it the Swaraj Round, the ring road of Thrissur, lined with shops.
export function addDetails(f, g) {
  const { S, CD, doors } = P, R = 205;
  g.add(box(760, 0.06, 760, M.grass, 0, -0.06, 0));
  // The paths within the wall, and the open sanded court round the cloister.
  g.add(box(S - 3, 0.03, S - 3, M.path, 0, 0, 0));
  g.add(box(8, 0.06, S / 2 - CD / 2, M.path, 0, 0.03, (S / 2 + CD / 2) / 2), box(8, 0.06, S / 2 - CD / 2, M.path, 0, 0.03, -(S / 2 + CD / 2) / 2));
  g.add(box(doors[2] - doors[0] + 8, 0.06, 6, M.path, (doors[0] + doors[2]) / 2, 0.03, CD / 2 + 7));
  // The paths across the maidan from each gateway to the ring road.
  for (const [x, z, w, d] of [[0, S / 2 + 51, 9, 102], [0, -S / 2 - 51, 9, 102], [S / 2 + 51, 0, 102, 9], [-S / 2 - 51, 0, 102, 9]]) g.add(box(w, 0.05, d, M.path, x, 0, z));
  // Nandikeswara on the verandah, north of Shiva's door: a tiled roof on four posts over the bull.
  const nd = at(new THREE.Group(), doors[0] - 9, 0, CD / 2 + 4.6), white = mat('#f4f1ea', 0.6);
  nd.add(box(6.4, 0.9, 7.4, LATERITE), at(hipRoof(7.6, 8.6, 2.2, TILE), 0, 4.5, 0), at(kalash(0.3, BRASS), 0, 6.6, 0));
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) nd.add(box(0.3, 3.6, 0.3, TEAK, sx * 2.8, 0.9, sz * 3.3));
  nd.add(at(nandi(white, 1.05), 0, 0.9, 0.6).rotateY(Math.PI));
  f.add(nd);
  // The two worshipped murals, on the cloister's wall either side of Shiva's door.
  for (const [s, kind] of [[-1, 'vasuki'], [1, 'nataraja']]) f.add(at(mural(kind, 3, 2.1), doors[0] + s * 4.6, 1.75, CD / 2 + 0.62));
  // The shrines of the outer court.
  const sh = new THREE.Group(), put = (o, x, z, a = 0) => { o.position.set(x, 0, z); o.rotation.y = a; sh.add(o); };
  put(cell(6, { roofM: COPPER, porch: 4, h: 3.2 }), -70, 24);                     // Gosala Krishna
  put(cell(4.2), -62, -58);                                                       // Parashurama
  put(cell(3.4, { h: 2.4 }), -18, -70);                                           // Simhodara
  put(cell(5, { porch: 3 }), 64, -34, -Math.PI / 2);                              // Ayyappa
  put(cell(4, { round: true }), 68, 16, -Math.PI / 2);                            // Vettekkaran
  put(cell(3, { round: true, roofM: COPPER, h: 2.2 }), 30, 72);                   // Adi Shankara's samadhi
  // The conch and discus (Shankha-Chakra) on their platform beside the samadhi.
  sh.add(box(3, 0.6, 2, LATERITE, 37, 0, 72), cyl(0.3, 0.3, 0.08, M.granite, 36.4, 1.0, 72, 12).rotateX(Math.PI / 2), at(mesh(new THREE.SphereGeometry(0.28, 8, 6), M.granite), 37.6, 0.9, 72));
  // The serpent stones (nagas) on a laterite platform under a tree.
  sh.add(box(7, 0.6, 5, LATERITE, 56, 0, 58));
  for (let k = 0; k < 7; k++) sh.add(box(0.4, 0.7 + (k % 3) * 0.15, 0.14, M.graniteDark, 53.6 + k * 0.8, 0.6, 58.6 - (k % 2) * 1.2));
  f.add(mergeByMaterial(sh));
  g.add(trees([[57, 55.8]], { kind: 'peepal', seed: 2 }));
  // Trees within the wall, and the great trees of the maidan round it.
  g.add(trees([[-70, 70], [72, 64], [-74, -66], [70, -74], [-40, 78], [40, -80], [-82, 10], [82, -12]], { kind: 'banyan', seed: 4 }));
  g.add(trees([[-16, 80], [18, 82], [-78, -30], [80, 36]], { kind: 'palm', seed: 5 }));
  const ring = [];
  for (let k = 0; k < 44; k++) {
    const a = (k / 44) * Math.PI * 2 + 0.05, r = S / 2 + 18 + ((k * 37) % 5) * 9;
    const x = Math.sin(a) * r * 1.12, z = Math.cos(a) * r * 1.12;
    if (Math.abs(x) < 10 || Math.abs(z) < 10) continue;
    ring.push([x, z]);
  }
  g.add(trees(ring.filter((_, k) => k % 3 === 0), { kind: 'banyan', seed: 7 }), trees(ring.filter((_, k) => k % 3 === 1), { kind: 'peepal', seed: 8 }), trees(ring.filter((_, k) => k % 3 === 2), { kind: 'teak', seed: 9 }));
  g.add(shrubs(scatter(30, [-S / 2 + 4, S / 2 - 4, -S / 2 + 4, S / 2 - 4], { seed: 3, gap: 6, avoid: [[-46, 46, -36, 40], [-56, -24, 48, 72], [-76, -64, 16, 34], [50, 62, 52, 64], [-6, 6, 0, S / 2], [-6, 6, -S / 2, 0]] }).map(([x, z]) => [x, z, 1.3]), { seed: 3 }));
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

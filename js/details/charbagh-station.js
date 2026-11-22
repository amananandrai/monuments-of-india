import * as THREE from 'three';
import { M, mat, box, cyl, at, guldasta, inst, unitBox, tricolour } from '../helpers.js';
import { mergeByMaterial } from '../parts/components.js';
import { detail } from '../detail.js';
import { track, train, overhead, platform, RAIL_TOP } from '../parts/transport.js';
import { trees, shrubs, lampPosts, fountains, benches, cityAround, scatter, along, around } from '../parts/realism.js';
import { CB, RED, WHITE } from '../monuments/charbagh-station.js';

// Charbagh Station, finer detail. From photographs: slender Lucknow turrets (guldastas) stand on
// the parapet between the kiosks and at the corners of every pavilion; a white clock panel and the
// station's name board sit over the carriage porch.
function architecture(f) {
  const d = new THREE.Group(), { W, FZ, b, H, CW, CZ, MX, EX, PW } = CB, top = b + H, n = 40, p = W / n;
  const taken = (x) => Math.abs(x) < CW / 2 + 0.6 || Math.abs(Math.abs(x) - MX) < PW / 2 + 0.6 || Math.abs(Math.abs(x) - EX) < PW / 2 + 0.6;
  if (!detail.low) for (let k = 1; k < n; k += 2) { const x = -W / 2 + k * p; if (!taken(x)) d.add(at(guldasta(2.4, 0.2, WHITE), x, top + 1.4, FZ - 0.5)); }
  for (const s of [-1, 1]) {
    for (const x of [MX - PW / 2 + 0.4, MX + PW / 2 - 0.4]) d.add(at(guldasta(3.0, 0.28, WHITE), s * x, top + 1.6 + 1.4, FZ + 2.6));
    for (const x of [-11, -3.6, 3.6, 11]) d.add(at(guldasta(2.6, 0.24, WHITE), x, 0.5 + 8.7, CZ + 9.6));
  }
  // The name board over the porch's middle arch, and a white roundel (the clock) on the block above.
  d.add(box(9, 1.0, 0.12, mat('#f3e9a8', 0.7), 0, 0.5 + 8.75, CZ + 9.9), box(9.3, 1.25, 0.08, mat('#23262a', 0.7), 0, 0.5 + 8.62, CZ + 9.84));
  d.add(cyl(1.2, 1.2, 0.16, WHITE, 0, 0, 0, 24).rotateX(Math.PI / 2).translateY(CZ + 0.1).translateZ(-(top + 1.9)));
  f.add(mergeByMaterial(d));
  f.add(at(tricolour(7, 3.2), 0, top + 3 + 1.4, CZ - 2));
}

// The station behind the front: a concourse under a pitched roof, then four island platforms 380 m
// long under their canopies, eight platform lines between them and two through lines beyond, all
// wired; trains stand at several of them. Two footbridges cross the lines.
const SHEET = mat('#7f8a8f', 0.6, 0.3), IRON = mat('#4a4f52', 0.6, 0.5), BALLAST = mat('#6a635b', 0.97);
function yard() {
  const g = new THREE.Group(), L = 380, PZ = [-31.5, -49.5, -67.5, -85.5];
  g.add(box(L + 60, 0.12, 96, BALLAST, 0, 0, -70));
  // The concourse between the building and platform 1.
  const c = new THREE.Group();
  for (const s of [-1, 1]) { const slab = box(150, 0.18, 10, SHEET, 0, 0, 0); slab.position.set(0, 9.0, -18 + s * 4.6); slab.rotation.x = s * 0.22; c.add(slab); }
  const posts = [];
  for (let x = -72; x <= 72; x += 12) for (const z of [-26.4, -18, -9.8]) posts.push([x, 0, z, 0.3, z === -18 ? 10 : 8, 0.3]);
  c.add(inst(unitBox(), posts, IRON), box(152, 0.2, 18, M.path, 0, 0, -18));
  g.add(c);
  const lines = [];
  PZ.forEach((z, k) => {
    g.add(at(platform(L, 9, { canopy: true }), 0, 0, z));
    lines.push([z - 6.3, -1], [z - 11.7, 1]);
    // Benches' worth of shelter is the canopy; a name board at each end of the platform.
    for (const s of [-1, 1]) g.add(box(3.4, 1.1, 0.2, mat('#f0c93a', 0.7), s * (L / 2 - 8), 2.4, z), box(0.2, 2.4, 0.2, IRON, s * (L / 2 - 9.4), 1.05, z), box(0.2, 2.4, 0.2, IRON, s * (L / 2 - 6.6), 1.05, z));
  });
  lines[lines.length - 1][1] = -1;
  lines.push([-108.6, -1]);
  for (const [z, side] of lines) {
    g.add(at(track(L + 50, { ballast: false }), 0, 0.12, z));
    if (!detail.low || side < 0) g.add(at(overhead(L + 50, { span: 54, side: -side }), 0, 0.12, z));
  }
  // Trains: a blue mail, a red Rajdhani rake, a Vande Bharat, a green Garib Rath, a suburban MEMU.
  const stock = [[0, 14, 'blue', -40], [2, 12, 'red', 30], [3, 8, 'vande', -70], [5, 13, 'green', 10], [8, 10, 'blue', 60], [6, 8, 'emu', -90]];
  for (const [k, cars, livery, x] of detail.low ? stock.slice(0, 3) : stock) g.add(at(train(cars, { livery }), x, 0.12 + RAIL_TOP, lines[k][0]));
  // The footbridges: a lattice-sided deck on trestles, a stair down to each platform.
  for (const x of [-90, 96]) {
    const fb = new THREE.Group();
    fb.add(box(3.6, 0.3, 78, IRON, 0, 7.6, -62), box(4, 0.15, 78, SHEET, 0, 10.4, -62));
    for (const s of [-1, 1]) fb.add(box(0.1, 1.2, 78, IRON, s * 1.8, 7.9, -62));
    for (const z of PZ) {
      for (const s of [-1, 1]) fb.add(box(0.3, 9.4, 0.3, IRON, s * 1.7, 1.05, z + 3), box(0.3, 9.4, 0.3, IRON, s * 1.7, 1.05, z - 3));
      const st = box(13, 0.3, 2.4, IRON, 0, 0, 0); st.position.set(8.2, 4.4, z); st.rotation.z = -0.5; fb.add(st);
    }
    g.add(at(mergeByMaterial(fb), x, 0, 0));
  }
  g.children.forEach((o) => { o.userData.dressing = true; });
  return g;
}

// The forecourt, after photographs and the plan: a paved drive before the porch, the great round
// lawn with its fountain and a ring road round it, lawns and beds either side (what is left of the
// Nawabs' four gardens), palms and ashoka round them; Station Road beyond, and the houses and
// hotels of Charbagh and Naka Hindola on every side.
export function addDetails(f, g) {
  architecture(f);
  const { W, CZ } = CB, KERB = mat('#ddd6c6', 0.85), CX = 0, CZ0 = 82, R = 30;
  g.add(box(520, 0.15, 330, M.grass, 0, 0, 30));
  g.add(box(W + 40, 0.22, 26, M.path, 0, 0, CZ + 20), box(520, 0.2, 18, M.asphalt, 0, 0, 144));
  // The round lawn in its ring road, a fountain basin at its centre and flower beds round it.
  g.add(cyl(R + 11, R + 11, 0.2, M.asphalt, CX, 0, CZ0, 64), cyl(R, R, 0.3, KERB, CX, 0, CZ0, 64), cyl(R - 0.5, R - 0.5, 0.36, mat('#5f8a44', 0.95), CX, 0, CZ0, 64));
  g.add(cyl(6.6, 6.6, 0.7, KERB, CX, 0, CZ0, 32), cyl(6, 6, 0.76, M.water, CX, 0, CZ0, 32), cyl(0.6, 0.9, 1.8, KERB, CX, 0, CZ0, 12), cyl(1.8, 0.4, 0.3, KERB, CX, 1.8, CZ0, 16));
  g.add(fountains([[CX, CZ0], ...around(detail.low ? 4 : 8, 3.6, CX, CZ0)], { y: 0.76, h: 3 }), fountains([[CX, CZ0]], { y: 2.1, h: 3.5 }));
  g.add(shrubs(around(detail.low ? 6 : 20, 12, CX, CZ0).map(([x, z]) => [x, z, 1.1]), { flowers: '#e0a020', seed: 3 }), shrubs(around(detail.low ? 8 : 28, R - 3, CX, CZ0).map(([x, z]) => [x, z, 1.2]), { flowers: '#d0306f', seed: 7 }));
  for (const s of [-1, 1]) g.add(box(12, 0.2, 60, M.asphalt, s * 62, 0, 108), box(60, 0.21, 10, M.path, s * 52, 0, 82));
  g.add(box(12, 0.2, 14, M.asphalt, 0, 0, 129));
  g.add(trees(around(12, R + 15, CX, CZ0, 0.26).filter(([x, z]) => Math.abs(x) > 12 && z > 56), { kind: 'palm', seed: 5, h: 11 }));
  g.add(trees([-1, 1].flatMap((s) => [...along(8, [s * 76, 62], [s * 190, 62]), ...along(10, [s * 72, 132], [s * 240, 132])]), { kind: 'ashoka', seed: 9 }));
  g.add(trees([-1, 1].flatMap((s) => scatter(9, [s > 0 ? 78 : -200, s > 0 ? 200 : -78, 70, 124], { seed: 30 + s, gap: 16 })), { kind: 'neem', seed: 33 }));
  g.add(lampPosts([...around(12, R + 12.5, CX, CZ0), ...along(9, [-96, CZ + 33.5], [96, CZ + 33.5]), ...along(12, [-240, 134], [240, 134]).filter(([x]) => Math.abs(x) > 10)], { h: 5 }));
  g.add(benches(around(6, R - 1.6, CX, CZ0, 0.5)));
  g.add(yard());
  g.add(cityAround([-262, 262, -122, 156], { rows: detail.low ? 1 : 2, gap: 6, storeys: [2, 5], seed: 61, every: detail.low ? 6 : 2,
    keep: [[-8, 8, 150, 400], [-400, -250, -116, -24], [250, 400, -116, -24]], paint: ['#e6dcc6', '#d9c7a8', '#c9b08a', '#e9d9b8', '#d6cfc2', '#e7b9b0'] }));
}

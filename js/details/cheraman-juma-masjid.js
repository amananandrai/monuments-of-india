import * as THREE from 'three';
import { M, mat, box, at, sheet, surface, rng, inst, unitBox } from '../helpers.js';
import { mergeByMaterial, railing, jali } from '../parts/components.js';
import { steps } from '../parts/doorways.js';
import { trees, shrubs, lampPosts, scatter, along, townHouses, traffic } from '../parts/realism.js';
import { detail } from '../detail.js';
import { P, LIME, LATERITE, TILE, TEAK, ridgeRoof } from '../monuments/cheraman-juma-masjid.js';

// Cheraman Juma Masjid on the Kodungallur road at Methala. Before the east front lies the broad
// court of pale stone slabs laid in the restoration over the new underground prayer hall, railed
// in white lattice, with the stair down to the hall sunk into its south side. The campus is
// entered from the road through a gateway of bare laterite piers under tiled roofs. North of the
// mosque is the ablution tank (kulam) with laterite steps down to the water; south of it the old
// graveyard, leaf-shaped headstones among shrubs, and the maqbara, where the two old tombs
// believed to be Habib bin Malik's and his wife Khumarriah's lie side by side under green cloths;
// beyond it the two-storey heritage museum. Coconut palms stand everywhere, and the houses and
// shops of Methala line the road.
export function addDetails(f, g) {
  const { W, D, B } = P, STONE = surface(mat('#d6d2c6', 0.8), 'paving'), CLOTH = mat('#2f7a4a', 0.9), GREY = mat('#8d8a80', 0.9);
  g.add(box(420, 0.06, 420, M.grass, 0, -0.06, 0));
  const X = 40, zf = D / 2 + 44, zb = -D / 2 - 26;
  // The campus's paths and yard, paved in stone, and the road in front.
  g.add(box(2 * X - 1, 0.04, zf - zb - 1, M.path, 0, 0, (zf + zb) / 2));
  g.add(box(360, 0.05, 11, M.asphalt, 0, 0, zf + 9));
  // The court: a low platform of stone slabs, its lattice rail, the steps up from the gateway and
  // the stair sunk into its south side that leads down to the underground hall.
  const ct = new THREE.Group(), CW = 17, z0 = D / 2 + 3.2, z1 = zf - 9, ch = B - 0.25, sx = -CW + 3.5, sz = z0 + 9;
  ct.add(box(2 * CW, ch, z1 - z0, STONE, 0, 0, (z0 + z1) / 2), box(W + 14, ch, z0 + D / 2 + 3, STONE, 2, 0, (z0 - D / 2 - 3) / 2));
  const rail = (len, x, z, ry) => ct.add(at(railing(len, 1, 0.12, LIME, 2.2, jali(LIME)), x, ch, z).rotateY(ry));
  rail(z1 - z0, CW - 0.1, (z0 + z1) / 2, Math.PI / 2); rail(z1 - z0 - 14, -CW + 0.1, (z0 + z1) / 2 + 7, Math.PI / 2);
  for (const s of [-1, 1]) rail(CW - 3.5, s * (CW + 3.5) / 2, z1 - 0.1, 0);
  ct.add(at(steps(6.6, ch, 3, STONE, 0.45), 0, 0, z1));
  ct.add(box(6.4, 0.06, 13.6, M.recess, sx, ch, sz), at(steps(5.6, ch, 4, GREY, 0.5), sx, 0.07 + ch - ch, sz - 6.6).rotateY(Math.PI));
  for (let k = 0; k < 6; k++) ct.add(box(5.6, 0.1, 1.9, GREY, sx, ch + 0.02 - k * 0.001, sz - 5 + k * 2).translateY(0));
  rail(13.8, sx + 3.3, sz, Math.PI / 2); rail(6.6, sx, sz + 6.9, 0);
  f.add(mergeByMaterial(ct));
  // The campus wall of laterite, whitewashed above a bare base, open at the gateway.
  const wl = new THREE.Group();
  for (const s of [-1, 1]) {
    wl.add(box(X - 6.5, 1.8, 0.5, LIME, s * (X + 6.5) / 2, 0, zf), box(X - 6.5, 0.5, 0.6, LATERITE, s * (X + 6.5) / 2, 0, zf));
    wl.add(box(0.5, 1.8, zf - zb, LIME, s * X, 0, (zf + zb) / 2));
  }
  wl.add(box(2 * X, 1.8, 0.5, LIME, 0, 0, zb));
  // The gateway: two tall laterite piers under a tiled roof, a lower pier and roof either side,
  // lattice panels between.
  for (const s of [-1, 1]) {
    wl.add(box(1.5, 3.6, 2.6, LATERITE, s * 3.1, 0, zf), box(1.2, 2.5, 1.6, LATERITE, s * 6, 0, zf), box(1.9, 1.9, 0.12, jali(LIME), s * 4.6, 0.2, zf));
    wl.add(at(ridgeRoof(3.4, 4.6, 0.9, 1.6, 1.6, TILE), s * 5.3, 2.5, zf).rotateY(Math.PI / 2));
  }
  wl.add(box(8, 0.3, 3, TEAK, 0, 3.6, zf), at(ridgeRoof(4.6, 10, 1.5, 2.2, 2.2, TILE), 0, 3.9, zf).rotateY(Math.PI / 2));
  g.add(mergeByMaterial(wl));
  // The ablution tank, north of the mosque: inside a low whitewashed rim, laterite steps go down
  // on every side to green water.
  const tk = new THREE.Group(), tx = W / 2 + 22, tz = -8, s0 = 15;
  for (let k = 0; k < 5; k++) {
    const s = s0 - k * 1.4, h = 1.25 - k * 0.25;
    for (const q of [-1, 1]) tk.add(box(s, h, 0.7, LATERITE, tx, 0, tz + q * (s / 2 - 0.35)), box(0.7, h, s - 1.4, LATERITE, tx + q * (s / 2 - 0.35), 0, tz));
  }
  for (const q of [-1, 1]) tk.add(box(s0 + 0.6, 0.35, 0.8, LIME, tx, 1.25, tz + q * (s0 / 2 - 0.1)), box(0.8, 0.35, s0 - 1, LIME, tx + q * (s0 / 2 - 0.1), 1.25, tz));
  g.add(mergeByMaterial(tk), sheet(s0 - 6.95, s0 - 6.95, M.water, tx, 0.12, tz));
  // The maqbara, south of the mosque: an open tiled shelter on teak posts over the two old tombs,
  // each a low whitewashed cenotaph under a green cloth, with a headstone.
  const mq = new THREE.Group(), mx = -W / 2 - 9, mz = 3;
  mq.add(box(6.4, 0.35, 5.4, LIME, mx, 0, mz), at(ridgeRoof(7.6, 6.6, 1.7, 2.6, 2.6, TILE), mx, 3, mz).rotateY(Math.PI / 2), box(6.2, 0.2, 5.2, TEAK, mx, 2.8, mz));
  for (const a of [-1, 1]) for (const b of [-1, 1]) mq.add(box(0.22, 2.45, 0.22, TEAK, mx + a * 2.9, 0.35, mz + b * 2.4));
  for (const s of [-1, 1]) mq.add(box(1, 0.5, 2.3, LIME, mx + s * 1.1, 0.35, mz), box(1.12, 0.12, 2.42, CLOTH, mx + s * 1.1, 0.85, mz), box(0.5, 0.75, 0.14, LIME, mx + s * 1.1, 0.35, mz - 1.35));
  f.add(mergeByMaterial(mq));
  // The graveyard round it: small leaf-shaped headstones of grey stone, each at the head of a low
  // mound, among shrubs.
  const R = rng(11), graves = scatter(16, [-W / 2 - 24, -W / 2 - 3, -18, 14], { seed: 12, gap: 3.2, avoid: [[mx - 5, mx + 5, mz - 4.5, mz + 4.5]] });
  f.add(inst(unitBox(), graves.flatMap(([x, z]) => [[x, 0, z, 0.9, 0.18, 1.9, 0], [x, 0, z - 1.05, 0.42, 0.45 + R() * 0.3, 0.1, 0], [x, 0, z + 1.05, 0.3, 0.3, 0.1, 0]]), GREY));
  g.add(shrubs(scatter(22, [-W / 2 - 25, -W / 2 - 3, -19, 15], { seed: 13, gap: 2.4, avoid: [[mx - 5, mx + 5, mz - 4.5, mz + 4.5], ...graves.map(([x, z]) => [x - 1, x + 1, z - 1.6, z + 1.6])] }).map(([x, z]) => [x, z, 0.9]), { seed: 8 }));
  // The heritage museum: two whitewashed storeys with barred windows under a tiled roof, a tiled
  // verandah along its front.
  const mu = new THREE.Group(), ux = -X + 11, uz = zb + 9;
  mu.add(box(16, 6.4, 8, LIME, ux, 0, uz), at(ridgeRoof(10, 18, 2.6, 5, 5, TILE), ux, 6.4, uz).rotateY(Math.PI / 2), box(16.6, 0.15, 3, TILE, ux, 3.1, uz + 5.2));
  for (let k = 0; k < 6; k++) {
    const x = ux - 6.6 + k * 2.64;
    mu.add(box(0.2, 3.1, 0.2, TEAK, x, 0, uz + 6.5), box(1.1, 1.3, 0.06, TEAK, x, 4.1, uz + 4.03), box(1.1, k === 2 ? 2.1 : 1.3, 0.06, TEAK, x, k === 2 ? 0.1 : 1.1, uz + 4.03));
  }
  g.add(mergeByMaterial(mu));
  // Palms in and round the campus; shrubs along the wall.
  g.add(trees([[-X + 5, zf - 6], [X - 5, zf - 5], [-X + 6, zb + 3], [X - 6, zb + 8], [-X + 4, 18], [12, zb + 5], [-10, zb + 4], [X - 4, 14], [X - 5, 30], [-X + 6, 34]], { kind: 'palm', seed: 4 }));
  g.add(trees(scatter(55, [-190, 190, -190, 190], { seed: 5, gap: 10, avoid: [[-X - 6, X + 6, zb - 6, zf + 4], [-200, 200, zf + 2, zf + 40]] }), { kind: 'palm', seed: 5 }));
  g.add(trees([[-70, -40], [64, -60], [-58, 60], [80, 30], [X - 8, -4], [-X + 8, -22]], { kind: 'mango', seed: 6 }));
  g.add(shrubs([...along(6, [-X + 3, zf - 1.5], [-9, zf - 1.5]), ...along(6, [9, zf - 1.5], [X - 3, zf - 1.5])].map(([x, z]) => [x, z, 1.1]), { flowers: '#d0306f', seed: 7 }));
  // Methala along the road: shops and houses, and the traffic on the road.
  g.add(townHouses([...Array(16)].map((_, k) => [-150 + k * 20, zf + 24, 15, 11, 2, Math.PI]), { seed: 3, roof: 'pitched', roofs: ['#8e4630', '#9a4a32', '#7d3e2a'], tanks: 0 }));
  g.add(townHouses([[-X - 16, -10, 14, 12, 2, Math.PI / 2], [-X - 16, 12, 14, 12, 2, Math.PI / 2], [X + 18, 20, 14, 12, 2, -Math.PI / 2]], { seed: 9, roof: 'pitched', roofs: ['#8e4630'], tanks: 0 }));
  if (!detail.low) g.add(traffic([[zf + 6.5, 1], [zf + 11.5, -1]], -170, 170, { y: 0.05, seed: 6, gap: 30, buses: 0.15, trucks: 0.05 }));
  g.add(lampPosts([...along(7, [-120, zf + 3], [120, zf + 3])]));
}

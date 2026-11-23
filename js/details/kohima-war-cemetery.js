import * as THREE from 'three';
import { mat, box, cyl, at, inst, unitBox, mesh, rng, surface } from '../helpers.js';
import { heightField, fbm, smooth } from '../parts/terrain.js';
import { trees, shrubs, scatter, along, townHouses, traffic } from '../parts/realism.js';
import { mergeByMaterial } from '../parts/components.js';
import { detail } from '../detail.js';
import { STONE, STONE_LIGHT, BRONZE, TERRACES, RISE, DEPTH, HALF } from '../monuments/kohima-war-cemetery.js';

const ROSE = '#c8323c', ROAD = mat('#4f4f52', 0.92), MONO = surface(mat('#a3927a', 0.95, 0, { flatShading: true }), 'none');
// The cream ashlar of the cremation memorial and the tablets; the dark bronze of the name panels;
// the clipped hedges on the terrace walls; the cherry's blossom.
const CREAM = surface(mat('#d9cdb4', 0.85), 'none'), PANEL = surface(mat('#2e2a26', 0.5, 0.5), 'none'), HEDGE = surface(mat('#3f5f33', 0.95), 'ground'), BLOSSOM = surface(mat('#eab9c8', 0.9), 'none');

// Kohima War Cemetery, finer detail and setting. Each terrace carries two rows of graves, each a
// low block of grey stone, its top sloping, with a bronze plaque laid on it, facing down the hill,
// with roses along the rows; the shelter under the cross has an open arcade and a dedication tablet;
// the 2nd Division memorial at the foot is a tall rough standing stone before a curved wall of
// tablets; and the cremation memorial to the Hindu and Sikh dead stands at the top. Round it: the ridges of Kohima, their slopes of pine and broadleaf forest and the
// town's houses under coloured iron roofs, and the Imphal road at the foot. Dimensions follow
// js/monuments/kohima-war-cemetery.js.
function graves(f) {
  const ped = [], plq = [], roses = [];
  const plaque = new THREE.BoxGeometry(0.46, 0.03, 0.34).rotateX(0.3).translate(0, 0.25, 0.01);
  const block = new THREE.BoxGeometry(0.6, 0.36, 0.5).rotateX(0.3).translate(0, 0.06, 0);
  for (let k = 0; k <= TERRACES; k++) {
    const w = 2 * HALF - k * 3, y = k * RISE + 0.06, z0 = -k * DEPTH;
    for (const dz of [-2.6, 2.4]) {
      for (let x = -w / 2 + 3; x < w / 2 - 3; x += 1.5) {
        if (Math.abs(x) < 7.2) continue;
        ped.push([x, y, z0 + dz, 1, 1, 1, 0]);
        plq.push([x, y, z0 + dz, 1, 1, 1, 0]);
      }
      roses.push(...along(Math.floor((w - 16) / 6), [-w / 2 + 3, z0 + dz + 1.1], [w / 2 - 3, z0 + dz + 1.1]).filter(([x]) => Math.abs(x) > 8).map(([x, z]) => [x, z, 0.75, y]));
    }
  }
  f.add(inst(block, ped, STONE_LIGHT), inst(plaque, plq, BRONZE));
  f.add(shrubs(roses, { seed: 4, size: 0.75, flowers: ROSE }));
}

// The 2nd Division memorial at the foot of the cemetery: a tall, slender, rough-hewn Naga stone
// some 4.6 m high, a cross cut near its top and the bronze plate of the Kohima Epitaph below it,
// standing on a block of squared stone that carries the Division's bronze panel; behind it a low
// curved wall of dark stone set with thirteen cream tablets naming the dead by unit; a paved court.
function secondDivision(mz) {
  const g = new THREE.Group(), d = new THREE.Group(), R = rng(5);
  d.add(box(26, 0.1, 18, mat('#b3ad9f', 0.9), 0, 0, mz - 1), box(4.2, 0.3, 3, STONE_LIGHT, 0, 0.1, mz), box(3.4, 1.5, 2.2, STONE, 0, 0.4, mz), box(3.6, 0.14, 2.4, STONE_LIGHT, 0, 1.9, mz));
  d.add(box(2.6, 1.15, 0.05, PANEL, 0, 0.6, mz + 1.12));
  // The stone: a four-sided shaft tapering upward to a slanting top, its faces left rough.
  const geo = new THREE.CylinderGeometry(0.62, 0.95, 4.6, 4, 7).rotateY(Math.PI / 4).scale(1, 1, 0.62), p = geo.attributes.position;
  for (let k = 0; k < p.count; k++) {
    const y = p.getY(k);
    if (Math.abs(y) < 2.29) { p.setX(k, p.getX(k) + Math.sin(y * 3.1 + p.getZ(k) * 7) * 0.05); p.setZ(k, p.getZ(k) + Math.cos(y * 2.3 + p.getX(k) * 5) * 0.035); }
    if (y > 2.29) p.setY(k, y - 0.3 * Math.abs(p.getX(k)) - 0.1 * R());
  }
  geo.computeVertexNormals();
  g.add(mesh(geo, MONO, 0, 2.04 + 2.3, mz));
  d.add(box(0.09, 0.62, 0.03, CREAM, 0, 5.5, mz + 0.42), box(0.36, 0.09, 0.03, CREAM, 0, 5.86, mz + 0.42), box(0.95, 0.7, 0.04, mat('#27364f', 0.5, 0.4), 0, 4.1, mz + 0.5));
  // The wall of tablets, on an arc behind the stone.
  const r = 9, n = 13;
  for (let k = 0; k < n; k++) {
    const a = (k - (n - 1) / 2) * 0.165, x = Math.sin(a) * r, z = mz + 5.5 - Math.cos(a) * r, seg = new THREE.Group();
    seg.add(box(1.56, 1.9, 0.6, STONE, 0, 0.1, 0), box(1.62, 0.14, 0.7, STONE_LIGHT, 0, 2, 0), box(1.15, 1.3, 0.05, CREAM, 0, 0.5, 0.31));
    d.add(at(seg, x, 0, z).rotateY(-a));
  }
  g.add(mergeByMaterial(d));
  return g;
}

// The Kohima Cremation Memorial to the Hindu and Sikh soldiers, at the top: a wall of cream ashlar
// on two steps, bronze panels of names across it (four in the middle under the inscription, between
// the dates 1939 and 1945, and a taller one at each end), its end piers crowned by stone urns.
function cremationMemorial(hz, hy) {
  const g = new THREE.Group();
  g.add(box(18, 0.4, 10, STONE, 0, hy - 0.4, hz), box(12.4, 0.25, 3, CREAM, 0, hy, hz), box(11.6, 0.25, 2.2, CREAM, 0, hy + 0.25, hz));
  g.add(box(8.4, 3.3, 1, CREAM, 0, hy + 0.5, hz), box(8.6, 0.2, 1.2, CREAM, 0, hy + 3.8, hz));
  for (let k = 0; k < 4; k++) g.add(box(1.25, 1.7, 0.05, PANEL, (k - 1.5) * 1.45, hy + 0.9, hz + 0.51));
  g.add(box(4.2, 0.6, 0.05, PANEL, 0, hy + 2.8, hz + 0.51));
  for (const s of [-1, 1]) {
    g.add(box(1.5, 4.1, 1.3, CREAM, s * 4.95, hy + 0.5, hz), box(1.7, 0.25, 1.5, CREAM, s * 4.95, hy + 4.6, hz), box(1.05, 2.9, 0.05, PANEL, s * 4.95, hy + 1, hz + 0.66));
    g.add(cyl(0.2, 0.3, 0.3, CREAM, s * 4.95, hy + 4.85, hz, 12), mesh(new THREE.SphereGeometry(0.42, 14, 10).scale(1, 1.15, 1), CREAM, s * 4.95, hy + 5.55, hz), cyl(0.08, 0.2, 0.3, CREAM, s * 4.95, hy + 5.95, hz, 10));
  }
  return mergeByMaterial(g);
}

// By the tennis court: a regimental memorial, a square pier of dark squared stone under a low
// pyramid cap with a round bronze badge over a plaque; another regiment's bronze plate on a stone
// slab; white tablets of other regiments let into the terrace walls; and the cherry tree grown
// from the one a sniper used, in blossom, a small brass plaque before it. Clipped hedges run
// along the tops of the terrace walls.
function regimental(top, cz) {
  const g = new THREE.Group(), y = top + 0.4;
  g.add(box(2.6, 0.12, 2.6, STONE_LIGHT, -15, y - 0.4, cz + 13), box(1.5, 2.2, 1.5, STONE, -15, y - 0.28, cz + 13), mesh(new THREE.ConeGeometry(1.2, 0.5, 4).rotateY(Math.PI / 4), STONE, -15, y + 2.17, cz + 13));
  g.add(mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.04, 20).rotateX(Math.PI / 2), PANEL, -15, y + 1.45, cz + 13.76), box(0.6, 0.6, 0.04, PANEL, -15, y + 0.35, cz + 13.76));
  g.add(box(2.2, 0.5, 0.8, STONE_LIGHT, 15, y - 0.4, cz + 13), box(2, 1.5, 0.45, STONE_LIGHT, 15, y + 0.1, cz + 13), box(1.7, 1.2, 0.04, BRONZE, 15, y + 0.25, cz + 13.24));
  for (const [x, k] of [[-20, 3], [24, 5], [-30, 7]]) g.add(box(1.1, 1.5, 0.06, CREAM, x, (k - 1) * RISE + 0.6, -k * DEPTH + DEPTH / 2 + 0.43));
  for (let k = 1; k <= TERRACES; k++) for (const s of [-1, 1]) { const w = 2 * HALF - k * 3; g.add(box(w / 2 - 5.2, 0.7, 0.9, HEDGE, s * (w / 4 + 2.65), k * RISE + 0.4, -k * DEPTH + DEPTH / 2 - 0.9)); }
  // The cherry: a short trunk, a spreading crown of blossom, and the plaque on a stone.
  const tx = -13.5, tz = cz + 6.5;
  g.add(cyl(0.12, 0.18, 1.8, mat('#4a3a30', 0.9), tx, y, tz, 8), box(0.5, 0.3, 0.3, STONE_LIGHT, tx + 1.2, y, tz + 1), box(0.36, 0.02, 0.24, mat('#b8963c', 0.4, 0.8), tx + 1.2, y + 0.3, tz + 1));
  for (const [dx, dy, dz, r] of [[0, 2.6, 0, 1.3], [0.9, 2.3, 0.3, 0.95], [-0.8, 2.4, -0.4, 1.0], [0.2, 2.2, -0.9, 0.85], [-0.3, 3.2, 0.5, 0.9]]) g.add(mesh(new THREE.IcosahedronGeometry(r, 1), BLOSSOM, tx + dx, y + dy, tz + dz));
  return mergeByMaterial(g);
}

// The Kohima hills: Garrison Hill rising south-west (-z) behind the cemetery, ridges round it, and
// the valley falling away north-east (+z) to the road.
export function groundY(x, z) {
  const slope = Math.max(0, -z) * (RISE / DEPTH) - 0.6;
  // How far outside the cemetery's ground (x within HALF, z from the road to the court) a point is.
  const out = Math.hypot(Math.max(0, Math.abs(x) - HALF - 6), Math.max(0, z - DEPTH - 6, -TERRACES * DEPTH - 30 - z));
  return slope + smooth(0, 120, out) * (14 + 40 * fbm(x, z, { scale: 0.004, octaves: 4 }));
}

export function addDetails(f, g, { top, cz, sz, C }) {
  graves(f);
  const d = new THREE.Group();
  // The shelter's arcade: five openings in its front, looking over the court.
  for (let k = -2; k <= 2; k++) d.add(box(2.2, 3.2, 0.1, mat('#2c2a27', 0.9), k * 3, top + 4.2, sz + 3.02));
  for (let k = -3; k <= 3; k++) d.add(box(0.8, 4.2, 0.5, STONE_LIGHT, k * 3 + 1.5 * Math.sign(k || 1) * 0, top + 4, sz + 3.2));
  // The stone kerb round the court, and the plaque that tells of the fighting across it.
  d.add(box(36, 0.5, 0.5, STONE, 0, top, cz + 10.4), box(1.6, 1, 0.3, STONE_LIGHT, 13, top + 0.4, cz + 10.6), box(1.3, 0.7, 0.04, BRONZE, 13, top + 0.6, cz + 10.77));
  // The dedication tablet on the shelter's back wall, seen through the middle opening.
  d.add(box(1, 1.5, 0.05, CREAM, 0, top + 5, sz + 3.09));
  f.add(mergeByMaterial(d));
  const hz = sz - 16, hy = top + 8.2;
  f.add(secondDivision(DEPTH / 2 + 12), cremationMemorial(hz, hy), regimental(top, cz));
  // The ground: the hill, cut to take the cemetery, and the hills of Kohima round it.
  g.add(heightField(1500, 1300, detail.low ? 120 : 190, (x, z) => {
    // Behind the shelter the ground levels off at the memorial's terrace, on Garrison Hill's top.
    const y = groundY(x, z);
    return z < sz - 4 && z > hz - 14 && Math.abs(x) < 12 ? Math.min(y, hy - 0.45) : y;
  }, { cz: -150, rock: ['#6f6656', '#7a705f'], cover: '#4e6b3a', steep: 0.7, band: 14 }));
  // The Imphal road at the foot, with traffic.
  g.add(box(400, 0.1, 10, ROAD, 0, -0.3, DEPTH / 2 + 30));
  g.add(traffic([[DEPTH / 2 + 28.2, 1], [DEPTH / 2 + 31.8, -1]], -200, 200, { y: -0.2, gap: 30, seed: 12, buses: 0.08, trucks: 0.2 }));
  // Trees: rows of tall trees at the cemetery's sides, forest on the slopes beyond.
  const side = [];
  for (let k = 0; k <= TERRACES; k++) for (const s of [-1, 1]) side.push([s * (HALF - k * 1.5 + 4), -k * DEPTH, 12, k * RISE]);
  g.add(trees(side, { kind: 'fir', seed: 3 }));
  const R = rng(31), forest = scatter(detail.low ? 160 : 520, [-600, 600, -650, 200], { seed: 9, gap: 11, avoid: [[-HALF - 14, HALF + 14, -TERRACES * DEPTH - 50, DEPTH + 40], [-220, 220, DEPTH + 18, DEPTH + 44]] });
  g.add(trees(forest.filter((_, i) => i % 3 === 0).map(([x, z]) => [x, z, 13 + R() * 6, groundY(x, z)]), { kind: 'fir', seed: 8 }));
  g.add(trees(forest.filter((_, i) => i % 3 === 1).map(([x, z]) => [x, z, 10 + R() * 4, groundY(x, z)]), { kind: 'sal', seed: 10 }));
  g.add(trees(forest.filter((_, i) => i % 3 === 2).map(([x, z]) => [x, z, 9 + R() * 4, groundY(x, z)]), { kind: 'jamun', seed: 12 }));
  // Kohima's houses on the ridges, under red, blue and green iron roofs.
  const houses = scatter(detail.low ? 40 : 90, [-520, 520, -560, 260], { seed: 21, gap: 22, avoid: [[-HALF - 30, HALF + 30, -TERRACES * DEPTH - 70, DEPTH + 50], [-260, 260, DEPTH + 16, DEPTH + 46]] })
    .filter(([x, z]) => Math.hypot(x, z + 100) > 190)
    .map(([x, z]) => [x, z, 8 + R() * 6, 8 + R() * 4, 1 + Math.floor(R() * 3), R() * 6.28, groundY(x, z) - 0.4]);
  g.add(townHouses(houses, { seed: 7, roof: 'pitched', tanks: 0.2, fine: false }));
}

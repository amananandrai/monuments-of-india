import * as THREE from 'three';
import { mat, box, cyl, at, inst, unitBox, mesh, photo, rng } from '../helpers.js';
import { heightField, fbm, smooth } from '../parts/terrain.js';
import { trees, shrubs, scatter, along, townHouses, traffic } from '../parts/realism.js';
import { mergeByMaterial } from '../parts/components.js';
import { detail } from '../detail.js';
import { STONE, STONE_LIGHT, BRONZE, TERRACES, RISE, DEPTH, HALF } from '../monuments/kohima-war-cemetery.js';

const ROSE = '#c8323c', ROAD = mat('#4f4f52', 0.92), MONO = photo(mat('#7b776e', 0.95), 'rock');

// Kohima War Cemetery, finer detail and setting. Each terrace carries two rows of graves, each a
// stone pedestal with a bronze plaque laid on its sloping top, facing down the hill, with roses
// along the rows; the shelter under the cross has an open arcade; the 2nd Division memorial at the
// foot is a rough monolith on a stepped plinth; and the memorial to the Hindu and Sikh dead stands
// at the top. Round it: the ridges of Kohima, their slopes of pine and broadleaf forest and the
// town's houses under coloured iron roofs, and the Imphal road at the foot. Dimensions follow
// js/monuments/kohima-war-cemetery.js.
function graves(f) {
  const ped = [], plq = [], roses = [];
  const plaque = new THREE.BoxGeometry(0.44, 0.03, 0.32).rotateX(0.45).translate(0, 0.5, 0.02);
  for (let k = 0; k <= TERRACES; k++) {
    const w = 2 * HALF - k * 3, y = k * RISE + 0.06, z0 = -k * DEPTH;
    for (const dz of [-2.6, 2.4]) {
      for (let x = -w / 2 + 3; x < w / 2 - 3; x += 1.5) {
        if (Math.abs(x) < 7.2) continue;
        ped.push([x, y, z0 + dz, 0.52, 0.42, 0.4, 0]);
        plq.push([x, y, z0 + dz, 1, 1, 1, 0]);
      }
      roses.push(...along(Math.floor((w - 16) / 6), [-w / 2 + 3, z0 + dz + 1.1], [w / 2 - 3, z0 + dz + 1.1]).filter(([x]) => Math.abs(x) > 8).map(([x, z]) => [x, z, 0.75, y]));
    }
  }
  f.add(inst(unitBox(), ped, STONE_LIGHT), inst(plaque, plq, BRONZE));
  f.add(shrubs(roses, { seed: 4, size: 0.75, flowers: ROSE }));
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
  // The 2nd Division memorial at the foot: a monolith of dressed rough stone some 4.5 m high on a
  // three-stepped plinth, the bronze tablet with the Epitaph on its face; a paved forecourt.
  const mz = DEPTH / 2 + 12;
  d.add(box(26, 0.1, 16, mat('#b3ad9f', 0.9), 0, 0, mz));
  d.add(box(6.4, 0.45, 4.4, STONE_LIGHT, 0, 0.1, mz), box(5.4, 0.45, 3.4, STONE_LIGHT, 0, 0.55, mz), box(4.4, 0.5, 2.4, STONE, 0, 1, mz));
  d.add(box(1.6, 1.1, 0.05, BRONZE, 0, 1.8, mz + 1.22));
  f.add(mergeByMaterial(d));
  const mono = mesh(new THREE.DodecahedronGeometry(1, 1).scale(1.05, 2.6, 0.75), MONO, 0, 1.5 + 2.45, mz - 0.1);
  f.add(mono);
  // The memorial to the Hindu and Sikh soldiers: a stone slab between two piers above the cross.
  const hz = sz - 16, hy = top + 8.2;
  f.add(box(18, 0.4, 10, STONE, 0, hy - 0.4, hz), box(8, 4.5, 1.2, STONE_LIGHT, 0, hy, hz), box(9, 0.5, 1.6, STONE, 0, hy + 4.5, hz), box(4.2, 2.4, 0.05, BRONZE, 0, hy + 1.2, hz + 0.62));
  for (const x of [-5, 5]) f.add(box(1.4, 5.4, 1.4, STONE, x, hy, hz));
  // The ground: the hill, cut to take the cemetery, and the hills of Kohima round it.
  g.add(heightField(1500, 1300, detail.low ? 120 : 190, (x, z) => {
    // Behind the shelter the ground levels off at the memorial's terrace, on Garrison Hill's top.
    const y = groundY(x, z);
    return z < sz - 4 && z > hz - 14 && Math.abs(x) < 12 ? Math.min(y, hy - 0.45) : y;
  }, { cz: -150, rock: ['#6f6656', '#7a705f'], cover: '#4e6b3a', steep: 0.7, band: 14 }));
  // The Imphal road at the foot, with traffic.
  g.add(box(400, 0.1, 10, ROAD, 0, -0.3, DEPTH / 2 + 30));
  g.add(traffic([[DEPTH / 2 + 28.2, 1], [DEPTH / 2 + 31.8, -1]], -200, 200, { y: -0.2, gap: 30, seed: 12, buses: 0.08, trucks: 0.2 }));
  // Trees: rows of tall trees at the cemetery's sides, the old cherry by the court, forest on the
  // slopes beyond.
  const side = [];
  for (let k = 0; k <= TERRACES; k++) for (const s of [-1, 1]) side.push([s * (HALF - k * 1.5 + 4), -k * DEPTH, 12, k * RISE]);
  g.add(trees(side, { kind: 'fir', seed: 3 }));
  g.add(trees([[-14, cz + 4, 7, top + 0.4], [15, cz - 3, 8, top + 0.4]], { kind: 'jamun', seed: 6 }));
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

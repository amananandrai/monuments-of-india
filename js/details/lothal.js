import * as THREE from 'three';
import { M, mat, box, cyl, at, inst, unitBox, sheet } from '../helpers.js';
import { heightField, fbm, smooth } from '../parts/terrain.js';
import { trees, shrubs, asiBoard, scatter, along, benches } from '../parts/realism.js';
import { BRICK, BRICK_DARK, MUD } from '../monuments/lothal.js';
import { detail } from '../detail.js';

const ANCHOR = mat('#8e8577', 0.9), WALL = mat('#e4dccb', 0.9), ROOF = mat('#9b8466', 0.9);

// Lothal, finer detail and setting. From the excavation and photographs of the site: the drains of
// the acropolis, channels of fired brick running out over its edge; the stone anchors found along
// the dock's wharf, pierced blocks laid out where they were found; the bead factory's round kiln in
// the lower town; and the channel from the dock's inlet to the river, which once ran close by the
// town. The plain round it is flat, grazed and planted with neem and babul; the site museum, a
// low building in a garden, stands to the west. Dimensions follow js/monuments/lothal.js: the dock
// l by w at z = z, its floor `depth` down; the acropolis ah high, aw by ad at (ax, az).
export function addDetails(f, g, { l, w, z: dz, ax, az, aw, ad, ah, R }) {
  // Drains of the acropolis: brick channels running to its edges, and their outfalls.
  const drains = [];
  for (const x of [ax - 50, ax - 26, ax - 2]) drains.push([x, ah, az + ad / 4, 0.8, 0.35, ad / 2, 0], [x, 0, az + ad / 2 + 1.2, 0.8, ah + 0.35, 2.4, 0]);
  f.add(inst(unitBox(), drains, BRICK_DARK));
  // The ruler's bath: a brick-paved floor with a low kerb.
  f.add(box(9, 0.25, 6, BRICK, ax - 40, ah, az - 12), box(9.6, 0.5, 0.3, BRICK_DARK, ax - 40, ah, az - 15.15), box(9.6, 0.5, 0.3, BRICK_DARK, ax - 40, ah, az - 8.85));
  // Stone anchors along the wharf.
  const an = [];
  for (let k = 0; k < 14; k++) an.push([-l / 2 + 12 + k * 14 + R() * 4, 1.2, dz - w / 2 - 6 + R() * 3, 0.5, 0.35, 0.4, R() * 3]);
  f.add(inst(unitBox(), an, ANCHOR));
  // The bead factory's kiln: a round brick furnace with flues, in the lower town.
  f.add(at(cyl(2.2, 2.4, 1.4, BRICK_DARK, 0, 0, 0, 20), -60, 1.2, -20), cyl(1.4, 1.4, 0.2, mat('#2e2620', 0.9), -60, 2.6, -20, 16));
  // The channel from the inlet out to the river: low earthen banks and shallow water.
  const cx = l / 2 - 15.6;
  g.add(box(4, 0.7, 70, MUD, cx - 9, 0, dz + w / 2 + 35), box(4, 0.7, 70, MUD, cx + 9, 0, dz + w / 2 + 35), sheet(14, 70, M.river, cx, 0.12, dz + w / 2 + 35));
  // The plain: flat, a little lower towards the river, and its course.
  g.add(heightField(3000, 3000, detail.low ? 100 : 150, (x, z) => (Math.abs(x) < 480 && z > -400 && z < 480 ? -8 : -0.75) + 3 * fbm(x, z, { scale: 0.002, octaves: 3 }) * smooth(500, 900, Math.hypot(x, z)) - 1.2 * smooth(150, 190, z) * smooth(260, 220, z), { cover: '#ab9a70', rock: ['#a1916c'], steep: 0.6 }));
  g.add(sheet(3000, 60, M.river, 0, -0.9, 205));
  // Paths, the board and benches for visitors.
  g.add(box(3, 0.05, 120, M.path, -150, 0, 0), box(150, 0.05, 3, M.path, -75, 0, 22), box(3, 0.05, 30, M.path, -60, 0, 32));
  g.add(asiBoard('Lothal', -146, 40, Math.PI / 2, { line2: 'EXCAVATED SITE' }));
  g.add(benches([[-146, 10, Math.PI / 2], [-146, -10, Math.PI / 2]]));
  // The site museum, west of the town, in its garden.
  const mus = new THREE.Group();
  mus.add(box(34, 5, 16, WALL, 0, 0, 0), box(36, 0.5, 18, ROOF, 0, 5, 0), box(10, 3.5, 4, WALL, 0, 0, 9.5), box(11, 0.35, 5, ROOF, 0, 3.5, 9.5));
  g.add(at(mus, -230, 0, 10).rotateY(Math.PI / 2));
  g.add(trees(along(6, [-200, -30], [-200, 50]), { kind: 'ashoka', seed: 3 }));
  // Neem round the site, babul and khejri out on the plain; scrub between.
  const away = ([x, z]) => !(x > -150 && x < 115 && z > -95 && z < dz + w / 2 + 75);
  g.add(trees(scatter(30, [-330, 330, -280, 170], { seed: 5, gap: 24 }).filter(away), { kind: 'neem', seed: 5 }));
  g.add(trees(scatter(50, [-700, 700, -600, 170], { seed: 8, gap: 30 }).filter(away), { kind: 'babul', seed: 8 }));
  g.add(trees(scatter(20, [-700, 700, -600, 170], { seed: 11, gap: 40 }).filter(away), { kind: 'khejri', seed: 11 }));
  g.add(shrubs(scatter(80, [-400, 400, -300, 160], { seed: 13, gap: 7 }).filter(away), { dry: true }));
  void MUD;
}

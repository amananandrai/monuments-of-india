import * as THREE from 'three';
import { M, mat, box, sheet, at } from '../helpers.js';
import { merlons, star, mergeByMaterial } from '../parts/components.js';
import { trees, shrubs, lampPosts, scatter, along, cityAround, traffic, boats } from '../parts/realism.js';
import { detail } from '../detail.js';

// The mosque's dusky pink stone and its lighter trim; P, the height of the court's plinth.
export const PINK = mat('#c98877', 0.85);
export const PINK_LIGHT = mat('#dda497', 0.85);
export const P = 2.4;

// Taj-ul-Masajid, finer detail. From photographs: a crest of merlons along the hall's parapet and
// over the cloisters; white stars inlaid either side of the central iwan; the great square pool for
// ablutions in the middle of the court, with a fountain; and outside, the Motia Talab lake to the
// east of the gate, the road between, and the old city of Bhopal round the other sides.
// Dimensions follow js/monuments/taj-ul-masajid.js: the court W wide from z0 (the hall's front) to
// z1 (the gate), the hall centred at z = HZ and HH high, cloisters CH high and CD deep.
function architecture(f, { W, z0, z1, HH, CH, CD }) {
  const d = new THREE.Group();
  for (const s of [-1, 1]) d.add(at(merlons(34, 0.7, 1, 0.3, PINK_LIGHT, 0.4), s * 27, P + HH + 0.7, z0 - 0.4));
  d.add(at(merlons(20, 0.7, 1, 0.3, PINK_LIGHT, 0.4), 0, P + HH + 5.1, z0 - 0.4));
  for (const s of [-1, 1]) {
    const m = at(merlons(z1 - z0, 0.6, 0.8, 0.3, PINK_LIGHT, 0.4), s * (W / 2 + CD - 0.3), P + CH + 0.5, (z0 + z1) / 2);
    m.rotation.y = Math.PI / 2;
    d.add(m);
  }
  for (const x of [-34.5, 34.5]) d.add(at(merlons(45, 0.6, 0.8, 0.3, PINK_LIGHT, 0.4), x, P + CH + 0.5, z1 + CD - 0.3));
  for (const x of [-8.2, 8.2]) for (const y of [P + 6, P + 13]) d.add(at(star(6, 0.9, M.marble), x, y, z0 + 0.02));
  // The pool of ablution: a marble kerb round a sheet of water, a fountain in the middle.
  const pz = (z0 + z1) / 2 + 6;
  for (const s of [-1, 1]) d.add(box(30, 0.6, 0.8, M.marble, 0, P, pz + s * 14.6), box(0.8, 0.6, 28.4, M.marble, s * 14.6, P, pz));
  d.add(box(28.4, 0.1, 28.4, M.marbleShade, 0, P, pz));
  d.add(box(3, 0.9, 3, M.marble, 0, P, pz));
  // Paths across the court, from the gate to the hall.
  d.add(box(6, 0.06, z1 - z0 - 32, PINK_LIGHT, 0, P + 0.1, z1 - (z1 - z0 - 32) / 2 - 1));
  f.add(mergeByMaterial(d));
  f.add(sheet(28.3, 28.3, M.water, 0, P + 0.42, pz));
}

export function addDetails(f, g, dims) {
  architecture(f, dims);
  const { z1 } = dims;
  g.add(box(700, 0.2, 700, M.grass, 0, -0.2, 0));
  // The road along the east side, below the gate's steps, and the Motia Talab beyond it.
  g.add(box(320, 0.08, 18, M.asphalt, 0, 0, z1 + 30), box(320, 0.1, 4, M.path, 0, 0, z1 + 20));
  g.add(traffic([[z1 + 26.5, 1], [z1 + 33.5, -1]], -150, 150, { y: 0.1, gap: 22, seed: 4, buses: 0.08 }));
  g.add(box(320, 0.5, 2, M.bank, 0, 0, z1 + 41), sheet(320, 120, M.lake, 0, 0.2, z1 + 102));
  g.add(boats([[-40, z1 + 70, 0.4], [25, z1 + 90, -0.6], [60, z1 + 64, 1.2]], { y: 0.2 }));
  g.add(trees(along(12, [-140, z1 + 21.5], [140, z1 + 21.5]).filter(([x]) => Math.abs(x) > 18), { kind: 'neem', seed: 3 }));
  g.add(lampPosts(along(10, [-120, z1 + 38], [120, z1 + 38])));
  // The garden round the plinth.
  g.add(trees(scatter(16, [-90, 90, -95, z1 + 14], { seed: 7, gap: 12, avoid: [[-70, 70, -85, z1 + 16]] }), { kind: 'ashoka', seed: 7 }));
  g.add(shrubs(along(14, [-60, z1 + 15], [60, z1 + 15]).filter(([x]) => Math.abs(x) > 14), { seed: 4 }));
  // Old Bhopal round the north, west and south.
  g.add(cityAround([-95, 95, -110, z1 + 16], { rows: detail.low ? 1 : 3, every: detail.low ? 2 : 1, gap: 12, seed: 33, fine: false,
    keep: [[-400, 400, z1 + 16, 400]] }));
}

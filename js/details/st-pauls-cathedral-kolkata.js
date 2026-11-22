import * as THREE from 'three';
import { M, mat, box, at } from '../helpers.js';
import { mergeByMaterial, beltCourse } from '../parts/components.js';
import { trees, shrubs, lampPosts, benches, scatter, along, traffic, cityAround } from '../parts/realism.js';
import { detail } from '../detail.js';
import { S, WALL, TRIM } from '../monuments/st-pauls-cathedral-kolkata.js';

// St Paul's, finer detail. From photographs: a moulded plinth runs round the whole church and a
// string course under the windows; the west porch's gable carries a cross. Round it, the cathedral
// close on the edge of the Maidan: lawns crossed by paths, rain trees, palms and mahogany, a low
// railing on a plinth along Cathedral Road, lamps and benches, and the city's blocks beyond.
function architecture(f) {
  const { FZ, LEN, NW, WH, CZ, TW, TD, CW } = S, d = new THREE.Group(), nlen = FZ - (CZ + TD / 2), clen = CZ - TD / 2 - (FZ - LEN);
  d.add(at(beltCourse(NW + 0.3, nlen, 0, 1.1, 0.25, TRIM), 0, 0, CZ + TD / 2 + nlen / 2));
  d.add(at(beltCourse(TW + 0.3, TD + 0.3, 0, 1.1, 0.25, TRIM), 0, 0, CZ));
  d.add(at(beltCourse(CW + 0.3, clen, 0, 1.1, 0.25, TRIM), 0, 0, CZ - TD / 2 - clen / 2));
  d.add(at(beltCourse(NW, nlen, 3.9, 0.3, 0.18, TRIM), 0, 0, CZ + TD / 2 + nlen / 2));
  d.add(at(beltCourse(CW, clen, 3.4, 0.3, 0.18, TRIM), 0, 0, CZ - TD / 2 - clen / 2));
  // A low cross over the porch.
  d.add(box(0.3, 2, 0.3, TRIM, 0, 9.75, FZ + 6.5), box(1.2, 0.3, 0.3, TRIM, 0, 10.9, FZ + 6.5));
  f.add(mergeByMaterial(d));
}

export function addDetails(f, g) {
  architecture(f);
  const { FZ, LEN } = S, R = mat('#4f5a48', 0.95);
  g.add(box(520, 0.06, 460, M.grass, 0, -0.06, 0));
  // Paths: the drive to the porch and round the church.
  g.add(box(9, 0.05, 54, M.path, 0, 0, FZ + 33), box(76, 0.05, 6, M.path, 0, 0, FZ + 18), box(6, 0.05, LEN + 18, M.path, -30, 0, 0), box(6, 0.05, LEN + 18, M.path, 30, 0, 0));
  // Cathedral Road along the front, behind a railing on a low plinth with gate piers.
  g.add(box(520, 0.06, 18, M.asphalt, 0, 0, FZ + 70));
  const rail = new THREE.Group(), RL = mat('#2f3330', 0.6, 0.3);
  for (const s of [-1, 1]) {
    rail.add(box(110, 0.6, 0.6, WALL, s * 60, 0, FZ + 59), box(110, 0.12, 0.08, RL, s * 60, 1.85, FZ + 59));
    for (let x = 6; x < 115; x += 0.35) rail.add(box(0.05, 1.3, 0.05, RL, s * x, 0.6, FZ + 59));
    rail.add(box(1.4, 3, 1.4, WALL, s * 5.5, 0, FZ + 59), box(1.7, 0.3, 1.7, TRIM, s * 5.5, 3, FZ + 59));
  }
  g.add(mergeByMaterial(rail));
  g.add(traffic([[FZ + 66, 1], [FZ + 70, 1], [FZ + 74, -1]], -250, 250, { gap: 20, seed: 4, taxis: 0.3, buses: 0.12, trucks: 0.02 }));
  // The city beyond the road and the close.
  g.add(cityAround([-150, 150, -120, FZ + 80], { rows: detail.low ? 1 : 2, every: detail.low ? 2 : 1, fine: false, gap: 8, storeys: [3, 7], seed: 47, keep: [[-400, 400, -400, -122]] }));
  // Trees of the close: rain trees (wide neem-like crowns), mahogany, palms by the porch, and a
  // hedge of flowering shrubs along the paths.
  const keep = [[-22, 22, -45, FZ + 12], [-24, 24, -20, 0], [-6, 6, FZ, FZ + 62]];
  g.add(trees(scatter(26, [-140, 140, -110, FZ + 52], { seed: 3, gap: 16, avoid: [...keep, [-34, 34, -48, FZ + 24]] }), { kind: 'neem', seed: 3, h: 14 }));
  g.add(trees(scatter(10, [-140, 140, -110, FZ + 52], { seed: 8, gap: 18, avoid: [...keep, [-34, 34, -48, FZ + 24]] }), { kind: 'mango', seed: 8, h: 12 }));
  g.add(trees([...along(4, [-12, FZ + 24], [-12, FZ + 52]), ...along(4, [12, FZ + 24], [12, FZ + 52])], { kind: 'palm', seed: 5 }));
  g.add(shrubs([...along(8, [-6, FZ + 20], [-6, FZ + 56]), ...along(8, [6, FZ + 20], [6, FZ + 56])].map(([x, z]) => [x, z, 1.2]), { flowers: '#c8325f', seed: 6 }));
  g.add(lampPosts([...along(4, [-5.5, FZ + 14], [-5.5, FZ + 56]), ...along(4, [5.5, FZ + 14], [5.5, FZ + 56])]));
  g.add(benches([[-20, FZ + 22], [20, FZ + 22], [-34, 0], [34, 0]]));
  // A dark hedge along the sides of the close.
  g.add(box(2, 1.2, 200, R, -150, 0, -20), box(2, 1.2, 200, R, 150, 0, -20));
}

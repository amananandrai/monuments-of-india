import * as THREE from 'three';
import { M, mat, mesh, box, cyl, at, sheet } from '../helpers.js';
import { mergeByMaterial, railing } from '../parts/components.js';
import { figure } from '../parts/sculpture.js';
import { trees, shrubs, lampPosts, fountains, benches, along, scatter } from '../parts/realism.js';
import { detail } from '../detail.js';

const HEDGE = mat('#4f7a3a', 0.95), ROCK = mat('#7d7468', 0.95), PAINTED = [mat('#3b6fb6', 0.6), mat('#e7b23a', 0.6), mat('#d8524a', 0.6), mat('#f0e6d4', 0.6)];

// The gardens round Prem Mandir, from photographs: the temple stands in the middle of a walled
// garden of 54 acres, on a marble-paved court ringed by lawns cut in beds by paths, with fountains
// along the axis before it, lamp posts and kadamba and ashoka trees. Among the lawns stand the
// painted tableaux of Krishna's life: Krishna holding up Govardhan Hill over the people of Braj, and
// the circle of the raas, the gopis dancing round him. Dimensions follow js/monuments/prem-mandir.js.
export function addDetails(f, g, { S }) {
  // The marble court round the platform, the lawns, and the paths through them.
  g.add(box(70, 0.2, 70, M.path, 0, -0.2, 0));
  for (const [x, z, w, d] of [[-62, 0, 52, 190], [62, 0, 52, 190], [0, -66, 72, 58], [0, 66, 72, 58]]) g.add(box(w, 0.25, d, M.grass, x, -0.2, z));
  g.add(box(10, 0.06, 60, M.path, 0, 0, 66), box(190, 0.06, 6, M.path, 0, 0, 66), box(6, 0.06, 190, M.path, -62, 0, 0), box(6, 0.06, 190, M.path, 62, 0, 0));
  // The water channel and fountains on the axis before the temple.
  g.add(box(4.4, 0.4, 44, S, 0, 0, 66), sheet(3.6, 43.2, M.water, 0, 0.42, 66));
  g.add(fountains(along(8, [0, 48], [0, 84]), { y: 0.4, h: 2.6 }));
  // Hedges along the paths, flower beds and shrubs.
  const hedge = new THREE.Group();
  for (const s of [-1, 1]) hedge.add(box(1, 0.9, 54, HEDGE, s * 7, 0, 68), box(54, 0.9, 1, HEDGE, s * 64, 0, 62));
  g.add(mergeByMaterial(hedge));
  g.add(shrubs([...scatter(40, [-85, -40, -90, 90], { seed: 3 }), ...scatter(40, [40, 85, -90, 90], { seed: 4 })], { flowers: '#e04a7a' }));
  // Trees round the garden's edge and lamps along the paths.
  g.add(trees([...along(10, [-96, -96], [-96, 96]), ...along(10, [96, -96], [96, 96]), ...along(10, [-90, -100], [90, -100])], { kind: 'ashoka', seed: 21 }));
  g.add(trees([...along(6, [-40, 100], [-12, 100]), ...along(6, [12, 100], [40, 100]), [-45, -40], [45, -40], [-45, 30], [45, 30]], { kind: 'neem', seed: 22 }));
  g.add(lampPosts([...along(7, [-5, 40], [-5, 94]), ...along(7, [5, 40], [5, 94]), ...along(10, [-30, 36], [30, 36])]));
  g.add(benches(along(4, [-56, 40], [-56, 90])));
  // The marble railing round the court.
  const rail = new THREE.Group();
  for (const [x, z, ry, len] of [[0, -35, 0, 70], [-35, 0, Math.PI / 2, 70], [35, 0, Math.PI / 2, 70], [-22, 35, 0, 26], [22, 35, 0, 26]]) rail.add(at(railing(len, 1, 0.22, S), x, 0, z).rotateY(ry));
  g.add(mergeByMaterial(rail));
  // Govardhan Lila: a hill of rock held up on Krishna's little finger, the people of Braj and their
  // cattle sheltering under it.
  const gov = new THREE.Group(), hill = mesh(new THREE.IcosahedronGeometry(1, detail.low ? 2 : 3), ROCK, 0, 6.2, 0);
  hill.scale.set(6.5, 2.6, 5);
  gov.add(hill, box(14, 0.5, 11, S, 0, 0, 0), figure(2.4, PAINTED[0], 'standing').translateY(0.5), cyl(0.06, 0.06, 1.4, PAINTED[0], 0.25, 2.6, 0));
  for (let k = 0; k < 9; k++) { const a = (k / 9) * Math.PI * 2; gov.add(at(figure(1.7, PAINTED[k % 4], k % 2 ? 'standing' : 'dancer'), Math.cos(a) * 3.8, 0.5, Math.sin(a) * 3).rotateY(-a)); }
  g.add(at(gov, -58, 0, 64));
  // The raas: gopis dancing in a ring round Krishna playing the flute.
  const raas = new THREE.Group();
  raas.add(cyl(7, 7, 0.4, S, 0, 0, 0, 32), at(figure(2.3, PAINTED[0], 'dancer'), 0, 0.4, 0));
  for (let k = 0; k < 14; k++) { const a = (k / 14) * Math.PI * 2; raas.add(at(figure(1.8, PAINTED[(k % 3) + 1], 'dancer'), Math.cos(a) * 5.4, 0.4, Math.sin(a) * 5.4).rotateY(-a + Math.PI / 2)); }
  g.add(at(raas, 58, 0, 64));
  // The garden wall and its gate on the axis.
  const wall = new THREE.Group();
  for (const [x, z, w, d] of [[0, -104, 212, 1.2], [-106, 0, 1.2, 208], [106, 0, 1.2, 208], [-60, 104, 92, 1.2], [60, 104, 92, 1.2]]) wall.add(box(w, 2.6, d, S, x, 0, z));
  for (const s of [-1, 1]) wall.add(box(3, 9, 3, S, s * 9, 0, 104), box(3.6, 0.6, 3.6, M.gold, s * 9, 9, 104));
  wall.add(box(21, 2, 3, S, 0, 7, 104));
  g.add(mergeByMaterial(wall));
}

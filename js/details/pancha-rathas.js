import * as THREE from 'three';
import { mat, mesh, box, at, onFace, FACES, rng } from '../helpers.js';
import { templeNiche, idol, mergeByMaterial } from '../parts/components.js';
import { figure, kuduGeo, instances } from '../parts/sculpture.js';
import { trees, shrubs, asiBoard, scatter, along } from '../parts/realism.js';
import { detail } from '../detail.js';

// The Mamallapuram granite: grey with a warm pink cast, darker where the weather has reached it.
export const GRANITE = mat('#a39383', 0.93);
export const SHADE = mat('#7f7366', 0.95);
const SAND = mat('#d8c7a4', 0.97);
const ROCK = mat('#8a7f74', 0.95, 0, { flatShading: true });

// Where each ratha stands ([x, y, z]): the row from north (-x) to south, facing west (+z), and the
// apsidal shrine west of it.
export const LAYOUT = {
  draupadi: [-17, 0, 0], arjuna: [-10, 0, 0], bhima: [2.5, 0, 0], dharmaraja: [17, 0, 0],
  nakula: [-12, 0, 14], elephant: [-12.5, 0, 19.5], lion: [-17, 0, 5.2], nandi: [-10, 0, -5.2],
};

// The Pancha Rathas, finer detail. From photographs:
// - on the cornice of every storey, rows of kudus (small horseshoe-arched windows);
// - in the bays of the Dharmaraja ratha's ground floor and on the Arjuna ratha, images in niches:
//   gods and royal figures standing between pilasters;
// - Durga standing in the Draupadi ratha's doorway, a door-keeper on either side.
function architecture(f) {
  const L = LAYOUT, d = new THREE.Group(), kudus = [];
  // Kudus along the eaves: [centre, half-width, half-depth, height of the eave].
  const rows = [[L.dharmaraja, 4.2, 3.3, 3.35, 0.9], [L.arjuna, 2.3, 1.75, 2.95, 0.55], [L.bhima, 6.6, 2.5, 3.55, 0.8]];
  for (const [[cx, , cz], hw, hd, y, back] of rows) for (const a of FACES) {
    const side = Math.abs(Math.sin(a)) > 0.5, half = side ? hd : hw, dist = (side ? hw : hd) + 0.75;
    const n = Math.max(2, Math.floor((half * 2) / 1.3));
    for (let k = 0; k < n; k++) {
      const l = -half + (k + 0.5) * ((half * 2) / n), ca = Math.cos(a), sa = Math.sin(a);
      kudus.push([cx + sa * dist + ca * l, y, cz - back + ca * dist - sa * l, 0.55, 0.55, 0.55, a]);
    }
  }
  d.add(instances(kuduGeo(), kudus, GRANITE));
  // Images in niches on the Dharmaraja ratha's three closed faces and on the Arjuna ratha's.
  for (const [[cx, , cz], w, hd, back, n] of [[L.dharmaraja, 4.2, 3.3, 0.9, 3], [L.arjuna, 2.3, 1.75, 0.55, 1]]) for (const a of [Math.PI, Math.PI / 2, -Math.PI / 2]) {
    for (let k = 0; k < n; k++) {
      const lat = n === 1 ? 0 : (k - (n - 1) / 2) * (a === Math.PI ? 2 : 2.4);
      const o = onFace(at(templeNiche(0.9, 2.1, GRANITE, { figure: figure(1.8, GRANITE, k % 2 ? 'standing' : 'dancer'), crown: false }), 0, 0.85, 0), a, (a === Math.PI ? hd : w) + 0.02, lat);
      o.position.x += cx;
      o.position.z += cz - back;
      d.add(o);
    }
  }
  // Durga in the Draupadi ratha's doorway, and her door-keepers.
  const [dx, , dz] = L.draupadi;
  d.add(box(1.3, 2, 0.05, SHADE, dx, 1.1, dz + 1.81), at(idol(1.7, GRANITE), dx, 1.15, dz + 1.86));
  for (const s of [-1, 1]) d.add(at(figure(1.6, GRANITE, 'standing'), dx + s * 1.25, 0.95, dz + 1.85));
  f.add(mergeByMaterial(d));
}

// The site at Mamallapuram: the rathas stand in a sandy hollow below the level of the land round
// them (the rock they were cut from was dug out round them), the old outcrop showing as bare
// granite at the south end; a lawn and a fence round the enclosure, casuarina and coconut palms
// beyond, and the ASI board.
export function addDetails(f, g) {
  architecture(f);
  const R = rng(9);
  g.add(box(84, 0.3, 64, SAND, 0, -0.3, 5));
  // The lawn and garden ground round the hollow, a step up from it.
  for (const [w, d, x, z] of [[260, 100, 0, -77], [260, 100, 0, 87], [90, 64, -87, 5], [90, 64, 87, 5]]) g.add(box(w, 0.9, d, mat('#6f8b4e', 0.95), x, -0.3, z));
  // The bare granite of the old outcrop south of the Dharmaraja ratha, and boulders.
  for (let i = 0; i < 9; i++) {
    const r = 1.2 + R() * 2.4, b = mesh(new THREE.IcosahedronGeometry(r, 1), ROCK, 26 + R() * 12, -0.3 + r * 0.25, -14 + R() * 28);
    b.scale.y = 0.45;
    g.add(b);
  }
  // A low railing round the hollow's rim.
  const posts = [];
  for (const [a, b] of [[[-42, -27], [42, -27]], [[42, -27], [42, 37]], [[-42, -27], [-42, 37]]]) for (const [x, z] of along(16, a, b)) posts.push([x, 0.6, z, 0.12, 0.9, 0.12, 0]);
  g.add(instances(new THREE.BoxGeometry(1, 1, 1).translate(0, 0.5, 0), posts, SHADE));
  g.add(trees([...along(9, [-60, -45], [60, -45]), ...scatter(14, [-120, 120, -130, -50], { seed: 3, gap: 10 })], { kind: 'casuarina', seed: 4, y: 0.6 }));
  g.add(trees([...along(7, [-60, 50], [60, 50]), ...scatter(10, [-120, 120, 55, 120], { seed: 6, gap: 12 }), ...scatter(6, [55, 120, -40, 50], { seed: 8, gap: 12 })], { kind: 'palm', seed: 5, y: 0.6 }));
  g.add(trees(scatter(detail.low ? 5 : 9, [-120, -55, -40, 50], { seed: 12, gap: 12 }), { kind: 'neem', seed: 7, y: 0.6 }));
  g.add(shrubs(along(10, [-38, 40], [38, 40]), { y: 0.6, size: 1.1 }));
  g.add(asiBoard('Five Rathas, Mamallapuram', 30, 33, -0.4, { y: 0.6, line2: 'WORLD HERITAGE SITE' }));
}

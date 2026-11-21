import * as THREE from 'three';
import { surface } from '../surface.js';
import { M, mat, mesh, box, at, pidaRoof, kalash, hemi, inst, unitCyl, aroundRect, sheet } from '../helpers.js';
import { thiruvalluvarBody } from '../details/figures.js';
import { addDetails } from '../details/vivekananda-rock-memorial.js';

const STONE = mat('#c9a98a', 0.85);
const SHADE = mat('#9c7e62', 0.9);
const ROCK = mat('#4c4640', 0.95, 0, { flatShading: true });
const GREY = surface(mat('#a7a39a', 0.8), 'marble');
// The figure itself is plain stone: block joints would run across the face and the robe.
const FIGURE = surface(mat('#a7a39a', 0.8), 'none');

// The poet Thiruvalluvar: robed, hair gathered in a knot, a long beard, the right hand raised with
// three fingers lifted and the left holding a palm-leaf manuscript. The 38 ft pedestal and 95 ft
// figure stand for the 38 and 95 chapters of the three books of the Thirukkural.
function thiruvalluvar() {
  const g = new THREE.Group(), Gr = FIGURE;
  g.add(box(10, 11.6, 10, GREY), box(11, 0.8, 11, mat('#8f8b83', 0.8), 0, 11.6));
  // The body as one carved skin: the robe in folds, its end across the chest, the arms and neck
  g.add(thiruvalluvarBody(Gr));
  // (The head with its beard and hair, and both hands, are carved in the body: figures.js.)
  // The palm-leaf manuscript in the left hand: a bundle of long narrow leaves between two wooden
  // boards, a cord through them tied round the bundle.
  const book = at(new THREE.Group(), -2.6, 29.05, 3.8);
  book.add(box(3.4, 0.08, 0.95, mat('#7a5a3a', 0.75), 0, 0, 0), box(3.3, 0.34, 0.9, mat('#c9b48a', 0.85), 0, 0.08, 0), box(3.4, 0.08, 0.95, mat('#7a5a3a', 0.75), 0, 0.42, 0));
  for (const x of [-1.0, 1.0]) book.add(box(0.06, 0.54, 0.98, mat('#8a2f24', 0.7), x, -0.02, 0));
  g.add(book);
  return g;
}

export function buildVivekanandaRock() {
  const g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  // Where three seas meet, off the southern tip of India
  g.add(sheet(1400, 1400, M.sea, 0, 0.3, 0), box(600, 0.42, 120, mat('#dcc9a3', 0.95), 0, 0, 380));
  for (const [x, z, s] of [[0, 0, 40], [-75, 18, 22]]) {
    const r = mesh(new THREE.IcosahedronGeometry(s, 1), ROCK, x, 0, z);
    r.scale.set(1, 0.22, 0.75);
    g.add(r);
  }
  const T = 8.8;
  // Vivekananda Mandapam: a temple-like hall under a stepped roof, and the smaller Shripada Mandapam
  const cols = [];
  aroundRect(22, 22, 2.6).forEach(([x, z]) => cols.push([x, T + 1.4, z + 4, 1.2, 8, 1.2]));
  f.add(box(34, 1.4, 44, STONE, 0, T, 0), inst(unitCyl(10), cols, STONE), box(18, 8, 18, STONE, 0, T + 1.4, 4));
  const r = pidaRoof(26, 10, 5, 1, STONE, SHADE);
  f.add(box(26, 1, 26, SHADE, 0, T + 9.4, 4), at(r, 0, T + 10.4, 4), at(hemi(4, STONE, 20), 0, T + 10.4 + r.userData.top, 4), at(kalash(2.4), 0, T + 14.4 + r.userData.top, 4));
  f.add(box(12, 6, 10, STONE, 0, T + 1.4, -16), at(pidaRoof(12, 6, 3, 0.8, STONE, SHADE), 0, T + 7.4, -16));
  // The Thiruvalluvar statue on the neighbouring rock
  f.add(at(thiruvalluvar(), -75, 4.6, 18));
  addDetails(f, g);
  return { group: g, focus: f, view: [0.7, 0.3, 1.2] };
}

import * as THREE from 'three';
import { surface } from '../surface.js';
import { M, mat, mesh, box, at, pidaRoof, kalash, hemi, inst, unitBox, unitCyl, aroundRect, sheet } from '../helpers.js';
import { thiruvalluvarBody } from '../details/figures.js';
import { addDetails } from '../details/vivekananda-rock-memorial.js';

const STONE = mat('#c9a98a', 0.85);
const SHADE = mat('#9c7e62', 0.9);
const ROCK = mat('#4c4640', 0.95, 0, { flatShading: true });
// The statue is built of some 3,700 blocks of grey granite, and the joints between them show in
// photographs as a grid of courses over the robe and the face: the 'blocks' surface draws them,
// worked out in space so they run true over the carving.
const FIGURE = surface(mat('#6f6b64', 0.78), 'blocks');
// The Alankara Mandapam, its pedestal: grey granite walls, darker mouldings and panels.
const PED = surface(mat('#8f8a80', 0.85), 'masonry'), PED_DARK = mat('#6c6760', 0.9), DOOR = mat('#2b2622', 0.9);

// The poet Thiruvalluvar: robed, hair gathered in a knot, a long beard, the right hand raised with
// three fingers lifted and the left holding a palm-leaf manuscript. The 38 ft pedestal and 95 ft
// figure stand for the 38 and 95 chapters of the three books of the Thirukkural. The pedestal is
// the Alankara Mandapam, a square hall of granite whose roof is the terrace the statue stands on.
function thiruvalluvar() {
  const g = new THREE.Group();
  g.add(alankaraMandapam());
  // The body as one carved skin: the robe in folds, the upper cloth across the chest, the arms and
  // neck; the head with its beard and hair, and both hands, are carved in it (figures.js). It is
  // drawn 33.1 m from its foot to the top of the knot and scaled about its foot to the statue's 29 m.
  const st = new THREE.Group(), k = 29 / 33.1;
  st.add(thiruvalluvarBody(FIGURE));
  // The palm-leaf manuscript in the left hand: a bundle of long narrow leaves between two wooden
  // boards, a cord through them tied round the bundle.
  const book = at(new THREE.Group(), 2.6, 29.05, 3.8);
  book.add(box(3.4, 0.08, 0.95, mat('#5b4a38', 0.75), 0, 0, 0), box(3.3, 0.34, 0.9, mat('#8c8272', 0.85), 0, 0.08, 0), box(3.4, 0.08, 0.95, mat('#5b4a38', 0.75), 0, 0.42, 0));
  for (const x of [-1.0, 1.0]) book.add(box(0.06, 0.54, 0.98, mat('#4a4038', 0.7), x, -0.02, 0));
  st.add(book);
  st.scale.setScalar(k);
  st.position.y = 12.4 * (1 - k);
  g.add(st);
  return g;
}

// The Alankara Mandapam, the 11.6 m pedestal (with the statue's stepped base, 12.4 m): a square
// hall of grey granite on a broad plinth sunk into the rock, its walls ranked with pilasters and
// recessed panels in two storeys under projecting cornices, a doorway in the middle of the front,
// and on its roof a terrace behind a parapet with posts at the corners, where the statue stands on
// a base of two steps.
function alankaraMandapam() {
  const g = new THREE.Group(), W = 17, P = PED, D = PED_DARK;
  g.add(box(19.4, 3.8, 19.4, P, 0, -2.8), box(18.4, 0.4, 18.4, D, 0, 1.0), box(W, 9.0, W, P, 0, 1.4));
  // Cornices: a band between the storeys, and the deep cornice under the terrace.
  g.add(box(W + 0.8, 0.45, W + 0.8, D, 0, 5.6), box(W + 1.3, 0.5, W + 1.3, D, 0, 10.4), box(W + 0.7, 0.3, W + 0.7, P, 0, 10.9));
  const pil = [], panels = [];
  for (const ry of [0, Math.PI / 2, Math.PI, -Math.PI / 2]) {
    const c = Math.cos(ry), sn = Math.sin(ry), put = (list, u, y, w, h, proud) => list.push([sn * (W / 2 + proud / 2) + c * u, y, c * (W / 2 + proud / 2) - sn * u, w, h, proud, ry]);
    for (let u = -7.6; u <= 7.61; u += 2.53) put(pil, u, 1.4, 0.75, 9.0, 0.4);
    for (let u = -6.33; u <= 6.34; u += 2.53) for (const [y, h] of [[2.0, 3.1], [6.4, 3.4]]) if (!(ry === 0 && Math.abs(u) < 1.5 && y < 5)) put(panels, u, y, 1.45, h, 0.06);
  }
  g.add(inst(unitBox(), pil, P), inst(unitBox(), panels, D));
  // The doorway in the middle of the front, in a stepped frame.
  g.add(box(3.4, 4.4, 0.3, D, 0, 1.4, W / 2 + 0.1), box(2.4, 3.6, 0.32, DOOR, 0, 1.4, W / 2 + 0.12));
  // The terrace's parapet, with a post at each corner, and the statue's stepped base.
  for (const sd of [-1, 1]) g.add(box(W + 0.6, 1.0, 0.4, P, 0, 11.2, sd * (W / 2 + 0.1)), box(0.4, 1.0, W + 0.6, P, sd * (W / 2 + 0.1), 11.2, 0));
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) g.add(box(1.0, 1.5, 1.0, D, sx * (W / 2 + 0.1), 11.2, sz * (W / 2 + 0.1)));
  g.add(box(8.4, 0.6, 8.4, D, 0, 11.2), box(7.2, 0.6, 7.2, P, 0, 11.8));
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

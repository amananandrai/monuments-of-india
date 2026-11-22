import * as THREE from 'three';
import { mesh, box, cyl, at, lathe } from '../helpers.js';
import { mergeByMaterial } from '../parts/components.js';
import { detail } from '../detail.js';
import { addDetails, ROCK, ROCK_LIGHT, DARK, DIMS } from '../details/elephanta-caves.js';

// A pillar of the Great Cave, h tall, as cut from the rock: a tall square base, a short fluted round
// shaft swelling into a ribbed cushion capital (like a flattened amalaka), and a square abacus under
// a bracket that runs into the ceiling's beam.
function pillar(h) {
  const g = new THREE.Group(), L = ROCK_LIGHT, b = h * 0.46;
  g.add(box(1.25, b, 1.25, L), box(1.4, 0.25, 1.4, L, 0, 0));
  g.add(cyl(0.48, 0.52, h * 0.22, L, 0, b, 0, detail.low ? 10 : 16));
  const cap = lathe([[0.5, 0], [0.72, 0.15], [0.86, 0.38], [0.84, 0.6], [0.66, 0.8], [0.5, 0.88]], L, detail.low ? 12 : 20);
  cap.scale.set(1, (h * 0.16) / 0.88, 1);
  cap.position.y = b + h * 0.22;
  g.add(cap, box(1.3, h * 0.07, 1.3, L, 0, h * 0.84), box(1.9, h * 0.09, 0.9, L, 0, h * 0.91));
  return mergeByMaterial(g);
}

// The Great Cave (Cave 1) on Elephanta, the island of Gharapuri in Mumbai Harbour, cut into the
// basalt in the 6th century. Its main entrance faces north, here +z: a front of four pillars and two
// pilasters between which the hall opens, about 39 m square inside and some 5.5 m high, its flat
// ceiling carried on rows of pillars. On the back wall, opposite the entrance, the Trimurti in its
// deep recess between two guardians; on the west side of the hall, the square shrine of the linga
// with a door on each face. Over all, the wooded hill of the island, which runs down to the sea.
export function buildElephantaCaves() {
  const g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  const { HW, HD, HH, H } = DIMS;
  // The rock round the hall, its face cut sheer either side of the mouth: two flanks, the mass over the ceiling, and the rock behind the back
  // wall, cut by the Trimurti's recess (RW wide, RD deep, RH high). The cliff's face is at z = 0.
  const R = new THREE.Group(), back = HD + 31, { RW, RD, RH } = DIMS;
  for (const s of [-1, 1]) R.add(box(14, H, back, ROCK, s * (HW / 2 + 7), 0, -back / 2));
  R.add(box(HW + 0.02, H - HH, HD, ROCK, 0, HH, -HD / 2), box(HW + 0.02, H - RH, 31, ROCK, 0, RH, -HD - 15.5));
  for (const s of [-1, 1]) R.add(box((HW - RW) / 2 + 0.01, RH + 0.01, 31, ROCK, s * (RW + HW) / 4, -0.01, -HD - 15.5));
  R.add(box(RW, RH + 0.01, 31 - RD, ROCK, 0, -0.01, -HD - RD - (31 - RD) / 2));
  g.add(mergeByMaterial(R));
  // The hall's floor, a little lighter, and the ceiling's soffit, dark.
  f.add(box(HW, 0.1, HD, ROCK_LIGHT, 0, 0, -HD / 2), box(HW, 0.05, HD, DARK, 0, HH - 0.06, -HD / 2));
  // The front: a deep beam over the opening on four pillars and two half pillars, a step up.
  f.add(box(HW, 0.8, 1.4, ROCK_LIGHT, 0, HH - 0.8, -0.7), box(HW + 2, 0.4, 3, ROCK_LIGHT, 0, -0.3, 1.5));
  const P = pillar(HH - 0.8);
  for (const x of [-12.2, -4.1, 4.1, 12.2]) f.add(at(P.clone(), x, 0, -0.8));
  for (const s of [-1, 1]) f.add(box(1.6, HH, 1.3, ROCK_LIGHT, s * (HW / 2 - 0.8), 0, -0.7));
  // The hall's pillars, in rows of six across and six deep, leaving room for the shrine on the west
  // and the Trimurti's recess on the south.
  const pp = new THREE.Group();
  for (let i = 0; i < 6; i++) for (let j = 0; j < 6; j++) {
    const x = -16.2 + i * 6.5, z = -4.6 - j * 6;
    if (x < -8 && z < -10 && z > -32) continue;
    pp.add(at(P.clone(), x, 0, z));
  }
  f.add(pp);
  // The beams over the rows, cut across the ceiling.
  for (let j = 0; j < 6; j++) f.add(box(HW, 0.5, 0.9, ROCK_LIGHT, 0, HH - 0.56, -4.6 - j * 6));
  addDetails(f, g);
  // From the north, up the steps into the hall towards the Trimurti.
  return { group: g, focus: f, view: [0.6, 0.22, 1], zoom: 0.8, target: [0, 4, -12] };
}

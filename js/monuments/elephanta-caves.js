import * as THREE from 'three';
import { box, cyl, at, lathe } from '../helpers.js';
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
// basalt in the 6th century. From the plan and photographs: its main entrance faces north, here
// +z, a mouth some 16 m wide between two pillars and two pilasters; behind the portico the hall,
// about 27 m square and some 5.5 m high, its flat ceiling carried on rows of pillars; and a portico
// like the north one on the east and the west, each opening on a court cut down through the rock
// and open to the sky, so that the cave measures 39 m from north to south and from east to west.
// On the south wall, opposite the entrance, the Trimurti in its deep recess between two guardians;
// in the west of the hall, on the right of one who enters, the square shrine of the linga with a
// door on each face. Over all, the wooded hill of the island, which runs down to the sea.
export function buildElephantaCaves() {
  const g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  const { B, X1, X2, X3, XC, XO, ZN, ZA, ZB, ZS, BACK, HH, H, RW, RD, RH, SH } = DIMS;
  // The rock, as blocks [x0, x1, z0, z1, y0, y1] round the hall, the porticoes, the recess and the
  // courts: the cliff either side of the mouth, the hall's side walls, the rock south of the
  // courts and behind the south wall, and the masses over the ceilings. The cliff's face is at z = 0.
  const R = new THREE.Group(), blk = (x0, x1, z0, z1, y0 = -0.01, y1 = H, m = ROCK) => R.add(box(x1 - x0, y1 - y0, z0 - z1, m, (x0 + x1) / 2, y0, (z0 + z1) / 2));
  for (const s of [-1, 1]) {
    const mir = (x0, x1, ...r) => (s > 0 ? blk(x0, x1, ...r) : blk(-x1, -x0, ...r));
    mir(X1, XO, 0, ZN);
    mir(X2, XO, ZN, ZA);
    mir(RW / 2, X2, ZS, BACK);
    mir(X2, X3, ZA, ZB, HH);
    if (s > 0) mir(X2, XO, ZB, BACK);
  }
  // South of the east court, the rock is cut by the portico of the Shakti shrine.
  const [s0, s1, sd, sf, st] = SH;
  blk(-s0, -X2, ZB, BACK); blk(-XO, -s1, ZB, BACK); blk(-s1, -s0, ZB - sd, BACK); blk(-s1, -s0, ZB, ZB - sd, st); blk(-s1, -s0, ZB, ZB - sd, -0.01, sf, ROCK_LIGHT);
  blk(-RW / 2, RW / 2, ZS - RD, BACK); blk(-RW / 2, RW / 2, ZS, ZS - RD, RH);
  blk(-X1, X1, 0, ZN, HH); blk(-X2, X2, ZN, ZS, HH);
  g.add(mergeByMaterial(R));
  // The floors, a little lighter, and the ceilings' soffits, dark: the north portico, the hall, the
  // east and west porticoes; the courts' floors run out to where the gullies begin.
  const fl = new THREE.Group(), slab = (x0, x1, z0, z1, roof = true) => {
    fl.add(box(x1 - x0, 0.1, z0 - z1, ROCK_LIGHT, (x0 + x1) / 2, 0, (z0 + z1) / 2));
    if (roof) fl.add(box(x1 - x0, 0.05, z0 - z1, DARK, (x0 + x1) / 2, HH - 0.06, (z0 + z1) / 2));
  };
  slab(-X1, X1, 0, ZN); slab(-X2, X2, ZN, ZS);
  for (const s of [-1, 1]) { slab(Math.min(s * X2, s * X3), Math.max(s * X2, s * X3), ZA, ZB); slab(Math.min(s * X3, s * (XC + 6)), Math.max(s * X3, s * (XC + 6)), ZA, ZB, false); }
  // The north front: a deep beam over the mouth on two pillars and two half pillars, a step up.
  fl.add(box(2 * X1, 0.8, 1.4, ROCK_LIGHT, 0, HH - 0.8, -0.7), box(2 * X1 + 2, 0.4, 3, ROCK_LIGHT, 0, -0.3, 1.5));
  for (const s of [-1, 1]) fl.add(box(1.1, HH, 1.3, ROCK_LIGHT, s * (X1 - 0.55), 0, -0.7));
  // The east and west fronts onto the courts, the same.
  for (const s of [-1, 1]) {
    fl.add(box(1.4, 0.8, ZA - ZB, ROCK_LIGHT, s * (X3 - 0.7), HH - 0.8, (ZA + ZB) / 2), box(3, 0.4, ZA - ZB + 2, ROCK_LIGHT, s * (X3 + 1.5), -0.3, (ZA + ZB) / 2));
    for (const z of [ZA - 0.55, ZB + 0.55]) fl.add(box(0.9, HH, 1.1, ROCK_LIGHT, s * (X3 - 0.45), 0, z));
  }
  // The beams over the rows of pillars, cut across the ceiling.
  for (let k = 1; k <= 5; k++) fl.add(box(2 * X2, 0.5, 0.9, ROCK_LIGHT, 0, HH - 0.56, -k * B));
  f.add(mergeByMaterial(fl));
  // The pillars: two in each front; in the hall four across on every bay line, with half pillars
  // against the walls where the north portico opens, and a pair between the hall and the east
  // portico. The linga shrine stands in the place of four on the west.
  const pp = new THREE.Group(), P = pillar(HH - 0.8);
  for (const x of [-B / 2, B / 2]) pp.add(at(P.clone(), x, 0, -0.8));
  for (const s of [-1, 1]) for (const k of [3, 4]) pp.add(at(P.clone(), s * (X3 - 0.8), 0, -k * B));
  for (let k = 1; k <= 5; k++) for (const x of [-X1, -B / 2, B / 2, X1]) {
    if (x > B && (k === 3 || k === 4)) continue;
    pp.add(at(P.clone(), x, 0, -k * B));
  }
  for (const k of [3, 4]) pp.add(at(P.clone(), -X2, 0, -k * B));
  f.add(pp);
  addDetails(f, g, pillar);
  // From the north, up the steps into the hall towards the Trimurti.
  return { group: g, focus: f, view: [-0.45, 0.2, 1], zoom: 0.32, target: [0, 3.5, -6] };
}

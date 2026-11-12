import * as THREE from 'three';
import { M, mesh, box, cyl, at, hemi, shikhara, rng, instBoxes, torana } from '../helpers.js';
import { mughalDoorway } from '../details/mughal.js';
import { steps } from '../details/doorways.js';
import { trees as plantTrees } from '../details/realism.js';
import { addDetails } from '../details/mahabodhi-temple.js';

export function buildMahabodhi() {
  const S = M.bodh, g = new THREE.Group(), f = new THREE.Group(), R = rng(11);
  g.add(f);
  g.add(box(80, 0.3, 90, M.path, 0, 0, -6));
  // The lotus pond south of the railing (south is -x here): a stone-rimmed tank 30 × 36.
  g.add(box(30, 0.3, 36, M.water, -62, 0, -6));
  for (const [w, d, x, z] of [[34, 2, -62, -25], [34, 2, -62, 13], [2, 36, -78, -6], [2, 36, -46, -6]]) g.add(box(w, 0.55, d, S, x, 0, z));
  f.add(box(28, 5, 28, S), box(17, 8, 17, S, 0, 5, 0));
  // The east porch's pointed doorway, a landing and steps down from the terrace
  f.add(box(8, 7, 6, S, 0, 5, 11), at(mughalDoorway(3, 5, { m: S, depth: 0.7 }), 0, 5, 14), box(4.6, 5, 0.8, S, 0, 0, 14.4), at(steps(3, 5, 10, S), 0, 0, 14.8));
  const main = shikhara(15, 38, S, (t) => 1 - 0.66 * t, 22);
  f.add(at(main, 0, 13, 0));
  for (const x of [-10.5, 10.5]) for (const z of [-10.5, 10.5]) f.add(at(shikhara(4, 13, S, (t) => 1 - 0.6 * t, 10), x, 5, z));
  // Stone railing around the temple
  const posts = [];
  // open on the east, in front of the steps, through a stone gateway (torana)
  for (let k = -18; k <= 18; k += 1.5) for (const s of [-18, 18]) {
    if (!(s > 0 && Math.abs(k) < 2.5)) posts.push([k, 0, s, 0.4, 2.4, 0.4]);
    posts.push([s, 0, k, 0.4, 2.4, 0.4]);
  }
  f.add(instBoxes(posts, S));
  for (const y of [0.8, 1.6]) {
    f.add(box(36, 0.25, 0.3, S, 0, y, -18));
    for (const s of [-1, 1]) f.add(box(15.6, 0.25, 0.3, S, s * 10.2, y, 18), box(0.3, 0.25, 36, S, s * 18, y, 0));
  }
  const gate = torana(S);
  gate.scale.setScalar(0.62);
  f.add(at(gate, 0, 0, 18));
  // The Bodhi tree behind the temple, and votive stupas in the courtyard
  // The tree is one peepal, 18 m tall, west of the temple (it is dressing, beside the framed group).
  g.add(plantTrees([[0, -28]], { kind: 'peepal', seed: 7, h: 18 }));
  // (Forty draws the old tree used, so the votive stupas below stay where they were.)
  for (let i = 0; i < 40; i++) R();
  for (let i = 0; i < 12; i++) {
    const x = (R() < 0.5 ? -1 : 1) * (22 + R() * 12), z = (R() - 0.5) * 60;
    f.add(cyl(1.3, 1.5, 1, S, x, 0, z, 16), at(hemi(1.3, S, 16), x, 1, z), cyl(0.1, 0.1, 1.2, S, x, 2.2, z, 6));
  }
  addDetails(f, g);
  return { group: g, focus: f, view: [0.95, 0.35, 1.15] };
}

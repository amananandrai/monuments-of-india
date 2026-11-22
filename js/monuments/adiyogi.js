import * as THREE from 'three';
import { mat, mesh, at } from '../helpers.js';
import { ellipsoid as E, cone, chain, blend, carve, mirrorX, flatBase, bounded, sculpt, statueMaterial, onSkin, smin } from '../sdf.js';
import { detail } from '../detail.js';
import { addDetails } from '../details/adiyogi.js';

// Adiyogi at the Isha Yoga Centre near Coimbatore (2017), from photographs: a bust of Shiva as the
// first yogi, 112 ft (34.24 m) high, 45 m across and 25 m deep, of black steel, at the foot of the
// Velliangiri hills. The head, half the statue's height, stands on a thick neck that rises out of
// very broad shoulders, which slope away to the ground on either side like a mound: there are no
// arms. The face is calm and smooth, the eyes closed under arched lids, the lips full and a little
// smiling; the third eye is a pale upright almond of bright steel on the brow. The hair is a mass
// of matted locks piled into a knot, with a large pale crescent moon standing out of it on his
// left, and it falls behind the neck in a broad cloak that spreads over the shoulders, long locks
// running down them to the ground. A copper ring hangs in each ear. A cobra coils round the foot
// of the neck and rears its hood beside it on his right, and a thin cord hangs in a V on the
// chest. The bust faces +z; it stands on a low platform BASE high.
export const STEEL = mat('#1f1f22', 0.36, 0.55), BASE = 1.6, H = 34.24;
const BRIGHT = mat('#c9ccd0', 0.3, 0.8), COPPER = mat('#b9753a', 0.35, 0.8);
// The head's layout, after the face of the seated Shiva (js/parts/figures.js), in units P maps to
// metres: S metres a unit, the middle of the skull at y = HY.
const S = 0.62, HY = 24.3, HZ = 1.0;
const P = (x, y, z) => [x * S, HY + y * S * 1.08, HZ + z * S], k = (v) => v * S;

// The long locks over each shoulder: from behind the ear, down beside the neck and out along the
// slope of the shoulder to the ground, five a side, fanning backwards.
function locks(sx) {
  return [0, 1, 2, 3, 4].map((j) => chain([
    [sx * (6.2 + 0.25 * j), 21.5, -2.4 - 0.6 * j, 0.8],
    [sx * (8.0 + 0.6 * j), 16.5, -2.4 - 0.7 * j, 1.0],
    [sx * (10.5 + 1.2 * j), 11.2 - 0.35 * j, -1.2 - 0.9 * j, 1.0],
    [sx * (13.2 + 1.5 * j), 9.0 - 0.6 * j, 0.2 - 1.0 * j, 0.9],
    [sx * (15.4 + 1.5 * j), 6.6 - 0.75 * j, 1.2 - 1.1 * j, 0.7],
  ], 0.3));
}

function adiyogiField() {
  // The body, cut flat at y = 0: the mound of the shoulders, 45 m across, the trapezius rising to
  // the neck, the chest swelling forward, and the thick neck.
  const torso = blend([
    [E([0, 0, -1], [22.5, 11.5, 11.5]), 0],
    [E([0, 10.6, -1.2], [10.5, 3.4, 5.5]), 2.5],
    [E([0, 6.5, 6.4], [9, 5, 4.5]), 2.5],
    [cone([0, 10, -0.6], [0, 20.6, 0.6], 5.0, 4.4), 2.0],
  ]);
  // The line between the breasts.
  const body = carve(torso, E([0, 7, 11.1], [0.4, 2.6, 0.6]), 0.5);
  // The head: skull, jaw and chin, cheeks, brow, nose, lips and ears.
  let head = blend([
    [E(P(0, 1.4, -0.5), [k(9.8), k(10.8) * 1.08, k(10.3)]), 0],
    [E(P(0, -5.0, 1.2), [k(7.4), k(5.6) * 1.08, k(7.4)]), k(3)],
    [mirrorX(E(P(4.6, -2.2, 6.4), [k(3.2), k(2.8), k(2.8)])), k(1.6)],
    [E(P(0, 2.7, 8.3), [k(6.6), k(1.2), k(2.1)]), k(1.6)],
    [cone(P(0, 2.0, 9.4), P(0, -2.4, 11.6), k(0.95), k(1.4)), k(0.8)],
    [E(P(0, -2.6, 11.2), [k(1.7), k(1.25), k(1.3)]), k(0.6)],
    [mirrorX(E(P(1.45, -3.0, 10.1), [k(1.0), k(0.85), k(0.85)])), k(0.5)],
    [E(P(0, -8.4, 6.6), [k(3.0), k(2.0), k(2.4)]), k(1.5)],
    [mirrorX(E(P(9.9, -0.4, -0.6), [k(1.3), k(3.5), k(2.5)])), k(0.6)],
  ]);
  head = carve(head, mirrorX(E(P(3.4, 0.5, 9.2), [k(2.4), k(1.5), k(2.0)])), k(0.9));
  // The eyes half closed: the eyeball low in its socket, the upper lid heavy and drawn down over
  // most of it, the lower lid a thin rim; full lips, the corners turned a little up.
  head = blend([[head, 0],
    [mirrorX(E(P(3.4, 0.3, 7.8), [k(1.9), k(1.1), k(1.5)])), k(0.2)],
    [mirrorX(E(P(3.4, 0.75, 8.1), [k(2.25), k(0.85), k(1.45)])), k(0.25)],
    [mirrorX(E(P(3.45, -0.85, 8.0), [k(1.9), k(0.3), k(0.95)])), k(0.3)],
    [E(P(0, -4.4, 9.4), [k(2.7), k(0.75), k(1.1)]), k(0.5)],
    [E(P(0, -5.65, 9.1), [k(2.4), k(0.9), k(1.1)]), k(0.5)]]);
  // The slit between the lids, the line between the lips, the philtrum, the ears' hollows.
  head = carve(head, mirrorX(E(P(3.4, 0.02, 9.2), [k(1.7), k(0.12), k(0.7)])), k(0.12));
  head = carve(head, E(P(0, -5.05, 10.0), [k(2.7), k(0.17), k(1.0)]), k(0.2));
  head = carve(head, E(P(0, -3.65, 10.25), [k(0.35), k(0.6), k(0.3)]), k(0.15));
  head = carve(head, mirrorX(E(P(10.7, -0.2, -0.2), [k(0.5), k(2.0), k(1.2)])), k(0.25));
  // The hair: a cap of locks over the skull, from a hairline high on the brow, and the knot,
  // three rings of piled locks rising to the top; and the locks down the back.
  const hair = blend([
    [E(P(0, 4.8, -2.4), [k(10.6), k(9.6), k(11.0)]), 0],
    [E(P(0, 10.4, -2.6), [k(6.2), k(2.8), k(5.8)]), k(1.4)],
    [E(P(0, 12.8, -2.9), [k(4.4), k(2.1), k(4.2)]), k(1.0)],
    [E(P(0, -1.0, -6.5), [k(11.0), k(12.0), k(6.0)]), k(2.0)],
  ]);
  // The cloak of hair behind the neck, spreading over the shoulders.
  const cloak = blend([[E([0, 15, -5.4], [10.5, 9, 4.6]), 0], [E([0, 8.5, -6.8], [16.5, 6.5, 4.8]), 3]]);
  // Grooves between the coils of the knot and the locks of the cap.
  let hairC = hair;
  for (const [y, r] of [[9.2, 6.4], [11.6, 5.2], [13.6, 3.6]]) hairC = carve(hairC, (x, yy, z) => Math.hypot(Math.hypot(x, (z - P(0, 0, -2.6)[2]) * 1.05) - k(r), yy - P(0, y, 0)[1]) - k(0.35), k(0.3));
  // The matted locks: ropes of hair running back from the hairline over the cap to the knot.
  const C = P(0, 4.8, -2.4), ropes = [];
  for (let i = -7; i <= 7; i++) {
    const phi = i * 0.36, pts = [];
    for (const [e, r] of [[0.4, 0.45], [0.7, 0.85], [1.02, 0.95], [1.3, 0.95]]) pts.push([C[0] + k(10.7) * Math.sin(phi) * Math.cos(e), C[1] + k(9.7) * Math.sin(e), C[2] + k(11.1) * Math.cos(phi) * Math.cos(e), k(r)]);
    ropes.push([chain(pts, k(0.3)), k(0.35)]);
  }
  const headB = bounded(blend([[head, 0], [blend([[hairC, 0], ...ropes]), k(0.6)]]), [0, 25.5, -0.5], 13.5, 1.5);
  const lockL = locks(-1), lockR = locks(1);
  const locksF = blend([...lockL, ...lockR].map((f) => [f, 0.2]));
  const all = (x, y, z) => smin(smin(smin(body(x, y, z), headB(x, y, z), 1.2), cloak(x, y, z), 0.8), locksF(x, y, z), 0.45);
  return { f: flatBase(all, 0, 0.3), lo: [-24, -0.2, -14], hi: [24, H + 0.6, 12.5], head };
}

let fieldP = null;
const parts = () => (fieldP ||= adiyogiField());

// The bust, meshed once: the body on a coarse grid, the face on a fine one.
function bustMesh() {
  const low = detail.low;
  return mesh(sculpt(low ? 'adiyogi-coarse' : 'adiyogi', adiyogiField, {
    h: low ? 0.4 : 0.2, reach: 1.4, deep: [0.4, 0.4, 0.42], wear: 0.25,
    split: [{ region: E(P(0, -1.2, 7.4), [k(10.2), k(10.4), k(6.2)]), h: low ? 0.13 : 0.07, lo: [-6.9, 16.6, 1.6], hi: [6.9, 32.4, 9.6] }],
  }), statueMaterial(STEEL));
}

// What is laid on the skin: the cobra, the cord, the crescent, the third eye and the earrings.
function ornaments() {
  const f = parts().f, g = new THREE.Group(), V = (p) => new THREE.Vector3(...p);
  // The cobra: its body comes round the back of the neck and over his right shoulder, then rises
  // beside the neck, the hood spread and facing forward at the height of the jaw.
  const coil = [[4.2, 13.2, -4.4], [0, 13.4, -5.7], [-4.2, 13.4, -4.2], [-6.1, 13.7, -1.6]];
  const rise = [[-6.6, 14.6, 0.4], [-6.9, 15.9, 1.1], [-7.0, 17.0, 1.7]];
  const curve = new THREE.CatmullRomCurve3([...coil, ...rise].map(V));
  g.add(mesh(new THREE.TubeGeometry(curve, detail.low ? 60 : 120, 0.55, detail.low ? 8 : 12, false), STEEL));
  const hood = mesh(new THREE.SphereGeometry(1, 20, 14), STEEL, -7.0, 17.6, 1.9);
  hood.scale.set(1.5, 2.0, 0.5);
  hood.rotation.x = -0.15;
  const snout = mesh(new THREE.SphereGeometry(0.55, 14, 10), STEEL, -7.0, 18.7, 2.5);
  snout.scale.set(0.9, 0.7, 1.3);
  g.add(hood, snout);
  // The cord: two thin lines from the sides of the neck, meeting low on the chest.
  for (const sx of [-1, 1]) {
    const pts = [];
    for (let i = 0; i <= 14; i++) { const t = i / 14; pts.push([sx * 4.8 * (1 - t), 12.2 - 8.2 * t, 12]); }
    g.add(mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(onSkin(f, pts, 0.1).map(V)), 60, 0.14, 6), STEEL));
  }
  // The crescent in the knot, on his left: of bright steel, its belly against the hair, one horn
  // in the locks and the other standing out to the side.
  const R = 2.7, lune = new THREE.Shape(), N = 28;
  for (let i = 0; i <= N; i++) { const a = (i / N * 2 - 1) * 1.85; lune[i ? 'lineTo' : 'moveTo'](R * Math.cos(a), R * Math.sin(a)); }
  for (let i = N; i >= 0; i--) { const t = i / N * 2 - 1, a = t * 1.85, r = R - 0.85 * (1 - t * t) ** 0.8; lune.lineTo(r * Math.cos(a), r * Math.sin(a)); }
  const moon = mesh(new THREE.ExtrudeGeometry(lune, { depth: 0.3, bevelEnabled: true, bevelThickness: 0.08, bevelSize: 0.08, bevelSegments: 2 }).translate(0, 0, -0.15), BRIGHT);
  moon.position.set(6.3, 31.9, HZ + k(1.5));
  moon.rotation.set(0, -0.25, 3.95);
  g.add(moon);
  // The third eye: a pale upright almond on the brow.
  const eye = mesh(new THREE.SphereGeometry(1, 16, 20), BRIGHT);
  eye.scale.set(0.42, 1.15, 0.16);
  // Set on the brow by stepping in along z until the skin is met.
  let ez = 10;
  while (f(0, P(0, 5.0, 0)[1], ez) > 0 && ez > 4) ez -= 0.02;
  eye.position.set(0, P(0, 5.0, 0)[1], ez);
  g.add(eye);
  // A copper ring hanging from each ear lobe.
  for (const s of [-1, 1]) g.add(mesh(new THREE.TorusGeometry(0.95, 0.2, 10, 28), COPPER, s * (k(10.3) + 0.1), HY - k(5.6) * 1.08, HZ + k(1.2)));
  return g;
}

// The bust with what is laid on its skin, its foot at y = 0.
export function adiyogi() {
  const bust = new THREE.Group();
  bust.add(bustMesh(), ornaments());
  return bust;
}

export function buildAdiyogi() {
  const g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  f.add(at(adiyogi(), 0, BASE, 0));
  addDetails(f, g, { BASE });
  // Square on to the face, from the forecourt, looking up.
  return { group: g, focus: f, view: [-0.12, 0.1, 1], zoom: 0.9 };
}

import * as THREE from 'three';
import { mat, mesh, at } from '../helpers.js';
import { ellipsoid as E, cone, chain, blend, carve, mirrorX, flatBase, bounded, sculpt, statueMaterial, onSkin, smin } from '../sdf.js';
import { detail } from '../detail.js';
import { addDetails } from '../details/adiyogi.js';

// Adiyogi at the Isha Yoga Centre near Coimbatore (2017), from photographs taken from the front,
// both sides, below and behind (Wikimedia Commons, "Adiyogi Shiva bust" and the Isha Yoga Centre
// series): a bust of Shiva as the first yogi, 112 ft (34.24 m) high, 45 m across and 25 m deep, of
// black steel, at the foot of the Velliangiri hills. The head, half the statue's height, stands on
// a thick neck that rises out of very broad shoulders, which slope away to the ground on either
// side like a mound: there are no arms. The face is calm and smooth, the eyes closed, the brows
// arched, the lips full and a little smiling; the third eye is a tall white flame on the brow.
// The hair is a mass of thick wavy ropes that start at the crown, sweep back over the head and
// fall down the sides and the back to the shoulders and the ground, twice as deep as the head
// behind. A thin bright crescent stands on the hair on his left, and a copper ring hangs in each
// ear. A cobra stands on his right shoulder beside the neck, its broad hood spread and facing
// forward as high as the jaw, and a thin cord hangs in a V on the chest. The bust faces +z; it
// stands on a terrace BASE high.
export const STEEL = mat('#1f1f22', 0.36, 0.55), BASE = 1.6, H = 34.24;
const BRIGHT = mat('#c9ccd0', 0.3, 0.8), COPPER = mat('#b9753a', 0.35, 0.8);
// The head's layout, after the face of the seated Shiva (js/parts/figures.js), in units P maps to
// metres: S metres a unit, the middle of the skull at y = HY.
const S = 0.62, HY = 24.3, HZ = 1.0;
const P = (x, y, z) => [x * S, HY + y * S * 1.08, HZ + z * S], k = (v) => v * S;

// The top of the mound of the shoulders at (x, z), or 0 beyond it.
const mound = (x, z) => { const q = 1 - (x / 22.5) ** 2 - ((z + 1) / 11.5) ** 2; return q > 0 ? 11.5 * Math.sqrt(q) : 0; };
// The ropes of hair: each starts at the crown, runs over the head towards its own side (phi, the
// angle from the front) and falls beside the neck and down the shoulders or the back, waving from
// side to side as it goes. C is the middle of the hair's cap.
function ropes(C) {
  const out = [];
  for (const sx of [-1, 1]) for (let i = 0; i < 10; i++) {
    const phi0 = sx * (1.52 + i * 0.178), ph = i * 1.7 + (sx > 0 ? 0.6 : 0), pts = [[0.4 * sx, C[1] + 6.1, C[2] + 2.6, 1.0]];
    const wave = (t) => phi0 + 0.13 * Math.sin(ph + t * 5.2);
    [[1.02, 1.05], [0.5, 1.2], [-0.05, 1.25]].forEach(([e, r], n) => { const a = wave(n + 1); pts.push([C[0] + 7.5 * Math.sin(a) * Math.cos(e), C[1] + 6.3 * Math.sin(e), C[2] + 7.7 * Math.cos(a) * Math.cos(e), r]); });
    [[8.8, 18.2], [10.6, 13.6], [13.2, 0], [16.2, 0], [19.4, 0]].forEach(([R, y], n) => {
      const a = wave(n + 4), x = R * Math.sin(a), z = Math.max(-14.6, R * 0.8 * Math.cos(a) - 2.2);
      pts.push([x, y || Math.max(0.6, mound(x, z) + 0.35), z, n < 4 ? 1.25 : 0.9]);
    });
    out.push([chain(pts, 0.4), 0.5]);
  }
  // Shorter ropes over the temples, from the crown down to above the ears, which stay bare.
  for (const sx of [-1, 1]) for (const [a, e1] of [[0.62, 0.42], [1.08, 0.3]]) {
    const pts = [[0.4 * sx, C[1] + 6.1, C[2] + 2.6, 0.9]];
    for (const [e, r, w, q] of [[1.0, 1.0, 0.1, 1], [0.68, 1.1, -0.08, 1], [e1, 0.5, 0.06, 0.95]]) pts.push([C[0] + 7.4 * q * Math.sin(sx * (a + w)) * Math.cos(e), C[1] + 6.3 * Math.sin(e), C[2] + 7.6 * q * Math.cos(a + w) * Math.cos(e), r]);
    out.push([chain(pts, 0.4), 0.5]);
  }
  return blend(out);
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
  // The eyes closed: the upper lid drawn right down over the eyeball to meet the lower, the line
  // between them a shallow curve; full lips, the corners turned a little up.
  head = blend([[head, 0],
    [mirrorX(E(P(3.4, 0.15, 8.35), [k(2.2), k(1.2), k(1.6)])), k(0.45)],
    [mirrorX(E(P(3.45, -0.85, 8.0), [k(1.9), k(0.3), k(0.95)])), k(0.3)],
    [E(P(0, -4.4, 9.4), [k(2.7), k(0.75), k(1.1)]), k(0.5)],
    [E(P(0, -5.65, 9.1), [k(2.4), k(0.9), k(1.1)]), k(0.5)]]);
  // The slit between the lids, the line between the lips, the philtrum, the ears' hollows.
  head = carve(head, mirrorX(E(P(3.4, -0.5, 9.85), [k(1.75), k(0.1), k(0.5)])), k(0.1));
  head = carve(head, mirrorX(E(P(2.9, -4.85, 9.5), [k(0.3), k(0.22), k(0.3)])), k(0.2));
  head = carve(head, E(P(0, -5.05, 10.0), [k(2.7), k(0.17), k(1.0)]), k(0.2));
  head = carve(head, E(P(0, -3.65, 10.4), [k(0.3), k(0.5), k(0.2)]), k(0.2));
  head = carve(head, mirrorX(E(P(10.7, -0.2, -0.2), [k(0.5), k(2.0), k(1.2)])), k(0.25));
  // The hair: a full cap over the skull from a hairline high on the brow, deeper behind than the
  // head itself, and the mass that falls behind the neck and spreads over the back of the
  // shoulders; the ropes lie on both.
  const C = P(0, 4.8, -3.0);
  const cap = blend([
    [E(C, [7.0, 6.2, 7.4]), 0],
    [E(P(0, -1.0, -7.5), [k(11.4), k(12.0), k(7.0)]), k(2.0)],
  ]);
  const headB = bounded(blend([[head, 0], [cap, k(0.6)]]), [0, 25.5, -0.5], 14.5, 1.5);
  const fall = blend([[E([0, 15, -6.2], [9.5, 10, 5.0]), 0], [E([0, 7.5, -7.6], [14.5, 7.5, 5.6]), 3]]);
  const hairF = blend([[fall, 0], [ropes(C), 0.6]]);
  const all = (x, y, z) => smin(smin(body(x, y, z), headB(x, y, z), 1.2), hairF(x, y, z), 0.6);
  return { f: flatBase(all, 0, 0.3), lo: [-24, -0.2, -16.5], hi: [24, H + 1.6, 12.5], head };
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
  // The cobra on his right shoulder: its body comes out of the hair behind, rises beside the neck
  // and spreads a broad hood, hollowed in front, with the head at its top looking forward.
  const body = new THREE.CatmullRomCurve3([[-11.2, 9.2, -1.2], [-10.3, 10.2, 1.4], [-9.4, 11.4, 3.0], [-8.8, 13.0, 3.6], [-8.6, 14.4, 3.7]].map(V));
  g.add(mesh(new THREE.TubeGeometry(body, 40, 0.75, 12, false), STEEL));
  const hood = mesh(new THREE.SphereGeometry(1, 28, 20), STEEL, -8.6, 15.6, 3.8);
  hood.scale.set(2.5, 3.3, 0.6);
  hood.rotation.set(-0.12, 0.25, 0);
  const snout = mesh(new THREE.SphereGeometry(1, 16, 12), STEEL, -8.5, 18.3, 4.6);
  snout.scale.set(0.95, 0.7, 1.35);
  snout.rotation.x = 0.35;
  g.add(hood, snout);
  // The cord: two thin lines from the sides of the neck, meeting low on the chest.
  for (const sx of [-1, 1]) {
    const pts = [];
    for (let i = 0; i <= 14; i++) { const t = i / 14; pts.push([sx * 4.8 * (1 - t), 12.2 - 8.2 * t, 12]); }
    g.add(mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(onSkin(f, pts, 0.1).map(V)), 60, 0.14, 6), COPPER));
  }
  // The crescent standing on the hair, on his left: thin, of bright steel, its horns turned up.
  const R = 2.3, lune = new THREE.Shape(), N = 28;
  for (let i = 0; i <= N; i++) { const a = (i / N * 2 - 1) * 1.8; lune[i ? 'lineTo' : 'moveTo'](R * Math.cos(a), R * Math.sin(a)); }
  for (let i = N; i >= 0; i--) { const t = i / N * 2 - 1, a = t * 1.8, r = R - 0.6 * (1 - t * t) ** 0.8; lune.lineTo(r * Math.cos(a), r * Math.sin(a)); }
  const moon = mesh(new THREE.ExtrudeGeometry(lune, { depth: 0.26, bevelEnabled: true, bevelThickness: 0.07, bevelSize: 0.07, bevelSegments: 2 }).translate(0, 0, -0.13), BRIGHT);
  moon.position.set(5.0, 35.3, HZ + k(0.4));
  moon.rotation.set(0, -0.2, 4.15);
  g.add(moon);
  // The third eye: a tall white flame on the brow, round below and pointed above.
  const flame = new THREE.Shape();
  for (let i = 0; i <= 24; i++) { const a = Math.PI + (i / 24) * Math.PI; flame[i ? 'lineTo' : 'moveTo'](0.5 * Math.cos(a), 0.5 * Math.sin(a)); }
  flame.quadraticCurveTo(0.42, 1.0, 0, 2.3); flame.quadraticCurveTo(-0.42, 1.0, -0.5, 0);
  const eye = mesh(new THREE.ExtrudeGeometry(flame, { depth: 0.2, bevelEnabled: true, bevelThickness: 0.06, bevelSize: 0.06, bevelSegments: 2 }), BRIGHT);
  // Set on the brow by stepping in along z until the skin is met, and leant back with it.
  const ey = P(0, 3.6, 0)[1], skin = (y) => { let z = 11; while (f(0, y, z) > 0 && z > 3) z -= 0.02; return z; };
  const z0 = skin(ey), z1 = skin(ey + 2.2);
  eye.position.set(0, ey, z0 - 0.12);
  eye.rotation.x = -Math.atan2(z0 - z1, 2.2);
  g.add(eye);
  // A copper ring hanging from each ear lobe.
  for (const s of [-1, 1]) g.add(mesh(new THREE.TorusGeometry(0.8, 0.17, 10, 28), COPPER, s * (k(10.3) + 0.1), HY - k(5.4) * 1.08, HZ + k(1.2)));
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
  // From the forecourt, a little to his right, looking up at the face.
  return { group: g, focus: f, view: [-0.28, 0.04, 1], zoom: 0.9 };
}

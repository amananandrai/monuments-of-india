import * as THREE from 'three';
import { mat, mesh, box, cyl, at, inst } from '../helpers.js';
import { mergeByMaterial } from '../parts/components.js';
import { ellipsoid as E, cone, chain, blend, carve, mirrorX, flatBase, bounded, sculpt, statueMaterial, snap, onSkin, smin } from '../sdf.js';
import { detail } from '../detail.js';
import { addDetails } from '../details/adiyogi.js';

// Adiyogi at the Isha Yoga Centre near Coimbatore (2017), from photographs: a bust of Shiva as the
// first yogi, 112 ft (34.24 m) high, of black steel, at the foot of the Velliangiri hills. The bust
// is cut off across the chest and the upper arms. The face is calm and smooth, the eyes half
// closed under heavy lids, a third eye upright in the middle of the brow, the lips full; the hair
// is a mass of matted locks gathered into a high knot, with the crescent moon in it on his left,
// and long locks falling over the shoulders. A cobra coils round his neck and raises its hood on
// his chest, and strings of rudraksha beads hang over it. In front of the bust a tall trident is
// planted. The bust faces +z; it stands on a low platform BASE high.
export const STEEL = mat('#1f1f22', 0.36, 0.55), BASE = 1.6, H = 34.24;
// The head's layout, after the face of the seated Shiva (js/parts/figures.js), in units P maps to
// metres: S metres a unit, the middle of the skull at y = HY.
const S = 0.62, HY = 24.3, HZ = 1.0;
const P = (x, y, z) => [x * S, HY + y * S * 1.08, HZ + z * S], k = (v) => v * S;

// The long locks over each shoulder: from behind the ear, over the shoulder and down the chest.
const LOCKS = [[-1.0, 0.85, 1], [0.2, 0.95, 1], [1.4, 0.85, 0.75], [2.6, 0.8, 0.5]];
function locks(sx) {
  return LOCKS.map(([o, r, len]) => chain([
    [sx * (5.4 + o * 0.4), 21.6, -3.6 - o * 0.3, r * 0.8],
    [sx * (7.6 + o * 0.3), 17.0, -2.6 - o * 0.5, r],
    [sx * (8.8 + o * 0.2), 13.6, -0.2 - o * 0.8, r],
    [sx * (8.9 + o * 0.1), 13.6 - 6.2 * len, 2.6 - o * 1.1, r * 0.85],
    [sx * (8.5 + o * 0.1), 13.6 - 9.6 * len, 3.2 - o * 1.2, r * 0.6],
  ], 0.3));
}

function adiyogiField() {
  // The torso, cut flat at y = 0: chest, belly, shoulders, trapezius, the upper arms and the neck.
  const torso = blend([
    [E([0, 7.2, 0], [8.8, 8.6, 5.4]), 0],
    [E([0, 1.4, 0.4], [8.0, 5.0, 5.0]), 2.0],
    [mirrorX(E([8.4, 12.4, -0.5], [3.9, 3.3, 4.1])), 2.2],
    [E([0, 14.6, -1.2], [6.6, 2.6, 4.0]), 2.0],
    [mirrorX(cone([9.8, 11.6, -0.4], [10.8, 0.4, 0.3], 3.1, 2.8)), 1.6],
    [mirrorX(E([3.9, 10.0, 3.6], [4.1, 2.6, 2.4])), 1.4],
    [cone([0, 13.4, -0.6], [0, 20.4, 0.6], 3.4, 3.1), 1.6],
  ]);
  // The line between the breasts and the slight hollow at the throat.
  let body = carve(torso, E([0, 9.6, 5.6], [0.45, 2.4, 0.7]), 0.6);
  body = carve(body, E([0, 14.6, 3.8], [1.0, 0.6, 0.8]), 0.5);
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
  // The third eye, upright in the middle of the brow: an almond rim with a closed slit.
  head = blend([[head, 0], [E(P(0, 5.0, 9.0), [k(0.85), k(2.0), k(0.55)]), k(0.4)]]);
  head = carve(head, E(P(0, 5.0, 9.55), [k(0.18), k(1.5), k(0.35)]), k(0.1));
  // The hair: a cap of locks over the skull, from a hairline high on the brow, and the knot,
  // three rings of piled locks rising to the top; and the locks down the back.
  const hair = blend([
    [E(P(0, 4.8, -2.4), [k(10.6), k(9.6), k(11.0)]), 0],
    [E(P(0, 10.4, -2.6), [k(6.2), k(2.8), k(5.8)]), k(1.4)],
    [E(P(0, 12.8, -2.9), [k(4.4), k(2.1), k(4.2)]), k(1.0)],
    [E(P(0, -1.0, -6.5), [k(11.0), k(12.0), k(6.0)]), k(2.0)],
    [E([0, 14.5, -4.8], [7.0, 6.0, 2.4]), 2.0],
  ]);
  // Grooves between the coils of the knot and the locks of the cap.
  let hairC = hair;
  for (const [y, r] of [[9.2, 6.4], [11.6, 5.2], [13.6, 3.6]]) hairC = carve(hairC, (x, yy, z) => Math.hypot(Math.hypot(x, (z - P(0, 0, -2.6)[2]) * 1.05) - k(r), yy - P(0, y, 0)[1]) - k(0.35), k(0.3));
  const headB = bounded(blend([[head, 0], [hairC, k(0.6)]]), [0, 25.5, -0.5], 13.5, 1.5);
  const lockL = locks(-1), lockR = locks(1);
  const locksF = blend([...lockL, ...lockR].map((f) => [f, 0.2]));
  const all = (x, y, z) => smin(smin(body(x, y, z), headB(x, y, z), 1.2), locksF(x, y, z), 0.35);
  return { f: flatBase(all, 0, 0.3), lo: [-15, -0.2, -10.5], hi: [15, H + 0.6, 11.5], head };
}

let fieldP = null;
const parts = () => (fieldP ||= adiyogiField());

// The bust, meshed once: the body on a coarse grid, the face on a fine one.
function bustMesh() {
  const low = detail.low;
  return mesh(sculpt(low ? 'adiyogi-coarse' : 'adiyogi', adiyogiField, {
    h: low ? 0.34 : 0.17, reach: 1.4, deep: [0.4, 0.4, 0.42], wear: 0.25,
    split: [{ region: E(P(0, -1.2, 7.4), [k(10.2), k(10.4), k(6.2)]), h: low ? 0.13 : 0.07, lo: [-6.9, 16.6, 1.6], hi: [6.9, 32.4, 9.6] }],
  }), statueMaterial(STEEL));
}

// What is laid on the skin: the cobra, the rudraksha, the crescent and the earrings.
function ornaments() {
  const f = parts().f, g = new THREE.Group(), V = (p) => new THREE.Vector3(...p);
  // The cobra: a coil round the foot of the neck, its body crossing down the chest from his left
  // shoulder, the head reared on his right breast with its hood spread.
  const coil = [];
  for (let i = 0; i <= 30; i++) {
    const a = (i / 30) * Math.PI * 2 * 1.1 - Math.PI * 0.2;
    coil.push(snap(f, [Math.sin(a) * 4.5, 15.2 - 0.3 * Math.sin(a), Math.cos(a) * 4.5 - 0.6], 0.45));
  }
  const fall = onSkin(f, [[3.2, 14.2, 3.6], [1.8, 12.6, 5.0], [-0.6, 11.4, 5.4], [-2.6, 11.0, 5.2], [-3.6, 11.8, 5.0]], 0.45);
  const curve = new THREE.CatmullRomCurve3([...coil, ...fall].map(V));
  g.add(mesh(new THREE.TubeGeometry(curve, detail.low ? 120 : 260, 0.48, detail.low ? 8 : 12, false), STEEL));
  const neck = V(snap(f, [-3.9, 13.0, 5.2], 0.9)), hood = mesh(new THREE.SphereGeometry(1, 20, 14), STEEL);
  hood.scale.set(1.5, 1.9, 0.42);
  hood.position.copy(neck).add(new THREE.Vector3(0, 1.4, 0.35));
  hood.rotation.x = -0.18;
  g.add(mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([V(fall[fall.length - 1]), neck, neck.clone().add(new THREE.Vector3(0, 1.2, 0.5))]), 20, 0.5, 10), STEEL), hood);
  const snout = mesh(new THREE.SphereGeometry(0.55, 14, 10), STEEL);
  snout.scale.set(0.9, 0.7, 1.3);
  snout.position.copy(hood.position).add(new THREE.Vector3(0, 0.9, 0.55));
  g.add(snout);
  // Rudraksha: three strings over the chest, each bead a little apart from the next.
  const beads = [];
  for (const [w, drop, y0, r] of [[4.4, 2.6, 14.6, 0.3], [5.4, 4.8, 14.8, 0.34], [6.2, 7.2, 15.0, 0.36]]) {
    const pts = [];
    for (let i = 0; i <= 24; i++) { const a = (i / 24) * Math.PI; pts.push([Math.cos(a) * w, y0 - drop * Math.sin(a) ** 1.4, 6]); }
    const c = new THREE.CatmullRomCurve3(onSkin(f, pts.map(([x, y]) => [x, y, 8]), r * 0.85).map(V)), n = Math.round(c.getLength() / (r * 2.15));
    for (let i = 0; i <= n; i++) { const q = c.getPointAt(i / n); beads.push([q.x, q.y, q.z, r, r, r]); }
  }
  g.add(inst(new THREE.IcosahedronGeometry(1, detail.low ? 1 : 2), beads, STEEL));
  // The crescent in the knot, on his left, its horns turned up and out.
  const moon = mesh(new THREE.TorusGeometry(1.5, 0.42, 10, 28, Math.PI * 1.15), STEEL);
  moon.position.set(4.6, HY + k(10.6) * 1.08, HZ + k(0.5));
  moon.rotation.set(0.1, -0.5, -0.4 - Math.PI * 0.07);
  g.add(moon);
  // Heavy round earrings hanging from the lobes.
  for (const s of [-1, 1]) {
    const e = mesh(new THREE.TorusGeometry(0.75, 0.24, 10, 24), STEEL, s * k(10.3), HY - k(4.4) * 1.08, HZ + k(0.4));
    e.rotation.y = Math.PI / 2;
    g.add(e);
  }
  return g;
}

// The trident planted before the bust: a tall black shaft, the three prongs, a damaru tied below.
function trishul(h) {
  const g = new THREE.Group(), m = STEEL;
  g.add(cyl(0.16, 0.2, h, m, 0, 0, 0, 10), cyl(0.36, 0.36, 0.5, m, 0, h * 0.78, 0, 12));
  const y = h + 0.1;
  const prong = (s) => {
    const c = new THREE.CatmullRomCurve3([[0, y, 0], [s * 1.2, y + 0.25, 0], [s * 1.55, y + 1.3, 0], [s * 1.35, y + 2.6, 0]].map((p) => new THREE.Vector3(...p)));
    return mesh(new THREE.TubeGeometry(c, 16, 0.16, 8), m);
  };
  g.add(prong(-1), prong(1), cyl(0.0, 0.24, 3.6, m, 0, y, 0, 8), box(3.2, 0.3, 0.35, m, 0, y - 0.15, 0));
  for (const s of [-1, 1]) g.add(mesh(new THREE.ConeGeometry(0.2, 0.7, 8), m, s * 1.35, y + 2.9, 0));
  const dam = new THREE.Group();
  for (const s of [-1, 1]) { const c = mesh(new THREE.ConeGeometry(0.42, 0.55, 14), m, 0, s * 0.28, 0); if (s > 0) c.rotation.x = Math.PI; dam.add(c); }
  g.add(at(dam, 0.45, h * 0.7, 0));
  return mergeByMaterial(g);
}

export function buildAdiyogi() {
  const g = new THREE.Group(), f = new THREE.Group(), bust = new THREE.Group();
  g.add(f);
  bust.add(bustMesh(), ornaments());
  f.add(at(bust, 0, BASE, 0));
  // The platform: a broad low plinth of dark stone in two steps.
  f.add(box(32, BASE * 0.5, 22, mat('#3a3836', 0.8), 0, 0, 0.6), box(30, BASE * 0.5, 20, mat('#4a4744', 0.75), 0, BASE * 0.5, 0.6));
  // The trishul in front, to his right.
  f.add(at(trishul(17), 13, 0, 21));
  addDetails(f, g, { BASE });
  // Square on to the face, a little from his right, looking up.
  return { group: g, focus: f, view: [-0.35, 0.12, 1], zoom: 0.95 };
}

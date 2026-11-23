import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { M, mat, mesh, at, onFace, FACES, box, cyl } from '../helpers.js';
import { templeNiche, idol, mouldings, mergeByMaterial } from '../parts/components.js';
import { kuduGeo, instances } from '../parts/sculpture.js';
import { dravidaVimana, dravidaDress } from '../parts/temples.js';
import { nandi, lion } from '../parts/animals.js';
import { trees, shrubs, asiBoard, lampPosts, along, scatter, townHouses } from '../parts/realism.js';
import { enclosure } from '../monuments/gangaikonda-cholapuram.js';
import { detail } from '../detail.js';

// Gangaikonda Cholapuram's granite, a pale honey grey, darker in its mouldings; the paler face of
// its sculpture, and the lime plaster of the brick upper works.
export const GRANITE = mat('#b4a084', 0.9);
export const SHADE = mat('#88765e', 0.92);
export const PLASTER = mat('#cdb9a0', 0.9);
const IMAGE = mat('#cbb898', 0.85);

// VW: the sanctum's base, square, at z = vz; H1, H2: its two storeys of walls (2.8 m of moulded base
// and 10.7 m of wall: 13.5 m in all). The vestibule aw × al at az; the great hall mw × ml, MH high,
// at mz. The court runs x = ±ex, from z = ez0 to ez1 (its gate); the Nandi at nz. North is +x.
export const DIMS = { VW: 30.5, H1: 7.6, H2: 5.9, vz: -15, aw: 18, al: 19.8, az: 10.15, mw: 26, ml: 53.3, mz: 46.7, MH: 7, ex: 49, ez0: -58, ez1: 112, nz: 90 };

// The vimana's seven upper storeys as { y, h, w }: each a little lower than the one beneath, their
// widths drawn in on a curve.
export function tiers() {
  const { VW, H1, H2 } = DIMS, n = 7, w0 = VW - 1.6 - 2.6, w1 = 8.6;
  let y = H1 + H2 + 0.4;
  return Array.from({ length: n }, (_, i) => { const t = i / (n - 1), o = { y, h: 5.5 * 0.93 ** i, w: w1 + (w0 - w1) * Math.pow(1 - t, 1.45) }; y += o.h; return o; });
}

/* ---------- the images in the niches ---------- */

// A carver: limbs (tapering rods), rounded masses and blocks added to one group, in units of which
// a standing figure is 10.5 from its feet to the tip of its crown.
const UP = new THREE.Vector3(0, 1, 0);
function carver(m) {
  const g = new THREE.Group(), n = detail.low ? 5 : 7, v = (p) => new THREE.Vector3(p[0], p[1], p[2] || 0);
  const limb = (a, b, r0, r1 = r0) => { const A = v(a), B = v(b), o = mesh(new THREE.CylinderGeometry(r1, r0, A.distanceTo(B), n), m); o.position.copy(A).lerp(B, 0.5); o.quaternion.setFromUnitVectors(UP, B.sub(A).normalize()); g.add(o); };
  const ball = (p, r, s = [1, 1, 1]) => { const o = mesh(new THREE.SphereGeometry(r, n + 1, n - 2), m, p[0], p[1], p[2] || 0); o.scale.set(...s); g.add(o); };
  const slab = (w, h, d, p) => g.add(box(w, h, d, m, p[0], p[1], p[2] || 0));
  return { g, limb, ball, slab };
}
// Elbow and hand from the shoulder, and knee and foot from the hip, written for the left side (+x)
// and mirrored for the right.
const ARM = {
  down: [[0.35, -1.6, 0.2], [0.45, -3.0, 0.5]], hip: [[0.9, -1.4, 0.1], [0.2, -2.3, 0.4]], up: [[1.0, -0.7, 0.2], [1.25, 0.9, 0.3]],
  bless: [[0.5, -1.4, 0.6], [0.6, 0, 1.0]], fling: [[1.5, 0.2, 0.2], [2.8, -0.3, 0.3]], across: [[0.3, -1.3, 0.7], [-1.7, -1.0, 0.9]],
  lap: [[0.7, -1.5, 0.4], [0.1, -2.5, 1.0]], give: [[0.5, -1.5, 0.8], [0.4, -2.9, 1.6]], pray: [[0.6, -1.4, 0.5], [-0.9, -1.0, 0.9]],
};
const LEG = {
  stand: [[0.05, -2.3, 0.1], [0.1, -4.6, 0.2]], bent: [[0.5, -2.2, 0.5], [0.2, -4.3, 0.2]], lift: [[1.3, -0.9, 0.8], [-0.9, -1.9, 1.2]],
  kick: [[1.2, -0.5, 0.6], [2.6, -0.6, 0.6]], hang: [[0.2, -0.2, 1.5], [0.2, -2.9, 1.6]], fold: [[1.5, -0.1, 0.8], [-0.3, -0.3, 1.4]],
  kneel: [[0.2, -0.4, 1.3], [0.2, -1.0, -0.3]],
};
// A figure with its hips at (x, y, z), s times life size: legs and arms by name (right, left, then
// the rear right and left arms of a god), leaning its chest `lean` to one side. crown: 'jata' (the
// tall piled locks of Shiva), 'kirita' (Vishnu's cylinder), 'bun', 'flame' (Bhairava's hair).
function person(c, { x = 0, y = 4.6, z = 0, s = 1, lean = 0, arms = ['down', 'down'], legs = ['stand', 'stand'], crown = 'jata', heads = 1, elephant = false } = {}) {
  const p = (dx, dy, dz = 0) => [x + dx * s, y + dy * s, z + dz * s];
  c.ball(p(0, 0), s, [1.15, 0.62, 0.85]);
  c.limb(p(0, 0), p(lean, 2.3), (elephant ? 1.5 : 0.9) * s, 0.75 * s);
  c.ball(p(lean, 2.1, 0.1), 0.95 * s, [1.25, 0.85, 0.8]);
  legs.forEach((k, i) => {
    const sd = i ? 1 : -1, [kn, ft] = LEG[k], K = p(sd * (0.5 + kn[0]), kn[1], kn[2]);
    c.limb(p(sd * 0.5, -0.1), K, 0.55 * s, 0.42 * s);
    c.limb(K, p(sd * (0.5 + ft[0]), ft[1], ft[2]), 0.4 * s, 0.28 * s);
  });
  arms.forEach((k, i) => {
    const sd = i % 2 ? 1 : -1, bk = i > 1 ? -0.3 : 0, [el, ha] = ARM[k], E = p(lean + sd * (1.15 + el[0]), 2.6 + el[1], el[2] + bk), H = p(lean + sd * (1.15 + ha[0]), 2.6 + ha[1], ha[2] + bk);
    c.limb(p(lean + sd * 1.15, 2.6, bk), E, 0.3 * s, 0.26 * s);
    c.limb(E, H, 0.25 * s, 0.2 * s);
    if (k === 'up' || k === 'fling') c.ball(H, 0.3 * s);
  });
  if (elephant) {
    c.ball(p(lean, 3.8, 0.2), 0.95 * s);
    for (const sd of [-1, 1]) c.ball(p(lean + sd * 1.15, 3.9, 0), 0.85 * s, [0.75, 1, 0.2]);
    c.limb(p(lean, 3.5, 0.9), p(lean - 0.5, 2.1, 1.3), 0.34 * s, 0.24 * s);
    c.limb(p(lean - 0.5, 2.1, 1.3), p(lean - 1.2, 2.3, 1.2), 0.24 * s, 0.14 * s);
  } else {
    c.ball(p(lean, 3.85, 0.1), 0.72 * s, [1, 1.12, 1]);
    if (heads > 1) for (const sd of [-1, 1]) c.ball(p(lean + sd * 0.85, 3.8, -0.15), 0.62 * s, [0.8, 1.1, 1]);
  }
  if (crown === 'jata') c.limb(p(lean, 4.35), p(lean, 5.9), 0.68 * s, 0.3 * s);
  else if (crown === 'kirita') { c.limb(p(lean, 4.35), p(lean, 5.6), 0.62 * s, 0.5 * s); c.ball(p(lean, 5.7), 0.3 * s); }
  else if (crown === 'flame') c.ball(p(lean, 4.2, -0.25), 1.3 * s, [1.2, 1.1, 0.35]);
  else c.ball(p(lean, 4.7), 0.55 * s);
}
const GOD = ['bless', 'hip', 'up', 'up'];
// The images of the walls, each a composition a visitor can tell from the next.
const DEITY = {
  // Nataraja: the right leg bent on the dwarf of ignorance, the left lifted across; drum and fire
  // in the hands flung out, one hand blessing, one pointing to the lifted foot.
  nataraja: (c) => { c.ball([-0.4, 0.35, 0.3], 0.7, [1.7, 0.5, 0.9]); person(c, { y: 5.0, lean: 0.3, legs: ['bent', 'lift'], arms: ['bless', 'across', 'fling', 'fling'] }); for (const sd of [-1, 1]) c.limb([sd * 1.0, 8.7, -0.3], [sd * 2.6, 9.3, -0.3], 0.3, 0.08); },
  // The dancing Ganesha: pot-bellied, elephant-headed, both knees bent.
  ganesha: (c) => { c.slab(3, 0.4, 2, [0, 0, 0.3]); person(c, { y: 4.6, s: 0.95, legs: ['bent', 'bent'], arms: ['hip', 'bless', 'up', 'up'], crown: 'bun', elephant: true }); },
  // Ardhanarishvara, half Shiva and half Parvati: hip thrown out, an arm resting on the bull behind.
  ardhanari: (c) => {
    person(c, { lean: 0.45, arms: ['fling', 'hip', 'up'] });
    c.ball([-1.6, 3.4, -0.5], 1.5, [1.7, 0.85, 0.6]); c.ball([-3.0, 4.4, 0.2], 0.75, [1, 0.9, 1.2]);
    for (const x of [-2.6, -0.6]) c.limb([x, 0, -0.5], [x, 2.6, -0.5], 0.3, 0.38);
  },
  // Harihara, half Shiva and half Vishnu, standing straight with a mace on Vishnu's side.
  harihara: (c) => { person(c, { arms: GOD, crown: 'kirita' }); c.limb([2.0, 0, 0.3], [1.9, 3.6, 0.3], 0.34, 0.14); },
  // Dakshinamurti, the teacher: seated on a rock under the banyan, one foot down on a dwarf, sages
  // at his feet.
  dakshinamurti: (c) => {
    c.slab(4.2, 3, 2.2, [0, 0, 0]); c.ball([0.75, 0.3, 1.7], 0.6, [1.5, 0.5, 0.8]);
    person(c, { y: 3.6, arms: ['bless', 'lap', 'up', 'up'], legs: ['fold', 'hang'] });
    for (const sd of [-1, 1]) person(c, { x: sd * 2.9, y: 0.9, z: 0.6, s: 0.42, arms: ['pray', 'pray'], legs: ['kneel', 'kneel'], crown: 'bun' });
    c.ball([0, 10.2, -0.4], 1.6, [1.9, 0.7, 0.5]);
  },
  // Gangadhara: Shiva catching the Ganga in his hair, soothing Parvati beside him.
  gangadhara: (c) => { person(c, { x: -0.9, lean: 0.35, arms: ['hip', 'fling', 'up', 'up'] }); person(c, { x: 2.3, y: 3.9, s: 0.85, lean: -0.35, arms: ['down', 'hip'], crown: 'kirita' }); },
  // Lingodbhava: Shiva appearing in the pillar of fire; Brahma as a goose above, Vishnu as a boar below.
  lingodbhava: (c) => {
    c.limb([0, 0, 0], [0, 9.6, 0], 1.9, 1.9); c.ball([0, 9.6, 0], 1.9, [1, 0.55, 1]);
    person(c, { y: 3.7, z: 1.5, s: 0.62, arms: GOD, legs: [] });
    c.ball([-1.9, 0.7, 0.8], 0.7, [1.3, 0.9, 0.9]); c.ball([1.8, 9.6, 0.6], 0.5, [1.4, 0.8, 0.8]);
  },
  // Vishnu, tall-crowned, between Sridevi and Bhudevi.
  vishnu: (c) => { person(c, { arms: GOD, crown: 'kirita' }); for (const sd of [-1, 1]) person(c, { x: sd * 2.7, y: 2.9, s: 0.62, lean: -sd * 0.25, arms: ['down', 'hip'], crown: 'kirita' }); },
  // Subrahmanya with his spear.
  subrahmanya: (c) => { person(c, { arms: GOD, crown: 'kirita' }); c.limb([-2.4, 0, 0.2], [-2.4, 9.4, 0.2], 0.12, 0.12); c.ball([-2.4, 9.6, 0.2], 0.4, [0.7, 1.6, 0.4]); },
  // Shiva seated with Uma, handing the discus to Vishnu who stands praying (Vishnu-anugraha).
  couple: (c) => {
    c.slab(6.4, 2.8, 2.2, [0, 0, 0]);
    person(c, { x: -1.2, y: 3.4, s: 0.9, arms: ['give', 'lap', 'up', 'up'], legs: ['hang', 'fold'] });
    person(c, { x: 1.7, y: 3.3, s: 0.72, arms: ['lap', 'lap'], legs: ['fold', 'hang'], crown: 'kirita' });
    person(c, { x: -3.1, y: 2.0, z: 1.2, s: 0.42, arms: ['pray', 'pray'], crown: 'kirita' });
  },
  // Kalantaka: Shiva kicking down Death to save Markandeya.
  kalantaka: (c) => { person(c, { x: -0.6, lean: -0.3, legs: ['stand', 'kick'], arms: ['up', 'across', 'up', 'up'] }); c.ball([2.4, 1.0, 0.6], 1.0, [1.5, 0.8, 0.9]); c.ball([3.7, 1.6, 0.6], 0.55); },
  // Durga, eight-armed, standing on the buffalo's head.
  durga: (c) => {
    c.slab(2.2, 1.1, 1.8, [0, 0, 0.3]);
    for (const sd of [-1, 1]) c.limb([sd * 1.0, 0.8, 0.5], [sd * 2.0, 1.7, 0.5], 0.28, 0.08);
    person(c, { y: 5.6, s: 0.95, arms: [...GOD, 'fling', 'fling', 'down', 'down'], crown: 'kirita' });
  },
  // Brahma, three faces showing, between Savitri and Sarasvati.
  brahma: (c) => { person(c, { arms: GOD, heads: 3 }); for (const sd of [-1, 1]) person(c, { x: sd * 2.8, y: 2.9, s: 0.62, lean: -sd * 0.25, arms: ['hip', 'down'], crown: 'bun' }); },
  // Bhairava, naked under a halo of flaming hair, eight-armed, his dog behind him.
  bhairava: (c) => {
    person(c, { arms: [...GOD, 'fling', 'fling'], crown: 'flame' });
    c.ball([1.9, 2.0, -0.4], 0.9, [1.6, 0.8, 0.6]); c.ball([3.1, 2.7, 0], 0.5, [1.3, 0.9, 0.8]);
    for (const x of [1.0, 2.7]) c.limb([x, 0, -0.4], [x, 1.7, -0.4], 0.18, 0.24);
  },
  // Kamantaka: Shiva seated in meditation, Kama fallen before him and Rati pleading.
  yogi: (c) => {
    c.slab(4.4, 2.6, 2.2, [-0.6, 0, 0]);
    person(c, { x: -0.6, y: 3.2, arms: ['bless', 'lap', 'up', 'up'], legs: ['fold', 'hang'] });
    person(c, { x: 2.9, y: 2.1, z: 0.8, s: 0.45, arms: ['pray', 'pray'], crown: 'bun' });
    c.ball([2.9, 0.3, 1.6], 0.5, [2, 0.6, 0.8]);
  },
  // Chandesanugrahamurti: Shiva, seated with Parvati beside him, winds a garland of flowers round
  // the head of Chandesha, who sits below with folded hands (the king himself, some say).
  chandesa: (c) => {
    c.slab(7, 3.2, 2.4, [0.8, 0, 0]);
    person(c, { x: -0.3, y: 3.9, arms: ['give', 'give', 'up', 'up'], legs: ['fold', 'hang'] });
    person(c, { x: 3.0, y: 3.8, s: 0.75, lean: -0.2, arms: ['lap', 'hip'], legs: ['hang', 'fold'], crown: 'kirita' });
    person(c, { x: -2.6, y: 1.0, z: 2.0, s: 0.6, arms: ['pray', 'pray'], legs: ['kneel', 'kneel'], crown: 'bun' });
    const garland = mesh(new THREE.TorusGeometry(0.95, 0.2, 5, 10), IMAGE, -2.6, 3.9, 2.1);
    garland.rotation.x = Math.PI / 2.4;
    c.g.add(garland);
  },
  // Sarasvati (Jnana Sarasvati), cross-legged on a double lotus under an arch.
  saraswati: (c) => {
    c.limb([0, 0, 0.6], [0, 1.1, 0.6], 2.3, 3.0); c.limb([0, 1.1, 0.6], [0, 2.2, 0.6], 3.0, 2.5);
    person(c, { y: 2.9, arms: ['lap', 'bless', 'up', 'up'], legs: ['fold', 'fold'] });
    const arch = mesh(new THREE.TorusGeometry(2.6, 0.35, 5, 12, Math.PI), IMAGE, 0, 6.2, -0.3);
    c.g.add(arch); c.slab(0.6, 3.4, 0.5, [-2.6, 2.8, -0.3]); c.slab(0.6, 3.4, 0.5, [2.6, 2.8, -0.3]);
  },
  // Gajalakshmi: Lakshmi on her lotus, a lotus in each hand, two elephants pouring water over her.
  gajalakshmi: (c) => {
    c.limb([0, 0, 0.6], [0, 1.2, 0.6], 2.2, 2.9);
    person(c, { y: 1.9, arms: ['up', 'up'], legs: ['fold', 'fold'], crown: 'kirita' });
    for (const sd of [-1, 1]) { c.ball([sd * 3.0, 7.6, 0], 1.0, [1.3, 0.9, 0.6]); c.ball([sd * 1.9, 8.3, 0.2], 0.6); c.limb([sd * 1.5, 8.4, 0.3], [sd * 0.6, 7.9, 0.3], 0.22, 0.12); }
  },
  // Bhikshatana, the naked wanderer: a deer leaping at his hand, a dwarf carrying his bowl.
  bhikshatana: (c) => {
    person(c, { lean: 0.25, legs: ['stand', 'bent'], arms: ['give', 'hip', 'up', 'up'] });
    c.ball([-2.3, 2.6, 0.9], 0.6, [1.5, 0.8, 0.7]); c.ball([-1.7, 3.5, 1.0], 0.3);
    for (const x of [-2.8, -1.9]) c.limb([x, 0.9, 0.9], [x, 2.3, 0.9], 0.1, 0.14);
    person(c, { x: 2.5, y: 1.9, s: 0.42, arms: ['up', 'down'], crown: 'bun' });
  },
  // The gods and goddesses of the upper storey.
  deva: (c) => person(c, { arms: GOD }),
  devi: (c) => person(c, { lean: 0.35, arms: ['hip', 'up'], crown: 'kirita' }),
};
// How wide each composition is, in its own units (5 unless it is listed).
const WIDE = { nataraja: 8, ardhanari: 6.6, dakshinamurti: 7, gangadhara: 6.4, vishnu: 7, couple: 7.6, kalantaka: 8, brahma: 7.2, bhairava: 7.6, yogi: 7, chandesa: 8.6, saraswati: 6.4, gajalakshmi: 8.2, bhikshatana: 7, durga: 7.4 };
// An image to stand in a niche w × h, facing +z.
function deity(kind, w, h) {
  const c = carver(IMAGE), o = new THREE.Group();
  DEITY[kind](c);
  const body = mergeByMaterial(c.g);
  body.scale.setScalar(Math.min(h / 11.2, w / (WIDE[kind] || 5)));
  body.position.z = body.scale.x * 0.8;
  o.add(body);
  return o;
}

// A lion's forequarters, 1 across and 1 high, looking out of the wall (+z): the row of lions
// (vyala-vari) that runs round the base under the walls.
let bust = null;
function lionBustGeo() {
  if (bust) return bust;
  bust = mergeGeometries([[0.7, 0.55, 0.4, 0, 0.3, 0.2], [0.85, 0.75, 0.25, 0, 0.62, 0.2], [0.55, 0.5, 0.5, 0, 0.72, 0.5], [0.2, 0.2, 0.5, -0.25, 0.1, 0.5], [0.2, 0.2, 0.5, 0.25, 0.1, 0.5]].map(([w, h, d, x, y, z]) => new THREE.BoxGeometry(w, h, d).translate(x, y, z)));
  return bust.scale(1 / 0.85, 1, 1 / 0.75);
}

// Gangaikonda Cholapuram, finer detail. From photographs:
// - the walls stand on a high base of heavy rounded mouldings, a row of lions looking out along
//   its top (no dancers or musicians here);
// - each storey of the sanctum's walls is five bays a side, an image in a niche in each: on the
//   south Ganesha dancing, Ardhanarishvara, Dakshinamurti, Harihara and Nataraja; on the west
//   Gangadhara, Lingodbhava, Vishnu with his consorts, Subrahmanya and Vishnu-anugrahamurti; on the
//   north Kalantaka, Durga, Brahma, Bhairava and Kamantaka; on the east, beside the northern steps,
//   the famous Chandesanugrahamurti, with Sarasvati facing it across the steps, and beside the
//   southern steps Bhikshatana and Gajalakshmi; some fifty reliefs in all;
// - the upper storeys of the vimana are lined with kudus, the horseshoe dormers, along their cornices.
function architecture(f) {
  const { VW, H1, vz, az, aw, al, mz, mw, ml } = DIMS, d = new THREE.Group(), kudus = [], lions = [], N = Math.PI / 2;
  const niche = (kind, w, h, a, dist, lat, y, cz, crown = true) => {
    const n = templeNiche(w, h, GRANITE, { figure: kind ? deity(kind, w, h * 0.94) : idol(h * 0.85, IMAGE), crown: false });
    // Over the niche, the arch of foliage that springs from two makaras' mouths (makara-torana).
    if (crown) n.add(at(mesh(new THREE.TorusGeometry(w * 0.42, 0.13, 4, 8, Math.PI), GRANITE), 0, h + 0.3, 0.1));
    const o = onFace(at(n, 0, y, 0), a, dist + 0.14, lat);
    o.position.z += cz;
    d.add(o);
  };
  // The base, and the lions along it: round the sanctum, the vestibule and the hall.
  const base = (w, dd, cz, skip) => {
    d.add(at(mouldings(w, dd, [[1.12, 0.75, 0.5], [1.9, 0.28, 0.3], [2.2, 0.5, 0.1, SHADE], [2.7, 0.2, 0.32]], GRANITE), 0, 0, cz));
    const pitch = detail.low ? 1.7 : 0.85;
    for (const a of FACES) {
      const side = Math.abs(Math.sin(a)) > 0.5, len = side ? dd : w, dist = (side ? w : dd) / 2 + 0.1, n = Math.floor(len / pitch);
      for (let k = 0; k < n; k++) {
        const lat = (k + 0.5 - n / 2) * pitch, x = Math.sin(a) * dist + Math.cos(a) * lat, z = cz + Math.cos(a) * dist - Math.sin(a) * lat;
        if (!skip(x, z)) lions.push([x, 2.22, z, 0.5, 0.46, 0.34, a]);
      }
    }
  };
  base(VW, VW, vz, (x, z) => z > 0 && Math.abs(x) < aw / 2 + 0.3);
  if (!detail.low) {
    base(aw, al, az, (x, z) => Math.abs(z - az) < 4.4 || Math.abs(x) < aw / 2 - 0.5);
    base(mw, ml, mz, (x, z) => (z > mz && Math.abs(x) < 4.8) || (z < mz && Math.abs(x) < aw / 2 + 0.3));
  }
  // The sanctum's lower storey, by face (east, north, west, south), from lat -11 to 11; the middle
  // bay the widest.
  const LOWER = [null, ['yogi', 'bhairava', 'brahma', 'durga', 'kalantaka'], ['couple', 'subrahmanya', 'vishnu', 'lingodbhava', 'gangadhara'], ['nataraja', 'harihara', 'dakshinamurti', 'ardhanari', 'ganesha']];
  const UPPER = ['deva', 'devi', 'deva', 'devi', 'deva'];
  FACES.forEach((a, i) => [-11, -5.5, 0, 5.5, 11].forEach((lat, k) => {
    if (!LOWER[i]) return;
    niche(LOWER[i][k], lat ? 1.7 : 2.3, 3.3, a, VW / 2, lat, 3.0, vz);
    niche(detail.low ? null : UPPER[(k + i) % 5], lat ? 1.3 : 1.7, 3.1, a, (VW - 1.6) / 2, lat * 0.95, H1 + 0.9, vz);
  }));
  // Beside the steps: on the sanctum's east wall, Chandesanugrahamurti (north) and Bhikshatana
  // (south); on the vestibule's side walls, Sarasvati (north) and Gajalakshmi (south) towards the
  // hall, a god in the bay towards the sanctum.
  niche('chandesa', 2.9, 3.5, 0, VW / 2, 12.2, 2.95, vz, false);
  niche('bhikshatana', 2.3, 3.5, 0, VW / 2, -12.2, 2.95, vz, false);
  niche('saraswati', 2.2, 3.4, N, aw / 2, -7.2, 3.0, az, false);
  niche('gajalakshmi', 2.4, 3.4, -N, aw / 2, 7.2, 3.0, az, false);
  niche('deva', 1.3, 3.2, N, aw / 2, 7.4, 3.0, az);
  niche('devi', 1.3, 3.2, -N, aw / 2, -7.4, 3.0, az);
  // Niches along the hall's long walls.
  for (const s of [-1, 1]) for (let k = -4; k <= 4; k++) niche(null, 1, 2.4, s * N, mw / 2, k * 5.6, 3.05, mz, false);
  // Kudus on the vimana's storeys.
  for (const { y, h, w } of tiers().slice(0, -1)) {
    const n = Math.floor((w * 0.6) / 1.3);
    for (const a of FACES) for (let k = 0; k < n; k++) {
      const lat = -w * 0.3 + (k + 0.5) * ((w * 0.6) / n), ca = Math.cos(a), sa = Math.sin(a), dist = (w + 0.9) / 2 + 0.05;
      kudus.push([sa * dist + ca * lat, y + h * 0.86, vz + ca * dist - sa * lat, 0.85, 0.85, 0.85, a]);
    }
  }
  d.add(instances(kuduGeo(), kudus, GRANITE), instances(lionBustGeo(), lions, GRANITE));
  f.add(mergeByMaterial(d));
}

// The smaller shrines in the court, each facing east: Chandikeshvara's close by the northern steps
// of the sanctum; the two Kailasas, north (now the goddess Periyanayaki's, its hall standing) and
// south (its hall fallen to a platform and a few pillars); Ganesha's behind the vimana to the
// south-west, and Durga's north of the great hall, near the lion well.
function shrines(g) {
  const s = new THREE.Group();
  for (const [x, z, w, n, hall] of [[21.5, -5, 5, 1], [32, -22, 8, 2, 'whole'], [-32, -22, 8, 2, 'ruin'], [-21, -44, 5, 1], [31, 38, 5.5, 1]]) {
    s.add(box(w, 5, w, GRANITE, x, 0, z), at(dravidaDress(w, w, 5, GRANITE, { eaveM: SHADE }), x, 0, z));
    s.add(at(dravidaVimana(w - 0.8, n, 1.9, GRANITE, SHADE, { taper: 0.4, capScale: 0.36, kalashScale: 0.5 }), x, 5.3, z));
    if (hall === 'whole') s.add(box(w, 4.2, 11, GRANITE, x, 0, z + w / 2 + 5.5), at(dravidaDress(w, 11, 4.2, GRANITE, { eaveM: SHADE, hara: false }), x, 0, z + w / 2 + 5.5));
    if (hall === 'ruin') {
      s.add(box(w + 1, 1.3, 12, SHADE, x, 0, z + w / 2 + 6));
      for (const [px, pz] of [[-3, 2], [3, 2], [-3, 5.5], [3, 5.5], [-3, 9]]) s.add(box(0.55, 3.2, 0.55, GRANITE, x + px, 1.3, z + w / 2 + pz));
      s.add(box(6.8, 0.5, 0.6, GRANITE, x, 4.5, z + w / 2 + 2), box(0.6, 0.5, 4.2, GRANITE, x - 3, 4.5, z + w / 2 + 3.75));
    }
  }
  g.add(mergeByMaterial(s));
}

// The temple in its court near Jayankondam: lawns inside the wall, the great Nandi on the axis, the
// lion well (Simha-kinaru) to the north-east with its lion, palms and neem round the court,
// the village beyond, lamps on the path from the gate and the ASI board.
export function addDetails(f, g) {
  architecture(f);
  enclosure(g);
  shrines(g);
  const { ex, ez0, ez1, nz } = DIMS;
  g.add(box(ex * 2 - 2, 0.1, ez1 - ez0 - 2, mat('#7d9757', 0.95), 0, -0.1, (ez0 + ez1) / 2));
  g.add(box(500, 0.2, 500, M.grass, 0, -0.25, 20));
  // Paths: the axis from the gate to the hall's steps, and the paved round the temple.
  g.add(box(7, 0.06, ez1 - 75, M.path, 0, 0, (ez1 + 75) / 2), box(42, 0.06, 106, M.path, 0, 0, 20));
  g.add(box(10, 0.06, 80, M.path, 0, 0, ez1 + 40));
  // The great Nandi, of plastered brick, on its platform facing the sanctum.
  g.add(box(9, 1.6, 12, SHADE, 0, 0, nz), box(8, 0.3, 11, GRANITE, 0, 1.6, nz));
  g.add(at(nandi(mat('#d8d0c0', 0.8), 1.35), 0, 1.9, nz).rotateY(Math.PI));
  // The lion well: a round stone kerb, the lion seated before its steps.
  g.add(cyl(3.2, 3.4, 1, SHADE, 34, 0, 72), cyl(2.6, 2.6, 0.05, M.water, 34, 0.95, 72, 24));
  g.add(at(lion(1.6, GRANITE), 34, 0, 64).rotateY(Math.PI));
  g.add(trees([...along(9, [-ex + 6, ez0 + 8], [-ex + 6, ez1 - 10]), ...along(9, [ex - 6, ez0 + 8], [ex - 6, ez1 - 10])], { kind: 'palm', seed: 4 }));
  g.add(trees([...scatter(detail.low ? 8 : 16, [-200, -60, -120, 180], { seed: 5, gap: 14 }), ...scatter(detail.low ? 8 : 16, [60, 200, -120, 180], { seed: 6, gap: 14 })], { kind: 'neem', seed: 6 }));
  g.add(trees(scatter(detail.low ? 10 : 22, [-200, 200, -200, -70], { seed: 7, gap: 12 }), { kind: 'palm', seed: 8 }));
  g.add(shrubs([...along(8, [-8, ez1 - 30], [-8, ez1 - 4]), ...along(8, [8, ez1 - 30], [8, ez1 - 4])], { size: 1 }));
  g.add(lampPosts([...along(4, [-7, ez1 + 10], [-7, ez1 + 70]), ...along(4, [7, ez1 + 10], [7, ez1 + 70])]));
  if (!detail.low) g.add(townHouses([...scatter(26, [-170, -70, 130, 230], { seed: 9, gap: 16 }), ...scatter(26, [70, 170, 130, 230], { seed: 10, gap: 16 })].map(([x, z], k) => [x, z, 7 + (k % 3), 9, 1 + (k % 2)]), { seed: 3, roof: 'pitched', roofs: ['#9a4a32', '#8a3f2c', '#a65a3c'], tanks: 0.2 }));
  g.add(asiBoard('Brihadisvara Temple, Gangaikonda Cholapuram', 11, ez1 + 16, -0.3, { line2: 'WORLD HERITAGE SITE' }));
}

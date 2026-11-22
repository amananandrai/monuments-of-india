import * as THREE from 'three';
import { M, mat, mesh, box, cyl, at, lathe, onFace, inst, unitBox, kalash, surface, FACES } from '../helpers.js';
import { mergeByMaterial, petalRing, railing, frieze } from '../parts/components.js';
import { grandStair } from '../parts/doorways.js';
import { crossLegged } from '../parts/figures.js';
import { elephant } from '../parts/animals.js';
import { sculpt, statueMaterial, blend, cone, roundBox, mirrorX } from '../sdf.js';
import { detail } from '../detail.js';
import { addDetails } from '../details/statue-of-equality.js';

// The Statue of Equality at Muchintal (2022): Ramanuja, 108 ft, seated on a lotus of 27 ft carried
// by 36 elephants, on the three-storey Bhadra Vedi of 54 ft; with the tridandam, whose tip stands
// 135 ft over the lotus, 216 ft (65.8 m) in all. The statue faces +z.
const FT = 0.3048;
export const VEDI = 54 * FT, LOTUS = 27 * FT, FIGURE = 108 * FT, STAFF = 135 * FT;
export const TIERS = [40, 33, 26];   // half-widths of the Bhadra Vedi's three storeys
export const STONE = mat('#d8c4a2', 0.85), TRIM = mat('#b89a74', 0.88), DARK = mat('#4a4541', 0.7);
const PINK = surface(mat('#e48fa3', 0.6), 'none'), PINK_DEEP = surface(mat('#c9667f', 0.65), 'none');
const GOLD = mat('#d9a93e', 0.3, 0.85);

// His hands joined before the chest (anjali), in the figure's own units: two flat palms pressed
// together and tipped a little forward, the fingers side by side, the thumbs towards the chest,
// each wrist turning out to where crossLegged()'s forearm ends. Meshed on its own, finely.
function anjaliField() {
  const tip = (y) => (y - 0.45) * 0.28, parts = [];
  const P = (x, y, z) => [x, y, z + tip(y)];
  parts.push([mirrorX(roundBox(P(0.017, 0.5, 0.2), [0.016, 0.046, 0.04], 0.012)), 0]);
  for (let i = 0; i < 4; i++) {
    const z = 0.169 + i * 0.0205, top = 0.612 - Math.abs(i - 1.3) * 0.011;
    parts.push([mirrorX(cone(P(0.016, 0.535, z), P(0.009, top, z), 0.0105, 0.008)), 0.004]);
  }
  parts.push([mirrorX(cone(P(0.02, 0.47, 0.165), P(0.011, 0.548, 0.148), 0.012, 0.009)), 0.008]);
  parts.push([mirrorX(cone([0.068, 0.428, 0.178], P(0.02, 0.462, 0.2), 0.034, 0.026)), 0.02]);
  return { f: blend(parts), lo: [-0.11, 0.38, 0.1], hi: [0.11, 0.64, 0.3] };
}

// Ramanuja, in metres, seated on y = 0: the body from crossLegged() (js/parts/figures.js), the
// head shaven, both forearms brought before the chest; its own hands taken off and the joined
// hands set there instead; the tuft (sikha) at the crown; the urdhva pundra on the brow, two
// white lines from the bridge of the nose with the red line between; and the tridandam, three
// staves bound as one with its cloth near the head, standing in the crook of the right arm.
export function ramanuja() {
  const g = new THREE.Group(), s = new THREE.Group(), k = FIGURE / 0.955;
  const fig = crossLegged('ramanuja', { male: true, head: 'bare', right: 'chest', left: 'chest' }, GOLD, detail.low ? 0.012 : 0.009, { low: 2 });
  fig.mesh.clear();
  s.add(fig.mesh, mesh(sculpt('ramanuja-anjali' + (detail.low ? '-low' : ''), anjaliField, { h: detail.low ? 0.008 : 0.0035, wear: 0.2 }), statueMaterial(GOLD)));
  const knot = mesh(new THREE.SphereGeometry(0.022, 12, 8), GOLD, 0, 0.94, -0.085);
  knot.scale.set(1, 0.8, 1.2);
  s.add(knot);
  // The urdhva pundra, laid on the forehead's slope.
  const WHITE = mat('#f4f1e8', 0.6), REDM = mat('#b3262e', 0.6), mark = new THREE.Group();
  for (const x of [-1, 1]) { const l = mesh(new THREE.CapsuleGeometry(0.0042, 0.05, 3, 8), WHITE, x * 0.014, 0, 0); l.rotation.z = -x * 0.2; mark.add(l); }
  mark.add(mesh(new THREE.CapsuleGeometry(0.0034, 0.04, 3, 8), REDM, 0, 0.004, 0.001), mesh(new THREE.SphereGeometry(0.0085, 8, 6), WHITE, 0, -0.03, 0));
  mark.position.set(0, 0.893, 0.068);
  mark.rotation.x = -0.3;
  s.add(mark);
  s.scale.setScalar(k);
  g.add(s);
  // The tridandam: its foot on the lotus by the right knee, passing before the right shoulder.
  const t = new THREE.Group(), r = 0.2;
  for (let i = 0; i < 3; i++) { const a = (i / 3) * Math.PI * 2; t.add(cyl(r, r, STAFF, GOLD, Math.sin(a) * r * 1.1, 0, Math.cos(a) * r * 1.1, 10)); }
  for (const y of [0.1, 0.3, 0.5, 0.7, 0.86, 0.985]) t.add(cyl(r * 2.5, r * 2.5, 0.5, GOLD, 0, STAFF * y, 0, 12));
  // The cloth tied below its head, hanging in a fold, and the knob over it.
  const cloth = mesh(new THREE.SphereGeometry(1, 12, 8), GOLD, -0.5, STAFF * 0.9, 0.2);
  cloth.scale.set(1.0, 2.6, 0.75);
  t.add(cloth, at(mesh(new THREE.SphereGeometry(0.42, 10, 8), GOLD), 0, STAFF - 0.25, 0));
  t.position.set(-0.215 * k, 0, 0.19 * k);
  t.rotation.set(-0.06, 0, 0.035);
  g.add(t);
  return g;
}

// The lotus seat (padma peetham), LOTUS high: a ring of 36 elephants round its drum (18 on
// phones), their heads outward, and over them the lotus, a row of petals turned down and two
// turned up, with the seat on top.
function lotus() {
  const g = new THREE.Group(), n = detail.low ? 18 : 36, R = 14.6, eh = 3.3;
  g.add(cyl(R + 2.6, R + 3.2, 0.5, TRIM, 0, 0, 0, 48), cyl(R - 1.2, R - 1.2, eh, DARK, 0, 0.5, 0, 48));
  for (let i = 0; i < n; i++) {
    const a = ((i + 0.5) / n) * Math.PI * 2, e = elephant(DARK, 0.72, { coarse: true });
    e.position.set(Math.sin(a) * R, 0.5, Math.cos(a) * R);
    e.rotation.y = a;
    g.add(e);
  }
  const y0 = 0.5 + eh;
  g.add(lathe([[R + 1.6, 0], [R + 2.0, 0.35], [R + 1.2, 0.7], [R - 0.2, 1.2], [R + 0.6, 2.2], [R + 2.6, 3.6], [R + 3.2, LOTUS - y0 - 0.5], [R + 2.4, LOTUS - y0], [0, LOTUS - y0]], PINK_DEEP, 64).translateY(y0));
  g.add(at(petalRing(R + 1.2, 27, 2.7, 3.6, 2.25, PINK_DEEP, 0.3), 0, y0 + 1.5, 0));
  g.add(at(petalRing(R + 0.2, 27, 4.4, 3.9, 0.62, PINK, 0.28), 0, y0 + 1.1, 0), at(petalRing(R - 0.2, 27, 3.9, 3.7, 0.36, PINK, 0.28), 0, y0 + 1.3, 0).rotateY(Math.PI / 27));
  return g;
}

// The Bhadra Vedi: three storeys stepping in, each a wall of bays between dark pilasters under a
// carved band and a cornice, a railing round each terrace, and a pot at each corner.
function bhadraVedi() {
  const g = new THREE.Group(), h = VEDI / 3, pil = [], bays = [];
  TIERS.forEach((W, i) => {
    const y = i * h;
    g.add(box(W * 2, h - 0.5, W * 2, STONE, 0, y, 0), box(W * 2 + 0.5, 0.7, W * 2 + 0.5, TRIM, 0, y, 0));
    g.add(box(W * 2 + 0.06, 0.9, W * 2 + 0.06, frieze(TRIM), 0, y + h - 1.75, 0), box(W * 2 + 1.2, 0.5, W * 2 + 1.2, TRIM, 0, y + h - 0.5, 0));
    const n = Math.round((W * 2) / 4);
    for (const a of FACES) {
      for (let k = 0; k <= n; k++) {
        const lat = -W + (k / n) * W * 2, c = Math.cos(a), s = Math.sin(a);
        pil.push([s * (W + 0.1) + c * lat, y + 0.7, c * (W + 0.1) - s * lat, 0.55, h - 2.45, 0.55, a]);
        if (k < n && !detail.low) bays.push([s * (W + 0.02) + c * (lat + W / n), y + 1.3, c * (W + 0.02) - s * (lat + W / n), 1.7, h - 3.6, 0.06, a]);
      }
      const gap = i === 2 ? 10 : 0, len = W - 0.6 - gap;
      for (const sd of a === 0 ? [-1, 1] : [0]) g.add(onFace(at(railing(sd ? len : W * 2 - 1, 1.1, 0.25, STONE, 2.4), 0, y + h, 0), a, W - 0.3, sd * (gap + len / 2)));
    }
    for (const [x, z] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) g.add(at(kalash(1.5, GOLD), x * (W - 1.6), y + h, z * (W - 1.6)));
  });
  g.add(inst(unitBox(), pil, DARK), inst(unitBox(), bays, M.recess));
  return g;
}

export function buildStatueOfEquality() {
  const g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  g.add(cyl(260, 260, 0.2, M.path, 0, 0, 0, 72));
  f.add(at(mergeByMaterial(bhadraVedi()), 0, 0.2, 0));
  // The grand stair of 108 steps up the front to the terrace of the lotus.
  const st = grandStair(VEDI, 20, STONE, TRIM, { n: 108, tread: 0.4, landing: 3, cheek: 1.2 });
  f.add(at(st, 0, 0.2, TIERS[2] - 0.5));
  f.add(at(lotus(), 0, 0.2 + VEDI, 0), at(ramanuja(), 0, 0.2 + VEDI + LOTUS, 0));
  addDetails(f, g);
  return { group: g, focus: f, view: [0.3, 0.06, 1], zoom: 0.62 };
}

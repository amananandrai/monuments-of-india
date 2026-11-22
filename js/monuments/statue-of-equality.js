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
// by 36 elephants, all gilded, on the three-storey Bhadra Vedi of 54 ft; with the tridandam, whose tip stands
// 135 ft over the lotus, 216 ft (65.8 m) in all. The statue faces +z.
const FT = 0.3048;
export const VEDI = 54 * FT, LOTUS = 27 * FT, FIGURE = 108 * FT, STAFF = 135 * FT;
export const TIERS = [40, 33, 26];   // half-widths of the Bhadra Vedi's three storeys
export const STONE = mat('#d8c4a2', 0.85), TRIM = mat('#b89a74', 0.88), DARK = mat('#4a4541', 0.7);
const GOLD = mat('#e3b23c', 0.3, 0.8), GOLD_PALE = mat('#f0cc6a', 0.3, 0.75), GOLD_DEEP = mat('#c9952c', 0.34, 0.8);
const FLAG = surface(mat('#e9bd45', 0.5, 0.5, { side: THREE.DoubleSide }), 'none');
// In the figure's own units (1 = FIGURE / 0.955): where the staff stands in the lap, and the water pot.
const FOOT = [0.07, 0.06, 0.2], POT = [0.19, 0.125, 0.34];

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

// Ramanuja, in metres, seated on y = 0, after photographs of the statue: the body from
// crossLegged() (js/parts/figures.js), bare of its malas, the head shaven, both forearms brought
// before the chest; its own hands taken off and the joined hands set there instead. On it: long
// earlobes with rings; the urdhva pundra raised on the brow; the sacred thread from the left
// shoulder to the right hip; two strings of beads, a short one and one hanging to the belly
// behind the hands; bead bracelets at the wrists; the tridandam, three staves bound as one,
// standing in the lap and leaning across the chest behind the hands and over the right shoulder,
// a flag flying from its head; and the small domed water pot before the left knee.
export function ramanuja() {
  const g = new THREE.Group(), s = new THREE.Group(), k = FIGURE / 0.955;
  const fig = crossLegged('ramanuja-dhoti2', { male: true, slim: true, adorn: false, dhoti: true, head: 'bare', right: 'chest', left: 'chest', face: { down: -0.7, full: 0.9, lip: 0.5, lids: 0.5 } }, GOLD, detail.low ? 0.012 : 0.009, { low: 2 });
  fig.mesh.clear();
  // Where the body's surface is, seen from the front at (x, y): the first face behind the arms.
  fig.mesh.updateMatrixWorld(true);
  const ray = new THREE.Raycaster(), front = (x, y, zMax = 0.15) => {
    ray.set(new THREE.Vector3(x, y, zMax), new THREE.Vector3(0, 0, -1));
    const hit = ray.intersectObject(fig.mesh, false)[0];
    return hit ? hit.point.z : 0.05;
  };
  const lay = (pts, r) => pts.map(([x, y]) => new THREE.Vector3(x, y, front(x, y) + r * 0.8));
  s.add(fig.mesh, mesh(sculpt('ramanuja-anjali' + (detail.low ? '-low' : ''), anjaliField, { h: detail.low ? 0.008 : 0.0035, wear: 0.2 }), statueMaterial(GOLD)));
  const trim = new THREE.Group(), bead = detail.low ? new THREE.SphereGeometry(1, 5, 3) : new THREE.SphereGeometry(1, 8, 6), beads = [];
  // The sacred thread, and the two strings of beads lying on the chest.
  const thread = [];
  for (let i = 0; i <= 16; i++) { const t = i / 16; thread.push([0.085 - 0.2 * t, 0.7 - 0.4 * t + 0.03 * Math.sin(t * Math.PI)]); }
  trim.add(mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(lay(thread, 0.003)), 40, 0.003, 6), GOLD));
  for (const [w, drop, r] of [[0.07, 0.17, 0.0042], [0.085, 0.37, 0.0046]]) {
    const pts = [];
    for (let i = 0; i <= 28; i++) { const a = (i / 28) * Math.PI; pts.push([Math.cos(a) * w * (0.72 + 0.5 * Math.sin(a)), 0.705 - drop * Math.sin(a) ** 1.3]); }
    const c = new THREE.CatmullRomCurve3(lay(pts, r)), n = Math.round(c.getLength() / (r * 1.9));
    for (let i = 0; i <= n; i++) { const q = c.getPointAt(i / n); beads.push([q.x, q.y, q.z, r]); }
  }
  // Bead bracelets, two rows round each wrist.
  for (const sd of ['l', 'r']) {
    const h = new THREE.Vector3(...fig.hands[sd]), d = new THREE.Vector3(...fig.dirs[sd]).normalize();
    const u = new THREE.Vector3(0, 1, 0).cross(d).normalize(), v = d.clone().cross(u);
    for (const back of [0.035, 0.05]) for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2, q = h.clone().addScaledVector(d, -back).addScaledVector(u, Math.cos(a) * 0.033).addScaledVector(v, Math.sin(a) * 0.033);
      beads.push([q.x, q.y, q.z, 0.0056]);
    }
  }
  trim.add(inst(bead, beads.map(([x, y, z, r]) => [x, y, z, r, r, r]), GOLD));
  // Long earlobes, each with a ring.
  for (const x of [-1, 1]) {
    const lobe = mesh(new THREE.CapsuleGeometry(0.0085, 0.03, 4, 8), GOLD, x * 0.073, 0.822, -0.012);
    lobe.scale.z = 1.5;
    trim.add(lobe, mesh(new THREE.TorusGeometry(0.012, 0.0045, 8, 16), GOLD, x * 0.074, 0.792, -0.012));
  }
  // The urdhva pundra, raised on the forehead's slope: two lines from the bridge of the nose
  // with a third between them.
  const mark = new THREE.Group();
  for (const x of [-1, 1]) { const l = mesh(new THREE.CapsuleGeometry(0.0036, 0.05, 3, 8), GOLD_PALE, x * 0.012, 0, 0); l.rotation.z = -x * 0.17; mark.add(l); }
  mark.add(mesh(new THREE.CapsuleGeometry(0.003, 0.036, 3, 8), GOLD_PALE, 0, 0.004, 0.001), mesh(new THREE.SphereGeometry(0.007, 8, 6), GOLD_PALE, 0, -0.03, 0));
  mark.position.set(0, 0.893, 0.068);
  mark.rotation.x = -0.3;
  trim.add(mark);
  // The water pot before the left knee: a ribbed dome in tiers under a knob.
  trim.add(at(lathe([[0, 0], [0.05, 0], [0.052, 0.012], [0.044, 0.02], [0.046, 0.034], [0.036, 0.044], [0.037, 0.056], [0.027, 0.066], [0.027, 0.076], [0.016, 0.086], [0.012, 0.098], [0.006, 0.104], [0.009, 0.112], [0, 0.12]], GOLD, 24), POT[0], POT[1], POT[2]));
  s.add(mergeByMaterial(trim));
  s.scale.setScalar(k);
  g.add(s);
  // The tridandam, from its foot in the lap to its head STAFF above the seat, and its flag.
  const a = new THREE.Vector3(...FOOT).multiplyScalar(k), top = STAFF, dy = top / k - FOOT[1];
  const b = new THREE.Vector3((FOOT[0] - 0.353 * dy) * k, top, (FOOT[2] - 0.19 * dy) * k), len = a.distanceTo(b);
  const t = new THREE.Group(), r = 0.17;
  for (let i = 0; i < 3; i++) { const an = (i / 3) * Math.PI * 2; t.add(cyl(r, r, len, GOLD, Math.sin(an) * r * 1.1, 0, Math.cos(an) * r * 1.1, 10)); }
  for (const y of [0.25, 0.5, 0.72, 0.9, 0.985]) t.add(cyl(r * 2.3, r * 2.3, 0.4, GOLD, 0, len * y, 0, 12));
  // The flag: a cloth flying to the statue's right from just under the staff's head.
  const fw = 6.6, fh = 4.6, cloth = new THREE.PlaneGeometry(fw, fh, 14, 6), cp = cloth.attributes.position;
  for (let i = 0; i < cp.count; i++) { const u = (cp.getX(i) + fw / 2) / fw; cp.setZ(i, Math.sin(u * 5.2) * 0.38 * u); cp.setY(i, cp.getY(i) - u * u * 0.5); }
  cloth.computeVertexNormals();
  t.add(mesh(cloth, FLAG, -fw / 2 - r * 2, len - fh / 2 - 0.5, 0).rotateY(Math.PI));
  t.position.copy(a);
  t.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize());
  g.add(mergeByMaterial(t));
  return g;
}

// The lotus seat (padma peetham), LOTUS high: a ring of 36 elephants round its drum (18 on
// phones), their heads outward, and over them the lotus, a row of petals turned down and two
// turned up, with the seat on top.
function lotus() {
  const g = new THREE.Group(), n = detail.low ? 18 : 36, R = 14.6, eh = 3.3;
  g.add(cyl(R + 2.6, R + 3.2, 0.5, GOLD_DEEP, 0, 0, 0, 48), cyl(R - 1.2, R - 1.2, eh, GOLD_DEEP, 0, 0.5, 0, 48));
  for (let i = 0; i < n; i++) {
    const a = ((i + 0.5) / n) * Math.PI * 2, e = elephant(GOLD, 0.72, { coarse: true });
    e.position.set(Math.sin(a) * R, 0.5, Math.cos(a) * R);
    e.rotation.y = a;
    g.add(e);
  }
  const y0 = 0.5 + eh;
  g.add(lathe([[R + 1.6, 0], [R + 2.0, 0.35], [R + 1.2, 0.7], [R - 0.2, 1.2], [R + 0.6, 2.2], [R + 2.6, 3.6], [R + 3.2, LOTUS - y0 - 0.5], [R + 2.4, LOTUS - y0], [0, LOTUS - y0]], GOLD_DEEP, 64).translateY(y0));
  g.add(at(petalRing(R + 1.2, 27, 2.7, 3.6, 2.25, GOLD_DEEP, 0.3), 0, y0 + 1.5, 0));
  g.add(at(petalRing(R + 0.2, 27, 4.4, 3.9, 0.62, GOLD, 0.28), 0, y0 + 1.1, 0), at(petalRing(R - 0.2, 27, 3.9, 3.7, 0.36, GOLD, 0.28), 0, y0 + 1.3, 0).rotateY(Math.PI / 27));
  // After photographs: a second, smaller row turned down under the first, and a third row of
  // upright petals close under the seat.
  g.add(at(petalRing(R + 0.6, 27, 1.9, 3.0, 2.45, GOLD, 0.3), 0, y0 + 0.75, 0).rotateY(Math.PI / 27), at(petalRing(R + 1.3, 36, 2.6, 2.9, 0.2, GOLD_PALE, 0.26), 0, y0 + 2.6, 0));
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

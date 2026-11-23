import * as THREE from 'three';
import { M, mat, mesh, at, box, cyl, flat, inst } from '../helpers.js';
import { templeNiche, idol, mergeByMaterial, frieze, windowFrame, jali } from '../parts/components.js';
import { figureFrieze, figure, kuduGeo, elephantGeo } from '../parts/sculpture.js';
import { guardian } from '../parts/figures.js';
import { heightField, fbm, smooth } from '../parts/terrain.js';
import { trees, shrubs, asiBoard, along, scatter, townHouses } from '../parts/realism.js';
import { detail } from '../detail.js';

// Aihole's sandstone, a warm brown, weathered darker and patched with lichen.
export const STONE = mat('#a88a68', 0.93);
export const SHADE = mat('#7e664c', 0.95);

// P: the plinth's height; W: the temple's width, its apse ending at z = z0 and its body at z1; the
// porch, PW wide, to pz and the block of its stairs to sz; PH: the gallery from floor to roof beams;
// hz: the front wall of the hall, set back behind the gallery; HW: the hall's width.
export const DIMS = { P: 2.4, W: 11, z0: -11, z1: 7.3, PW: 7, pz: 11.7, sz: 13.9, PH: 3.4, hz: 5.1, HW: 6.6 };

// Where the pillars stand, as [x, z, angle of the beam they carry]: round the edge of the gallery
// (eight to each side, eight round the apse, four across the front), and on the porch (two rows of
// four). `carved` marks those whose faces carry couples and guardians: the porch's, the front
// row and the first two of each side.
export function pillarSpots() {
  const { W, z0, z1, pz } = DIMS, r = W / 2 - 0.5, c = z0 + W / 2, list = [];
  for (const s of [-1, 1]) for (let k = 0; k <= 7; k++) list.push({ x: s * r, z: c + (k * (z1 - 0.5 - c)) / 7, a: Math.PI / 2, out: s * Math.PI / 2, carved: k >= 6 });
  for (let k = 1; k <= 8; k++) { const t = (k / 9) * Math.PI; list.push({ x: -Math.cos(t) * r, z: c - Math.sin(t) * r, a: Math.PI / 2 - t, out: Math.atan2(-Math.cos(t), -Math.sin(t)) }); }
  for (const x of [-3.1, -1.35, 1.35, 3.1]) {
    list.push({ x, z: z1 - 0.5, a: 0, out: 0, carved: true });
    for (const z of [z1 + 1.75, pz - 0.5]) list.push({ x, z, a: Math.abs(x) > 2 ? Math.PI / 2 : 0, out: z > pz - 1 ? 0 : Math.sign(x) * Math.PI / 2, carved: true, door: z > pz - 1 && Math.abs(x) < 2 });
  }
  return list;
}

// A beast in relief about len long, standing side-on with its head towards +x: Shiva's bull with
// its hump, the buffalo demon with swept horns, Durga's lion with its mane.
function beast(len, m, { horns = 0, hump = false, mane = false } = {}) {
  const g = new THREE.Group(), u = len / 10, ball = (r, x, y, sx = 1, sy = 1) => { const b = mesh(new THREE.SphereGeometry(r, 10, 8), m, x, y, 0); b.scale.set(sx, sy, 0.8); g.add(b); };
  ball(u * 2.2, 0, u * 4.2, 1.9, 1);
  for (const x of [-2.8, -2, 2, 2.8]) g.add(cyl(u * 0.5, u * 0.4, u * 2.8, m, x * u, 0, 0, 6));
  ball(u * 1.5, u * 4.6, u * 5.4, 1.2, 1);
  if (hump) ball(u * 1.2, u * 2.2, u * 6.2);
  if (mane) ball(u * 2.1, u * 3.8, u * 5.4, 0.8, 1.1);
  for (const s of [-1, 1]) if (horns) { const h = mesh(new THREE.ConeGeometry(u * 0.35, u * 2.4 * horns, 5), m, u * 4.4, u * 7.2, s * u * 0.9); h.rotation.z = 0.7; g.add(h); }
  return g;
}

// The images of the hall's niches, about 1.8 m high, built on the kit's standing idol: each with the
// arms, the head and the companions that tell it apart.
// - shiva: eight-armed, with his trident, leaning on the bull Nandi who stands behind him;
// - narasimha: Vishnu as the man-lion, a maned head with ears and a muzzle;
// - vishnu: seated on Garuda, who kneels with spread wings; the discus and the conch in his hands;
// - varaha: Vishnu as the boar, the snout turned up to the earth goddess Bhudevi on his raised arm;
// - durga: Mahishasuramardini, eight-armed, driving the trident into the buffalo demon under her
//   foot, her lion beside her;
// - harihara: half Shiva with the trident, half Vishnu with the discus, small attendants at the feet.
function image(kind) {
  const h = 1.8, u = h / 10, m = STONE, o = new THREE.Group(), g = new THREE.Group();
  o.add(g);
  g.add(idol(h, m));
  const arm = (s, a, len = 3) => { const p = at(new THREE.Group(), s * u * 1.3, u * 6.4, 0); p.add(cyl(u * 0.24, u * 0.3, u * len, m, 0, 0, 0, 6)); p.rotation.z = -s * a; g.add(p); return [s * u * (1.3 + Math.sin(a) * len), u * (6.4 + Math.cos(a) * len)]; };
  const arms = (list) => list.map((a) => [arm(-1, a), arm(1, a)]);
  const ball = (r, x, y, z = 0, sy = 1) => { const b = mesh(new THREE.SphereGeometry(r, 10, 8), m, x, y, z); b.scale.y = sy; g.add(b); return b; };
  const trident = (x, y, len, tilt = 0) => {
    const t = at(new THREE.Group(), x, y, u * 0.6);
    t.add(cyl(u * 0.14, u * 0.14, len, m, 0, 0, 0, 5), box(u * 1.5, u * 0.22, u * 0.22, m, 0, len - u * 1.3, 0));
    for (const k of [-1, 0, 1]) t.add(at(mesh(new THREE.ConeGeometry(u * 0.2, u * (k ? 1.1 : 1.5), 5), m), k * u * 0.65, len - u * (k ? 0.55 : 0.35), 0));
    t.rotation.z = tilt;
    g.add(t);
  };
  const discus = ([x, y]) => { const d = cyl(u * 0.75, u * 0.75, u * 0.25, m, 0, 0, 0, 12); d.rotation.x = Math.PI / 2; g.add(at(d, x, y, u * 0.5)); };
  if (kind === 'shiva') {
    arms([0.75, 1.35, 2.05]);
    trident(-u * 3.4, u * 1, u * 9);
    o.add(at(beast(u * 8.5, m, { horns: 0.6, hump: true }), u * 1.2, 0, -u * 0.5));
    g.position.x = -u * 0.8;
  } else if (kind === 'narasimha') {
    arms([0.7, 2.0]);
    ball(u * 1.3, 0, u * 7.5, -u * 0.1).scale.set(1.15, 1.05, 0.8);
    g.add(box(u * 0.9, u * 0.7, u * 0.8, m, 0, u * 7.0, u * 0.6));
    for (const s of [-1, 1]) g.add(at(mesh(new THREE.ConeGeometry(u * 0.35, u * 0.8, 5), m), s * u * 0.9, u * 8.9, 0));
  } else if (kind === 'vishnu') {
    const hands = arms([0.6, 1.9]);
    discus(hands[0][0]);
    ball(u * 0.5, hands[0][1][0], hands[0][1][1], u * 0.5, 1.4);
    g.scale.setScalar(0.66);
    g.position.y = u * 3;
    // Garuda under him: kneeling, the wings spread to either side, a beaked head.
    o.add(box(u * 2.6, u * 2.2, u * 1.6, m, 0, u * 0.9, 0), box(u * 3.4, u * 0.9, u * 2, m, 0, 0, 0), at(mesh(new THREE.SphereGeometry(u * 0.7, 10, 8), m), 0, u * 2.3, u * 1.2));
    o.add(at(mesh(new THREE.ConeGeometry(u * 0.3, u * 0.9, 5).rotateX(Math.PI / 2), m), 0, u * 2.2, u * 2));
    for (const s of [-1, 1]) { const w = box(u * 3.4, u * 2, u * 0.4, m, 0, 0, 0); w.geometry.translate(s * u * 1.7, 0, 0); w.rotation.z = s * 0.55; o.add(at(w, s * u * 1.2, u * 1.4, -u * 0.2)); }
  } else if (kind === 'varaha') {
    arm(-1, 0.6); arm(-1, 2.2); arm(1, 2.3);
    const [bx, by] = arm(1, 1.25);
    const snout = mesh(new THREE.ConeGeometry(u * 0.6, u * 1.9, 8), m, u * 0.75, u * 8.1, u * 0.3);
    snout.rotation.z = -0.95;
    g.add(snout);
    for (const s of [-1, 1]) g.add(at(mesh(new THREE.ConeGeometry(u * 0.3, u * 0.7, 5), m), s * u * 0.6 - u * 0.2, u * 8.7, -u * 0.2));
    g.add(at(idol(h * 0.3, m), bx - u * 0.3, by, u * 0.3));
    g.add(at(mesh(new THREE.TorusGeometry(u * 0.9, u * 0.3, 5, 12), m), -u * 2.4, u * 0.9, u * 0.4));
  } else if (kind === 'durga') {
    arms([0.45, 0.95, 1.5, 2.1]);
    trident(-u * 2.6, u * 9.2, u * 9.2, Math.PI - 0.62);
    g.add(box(u * 0.3, u * 3.2, u * 0.2, m, u * 3.1, u * 8.6, u * 0.3));
    o.add(at(beast(u * 6, m, { horns: 1 }), u * 1.6, 0, u * 1.3), at(beast(u * 4.6, m, { mane: true }), -u * 2.6, 0, u * 0.9));
    g.position.y = u * 0.6;
  } else if (kind === 'harihara') {
    const hands = arms([0.6, 1.8]);
    trident(-u * 3.6, u * 1.2, u * 8.6);
    discus(hands[0][1]);
    for (const s of [-1, 1]) o.add(at(idol(h * 0.36, m), s * u * 3.3, 0, u * 0.5));
  }
  return o;
}

// The Durga temple, finer detail. From photographs and the plan of its sculpture:
// - the hall's outer wall, seen through the gallery, stands on its own moulded base and steps out in
//   nine bays, each with a niche under a small pediment; going round clockwise from the door they
//   hold (empty), Shiva with Nandi, Narasimha, Vishnu on Garuda, (empty), Varaha with Bhudevi,
//   (empty), Durga slaying the buffalo demon, Harihara;
// - between the bays the wall is pierced by stone grilles of geometric openwork in moulded frames;
// - the plinth's faces carry a band of small scenes, a row of horseshoe arches (kudus) and, at the
//   top, a course of ganas; the low wall of its stairs has panels from the Ramayana;
// - the porch's square pillars, the front row and the first of each side are carved with couples
//   (mithunas), and guardians stand on the two at the head of the stairs;
// - the riser over the gallery's roof is a parapet of small niches and animals;
// - the tower's storeys are marked by ribbed corner amalakas, with horseshoe arches up its faces
//   and a large one (the sukanasa) on the east;
// - the fallen amalaka lies on the ground beside the apse.
function architecture(f) {
  const { P, W, z0, z1, PW, pz, sz, PH, hz, HW } = DIMS, d = new THREE.Group(), r = HW / 2, c = z0 + W / 2;
  // The hall's wall: its base, then the bays and their images, clockwise from the door (south is -x).
  const on = (o, x, z, a, y = P) => { o.position.set(x, y, z); o.rotation.y = a; d.add(o); };
  const side = (s, z) => [s * r, z, s * Math.PI / 2], round = (a) => [Math.sin(a) * r, c - Math.cos(a) * r, Math.PI - a];
  const bays = [[side(-1, hz - 0.95)], [side(-1, hz - 4.5), 'shiva'], [side(-1, hz - 8), 'narasimha'], [round(-0.87), 'vishnu'], [round(0)], [round(0.87), 'varaha'], [side(1, hz - 8)], [side(1, hz - 4.5), 'durga'], [side(1, hz - 0.95), 'harihara']];
  for (const [[x, z, a], kind] of bays) {
    const b = new THREE.Group();
    b.add(box(2.1, PH - 0.5, 0.22, STONE, 0, 0, 0.11), box(2.3, 0.45, 0.34, SHADE, 0, 0, 0.17), box(2.3, 0.25, 0.34, SHADE, 0, PH - 0.95, 0.17));
    b.add(at(templeNiche(1.5, 2.0, STONE, { figure: kind && !(detail.low && kind === 'vishnu') ? image(kind) : null, depth: 0.2 }), 0, 0.62, 0.22));
    on(b, x, z, a);
  }
  // The grilles between the bays: two to each side and two in the apse.
  const grille = () => windowFrame(0.95, 1.35, STONE, { shape: 'flat', screen: jali(STONE), frame: 0.16 });
  for (const [x, z, a] of [side(-1, hz - 2.7), side(-1, hz - 6.25), side(1, hz - 2.7), side(1, hz - 6.25), round(-0.44), round(0.44)]) on(grille(), x + Math.sin(a) * 0.03, z + Math.cos(a) * 0.03, a, P + 0.95);
  // The carved pillars: a couple on the outer face of each, guardians at the head of the stairs.
  for (const p of pillarSpots()) {
    if (!p.carved) continue;
    const g = new THREE.Group();
    if (p.door) g.add(guardian(1.35, STONE));
    else for (const s of [-1, 1]) g.add(at(figure(1.05, STONE, s > 0 ? 'standing' : 'dancer'), s * 0.14, 0, 0));
    on(g, p.x + Math.sin(p.out) * 0.3, p.z + Math.cos(p.out) * 0.3, p.out, P + (p.door ? 0.05 : 0.95));
  }
  // The river goddesses at the foot of the door's jambs, Ganga and Yamuna, each on her mount with
  // an attendant holding the parasol over her.
  for (const s of [-1, 1]) {
    const gy = new THREE.Group();
    gy.add(box(1.0, 0.16, 0.4, STONE, 0, 0, 0), at(figure(1.15, STONE, 'dancer'), -s * 0.2, 0.16, 0), at(figure(0.8, STONE), s * 0.25, 0.16, 0));
    gy.add(cyl(0.02, 0.02, 1.4, STONE, s * 0.05, 0.16, -0.05, 5), cyl(0.3, 0.34, 0.06, STONE, s * 0.05, 1.56, -0.05, 10));
    on(gy, s * 1.55, hz + 0.5, 0);
  }
  f.add(mergeByMaterial(d));
  // The plinth's carving: the band of small scenes on its straight runs, the row of kudus over it,
  // and the Ramayana panels on the low wall before the stairs.
  if (!detail.low) {
    const len = z1 - c - 0.4, kudus = [];
    for (const s of [-1, 1]) {
      const fr = at(figureFrieze(len, 0.5, STONE, { pitch: 0.5, kinds: ['standing', 'dancer', 'elephant'], proud: 0.07 }), s * (W / 2 + 0.01), 1.22, (c + z1) / 2);
      fr.rotation.y = s * Math.PI / 2;
      f.add(fr);
      for (let k = 0; k < 14; k++) kudus.push([s * (W / 2 + 0.2), 1.98, c + 0.4 + (k + 0.5) * (len / 14), 0.4, 0.4, 0.5, s * Math.PI / 2]);
      const pf = at(figureFrieze(pz - z1 - 0.3, 0.5, STONE, { pitch: 0.5, kinds: ['standing', 'dancer'], proud: 0.07 }), s * (PW / 2 + 0.01), 1.22, (z1 + pz) / 2);
      pf.rotation.y = s * Math.PI / 2;
      f.add(pf);
      // Elephants along the parapet over the gallery's roof.
      const y = P + PH + 0.55, ele = [];
      for (let k = 0; k < 12; k++) ele.push([s * 3.52, y, c + 0.5 + k * ((pz - 1.6 - c) / 11), 0.34, 0.34, 0.2, s * Math.PI / 2]);
      f.add(inst(elephantGeo(), ele, STONE));
    }
    f.add(inst(kuduGeo(), kudus, STONE));
    f.add(at(figureFrieze(PW + 0.6, 0.6, STONE, { pitch: 0.62, kinds: ['standing', 'dancer', 'standing'], proud: 0.08 }), 0, 0.5, sz + 0.86));
  }
}

// Aihole: the village of stone houses round the temples, the other early temples close by (the Lad
// Khan temple to the south, with its flat roof and the small shrine on it, and two small Nagara
// shrines), the ruined fort wall of the lookout, babul and neem, the low sandstone hills to the north,
// and the ASI board.
function neighbours(g) {
  const n = new THREE.Group(), S = STONE, Sd = SHADE;
  // The Lad Khan temple: a square hall on a low plinth under a two-tiered sloping roof, a small shrine
  // on its roof, and a porch of pillars on the east.
  const lk = at(new THREE.Group(), 34, 0, -14);
  lk.add(box(15, 1.2, 15, Sd), box(12.5, 4.2, 12.5, S, 0, 1.2), box(14, 0.5, 14, Sd, 0, 5.4), box(11, 0.5, 11, S, 0, 5.9), box(3.5, 2.4, 3.5, S, 0, 6.4), box(4, 0.4, 4, Sd, 0, 8.8));
  for (const x of [-4.5, -1.5, 1.5, 4.5]) lk.add(box(0.7, 4.2, 0.7, S, x, 1.2, 7.1));
  lk.add(box(13, 0.4, 3, Sd, 0, 5.4, 7.6));
  n.add(lk);
  for (const [x, z, w] of [[-28, -6, 4.4], [-36, 12, 3.6], [22, 26, 3.8]]) {
    const s = at(new THREE.Group(), x, 0, z);
    s.add(box(w + 1, 0.8, w + 1, Sd), box(w, 3.2, w, S, 0, 0.8));
    for (let i = 0; i < 6; i++) { const ww = w * (0.95 - 0.08 * i); s.add(box(ww, 0.5, ww, S, 0, 4 + i * 0.5)); }
    const am = mesh(new THREE.SphereGeometry(w * 0.32, 16, 6), flat(S), 0, 7.2, 0);
    am.scale.y = 0.4;
    s.add(am);
    n.add(s);
  }
  // The fallen amalaka, the ribbed crown of the tower, lying flat on the ground beside the apse.
  const am = at(new THREE.Group(), 9, 0, -9);
  am.add(mesh(new THREE.CylinderGeometry(0.95, 1.0, 0.6, 20), flat(STONE), 0, 0.3, 0));
  for (let k = 0; k < 20; k++) { const a = (k / 20) * Math.PI * 2, rib = mesh(new THREE.SphereGeometry(0.2, 6, 6), flat(STONE), Math.sin(a) * 1.0, 0.32, Math.cos(a) * 1.0); rib.scale.set(1, 1.6, 1); am.add(rib); }
  n.add(am);
  // The ruined wall of the lookout, low and broken, to the north-west.
  for (let k = 0; k < 7; k++) n.add(box(6, 2 + (k % 3) * 0.7, 1.6, Sd, -60 + k * 6.2, 0, -40 + k * 1.5));
  g.add(mergeByMaterial(n));
}

export function addDetails(f, g) {
  architecture(f);
  neighbours(g);
  const ground = mat('#a48a62', 0.97);
  g.add(box(420, 0.2, 420, ground, 0, -0.25, 0), box(70, 0.06, 60, mat('#8c9a5c', 0.95), 0, -0.05, 2));
  g.add(box(4, 0.06, 40, M.path, 0, 0.02, 37), box(20, 0.06, 4, M.path, 0, 0.02, 17));
  // The hills to the north and west, low and rocky.
  const hy = (x, z) => smooth(150, 320, -z + 0.4 * Math.abs(x)) * (22 + 30 * fbm(x, z, { scale: 0.008, octaves: 4 })) - 0.4;
  g.add(heightField(1400, 1000, detail.low ? 90 : 140, hy, { cz: -250, rock: ['#8d7458', '#9a7f60', '#7f684f'], cover: '#7d8250', steep: 0.8 }));
  g.add(trees([...scatter(detail.low ? 10 : 22, [-140, 140, -110, 110], { seed: 3, gap: 12, avoid: [[-45, 50, -35, 45]] })], { kind: 'neem', seed: 4 }));
  g.add(trees(scatter(detail.low ? 8 : 18, [-160, 160, -150, 160], { seed: 5, gap: 12, avoid: [[-50, 55, -40, 50]] }), { kind: 'babul', seed: 6 }));
  g.add(shrubs(along(10, [-30, 30], [30, 30]), { dry: true, size: 1 }));
  if (!detail.low) g.add(townHouses(scatter(26, [-120, 120, 60, 150], { seed: 7, gap: 14 }).map(([x, z], k) => [x, z, 6 + (k % 3), 8, 1]), { seed: 5, paint: ['#c9b08a', '#b89c74', '#d4c3a3'], tanks: 0.1 }));
  g.add(asiBoard('Durga Temple, Aihole', 6, 26, -0.3));
}

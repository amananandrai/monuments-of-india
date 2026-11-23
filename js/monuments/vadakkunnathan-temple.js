import * as THREE from 'three';
import { M, mat, mesh, box, cyl, at, onFace, hipRoof, kalash, photo, doubleSided, strut, inst, unitBox, FACES } from '../helpers.js';
import { mergeByMaterial, windowFrame, jali, frieze } from '../parts/components.js';
import { figureGeo } from '../parts/sculpture.js';
import { pranala, steps } from '../parts/doorways.js';
import { detail } from '../detail.js';
import { keralaGable, ringRoof, keralaGopuram } from '../parts/temples.js';
import { addDetails } from '../details/vadakkunnathan-temple.js';

// Vadakkunnathan's laterite, bare on its great wall and its bases and whitewashed on the shrines;
// teak for its upper storeys, struts and lattices; the clay tiles of the gateways and cloister, the
// copper sheets of the shrines' roofs, gone brown, and of the theatre's, weathered pale; brass for
// the finials; and the ochre ground of the murals painted on the shrines' walls.
export const LIME = photo(mat('#f1ece2', 0.86), 'plaster');
export const LATERITE = photo(mat('#99583c', 0.95), 'laterite');
export const TEAK = photo(mat('#57381f', 0.7), 'timber');
export const TILE = mat('#8e4630', 0.82);
export const COPPER = mat('#7d4f33', 0.5, 0.45);
export const BRASS = mat('#c99a3a', 0.35, 0.8);
export const PALE_COPPER = mat('#a59c7c', 0.55, 0.35);
export const MURAL = mat('#b06a3c', 0.8);

// The temple's measures, shared with js/details/vadakkunnathan-temple.js: the outer wall S square
// (about 9 acres) and WH high; the cloister (nalambalam) CW from north to south and CD from east to
// west, CH high to its eaves, its wings WD deep; where its three passages (x) pierce the west wing,
// one before each shrine; the shrines' centres; and the theatre's. West is +z and north is -x.
export const P = { S: 190, WH: 4.2, CW: 70, CD: 54, CH: 3.8, WD: 9, doors: [-16.5, 0, 15.5], shiva: [-16.5, -4.5], shankara: [0, -4.2], rama: [15.5, -5], theatre: [-40, 60] };

// The carved timber under a shrine's eaves: a slanting strut from the wall to the rafters at each of
// `spots` ([x, z] on the wall, with the outward direction), and on desktops a small figure carved
// on each, the vignettes for which the temple's woodwork is known.
function eaveStruts(spots, y, reach = 1.5, drop = 1.5) {
  const g = new THREE.Group(), figs = [];
  for (const [x, z, nx, nz] of spots) {
    g.add(strut(new THREE.Vector3(x + nx * 0.08, y - drop, z + nz * 0.08), new THREE.Vector3(x + nx * reach, y + 0.05, z + nz * reach), 0.14, TEAK));
    figs.push([x + nx * (reach * 0.45 + 0.1), y - drop * 0.55 - 0.4, z + nz * (reach * 0.45 + 0.1), 0.26, 0.75, 0.26, Math.atan2(nx, nz)]);
  }
  const o = new THREE.Group();
  o.add(mergeByMaterial(g));
  if (!detail.low) o.add(inst(figureGeo('standing'), figs, TEAK));
  return o;
}
const ringSpots = (r, n) => Array.from({ length: n }, (_, k) => { const a = ((k + 0.5) / n) * Math.PI * 2; return [Math.sin(a) * r, Math.cos(a) * r, Math.sin(a), Math.cos(a)]; });

// A shrine's door on its west face (+z) at distance r from its centre: a granite frame, teak leaves
// with brass bosses, and the flight of steps (sopanam) up the base to it.
function shrineDoor(r, base = 1.1) {
  const g = new THREE.Group();
  g.add(box(2.1, 2.9, 0.5, M.granite, 0, base, r - 0.1), box(1.4, 2.4, 0.1, TEAK, 0, base, r + 0.17), box(0.06, 2.4, 0.03, BRASS, 0, base, r + 0.23));
  for (const s of [-1, 1]) for (const y of [0.7, 1.3, 1.9]) g.add(at(mesh(new THREE.SphereGeometry(0.07, 8, 6), BRASS), s * 0.35, base + y, r + 0.22));
  g.add(at(steps(2, base, 5, M.granite, 0.3), 0, 0, r + 0.15));
  for (const s of [-1, 1]) g.add(box(0.3, base + 0.2, 1.6, M.granite, s * 1.15, 0, r + 0.95));
  return g;
}

// A round shrine (vatta srikovil): a whitewashed drum r across on a moulded laterite base, its wall
// divided by pilasters into panels painted with murals, under a conical roof of copper carried on
// carved struts and crowned by a brass finial; with two storeys, a low skirt of roof round a
// timber upper drum under the cone. Its door faces west (+z), with a second on the east if `back`
// (Parvati, behind Shiva); the spout that drains the sanctum (pranala) leaves on the north (-x).
function roundShrine(r, h, { two = false, back = false } = {}) {
  const g = new THREE.Group();
  g.add(cyl(r + 0.9, r + 1.1, 0.5, LATERITE, 0, 0, 0, 40), cyl(r + 0.6, r + 0.8, 0.6, LATERITE, 0, 0.5, 0, 40));
  g.add(cyl(r, r, h, LIME, 0, 1.1, 0, 40), cyl(r + 0.15, r + 0.15, 0.35, frieze(TEAK), 0, 1.1 + h - 0.35, 0, 40));
  // The painted panels between the pilasters, leaving the doors.
  const n = Math.round((2 * Math.PI * r) / 1.9), panels = [], posts = [];
  for (let k = 0; k < n; k++) {
    const a = ((k + 0.5) / n) * Math.PI * 2, b = (k / n) * Math.PI * 2, w = (2 * Math.PI * r) / n;
    posts.push([Math.sin(b) * (r + 0.04), 1.1, Math.cos(b) * (r + 0.04), 0.3, h - 0.35, 0.14, b]);
    if (Math.abs(Math.sin(a) * r) < 1.6 && (Math.cos(a) > 0 || back)) continue;
    panels.push([Math.sin(a) * (r - 0.02), 1.1 + 0.7, Math.cos(a) * (r - 0.02), w - 0.5, h - 1.6, 0.1, a]);
  }
  g.add(inst(unitBox(), panels, MURAL), inst(unitBox(), posts, LIME));
  let y = 1.1 + h;
  const cone = (R, H, y0) => g.add(mesh(new THREE.ConeGeometry(R, H, 40, 1, true), doubleSided(COPPER), 0, y0 + H / 2, 0));
  g.add(eaveStruts(ringSpots(r, Math.round(n * 0.75)), y - 0.1, 1.6, 1.5));
  if (two) {
    cone(r + 2, 1.8, y - 0.1);
    g.add(cyl(r * 0.62, r * 0.62, 2.2, TEAK, 0, y + 0.6, 0, 32));
    y += 2.8;
    cone(r * 0.62 + 1.6, r * 0.62 + 2.4, y - 0.1);
    y += r * 0.62 + 2.4;
  } else {
    cone(r + 2, r + 2.6, y - 0.1);
    y += r + 2.6;
  }
  g.add(at(kalash(0.55, BRASS), 0, y - 0.35, 0));
  g.add(shrineDoor(r));
  if (back) g.add(shrineDoor(r).rotateY(Math.PI));
  g.add(at(pranala(1.9, M.granite, { drop: 1.3, size: 0.8 }), -r + 0.05, 1.3, 0).rotateY(-Math.PI / 2));
  return g;
}

// A square shrine of two storeys under a copper pyramid, as the shrine of Rama, with its narrower
// hall (mukhamandapam) built on to its west face under its own roof.
function squareShrine(w, h) {
  const g = new THREE.Group();
  g.add(box(w + 2, 1.1, w + 2, LATERITE), box(w, h, w, LIME, 0, 1.1, 0), box(w + 0.3, 0.35, w + 0.3, frieze(TEAK), 0, 1.1 + h - 0.35, 0));
  const y = 1.1 + h, mw = 4.8, md = 5, spots = [];
  for (const a of FACES) for (let k = -2; k <= 2; k++) { if (a !== 0) g.add(onFace(box(1.1, h - 1.6, 0.1, MURAL, 0, 1.8, 0), a, w / 2, k * 1.55)); spots.push([Math.sin(a) * w / 2 + Math.cos(a) * k * 1.6, Math.cos(a) * w / 2 - Math.sin(a) * k * 1.6, Math.sin(a), Math.cos(a)]); }
  g.add(eaveStruts(spots.filter(([x, z]) => !(z > 0 && Math.abs(x) < mw / 2 + 0.5)), y - 0.1, 1.6, 1.5));
  g.add(at(hipRoof(w + 3.6, w + 3.6, 1.6, COPPER), 0, y, 0), box(w * 0.66, 2, w * 0.66, TEAK, 0, y + 0.6, 0));
  g.add(at(hipRoof(w * 0.66 + 2.6, w * 0.66 + 2.6, w * 0.5, COPPER), 0, y + 2.5, 0), at(kalash(0.5, BRASS), 0, y + 2.5 + w * 0.5 - 0.15, 0));
  g.add(box(mw + 1.2, 1.1, md + 0.6, LATERITE, 0, 0, w / 2 + md / 2), box(mw, h - 0.6, md, LIME, 0, 1.1, w / 2 + md / 2), at(hipRoof(mw + 2.6, md + 2.6, 2.2, COPPER), 0, h + 0.5, w / 2 + md / 2 + 0.2));
  g.add(shrineDoor(w / 2 + md));
  return g;
}

// A mukhamandapam (namaskara mandapam), the open pavilion before a shrine: a low granite platform
// w square, timber pillars round its edge and four within, and a pyramid of copper with a finial.
function pavilion(w, h = 2.9) {
  const g = new THREE.Group(), n = Math.max(2, Math.round(w / 2.4));
  g.add(box(w + 0.8, 0.35, w + 0.8, LATERITE), box(w + 0.2, 0.3, w + 0.2, M.granite, 0, 0.35, 0));
  for (let i = 0; i <= n; i++) for (let j = 0; j <= n; j++) {
    const edge = i === 0 || j === 0 || i === n || j === n;
    if (!edge && n > 3 && (i + j) % 2) continue;
    g.add(box(0.26, h, 0.26, TEAK, -w / 2 + 0.25 + (i * (w - 0.5)) / n, 0.65, -w / 2 + 0.25 + (j * (w - 0.5)) / n));
  }
  g.add(box(w + 0.2, 0.3, w + 0.2, frieze(TEAK), 0, 0.65 + h, 0), at(hipRoof(w + 2.4, w + 2.4, w * 0.42 + 0.8, COPPER), 0, 0.95 + h, 0), at(kalash(0.4, BRASS), 0, 0.95 + h + w * 0.42 + 0.6, 0));
  return mergeByMaterial(g);
}

// Vadakkunnathan Temple, Thrissur. From photographs and the plan of its inner court: a great
// laterite wall enclosing some nine acres on a low hill in the middle of Thekkinkadu Maidan, with a
// gateway in the middle of each side, timber-framed under three tiers of tiled roof; within it the
// cloister (nalambalam), a ring of tiled roofs round the inner court, its outer face a screen of
// timber lattice set with rows of lamps (vilakkumadam), pierced on the west by a passage before
// each shrine. In the court three shrines stand in a row, all facing west: at the north the great
// round shrine of Shiva (Vadakkunnathan), with Parvati facing east behind him; in the middle the
// smaller round shrine of Shankaranarayana, of two storeys; at the south the square two-storey
// shrine of Rama. Before each stands its open pavilion (mukhamandapam), and between the first two
// the shrine of Ganesha, facing the temple kitchen. Outside the cloister, on the left of the path
// from the west gateway, stands the Koothambalam, the temple theatre, under its steep roof of copper.
// The temple has no flagstaff. The west gateway faces +z; north is -x.
export function buildVadakkunnathanTemple() {
  const g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  const { S, WH, CW, CD, CH, WD, doors } = P;
  // The outer wall, with the gateways in the middle of each side.
  const wl = new THREE.Group(), gw = 15;
  for (const a of FACES) for (const s of [-1, 1]) {
    const len = S / 2 - gw / 2, w = onFace(box(len, WH, 1.4, LATERITE, 0, 0, 0), a, S / 2, s * (gw / 2 + len / 2));
    const cap = onFace(box(len, 0.3, 1.8, TILE, 0, WH, 0), a, S / 2, s * (gw / 2 + len / 2));
    wl.add(w, cap);
  }
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) wl.add(box(2.4, WH + 0.4, 2.4, LATERITE, sx * S / 2, 0, sz * S / 2));
  f.add(mergeByMaterial(wl));
  for (const a of FACES) f.add(onFace(keralaGopuram(gw, 11, { base: LATERITE, wood: TEAK, roof: TILE, brass: BRASS }), a, S / 2));
  // The cloister: whitewashed walls round a court, under one ring of roof; outside, on a laterite
  // base, the lattice screen of the lamp gallery between timber posts.
  const cl = new THREE.Group();
  for (const s of [-1, 1]) {
    cl.add(box(CW, CH, 0.8, LIME, 0, 0.8, s * CD / 2), box(0.8, CH, CD, LIME, s * CW / 2, 0.8, 0));
    cl.add(box(CW - 2 * WD, CH - 1, 0.5, LIME, 0, 0.8, s * (CD / 2 - WD)), box(0.5, CH - 1, CD - 2 * WD, LIME, s * (CW / 2 - WD), 0.8, 0));
    cl.add(box(CW + 1.2, CH - 1.3, 0.12, jali(TEAK), 0, 1.7, s * (CD / 2 + 0.55)), box(0.12, CH - 1.3, CD + 1.2, jali(TEAK), s * (CW / 2 + 0.55), 1.7, 0));
    cl.add(box(CW + 1.3, 0.9, 0.3, LATERITE, 0, 0.8, s * (CD / 2 + 0.55)), box(0.3, 0.9, CD + 1.3, LATERITE, s * (CW / 2 + 0.55), 0.8, 0));
    cl.add(box(CW + 1.6, 0.3, 1.5, TEAK, 0, 0.8 + CH - 0.3, s * (CD / 2 + 0.05)), box(1.5, 0.3, CD + 1.6, TEAK, s * (CW / 2 + 0.05), 0.8 + CH - 0.3, 0));
  }
  for (const a of FACES) {
    const along = Math.abs(Math.sin(a)) > 0.5 ? CD : CW, dist = (Math.abs(Math.sin(a)) > 0.5 ? CW : CD) / 2 + 0.6, n = Math.floor(along / 3.2);
    for (let k = 0; k <= n; k++) cl.add(onFace(box(0.24, CH - 0.2, 0.24, TEAK, 0, 0.8, 0), a, dist, -along / 2 + (k * along) / n));
  }
  cl.add(box(CW + 2.6, 0.8, CD + 2.6, LATERITE, 0, 0, 0));
  cl.add(box(CW - 2 * WD - 0.6, 0.06, CD - 2 * WD - 0.6, M.path, 0, 0.8, 0));
  // The passages through the west wing, one before each shrine, and the door in the north wing:
  // each a granite doorway with steps, under a carved gable set in the roof.
  const gates = [...doors.map((x, k) => [0, x, k === 0 ? 8 : 6]), [-Math.PI / 2, -5, 6]];
  for (const [a, l, w] of gates) {
    const dist = (a ? CW : CD) / 2;
    cl.add(onFace(box(w * 0.5, CH - 0.5, 1.6, M.granite, 0, 0.8, 0), a, dist + 0.2, l), onFace(box(w * 0.5 - 0.8, CH - 1, 0.1, TEAK, 0, 0.8, 0), a, dist + 1.06, l));
    cl.add(onFace(at(steps(w * 0.5, 0.8, 3, M.granite, 0.35), 0, 0, 0), a, dist + 1.3, l));
    const pe = keralaGable(w, w * 0.34, 3.6, TILE, TEAK);
    f.add(onFace(at(pe, 0, 0.8 + CH + 0.9, 0), a, dist + 1.8 - 0.9 * (1.8 + WD / 2) / 4.6 + 0.2, l));
  }
  f.add(mergeByMaterial(cl));
  f.add(at(ringRoof(CW, CD, WD, 1.8, 4.6, TILE), 0, 0.8 + CH, 0));
  // The three shrines in the court, from north to south, and the pavilion before each.
  const [sx, sz] = P.shiva, [nx, nz] = P.shankara, [rx, rz] = P.rama;
  f.add(at(roundShrine(7, 4.4, { back: true }), sx, 0.8, sz), at(roundShrine(4.2, 3.8, { two: true }), nx, 0.8, nz), at(squareShrine(8, 4.2), rx, 0.8, rz));
  f.add(at(pavilion(7, 3.2), sx, 0.8, 10.3), at(pavilion(4, 2.6), nx, 0.8, nz + 8.6), at(pavilion(6), rx, 0.8, 11.5));
  // The shrine of Ganesha, facing the kitchen (thidappally): a small cell built against a long
  // tiled room.
  const gk = new THREE.Group();
  gk.add(box(9.6, 0.5, 4.6, LATERITE, -6.5, 0, 12.7), box(9, 3, 4, LIME, -6.5, 0.5, 12.7), at(hipRoof(10.6, 5.6, 2.2, TILE), -6.5, 3.5, 12.7));
  gk.add(box(3, 0.7, 3, LATERITE, -6, 0, 9.2), box(2.4, 2.8, 2.4, LIME, -6, 0.7, 9.2), at(hipRoof(4, 4, 1.8, COPPER), -6, 3.5, 9.2), at(kalash(0.3, BRASS), -6, 5.2, 9.2));
  f.add(at(mergeByMaterial(gk), 0, 0.8, 0));
  // The Koothambalam, north-west of the cloister, on the left of the path from the west gateway:
  // a long hall of timber lattice between pillars on a laterite base, under a steep hipped roof
  // of copper sheets with a gable at each end and three finials on its ridge.
  const lw = windowFrame(1.6, 1.4, TEAK, { shape: 'flat', screen: jali(TEAK), frame: 0.14 }), k = new THREE.Group(), spots = [];
  k.add(box(26, 1.2, 16, LATERITE, 0, 0, 0), box(22, 4.2, 12, LIME, 0, 1.2, 0), box(22.4, 0.35, 12.4, frieze(TEAK), 0, 5.05, 0));
  k.add(at(hipRoof(27, 17, 8.6, PALE_COPPER), 0, 5.4, 0), box(5.4, 0.25, 0.3, PALE_COPPER, 0, 13.75, 0));
  for (const j of [-1, 0, 1]) k.add(at(kalash(0.4, BRASS), j * 2, 13.95, 0));
  for (const a of [Math.PI / 2, -Math.PI / 2]) { const gb = keralaGable(6, 3, 4.4, PALE_COPPER, TEAK); gb.position.set(Math.sin(a) * 10.3, 7.2, 0); gb.rotation.y = a; k.add(gb); }
  for (const a of [0, Math.PI]) for (let j = -3; j <= 3; j++) { k.add(onFace(at(lw.clone(), 0, 2.4, 0), a, 6.01, j * 3)); spots.push([j * 3 + 1.5, Math.cos(a) * 6, 0, Math.cos(a)]); }
  for (const a of [Math.PI / 2, -Math.PI / 2]) for (let j = -1; j <= 1; j++) { k.add(onFace(at(lw.clone(), 0, 2.4, 0), a, 11.01, j * 3)); spots.push([Math.sin(a) * 11, j * 3 + 1.5, Math.sin(a), 0]); }
  k.add(eaveStruts(spots, 5.4, 2, 1.7), at(steps(3, 1.2, 4, M.granite, 0.35), 0, 0, 8));
  f.add(at(k, P.theatre[0], 0, P.theatre[1]));
  addDetails(f, g);
  // From the west, over the main gateway: the theatre on the left, the cloister and its shrines behind.
  return { group: g, focus: f, view: [0.4, 0.3, 1], zoom: 0.42 };
}

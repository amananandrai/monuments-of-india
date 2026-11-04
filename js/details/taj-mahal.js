import * as THREE from 'three';
import { M, mat, mesh, box, cyl, at, onFace, FACES, chamferPrism, finial, onionDome, sheet, inst, unitCyl, unitHemi } from '../helpers.js';
import { iwan, arcadeSkin, cellRow } from './mughal.js';
import {
  jali, frieze, niche, archSlab, archRing, rosette, bracketGeo, placeAll, aroundCircle, alongFace,
  railingRing, merlons, lotusDome, petalRing, crescentFinial, mughalChhatri, mergeByMaterial,
} from './components.js';
import { trees, asiBoard, fountains, scatter, along } from './realism.js';

// Taj Mahal, finer detail (1632–1653). From photographs and descriptions (tajmahal.gov.in,
// Archnet, the Taj Mahal articles of Wikipedia and Britannica):
// - each face is centred on a pishtaq: a great pointed arch in a rectangular frame, cut deep into
//   the tomb and roofed by a half-dome, with a door and an arched window screen at the back, so the
//   eye passes from curve to curve; Quranic calligraphy in black marble runs round the frame, the
//   spandrels carry inlaid flowers, and slender pinnacles (guldastas) rise at its edges;
// - either side, and on the chamfered corners, two storeys of smaller arched alcoves, each with a
//   pierced screen;
// - a carved dado round the foot of the walls, leaf-shaped merlons along the parapets, and
//   guldastas at the corners;
// - the drum ringed by a blind arcade between inlaid lines; an inverted lotus at the top of the dome
//   and a gilded finial ending in a crescent;
// - four chhatris on the roof with eight columns, arches, an eave, ribbed domes and lotus caps;
// - minarets on octagonal bases, three balconies on brackets with pierced railings and a door onto
//   each, black inlay lines and moulded rings up the shaft, and a chhatri on top;
// - a blind arcade round the plinth and a moulded edge along its top.
// Dimensions follow js/monuments/taj-mahal.js: plinth top P, tomb half-width s with corners
// chamfered by c, walls H high.

const MB = M.marble, SH = M.marbleShade;

// The crown of the tomb's walls: a chamfered parapet with merlons (replaces the plain band).
function parapet(s, c, P, H, d) {
  const off = 0.3, s2 = s + off, c2 = c + off * (2 - Math.SQRT2);
  d.add(at(chamferPrism(s2, c2, 1.2, SH), 0, P + H - 0.6, 0));
  const y = P + H + 0.6, faceLen = s - c - 10.8;
  for (const a of FACES) {
    for (const lat of [-(10.8 + faceLen / 2), 10.8 + faceLen / 2]) d.add(onFace(at(merlons(faceLen - 0.4, 0.62, 0.95, 0.3, MB, 0.35), 0, y, 0), a, s + 0.1, lat));
    const ca = a + Math.PI / 4, cd = (2 * s - c) / Math.SQRT2;
    d.add(onFace(at(merlons(c * Math.SQRT2 - 1.6, 0.62, 0.95, 0.3, MB, 0.35), 0, y, 0), ca, cd + 0.1));
  }
}

// A guldasta: a slender octagonal pinnacle of height h engaged at a corner, with a lotus-domed cap.
function guldasta(h, r, m = MB) {
  const g = new THREE.Group();
  g.add(cyl(r * 1.25, r * 1.3, h * 0.03, m, 0, 0, 0, 8), cyl(r * 0.92, r, h, m, 0, 0, 0, 8));
  for (const t of [0.25, 0.5, 0.75, 0.93]) g.add(cyl(r * 1.08, r * 1.08, h * 0.012, SH, 0, h * t, 0, 8));
  g.add(cyl(r * 1.3, r * 0.95, h * 0.025, m, 0, h, 0, 8));
  g.add(at(lotusDome(r * 1.05, m, { ribs: 8, petals: 8 }), 0, h * 1.025, 0));
  g.add(at(finial(r * 2.2), 0, h * 1.025 + r * 1.9, 0));
  return g;
}

// The pishtaq on one face: a niche 14 m wide and 24 m to the crown, in a 21 × 32 m frame `depth`
// deep, with door, window screen, calligraphy, inlaid spandrels, guldastas and merlons.
function pishtaq(depth) {
  const g = new THREE.Group();
  g.add(niche(14, 24, true, depth, MB, { frame: 3.5, top: 8, back: SH, inner: false }));
  // Arches within the arch: on the back wall, below the half-dome, a tall blind arch framing the
  // door and the screened window above it, each in its own ring.
  g.add(at(archRing(11.4, 14.1, true, 0.22, 0.08, SH), 0, 0, 0.06));
  g.add(at(archSlab(5.2, 8.6, true, M.recess, 0.06), 0, 0, 0.06), at(archRing(5.2, 8.6, true, 0.32, 0.1, MB), 0, 0, 0.08));
  g.add(at(archSlab(4.4, 4.0, true, M.recess, 0.06), 0, 9.8, 0.06), at(archSlab(4.4, 4.0, true, jali(MB), 0.06), 0, 9.8, 0.12));
  g.add(at(archRing(4.4, 4.0, true, 0.26, 0.12, MB), 0, 9.8, 0.1));
  g.add(box(6.0, 0.45, 0.18, MB, 0, 9.15, 0.1));
  // The calligraphy frame round the arch, as a raised white band with a fine bead inside it.
  const z = depth;
  for (const [w, h, x, y] of [[0.5, 26.3, -8.3, 0], [0.5, 26.3, 8.3, 0], [17.1, 0.5, 0, 26.3]]) g.add(box(w, h, 0.07, MB, x, y, z));
  for (const [w, h, x, y] of [[0.12, 25.4, -7.75, 0], [0.12, 25.4, 7.75, 0], [15.62, 0.12, 0, 25.4]]) g.add(box(w, h, 0.05, MB, x, y, z));
  // Carved flowers in the spandrels, white on white.
  for (const x of [-5.6, 5.6]) {
    g.add(at(rosette(0.95, SH, 8), x, 23.2, z + 0.02));
    for (const dx of [-1.25, 1.25]) g.add(at(rosette(0.42, SH, 6), x + dx, 22.4, z + 0.02));
  }
  // A carved band along the top of the frame, and merlons above it.
  g.add(box(19.6, 1.3, 0.06, frieze(SH), 0, 29.4, z));
  g.add(at(merlons(20.4, 0.75, 1.05, 0.4, MB, 0.3), 0, 32, depth / 2));
  // Guldastas at both edges of the frame.
  for (const x of [-10.5, 10.5]) g.add(at(guldasta(36.5, 0.55), x, 0, depth - 0.35));
  return g;
}

// Two storeys of alcoves: niches with a pierced screen, at (dist, lat) on the face at `a`.
function alcoves(a, dist, lat, aw, P, d) {
  for (const y of [1.5, 15.5]) {
    const n = niche(aw, 11, true, 0.9, MB, { frame: 0.5, top: 1.3, back: SH, inner: false });
    n.add(at(archSlab(aw * 0.98, 10.9, true, jali(MB), 0.05), 0, 0, 0.08));
    n.add(at(archRing(aw * 0.62, 8.4, true, 0.14, 0.05, MB), 0, 0, 0.13));
    d.add(onFace(at(n, 0, P + y, 0), a, dist, lat));
  }
}

export function addTajDetails(f, { P, s, c, H }) {
  const d = new THREE.Group(), top = P + H;
  parapet(s, c, P, H, d);
  const cd = (2 * s - c) / Math.SQRT2;
  for (const a of FACES) {
    d.add(onFace(at(pishtaq(2.6), 0, P, 0), a, s));
    for (const lat of [-15.3, 15.3]) alcoves(a, s, lat, 4.6, P, d);
    alcoves(a + Math.PI / 4, cd, 0, 5.2, P, d);
    // The carved dado along the foot of the walls.
    for (const lat of [-14.85, 14.85]) d.add(onFace(box(8.1, 1.3, 0.08, frieze(SH), 0, P + 0.05, 0), a, s + 0.04, lat));
    d.add(onFace(box(c * Math.SQRT2 - 0.4, 1.3, 0.08, frieze(SH), 0, P + 0.05, 0), a + Math.PI / 4, cd + 0.04));
    // Guldastas where each face meets a chamfer.
    for (const lat of [-(s - c), s - c]) d.add(onFace(at(guldasta(H + 3.6, 0.5), 0, P, 0), a, s - 0.15, lat));
  }
  // The drum: a blind arcade between two moulded rings.
  for (const [x, y, z, ry] of aroundCircle(13.95, 24, top + 1.0)) {
    const o = archSlab(2.5, 4.4, true, SH, 0.12);
    o.position.set(x, y, z);
    o.rotation.y = ry;
    d.add(o);
  }
  for (const y of [top + 0.55, top + 5.75]) d.add(cyl(14.1, 14.1, 0.18, MB, 0, y, 0, 64));
  // The dome: a moulded ring at its foot and an inverted lotus at its crown.
  const dy = top + 7, R = 14.5;
  d.add(at(mesh(new THREE.TorusGeometry(R * 0.86 + 0.1, 0.28, 8, 72), MB), 0, dy + 0.25, 0).rotateX(Math.PI / 2));
  d.add(at(petalRing(3.25, 20, 3.4, 1.35, Math.PI - 0.82, MB, 0.25), 0, dy + R * 1.585, 0));
  d.add(cyl(1.0, 1.6, 0.9, MB, 0, dy + R * 1.79, 0, 24));
  // Kiosks at the corners of the drum.
  for (const x of [-16, 16]) for (const z of [-16, 16]) d.add(at(mughalChhatri(4.2, 10, MB), x, top, z));
  // The plinth: a blind arcade along each side and a moulded edge along its top.
  for (const a of FACES) {
    d.add(placeAll(archSlab(2.5, 3.9, true, SH, 0.1).geometry, alongFace(a, 47.5, 92, 22, 2.3), SH));
    d.add(onFace(box(95.3, 0.4, 0.12, frieze(MB), 0, 7.05, 0), a, 47.5));
  }
  d.add(at(crescentFinial(10.5), 0, dy + R * 1.83, 0));
  f.add(mergeByMaterial(d));
  // Minarets at the corners of the plinth.
  for (const x of [-42, 42]) for (const z of [-42, 42]) f.add(at(tajMinaret(Math.atan2(x, z)), x, P, z));
}

// A minaret on the plinth, standing on y = 0, its door side facing `out`.
export function tajMinaret(out) {
  const t = new THREE.Group();
  t.add(box(7.6, 1.1, 7.6, SH), cyl(3.5, 3.7, 1.1, MB, 0, 1.1, 0, 8));
  // [bottom radius, top radius, from, to]
  const secs = [[2.6, 2.46, 2.2, 13.5], [2.4, 2.3, 13.5, 23.5], [2.24, 2.14, 23.5, 31.8]];
  for (const [r0, r1, y0, y1] of secs) {
    const h = y1 - y0;
    t.add(cyl(r1, r0, h, MB, 0, y0, 0, 48));
    // Moulded rings (the ridges up the tower) at a third and two thirds of each section.
    for (const k of [1 / 3, 2 / 3]) {
      const r = r0 + (r1 - r0) * k + 0.06;
      t.add(cyl(r, r, 0.2, SH, 0, y0 + h * k - 0.1, 0, 48));
    }
  }
  // Balconies: stepped corbelling, brackets, a floor and a pierced railing, and a door onto each.
  for (const [r, y] of [[2.46, 13.5], [2.3, 23.5], [2.14, 31.8]]) {
    const R = r + 1.05;
    for (let k = 0; k < 3; k++) t.add(cyl(r + 0.25 + k * 0.25, r + 0.1 + k * 0.25, 0.22, MB, 0, y - 0.95 + k * 0.22, 0, 48));
    t.add(placeAll(bracketGeo(1.2, R - r - 0.08, 0.24), aroundCircle(r, 16, y), MB));
    t.add(cyl(R, R, 0.25, MB, 0, y, 0, 48));
    t.add(at(railingRing(R - 0.1, 1.0, MB), 0, y + 0.25, 0));
    t.add(onFace(at(archSlab(0.95, 2.0, true, M.recess, 0.1), 0, y + 0.25, 0), out, r - 0.06));
    t.add(onFace(at(archRing(0.95, 2.0, true, 0.1, 0.08, MB), 0, y + 0.25, 0), out, r - 0.02));
  }
  t.add(at(mughalChhatri(2.55, 8.6, MB), 0, 32.05, 0));
  return mergeByMaterial(t);
}

// The Taj Mahal's garden: the rows of cypress either side of the long water channel, its line of
// fountains, shade trees in the four quarters, and the ASI board at the forecourt.
// The mosque (west) and its twin the jawab (east), which face the tomb across the terrace: a red
// sandstone hall 56 × 20 with a great iwan between two arched bays on each side, outlined in white
// marble, octagonal towers at its corners under kiosks, and three white marble domes, the middle
// one largest. Its front faces +z.
function mosque() {
  const g = new THREE.Group(), R = M.red, W = M.marble, L = 56, D = 20, H = 15, dp = 1.4;
  g.add(box(L, H, D - dp, R, 0, 0, -dp / 2), box(L + 0.6, 0.6, D + 0.6, W, 0, H));
  g.add(onFace(arcadeSkin(L - 16, H, cellRow(4, 9, 0, 5, 9.5, [[-6, 6]]).flatMap(([x, s0, w, h]) => [[x, s0, w, h], [x, 10.3, w * 0.6, 3.6, 'jali']]), dp, R, { trim: W, fill: 'room' }), 0, D / 2 - dp, 0));
  g.add(onFace(at(iwan(9, 13, { m: R, trim: W, shade: M.redLight, depth: 2.4, frame: 1.4, top: 1.6, fill: 'room' }), 0, 0, 0), 0, D / 2));
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) g.add(cyl(2.2, 2.4, H + 3, R, sx * (L / 2 - 1.5), 0, sz * (D / 2 - 1.5), 8), at(mughalChhatri(2, 6, R, { domeM: W }), sx * (L / 2 - 1.5), H + 3, sz * (D / 2 - 1.5)));
  g.add(onFace(at(merlons(L - 8, 0.8, 1, 0.3, R, 0.35), 0, H + 0.6, 0), 0, D / 2 - 0.3));
  for (const [x, r] of [[-16, 4.6], [0, 6.4], [16, 4.6]]) {
    g.add(cyl(r * 0.92, r * 0.92, r * 0.5, W, x, H + 0.6, -1, 32), at(onionDome(r, W), x, H + 0.6 + r * 0.5, -1), at(finial(r * 0.75), x, H + 0.6 + r * 0.5 + r * 1.8, -1));
  }
  return mergeByMaterial(g);
}

// The great gate (Darwaza-i-Rauza) at the south end of the garden, facing the tomb across it: red
// sandstone outlined in white marble, a deep iwan through its middle, smaller iwans either side on
// two storeys, octagonal towers at its corners under kiosks, and a row of eleven small domed kiosks
// along the top of each front. Its north face (+z towards the tomb is -z here) looks up the garden.
function greatGate() {
  const g = new THREE.Group(), R = M.red, W = M.marble, w = 41, h = 23, d = 30, kp = [], kd = [];
  g.add(box(w, h, d - 2.4, R, 0, 0, 0));
  for (const a of [0, Math.PI]) {
    g.add(onFace(iwan(10, 17, { m: R, trim: W, shade: M.redLight, depth: 2.4, frame: 1.6, top: 2.2, fill: 'room' }), a, (d - 2.4) / 2));
    for (const lat of [-12.5, 12.5]) for (const y of [0.8, 10.2]) g.add(onFace(at(niche(4.4, 7.2, true, 0.9, R, { frame: 0.6, top: 0.6, back: M.redLight }), 0, y, 0), a, (d - 2.4) / 2, lat));
    for (let k = 0; k < 11; k++) { const z = Math.cos(a) * ((d - 2.4) / 2 - 1), x = -15 + k * 3; kp.push([x, h + 0.8, z, 1.6, 1.6, 1.6]); kd.push([x, h + 2.4, z, 1.9, 1.5, 1.9]); }
  }
  g.add(inst(unitCyl(8), kp, W), inst(unitHemi(10), kd, W));
  g.add(box(w + 0.6, 0.8, d - 1.8, W, 0, h));
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) g.add(cyl(2.4, 2.6, h + 3, R, sx * (w / 2), 0, sz * (d / 2 - 2.4), 8), at(mughalChhatri(2.4, 6.5, R, { domeM: W }), sx * (w / 2), h + 3, sz * (d / 2 - 2.4)));
  return mergeByMaterial(g);
}

export function addDetails(f, g) {
  g.add(at(greatGate(), 0, 0, 228));
  // The red sandstone terrace runs on either side of the tomb's platform to the mosque and the
  // jawab; the Yamuna flows behind, below a sandy bank.
  for (const s of [-1, 1]) {
    g.add(box(108, 1.5, 118, M.red, s * 113, 0, 0));
    g.add(at(mosque(), s * 128, 1.5, 0).rotateY(-s * Math.PI / 2));
  }
  g.add(sheet(1400, 60, mat('#c8b48c', 0.95), 0, 0.05, -90), sheet(1400, 300, M.lake, 0, 0.1, -270));
  g.add(fountains(along(14, [0, 64], [0, 206]).filter(([, z]) => Math.abs(z - 135) > 10), { y: 0.35, h: 1.6 }));
  for (const x of [-9, 9]) g.add(trees(along(16, [x, 62], [x, 208]).filter(([, z]) => Math.abs(z - 135) > 11), { kind: 'cypress', seed: x > 0 ? 3 : 4, h: 9 }));
  g.add(trees(scatter(16, [-40, 40, 64, 206], { seed: 5, gap: 14, avoid: [[-12, 12, 0, 220]] }), { kind: 'neem', seed: 5 }));
  g.add(asiBoard('Taj Mahal', 14, 212, 0, { line2: 'WORLD HERITAGE SITE' }));
}

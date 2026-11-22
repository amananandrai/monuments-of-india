import * as THREE from 'three';
import { M, V, mat, mesh, box, cyl, at, onFace, FACES, inst, unitBox, unitCyl, kalash, archWall, chhatri, hemi, bulbPoints, surface } from '../helpers.js';
import { rosette, petalRing, railing, archCurve, mergeByMaterial, archRing, archSlab, merlons, bracketGeo, placeAll, alongFace, chhajja, cuspedArchGeo, banglaRoof, jali } from '../parts/components.js';
import { balustrade } from '../parts/colonial.js';
import { trees, shrubs, scatter, along, fountains } from '../parts/realism.js';
import { rideElephant, elephant, couchant } from '../parts/animals.js';
import { crossLegged, hold } from '../parts/figures.js';
import { detail } from '../detail.js';
import { BAYS, FZ, ARC_SILL, PALACE, END_TOWERS } from '../monuments/mysore-palace.js';

// Mysore Palace, finer detail, after photographs of the main front. Dimensions follow
// js/monuments/mysore-palace.js: the arcade's bays (BAYS) on a sill at y 6.4 in the front at z 24,
// the gallery above to the cornice at 17.4, the parapet over it.
// - cusps (small lobes) round the inside of each of the great arches, so they read as multi-foiled,
//   and carved roundels in the spandrels between the wide ones;
// - the arches carried on round granite columns, paired on the broad piers, with bases and capitals;
// - a pierced railing along the foot of the arcade, the Durbar Hall's balcony;
// - a balustrade along the parapet either side of the central bay;
// - the cups of lotus petals the domes rise from.
function architecture(f) {
  const d = new THREE.Group(), G = M.mysore, L = M.lime, { CREAM } = PALACE;
  const lobe = new THREE.TorusGeometry(0.36, 0.09, 4, 8, Math.PI), cols = [];
  BAYS.forEach(([cx, w, h], k) => {
    const r = w / 2, pts = archCurve(r, h - r, false, 10).slice(1, -1);
    pts.forEach((p, i) => {
      if (i % (detail.low ? 3 : 2)) return;
      const o = new THREE.Mesh(lobe, L);
      o.position.set(cx + p.x * 0.95, ARC_SILL + p.y * 0.97 + (1 - 0.97) * (h - r), FZ + 0.06);
      o.rotation.z = Math.atan2(p.y - (h - r), p.x) - Math.PI / 2;
      d.add(o);
    });
    // The piers: between this bay and the next, a pair of columns on a broad pier, one on a narrow.
    if (k < BAYS.length - 1) {
      const [nx, nw] = BAYS[k + 1], a = cx + w / 2, c = nx - nw / 2, mid = (a + c) / 2, pair = c - a > 1;
      for (const x of pair ? [mid - 0.48, mid + 0.48] : [mid]) cols.push([x, ARC_SILL, FZ + 0.35]);
      if (pair) d.add(at(rosette(0.8, L, 10), mid, ARC_SILL + 6.9, FZ + 0.02));
    }
  });
  for (const sx of [-1, 1]) cols.push([sx * 41.6, ARC_SILL, FZ + 0.35]);
  const H = 2.8;
  if (detail.low) d.add(inst(unitCyl(12), cols.map(([x, y, z]) => [x, y + 0.35, z, 0.6, H, 0.6]), G), inst(unitBox(), cols.flatMap(([x, y, z]) => [[x, y, z, 0.85, 0.35, 0.85], [x, y + H + 0.35, z, 0.95, 0.45, 0.95]]), L));
  else {
    // The columns as they are turned: a square plinth, a pot-shaped base, a shaft ringed at its
    // third points and swelling a little, a spreading lotus capital and a square abacus; and over
    // each, a carved bracket curling out to carry the cornice above the arches.
    const turned = new THREE.LatheGeometry([[0.4, 0], [0.4, 0.035], [0.28, 0.05], [0.36, 0.09], [0.4, 0.14], [0.3, 0.2], [0.21, 0.225], [0.2, 0.24], [0.225, 0.5], [0.26, 0.515], [0.22, 0.53], [0.19, 0.84], [0.25, 0.855], [0.2, 0.87], [0.28, 0.93], [0.42, 0.975], [0.42, 1]].map(([r, y]) => new THREE.Vector2(r, y)), 16);
    d.add(inst(turned, cols.map(([x, y, z]) => [x, y + 0.3, z, 1, H + 0.2, 1]), G), inst(unitBox(), cols.flatMap(([x, y, z]) => [[x, y, z, 0.95, 0.3, 0.95], [x, y + H + 0.5, z, 1.0, 0.3, 1.0]]), L));
    d.add(placeAll(bracketGeo(2.3, 1.0, 0.42), cols.map(([x, , z]) => [x, 13.2, z - 0.25, 0]), L));
  }
  // The balcony's railing along the foot of the arcade, and the parapet's balustrade.
  // (On phones the parapet is a pierced screen like the railing, not a row of balusters.)
  for (const [x0, x1] of [[-41.6, -5.4], [5.4, 41.6]]) {
    d.add(at(railing(x1 - x0, 0.95, 0.22, G, 1.8), (x0 + x1) / 2, ARC_SILL, FZ + 0.25));
    const len = x1 - x0 - 5.8, x = (x0 + x1) / 2 + Math.sign(x0) * 2.9;
    d.add(at(detail.low ? railing(len, 1.1, 0.3, CREAM, 2.4) : balustrade(len, 1.1, CREAM, { t: 0.35 }), x, 18.0, FZ + 0.05));
  }
  mergeByMaterial(d);
  f.add(d);
}

// Gajalakshmi in the gable over the central bay, under its red hood: the goddess seated
// cross-legged on an open lotus, crowned, holding a lotus up in each hand, between two elephants
// that face her with their trunks raised over her, each lifting a pot to pour water on her; all
// gilt, on the ledge at the foot of the tympanum. (Painted plaster, by the palace artist B. Basavaiah, by one account; her pose and the
// elephants' are the traditional ones.) On phones, a simpler goddess and the elephants without pots.
export function gajalakshmi() {
  const g = new THREE.Group(), G = M.gild;
  g.add(at(petalRing(1.0, 14, 0.7, 0.55, 1.25, G), 0, 0.3, 0.15), at(petalRing(0.7, 10, 0.5, 0.45, 0.8, G), 0, 0.42, 0.15));
  // (Seen from far below, so meshed coarsely: 1.6 cm, 4 cm on phones.)
  const fig = crossLegged('lakshmi', { head: 'kirita', right: 'lotusUp', left: 'lotusUp' }, G, 0.016, { low: 2.5 }), s = new THREE.Group();
  s.add(fig.mesh);
  if (!detail.low) { hold(s, fig, 'r', 'lotus', G); hold(s, fig, 'l', 'lotus', G); }
  s.scale.setScalar(2.2);
  s.position.set(0, 0.55, 0.15);
  g.add(s);
  for (const sx of [-1, 1]) {
    const e = elephant(G, 0.33, { raised: true });
    if (!detail.low) { const pot = kalash(0.5, G); pot.position.set(0, 5.1, 3.2); pot.rotation.x = 2.2; e.children[0].add(pot); }
    e.position.set(sx * 2.75, 0.13, 0.1);
    e.rotation.y = -sx * Math.PI / 2;
    g.add(e);
  }
  return g;
}


// The sculpture: Gajalakshmi in the central gable (gajalakshmi(), above), sized to the tympanum.
function sculpture(f) {
  const ga = gajalakshmi();
  ga.scale.setScalar(0.72);
  f.add(at(ga, 0, 22.3, FZ + 1.1));
}

// The carving, on desktops: what makes the palace's fronts dense. After photographs:
// - the gallery over the great arches: a pilaster between every two windows, the windows closed
//   with dark glazing under yellow panels, a deep eave on a row of small brackets, and urns
//   along the balustrade;
// - the ground floor's arches ringed in white;
// - the four end towers: an octagonal shaft up each corner ending in a red spire, bracket courses
//   under each storey's band, the top windows parted by colonnettes, a deep eave on brackets under
//   the parapet and merlons along it;
// - the central tower: colonnettes between its openings, bracket courses under its bands, a
//   railing round each stage and four more gilt kiosks at its top.
// All instanced or merged, so it costs triangles but few draw calls.
// One end tower's carving, in the tower's own frame (w wide and 9 deep, its front at z = 4.5, on
// y = 0), after the photographs:
// - an octagonal shaft up each corner; small brackets under each storey's band; a deep eave on
//   carved brackets under the attic;
// - up the middle of the front, three storeys of jharokhas as the palaces of Rajasthan build
//   them: each a balcony on a shelf with a pierced apron, a row of small cusped arches between
//   slender mullions, red posts at its corners, and a curved eave drooping at its ends; the top one
//   under a curved red hood with a gilt finial; the whole carried on carved corbels;
// - red colonnettes and yellow panels at the three windows under the eave.
function towerCarving(w, GLASS, OCHRE, { bay = true, side = 0 } = {}) {
  const t = new THREE.Group(), L = M.lime, { TAN, RED } = PALACE;
  // A window of the side fronts: a round-headed opening glazed dark, a yellow shutter across its
  // lower half, a white moulded ring, and a shelf of a sill on two small brackets.
  const win = (a, dist, lat, y, h) => {
    t.add(onFace(at(archSlab(1.3, h, false, GLASS, 0.06), 0, y, 0), a, dist + 0.02, lat), onFace(at(archRing(1.3, h, false, 0.16, 0.1, L), 0, y, 0), a, dist + 0.03, lat));
    t.add(onFace(box(1.2, h * 0.42, 0.05, OCHRE, 0, y + 0.05, 0), a, dist + 0.1, lat), onFace(box(1.8, 0.14, 0.5, L, 0, y - 0.16, 0), a, dist + 0.25, lat));
  };
  // The towers' side faces carry a pair of such windows on each of three storeys; so does the front
  // of a tower that faces sideways, which has no bay.
  for (const a of side ? [side * Math.PI / 2] : []) for (const [y, h] of [[1.2, 3.6], [9.4, 3.2], [18.4, 3.0]]) for (const lat of [-1.5, 1.5]) win(a, w / 2, lat, y, h);
  if (!bay) for (const lat of [-w / 4, w / 4]) win(0, 4.5, lat, 9.4, 3.2);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) t.add(cyl(0.38, 0.4, 23.6, TAN, sx * (w / 2), 0, sz * 4.5, 8));
  for (const a of FACES) {
    const len = a === 0 || a === Math.PI ? w : 9, dist = (a === 0 || a === Math.PI ? 9 : w) / 2;
    for (const y of [5.55, 16.95]) for (const [x, yy, z, ry] of alongFace(a, dist + 0.2, len - 1, Math.round(len / 0.7), y)) t.add(at(box(0.2, 0.42, 0.5, L), x, yy, z).rotateY(ry));
    t.add(onFace(at(chhajja(len + 0.4, 1.1, 0.35, 0.14, L), 0, 23.3, 0), a, dist + 0.05));
    t.add(placeAll(bracketGeo(0.9, 0.85, 0.22), alongFace(a, dist + 0.02, len - 0.6, Math.round(len / 0.95), 22.95), L));
  }
  const bw = w * 0.62, z0 = 4.5, aw = (bw - 0.24) / 6, head = cuspedArchGeo(aw - 0.1, 0.6, 0.1), SCREEN = jali(L);
  for (let k = 0; bay && k < 3; k++) {
    const y = 7.0 + k * 3.25;
    t.add(box(bw + 0.5, 0.2, 1.3, L, 0, y - 0.2, z0 + 0.6), box(bw, 1.0, 1.0, SCREEN, 0, y, z0 + 0.5), box(bw, 0.3, 1.0, L, 0, y + 2.55, z0 + 0.5));
    t.add(box(bw - 0.25, 1.55, 0.95, GLASS, 0, y + 1.0, z0 + 0.42));
    for (let i = 0; i <= 6; i++) t.add(box(0.11, 1.55, 0.11, L, -bw / 2 + 0.12 + i * aw, y + 1.0, z0 + 0.94));
    for (let i = 0; i < 6; i++) t.add(mesh(head, L, -bw / 2 + 0.12 + (i + 0.5) * aw, y + 2.55, z0 + 0.94));
    for (const sx of [-1, 1]) t.add(cyl(0.08, 0.08, 2.5, RED, sx * (bw / 2 + 0.02), y + 0.1, z0 + 1.0, 8));
    // The curved eave over each storey; over the top one the red hood.
    t.add(at(banglaRoof(bw + 0.9, 1.6, k < 2 ? 0.4 : 1.15, k < 2 ? L : RED), 0, y + 2.85, z0 + 0.7));
  }
  if (bay) t.add(cyl(0.12, 0.03, 0.7, M.gild, 0, 7.0 + 2 * 3.25 + 3.95, z0 + 0.7, 6));
  if (bay) t.add(placeAll(bracketGeo(1.5, 1.0, 0.3), [-bw / 2 + 0.4, 0, bw / 2 - 0.4].map((x) => [x, 6.8, z0 + 0.02, 0]), L));
  for (const x of [-w * 0.3, 0, w * 0.3]) {
    t.add(box(1.3, 1.4, 0.05, OCHRE, x, 20.1, z0 - 0.1));
    for (const k of [-1, 1]) t.add(cyl(0.08, 0.08, 2.3, RED, x + k * 0.82, 18.6, z0 + 0.08, 8));
  }
  for (const x of [-w / 4, w / 4]) for (const k of [-1, 1]) t.add(cyl(0.09, 0.09, 2.75, L, x + k * 0.98, 1, z0 + 0.08, 8));
  return mergeByMaterial(t);
}

function carving(f) {
  const d = new THREE.Group(), L = M.lime, { CREAM, RED } = PALACE, GLASS = surface(mat('#2f4a4a', 0.4, 0.2), 'none'), OCHRE = surface(mat('#e3bd4e', 0.75), 'none'), b = 1;
  const pil = [], caps = [], shut = [], panes = [], panes2 = [], dent = [], urns = [], rings = [];
  for (const s of [-1, 1]) {
    for (let i = 0; i <= 16; i++) {
      const x = s * (12.6 + (i - 0.5) * 1.9);
      pil.push([x, 13.75, FZ + 0.12, 0.26, 3.5, 0.2]);
      caps.push([x, 17.0, FZ + 0.14, 0.4, 0.22, 0.3], [x, 13.7, FZ + 0.14, 0.4, 0.2, 0.3]);
      // Each window: dark glazing below, a yellow panel filling the arch above it.
      if (i < 16) { shut.push([s * (12.6 + i * 1.9), 13.85, FZ - 0.75, 1.2, 1.45, 0.05]); panes.push([s * (12.6 + i * 1.9), 15.3, FZ - 0.7, 1.2, 1.45, 0.05]); }
    }
    for (let x = 11.2; x < 41.6; x += 0.8) dent.push([s * x, 16.75, FZ + 0.42, 0.2, 0.42, 0.66]);
    d.add(at(chhajja(30.8, 1.0, 0.3, 0.12, L), s * 26.4, 17.3, FZ + 0.1));
    for (let x = 12; x <= 40.5; x += 3.56) urns.push([s * x, 19.1, FZ + 0.05]);
  }
  // The central bay's five windows, glazed and panelled like the gallery's.
  for (const x of [-7.6, -3.8, 0, 3.8, 7.6]) { const w = x ? 2.4 : 2.7; shut.push([x, 13.85, FZ + 0.8, w, 2.1, 0.05]); panes.push([x, 15.95, FZ + 0.82, w, x ? 2.1 : 2.5, 0.05]); }
  const urnGeo = new THREE.LatheGeometry([[0, 0], [0.16, 0], [0.16, 0.05], [0.07, 0.1], [0.09, 0.16], [0.21, 0.3], [0.23, 0.4], [0.18, 0.52], [0.08, 0.58], [0.11, 0.63], [0.05, 0.74], [0, 0.8]].map(([r, y]) => new THREE.Vector2(r, y)), 10);
  d.add(inst(urnGeo, urns.map(([x, y, z]) => [x, y, z, 1, 1, 1]), L));
  const ring = archRing(1.9, 3.0, false, 0.16, 0.1, L).geometry;
  for (let k = 0; k < 32; k++) { const cx = (k - 15.5) * 2.62; if (Math.abs(cx) > 3) rings.push([cx, b + 0.4, FZ + 0.02, 0]); }
  d.add(placeAll(ring, rings, L));

  // The end towers (END_TOWERS): each carved in its own frame and set where the tower stands.
  // (A tower turned sideways has windows, not a bay, on its front; the outer front tower has
  // windows on the side that faces out.)
  for (const [x, z, ry, w] of END_TOWERS) {
    const t = at(towerCarving(w, GLASS, OCHRE, { bay: !ry, side: !ry && Math.abs(x) > 55 ? Math.sign(x) : 0 }), x, b, z);
    t.rotation.y = ry;
    d.add(t);
  }
  // The side fronts, after photographs: before the range between the two towers a yellow porch of
  // three arches, with a balustrade on its roof and on the range above; and yellow shutters in the
  // lower halves of the windows of the yellow range behind.
  const { YELLOW } = PALACE;
  for (const s of [-1, 1]) {
    const p = at(new THREE.Group(), s * 66.4, b, 11.3);
    p.rotation.y = s * Math.PI / 2;
    for (const x of [-2.1, 0, 2.1]) p.add(at(archWall(2.1, 4.9, 0.5, 1.5, 3.9, false, YELLOW), x, 0, 1.75), at(archRing(1.5, 3.9, false, 0.14, 0.1, L), x, 0, 2.01));
    for (const sx of [-1, 1]) p.add(at(archWall(4, 4.9, 0.5, 2.4, 3.9, false, YELLOW), sx * 2.9, 0, 0).rotateY(Math.PI / 2));
    p.add(box(6.9, 0.4, 4.6, L, 0, 4.9, -0.1), at(balustrade(6.4, 0.9, L, { t: 0.25 }), 0, 5.3, 1.9));
    d.add(p, at(balustrade(7, 1.0, L, { t: 0.3 }), s * 64.1, b + 19.7, 11.3).rotateY(s * Math.PI / 2));
    for (const [y, h] of [[1.2, 3.6], [6.6, 3.2], [11.4, 3.0]]) for (let k = -2; k <= 2; k++) panes2.push([s * 62.82, b + y + 0.05, -10.2 + k * 3.6, 0.05, h * 0.42, 1.5]);
  }
  // Between each pair of towers: the tall arch closed with a yellow screen, and a balustrade along
  // the roof of the range.
  for (const s of [-1, 1]) {
    panes2.push([s * 53.65, b + 0.6, 23.82, 4.3, 7.0, 0.05]);
    d.add(at(balustrade(6.6, 1.0, L, { t: 0.3 }), s * 53.65, b + 19.7, 23.7));
  }
  d.add(inst(unitBox(), panes2, OCHRE));

  // The central tower (about x = 0, z = 12): its lower stage 9.6 square from y 18, its upper 6.8
  // square from y 28.
  const tw = at(new THREE.Group(), 0, 0, 12);
  for (const a of FACES) {
    for (const [y, half, n] of [[22.38, 5.85, 13], [27.18, 5.85, 13], [32.38, 4.35, 9]]) for (const [x, yy, z, ry] of alongFace(a, half, half * 2 - 0.6, n, y)) tw.add(at(box(0.2, 0.42, 0.5, L), x, yy, z).rotateY(ry));
    for (const k of [-2.75, -0.92, 0.92, 2.75]) for (const y of [18.8, 23.5]) tw.add(onFace(cyl(0.11, 0.11, 2.6, L, 0, y, 0, 8), a, 5.35, k));
    for (const k of [-2.0, -0.95, 0.95, 2.0]) tw.add(onFace(cyl(0.11, 0.11, 2.6, RED, 0, 28.8, 0, 8), a, 3.85, k));
    tw.add(onFace(at(railing(8.6, 0.7, 0.14, L, 1.2), 0, 28.1, 0), a, 5.6), onFace(at(railing(7.6, 0.6, 0.12, L, 1.2), 0, 33.3, 0), a, 4.15));
  }
  for (const x of [-3.6, 3.6]) for (const z of [-3.6, 3.6]) tw.add(at(chhatri(0.5, 1.8, CREAM, M.gild), x, 33.3, z));
  d.add(tw);
  d.add(inst(unitBox(), pil, L), inst(unitBox(), caps, L), inst(unitBox(), shut, GLASS), inst(unitBox(), panes, OCHRE), inst(unitBox(), dent, L));
  f.add(d);
}

// A domed kiosk; on phones a drum under a plain dome.
const kiosk = (r, h, m) => (detail.low ? new THREE.Group().add(cyl(r * 0.85, r * 0.85, h * 0.45, m, 0, 0, 0, 8), at(hemi(r, m, 10), 0, h * 0.45, 0)) : chhatri(r, h, m, m));

// The Jaya Marthanda gate at the head of the drive, after photographs: a great round arch between
// two lower wings, each of two storeys of arches, in buff stone; a domed kiosk on a square turret at
// each shoulder of the middle and a smaller one at each end; a pierced parapet along the top with
// the crest at its centre. The palace's wall runs off either side: yellow, with white copings and
// merlons. At night the gate is outlined in bulbs like the palace.
function gate(g) {
  const d = at(new THREE.Group(), 0, 0.15, 152), BUFF = mat('#c2a47c', 0.85), TRIM = mat('#a98a62', 0.85), YELLOW = surface(mat('#e9c85a', 0.8), 'carved'), W = M.lime;
  d.add(archWall(17, 20, 5.5, 9.6, 15, false, BUFF), box(18, 0.6, 6.4, TRIM, 0, 20, 0), box(17, 1.6, 5.6, BUFF, 0, 20.6, 0));
  for (const fz of [1, -1]) {
    d.add(at(archRing(9.6, 15, false, 0.5, 0.2, TRIM), 0, 0, fz * 2.76).rotateY(fz > 0 ? 0 : Math.PI));
    d.add(at(merlons(16, 0.9, 1.0, 0.25, TRIM, 0.4), 0, 22.2, fz * 2.5), box(3, 2.6, 0.4, BUFF, 0, 22.2, fz * 2.6), box(1.6, 1.6, 0.1, W, 0, 22.7, fz * 2.82));
  }
  for (const s of [-1, 1]) {
    d.add(box(9.5, 13.5, 4.6, BUFF, s * 13.2, 0, 0), box(10.1, 0.5, 5.4, TRIM, s * 13.2, 13.5, 0), box(10.1, 0.4, 5.2, TRIM, s * 13.2, 6.6, 0));
    for (const fz of [1, -1]) for (const y of [0.4, 7.4]) {
      d.add(at(archSlab(4.6, 5.4, false, M.recess, 0.06), s * 13.2, y, fz * 2.31).rotateY(fz > 0 ? 0 : Math.PI), at(archRing(4.6, 5.4, false, 0.3, 0.12, TRIM), s * 13.2, y, fz * 2.33).rotateY(fz > 0 ? 0 : Math.PI));
    }
    d.add(box(3, 4.2, 3, BUFF, s * 7.9, 21.2, 0), box(3.5, 0.4, 3.5, TRIM, s * 7.9, 25.4, 0), at(kiosk(1.5, 4.6, BUFF), s * 7.9, 25.8, 0));
    d.add(box(2.2, 2, 2.2, BUFF, s * 16.8, 14, 0), at(kiosk(1.05, 3.4, BUFF), s * 16.8, 16, 0));
    // The palace wall.
    d.add(box(70, 5, 1.2, YELLOW, s * 53, 0, 0), box(70.4, 0.4, 1.6, W, s * 53, 5, 0));
    if (!detail.low) for (const fz of [1, -1]) d.add(at(merlons(69, 0.7, 0.8, 0.2, W, 0.5), s * 53, 5.4, fz * 0.5));
  }
  g.add(mergeByMaterial(d));
  // The gate's outline in bulbs.
  const pts = [], line = (a, c) => { const n = Math.max(1, Math.round(a.distanceTo(c) / 0.9)); for (let i = 0; i <= n; i++) pts.push(a.clone().lerp(c, i / n)); };
  for (const z of [149.1, 154.9]) {
    line(V(-8.5, 0.5, z), V(-8.5, 20.3, z)); line(V(8.5, 0.5, z), V(8.5, 20.3, z)); line(V(-8.5, 20.3, z), V(8.5, 20.3, z));
    for (let k = 0; k <= 28; k++) { const a = Math.PI - (k / 28) * Math.PI; pts.push(V(Math.cos(a) * 4.8, 10.35 + Math.sin(a) * 4.8, z)); }
    for (const s of [-1, 1]) { line(V(s * 4.8, 0.5, z), V(s * 4.8, 10.35, z)); line(V(s * 8.5, 13.8, z), V(s * 17.9, 13.8, z)); line(V(s * 17.9, 0.5, z), V(s * 17.9, 13.8, z)); }
  }
  g.add(bulbPoints(pts));
}

// The forecourt as photographed from the approach: the red-brick drive between low green railings
// of hoops, the lawns behind them with beds of red flowers, and lamp posts with white globes along
// the drive; at Dasara the caparisoned elephants of the procession on the lawns, one under the
// golden howdah; palms to either side.
export function addDetails(f, g) {
  architecture(f);
  if (!detail.low) carving(f);
  sculpture(f);
  gate(g);
  // Fountains in round basins in the two lawns.
  for (const x of [-42, 42]) g.add(cyl(6.4, 6.4, 0.5, M.lime, x, 0.1, 96, 32), cyl(5.8, 5.8, 0.52, M.water, x, 0.1, 96, 32));
  g.add(fountains([[-42, 96], [42, 96]], { y: 0.6, h: 3.2 }));
  // The bronze tigers on their pedestals either side of the drive, facing each other across it
  // (desktops only: each is a sculpted figure).
  if (!detail.low) for (const z of [46, 118]) for (const sx of [-1, 1]) {
    const t = at(new THREE.Group(), sx * 14, 0.15, z);
    t.rotation.y = -sx * Math.PI / 2;
    t.add(box(1.7, 1.3, 3.6, M.lime), box(1.9, 0.12, 3.8, PALACE.CREAM, 0, 1.3, 0), at(couchant(M.bronze, { tiger: true }), 0, 1.42, 0));
    g.add(t);
  }
  [[-30, 62, '#b3262e', '#e3b54a'], [-18, 66, '#2f5d9a', '#e3b54a'], [18, 66, '#2f7a3f', '#e3b54a'], [30, 62, '#7a1f5a', '#e3b54a']].forEach(([x, z, c, t], i) => {
    const e = rideElephant(mat('#6a605a', 0.9), 1, { cloth: c, trim: t, howdah: i === 1 });
    e.position.set(x, 0.15, z);
    e.rotation.y = Math.PI;
    g.add(e);
  });
  // The railings: a rail on short posts with a row of hoops along it, either side of the drive and
  // round the lawns' fronts.
  const GREEN = mat('#2f6b3a', 0.6, 0.2), posts = [], rails = [], hoops = [];
  for (const sx of [-1, 1]) {
    for (const [x0, z0, x1, z1] of [[sx * 9, 30, sx * 9, 132], [sx * 9, 30, sx * 70, 30]]) {
      const L = Math.hypot(x1 - x0, z1 - z0), n = Math.round(L / 2.4), ry = Math.atan2(x1 - x0, z1 - z0);
      rails.push([(x0 + x1) / 2, 1.05, (z0 + z1) / 2, 0.06, 0.06, L, ry]);
      for (let i = 0; i <= n; i++) {
        const x = x0 + ((x1 - x0) * i) / n, z = z0 + ((z1 - z0) * i) / n;
        posts.push([x, 0, z, 0.1, 1.15, 0.1, ry]);
        if (i < n) hoops.push([x + (x1 - x0) / n / 2, 0.15, z + (z1 - z0) / n / 2, 1, 1, 1, ry + Math.PI / 2]);
      }
    }
  }
  g.add(inst(unitBox(), posts, GREEN), inst(new THREE.BoxGeometry(1, 1, 1), rails, GREEN), inst(new THREE.TorusGeometry(1.05, 0.04, detail.low ? 3 : 4, detail.low ? 6 : 12, Math.PI), hoops.map(([x, y, z, , , , ry]) => [x, y, z, 1.1, 0.85, 1, ry]), GREEN));
  // Lamp posts with white globes along the drive.
  const lamps = [];
  for (let z = 34; z <= 128; z += 12) for (const x of [-10, 10]) lamps.push([x, z]);
  g.add(inst(unitCyl(8), lamps.map(([x, z]) => [x, 0, z, 0.16, 3.6, 0.16]), mat('#3a3a38', 0.5, 0.4)), inst(new THREE.SphereGeometry(0.5, 12, 8), lamps.map(([x, z]) => [x, 3.9, z, 0.72, 0.72, 0.72]), mat('#f4f1ea', 0.3, 0, { emissive: '#fff6dc', emissiveIntensity: 0.15 })));
  g.add(shrubs(scatter(26, [-68, 68, 36, 128], { seed: 5, gap: 5, avoid: [[-12, 12, 30, 140], [-36, 36, 56, 72]] }).map(([x, z]) => [x, z, 1.2]), { flowers: '#c62828', seed: 5 }));
  g.add(trees([...along(6, [-90, 35], [-90, 125]), ...along(6, [90, 35], [90, 125])], { kind: 'palm', seed: 4 }));
}

import * as THREE from 'three';
import { M, mat, mesh, box, cyl, at, lathe, ribbed, finial, surface } from '../helpers.js';
import { arcadeSkin } from '../details/mughal.js';
import { porch } from '../details/colonial.js';
import { merlons, windowFrame, mughalChhatri, mergeByMaterial } from '../details/components.js';
import { addDetails } from '../details/laxmi-vilas-palace.js';

// Pale buff sandstone throughout, its courses, frames and recesses a darker buff, with pinkish
// panels and bands; the domes the same stone, a little greyer.
export const STONE = mat('#d8c6a9', 0.88);
export const DARK = mat('#b39a7b', 0.9);
export const PINK = surface(mat('#c7a08c', 0.88), 'carved');
export const DOME = mat('#cdbfa8', 0.85);

// The palace's domes: tall, a little swollen at the haunch and drawn up to a point, ribbed, of unit
// radius at the base and 1.5 high.
const LV_DOME = [[1, 0], [1.05, 0.22], [1.03, 0.5], [0.9, 0.8], [0.66, 1.08], [0.36, 1.3], [0.1, 1.46], [0, 1.5]];
export function lvDome(r, m = DOME, ribs = 16) {
  return ribbed(lathe(LV_DOME.map(([a, b]) => [a * r, b * r]), m, 32), ribs, 0.04);
}
// A dome on an octagonal drum: drum r wide and dh high from y = 0, the dome r * 1.04 over it, a
// finial on top. userData.top: the finial's tip.
function domeOnDrum(r, dh, { m = STONE, ribs = 16, fin = r * 0.45 } = {}) {
  const g = new THREE.Group(), drum = cyl(r, r, dh, m, 0, 0, 0, 8);
  drum.rotation.y = Math.PI / 8;
  g.add(drum, cyl(r * 1.08, r * 1.08, 0.5, DARK, 0, dh - 0.5, 0, 8).rotateY(Math.PI / 8));
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * Math.PI * 2, rr = r * Math.cos(Math.PI / 8);
    const w = at(windowFrame(r * 0.42, dh * 0.62, DARK, { frame: r * 0.05 }), Math.sin(a) * rr, dh * 0.14, Math.cos(a) * rr);
    w.rotation.y = a;
    g.add(w);
  }
  g.add(at(lvDome(r * 1.04, DOME, ribs), 0, dh, 0), at(finial(fin, DARK), 0, dh + r * 1.5, 0));
  g.userData.top = dh + r * 1.56 + fin;
  return g;
}
// The curved gable over a bay, as on the palace's fronts: a broad round-shouldered hood w wide and
// h high, d thick, standing on y = 0 with its face at z = 0, a deep arched window under it.
function archHood(w, h, d) {
  const g = new THREE.Group(), s = new THREE.Shape(), n = 16;
  s.moveTo(-w / 2, 0);
  for (let k = 0; k <= n; k++) { const u = k / n; s.lineTo(-w / 2 + u * w, h * Math.pow(Math.sin(u * Math.PI), 0.7)); }
  s.lineTo(w / 2, 0); s.closePath();
  const hole = new THREE.Path(), hw = w * 0.22, hh = h * 0.45;
  hole.moveTo(-hw, h * 0.08); hole.lineTo(hw, h * 0.08); hole.lineTo(hw, h * 0.08 + hh - hw); hole.absarc(0, h * 0.08 + hh - hw, hw, 0, Math.PI, false); hole.closePath();
  s.holes.push(hole);
  g.add(mesh(new THREE.ExtrudeGeometry(s, { depth: d, bevelEnabled: false, curveSegments: 4 }).translate(0, 0, -d), STONE));
  // The hood's moulded rim, a little proud and darker, and the dark space behind the window.
  const rim = new THREE.Shape(), t = 0.35;
  rim.moveTo(-w / 2 - t, 0);
  for (let k = 0; k <= n; k++) { const u = k / n; rim.lineTo(-w / 2 - t + u * (w + 2 * t), (h + t) * Math.pow(Math.sin(u * Math.PI), 0.7)); }
  for (let k = n; k >= 0; k--) { const u = k / n; rim.lineTo(-w / 2 + u * w, h * Math.pow(Math.sin(u * Math.PI), 0.7)); }
  rim.closePath();
  g.add(mesh(new THREE.ExtrudeGeometry(rim, { depth: 0.3, bevelEnabled: false }).translate(0, 0, -0.1), DARK));
  g.add(box(hw * 2, hh, 0.1, M.recess, 0, h * 0.08, -d + 0.05));
  return g;
}

// A range of the palace, w long, d deep and h high, its foot at y = 0 and its front at z = d / 2:
// three storeys, a ground arcade of cusped arches, a middle storey of windows in pink panels and an
// open loggia above on a balcony; a darker course at each floor, a cornice and a crested parapet.
function wing(w, h, d) {
  const g = new THREE.Group(), fine = new THREE.Group(), dd = 1.6, n = Math.max(2, Math.round(w / 4.4)), s = h / 18;
  const cells = [], back = [];
  for (let k = 0; k < n; k++) {
    const x = -w / 2 + (k + 0.5) * (w / n);
    cells.push([x, 0.5, 3, 4.6 * s, 'room'], [x, 6.8 * s, 1.7, 3.4 * s, 'jali'], [x, 12.4 * s, 2.6, 3.9 * s, 'room']);
    back.push([x, 1, 1.8, 3.6 * s, 'room'], [x, 7 * s, 1.6, 3 * s, 'jali'], [x, 12.6 * s, 1.6, 3 * s, 'jali']);
    fine.add(box(2.6, 4.4 * s, 0.08, PINK, x, 6.3 * s, d / 2 + 0.04));
  }
  g.add(box(w, h, d - 2 * dd, STONE), at(arcadeSkin(w, h, cells, dd, STONE, { trim: DARK }), 0, 0, d / 2 - dd), at(arcadeSkin(w, h, back, dd, STONE, { trim: DARK, fill: 'room' }), 0, 0, -d / 2 + dd).rotateY(Math.PI));
  for (const y of [6 * s, 11.8 * s]) g.add(box(w + 0.4, 0.6, d + 0.4, DARK, 0, y));
  g.add(box(w + 0.6, 1.2, 3, DARK, 0, 11.8 * s - 0.6, d / 2), box(w + 0.8, 0.8, d + 0.8, DARK, 0, h), box(w + 0.4, 0.5, d + 0.4, PINK, 0, h - 1.4));
  fine.add(at(merlons(w - 0.6, 0.5, 0.8, 0.3, STONE, 0.5), 0, h + 0.8, d / 2 + 0.1));
  g.add(mergeByMaterial(fine));
  g.userData.top = h + 0.8;
  return g;
}

// Small round turret with a dome, r in radius, its shaft h high.
function turret(r, h) {
  const g = new THREE.Group();
  g.add(cyl(r, r * 1.05, h, STONE, 0, 0, 0, 8), cyl(r * 1.25, r * 1.25, 0.5, DARK, 0, h - 0.5, 0, 8));
  g.add(cyl(r * 0.9, r * 0.9, r * 1.2, STONE, 0, h, 0, 8), at(lvDome(r * 1.05, DOME, 8), 0, h + r * 1.2, 0), at(finial(r * 0.9, DARK), 0, h + r * 2.75, 0));
  return g;
}

// Laxmi Vilas, the Gaekwads' palace at Vadodara (1890), in buff sandstone as photographed from the
// lawn. From the middle: the entrance block, projecting, with its porch and two curved gables,
// under the great ribbed dome on a drum ringed by kiosks; the tower beside it on the west, square
// and banded, an open arcaded lantern at its top under a dome with kiosks at its corners; the wings
// of three storeys; the Durbar Hall at the west end under the biggest dome, and the east pavilion
// with curved gables and domes; lower ranges beyond, and wings running back round the courts.
// Positions shared with the details file.
export const TOWER = [-20, 2], DURBAR = [-55, -4], EAST = [57, -4], CENTRE = { w: 30, front: 6, h: 19, bay: 12, bayH: 24 };
export function buildLaxmiVilas() {
  const g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  g.add(box(420, 0.15, 320, M.grass, 0, 0, 40), box(10, 0.25, 140, M.path, 0, 0, 80), box(80, 0.22, 14, M.path, 0, 0, 14));
  // The wings between the pavilions, and the lower ranges beyond them.
  f.add(at(wing(31, 18, 18), -30.5, 0, -4), at(wing(31, 18, 18), 30.5, 0, -4));
  f.add(at(wing(34, 15, 16), -81, 0, -6), at(wing(32, 15, 16), 84, 0, -6));
  // Wings running back from the ends, round the courts.
  f.add(at(wing(60, 15, 16), -90, 0, -43.9).rotateY(Math.PI / 2), at(wing(60, 15, 16), 92, 0, -43.9).rotateY(-Math.PI / 2));
  // A domed kiosk on the west wing, beside the tower.
  f.add(at(domeOnDrum(2.6, 2.4, { ribs: 12 }), -38, 18.8, -6));

  // The entrance block: two side bays under curved gables, the middle bay rising higher to the
  // great dome; turrets with small domes at its corners.
  const C = new THREE.Group(), { w, front, h, bay, bayH } = CENTRE, cd = 30, cz = front - cd / 2, side = (w - bay) / 2;
  const cells = (len, n, ground) => Array.from({ length: n }, (_, k) => { const x = -len / 2 + (k + 0.5) * (len / n); return [[x, 0.5, 2.6, 4.6, ground], [x, 6.8, 1.6, 3.4, 'jali'], [x, 12.4, 2.2, 3.9, 'room']]; }).flat();
  for (const s of [-1, 1]) {
    const x = s * (bay / 2 + side / 2);
    C.add(box(side, h, cd - 3.2, STONE, x, 0, cz - 1.6), at(arcadeSkin(side, h, cells(side, 2, 'room'), 1.6, STONE, { trim: DARK }), x, 0, front - 1.6));
    C.add(box(side + 0.6, 0.8, cd + 0.6, DARK, x, h, cz), at(archHood(side - 1, 5, 1.2), x, h + 0.8, front - 0.4));
    // Behind each gable a dome on a drum.
    C.add(at(domeOnDrum(2.8, 2.2, { ribs: 12 }), x, h + 0.8, front - 6));
  }
  C.add(box(bay, bayH, cd - 3.2, STONE, 0, 0, cz - 1.6), at(arcadeSkin(bay, bayH, [[0, 9, 4, 5.2, 'room'], [-3.4, 15.5, 1.8, 3.6, 'jali'], [0, 15.5, 2.2, 4.4, 'room'], [3.4, 15.5, 1.8, 3.6, 'jali']], 1.6, STONE, { trim: DARK }), 0, 0, front - 1.6));
  for (const y of [6, 11.8]) C.add(box(w + 0.4, 0.6, 0.8, DARK, 0, y, front));
  C.add(box(bay + 0.6, 0.9, cd + 0.6, DARK, 0, bayH, cz), at(archHood(bay - 2, 4.6, 1.2), 0, bayH + 0.9, front - 0.4), box(bay - 1, 1.6, 0.25, PINK, 0, 20.6, front + 0.05));
  for (const s of [-1, 1]) for (const z of [front - 0.6, cz - cd / 2 + 1]) C.add(at(turret(1.1, bayH + 1), s * (w / 2 - 0.4), 0, z));
  for (const s of [-1, 1]) C.add(at(turret(0.8, bayH + 0.8), s * (bay / 2), 0, front + 0.3));
  // The great dome over the middle bay, on its drum ringed by eight small domed kiosks.
  const great = domeOnDrum(6.6, 5.4, { fin: 3 });
  C.add(at(great, 0, bayH + 0.9, cz + 3));
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * Math.PI * 2 + Math.PI / 8;
    C.add(at(mughalChhatri(0.9, 3.4, STONE, { domeM: DOME, finialM: DARK, crescent: false }), Math.sin(a) * 7.8, bayH + 0.9, cz + 3 + Math.cos(a) * 7.8));
  }
  // The porch: a porte-cochère of three arches before the door.
  C.add(at(porch(12, 5, 7, { m: STONE, trim: DARK, colM: STONE, cols: 4, r: 0.6, top: 'balustrade', stepsDown: 0.5 }), 0, 0.5, front));
  f.add(C);

  // The tower: square and banded, 8.5 m, rising to 40 m, above the great dome; a corbelled balcony, then an arcaded
  // octagonal lantern under a dome, with a kiosk at each corner of the balcony.
  const T = new THREE.Group(), tw = 8.5, th = 40;
  T.add(box(tw, th, tw, STONE));
  for (const y of [6, 11.8, 18, 24, 30, 36]) T.add(box(tw + 0.5, 0.6, tw + 0.5, DARK, 0, y));
  T.add(box(tw + 2.2, 1, tw + 2.2, DARK, 0, th), box(tw + 0.4, 0.8, tw + 0.4, PINK, 0, th - 2));
  const lantern = cyl(3.4, 3.6, 5, STONE, 0, th + 1, 0, 8);
  lantern.rotation.y = Math.PI / 8;
  T.add(lantern, cyl(3.9, 3.9, 0.6, DARK, 0, th + 6, 0, 8).rotateY(Math.PI / 8));
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * Math.PI * 2, rr = 3.4 * Math.cos(Math.PI / 8);
    const o = at(windowFrame(1.4, 3.4, DARK, { frame: 0.2 }), Math.sin(a) * rr, th + 1.6, Math.cos(a) * rr);
    o.rotation.y = a;
    T.add(o);
  }
  T.add(at(lvDome(3.2, DOME, 12), 0, th + 6.6, 0), at(finial(2.4, DARK), 0, th + 6.6 + 4.8, 0));
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) T.add(at(mughalChhatri(1.1, 4.4, STONE, { domeM: DOME, finialM: DARK, crescent: false }), sx * (tw / 2 + 0.2), th + 1, sz * (tw / 2 + 0.2)));
  f.add(at(T, TOWER[0], 0, TOWER[1]));

  // The Durbar Hall at the west end: a tall block under the biggest dome, on a drum, with domed
  // turrets at its corners.
  const D = new THREE.Group();
  D.add(at(wing(18, 20, 30), 0, 0, 0));
  D.add(at(domeOnDrum(6, 3.4, { fin: 3 }), 0, 20.8, 0));
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) D.add(at(turret(1.2, 21.5), sx * 9, 0, sz * 15));
  f.add(at(D, DURBAR[0], 0, DURBAR[1]));

  // The east pavilion: two curved gables over its front, a dome behind them, domed turrets round it.
  const E = new THREE.Group();
  E.add(at(wing(22, 19, 30), 0, 0, 0));
  for (const x of [-5.5, 5.5]) E.add(at(archHood(9.4, 5.4, 1.2), x, 19.8, 15.2));
  E.add(at(domeOnDrum(5.2, 2.8, { fin: 2.4 }), 0, 19.8, -4));
  for (const [x, z] of [[-11, 15], [11, 15], [0, 15.6], [-11, -15], [11, -15]]) E.add(at(turret(x ? 1.1 : 0.8, x ? 21 : 20.6), x, 0, z));
  f.add(at(E, EAST[0], 0, EAST[1]));

  addDetails(f, g);
  // The home view matches the best-known photograph: the front straight on from the lawn.
  return { group: g, focus: f, view: [-0.08, 0.06, 1], zoom: 0.4, target: [-4, 20, 0] };
}

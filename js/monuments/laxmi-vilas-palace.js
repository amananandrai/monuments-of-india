import * as THREE from 'three';
import { M, mat, mesh, box, cyl, at, onFace, FACES, lathe, ribbed, finial, surface, inst, unitBox, unitCyl } from '../helpers.js';
import { detail } from '../detail.js';
import { arcadeSkin } from '../parts/mughal.js';
import { porch } from '../parts/colonial.js';
import { merlons, windowFrame, mughalChhatri, mergeByMaterial, archCurve, chhajja, bracketGeo, placeAll, jharokha, petalRing, railing, archRing, alongFace } from '../parts/components.js';
import { addDetails } from '../details/laxmi-vilas-palace.js';

// The stones, each its own material: the warm golden-beige sandstone of the walls; a darker buff
// for courses, frames and the deep shade of the mouldings; the pinkish Agra sandstone of the carved
// panels; red sandstone for the string courses under the parapets; the blue-grey trap stone of
// the plinth and the course along the foot of the walls; and the domes, the same sandstone a
// little greyer.
export const STONE = surface(mat('#dcc6a2', 0.88), 'masonry');
export const DARK = surface(mat('#b39a7b', 0.9), 'masonry');
export const PINK = surface(mat('#c9a08a', 0.88), 'carved');
export const RED = surface(mat('#a8634a', 0.88), 'masonry');
export const TRAP = surface(mat('#5e6672', 0.86), 'masonry');
// (Dressed smooth: a dome's ribs and petals would be crossed by block joints otherwise.)
export const DOME = surface(mat('#cdbfa8', 0.85), 'carved');

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
  // On desktops the dome springs from a cup of lotus petals, and under its finial sits the ribbed
  // cushion (amalaka) on an inverted lotus, as the palace's domes are finished.
  if (!detail.low) {
    g.add(at(petalRing(r * 1.07, Math.max(12, Math.round(r * 3.2)), r * 0.4, r * 0.32, 0.3, DOME, 0.25), 0, dh - r * 0.04, 0));
    const am = at(ribbed(mesh(new THREE.SphereGeometry(r * 0.2, 16, 8), DARK), 12, 0.12), 0, dh + r * 1.5, 0);
    am.scale.y = 0.55;
    g.add(am, at(petalRing(r * 0.14, 10, r * 0.2, r * 0.13, Math.PI - 0.7, DOME, 0.25), 0, dh + r * 1.47, 0));
  }
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

// Small pinnacles standing along the rim of an archHood(w, h): n of them, each a little ribbed
// bulb on a neck with a spike, as the palace's gables bristle with them. In the hood's own frame.
function hoodPinnacles(w, h, n, size = 0.5) {
  const g = new THREE.Group();
  for (let k = 1; k < n; k++) {
    const u = k / n, y = (h + 0.35) * Math.pow(Math.sin(u * Math.PI), 0.7);
    g.add(cyl(size * 0.3, size * 0.36, size * 0.7, DARK, -w / 2 + u * w, y, -0.5, 8), at(lvDome(size * 0.5, DOME, 8), -w / 2 + u * w, y + size * 0.7, -0.5), cyl(0.03, 0.06, size * 0.9, DARK, -w / 2 + u * w, y + size * 1.4, -0.5, 6));
  }
  return g;
}
// A coloured surround on an archHood's face: a band of pink stone following the rim inside it.
function hoodBand(w, h, t = 0.55) {
  const s = new THREE.Shape(), n = 20, f = (ww, hh, u) => [-ww / 2 + u * ww, hh * Math.pow(Math.sin(u * Math.PI), 0.7)];
  for (let k = 0; k <= n; k++) { const [x, y] = f(w - 1.2, h - 0.6, k / n); k ? s.lineTo(x, y + 0.2) : s.moveTo(x, y + 0.2); }
  for (let k = n; k >= 0; k--) { const [x, y] = f(w - 1.2 - 2 * t, h - 0.6 - t, k / n); s.lineTo(x, y + 0.2); }
  s.closePath();
  return mesh(new THREE.ExtrudeGeometry(s, { depth: 0.08, bevelEnabled: false }), PINK);
}
// A square tower w wide and h high carrying an open belvedere under a dome: the towers that flank
// the Durbar Hall and stand at the ends of the fronts.
function belvedere(w, h, r = w * 0.52) {
  const g = new THREE.Group(), bh = w * 0.9;
  g.add(box(w, h, w, STONE), box(w + 0.6, 0.5, w + 0.6, DARK, 0, h, 0), box(w + 1.3, 0.3, w + 1.3, DARK, 0, h + bh + 0.5, 0));
  for (const y of [6, 11.8]) if (y < h - 2) g.add(box(w + 0.3, 0.5, w + 0.3, DARK, 0, y, 0));
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) g.add(cyl(0.22, 0.26, bh, STONE, sx * (w / 2 - 0.3), h + 0.5, sz * (w / 2 - 0.3), 8));
  g.add(box(w * 0.5, bh, w * 0.5, M.recess, 0, h + 0.5, 0), at(domeOnDrum(r, 1.1, { ribs: 12, fin: r * 0.6 }), 0, h + bh + 0.8, 0));
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
  g.add(box(w + 0.6, 1.2, 3, DARK, 0, 11.8 * s - 0.6, d / 2), box(w + 0.8, 0.8, d + 0.8, DARK, 0, h), box(w + 0.4, 0.5, d + 0.4, RED, 0, h - 1.4));
  // The trap-stone plinth along the foot of the walls.
  g.add(box(w + 0.5, 0.5, d + 0.5, TRAP, 0, 0));
  fine.add(at(merlons(w - 0.6, 0.5, 0.8, 0.3, STONE, 0.5), 0, h + 0.8, d / 2 + 0.1));
  if (!detail.low) ornament(fine, w, h, d, s, cells);
  g.add(mergeByMaterial(fine));
  g.userData.top = h + 0.8;
  return g;
}

// The front's carving, on desktops (js/detail.js): the ground arches multifoil, lobed round their
// heads; a stone chhajja over the ground arcade and under the parapet, each on carved brackets; a
// jharokha on brackets in every third bay of the middle storey; and slender chhatris along the
// parapet, one to about every 13 m.
function ornament(fine, w, h, d, s, cells, { crown = true, eave = true } = {}) {
  const z = d / 2, cusps = [], br = [];
  for (const [cx, sill, aw, ah] of cells) {
    if (sill > 1) continue;
    const r = aw / 2, sp = ah - 1.4 * r, pts = archCurve(r, sp, true, 12);
    for (let k = 2; k < pts.length - 2; k += 2) {
      const p = pts[k];
      cusps.push([cx + p.x * 0.9, sill + sp + (p.y - sp) * 0.92, z + 0.04, Math.atan2(p.y - sp, p.x) - Math.PI / 2]);
    }
  }
  const cuspM = new THREE.InstancedMesh(new THREE.TorusGeometry(0.16, 0.05, 4, 8, Math.PI), DARK, cusps.length), o = new THREE.Object3D();
  cusps.forEach(([x, y, zz, a], i) => { o.position.set(x, y, zz); o.rotation.set(0, 0, a); o.updateMatrix(); cuspM.setMatrixAt(i, o.matrix); });
  fine.add(cuspM);
  for (const y of eave ? [5.8 * s, h - 0.1] : [h - 0.1]) {
    fine.add(at(chhajja(w, 1.1, 0.35, 0.12, DARK), 0, y, z));
    for (let x = -w / 2 + 1; x <= w / 2 - 1; x += 2.2) br.push([x, y - 0.18, z]);
  }
  fine.add(placeAll(bracketGeo(0.9, 0.9, 0.22), br, DARK));
  const n = Math.max(2, Math.round(w / 4.4));
  if (crown) for (let k = 1; k < n; k += 3) fine.add(at(jharokha(1.9, 2.6, STONE, { d: 0.9, trim: DARK, roof: 'bangla' }), -w / 2 + (k + 0.5) * (w / n), 7.4 * s, z + 0.02));
  // Every window between two colonnettes with a base and a cap, under a moulded hood; an engaged
  // column on each pier of the ground arcade with a roundel over it; a course of small brackets
  // under the balcony and under the cornice; a pierced railing along the loggia's balcony; and urns
  // along the parapet.
  const jamb = [], blocks = [], piers = [], rounds = [], urns = [], hoods = new Map(), pitch = w / n;
  for (const [cx, sill, aw, ah] of cells) {
    if (sill <= 1) continue;
    for (const k of [-1, 1]) {
      const x = cx + k * (aw / 2 + 0.18);
      jamb.push([x, sill, z + 0.1, 0.17, ah * 0.6, 0.17]);
      blocks.push([x, sill + ah * 0.6, z + 0.1, 0.3, 0.14, 0.3], [x, sill - 0.13, z + 0.1, 0.3, 0.13, 0.3]);
    }
    const key = `${aw}:${ah}`;
    if (!hoods.has(key)) hoods.set(key, { geo: archRing(aw, ah, true, 0.15, 0.1, DARK).geometry, list: [] });
    hoods.get(key).list.push([cx, sill, z + 0.03, 0]);
  }
  for (let k = 0; k <= n; k++) {
    const x = -w / 2 + k * pitch;
    piers.push([x, 0.5, z + 0.14, 0.44, 3.1 * s, 0.44]);
    blocks.push([x, 0.5 + 3.1 * s, z + 0.14, 0.62, 0.2, 0.62], [x, 0.5, z + 0.14, 0.6, 0.22, 0.6]);
    rounds.push([x, 0.5 + 4.25 * s, z + 0.05, 1, 1, 1]);
  }
  for (const y of [11.8 * s - 1.05, h - 0.45]) for (let x = -w / 2 + 0.3; x < w / 2; x += 0.62) blocks.push([x, y, z + 0.2, 0.2, 0.36, 0.4]);
  if (crown) for (let x = -w / 2 + pitch / 2; x < w / 2; x += pitch) urns.push([x, h + 0.8, z - 0.15, 1, 1, 1]);
  const urnGeo = new THREE.LatheGeometry([[0, 0], [0.2, 0], [0.2, 0.08], [0.09, 0.16], [0.11, 0.26], [0.26, 0.5], [0.28, 0.66], [0.2, 0.86], [0.09, 0.94], [0.12, 1.02], [0.05, 1.18], [0, 1.26]].map(([r, y]) => new THREE.Vector2(r, y)), 10);
  fine.add(inst(unitCyl(8), jamb, DARK), inst(unitCyl(10), piers, STONE), inst(unitBox(), blocks, DARK), inst(urnGeo, urns, DARK));
  fine.add(inst(new THREE.TorusGeometry(0.34, 0.09, 5, 12), rounds, DARK), inst(new THREE.CircleGeometry(0.26, 10), rounds.map(([x, y, zz]) => [x, y, zz + 0.02, 1, 1, 1]), PINK));
  for (const { geo, list } of hoods.values()) fine.add(placeAll(geo, list, DARK));
  if (!crown) return;
  fine.add(at(railing(w, 0.9, 0.14, STONE, 2.2), 0, 11.8 * s + 0.6, z + 1.35));
  const m = Math.max(1, Math.round(w / 13));
  for (let k = 0; k < m; k++) fine.add(at(mughalChhatri(0.85, 3.6, STONE, { domeM: DOME, finialM: DARK, crescent: false }), -w / 2 + (k + 0.5) * (w / m), h + 0.8, z - 1.4));
}

// Small round turret with a dome, r in radius, its shaft h high.
function turret(r, h) {
  const g = new THREE.Group();
  g.add(cyl(r, r * 1.05, h, STONE, 0, 0, 0, 8), cyl(r * 1.25, r * 1.25, 0.5, DARK, 0, h - 0.5, 0, 8));
  // On desktops the shaft is banded at each storey and its cap carried on a ring of brackets.
  if (!detail.low) {
    for (const y of [6, 11.8, h - 3]) if (y < h - 1) g.add(cyl(r * 1.1, r * 1.1, 0.3, DARK, 0, y, 0, 8));
    g.add(placeAll(bracketGeo(0.6, r * 0.32, 0.16), Array.from({ length: 8 }, (_, k) => { const a = (k / 8) * Math.PI * 2 + Math.PI / 8; return [Math.sin(a) * r * 0.98, h - 0.5, Math.cos(a) * r * 0.98, a]; }), DARK));
  }
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
// (Set out from a photograph square to the front: the palace is about 155 m long, the Durbar Hall
// at its west end and the zenana pavilion at its east, with no lower ranges beyond them.)
export const TOWER = [-27, 1], DURBAR = [-60, -4], EAST = [56, -4], CENTRE = { w: 30, front: 6, h: 19, bay: 12, bayH: 24 };
export function buildLaxmiVilas() {
  const g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  g.add(box(420, 0.15, 320, M.grass, 0, 0, 40), box(10, 0.25, 140, M.path, 0, 0, 80), box(80, 0.22, 14, M.path, 0, 0, 14));
  // The wings between the pavilions, and the lower ranges beyond them.
  f.add(at(wing(36, 18, 18), -33, 0, -4), at(wing(21, 18, 18), 25.5, 0, -4));
  // The low end of the west front beyond the Durbar Hall, under a small dome.
  f.add(at(wing(8, 13, 14), -73, 0, -6), at(domeOnDrum(2.2, 2, { ribs: 12 }), -73, 13.8, -6));
  // Wings running back from the ends, round the courts.
  f.add(at(wing(60, 15, 16), -68, 0, -43.9).rotateY(Math.PI / 2), at(wing(60, 15, 16), 68, 0, -43.9).rotateY(-Math.PI / 2));
  // A domed kiosk on the west wing, between the tower and the Durbar Hall.
  f.add(at(domeOnDrum(2.6, 2.4, { ribs: 12 }), -44, 18.8, -6));

  // The entrance block: two side bays under curved gables, the middle bay rising higher to the
  // great dome; turrets with small domes at its corners.
  const C = new THREE.Group(), { w, front, h, bay, bayH } = CENTRE, cd = 30, cz = front - cd / 2, side = (w - bay) / 2;
  const cells = (len, n, ground) => Array.from({ length: n }, (_, k) => { const x = -len / 2 + (k + 0.5) * (len / n); return [[x, 0.5, 2.6, 4.6, ground], [x, 6.8, 1.6, 3.4, 'jali'], [x, 12.4, 2.2, 3.9, 'room']]; }).flat();
  for (const s of [-1, 1]) {
    const x = s * (bay / 2 + side / 2);
    C.add(box(side, h, cd - 3.2, STONE, x, 0, cz - 1.6), at(arcadeSkin(side, h, cells(side, 2, 'room'), 1.6, STONE, { trim: DARK }), x, 0, front - 1.6));
    C.add(box(side + 0.6, 0.8, cd + 0.6, DARK, x, h, cz), at(archHood(side - 0.6, 6.6, 1.2), x, h + 0.8, front - 0.4));
    if (!detail.low) C.add(at(hoodBand(side - 0.6, 6.6), x, h + 0.8, front - 0.4), at(hoodPinnacles(side - 0.6, 6.6, 6, 0.42), x, h + 0.8, front - 0.4), at(railing(side - 3, 0.8, 0.14, STONE, 1.4), x, h + 0.8, front + 0.5));
    // Behind each gable a dome on a drum.
    C.add(at(domeOnDrum(2.8, 2.2, { ribs: 12 }), x, h + 0.8, front - 6));
  }
  C.add(box(bay, bayH, cd - 3.2, STONE, 0, 0, cz - 1.6), at(arcadeSkin(bay, bayH, [[0, 9, 4, 5.2, 'room'], [-3.4, 15.5, 1.8, 3.6, 'jali'], [0, 15.5, 2.2, 4.4, 'room'], [3.4, 15.5, 1.8, 3.6, 'jali']], 1.6, STONE, { trim: DARK }), 0, 0, front - 1.6));
  for (const y of [6, 11.8]) C.add(box(w + 0.4, 0.6, 0.8, DARK, 0, y, front));
  C.add(box(bay + 0.6, 0.9, cd + 0.6, DARK, 0, bayH, cz), at(archHood(bay - 2, 4.6, 1.2), 0, bayH + 0.9, front - 0.4), box(bay - 1, 1.6, 0.25, PINK, 0, 20.6, front + 0.05));
  for (const s of [-1, 1]) for (const z of [front - 0.6, cz - cd / 2 + 1]) C.add(at(turret(1.1, bayH + 1), s * (w / 2 - 0.4), 0, z));
  for (const s of [-1, 1]) C.add(at(turret(0.8, bayH + 0.8), s * (bay / 2), 0, front + 0.3));
  // The great dome over the middle bay, on its drum ringed by eight small domed kiosks.
  // (After the photograph: the drum is tall, in two stages. Round the lower stand eight domed
  // kiosks on a ledge, each before an arched opening; the dome springs above their roofs, and ends
  // in a tall finial of stacked discs.)
  const gy = bayH + 0.9, gz = cz + 3, great = domeOnDrum(6.6, 9.2, { fin: 2 });
  C.add(at(great, 0, gy, gz), cyl(8.6, 8.6, 0.5, DARK, 0, gy + 2.6, gz, 8).rotateY(Math.PI / 8), cyl(7.2, 7.2, 0.45, DARK, 0, gy + 7.4, gz, 8).rotateY(Math.PI / 8));
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * Math.PI * 2 + Math.PI / 8;
    C.add(at(mughalChhatri(1.15, 4.4, STONE, { domeM: DOME, finialM: DARK, crescent: false }), Math.sin(a) * 7.4, gy + 3.1, gz + Math.cos(a) * 7.4));
  }
  const tip = gy + 9.2 + 6.6 * 1.56;
  for (const [r, y] of [[0.9, 0], [0.65, 0.5], [0.42, 1.0]]) C.add(cyl(r * 0.8, r, 0.4, DARK, 0, tip + y, gz, 12));
  C.add(cyl(0.05, 0.12, 2.6, DARK, 0, tip + 1.4, gz, 6));
  // The entrance block's own carving, on desktops: the same colonnettes, hoods, pier columns and
  // bracket courses as the wings, without their parapet kiosks (the gables stand there).
  if (!detail.low) {
    for (const sg of [-1, 1]) { const o = at(new THREE.Group(), sg * (bay / 2 + side / 2), 0, 0); ornament(o, side, h, 2 * front, 1, cells(side, 2, 'room'), { crown: false }); C.add(mergeByMaterial(o)); }
    const o = new THREE.Group();
    ornament(o, bay, bayH, 2 * front, 1, [[0, 9, 4, 5.2, 'room'], [-3.4, 15.5, 1.8, 3.6, 'jali'], [0, 15.5, 2.2, 4.4, 'room'], [3.4, 15.5, 1.8, 3.6, 'jali']], { crown: false, eave: false });
    C.add(mergeByMaterial(o));
  }
  // The porch: a porte-cochère of three arches before the door.
  C.add(at(porch(12, 5, 7, { m: STONE, trim: DARK, colM: STONE, cols: 4, r: 0.6, top: 'balustrade', stepsDown: 0.5 }), 0, 0.5, front));
  f.add(C);

  // The tower: square and banded, 8.5 m, rising to 46 m (60 m to the top of its finial), well above the great dome; a corbelled balcony, then an arcaded
  // octagonal lantern under a dome, with a kiosk at each corner of the balcony.
  const T = new THREE.Group(), tw = 8.5, th = 46;
  T.add(box(tw, th, tw, STONE));
  for (const y of [6, 11.8, 18, 24, 30, 36, 42]) T.add(box(tw + 0.5, 0.6, tw + 0.5, DARK, 0, y));
  T.add(box(tw + 2.2, 1, tw + 2.2, DARK, 0, th), box(tw + 0.4, 0.8, tw + 0.4, PINK, 0, th - 2));
  // The top, after the photograph: a narrower square stage with three slits to a face, then an
  // open octagonal pavilion of eight columns under a broad eave, a drum and the dome.
  const s2 = tw - 2.6;
  T.add(box(s2, 3.4, s2, STONE, 0, th + 1, 0), box(s2 + 0.9, 0.5, s2 + 0.9, DARK, 0, th + 4.4, 0));
  for (const a of FACES) for (const k of [-1.2, 0, 1.2]) T.add(onFace(box(0.45, 1.5, 0.06, M.recess, 0, th + 2, 0), a, s2 / 2 + 0.02, k));
  for (let k = 0; k < 8; k++) { const a = (k / 8) * Math.PI * 2 + Math.PI / 8; T.add(cyl(0.2, 0.24, 3.6, STONE, Math.sin(a) * 2.5, th + 4.9, Math.cos(a) * 2.5, 8)); }
  T.add(cyl(1.5, 1.5, 3.6, M.recess, 0, th + 4.9, 0, 8), cyl(3.7, 3.1, 0.35, DARK, 0, th + 8.5, 0, 8), cyl(2.5, 2.6, 1.0, STONE, 0, th + 8.85, 0, 8));
  T.add(at(lvDome(2.6, DOME, 12), 0, th + 9.85, 0), at(finial(2.2, DARK), 0, th + 9.85 + 3.9, 0));
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) T.add(at(mughalChhatri(1.1, 4.4, STONE, { domeM: DOME, finialM: DARK, crescent: false }), sx * (tw / 2 + 0.2), th + 1, sz * (tw / 2 + 0.2)));
  // On desktops: an octagonal shaft up each corner, a course of small brackets under every band,
  // and the balcony at the top carried on a row of carved brackets.
  if (!detail.low) {
    const td = [];
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) T.add(cyl(0.5, 0.55, th, DARK, sx * tw / 2, 0, sz * tw / 2, 8));
    for (const a of FACES) {
      for (const y of [6, 11.8, 18, 24, 30, 36, 42]) for (const [x, yy, z, ry] of alongFace(a, tw / 2 + 0.16, tw - 1.2, 12, y - 0.38)) td.push([x, yy, z, 0.2, 0.38, 0.36, ry]);
      T.add(placeAll(bracketGeo(1.5, 1.1, 0.3), alongFace(a, tw / 2 + 0.02, tw - 0.8, 7, th), DARK));
      T.add(onFace(at(railing(tw + 2, 0.9, 0.14, STONE, 1.6), 0, th + 1, 0), a, tw / 2 + 1));
    }
    T.add(inst(unitBox(), td, DARK));
  }
  f.add(at(T, TOWER[0], 0, TOWER[1]));

  // The Durbar Hall at the west end: a tall block under the biggest dome, on a drum, with domed
  // turrets at its corners.
  const D = new THREE.Group();
  D.add(at(wing(18, 20, 30), 0, 0, 0));
  D.add(at(domeOnDrum(6, 3.4, { fin: 3 }), 0, 20.8, 0));
  // Either side of its front a square tower carrying an open belvedere under a dome, as tall as
  // the hall's own drum; plain turrets at the back.
  for (const sx of [-1, 1]) D.add(at(belvedere(3.4, 21.5), sx * 10.6, 0, 13.4), at(turret(1.2, 21.5), sx * 9, 0, -15));
  if (!detail.low) for (let k = 0; k < 4; k++) { const a = (k / 4) * Math.PI * 2 + Math.PI / 4; D.add(at(mughalChhatri(0.9, 3.4, STONE, { domeM: DOME, finialM: DARK, crescent: false }), Math.sin(a) * 7.3, 20.8, Math.cos(a) * 7.3)); }
  f.add(at(D, DURBAR[0], 0, DURBAR[1]));

  // The east pavilion, 40 m of the front: a middle block under one great curved gable (a
  // bangla arch as broad as the block, a deep arched window in it) with the dome behind; and a
  // bay either side under its own dome, a domed turret at each corner.
  const E = new THREE.Group();
  E.add(at(wing(22, 19, 30), 0, 0, 0), at(archHood(20, 8.5, 1.2), 0, 19.8, 15.2));
  E.add(at(domeOnDrum(5.2, 2.8, { fin: 2.4 }), 0, 19.8, -6));
  // Each side bay under a curved gable of its own, its dome behind; between the bays and the
  // middle a slender spire, tiered like a temple's; and the gables' rims bristling with pinnacles
  // round surrounds of pink stone.
  for (const sx of [-1, 1]) {
    E.add(at(wing(9, 17, 26), sx * 15.5, 0, -1), at(archHood(8.4, 5, 1), sx * 15.5, 17.8, 12.2), at(domeOnDrum(3, 2.6, { ribs: 12, fin: 1.6 }), sx * 15.5, 17.8, 4));
    for (let k = 0; k < 5; k++) E.add(cyl(0.95 - k * 0.17, 1.1 - k * 0.17, 1.1, STONE, sx * 11, 21 + k * 1.1, 13, 8));
    E.add(cyl(0.04, 0.1, 1.4, DARK, sx * 11, 26.5, 13, 6));
    if (!detail.low) E.add(at(hoodBand(8.4, 5, 0.4), sx * 15.5, 17.8, 12.2), at(hoodPinnacles(8.4, 5, 5, 0.4), sx * 15.5, 17.8, 12.2));
  }
  if (!detail.low) E.add(at(hoodBand(20, 8.5, 0.8), 0, 19.8, 15.2), at(hoodPinnacles(20, 8.5, 12, 0.55), 0, 19.8, 15.2));
  for (const [x, z] of [[-20, 12], [20, 12], [-11, -15], [11, -15]]) E.add(at(turret(1.1, Math.abs(x) > 12 ? 19 : 21), x, 0, z));
  f.add(at(E, EAST[0], 0, EAST[1]));

  addDetails(f, g);
  // The home view matches the best-known photograph: the front straight on from the lawn.
  return { group: g, focus: f, view: [-0.08, 0.06, 1], zoom: 0.4, target: [-4, 20, 0] };
}

import * as THREE from 'three';
import { mat, mesh, box, cyl, at, photo, finial, surface, FACES } from '../helpers.js';
import { mergeByMaterial, gableRoof, railing, clockFace, louvredShutter } from '../parts/components.js';
import { gothicDoor, gothicWindow, gothicTurret, oculus } from '../parts/colonial.js';
import { gothicPinnacle } from '../parts/sculpture.js';
import { addDetails } from '../details/st-pauls-cathedral-kolkata.js';

// St Paul's, Calcutta: William Nairn Forbes's cathedral of 1847, in stuccoed brick kept a brilliant
// white, under low roofs of grey slate hidden behind battlemented parapets. From photographs of the
// two long sides (Wikimedia Commons: St. Paul's Cathedral in Kolkata.jpg, St Paul's Cathedral.jpg),
// measured against the 75 m length: the walls stand about 14 m to the parapet and the tower, rebuilt
// after 1934 on the lines of Canterbury's Bell Harry, about 38 m to the tips of its pinnacles (the
// 61 m often quoted was the spire that fell).
export const WALL = photo(mat('#f8f7f3', 0.84), 'plaster');
export const TRIM = mat('#e3e1db', 0.84);
export const SLATE = mat('#6b6966', 0.8);
const LOUVRE = surface(mat('#c9cdc8', 0.8), 'none'), POLE = mat('#3a3d40', 0.5, 0.3);

// The cathedral's measures, shared with js/details/st-pauls-cathedral-kolkata.js. The west front
// faces +z at z = FZ; the church runs back 75 m. The hall is NW wide (buttresses outside that) and
// its walls WH high to the parapet. The transept, TD along the church and TW across (it barely
// projects), crosses near the west end at z = CZ, with one bay and the vestibule, VD deep, to the
// west of it and eight bays of hall to the east. Over the crossing stands the tower, T square: its
// shaft rises to TH, its corner turrets to TT, and their pinnacles to about 38 m.
export const S = { FZ: 37, LEN: 75, NW: 21, WH: 13, CZ: 14.3, TW: 24, TD: 20, VD: 6, T: 9, TH: 31.5, TT: 32.5, BAYS: 8 };

// A battlemented, pierced parapet len long along x, standing on y = 0.
function battlement(len) {
  const g = new THREE.Group(), n = Math.max(1, Math.round(len / 1.7));
  g.add(railing(len, 0.9, 0.3, WALL, 1.7), box(len + 0.2, 0.2, 0.5, TRIM, 0, -0.2, 0));
  for (let k = 0; k < n; k++) g.add(box(len / n * 0.5, 0.55, 0.3, WALL, -len / 2 + (k + 0.5) * (len / n), 0.9, 0));
  return g;
}

// The ogee hood-mould over a pointed window w × h: it follows the arch, then sweeps up in a reverse
// curve to a finial.
function ogeeHood(w, h, depth) {
  const g = new THREE.Group(), R = w * 0.67 + 0.12, sp = h - 0.7 * w, top = h + R * 0.95, b = 0.2, sh = new THREE.Shape();
  sh.moveTo(-R, sp); sh.bezierCurveTo(-R, sp + R, -R * 0.25, h + 0.25, 0, top); sh.bezierCurveTo(R * 0.25, h + 0.25, R, sp + R, R, sp);
  sh.lineTo(R - b, sp); sh.bezierCurveTo(R - b, sp + R - b, R * 0.25 - b * 0.6, h + 0.25 - b, 0, top - b * 2.6);
  sh.bezierCurveTo(-R * 0.25 + b * 0.6, h + 0.25 - b, -R + b, sp + R - b, -R + b, sp);
  sh.closePath();
  g.add(mesh(new THREE.ExtrudeGeometry(sh, { depth: depth + 0.1, bevelEnabled: false, curveSegments: 8 }), TRIM), at(finial(1.0, TRIM), 0, top - 0.15, depth));
  return g;
}

// One bay of the long walls, facing +z from the wall's face: a tall two-light window under its
// ogee hood, and under it a rectangular opening closed by louvres.
function bay(w = 2.3) {
  const g = new THREE.Group();
  g.add(at(gothicWindow(w, 6.2, { m: WALL, trim: TRIM, depth: 0.3 }), 0, 5.3, 0), at(ogeeHood(w, 6.2, 0.3), 0, 5.3, 0));
  g.add(box(w * 0.8 + 0.5, 3.1, 0.2, TRIM, 0, 1.0, 0.1), at(louvredShutter(w * 0.8, 2.6, LOUVRE, { out: 0.22 }), 0, 1.25, 0));
  return g;
}

// A buttress against a wall facing +z, stepped twice, with a crocketed pinnacle above the parapet.
function buttress(h, ph = 4) {
  const g = new THREE.Group();
  g.add(box(1.2, h * 0.5, 1.5, WALL, 0, 0, 0.75), box(1.2, h * 0.5 + 0.9, 1.0, WALL, 0, h * 0.5, 0.5), box(1.4, 0.3, 1.7, TRIM, 0, h * 0.5, 0.8));
  g.add(at(gableRoof(1.2, 0.5, 0.6, WALL), 0, h * 0.5 + 0.3, 1.25), at(gothicPinnacle(ph, WALL), 0, h + 0.9, 0.4));
  return g;
}

// The small porch on a long side, facing +z: a gabled front with a doorway and a cross, between low
// battlemented wings (wl and wr long).
function sidePorch(wl, wr) {
  const g = new THREE.Group();
  g.add(box(4.4, 4.6, 3.6, WALL, 0, 0, 1.8), at(gableRoof(4.4, 3.6, 1.9, WALL), 0, 4.6, 1.8), box(4.7, 0.25, 3.8, TRIM, 0, 4.5, 1.9));
  g.add(at(gothicDoor(1.6, 3.2, { m: WALL, trim: TRIM, orders: 2, gable: false, pinnacles: false }), 0, 0, 3.6));
  g.add(box(0.2, 1.3, 0.2, TRIM, 0, 6.5, 3.4), box(0.8, 0.2, 0.2, TRIM, 0, 7.2, 3.4));
  for (const s of [-1, 1]) g.add(at(gothicPinnacle(2.2, WALL), s * 2.2, 4.6, 3.4));
  [[-1, wl], [1, wr]].forEach(([s, len]) => {
    g.add(box(len, 3.8, 2.4, WALL, s * (2.2 + len / 2), 0, 1.2), at(battlement(len), s * (2.2 + len / 2), 4.0, 2.25));
    for (let x = 1.6; x < len; x += 2.6) g.add(at(gothicWindow(0.8, 2, { m: WALL, trim: TRIM, depth: 0.15 }), s * (2.2 + x), 1.1, 2.4));
  });
  return g;
}

export function buildStPaulsCathedralKolkata() {
  const g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  const { FZ, LEN, NW, WH, CZ, TW, TD, VD, T, TH, TT, BAYS } = S, BZ = FZ - LEN, WZ = FZ - VD, hz = (BZ + WZ) / 2, hl = WZ - BZ;
  const ez = CZ - TD / 2, bl = (ez - BZ) / BAYS, wz = CZ + TD / 2, tr = new THREE.Group();
  // The hall and the transept, each under a low slate roof behind its parapet.
  tr.add(box(NW, WH, hl, WALL, 0, 0, hz), at(gableRoof(NW - 1.2, hl - 1, 3.4, SLATE), 0, WH - 0.2, hz));
  tr.add(box(TW, WH, TD, WALL, 0, 0, CZ), at(gableRoof(TD - 1.2, TW - 1.2, 4.6, SLATE, { axis: 'x' }), 0, WH - 0.2, CZ));
  const side = (o, s, z) => { o.position.set(s * (o.userData.x ?? NW / 2), o.position.y, z); o.rotation.y = s * Math.PI / 2; tr.add(o); };
  for (const s of [-1, 1]) {
    // Eight bays east of the transept and one west of it: a buttress with a pinnacle between each
    // pair of windows, and the battlemented parapet along the wall head.
    for (let k = 0; k < BAYS; k++) { side(bay(), s, ez - (k + 0.5) * bl); side(buttress(WH), s, ez - (k + 1) * bl + (k === BAYS - 1 ? 0.6 : 0)); }
    side(bay(), s, (wz + WZ) / 2);
    side(at(battlement(ez - BZ), 0, WH + 0.2, 0), s, (ez + BZ) / 2);
    side(at(battlement(WZ - wz), 0, WH + 0.2, 0), s, (wz + WZ) / 2);
    // The transept's face under the tower: three bays between buttresses, the middle one a doorway
    // under a taller window; above, a gable with battlements up its rakes and a great traceried
    // roundel in it.
    const X = { x: TW / 2 }, gh = 5.4;
    for (const e of [-1, 0, 1]) side(Object.assign(e ? bay() : at(gothicWindow(2.8, 6.6, { m: WALL, trim: TRIM, depth: 0.35 }), 0, 4.4, 0), { userData: X }), s, CZ + e * 6.2);
    side(Object.assign(at(ogeeHood(2.8, 6.6, 0.35), 0, 4.4, 0), { userData: X }), s, CZ);
    side(Object.assign(gothicDoor(1.8, 3.2, { m: WALL, trim: TRIM, orders: 2, gable: false, pinnacles: false, stepsDown: 0 }), { userData: X }), s, CZ);
    for (const e of [-1.5, -0.5, 0.5, 1.5]) side(Object.assign(buttress(WH, Math.abs(e) > 1 ? 5.4 : 4), { userData: X }), s, CZ + e * 6.2 + Math.sign(e) * (Math.abs(e) > 1 ? 0.1 : 0));
    tr.add(at(gableRoof(TD, 0.8, gh, WALL, { axis: 'x' }), s * (TW / 2 - 0.4), WH, CZ), box(0.9, 0.3, TD + 0.3, TRIM, s * (TW / 2 - 0.35), WH - 0.1, CZ));
    tr.add(at(oculus(1.7, { m: WALL, trim: TRIM, depth: 0.3 }), s * TW / 2, WH + 0.5, CZ).rotateY(s * Math.PI / 2));
    for (let t = 0.06; t < 0.97; t += 0.075) for (const e of [-1, 1]) tr.add(box(0.5, 0.75, 0.7, WALL, s * (TW / 2 - 0.4), WH + gh * t - 0.1, CZ + e * (TD / 2) * (1 - t)));
    tr.add(at(gothicPinnacle(3, WALL), s * (TW / 2 - 0.4), WH + gh - 0.2, CZ));
    // The transept's short returns.
    for (const z of [ez, wz]) tr.add(at(battlement((TW - NW) / 2), s * (NW / 2 + (TW - NW) / 4), WH + 0.2, z));
  }
  // The small porches on the long sides, each with its low battlemented wings.
  side(sidePorch(5, 3.5), -1, ez - 6.5 * bl);
  side(sidePorch(9, 4), 1, ez - 4.5 * bl);
  // The east end: the window over the altar under its hood, and turrets at the corners.
  tr.add(at(gothicWindow(4.6, 8, { m: WALL, trim: TRIM, depth: 0.4 }), 0, 3.6, BZ).rotateY(Math.PI), at(ogeeHood(4.6, 8, 0.4), 0, 3.6, BZ).rotateY(Math.PI), at(battlement(NW - 2.4), 0, WH + 0.2, BZ + 0.2));
  for (const s of [-1, 1]) tr.add(at(gothicTurret(1.2, WH + 2, WALL, TRIM, 4.6), s * (NW / 2 + 0.1), 0, BZ));
  // The west end: a gabled screen between two octagonal turrets, the west window (the Burne-Jones
  // glass) in it, and before it the vestibule that carries the library over the west door.
  tr.add(box(NW + 1, WH + 1.5, 1.2, WALL, 0, 0, WZ), at(gableRoof(NW + 1, 1.2, 5, WALL), 0, WH + 1.5, WZ), box(NW + 1.4, 0.3, 1.5, TRIM, 0, WH + 1.5, WZ));
  for (const s of [-1, 1]) tr.add(at(gothicTurret(1.5, WH + 6, WALL, TRIM, 5), s * (NW / 2 + 0.9), 0, WZ + 0.2));
  tr.add(box(0.3, 2.2, 0.3, TRIM, 0, WH + 6.5, WZ), box(1.3, 0.3, 0.3, TRIM, 0, WH + 7.8, WZ), at(gothicWindow(4.6, 5.6, { m: WALL, trim: TRIM, depth: 0.35 }), 0, 11.9, WZ + 0.6));
  const VW = 19, VH = 11;
  tr.add(box(VW, VH, VD, WALL, 0, 0, FZ - VD / 2), box(VW + 0.4, 0.3, VD + 0.2, TRIM, 0, VH - 0.3, FZ - VD / 2 + 0.1), at(battlement(VW), 0, VH + 0.2, FZ - 0.2));
  tr.add(at(gothicDoor(3, 5.4, { m: WALL, trim: TRIM, orders: 3, gable: false, pinnacles: false }), 0, 0, FZ), at(gothicWindow(3.2, 3.6, { m: WALL, trim: TRIM, depth: 0.3 }), 0, 6.7, FZ));
  for (const s of [-1, 1]) {
    tr.add(at(gothicTurret(0.8, VH + 0.6, WALL, TRIM, 3.2), s * VW / 2, 0, FZ), at(gothicWindow(1.8, 5, { m: WALL, trim: TRIM, depth: 0.25 }), s * 5.6, 3.6, FZ), at(buttress(VH - 0.9, 3), s * 2.9, 0, FZ));
    tr.add(at(battlement(VD - 1), s * (VW / 2 - 0.2), VH + 0.2, FZ - VD / 2).rotateY(Math.PI / 2), at(gothicWindow(1.8, 5, { m: WALL, trim: TRIM, depth: 0.25 }), s * VW / 2, 3.6, FZ - VD / 2).rotateY(s * Math.PI / 2));
  }
  // The tower over the crossing, after Canterbury's Bell Harry: a square shaft between octagonal
  // corner turrets, a stage of two-light windows above the roofs and a taller stage of paired
  // lancets with a clock face between them on every side, a battlemented parapet, the turrets
  // carried up to crocketed pinnacles with flagstaffs, and a tall mast in the middle.
  tr.add(box(T, TH, T, WALL, 0, 0, CZ));
  for (const y of [WH + 2.4, 21.4, TH - 0.4]) tr.add(box(T + 0.4, 0.35, T + 0.4, TRIM, 0, y, CZ));
  const low = gothicWindow(1.5, 3.6, { m: WALL, trim: TRIM, depth: 0.25 }), lan = gothicWindow(1.5, 7.4, { m: WALL, trim: TRIM, depth: 0.3, sill: false });
  for (const a of FACES) {
    const o = new THREE.Group();
    for (const s of [-1, 1]) o.add(at(low.clone(), s * 1.7, 17.3, 0), at(lan.clone(), s * 2.1, 22.4, 0), at(ogeeHood(1.5, 7.4, 0.3), s * 2.1, 22.4, 0));
    o.add(at(clockFace(1.0), 0, 26.4, 0.1), at(battlement(T - 2), 0, TH + 0.2, -0.2));
    o.position.set(Math.sin(a) * T / 2, 0, CZ + Math.cos(a) * T / 2);
    o.rotation.y = a;
    tr.add(o);
  }
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    const x = sx * T / 2, z = CZ + sz * T / 2;
    tr.add(at(gothicTurret(1.1, TT, WALL, TRIM, 5), x, 0, z), cyl(0.04, 0.04, 2.2, POLE, x, TT + 5.3, z, 6), box(0.6, 0.4, 0.03, POLE, x + 0.34, TT + 7, z));
  }
  tr.add(cyl(0.07, 0.1, 10, POLE, 0, TH, CZ, 6));
  f.add(mergeByMaterial(tr));
  addDetails(f, g);
  // From the north-west, across the lawns: the long north side, the transept under the tower and
  // the west end.
  return { group: g, focus: f, view: [-1, 0.22, 0.6], zoom: 0.85 };
}

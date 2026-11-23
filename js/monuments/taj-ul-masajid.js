import * as THREE from 'three';
import { M, flat, box, cyl, at, lathe, onionDome, finial, archPanel } from '../helpers.js';
import { iwan, arcadeSkin, cellRow } from '../parts/mughal.js';
import { mughalChhatri, cuspedArchGeo, placeAll, archRing, chhajjaRing, petalRing, medallion, panel, railing, bracketGeo, mergeByMaterial } from '../parts/components.js';
import { addDetails, PINK, PINK_LIGHT, SHADE, P } from '../details/taj-ul-masajid.js';

// Taj-ul-Masajid, Bhopal: the pink mosque begun under Shah Jahan Begum and finished in 1985. From
// photographs: a vast square court raised on a high plinth and ringed by low cloisters, with a tall
// gateway in the middle of its east side at the head of a great fan of steps; across the court, the
// prayer hall's long pink front: a tall frontispiece in the middle with a great cusped arch, a
// white marble spandrel and a slender turret at each corner, and either side of it three cusped
// arches between two narrow bays that hold a small door under a window; a row of little windows
// under the parapet; three white marble onion domes over the hall; and at its two ends the
// eighteen-storey octagonal minarets, pink, broad at the foot, banded by four balconies and capped
// by an open kiosk under a white dome. Through the arches, massive pillars carry the ceiling's 27
// bays (nine across, three deep) before a qibla wall of eleven arches. Faces east (+z); the court
// is about 99 m square, the minarets about 67 m high.
const MARBLE = M.marble, HW = 82, HD = 28, HH = 14.5, HEAD = 10.3, T = 2;
// The front's openings either side of the frontispiece, as distances from the middle: the three
// cusped arches, 5.4 m wide, and the two narrow bays.
const ARCHES = [18.5, 25.8, 33.1], NARROW = [13.6, 38.4], AW = 5.4;

// An octagonal minaret h high to the top of its dome: four tapering stages, each with rows of small
// arched windows on every face (eighteen storeys with the kiosk), a corbelled balcony at the head
// of each, then an open kiosk of eight arches, an eave and the marble dome.
function tower(h) {
  const g = new THREE.Group(), L = [0, 17.2, 28.6, 42, 55.6].map((y) => (y * h) / 67), R = [6.15, 5.75, 5.45, 5.15, 4.9];
  const rows = [5, 4, 4, 4], c8 = Math.cos(Math.PI / 8), win = archPanel(0.85, 1.7, true, M.recess, 0.06).geometry, list = [];
  g.add(cyl(R[0] * 1.06, R[0] * 1.08, 1.2, PINK_LIGHT, 0, 0, 0, 8));
  for (let i = 0; i < 4; i++) {
    const y0 = L[i], hh = L[i + 1] - L[i];
    g.add(cyl(R[i + 1], R[i], hh, PINK, 0, y0, 0, 8));
    // The balcony: a corbel in two courses, its floor and a low parapet.
    g.add(cyl(R[i + 1] * 1.12, R[i + 1], 0.8, PINK, 0, y0 + hh - 1.5, 0, 8), cyl(R[i + 1] * 1.22, R[i + 1] * 1.12, 0.7, PINK_LIGHT, 0, y0 + hh - 0.7, 0, 8));
    g.add(cyl(R[i + 1] * 1.22, R[i + 1] * 1.22, 1.1, PINK, 0, y0 + hh, 0, 8), cyl(R[i + 1] * 1.25, R[i + 1] * 1.25, 0.2, PINK_LIGHT, 0, y0 + hh + 1.1, 0, 8));
    for (let j = 0; j < rows[i]; j++) {
      const y = y0 + 1.6 + (j + 0.25) * ((hh - 3.4) / rows[i]), r = (R[i] + (R[i + 1] - R[i]) * ((y - y0) / hh)) * c8 - 0.02;
      for (let k = 0; k < 8; k++) { const a = (k / 8) * Math.PI * 2 + Math.PI / 8; list.push([Math.sin(a) * r, y, Math.cos(a) * r, a]); }
    }
  }
  g.add(placeAll(win, list, M.recess));
  // A blind arch on each face of the foot.
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * Math.PI * 2 + Math.PI / 8, r = R[0] * c8 + 0.01, rg = archRing(2.6, 5.6, true, 0.25, 0.1, PINK_LIGHT);
    rg.position.set(Math.sin(a) * r, 1.4, Math.cos(a) * r);
    rg.rotation.y = a;
    g.add(rg);
  }
  // The kiosk: eight piers and arches round a core, under an eave; then the drum and the dome.
  const ky = L[4] + 1.1, kr = R[4] * 0.9, dr = 3.9, kh = h - dr * 1.85 - 1 - ky;
  g.add(cyl(kr * 0.62, kr * 0.62, kh, M.recess, 0, ky, 0, 8), cyl(kr * 1.02, kr * 1.02, 0.6, PINK, 0, ky + kh - 0.6, 0, 8));
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * Math.PI * 2, b = a + Math.PI / 8;
    g.add(at(box(0.7, kh, 0.7, PINK), Math.sin(a) * kr * 0.95, ky, Math.cos(a) * kr * 0.95).rotateY(a));
    const rg = archRing(kr * 0.52, kh * 0.8, true, 0.25, 0.25, PINK, false);
    rg.position.set(Math.sin(b) * (kr * c8 - 0.25), ky, Math.cos(b) * (kr * c8 - 0.25));
    rg.rotation.y = b;
    g.add(rg);
  }
  g.add(chhajjaRing(kr, kr * 1.3, ky + kh + 0.3, 0.5, 0.16, PINK_LIGHT, 8));
  g.add(cyl(dr * 0.9, dr * 0.92, 1, MARBLE, 0, ky + kh, 0, 24), at(onionDome(dr, MARBLE), 0, ky + kh + 1, 0), at(finial(3), 0, h, 0));
  // Turned so that a face, not a corner, looks east.
  g.rotation.y = Math.PI / 8;
  return g;
}

// The east gateway on the plinth, facing +z: a tall block with a great cusped arch in its front,
// in whose recess the entrance arch stands under a carved panel, a balcony on brackets and the
// arch of its window; tiers of cusped niches up the piers either side, medallions over the arch,
// a slender turret at each corner; an arch towards the court; and a lower two-storey wing with
// windows either side.
function gateway() {
  const g = new THREE.Group(), GW = 16, GH = 20, GD = 10, R = 2.5, zf = GD / 2, zb = zf - R, AWG = 8, top = 16.9;
  g.add(box(GW, GH, GD - R, PINK, 0, 0, -R / 2), box(GW + 0.6, 0.6, GD + 0.6, PINK_LIGHT, 0, GH, 0));
  for (const s of [-1, 1]) g.add(box((GW - AWG) / 2, GH, R, PINK, s * (GW + AWG) / 4, 0, zf - R / 2));
  g.add(box(AWG, GH - top, R, PINK, 0, top, zf - R / 2), at(new THREE.Mesh(cuspedArchGeo(AWG, 7, R), PINK), 0, top, zf - R / 2));
  // In the recess: the entrance arch, the panel of carved motifs over it, the balcony and its window.
  g.add(at(archPanel(3.6, 5.6, true, M.recess, 0.06), 0, 0, zb + 0.01), at(archRing(3.6, 5.6, true, 0.3, 0.12, MARBLE), 0, 0, zb + 0.01));
  g.add(at(panel(4.8, 1.3, 0.16, MARBLE), 0, 6.3, zb + 0.01));
  g.add(at(archPanel(4.2, 4.6, true, M.recess, 0.06), 0, 8.9, zb + 0.01), at(archRing(4.2, 4.6, true, 0.25, 0.1, PINK_LIGHT), 0, 8.9, zb + 0.01));
  g.add(box(5.2, 0.25, 1.3, PINK_LIGHT, 0, 8.65, zb + 0.65), at(railing(5.2, 1.1, 0.14, PINK_LIGHT, 1.3), 0, 8.9, zb + 1.2));
  g.add(placeAll(bracketGeo(0.9, 1.1, 0.25), [-2.2, -0.75, 0.75, 2.2].map((x) => [x, 8.65, zb, 0]), PINK_LIGHT));
  // The piers' four tiers of niches, the medallions over the arch, and a band round the arch.
  for (const s of [-1, 1]) {
    for (const y of [1.2, 5.6, 10, 14.4]) g.add(at(archPanel(1.9, 3.3, true, SHADE, 0.05), s * 6, y, zf + 0.01), at(new THREE.Mesh(cuspedArchGeo(1.9, 1.1, 0.12), PINK_LIGHT), s * 6, y + 3.3, zf + 0.06), at(panel(2.7, 4.1, 0.14, PINK_LIGHT, null), s * 6, y - 0.4, zf));
    g.add(at(medallion(0.55, PINK_LIGHT), s * 2.7, 18.6, zf), box(0.3, top, 0.1, PINK_LIGHT, s * (AWG / 2 + 0.35), 0, zf + 0.05));
    for (const z of [-zf, zf]) g.add(cyl(0.55, 0.6, GH + 0.6, PINK, s * GW / 2, 0, z, 8), cyl(0.36, 0.42, 4.2, PINK_LIGHT, s * GW / 2, GH + 0.6, z, 8), cyl(0.6, 0.36, 0.4, PINK_LIGHT, s * GW / 2, GH + 4.4, z, 8), at(onionDome(0.5, PINK_LIGHT), s * GW / 2, GH + 4.8, z));
  }
  g.add(box(AWG + 1, 0.3, 0.1, PINK_LIGHT, 0, top + 0.6, zf + 0.05));
  // Towards the court.
  g.add(at(iwan(7, 13, { m: PINK, trim: MARBLE, shade: PINK_LIGHT, depth: 1.4, frame: 4.4, top: 6.4 }), 0, 0, -zf).rotateY(Math.PI));
  // The wings.
  for (const s of [-1, 1]) {
    g.add(box(12, 11, 7.4, PINK, s * 14, 0, -1), box(12.5, 0.5, 8.5, PINK_LIGHT, s * 14, 11, -1));
    const cells = [...cellRow(3, 3.6, 1.3, 1.7, 3.3), ...cellRow(3, 3.6, 6.4, 1.7, 3.3)];
    g.add(at(arcadeSkin(12, 11, cells, 0.3, PINK, { trim: PINK_LIGHT, fill: 'jali' }), s * 14, 0, 2.7));
    g.add(at(arcadeSkin(12, 11, cells, 0.3, PINK, { trim: PINK_LIGHT, fill: 'jali' }), s * 14, 0, -4.7).rotateY(Math.PI));
  }
  return g;
}

export function buildTajUlMasajid() {
  const g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  // The plinth of the court, with the hall at its west end; shops in a row of arches round its
  // foot on the north, south and east.
  const W = 100, z0 = -36, z1 = 56, HZ = z0 - HD / 2;
  f.add(box(W + 18, P, z1 - HZ + 26, PINK, 0, 0, (z1 + HZ) / 2 - 5), box(W - 2, 0.12, z1 - z0 - 2, PINK_LIGHT, 0, P, (z1 + z0) / 2));
  const shops = (len) => arcadeSkin(len, P - 0.5, cellRow(Math.floor(len / 5), len / Math.floor(len / 5), 0, 2.6, 3.6), 0.3, PINK, { trim: PINK_LIGHT, fill: 'door' });
  for (const s of [-1, 1]) f.add(at(shops(z1 - HZ + 24), s * (W / 2 + 9), 0, (z1 + HZ) / 2 - 5).rotateY(s * Math.PI / 2));
  for (const s of [-1, 1]) f.add(at(shops(42), s * 38, 0, z1 + 8));
  // The prayer hall, hollow: the qibla wall with its eleven arches, the end walls, the roof, and
  // the front wall above the heads of its arches; inside, in shade, the marble floor and the two
  // rows of massive pillars with cusped arches between them.
  const zf = z0 - T / 2, hall = new THREE.Group();
  hall.add(box(HW, HH, 1.5, PINK, 0, 0, z0 - HD + 0.75), box(HW, 1, HD - 1.5, PINK, 0, HH - 1, HZ + 0.75), box(HW + 0.6, 0.6, HD + 0.6, PINK_LIGHT, 0, HH, HZ));
  for (const s of [-1, 1]) hall.add(box(1.5, HH - 1, HD - 1.5 - T, PINK, s * (HW / 2 - 0.75), 0, HZ + 0.75 - T / 2));
  hall.add(box(HW - 3, 0.08, HD - 1.5, SHADE, 0, 0.1, HZ + 0.75), box(HW - 3, 0.06, HD - 1.5 - T, SHADE, 0, HH - 1.06, HZ + 0.75 - T / 2), box(HW - 3, HH - 1.2, 0.06, SHADE, 0, 0.1, z0 - HD + 1.53));
  for (let k = -5; k <= 5; k++) hall.add(at(archPanel(4.4, 8.4, true, M.recess, 0.06), k * 7.1, 0.2, z0 - HD + 1.6), at(archRing(4.4, 8.4, true, 0.28, 0.1, PINK), k * 7.1, 0.2, z0 - HD + 1.6));
  const bay = (HD - 1.5 - T) / 3, span = HW / 9, inner = [];
  for (const j of [1, 2]) for (let i = 0; i <= 9; i++) {
    if (i > 0 && i < 9) hall.add(box(2.3, HH - 1, 2.3, SHADE, -HW / 2 + i * span, 0.1, z0 - T - j * bay));
    if (i < 9) inner.push([-HW / 2 + (i + 0.5) * span, HH - 1, z0 - T - j * bay, 0]);
  }
  hall.add(placeAll(cuspedArchGeo(span - 2.3, 3.6, 1.2), inner, SHADE));
  // The front either side of the frontispiece: piers, the cusped heads of the three arches, the
  // narrow bays with a door and a window, and the wall above with its little windows.
  const heads = [], wins = [], win = archPanel(0.8, 1.5, true, M.recess, 0.06).geometry, edge = HW / 2 - 11.5;
  for (const s of [-1, 1]) {
    hall.add(box(edge, HH - HEAD, T, PINK, s * (11.5 + edge / 2), HEAD, zf));
    const stops = [11.5, ...ARCHES.flatMap((x) => [x - AW / 2, x + AW / 2]), HW / 2];
    for (let k = 0; k < stops.length; k += 2) hall.add(box(stops[k + 1] - stops[k], HEAD, T, PINK, s * (stops[k] + stops[k + 1]) / 2, 0, zf));
    for (const x of ARCHES) {
      heads.push([s * x, HEAD, zf, 0]);
      hall.add(at(panel(AW + 1, HEAD + 0.5, 0.22, PINK_LIGHT, null, 0.08), s * x, 0, z0));
      for (let k = -2; k <= 2; k++) wins.push([s * x + k * 1.2, 11.2, z0 + 0.01, 0]);
    }
    for (const x of NARROW) {
      hall.add(at(archPanel(2.4, 4.4, true, M.recess, 0.06), s * x, 0, z0 + 0.01), at(new THREE.Mesh(cuspedArchGeo(2.4, 1.5, 0.14), PINK_LIGHT), s * x, 4.4, z0 + 0.08));
      hall.add(at(archPanel(2, 2.9, true, M.recess, 0.06), s * x, 5.6, z0 + 0.01), at(archRing(2, 2.9, true, 0.2, 0.1, MARBLE), s * x, 5.6, z0 + 0.01));
      for (const k of [-0.6, 0.6]) wins.push([s * x + k, 11.2, z0 + 0.01, 0]);
    }
  }
  hall.add(placeAll(cuspedArchGeo(AW, 5.2, T), heads, PINK), placeAll(win, wins, M.recess));
  hall.add(at(placeAll(archRing(0.8, 1.5, true, 0.1, 0.06, MARBLE).geometry, wins, MARBLE), 0, 0, 0.01));
  // The frontispiece: 23 m wide, standing 2.4 m forward of the front and 5 m above it, its cusped
  // arch 12.5 m wide under a spandrel of white marble; in its recess the arch into the hall.
  const FW = 23, FH = 19.8, FA = 12.5, FT = 18.1, FD = 4.4, zc = z0 + 2.4 - FD / 2;
  for (const s of [-1, 1]) hall.add(box((FW - FA) / 2, FH, FD, PINK, s * (FW + FA) / 4, 0, zc));
  hall.add(box(FA, FH - FT, FD, PINK, 0, FT, zc), at(new THREE.Mesh(cuspedArchGeo(FA, 8, FD), PINK), 0, FT, zc), box(FW + 0.5, 0.6, FD + 0.5, PINK_LIGHT, 0, FH, zc));
  const sp = at(new THREE.Mesh(cuspedArchGeo(FA, 8, 0.1), MARBLE), 0, FT + 0.9, z0 + 2.45);
  sp.scale.set(1.06, 0.88, 1);
  hall.add(sp, box(FA * 1.06 + 0.5, 0.25, 0.14, PINK_LIGHT, 0, FT + 0.9, z0 + 2.47), box(FW, FH, 5, PINK, 0, 0, z0 - T - 2.5));
  hall.add(at(archPanel(5.2, 9, true, M.recess, 0.06), 0, 0, z0 - T + 0.01), at(new THREE.Mesh(cuspedArchGeo(5.2, 3.2, 0.2), PINK_LIGHT), 0, 9, z0 - T + 0.12), at(archRing(8.6, 14.5, true, 0.3, 0.1, PINK_LIGHT), 0, 0, z0 - T + 0.01));
  for (const s of [-1, 1]) {
    for (const y of [2, 7.5, 13]) hall.add(at(panel(3, 4.4, 0.16, PINK_LIGHT, null), s * (FW + FA) / 4, y, z0 + 2.4));
    hall.add(cyl(0.7, 0.75, FH + 0.6, PINK, s * FW / 2, 0, z0 + 2.4, 8), cyl(0.5, 0.55, 2.6, PINK, s * FW / 2, FH + 0.6, z0 + 2.4, 8), at(mughalChhatri(0.85, 3.2, PINK, { domeM: MARBLE }), s * FW / 2, FH + 3.2, z0 + 2.4));
  }
  hall.add(at(steps3(14), 0, 0, z0 + 2.4));
  f.add(at(mergeByMaterial(hall), 0, P, 0));
  // The three white domes on their low drums: the middle one a little larger.
  for (const [x, r] of [[-22.7, 6.1], [0, 6.7], [22.7, 6.1]]) {
    const y = P + HH + 0.6;
    f.add(cyl(r * 0.92, r * 0.96, 2, MARBLE, x, y, HZ, 32), cyl(r * 0.98, r * 0.98, 0.35, MARBLE, x, y + 2, HZ, 32));
    f.add(placeAll(archPanel(0.7, 1.3, true, M.recess, 0.05).geometry, Array.from({ length: 16 }, (_, k) => { const a = (k / 16) * Math.PI * 2; return [x + Math.sin(a) * r * 0.93, y + 0.4, HZ + Math.cos(a) * r * 0.93, a]; }), M.recess));
    f.add(at(onionDome(r, MARBLE), x, y + 2.35, HZ), at(petalRing(r * 0.93, 24, r * 0.3, r * 0.2, 0.25, MARBLE, 0.25), x, y + 2.35, HZ), at(finial(r * 0.6), x, y + 2.35 + r * 1.85, HZ));
  }
  // Small kiosks at the corners of the hall's roof, behind the minarets.
  for (const x of [-37, 37]) f.add(at(mughalChhatri(1.5, 5, PINK, { domeM: MARBLE }), x, P + HH + 0.6, HZ - 10));
  // The minarets at the two ends of the hall.
  for (const s of [-1, 1]) f.add(at(tower(67), s * 46.5, P, z0 - 5));
  // The cloisters round the court's north, south and east sides: an arcade towards the court, a walk
  // and an outer wall under a flat roof, one storey high; a domed pavilion at each east corner.
  const CH = 7, CD = 7;
  const cloister = (len) => {
    const c = new THREE.Group();
    c.add(box(len, CH, CD - 1.2, PINK, 0, 0, -CD / 2 - 0.6), box(len + 0.4, 0.5, CD + 0.4, PINK_LIGHT, 0, CH, -CD / 2));
    const n = Math.floor(len / 4.6);
    c.add(at(arcadeSkin(len, CH, cellRow(n, len / n, 0.4, 2.8, 5), 1.2, PINK, { trim: PINK_LIGHT, fill: 'room' }), 0, 0, -1.2));
    // The outer face: a row of blind arches, each with a small window.
    c.add(at(arcadeSkin(len, CH - 0.6, cellRow(n, len / n, 1.2, 2.4, 4.2), 0.3, PINK, { trim: PINK_LIGHT, fill: 'jali' }), 0, 0, -CD).rotateY(Math.PI));
    return c;
  };
  for (const s of [-1, 1]) f.add(at(cloister(z1 - z0), s * (W / 2), P, (z0 + z1) / 2).rotateY(-s * Math.PI / 2));
  for (const s of [-1, 1]) f.add(at(cloister(33), s * 36.5, P, z1 + 0.01).rotateY(Math.PI));
  for (const s of [-1, 1]) f.add(cyl(4.6, 4.8, CH + 0.5, PINK, s * (W / 2 + 3.5), P, z1 + 3.5, 8), at(mughalChhatri(4, 8.5, PINK, { domeM: MARBLE }), s * (W / 2 + 3.5), P + CH + 0.5, z1 + 3.5));
  // The east gateway, and the fan of steps that spreads from its door down to the road.
  f.add(at(mergeByMaterial(gateway()), 0, P, z1 + 2));
  const fan = [[0, P]], n = Math.round(P / 0.36);
  for (let k = 0; k < n; k++) fan.push([4 + k * 0.72, P - k * (P / n)], [4 + k * 0.72, P - (k + 1) * (P / n)]);
  f.add(at(lathe(fan.reverse(), flat(PINK_LIGHT), 48), 0, 0, z1 + 7));
  addDetails(f, g, { W, z0, z1, HZ, HH, HW, CH, CD });
  // From above the gateway, across the court to the hall, its domes and the two minarets.
  return { group: g, focus: f, view: [0.35, 0.36, 1], zoom: 0.72, target: [0, 20, -10] };
}

// Three marble steps w wide up to the frontispiece, running out towards +z.
function steps3(w) {
  const g = new THREE.Group();
  for (let k = 0; k < 3; k++) g.add(box(w + k * 1.2, 0.45 - k * 0.15, 0.5, MARBLE, 0, 0.1, 0.25 + k * 0.5));
  return g;
}

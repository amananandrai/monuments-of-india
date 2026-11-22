import * as THREE from 'three';
import { M, mat, photo, box, cyl, lathe, at, onFace, FACES, inst, unitBox, kalash } from '../helpers.js';
import { mergeByMaterial, chhajja, chhajjaRing, jali, carved, windowFrame } from '../parts/components.js';
import { arcadeSkin } from '../parts/mughal.js';
import { column } from '../parts/colonial.js';
import { steps } from '../parts/doorways.js';
import { lionCapital } from '../parts/animals.js';
import { addDetails } from '../details/vidhana-soudha.js';
import { detail } from '../detail.js';

// Vidhana Soudha, Bengaluru (1951–56), after photographs of its east front: a block of grey-white
// granite 213 m by 107 m, a ground storey and three floors above it, built in ranges round two
// courts. A flight of 45 steps, 61 m wide, climbs to a porch of twelve columns 12 m tall under an
// entablature and a kapota eave; behind it the great dome, 18 m across, stands on an eight-sided
// drum and carries the Lion Capital, 46 m up. A square tower under a smaller dome stands at each
// corner, and two lesser domes flank the porch. Between them run pillared verandahs on the first
// and second floors, arches below and above, a chhajja at every floor.
// The east front faces +z, at z = FZ; the porch stands forward of it. Shared with the detail file
// through VS.
export const VS = { W: 213, D: 107, FZ: 53.5, G: 6.5, Y2: 11.5, Y3: 16.5, T: 21, vd: 2.4, CW: 60, PZ: 62, TW: 18, TH: 25, DZ: 45 };
export const GR = photo(mat('#cdc9bf', 0.85), 'granite'), LT = mat('#dedbd3', 0.8), DARK = mat('#8f8b83', 0.9);

// A dome of the Soudha, r in radius on y = 0: a full, slightly swelling shell on a moulded foot,
// with a lotus and a pot at its crown (the great dome carries the Lion Capital instead).
export function soudhaDome(r, { pot = true } = {}) {
  const g = new THREE.Group();
  g.add(lathe([[1.02, 0], [1.02, 0.06], [0.95, 0.08], [1.0, 0.3], [0.97, 0.55], [0.84, 0.8], [0.6, 1.0], [0.3, 1.12], [0.12, 1.16], [0, 1.17]].map(([x, y]) => [x * r, y * r]), LT, 40));
  g.add(cyl(r * 0.16, r * 0.22, r * 0.08, GR, 0, r * 1.15, 0, 16));
  if (pot) g.add(at(kalash(r * 0.42, GR), 0, r * 1.22, 0));
  return g;
}

// One stretch of the outer wall, len long, facing +z with its face at z = 0 and its verandahs
// running vd back from it: round arches on the ground storey, pillars and a pierced parapet on the
// first and second floors, arches again on the third, and a chhajja over each.
export function facade(len, ring = true) {
  const { G, Y2, Y3, T, vd } = VS, g = new THREE.Group(), n = Math.round(len / 3.6), p = len / n;
  const low = [], up = [], cols = [], caps = [], doors = [];
  for (let k = 0; k < n; k++) {
    const x = -len / 2 + (k + 0.5) * p;
    low.push([x, 1.3, 1.9, 3.7, 'room']); up.push([x, 0.55, 2.1, 3.2, 'room']);
    for (const y of [G, Y2]) doors.push([x, y + 0.4, -vd + 0.03, 1.3, 2.9, 0.06]);
  }
  g.add(at(arcadeSkin(len, G, low, vd, GR, { trim: LT, pointed: false, ring }), 0, 0, -vd));
  g.add(at(arcadeSkin(len, T - Y3, up, vd, GR, { trim: LT, pointed: false, ring }), 0, Y3, -vd));
  for (const y of [G, Y2]) {
    g.add(box(len, 0.4, vd - 0.02, LT, 0, y, -vd / 2), box(len, 0.75, 0.8, GR, 0, y + 4.25, -0.42));
    g.add(box(len, 0.95, 0.14, jali(LT), 0, y + 0.4, -0.3));
    for (let k = 0; k <= n; k++) {
      const x = -len / 2 + k * p;
      cols.push([x, y + 0.4, -0.75, 0.62, 3.25, 0.62]); caps.push([x, y + 3.65, -0.85, 1.25, 0.25, 0.8], [x, y + 3.9, -0.88, 0.9, 0.34, 0.85]);
    }
  }
  g.add(inst(unitBox(), cols, GR), inst(unitBox(), caps, LT), inst(unitBox(), doors, M.recess));
  for (const y of [G, Y2, Y3, T]) g.add(at(chhajja(len, 1.25, 0.42, 0.14, LT), 0, y + 0.36, 0.02));
  return g;
}

// A corner tower, TW square and TH high on y = 0: four floors of windows, eaves, and the dome on
// its eight-sided drum.
function tower() {
  const { G, Y2, Y3, T, TW, TH } = VS, g = new THREE.Group(), cells = [];
  for (const x of [-5, 0, 5]) cells.push([x, 1.3, 2, 3.8, 'room'], [x, G + 0.9, 2, 3.2, 'jali'], [x, Y2 + 0.9, 2, 3.2, 'jali'], [x, Y3 + 0.7, 2, 3.0, 'room'], [x, T + 0.9, 1.4, 2.0, 'jali']);
  g.add(box(TW - 1.2, TH, TW - 1.2, GR));
  for (const a of FACES) {
    g.add(onFace(arcadeSkin(TW, TH, cells, 0.6, GR, { trim: LT, pointed: false, ring: !detail.low }), a, TW / 2 - 0.6));
    for (const y of [G, T, TH]) g.add(onFace(at(chhajja(TW + 0.6, 1.2, 0.42, 0.14, LT), 0, y + 0.36, 0), a, TW / 2 + 0.02));
    for (const s of [-1, 1]) g.add(onFace(box(1.3, TH, 0.3, GR, s * (TW / 2 - 0.65), 0, 0.15), a, TW / 2));
  }
  g.add(box(TW - 0.4, 1.1, TW - 0.4, GR, 0, TH + 0.36, 0), box(11, 1.4, 11, GR, 0, TH + 0.5, 0));
  const drum = cyl(4.9, 5.1, 3.2, GR, 0, TH + 1.9, 0, 8);
  drum.rotation.y = Math.PI / 8;
  g.add(drum, chhajjaRing(4.9, 6, TH + 5.2, 0.35, 0.12, LT, 32), at(soudhaDome(4.6), 0, TH + 5.2, 0));
  for (let k = 0; k < 8; k++) g.add(onFace(at(windowFrame(1.3, 2.1, LT, { shape: 'round', frame: 0.2 }), 0, TH + 2.4, 0), (k / 8) * Math.PI * 2, 4.66));
  return mergeByMaterial(g);
}

export function buildVidhanaSoudha() {
  const g = new THREE.Group(), f = new THREE.Group(), { W, D, FZ, G, T, vd, CW, PZ, TW, DZ } = VS;
  g.add(f);
  const R = 20, hx = W / 2, hz = D / 2, ROOF = mat('#a9a69e', 0.9);

  /* The ranges round the two courts: front, back, the two ends and the cross range in the middle. */
  const core = (w, d, x, z) => f.add(box(w, T, d, GR, x, 0, z), box(w - 1, 0.3, d - 1, ROOF, x, T + 0.36, z));
  core(W - 2 * vd, R - vd, 0, hz - vd - (R - vd) / 2); core(W - 2 * vd, R - vd, 0, -(hz - vd - (R - vd) / 2));
  for (const s of [-1, 1]) core(R - vd, D - 2 * R + 0.04, s * (hx - vd - (R - vd) / 2), 0);
  core(30, D - 2 * R + 0.04, 0, 0);
  // Dark windows on the court sides.
  const wins = [];
  for (let k = 0; k < 16; k++) for (const y of [2, 8, 13, 17.6]) for (const sx of [-1, 1]) {
    const z = -31 + k * 4.13;
    wins.push([sx * 15.03, y, z, 0.06, 2.4, 1.5], [sx * (hx - R - 0.03), y, z, 0.06, 2.4, 1.5]);
    for (const sz of [-1, 1]) wins.push([sx * (18 + k * 4.2), y, sz * (hz - R - 0.03), 1.5, 2.4, 0.06]);
  }
  f.add(inst(unitBox(), wins, M.recess));
  // The outer walls between the towers and the porch block.
  const tx = hx - TW / 2 + 1.5, tz = hz - TW / 2 + 1.5, fx0 = CW / 2, fx1 = tx - TW / 2;
  const walls = new THREE.Group();
  for (const s of [-1, 1]) {
    walls.add(onFace(facade(fx1 - fx0), 0, FZ, s * (fx0 + fx1) / 2));
    walls.add(onFace(facade(2 * (tz - TW / 2)), s * Math.PI / 2, hx));
    f.add(at(tower(), s * tx, 0, tz), at(tower(), s * tx, 0, -tz));
  }
  walls.add(onFace(facade(2 * fx1, !detail.low), Math.PI, hz));
  f.add(walls);

  /* The porch block: forward of the front range and a storey higher, its two ends solid, the porch
     of twelve columns between them at the head of the steps. */
  const c = new THREE.Group(), ch = 24, pb = 54.5, cy = G + 12;
  c.add(box(CW, ch, pb - (hz - R) - 0.04, GR, 0, 0, (pb + hz - R) / 2));
  c.add(box(48, G, PZ - pb, GR, 0, 0, (PZ + pb) / 2), box(48.6, 0.3, PZ - pb + 0.4, LT, 0, G, (PZ + pb) / 2));
  // The wall at the back of the porch: three tall doors and a row of windows over them.
  const back = [];
  for (const x of [-16, 0, 16]) back.push([x, 0.3, x ? 3.4 : 4.4, x ? 6.4 : 7.4, 'door']);
  for (const x of [-20, -12, -8, 8, 12, 20]) back.push([x, 0.3, 2, 4.4, 'room']);
  for (let k = -5; k <= 5; k++) back.push([k * 4, 8.6, 1.9, 2.8, 'room']);
  c.add(at(arcadeSkin(48, 12, back, 0.8, GR, { trim: LT, pointed: false }), 0, G + 0.3, pb));
  // The twelve columns, the entablature with its inscribed frieze, and the kapota over it.
  for (let k = 0; k < 12; k++) c.add(at(column(0.9, 12, GR), -22 + k * 4, G + 0.3, PZ - 1.6));
  c.add(box(48, 0.9, 2.2, GR, 0, cy + 0.3, PZ - 1.5), box(47.6, 1.3, 2.0, carved(LT, 'script'), 0, cy + 1.2, PZ - 1.5), box(48, 0.5, PZ - pb, GR, 0, cy + 2.5, (PZ + pb) / 2));
  c.add(at(chhajja(48, 1.6, 0.55, 0.18, LT), 0, cy + 3.0 + 0.36, PZ - 0.38));
  c.add(box(48, ch - cy - 3.0, 1.2, GR, 0, cy + 3.0, PZ - 1.0));
  // The solid ends, with a window on each floor of their two outer faces.
  for (const s of [-1, 1]) {
    const e = new THREE.Group(), ew = 6, ed = PZ - pb, cells = [[0, 1.3, 2.2, 3.8, 'room'], [0, G + 1, 2.2, 4, 'room'], [0, G + 6.4, 2.2, 4, 'room'], [0, 18.2, 2.2, 3.2, 'jali']];
    e.add(box(ew - 0.6, ch, ed - 0.6, GR, -s * 0.3, 0, -0.3), at(arcadeSkin(ew, ch, cells, 0.6, GR, { trim: LT, pointed: false }), 0, 0, ed / 2 - 0.6));
    e.add(at(arcadeSkin(ed - 0.6, ch, cells, 0.6, GR, { trim: LT, pointed: false }), s * (ew / 2 - 0.6), 0, -0.3).rotateY(s * Math.PI / 2));
    for (const y of [G, T]) e.add(at(chhajja(ew + 1.2, 1.2, 0.42, 0.14, LT), 0, y + 0.36, ed / 2 + 0.62));
    c.add(at(e, s * 27, 0, (PZ + pb) / 2));
    // The lesser dome over each end.
    const dy = ch + 0.36;
    c.add(box(8, 1.2, 8, GR, s * 26, dy, 56), cyl(3.3, 3.5, 2.2, GR, s * 26, dy + 1.2, 56, 8), chhajjaRing(3.3, 4.2, dy + 3.4, 0.3, 0.1, LT, 28).translateX(s * 26).translateZ(56), at(soudhaDome(3.1), s * 26, dy + 3.4, 56));
  }
  c.add(at(chhajja(CW + 0.4, 1.3, 0.45, 0.14, LT), 0, ch + 0.36, PZ + 0.3), box(CW - 0.6, 0.3, PZ - (hz - R) - 0.6, ROOF, 0, ch + 0.06, (PZ + hz - R) / 2));
  for (const s of [-1, 1]) c.add(at(chhajja(PZ - FZ, 1.3, 0.45, 0.14, LT), s * (CW / 2), ch + 0.36, (PZ + FZ) / 2).rotateY(s * Math.PI / 2));
  f.add(mergeByMaterial(c));
  // The grand flight: 45 steps, 61 m wide, between low side walls.
  f.add(at(steps(61, G, 45, LT, 0.36), 0, 0, PZ));
  for (const s of [-1, 1]) for (let k = 0; k < 4; k++) f.add(box(1.6, G - k * 1.6 + 0.5, 4.1, GR, s * 31.3, 0, PZ + 2.05 + k * 4.1));

  /* The great dome: a square base, the eight-sided drum with a window in each face, an eave, the
     dome and the Lion Capital. */
  const d = new THREE.Group(), by = ch + 0.36;
  d.add(box(23, 2.4, 23, GR, 0, by, 0), box(24, 0.4, 24, LT, 0, by + 2.4, 0));
  const drum = cyl(10.2, 10.6, 5.6, GR, 0, by + 2.8, 0, 8);
  drum.rotation.y = Math.PI / 8;
  d.add(drum, chhajjaRing(10.2, 11.8, by + 8.4, 0.5, 0.16, LT, 48), cyl(9.9, 9.9, 0.5, GR, 0, by + 8.4, 0, 48));
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * Math.PI * 2;
    d.add(onFace(at(windowFrame(2.4, 3.6, LT, { shape: 'round', frame: 0.3, screen: jali(LT) }), 0, by + 3.6, 0), a, 9.62));
    for (const s of [-1, 1]) d.add(onFace(box(0.7, 5.6, 0.3, LT, s * 3.5, by + 2.8, 0.15), a, 9.6));
  }
  d.add(at(soudhaDome(9.2, { pot: false }), 0, by + 8.9, 0));
  // The Lion Capital (on phones, its outline: the bell, the abacus and four blocked-out lions).
  if (!detail.low) f.add(at(lionCapital(GR, 1.05), 0, by + 8.9 + 9.2 * 1.23, DZ));
  else {
    const ly = by + 8.9 + 9.2 * 1.23, l = new THREE.Group();
    l.add(cyl(0.38, 0.65, 0.6, GR, 0, 0, 0, 12), cyl(0.63, 0.63, 0.28, GR, 0, 0.6, 0, 16));
    for (const a of FACES) l.add(onFace(box(0.42, 1.0, 0.5, GR, 0, 0.88, -0.25), a, 0.5), onFace(box(0.36, 0.4, 0.3, GR, 0, 1.75, 0), a, 0.42));
    l.add(box(0.6, 1.3, 0.6, GR, 0, 0.88, 0));
    f.add(at(mergeByMaterial(l), 0, ly, DZ));
  }
  // A small domed kiosk on each corner of the base.
  for (const x of [-9.8, 9.8]) for (const z of [-9.8, 9.8]) d.add(cyl(1.5, 1.6, 1.6, GR, x, by + 2.8, z, 8), at(soudhaDome(1.6), x, by + 4.4, z));
  f.add(at(mergeByMaterial(d), 0, 0, DZ));

  addDetails(f, g);
  // The home view: the east front and its steps from across the road, a little to one side.
  return { group: g, focus: f, view: [0.26, 0.07, 1.2], zoom: 0.56 };
}

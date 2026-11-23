import * as THREE from 'three';
import { mat, photo, box, cyl, at } from '../helpers.js';
import { arcadeSkin, cellRow } from '../parts/mughal.js';
import { porch, classicalDoor, balustrade, pediment } from '../parts/colonial.js';
import { mergeByMaterial, pilasters, railing } from '../parts/components.js';
import { detail } from '../detail.js';
import { addDetails } from '../details/falaknuma-palace.js';

// Falaknuma's walls, washed a pale grey-blue; white for its columns, cornices and balustrades (the
// marble is indoors); the plastered stone of the basement; dark green for the iron railings.
export const WALL = photo(mat('#b9c6d1', 0.8), 'plaster');
export const WHITE = photo(mat('#f3f0ea', 0.6), 'plaster');
export const TRIM = mat('#e4dfd4', 0.7);
export const GREEN = mat('#1f4636', 0.55, 0.3);

// The palace's measures, shared with js/details/falaknuma-palace.js. From photographs of the north
// front, here +z: a basement B high and TW long carries the terrace, which runs TD out in front of
// the palace. On it, on a podium S high, stands the centre block, CW wide and CD deep, its front
// two colonnaded galleries GD deep, one over the other, each tier T high (columns H, entablature
// E), between solid end bays EB wide. Lower links LW long and LH high, set back, join it to the
// end pavilions, PW wide, of two shorter tiers PT with galleries PG wide, standing PF forward. The
// zenana and the kitchens trail away behind: the scorpion's tail.
export const P = { B: 8, TW: 136, TD: 18, S: 2.2, CW: 46, CD: 30, GD: 4.5, EB: 6, T: 7, H: 6, E: 1, PED: 20, LW: 12, LH: 8.4, PW: 20, PT: 5, PG: 13, PF: 2 };

// A window of the upper floors: round-headed, under a cornice.
const win = (w, h, shape = 'round') => classicalDoor(w, h, { m: WALL, trim: WHITE, shape, fill: 'glass', top: 'cornice', depth: 0.2, frame: 0.28 });
// n of them spread along a face len long, about x = 0.
function row(len, n, w) {
  const g = new THREE.Group();
  for (let k = 0; k < n; k++) g.add(at(w.clone(), (k - (n - 1) / 2) * (len / n), 0, 0));
  return g;
}

// Two colonnaded galleries, one over the other, w wide and d deep against a wall at z = 0, each
// tier h to the top of its columns under an entablature e: plain columns with Ionic scrolls below,
// fluted Corinthian above; a glazed door in the wall behind each bay, and iron railings between
// the columns (left open in the middle of the lower tier if `open`).
function galleries(w, d, h, e, cols, r, open) {
  const g = new THREE.Group(), n = cols - 1, xa = -w / 2 + r * 1.5, pitch = (w - r * 3) / n, zc = d - r * 1.5;
  const door = classicalDoor(pitch * 0.42, h * 0.72, { m: WALL, trim: WHITE, fill: 'glass', top: null, depth: 0.2, frame: 0.25 });
  for (const k of [0, 1]) {
    const y = k * (h + e);
    g.add(at(porch(w, d, h, { m: WALL, trim: WHITE, cols, r, ent: e, order: k ? 'corinthian' : 'plain', top: 'cornice', side: false }), 0, y, 0));
    for (let b = 0; b < n; b++) {
      const x = xa + (b + 0.5) * pitch;
      g.add(at(door.clone(), x, y + 0.25, 0.01));
      if (k || !open || Math.abs(x) > 0.1) g.add(at(railing(pitch - r * 2.6, 1, 0.07, GREEN, 9), x, y + 0.25, zc));
    }
    // The scrolls of the lower tier's Ionic capitals.
    if (!k && !detail.low) for (let c = 0; c < cols; c++) for (const s of [-1, 1]) {
      const v = cyl(r * 0.42, r * 0.42, r * 2.7, WHITE, 0, 0, 0, 8);
      v.rotation.x = Math.PI / 2;
      g.add(at(v, xa + c * pitch + s * r * 1.05, h - r * 0.8, zc));
    }
  }
  return g;
}

// A solid bay w wide and d deep of two tiers, beside a gallery: flat pilasters at its corners and
// a window to each floor, each tier under the same entablature as the columns.
function endBay(w, d, h, e) {
  const g = new THREE.Group();
  g.add(box(w, 2 * (h + e) - 0.03, d, WALL, 0, 0, d / 2));
  for (const k of [0, 1]) {
    const y = k * (h + e);
    g.add(at(pilasters(w - 0.9, 2, 0.8, h, 0.16, WHITE), 0, y, d));
    g.add(box(w + 0.1, e * 0.72, d + 0.1, WHITE, 0, y + h, d / 2), box(w + 0.6, e * 0.28, d + 0.35, WHITE, 0, y + h + e * 0.72, d / 2 + 0.1));
    if (w > 4) g.add(at(win(w * 0.26, h * 0.52), 0, y + h * 0.2, d + 0.01), at(railing(w * 0.42, 0.9, 0.06, GREEN, 9), 0, y + h * 0.2 - 0.15, d + 0.3));
  }
  return g;
}

export function buildFalaknumaPalace() {
  const g = new THREE.Group(), f = new THREE.Group(), d = new THREE.Group();
  g.add(f);
  const { B, TW, TD, S, CW, CD, GD, EB, T, H, E, PED, LW, LH, PW, PT, PG, PF } = P, Y = B + S, top = Y + 2 * T;
  // The basement: a long arcade of round arches in banded plaster between piers, a wider arch in
  // the middle, carrying the terrace and its balustrade.
  const back = -CD - 86, n = 22, pitch = TW / (n + 2);
  d.add(box(TW, B - 0.6, TD - 1 - back, TRIM, 0, 0, (TD - 1 + back) / 2));
  const cells = [...cellRow(n + 2, pitch, 0, 2.7, 5.2, [[-pitch, pitch]]), [0, 0, 4.6, 6.2]];
  d.add(at(arcadeSkin(TW, B - 0.6, cells, 1, TRIM, { trim: WHITE, pointed: false, fill: 'room' }), 0, 0, TD - 1));
  for (let k = 0; k <= n + 2; k++) {
    const x = -TW / 2 + k * pitch + (k === 0 ? 0.7 : k === n + 2 ? -0.7 : 0);
    if (Math.abs(x) < 1) continue;
    for (let c = 0; c < 12; c++) d.add(box(1.4, 0.48, 0.14, TRIM, x, 0.05 + c * 0.6, TD + 0.07));
    d.add(box(1.2, 1.25, 0.9, WHITE, x, B, TD - 0.45));
  }
  d.add(box(TW + 0.5, 0.6, TD - back + 0.5, WHITE, 0, B - 0.6, (TD + back) / 2));
  for (let k = 0; k < n + 2; k++) d.add(at(balustrade(pitch - 1.2, 1.1, WHITE, { t: detail.low ? 0.5 : 0.36 }), -TW / 2 + (k + 0.5) * pitch, B, TD - 0.45));
  // The podium the palace stands on.
  d.add(box(CW + 2 * LW + 2 * PW + 3, S, CD + PF + 3, WHITE, 0, B, (PF + 1.5 - CD - 1.5) / 2));
  // The centre block: the two galleries between solid end bays, the balustrade along the roof and
  // the pediment over the middle.
  d.add(box(CW, 2 * T - 0.03, CD - GD, WALL, 0, Y, -GD - (CD - GD) / 2), box(CW + 0.8, 0.5, CD - GD + 0.8, WHITE, 0, top - 0.4, -GD - (CD - GD) / 2));
  d.add(at(galleries(CW - 2 * EB, GD, H, E, 8, 0.46, true), 0, Y, -GD));
  for (const s of [-1, 1]) {
    d.add(at(endBay(EB, GD, H, E), s * (CW - EB) / 2, Y, -GD));
    d.add(at(balustrade((CW - PED) / 2 - 0.3, 1.1, WHITE), s * (CW + PED) / 4, top, -0.3));
    d.add(box(0.4, 1.1, CD, WHITE, s * (CW / 2 - 0.2), top, -CD / 2), at(row(CD - GD - 16, 3, win(1.5, 3.4)), s * CW / 2, Y + T + 1.3, -GD - 4 - (CD - GD - 16) / 2).rotateY(s * Math.PI / 2));
  }
  d.add(box(PED + 0.6, 1.1, 2.4, WALL, 0, top, -1.5), at(pediment(PED + 1, 4.2, 2.4, WALL, WHITE), 0, top + 1.6, -2.3));
  d.add(box(CW, 1.1, 0.4, WHITE, 0, top, -CD + 0.2));
  d.add(at(row(CW - 4, 9, win(1.6, 3.6)), 0, Y + T + 1.3, -CD).rotateY(Math.PI));
  for (const s of [-1, 1]) {
    // The links: lower, set back, three windows between pilasters under a balustrade.
    const lx = s * (CW + LW) / 2, lz = -6;
    d.add(box(LW, LH - 0.03, 16, WALL, lx, Y, lz - 8), box(LW + 0.1, 0.7, 16.5, WHITE, lx, Y + LH - 0.7, lz - 8));
    d.add(at(pilasters(LW - 1.4, 4, 0.7, LH - 0.7, 0.16, WHITE), lx, Y, lz), at(row(LW - 1.4, 3, win(1.3, 2.4, 'flat')), lx, Y + 1.6, lz + 0.01));
    d.add(at(balustrade(LW, 1, WHITE), lx, Y + LH, lz - 0.3), at(row(LW - 1.4, 3, win(1.3, 2.4, 'flat')), lx, Y + 1.6, lz - 16).rotateY(Math.PI));
    // The end pavilions: two shorter tiers of gallery between corner bays, under one pediment.
    const px = s * (CW / 2 + LW + PW / 2), pd = 3.6, eb = (PW - PG) / 2, pt = Y + 2 * PT;
    d.add(box(PW, 2 * PT - 0.03, 22, WALL, px, Y, PF - pd - 11), box(PW + 0.7, 0.4, 22.4, WHITE, px, pt - 0.4, PF - pd - 11.2));
    d.add(at(galleries(PG, pd, PT - 0.8, 0.8, 4, 0.3, false), px, Y, PF - pd));
    for (const e of [-1, 1]) d.add(at(endBay(eb, pd, PT - 0.8, 0.8), px + e * (PW - eb) / 2, Y, PF - pd));
    d.add(at(pediment(PW + 0.9, 3.5, 2.4, WALL, WHITE), px, pt + 0.5, PF + 0.3 - 2.4), box(PW - 1, 0.9, 20, WALL, px, pt, PF - pd - 11));
    for (const k of [0, 1]) d.add(at(row(20, 4, win(1.3, 2.7)), px + s * PW / 2, Y + k * PT + 0.9, PF - pd - 11).rotateY(s * Math.PI / 2));
  }
  // The tail: the zenana's courts and the kitchens trailing behind, on the same terrace.
  d.add(box(40, 10, 49.5, WALL, 0, B, -CD - 25.25), box(42.2, 0.7, 50.8, WHITE, 0, B + 10, -CD - 25.1), box(22, 8, 30, WALL, 0, B, -CD - 65));
  const tw = classicalDoor(1.6, 3.4, { m: WALL, trim: WHITE, fill: 'glass', top: null, depth: 0.2, frame: 0.28 });
  for (const s of [-1, 1]) d.add(at(row(48, detail.low ? 6 : 10, tw), s * 20, B + 4.6, -CD - 25).rotateY(s * Math.PI / 2));
  f.add(mergeByMaterial(d));
  addDetails(f, g);
  // From the lawn below the terrace, a little to the east: the whole north front.
  return { group: g, focus: f, view: [0.2, 0.13, 1], zoom: 0.5 };
}

import * as THREE from 'three';
import { M, mat, photo, box, cyl, lathe, at, inst, unitBox, chhatri, finial } from '../helpers.js';
import { mergeByMaterial, chhajja } from '../parts/components.js';
import { classicalDoor } from '../parts/colonial.js';
import { grandStair } from '../parts/doorways.js';
import { addDetails } from '../details/umaid-bhawan-palace.js';

// Umaid Bhawan's golden-yellow Chittar sandstone, laid dry in great dressed blocks, and a deeper
// shade of it for its bands, cornices and the reveals of its windows.
export const SAND = photo(mat('#d8b27a', 0.86), 'sandstone');
export const SAND_DEEP = mat('#bf9660', 0.88);

// The palace's measures, shared with js/details/umaid-bhawan-palace.js. From photographs and the
// plan: a symmetrical front about 190 m long facing east (here +z). In the middle the Durbar block,
// CW square, rises to the drum and the great dome over the central hall (its inner vault 31 m
// high, its lantern's tip about 56 m up). Wings WL long run out either side, three storeys (FL
// each) to their cornice at WH, with a stepped tower TX out from the middle where the wings meet
// the end pavilions; each end pavilion is EW square and a storey higher, under a domed kiosk.
export const P = { CW: 46, CH: 24, WL: 54, WD: 26, WH: 16, FL: 5.2, EW: 22, EH: 21, TX: 34 };

// Rows of tall windows on a face len long, three storeys, every `pitch`, as dark recesses with a
// deep sill and a lintel: [x, y, z, w, h, d] lists for inst, along x at z (facing +z when s = 1).
function windowRows(len, cx, z, s, { pitch = 4.4, floors = 3, h = 2.8, w = 1.6, y0 = 1.6, skip = 0 } = {}) {
  const holes = [], sills = [], n = Math.floor(len / pitch);
  for (let fl = 0; fl < floors; fl++) for (let k = 0; k < n; k++) {
    const x = cx - len / 2 + (k + 0.5) * (len / n);
    if (skip && Math.abs(x) < skip) continue;
    const y = y0 + fl * P.FL;
    holes.push([x, y, z + s * 0.02, w, h, 0.06]);
    sills.push([x, y - 0.2, z + s * 0.15, w + 0.5, 0.2, 0.32], [x, y + h, z + s * 0.12, w + 0.4, 0.28, 0.26]);
  }
  return { holes, sills };
}

// The same along z, on a face at x facing s (±x).
function windowRowsZ(len, cz, x, s, opts) {
  const { holes, sills } = windowRows(len, cz, 0, 1, opts);
  const swap = (l) => l.map(([a, y, b, w, h, d]) => [x + s * b, y, a, d, h, w]);
  return { holes: swap(holes), sills: swap(sills) };
}

export function buildUmaidBhawanPalace() {
  const g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  const { CW, CH, WL, WD, WH, FL, EW, EH, TX } = P, S = SAND, Sd = SAND_DEEP, d = new THREE.Group();
  const holes = [], sills = [], add = (r) => { holes.push(...r.holes); sills.push(...r.sills); };
  // The terrace the palace stands on, a storey of plain masonry with a moulded top.
  const TW = CW + 2 * WL + 2 * EW + 8;
  d.add(box(TW, 1.6, 58, Sd, 0, 0, 0), box(TW + 0.6, 0.35, 58.6, S, 0, 1.3, 0));
  const B = 1.6;
  // The Durbar block: plain walls in courses, its corners stepped back in the Art Deco way.
  d.add(box(CW, CH, CW, S, 0, B, 0));
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) d.add(box(5, CH + 3, 5, S, sx * (CW / 2 - 2.5), B, sz * (CW / 2 - 2.5)));
  for (const y of [B + FL, B + 2 * FL, B + 3 * FL]) d.add(box(CW + 0.5, 0.45, CW + 0.5, Sd, 0, y, 0));
  d.add(box(CW + 1.2, 0.95, CW + 1.2, Sd, 0, B + CH - 0.9, 0));
  add(windowRows(CW - 12, 0, CW / 2, 1, { pitch: 4.6, floors: 4, skip: 7 }));
  add(windowRows(CW - 12, 0, -CW / 2, -1, { pitch: 4.6, floors: 4 }));
  // The wings: three storeys on a deep plan, a chhajja (eave) at the top of each storey.
  for (const s of [-1, 1]) {
    const cx = s * (CW / 2 + WL / 2);
    d.add(box(WL - 0.04, WH, WD, S, cx, B, 0));
    for (const y of [B + FL, B + 2 * FL]) d.add(box(WL, 0.4, WD + 0.5, Sd, cx, y, 0));
    d.add(box(WL, 0.85, WD + 1, Sd, cx, B + WH - 0.8, 0), box(WL, 1.2, WD - 1, S, cx, B + WH, 0));
    for (const z of [-1, 1]) d.add(at(chhajja(WL, 1.6, 0.6, 0.2, Sd), cx, B + WH - 1.4, z * WD / 2).rotateY(z > 0 ? 0 : Math.PI));
    add(windowRows(WL - 6, cx, WD / 2, 1, { skip: 0 }));
    add(windowRows(WL - 6, cx, -WD / 2, -1));
    // The stepped tower where each wing meets its pavilion: three set-backs, each with a band.
    const tx = s * TX, th = [WH + 8, 4, 3.5, 3];
    let y = B, w = 12;
    for (const [k, h] of th.entries()) { d.add(box(w, h, w, k ? S : S, tx, y, 0), box(w + 0.6, 0.55, w + 0.6, Sd, tx, y + h - 0.5, 0)); y += h; w -= 2.6; }
    d.add(at(finial(3, M.gold), tx, y, 0));
    // The end pavilion, a storey higher, its corners stepped, under an octagonal kiosk.
    const ex = s * (CW / 2 + WL + EW / 2);
    d.add(box(EW, EH, EW + 6, S, ex, B, 0), box(EW + 1, 0.95, EW + 7, Sd, ex, B + EH - 0.9, 0));
    for (const y2 of [B + FL, B + 2 * FL, B + 3 * FL]) d.add(box(EW + 0.4, 0.4, EW + 6.4, Sd, ex, y2, 0));
    add(windowRows(EW - 6, ex, (EW + 6) / 2, 1, { floors: 4, pitch: 4 }));
    add(windowRows(EW - 6, ex, -(EW + 6) / 2, -1, { floors: 4, pitch: 4 }));
    add(windowRowsZ(EW, 0, ex + s * EW / 2, s, { floors: 4, pitch: 4.4 }));
    d.add(at(chhatri(4.2, 9, S, S), ex, B + EH, 0));
    for (const zz of [-1, 1]) d.add(at(chhatri(1.8, 4.6, S, S), ex + s * (EW / 2 - 2.2), B + EH, zz * (EW / 2 + 0.8)));
    // Kiosks along the wing's roof.
    for (const k of [0.25, 0.75]) for (const zz of [-1, 1]) d.add(at(chhatri(1.5, 4, S, S), s * (CW / 2 + WL * k), B + WH + 1.2, zz * (WD / 2 - 2)));
  }
  // The great dome: a tall drum ringed by windows and pilasters, a dome rising to a slight point
  // (Lanchester's echo of the Mughal dome), and a lantern under a little dome and a finial.
  const DY = B + CH + 3, R = 15.5;
  d.add(cyl(R + 1.5, R + 1.5, 1.2, Sd, 0, B + CH, 0, 48), cyl(R, R, 8.5, S, 0, DY - 1.8, 0, 48), cyl(R + 0.6, R + 0.6, 0.8, Sd, 0, DY + 6.7, 0, 48));
  const drumWin = [], drumPil = [];
  for (let k = 0; k < 16; k++) {
    const a = (k / 16) * Math.PI * 2, a2 = a + Math.PI / 16;
    drumWin.push([Math.sin(a) * (R + 0.02), DY - 0.2, Math.cos(a) * (R + 0.02), 1.6, 4.6, 0.05, a]);
    drumPil.push([Math.sin(a2) * (R + 0.25), DY - 1.8, Math.cos(a2) * (R + 0.25), 1, 8.5, 0.5, a2]);
  }
  const dome = lathe([[R, 0], [R * 0.99, R * 0.25], [R * 0.93, R * 0.5], [R * 0.8, R * 0.75], [R * 0.6, R * 0.97], [R * 0.36, R * 1.13], [R * 0.12, R * 1.2], [0, R * 1.22]], S, 48);
  d.add(at(dome, 0, DY + 7.5, 0));
  const LY = DY + 7.5 + R * 1.22 - 0.6;
  d.add(cyl(2.6, 2.8, 4.2, S, 0, LY, 0, 16), cyl(3.1, 3.1, 0.5, Sd, 0, LY + 4.2, 0, 16));
  d.add(at(lathe([[2.9, 0], [2.6, 1.3], [1.7, 2.5], [0.5, 3], [0, 3.05]], S, 16), 0, LY + 4.7, 0), at(finial(2.6, M.gold), 0, LY + 7.6, 0));
  // The entrance on the east: a porch of square piers before a tall recessed arch, up a flight
  // of steps from the drive.
  const fz = CW / 2;
  d.add(box(18, 12, 6, S, 0, B, fz + 3), box(19, 1, 7, Sd, 0, B + 12, fz + 3), box(14, 3, 4, S, 0, B + 13, fz + 2.5));
  d.add(at(classicalDoor(5, 9, { m: S, trim: Sd, depth: 0.6, frame: 0.8, top: null, keystone: false }), 0, B, fz + 6.01));
  for (const x of [-7.6, 7.6]) d.add(box(2.4, 12, 2.4, Sd, x, B, fz + 4.8));
  d.add(at(grandStair(B, 16, Sd, S, { n: 9, cheek: 0.6 }), 0, 0, fz + 6));
  void FL;
  f.add(mergeByMaterial(d));
  f.add(inst(unitBox(), holes.map(([x, y, z, w, h, dd]) => [x, y, z, w, h, dd]), M.recess), inst(unitBox(), sills, Sd));
  f.add(inst(unitBox(), drumWin, M.recess), inst(unitBox(), drumPil, Sd));
  addDetails(f, g);
  // From the south-east, across the front lawns.
  return { group: g, focus: f, view: [0.75, 0.26, 1], zoom: 0.92 };
}

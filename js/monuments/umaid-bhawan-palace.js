import * as THREE from 'three';
import { M, mat, photo, box, cyl, lathe, at, inst, unitBox, chhatri } from '../helpers.js';
import { mergeByMaterial, chhajja, jharokha, jali } from '../parts/components.js';
import { steps } from '../parts/doorways.js';
import { detail } from '../detail.js';
import { addDetails } from '../details/umaid-bhawan-palace.js';

// Umaid Bhawan's golden-yellow Chittar sandstone, laid dry in great dressed blocks, and a deeper
// shade of it for its bands, cornices and the reveals of its windows.
export const SAND = photo(mat('#d8b27a', 0.86), 'sandstone');
export const SAND_DEEP = mat('#bf9660', 0.88);

// The palace's measures, shared with js/details/umaid-bhawan-palace.js. From photographs and the
// plan: a symmetrical front about 195 m long facing east (here +z). In the middle the Durbar block,
// CW square and CH high, a columned portico PW wide and PD deep before it between two square
// turrets; on its roof a square base with a kiosk on each corner, the drum and the great banded
// dome over the central hall (its inner vault 31 m high, its finial's tip about 56 m up). Wings WL
// long run out either side: two storeys of colonnade (F2 each) under deep chhajjas and an attic,
// to a cornice at WH. Behind each wing stand two tiered towers, at (TX, TZ) and, a little lower,
// (TX2, TZ2). Each end pavilion is EW square, under a domed kiosk.
export const P = { CW: 46, CH: 24, WL: 54, WD: 26, WH: 16, FL: 5.2, F2: 6.4, EW: 22, EH: 18, TX: 71, TZ: -3, TX2: 50, TZ2: -13, PW: 30, PD: 9, PH: 9 };

// Rows of tall windows on a face len long, three storeys, every `pitch`, as dark recesses with a
// deep sill and a lintel: [x, y, z, w, h, d] lists for inst, along x at z (facing +z when s = 1).
function windowRows(len, cx, z, s, { pitch = 4.4, floors = 3, h = 2.8, w = 1.6, y0 = 1.6, skip = 0, fh = P.FL } = {}) {
  const holes = [], sills = [], n = Math.floor(len / pitch);
  for (let fl = 0; fl < floors; fl++) for (let k = 0; k < n; k++) {
    const x = cx - len / 2 + (k + 0.5) * (len / n);
    if (skip && Math.abs(x) < skip) continue;
    const y = y0 + fl * fh;
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

// Deep chhajjas round a square block w across, their tops at y.
function eaves(w, y, depth, m) {
  const g = new THREE.Group();
  [0, Math.PI / 2, Math.PI, -Math.PI / 2].forEach((a) => g.add(at(chhajja(w + depth * 1.6, depth, depth * 0.35, 0.16, m), Math.sin(a) * w / 2, y, Math.cos(a) * w / 2).rotateY(a)));
  return g;
}

// A small smooth dome of radius r on a low drum, under a stone finial: the caps of the turrets,
// the towers and the kiosks.
function cap(r, m, trim) {
  const g = new THREE.Group();
  g.add(cyl(r * 1.02, r * 1.02, r * 0.3, m, 0, 0, 0, 16), cyl(r * 1.1, r * 1.1, r * 0.08, trim, 0, r * 0.3, 0, 16));
  g.add(at(lathe([[r, 0], [r * 0.97, r * 0.22], [r * 0.85, r * 0.45], [r * 0.62, r * 0.66], [r * 0.3, r * 0.8], [r * 0.12, r * 0.84], [r * 0.16, r * 0.95], [r * 0.06, r * 1.05], [r * 0.03, r * 1.4], [0, r * 1.45]], m, 20), 0, r * 0.38, 0));
  return g;
}

// A tiered Rajput tower h high on a shaft w square, standing on y = 0: the plain shaft with a
// bracketed balcony on every face near its head, a deep chhajja, two stages stepping in, each
// with an opening on every face under its own chhajja, and a domed cap.
function tower(w, h, S, Sd, holes) {
  const g = new THREE.Group(), h1 = h * 0.64, h2 = h * 0.12, h3 = h * 0.09;
  g.add(box(w, h1, w, S, 0, 0, 0), box(w + 0.5, 0.5, w + 0.5, Sd, 0, h1 - 7.2, 0), box(w + 0.7, 0.6, w + 0.7, Sd, 0, h1 - 0.6, 0), eaves(w + 0.6, h1, 1.5, Sd));
  g.add(box(w - 1.8, h2, w - 1.8, S, 0, h1, 0), eaves(w - 1.6, h1 + h2, 1.2, Sd), box(w - 3.4, h3, w - 3.4, S, 0, h1 + h2, 0), eaves(w - 3.2, h1 + h2 + h3, 1, Sd));
  g.add(at(cap((w - 3.8) / 2, S, Sd), 0, h1 + h2 + h3, 0), cyl(0.04, 0.04, 2.5, M.steel, 0, h * 0.97, 0, 6));
  [0, Math.PI / 2, Math.PI, -Math.PI / 2].forEach((a) => {
    const ax = Math.sin(a), az = Math.cos(a);
    if (!detail.low) g.add(at(jharokha(2.8, 3.4, S, { roof: 'flat', trim: Sd, d: 1.3 }), ax * w / 2, h1 - 6, az * w / 2).rotateY(a));
    holes.push([ax * (w / 2 + 0.02), h1 - 6, az * (w / 2 + 0.02), 1.6, 3, 0.06, a], [ax * (w / 2 + 0.02), h1 - 13.5, az * (w / 2 + 0.02), 1.2, 2.4, 0.06, a], [ax * (w / 2 - 0.88), h1 + 0.9, az * (w / 2 - 0.88), 2.2, h2 - 2, 0.06, a], [ax * (w / 2 - 1.68), h1 + h2 + 0.7, az * (w / 2 - 1.68), 1.4, h3 - 1.5, 0.06, a]);
  });
  return g;
}

export function buildUmaidBhawanPalace() {
  const g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  const { CW, CH, WL, WD, WH, FL, F2, EW, EH, TX, TZ, TX2, TZ2, PW, PD, PH } = P, S = SAND, Sd = SAND_DEEP, d = new THREE.Group();
  const holes = [], sills = [], cols = [], add = (r) => { holes.push(...r.holes); sills.push(...r.sills); };
  // A square column w across and h high at (x, y, z), with its base block and capital.
  const col = (x, y, z, w, h) => { cols.push([x, y, z, w * 1.35, 0.5, w * 1.35], [x, y + 0.5, z, w, h - 1.1, w], [x, y + h - 0.6, z, w * 1.2, 0.25, w * 1.2], [x, y + h - 0.35, z, w * 1.45, 0.35, w * 1.45]); };
  // The terrace the palace stands on, a storey of plain masonry with a moulded top.
  const TW = CW + 2 * WL + 2 * EW + 8;
  d.add(box(TW, 1.6, 58, Sd, 0, 0, 0), box(TW + 0.6, 0.35, 58.6, S, 0, 1.3, 0));
  const B = 1.6, fz = CW / 2;
  // The Durbar block: plain walls in courses under a cornice, a band of small openings below it.
  d.add(box(CW, CH, CW, S, 0, B, 0));
  for (const y of [B + FL, B + 2 * FL, B + 3 * FL]) d.add(box(CW + 0.5, 0.45, CW - 0.5, Sd, 0, y, -0.5));
  d.add(box(CW + 1.2, 0.95, CW + 1.2, Sd, 0, B + CH - 0.9, 0));
  add(windowRows(CW - 16, 0, -fz, -1, { pitch: 4.6, floors: 4 }));
  for (let k = -9; k <= 9; k++) holes.push([k * 1.5, B + CH - 4.4, fz + 0.02, 0.8, 1.7, 0.06]);
  add(windowRows(PW - 2, 0, fz, 1, { pitch: 4.6, floors: 1, y0: B + PH + 3.2, h: 2.6 }));
  // The four square turrets at its corners, taller than its roof, each with a tall screened
  // window, a balcony on brackets near the top and a small dome. The front pair flank the portico.
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    const x = sx * (CW / 2 - 3.2), z = sz * (CW / 2 - 2.2), a = sz > 0 ? 0 : Math.PI, th = CH + 9.5;
    d.add(box(8.4, th, 8.4, S, x, B, z), box(9, 0.6, 9, Sd, x, B + CH - 0.9, z), box(9.2, 0.7, 9.2, Sd, x, B + th - 0.7, z), at(eaves(8.6, B + th - 0.7, 1.3, Sd), x, 0, z), at(cap(3.5, S, Sd), x, B + th, z));
    d.add(box(2.6, 10, 0.1, jali(Sd), x, B + 4, z + sz * 4.22), box(3.4, 0.5, 0.4, Sd, x, B + 14, z + sz * 4.3), box(3.4, 0.4, 0.5, Sd, x, B + 3.6, z + sz * 4.3));
    holes.push([x, B + 4, z + sz * 4.21, 2.6, 10, 0.02], [x + sx * 4.22, B + CH + 3.4, z, 0.06, 3, 1.6]);
    if (!detail.low) d.add(at(jharokha(3, 3.6, S, { roof: 'flat', trim: Sd, d: 1.3 }), x, B + CH + 3, z + sz * 4.2).rotateY(a));
    holes.push([x, B + CH + 3, z + sz * 4.21, 1.8, 3.2, 0.06]);
  }
  // The portico on the east: ten square columns in a row at the head of a flight of steps as wide
  // as itself, an entablature under a deep chhajja, a parapet, and three tall doors in the wall.
  d.add(box(PW, 0.3, PD, Sd, 0, B, fz + PD / 2), box(PW + 0.6, 1.5, PD + 0.3, S, 0, B + PH, fz + PD / 2), box(PW + 1, 0.4, PD + 0.6, Sd, 0, B + PH + 1.5, fz + PD / 2 + 0.1), box(PW + 0.4, 1.4, PD, S, 0, B + PH + 1.9, fz + PD / 2));
  d.add(at(chhajja(PW + 3.6, 2, 0.7, 0.2, Sd), 0, B + PH + 1.5, fz + PD + 0.3));
  for (const s of [-1, 1]) d.add(at(chhajja(PD, 2, 0.7, 0.2, Sd), s * (PW / 2 + 0.3), B + PH + 1.5, fz + PD / 2).rotateY(s * Math.PI / 2));
  for (let k = 0; k < 10; k++) col(-PW / 2 + 0.8 + k * (PW - 1.6) / 9, B + 0.3, fz + PD - 0.8, 1.1, PH - 0.3);
  for (const s of [-1, 1]) col(s * (PW / 2 - 0.8), B + 0.3, fz + PD / 2 - 0.4, 1.1, PH - 0.3);
  for (const x of [-8, 0, 8]) { holes.push([x, B + 0.3, fz + 0.02, x ? 2.6 : 3.4, x ? 5.6 : 6.6, 0.06]); sills.push([x, B + (x ? 5.9 : 6.9), fz + 0.15, x ? 3.4 : 4.2, 0.4, 0.3]); }
  d.add(at(steps(PW, B, 8, Sd, 0.55), 0, 0, fz + PD));
  for (const s of [-1, 1]) d.add(box(1.6, B + 0.5, 5.4, S, s * (PW / 2 + 0.8), 0, fz + PD + 2.2));
  // The wings: a core three storeys high behind two storeys of colonnade, square columns on
  // every floor, a pierced balustrade between those of the upper one, a deep chhajja over each
  // storey, and an attic of small openings under the cornice.
  for (const s of [-1, 1]) {
    const cx = s * (CW / 2 + WL / 2), lz = WD / 2 - 0.7, n = 12;
    d.add(box(WL - 0.04, WH, WD - 3.2, S, cx, B, -1.6));
    for (let t = 0; t < 2; t++) {
      d.add(box(WL, 0.5, 3.4, Sd, cx, B + (t + 1) * F2 - 0.5, WD / 2 - 1.6), at(chhajja(WL, 1.9, 0.65, 0.2, Sd), cx, B + (t + 1) * F2 - 0.1, WD / 2 + 0.1));
      for (let k = 0; k <= n; k++) col(cx - WL / 2 + 0.7 + k * (WL - 1.4) / n, B + t * F2, lz, 0.85, F2 - 0.5);
    }
    d.add(box(WL - 1.4, 1.05, 0.12, jali(S), cx, B + F2, lz), box(WL - 1.4, 0.16, 0.3, Sd, cx, B + F2 + 1.05, lz));
    add(windowRows(WL - 5, cx, WD / 2 - 3.2, 1, { pitch: (WL - 1.4) / n, floors: 2, fh: F2, y0: B + 0.4, h: 3.6, w: 1.8 }));
    d.add(box(WL, WH - 2 * F2, 3.2, S, cx, B + 2 * F2, WD / 2 - 1.6));
    for (let k = 0; k < 2 * n; k++) holes.push([cx - WL / 2 + 1.8 + k * (WL - 3.6) / (2 * n - 1), B + 2 * F2 + 0.7, WD / 2 + 0.02, 1.1, 1.3, 0.06]);
    d.add(box(WL, 0.85, WD + 1, Sd, cx, B + WH - 0.8, 0), box(WL, 1.2, WD - 1, S, cx, B + WH, 0));
    d.add(at(chhajja(WL, 1.6, 0.6, 0.2, Sd), cx, B + WH - 1.4, -WD / 2).rotateY(Math.PI));
    for (const y of [B + FL, B + 2 * FL]) d.add(box(WL, 0.4, 0.5, Sd, cx, y, -WD / 2));
    add(windowRows(WL - 6, cx, -WD / 2, -1));
    // The two tiered towers behind the wing, the inner one a little lower.
    for (const [tx, tz, tw, th] of [[TX, TZ, 9, 43], [TX2, TZ2, 8, 38]]) {
      const hs = [];
      d.add(at(tower(tw, th, S, Sd, hs), s * tx, B, tz));
      for (const [x, y, z, w, h, dd, a] of hs) holes.push([s * tx + x, B + y, tz + z, w, h, dd, a]);
    }
    // The end pavilion, a little higher than the wing, under an octagonal kiosk.
    const ex = s * (CW / 2 + WL + EW / 2);
    d.add(box(EW, EH, EW + 6, S, ex, B, 0), box(EW + 1, 0.95, EW + 7, Sd, ex, B + EH - 0.9, 0));
    for (const y2 of [B + FL, B + 2 * FL]) d.add(box(EW + 0.4, 0.4, EW + 6.4, Sd, ex, y2, 0));
    add(windowRows(EW - 6, ex, (EW + 6) / 2, 1, { floors: 3, pitch: 4 }));
    add(windowRows(EW - 6, ex, -(EW + 6) / 2, -1, { floors: 3, pitch: 4 }));
    add(windowRowsZ(EW, 0, ex + s * EW / 2, s, { floors: 3, pitch: 4.4 }));
    d.add(at(chhatri(4.2, 9, S, S), ex, B + EH, 0));
    for (const zz of [-1, 1]) d.add(at(chhatri(1.8, 4.6, S, S), ex + s * (EW / 2 - 2.2), B + EH, zz * (EW / 2 + 0.8)));
  }
  // On the Durbar block's roof the square base of the dome, a turret block with a domed kiosk on
  // each of its corners; the drum, ringed by windows and pilasters, a balcony on brackets to each
  // side; and the great dome, a low shell banded in horizontal courses under a stepped lotus
  // finial.
  const R = 14.5, BY = B + CH, DY = BY + 5, DH = 7.5;
  d.add(box(35, 5, 35, S, 0, BY, 0), box(35.8, 0.6, 35.8, Sd, 0, DY - 0.6, 0));
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    const x = sx * 14.6, z = sz * 14.6;
    d.add(box(7, 10.5, 7, S, x, BY, z), box(7.6, 0.6, 7.6, Sd, x, BY + 9.9, z), at(eaves(7.2, BY + 9.9, 1.2, Sd), x, 0, z), at(chhatri(2.5, 5.6, S, S), x, BY + 10.5, z));
    holes.push([x, BY + 5.6, z + sz * 3.52, 1.4, 2.8, 0.06], [x + sx * 3.52, BY + 5.6, z, 0.06, 2.8, 1.4]);
  }
  d.add(cyl(R, R, DH, S, 0, DY, 0, 48), cyl(R + 0.7, R + 0.7, 0.9, Sd, 0, DY + DH, 0, 48));
  const drumWin = [], drumPil = [];
  for (let k = 0; k < 16; k++) {
    const a = (k / 16) * Math.PI * 2, a2 = a + Math.PI / 16;
    drumWin.push([Math.sin(a) * (R + 0.02), DY + 1.6, Math.cos(a) * (R + 0.02), 1.6, 4.2, 0.05, a]);
    drumPil.push([Math.sin(a2) * (R + 0.25), DY, Math.cos(a2) * (R + 0.25), 1, DH, 0.5, a2]);
    if (k % 4 === 0 && !detail.low) d.add(at(jharokha(4, 4.4, S, { trim: Sd, d: 1.7 }), Math.sin(a) * (R - 0.1), DY + 1.4, Math.cos(a) * (R - 0.1)).rotateY(a));
  }
  const N = 13, prof = [[R, 0]];
  for (let k = 1; k <= N; k++) { const t = (k / N) * Math.PI / 2 * 0.97, r = R * Math.cos(t), y = R * 0.84 * Math.sin(t); prof.push([r + 0.3, y - 0.12], [r, y]); }
  d.add(at(lathe(prof, S, 48), 0, DY + DH + 0.9, 0));
  const LY = DY + DH + 0.9 + R * 0.84 - 0.25;
  d.add(at(lathe([[2.9, 0], [2.9, 0.5], [2.2, 0.5], [2.2, 1], [1.5, 1], [1.5, 1.5], [1.9, 1.9], [1.3, 2.5], [0.5, 2.8], [0.8, 3.2], [0.35, 3.7], [0.12, 4.6], [0, 4.8]], S, 20), 0, LY, 0));
  f.add(mergeByMaterial(d));
  f.add(inst(unitBox(), holes, M.recess), inst(unitBox(), sills, Sd), inst(unitBox(), cols, S));
  f.add(inst(unitBox(), drumWin, M.recess), inst(unitBox(), drumPil, Sd));
  addDetails(f, g);
  // From the east, a little to the south, across the front lawns.
  return { group: g, focus: f, view: [0.5, 0.2, 1], zoom: 0.8 };
}

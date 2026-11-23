import * as THREE from 'three';
import { M, mat, mesh, box, cyl, at, onFace, FACES, chhatri, hemi, ribbed, kalash } from '../helpers.js';
import { grandStair } from '../parts/doorways.js';
import { mergeByMaterial, chhajja, railing, jharokha, banglaRoof, cuspedArchGeo, panel, jali } from '../parts/components.js';
import { arcadeSkin, cellRow } from '../parts/mughal.js';
import { sikhDome, arcadeStorey, GILT } from '../parts/sikh.js';
import { addDetails } from '../details/gurudwara-bangla-sahib.js';

const DP = 0.4;

// A solid marble wall len long in two floors (the upper from H1 to H), facing +z from z = 0 to DP:
// bays about `pitch` wide between pilasters, each with a door or a window below and a window
// above, a small railed balcony under every other upper window, and a string between the floors.
// skip: [from, to] along the wall where another block stands against it.
function wall(len, H1, H, pitch, skip = null) {
  const g = new THREE.Group(), n = Math.max(1, Math.round(len / pitch)), p = len / n, cells = [], W = M.marble, Ws = M.marbleShade;
  for (let k = 0; k < n; k++) {
    const cx = (k - (n - 1) / 2) * p;
    if (skip && cx > skip[0] && cx < skip[1]) continue;
    cells.push(k % 2 ? [cx, 1.3, 1.5, 2.7, 'room'] : [cx, 0.05, 1.8, 3.9, 'door'], [cx, H1 + 1.1, 1.6, 2.9, 'room']);
    if (k % 2 === 0) g.add(box(2.7, 0.14, 0.75, Ws, cx, H1 + 0.92, DP + 0.37), at(railing(2.5, 0.8, 0.1, W, 1.25), cx, H1 + 1.06, DP + 0.68));
  }
  g.add(arcadeSkin(len, H, cells, DP, W, { trim: Ws, fill: 'room' }), box(len, 0.28, 0.16, Ws, 0, H1 - 0.1, DP + 0.08));
  for (let k = 0; k <= n; k++) {
    const x = -len / 2 + k * p;
    if (!(skip && x > skip[0] && x < skip[1])) g.add(box(0.5, H, 0.14, W, Math.max(-len / 2 + 0.25, Math.min(len / 2 - 0.25, x)), 0, DP + 0.07));
  }
  return g;
}

// An eave round a rectangle w × d with its top at y, and the parapet over it.
function cornice(w, d, y, m, ph = 0.9) {
  const g = new THREE.Group();
  for (const [a, len, dist] of [[0, w, d / 2], [Math.PI, w, d / 2], [Math.PI / 2, d, w / 2], [-Math.PI / 2, d, w / 2]]) g.add(onFace(at(chhajja(len + 2.2, 1.1, 0.4, 0.16, m), 0, y, 0), a, dist));
  g.add(box(w + 0.4, ph, d + 0.4, m, 0, y, 0));
  return g;
}

// A roof pavilion: three small arches w wide to the front under a bangla roof (in roofM).
function pavilion(w, h, dpt, m, roofM) {
  const g = new THREE.Group();
  g.add(box(w, h, dpt - 0.4, m, 0, 0, -(dpt - 0.4) / 2), arcadeSkin(w, h, cellRow(3, w / 3.2, 0.1, w / 4.6, h * 0.78), 0.4, m, { trim: M.marbleShade, fill: 'room' }));
  g.add(box(w + 0.5, 0.22, dpt + 0.6, m, 0, h, -dpt / 2 + 0.2), at(banglaRoof(w + 0.6, dpt + 0.7, w * 0.2, roofM), 0, h + 0.3, -dpt - 0.15));
  return g;
}

// Gurdwara Bangla Sahib, New Delhi, on the site of Raja Jai Singh's bungalow where Guru Har Krishan
// stayed in 1664; the present building is mostly of after 1947. From photographs (Commons: Front
// view of Gurudwara Bangla Sahib, Delhi.jpg; Gurudwara Bangla Sahib in New Delhi 03-2016 img3; the
// views across the sarovar): a white marble hall of two storeys with solid panelled walls, windows
// and small balconies, and in the middle of its front (+z) an entrance block standing forward and
// a storey higher. That block's front has the door in the middle under a tall cusped arch with a
// balcony in it, and either side rows of small domed jharokhas in two tiers; two low white ribbed
// domes stand before it at ground level beside the door; a red board lettered in gold sits on its
// cornice. On its roof are gilt-domed kiosks at the corners and a gilt-roofed pavilion at the
// middle of the front, and behind them the square dome room: a plain stage with a balustraded
// gallery, a stage of three arches a face with little kiosks at its corners, and the gilt dome.
// The wings carry white marble pavilions under bangla roofs. A broad stair runs down from the
// hall's west side (-x) to the sarovar.
export function buildGurudwaraBanglaSahib() {
  const g = new THREE.Group(), f = new THREE.Group(), W = M.marble, Ws = M.marbleShade, G = GILT;
  g.add(f);
  // The hall w × d, its floors H1 and H high, centred at z = bz; the entrance block tw × td and
  // TH high, centred at z = tz, its front 6 m forward of the wings.
  const P = 1.8, w = 52, d = 30, H1 = 6.2, H = 11.6, bz = -4, tw = 28, td = 20, TH = 15.2, tz = 7, fz = tz + td / 2;
  f.add(box(w + 8, P, d + 14, W, 0, 0, -1), box(w + 8.5, 0.25, d + 14.5, Ws, 0, P - 0.25, -1));
  f.add(at(grandStair(P, 20, W, Ws, { n: 9, landing: 0 }), 0, 0, bz + d / 2 + 10));
  // The stair down to the sarovar.
  f.add(at(grandStair(P, 30, W, Ws, { n: 9, landing: 0 }), -w / 2 - 4, 0, bz).rotateY(-Math.PI / 2));
  // The hall.
  const hall = new THREE.Group();
  hall.add(box(w - 2 * DP, H, d - 2 * DP, W));
  hall.add(onFace(wall(w, H1, H, 4.4, [-tw / 2, tw / 2]), 0, d / 2 - DP), onFace(wall(w, H1, H, 4.4), Math.PI, d / 2 - DP));
  for (const s of [-1, 1]) hall.add(onFace(wall(d - 2 * DP, H1, H, 4.2), s * Math.PI / 2, w / 2 - DP));
  hall.add(cornice(w, d, H, W));
  // On each wing a white pavilion under a bangla roof, and small kiosks at the hall's corners.
  for (const s of [-1, 1]) {
    hall.add(at(pavilion(6.4, 3, 3, W, W), s * (w / 2 - 6.5), H + 0.9, d / 2 - 1.5));
    for (const z of [-1, 1]) hall.add(at(chhatri(1, 3.4, W), s * (w / 2 - 1.5), H + 0.9, z * (d / 2 - 1.5)));
  }
  f.add(at(hall, 0, P, bz));
  // The entrance block: its front, then the sides and back where they stand clear of the hall.
  const t = new THREE.Group(), y1 = 6.5, y2 = 10.7, cols = [5.5, 8.4, 11.4];
  t.add(box(tw - 2 * DP, TH, td - 2 * DP, W));
  const front = [[0, 0.05, 3.6, 5.2, 'door']];
  for (const s of [-1, 1]) front.push([s * cols[1], 0.05, 1.7, 3.6, 'door'], [s * cols[2], 1.2, 1.4, 2.6, 'room']);
  t.add(onFace(arcadeSkin(tw, TH, front, DP, W, { trim: Ws }), 0, td / 2 - DP));
  const top = cellRow(4, 4.4, 12.3, 1.5, 2.2);
  t.add(onFace(arcadeSkin(tw, TH, top, DP, W, { trim: Ws, fill: 'room' }), Math.PI, td / 2 - DP));
  for (const s of [-1, 1]) {
    t.add(onFace(arcadeSkin(td - 2 * DP, TH, [...top, [-s * 7, 1.2, 1.5, 2.6, 'room']], DP, W, { trim: Ws, fill: 'room' }), s * Math.PI / 2, tw / 2 - DP));
    for (const y of [y1, y2]) t.add(onFace(at(jharokha(1.9, 2.1, W, { d: 0.9, roof: 'dome', trim: Ws }), 0, y, 0), s * Math.PI / 2, tw / 2 + 0.02, -s * 7));
  }
  // The front's pilasters and strings, the cusped arch over the door with its balcony, and the
  // jharokhas: three columns a side, the inner one only in the upper tier.
  const z0 = td / 2;
  for (const x of [-tw / 2 + 0.3, -9.9, -6.95, -3.6, 3.6, 6.95, 9.9, tw / 2 - 0.3]) t.add(box(Math.abs(x) < 4 ? 0.7 : 0.4, TH, Math.abs(x) < 4 ? 0.3 : 0.14, W, x, 0, z0 + (Math.abs(x) < 4 ? 0.15 : 0.07)));
  for (const s of [-1, 1]) for (const y of [5.75, 10]) t.add(box(tw / 2 - 3.95, 0.25, 0.14, Ws, s * (tw / 4 + 1.975), y, z0 + 0.07));
  t.add(box(6.5, 5.9, 0.04, Ws, 0, 6, z0 + 0.02), mesh(cuspedArchGeo(6.5, 2.6, 0.5), W, 0, 11.9, z0 + 0.25), box(6.5, 0.3, 0.36, Ws, 0, 11.9, z0 + 0.18), box(6.5, 0.25, 0.3, Ws, 0, 5.75, z0 + 0.15));
  t.add(at(jharokha(3, 2.5, W, { d: 1.1, roof: 'dome', trim: Ws }), 0, 7.2, z0 + 0.02));
  // A pierced grille over the arch, under the board.
  t.add(at(panel(5.6, 1.6, 0.14, Ws, jali(W)), 0, 12.7, z0 + 0.01));
  for (const s of [-1, 1]) cols.forEach((x, k) => { for (const y of k ? [y1, y2] : [y2]) t.add(at(jharokha(1.9, 2.1, W, { d: 0.9, roof: 'dome', trim: Ws }), s * x, y, z0 + 0.02)); });
  t.add(cornice(tw, td, TH, W));
  // On its roof: gilt-domed kiosks at the corners, and the gilt-roofed pavilion at the front.
  const R0 = TH + 0.9;
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) t.add(cyl(1.9, 1.9, 0.5, W, sx * (tw / 2 - 2.2), R0, sz * (td / 2 - 2.2), 8), at(chhatri(1.7, 5.4, W, G), sx * (tw / 2 - 2.2), R0 + 0.5, sz * (td / 2 - 2.2)));
  t.add(at(pavilion(8, 3.2, 3, W, G), 0, R0, td / 2 - 2.2));
  for (const s of [-1, 1]) t.add(at(chhatri(0.6, 2.2, W), s * 4.9, R0 + 3.2, td / 2 - 3.6));
  // The dome room: a plain stage, the gallery behind its balustrade, the stage of three arches a
  // face, kiosks at its corners, a low drum and the gilt dome.
  const s1 = 12, h1 = 2.6, s2 = 10, h2 = 4.4, R = 4.2;
  t.add(box(s1, h1, s1, W, 0, R0, 0), box(s1 + 0.8, 0.3, s1 + 0.8, Ws, 0, R0 + h1 - 0.3, 0));
  for (const a of FACES) t.add(onFace(at(railing(s1 + 0.5, 0.9, 0.12, W, 1.5), 0, R0 + h1, 0), a, s1 / 2 + 0.25), onFace(at(panel(s1 - 1.6, h1 - 1, 0.12, Ws, null), 0, R0 + 0.4, 0), a, s1 / 2 + 0.01));
  t.add(at(arcadeStorey(s2, h2, 3, W, { trim: Ws, fill: 'room', sill: 0.3, aw: 1.9, ah: 3.3, dp: 0.5 }), 0, R0 + h1, 0));
  let y = R0 + h1 + h2;
  t.add(cornice(s2, s2, y, W, 0.6));
  y += 0.6;
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) t.add(at(chhatri(0.75, 2.6, W), sx * (s2 / 2 - 0.5), y, sz * (s2 / 2 - 0.5)));
  t.add(cyl(R * 0.98, R * 1.02, 0.9, W, 0, y, 0, 32), at(sikhDome(R, G), 0, y + 0.9, 0));
  f.add(at(t, 0, P, tz));
  // The two low white ribbed domes on square kiosks before the front, either side of the door.
  for (const s of [-1, 1]) {
    const k = new THREE.Group();
    k.add(box(5.4, 3.4, 4.6, W), box(5.9, 0.3, 5.1, Ws, 0, 3.4, 0), cyl(2.5, 2.6, 0.5, W, 0, 3.7, 0, 24), at(ribbed(hemi(2.5, W, 24), 16, 0.05), 0, 4.2, 0), at(kalash(1.1, G), 0, 6.6, 0));
    k.add(at(arcadeSkin(5.4, 3.4, [[0, 0.05, 2.2, 2.8, 'room']], 0.3, W, { trim: Ws }), 0, 0, 2.3));
    f.add(at(k, s * 7.6, P, fz + 2.4));
  }
  // The red board on the cornice, lettered in gold Gurmukhi (the lettering is in the detail file).
  f.add(box(9.6, 1.5, 0.2, mat('#b3261e', 0.6), 0, P + TH + 0.9, fz + 0.9));
  mergeByMaterial(f);
  addDetails(f, g, { P, w, d, bz, TH, fz });
  // From the south-east: the entrance front, the dome over it, the sarovar beyond the hall.
  return { group: g, focus: f, view: [0.6, 0.26, 1], zoom: 0.78, batch: true };
}

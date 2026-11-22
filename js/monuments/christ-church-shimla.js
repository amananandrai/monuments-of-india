import * as THREE from 'three';
import { mat, box, at, photo } from '../helpers.js';
import { mergeByMaterial, clockFace, gableRoof } from '../parts/components.js';
import { gothicDoor, gothicWindow } from '../parts/colonial.js';
import { gothicPinnacle } from '../parts/sculpture.js';
import { addDetails } from '../details/christ-church-shimla.js';

// Christ Church on the Ridge: plastered stone washed a soft yellow, its buttresses, quoins, window
// surrounds and parapets picked out in white, under a steep roof of dark painted iron.
export const YELLOW = photo(mat('#e2c77a', 0.86), 'plaster');
export const WHITE = mat('#f1ece0', 0.82);
export const ROOF = mat('#4f4d4f', 0.75, 0.15);

// The church's measures, shared with js/details/christ-church-shimla.js. It stands on the Ridge
// with its tower to the open square (+z) at z = FZ. The nave runs back LEN, NW wide, its walls WH
// high; a chancel, narrower, closes the east end. The tower, T square, rises to TH at its parapet,
// with pinnacles at the corners to about 27.4 m.
export const S = { FZ: 14, LEN: 38, NW: 14, WH: 9.5, T: 6.2, TH: 22.4 };

export function buildChristChurchShimla() {
  const g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  const { FZ, LEN, NW, WH, T, TH } = S, d = new THREE.Group(), nz = FZ - T - LEN / 2;
  // The nave under its steep roof, with white-trimmed gables front and back, and the chancel.
  d.add(box(NW, WH, LEN, YELLOW, 0, 0, nz), at(gableRoof(NW + 1.2, LEN + 0.8, 7.2, ROOF), 0, WH, nz));
  d.add(box(9, WH - 1.5, 7, YELLOW, 0, 0, nz - LEN / 2 - 3.5), at(gableRoof(10, 7.6, 5, ROOF), 0, WH - 1.5, nz - LEN / 2 - 3.6));
  for (const z of [nz + LEN / 2 + 0.05, nz - LEN / 2 - 0.05]) d.add(at(gableRoof(NW + 0.2, 0.3, 6.8, YELLOW), 0, WH, z));
  // Side porches near the front.
  for (const s of [-1, 1]) {
    d.add(box(4, 5, 4.5, YELLOW, s * (NW / 2 + 2), 0, FZ - T - 4), at(gableRoof(4.6, 5, 2.4, ROOF).rotateY(Math.PI / 2), s * (NW / 2 + 2.2), 5, FZ - T - 4));
    d.add(at(gothicDoor(1.5, 3.4, { m: YELLOW, trim: WHITE, orders: 2, gable: false, pinnacles: false }), s * (NW / 2 + 4), 0, FZ - T - 4).rotateY(s * Math.PI / 2));
  }
  // Buttresses between tall lancets down both sides, white, each with a weathered set-off.
  const win = gothicWindow(1.5, 5.4, { m: YELLOW, trim: WHITE, depth: 0.25 });
  for (const s of [-1, 1]) for (let k = 0; k <= 6; k++) {
    const z = FZ - T - 1 - k * ((LEN - 2) / 6), x = s * NW / 2;
    d.add(box(0.8, WH - 1.2, 1, WHITE, x + s * 0.4, 0, z), box(0.8, 0.6, 0.7, WHITE, x + s * 0.3, WH - 1.2, z));
    if (k < 6 && k > 0) d.add(at(win.clone(), x, 2.2, z - (LEN - 2) / 12).rotateY(s * Math.PI / 2));
  }
  // The east window, three lights, at the back of the chancel.
  d.add(at(gothicWindow(3.2, 5.2, { m: YELLOW, trim: WHITE, depth: 0.3 }), 0, 1.8, nz - LEN / 2 - 7).rotateY(Math.PI));
  // The tower: a square shaft with white quoins and stepped corner buttresses, its door to the
  // Ridge, a lancet over it, the clock stage with a face on every side, the belfry's louvred
  // lancets, and a pierced parapet with four crocketed pinnacles.
  const tz = FZ - T / 2;
  d.add(box(T, TH, T, YELLOW, 0, 0, tz));
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    const x = sx * (T / 2 + 0.25), z = tz + sz * (T / 2 + 0.25);
    d.add(box(0.9, TH * 0.4, 0.9, WHITE, x, 0, z), box(0.7, TH * 0.35, 0.7, WHITE, x - sx * 0.1, TH * 0.4, z - sz * 0.1), box(0.55, TH * 0.25 - 0.4, 0.55, WHITE, x - sx * 0.18, TH * 0.75, z - sz * 0.18));
    d.add(at(gothicPinnacle(5, WHITE), sx * (T / 2 - 0.1), TH + 0.4, tz + sz * (T / 2 - 0.1)));
  }
  for (const y of [7.6, 12.8, 17.4, TH - 0.3]) d.add(box(T + 0.35, 0.3, T + 0.35, WHITE, 0, y, tz));
  d.add(box(T + 0.4, 1, T + 0.4, YELLOW, 0, TH, tz), box(T + 0.6, 0.25, T + 0.6, WHITE, 0, TH + 1, tz));
  d.add(at(gothicDoor(2, 4.4, { m: YELLOW, trim: WHITE, orders: 3, gable: false, pinnacles: false }), 0, 0, FZ));
  d.add(at(gothicWindow(1.4, 3.6, { m: YELLOW, trim: WHITE, depth: 0.2 }), 0, 8.4, FZ));
  const bel = gothicWindow(1.15, 3.4, { m: YELLOW, trim: WHITE, depth: 0.2, sill: false });
  for (const a of [0, Math.PI / 2, Math.PI, -Math.PI / 2]) {
    const c = at(clockFace(1.15), Math.sin(a) * (T / 2 + 0.03), 15.1, tz + Math.cos(a) * (T / 2 + 0.03));
    c.rotation.y = a;
    const b = at(bel.clone(), Math.sin(a) * T / 2, 18.1, tz + Math.cos(a) * T / 2);
    b.rotation.y = a;
    d.add(c, b);
  }
  // A cross on the nave's east gable.
  d.add(box(0.2, 1.6, 0.2, WHITE, 0, WH + 7, nz - LEN / 2), box(0.9, 0.2, 0.2, WHITE, 0, WH + 7.9, nz - LEN / 2));
  f.add(mergeByMaterial(d));
  addDetails(f, g);
  // From the Ridge, south-west of the tower.
  return { group: g, focus: f, view: [-0.7, 0.2, 1], zoom: 0.85 };
}

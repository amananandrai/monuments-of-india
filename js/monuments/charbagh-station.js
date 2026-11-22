import * as THREE from 'three';
import { M, mat, photo, box, cyl, at, onFace, FACES, archWall, chhatri, finial, inst, unitBox } from '../helpers.js';
import { mergeByMaterial, chhajja, merlons, lotusDome, mughalChhatri } from '../parts/components.js';
import { arcadeSkin } from '../parts/mughal.js';
import { detail } from '../detail.js';
import { addDetails } from '../details/charbagh-station.js';

// Charbagh Station, Lucknow (J. H. Hornimen, 1914–26), after photographs of its north front across
// the garden: a long range of two storeys painted deep red and picked out in white, both floors
// opening in pointed arcades; a central block standing forward behind a great arched carriage
// porch and carrying the largest dome between two eight-sided towers; a domed pavilion half-way
// along each wing and another, with corner turrets, at each end; and all along the roofs the small
// white domed kiosks and turrets that make the station look, from above, like a chessboard set
// out for a game. The platforms lie behind (js/details/charbagh-station.js).
// The front faces +z, at z = FZ. Shared with the detail file through CB.
export const CB = { W: 168, D: 18, FZ: 9, b: 0.8, G: 6.2, H: 11.5, CW: 34, CZ: 17, PORCH: 10, MX: 44, EX: 77, PW: 14 };
export const RED = photo(mat('#96302a', 0.8), 'plaster'), WHITE = mat('#f2ede1', 0.75), ROOF = mat('#8d5a4c', 0.9);

// A pavilion w wide whose front stands at z = zf, h high above the plinth, under a white dome r in
// radius: three arches on each floor, a white cornice and merlons, kiosks on the corners of its
// roof (or, with `turrets`, eight-sided turrets up its front corners, each under a kiosk).
function pavilion(w, zf, h, r, { turrets = false, door = false } = {}) {
  const { D, b, G } = CB, g = new THREE.Group(), z0 = -D / 2 + 1, top = b + h, cells = [], n = w > 20 ? 5 : 3, p = (w - (turrets ? 3 : 1)) / n;
  for (let k = 0; k < n; k++) { const x = (k - (n - 1) / 2) * p; cells.push([x, 0.4, p * 0.62, 4.9, door && k === (n - 1) / 2 ? 'door' : 'room'], [x, G + 0.5, p * 0.5, h - G - 1.6, 'room']); }
  g.add(box(w, h, zf - 1 - z0, RED, 0, b, (zf - 1 + z0) / 2), at(arcadeSkin(w, h, cells, 1, RED, { trim: WHITE }), 0, b, zf - 1));
  g.add(box(w + 0.6, 0.45, 0.5, WHITE, 0, b + G - 0.15, zf + 0.06), box(w + 0.8, 0.5, zf - z0 + 0.8, WHITE, 0, top, (zf + z0) / 2), box(w, 0.9, zf - z0, RED, 0, top + 0.5, (zf + z0) / 2), box(w - 1, 0.1, zf - z0 - 1, ROOF, 0, top + 1.4, (zf + z0) / 2));
  g.add(at(chhajja(w + 0.4, 1.3, 0.5, 0.12, WHITE), 0, top - 0.1, zf + 0.02));
  for (const a of FACES) { const side = Math.abs(Math.sin(a)) > 0.5; g.add(at(new THREE.Group().add(onFace(at(merlons((side ? zf - z0 : w) - 0.2, 0.7, 0.8, 0.3, WHITE), 0, top + 1.4, 0), a, (side ? w : zf - z0) / 2 - 0.2)), 0, 0, (zf + z0) / 2)); }
  // The dome: a square base, an eight-sided drum with a white band, the ribbed dome in its lotus.
  const dz = (zf + z0) / 2 + 1, dy = top + 1.4;
  g.add(box(r * 2.5, 1.2, r * 2.5, RED, 0, dy, dz), box(r * 2.6, 0.25, r * 2.6, WHITE, 0, dy + 1.2, dz));
  const drum = cyl(r * 1.04, r * 1.08, r * 0.5, RED, 0, dy + 1.45, dz, 8);
  drum.rotation.y = Math.PI / 8;
  g.add(drum, cyl(r * 1.14, r * 1.14, 0.25, WHITE, 0, dy + 1.45 + r * 0.5, dz, 24));
  g.add(at(lotusDome(r, WHITE, { ribs: 16, petals: detail.low ? 8 : 16 }), 0, dy + 1.7 + r * 0.5, dz), at(finial(r * 0.5), 0, dy + 1.7 + r * 0.5 + r * 1.8, dz));
  for (const x of [-1, 1]) for (const z of [-1, 1]) {
    const kx = x * (w / 2 - 1.2), kz = (zf + z0) / 2 + z * ((zf - z0) / 2 - 1.2);
    if (turrets && z > 0) continue;
    g.add(at(chhatri(1.0, 3.2, WHITE), kx, top + 1.4, kz));
  }
  if (turrets) for (const x of [-1, 1]) g.add(at(turret(1.5, top + 2.2), x * (w / 2 - 0.9), 0, zf - 0.6));
  return mergeByMaterial(g);
}
// An eight-sided turret r in radius and h high on y = 0: red, banded in white at each floor, under
// a white domed kiosk.
export function turret(r, h) {
  const { b, G, H } = CB, g = new THREE.Group();
  g.add(cyl(r, r * 1.06, h, RED, 0, 0, 0, 8));
  for (const y of [b + G - 0.15, b + H, h - 0.3]) if (y <= h) g.add(cyl(r * 1.12, r * 1.12, 0.35, WHITE, 0, y, 0, 8));
  g.add(cyl(r * 1.35, r * 1.1, 0.4, WHITE, 0, h, 0, 8), at(mughalChhatri(r * 1.15, r * 3.3, WHITE, { crescent: false, arches: !detail.low }), 0, h + 0.4, 0));
  return g;
}

export function buildCharbagh() {
  const g = new THREE.Group(), f = new THREE.Group(), { W, D, FZ, b, G, H, CW, CZ, PORCH, MX, EX, PW } = CB;
  g.add(f);
  const dd = 2.4, top = b + H, n = 40, p = W / n;
  const taken = (x) => Math.abs(x) < CW / 2 || Math.abs(Math.abs(x) - MX) < PW / 2 || Math.abs(Math.abs(x) - EX) < PW / 2;

  /* The long range: verandahs behind pointed arches on both floors, a white cornice, a red parapet. */
  f.add(box(W + 1.6, b, D + 1.6, WHITE, 0, 0, 0), box(W, H, D - dd - 0.6, RED, 0, b, -(dd - 0.6) / 2));
  const front = [], rear = [];
  for (let k = 0; k < n; k++) {
    const x = -W / 2 + (k + 0.5) * p;
    if (!taken(x)) front.push([x, 0.4, 2.9, 4.9, 'room'], [x, G + 0.5, 2.3, 3.6, 'room']);
    rear.push([x, 0.4, 2.6, 4.6, 'room'], [x, G + 0.9, 1.6, 2.8, 'jali']);
  }
  f.add(at(arcadeSkin(W, H, front, dd, RED, { trim: WHITE }), 0, b, FZ - dd));
  f.add(at(arcadeSkin(W, H, rear, 0.6, RED, { trim: WHITE, ring: !detail.low }), 0, b, -D / 2 + 0.6).rotateY(Math.PI));
  f.add(box(W + 0.8, 0.5, D + 0.8, WHITE, 0, top, 0), box(W, 0.9, D, RED, 0, top + 0.5, 0), box(W - 1, 0.1, D - 1, ROOF, 0, top + 1.4, 0));
  // The ends: two storeys of arched windows.
  for (const s of [-1, 1]) f.add(at(arcadeSkin(D - 1.2, H, [-4.5, 0, 4.5].flatMap((x) => [[x, 0.4, 2.4, 4.6, 'room'], [x, G + 0.9, 1.6, 2.8, 'jali']]), 0.6, RED, { trim: WHITE }), s * (W / 2 - 0.6), b, -0.6).rotateY(s * Math.PI / 2));

  /* The pavilions: the central block, one half-way along each wing, one at each end. */
  f.add(pavilion(CW, CZ, H + 3, 5.4, { turrets: true, door: true }));
  for (const s of [-1, 1]) f.add(at(pavilion(PW, FZ + 3, H + 1.6, 3.0), s * MX, 0, 0), at(pavilion(PW, FZ + 5, H + 2, 3.5, { turrets: true }), s * EX, 0, 0));
  // The two towers either side of the great dome, behind the block's front.
  for (const s of [-1, 1]) f.add(at(mergeByMaterial(turret(2.1, top + 8.6)), s * 10.5, 0, 9));

  /* The carriage porch: three pointed arches in front and two at each side, a terrace over it
     ringed by merlons, a kiosk on each front corner. */
  const pc = new THREE.Group(), pw = 24, ph = 7.4;
  for (const x of [-8, 0, 8]) pc.add(at(archWall(8, ph, 1.2, x ? 5 : 5.8, x ? 5.8 : 6.4, true, RED), x, 0, PORCH - 0.6));
  for (const s of [-1, 1]) for (const z of [2.45, 7.05]) pc.add(at(archWall(4.6, ph, 1.2, 3.2, 5.6, true, RED), s * (pw / 2 - 0.6), 0, z + 0.05).rotateY(Math.PI / 2));
  pc.add(box(pw + 0.8, 0.5, PORCH + 0.4, WHITE, 0, ph, PORCH / 2), box(pw, 0.8, PORCH, RED, 0, ph + 0.5, PORCH / 2), at(chhajja(pw + 0.4, 1.2, 0.45, 0.12, WHITE), 0, ph - 0.1, PORCH + 0.02));
  pc.add(at(merlons(pw - 0.2, 0.7, 0.8, 0.3, WHITE), 0, ph + 1.3, PORCH - 0.2));
  for (const s of [-1, 1]) {
    const m = merlons(PORCH - 0.4, 0.7, 0.8, 0.3, WHITE); m.rotation.y = Math.PI / 2;
    pc.add(at(m, s * (pw / 2 - 0.2), ph + 1.3, PORCH / 2), at(chhatri(1.1, 3.4, WHITE), s * (pw / 2 - 1.3), ph + 1.3, PORCH - 1.3));
    // White piers up the front corners and between the arches.
    for (const x of [4, 12]) pc.add(box(0.9, ph, 0.25, WHITE, s * x - (x === 12 ? s * 0.45 : 0), 0, PORCH + 0.1));
  }
  pc.add(box(pw + 3, 0.3, PORCH + 4, WHITE, 0, -0.3, PORCH / 2 + 1));
  f.add(at(mergeByMaterial(pc), 0, 0.5, CZ));

  /* The chessboard: white domed kiosks along the front and back of every roof, turrets between. */
  const pieces = new THREE.Group(), step = detail.low ? 4 : 2;
  for (let k = 0; k <= n; k += step) {
    const x = -W / 2 + k * p;
    if (taken(x) || taken(x - 0.5) || taken(x + 0.5)) continue;
    pieces.add(at(chhatri(0.95, 3.0, WHITE), x, top + 1.4, FZ - 1.1));
    if (!detail.low) pieces.add(at(chhatri(0.95, 3.0, WHITE), x, top + 1.4, -FZ + 1.1));
    if (!detail.low) pieces.add(at(chhatri(0.8, 2.5, WHITE), x + p, top + 1.4, 0));
  }
  f.add(mergeByMaterial(pieces));
  // White pilasters between the bays, a band at the upper floor, and the merlons of the parapet.
  const pil = [];
  for (let k = 0; k <= n; k++) { const x = -W / 2 + k * p; if (!taken(x)) pil.push([x, b, FZ + 0.05, 0.5, H, 0.14]); }
  f.add(inst(unitBox(), pil, WHITE));
  for (const s of [-1, 1]) for (const [x0, x1] of [[CW / 2, MX - PW / 2], [MX + PW / 2, EX - PW / 2]]) {
    const cx = s * (x0 + x1) / 2, len = x1 - x0;
    f.add(box(len, 0.45, 0.5, WHITE, cx, b + G - 0.15, FZ + 0.06), at(chhajja(len, 1.3, 0.5, 0.12, WHITE), cx, top - 0.1, FZ + 0.02));
    f.add(at(merlons(len, 0.7, 0.8, 0.3, WHITE), cx, top + 1.4, FZ - 0.2));
  }
  addDetails(f, g);
  // The home view: the front across the garden, a little to one side.
  return { group: g, focus: f, view: [0.3, 0.1, 1.2], zoom: 0.7 };
}

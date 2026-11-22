import * as THREE from 'three';
import { M, mat, mesh, box, cyl, at, onFace, clothGeometry, clothZ, doubleSided, surface, photo, flag } from '../helpers.js';
import { mouldings, pilasters, windowFrame, railing, chhajja, templeNiche, idol, placeAll, mergeByMaterial } from '../parts/components.js';
import { miniSpireGeo } from '../parts/sculpture.js';
import { trees, lampPosts, boats, umbrellas, stalls, along, scatter } from '../parts/realism.js';
import { detail } from '../detail.js';

// Dwarkadhish, finer architecture and the setting. Dimensions follow
// js/monuments/dwarkadhish-temple.js: the mound T = 5 high, 72 × 92 about z = 2; the temple's plinth
// P = 2 on it; storeys F = 4.2; the tower 16 square at z = -14 (15.2 from its fourth storey), its
// spire 14.5 wide and 41 high from y = 28; the hall's back at z = -5. The temple faces west (+z),
// the Gomti is on the south (+x).
// From photographs: every storey of the tower has a balcony at the middle of each free face (a
// dark opening behind a railing, under an eave), small niches with images either side and
// pilasters between; the spire is banded at its storeys, with amalaka stones on its corners; and
// from a mast at its top flies the dhwaja, a very large triangular flag in bands of colour with
// the sun and the moon on it, changed several times a day.
const STONE = photo(mat('#cdc1a8', 0.88), 'blocks'), SHADE = mat('#a89b84', 0.9);
const T = 5, F = 4.2, Y0 = 7, TZ = -14, SH = 41, SW = 14.5;
const prof = (t) => 1 - 0.62 * Math.pow(t, 1.8);
const cloth = (c) => doubleSided(surface(mat(c, 0.7), 'none'));
const BANDS = ['#e23a2e', '#f4b51e', '#2f8f4e', '#e8582a'].map(cloth), EMBLEM = surface(mat('#fbf6e6', 0.7), 'none');

function tower(d) {
  const t = at(new THREE.Group(), 0, Y0, TZ), free = [Math.PI, Math.PI / 2, -Math.PI / 2];
  t.add(mouldings(16, 16, [[0, 0.5, 0.25, SHADE], [0.5, 0.35, 0.12]], STONE));
  for (let k = 0; k < 5; k++) {
    const w = k < 3 ? 16 : 15.2, y = k * F;
    if (k) t.add(box(w + 1.7, 0.3, w + 1.7, SHADE, 0, y - 0.3, 0));
    for (const a of free) {
      t.add(onFace(at(pilasters(w - 0.7, 6, 0.5, F - 0.7, 0.14, STONE), 0, y + 0.05, 0), a, w / 2));
      t.add(onFace(at(windowFrame(2, 2.3, STONE, { shape: 'flat', frame: 0.22 }), 0, y + 1, 0), a, w / 2 + 0.02));
      if (k) t.add(onFace(at(railing(3.4, 0.9, 0.15, STONE, 1.7), 0, y, 0), a, w / 2 + 0.7));
      for (const s of [-1, 1]) t.add(onFace(at(templeNiche(0.9, 1.8, STONE, { figure: detail.low ? null : idol(1.5, STONE), crown: !detail.low }), 0, y + 1, 0), a, w / 2 + 0.02, s * w * 0.3));
      t.add(onFace(at(chhajja(w + 1.6, 0.9, 0.35, 0.12, SHADE), 0, y + F - 0.25, 0), a, w / 2));
    }
  }
  // The spire's storeys: a moulded band at each, on its cross-shaped plan, and amalakas at the corners.
  const am = new THREE.SphereGeometry(1, 14, 6);
  for (let k = 1; k < 7; k++) {
    const tt = k / 7, wt = SW * prof(tt), y = 5 * F + tt * SH, r = wt * 0.08;
    t.add(box(wt * 0.9, 0.45, wt * 0.9, SHADE, 0, y, 0), box(wt * 1.05, 0.45, wt * 0.66, SHADE, 0, y, 0), box(wt * 0.66, 0.45, wt * 1.05, SHADE, 0, y, 0));
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) { const o = mesh(am, STONE, sx * wt * 0.43, y + 0.45 + r * 0.42, sz * wt * 0.43); o.scale.set(r, r * 0.42, r); t.add(o); }
  }
  d.add(t);
}

// The dhwaja on its mast, the foot of the mast at y = 0: a triangular cloth 11 m long in four
// bands, flying east on the sea wind, with the sun and the crescent moon on both its faces.
function dhwaja() {
  const g = new THREE.Group(), h = 9.5, w = 13, fh = 7, top = h - 0.1;
  g.add(cyl(0.09, 0.14, h, M.wood, 0, 0, 0, 8), at(mesh(new THREE.SphereGeometry(0.22, 10, 8), M.gold), 0, h, 0));
  BANDS.forEach((m, i) => g.add(at(mesh(clothGeometry(w, fh, { taper: 0.94, y0: (fh / 4) * i, y1: (fh / 4) * (i + 1), ny: 3 }), m), 0.05, top, 0)));
  const moon = new THREE.Shape();
  moon.absarc(0, 0, 0.62, -Math.PI * 0.42, Math.PI * 0.42 + Math.PI, false);
  moon.absarc(0.3, 0.42, 0.6, Math.PI * 1.25, -Math.PI * 0.25, true);
  for (const [x, geo] of [[1.6, new THREE.CircleGeometry(0.62, 20)], [3.6, new THREE.ShapeGeometry(moon, 10)]]) {
    const y = -fh / 2 - (x / w) * (x / w) * fh * 0.08;
    for (const s of [-1, 1]) g.add(mesh(geo, doubleSided(EMBLEM), x, top + y, clothZ(w, fh, x, y) + s * 0.05));
  }
  return g;
}

// The mound's retaining wall (pilasters and a coping), the coping of the court's wall, and the
// small shrines of the ghat.
function courtAndGhat(d) {
  d.add(at(mouldings(72, 92, [[0, 0.6, 0.3, SHADE], [T - 0.55, 0.5, 0.25, STONE]], STONE), 0, 0, 2));
  for (const [a, len, dist, lat] of [[0, 72, 46, 0], [Math.PI, 72, 46, 0], [Math.PI / 2, 92, 36, 0], [-Math.PI / 2, 92, 36, 0]]) {
    const p = pilasters(len - 2, Math.round(len / 5), 0.7, T - 1.2, 0.18, STONE);
    d.add(at(onFace(at(p, 0, 0.6, 0), a, dist, lat), p.position.x, 0.6, p.position.z + 2));
  }
  for (const s of [-1, 1]) {
    d.add(box(73.2, 0.3, 1.7, SHADE, 0, T + 3.6, 2 + s * 45.4));
    for (const [z0, z1] of [[-44, 1.5], [12.5, 48]]) d.add(box(1.7, 0.3, z1 - z0, SHADE, s * 35.4, T + 3.6, (z0 + z1) / 2));
  }
  // Shrines along the ghat: a cell with a dark doorway towards the river under a small spire.
  const sp = [];
  for (const [z, s] of [[-64, 1], [-38, 0.8], [34, 0.9], [58, 1.1], [86, 0.8]]) {
    const c = at(new THREE.Group(), 64, 0.4, z);
    c.add(box(3.4 * s, 0.5, 3.4 * s, SHADE), box(2.6 * s, 2.6 * s, 2.6 * s, STONE, 0, 0.5, 0), box(3 * s, 0.25, 3 * s, SHADE, 0, 0.5 + 2.6 * s, 0));
    c.add(box(0.03, 1.7 * s, 1 * s, M.recess, 1.3 * s + 0.02, 0.5, 0));
    d.add(c);
    sp.push([64, 0.4 + 0.75 + 2.6 * s, z, 0, 2.3 * s]);
    d.add(at(flag(2.2, M.saffron), 64, 0.4 + 0.75 + 2.6 * s + 1.9 * 2.3 * s - 0.3, z));
  }
  d.add(placeAll(miniSpireGeo(), sp, STONE));
  // The ghat's steps, down into the Gomti along the whole quay.
  for (let k = 0; k < 5; k++) d.add(box(0.5, 0.42 - (k + 1) * 0.1 + 0.3, 250, STONE, 70.25 + k * 0.5, -0.3, 0));
}

export function addDetails(f, g) {
  const d = new THREE.Group();
  tower(d);
  courtAndGhat(d);
  f.add(mergeByMaterial(d));
  f.add(at(dhwaja(), 0, f.userData.spireTop - 1.4, TZ).rotateY(Math.PI / 2));
  // The ghat: lamps along the water's edge, the priests' umbrellas, boats moored at the steps, and
  // stalls at the foot of both flights.
  g.add(lampPosts(along(14, [68.5, -120], [68.5, 120]), { y: 0.4 }));
  g.add(umbrellas([[66, -14], [67, -8], [66.5, 20], [67, 27], [66, 44], [67, -50]], { y: 0.4 }));
  g.add(boats([[76, -30, 0.2], [77, -6, -0.1], [76.5, 16, 0.15], [78, 40, 0], [90, 70, 0.6], [110, -60, 1.2], [84, -82, 0.1]], { y: 0.14, canopy: true }));
  g.add(stalls([[60, -3, -Math.PI / 2], [60, 17, -Math.PI / 2], [-52, 0, Math.PI / 2], [-52, 14, Math.PI / 2], [-56, 0, Math.PI / 2]], { y: 0.2 }));
  // Neem and peepal: a few in the court and on the ghat; the coast here is dry.
  g.add(trees([[-28, -34], [28, 42], [-29, 14]], { kind: 'peepal', seed: 3, y: T, h: 9 }));
  g.add(trees(scatter(8, [56, 66, -124, 124], { seed: 7, gap: 20, avoid: [[50, 70, -12, 26]] }), { kind: 'neem', seed: 7, y: 0.4, h: 8 }));
}

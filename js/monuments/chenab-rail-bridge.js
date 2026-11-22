import * as THREE from 'three';
import { M, V, mat, box, at, strut, surface } from '../helpers.js';
import { mergeByMaterial } from '../parts/components.js';
import { heightField, fbm, ridged, smooth } from '../parts/terrain.js';
import { detail } from '../detail.js';
import { addDetails } from '../details/chenab-rail-bridge.js';

// The bridge runs along x: the Bakkal (Katra) end at -x, the Kauri (Srinagar) end at +x, the
// Chenab flowing along z far below. Heights are above the river (y = 0).
// DECK: the deck's top, 359 m up. The arch spans SPAN between its springings at x = ±SPAN / 2; the
// deck runs from X0 straight to XC and then curves (radius RAD) to the Kauri abutment, LENGTH in all.
export const DECK = 359, SPAN = 467, X0 = -418, XC = 480, RAD = 650, LENGTH = 1315;
const ARC = LENGTH - (XC - X0);

// The painted steel (a grey olive green) and the concrete of the piers and foundations.
export const STEEL = surface(mat('#7c8a72', 0.55, 0.35), 'none');
export const CONCRETE = mat('#b3aea3', 0.9);

// The deck's centre line at distance s from the Bakkal abutment: [x, z, heading].
export function path(s) {
  if (s <= XC - X0) return [X0 + s, 0, 0];
  const a = (s - (XC - X0)) / RAD;
  return [XC + RAD * Math.sin(a), RAD * (1 - Math.cos(a)), a];
}
// An object laid along the path at s (its own length along x), h above the river.
export function onPath(o, s, y) {
  const [x, z, a] = path(s);
  o.position.set(x, y, z);
  o.rotation.y = -a;
  return o;
}
const pathZ = (x) => (x <= XC ? 0 : RAD * (1 - Math.cos(Math.asin(Math.min(1, (x - XC) / RAD)))));

// The gorge. Across the river (u, measured from its bed, which wanders along z): the bed, steep
// walls to the arch's foundations 213 m up, then the Bakkal side climbing on steeply past the
// abutment, and the Kauri side easing into a long shoulder that the curved viaduct crosses.
const LEFT = [[0, -3], [40, -3], [56, 5], [120, 98], [233, 213], [300, 288], [418, 356], [600, 455], [900, 600], [1700, 840]];
const RIGHT = [[0, -3], [40, -3], [56, 5], [120, 98], [233, 213], [330, 288], [480, 330], [869, 356], [1100, 420], [1700, 700]];
const interp = (pts, a) => {
  let k = 1;
  while (k < pts.length - 1 && pts[k][0] < a) k++;
  const [a0, y0] = pts[k - 1], [a1, y1] = pts[k];
  return y0 + (y1 - y0) * Math.min(1, Math.max(0, (a - a0) / (a1 - a0)));
};
export const riverX = (z) => 70 * Math.sin(z * 0.0024) + 30 * Math.sin(z * 0.0061) + 240 * Math.sin(z * 0.0016);
export function ground(x, z) {
  const u = x - riverX(z), y = interp(u < 0 ? LEFT : RIGHT, Math.abs(u));
  // Spurs and gullies down the slopes, calmer along the bridge's own line so that its piers and
  // abutments stand where they are drawn.
  const near = smooth(20, 130, Math.abs(z - pathZ(x))), k = smooth(6, 130, y) * (0.12 + 0.88 * near);
  const far = smooth(150, 600, Math.abs(z - pathZ(x)));
  return y + k * ((38 + 70 * far) * (ridged(x, z, { scale: 0.0034, octaves: 5 }) - 0.42) + 13 * fbm(x, z, { scale: 0.013, octaves: 3 }));
}

// The arch's top chord (a parabola under the deck) and the depth of its truss, a crescent: deepest
// at the crown, tapering to the springings. Each rib is a latticed box 5 m wide; the two ribs
// lean together, 26 m apart at the springings and 14 m at the crown.
const CROWN = DECK - 6.5, RISE = 131;
export const archTop = (x) => CROWN - RISE * (x / (SPAN / 2)) ** 2;
export const ribZ = (x) => 7 + 6 * Math.abs(x) / (SPAN / 2);
const depth = (x) => 7.5 + 6.5 * (1 - (x / (SPAN / 2)) ** 2);
function arch() {
  const g = new THREE.Group(), n = detail.low ? 36 : 52, half = 2.5, pts = [];
  for (let i = 0; i <= n; i++) {
    const x = -SPAN / 2 + (SPAN * i) / n, sl = (-2 * RISE * x) / (SPAN / 2) ** 2, q = Math.hypot(sl, 1), d = depth(x);
    pts.push({ x, y: archTop(x), bx: x + (sl / q) * d, by: archTop(x) - d / q });
  }
  for (const side of [-1, 1]) {
    for (let i = 0; i <= n; i++) {
      const p = pts[i], zc = side * ribZ(p.x), T = (w) => V(p.x, p.y, zc + w * half), B = (w) => V(p.bx, p.by, side * ribZ(p.bx) + w * half);
      // A frame at every panel point: posts in both webs, struts across top and bottom.
      for (const w of [-1, 1]) g.add(strut(T(w), B(w), 0.75, STEEL));
      g.add(strut(T(-1), T(1), 0.6, STEEL), strut(B(-1), B(1), 0.6, STEEL));
      if (i === n) continue;
      const r = pts[i + 1], zr = side * ribZ(r.x), T2 = (w) => V(r.x, r.y, zr + w * half), B2 = (w) => V(r.bx, r.by, side * ribZ(r.bx) + w * half);
      for (const w of [-1, 1]) {
        // The four chords (boxes of steel filled with concrete) and a diagonal in each web.
        g.add(strut(T(w), T2(w), 2.1, STEEL), strut(B(w), B2(w), 2.1, STEEL));
        g.add(i % 2 ? strut(T(w), B2(w), 0.65, STEEL) : strut(B(w), T2(w), 0.65, STEEL));
      }
      g.add(i % 2 ? strut(T(-1), T2(1), 0.45, STEEL) : strut(T(1), T2(-1), 0.45, STEEL));
      g.add(i % 2 ? strut(B(1), B2(-1), 0.45, STEEL) : strut(B(-1), B2(1), 0.45, STEEL));
    }
  }
  // Bracing between the two ribs: a strut at every panel point, top and bottom, and crosses
  // between them in plan.
  for (let i = 0; i <= n; i++) {
    const p = pts[i], zi = ribZ(p.x) - half, zb = ribZ(p.bx) - half;
    g.add(strut(V(p.x, p.y, -zi), V(p.x, p.y, zi), 0.7, STEEL), strut(V(p.bx, p.by, -zb), V(p.bx, p.by, zb), 0.7, STEEL));
    if (i % 2 === 0) g.add(strut(V(p.x, p.y, -zi), V(p.bx, p.by, zb), 0.4, STEEL), strut(V(p.x, p.y, zi), V(p.bx, p.by, -zb), 0.4, STEEL));
    if (i === n) continue;
    const r = pts[i + 1], z2 = ribZ(r.x) - half;
    g.add(i % 2 ? strut(V(p.x, p.y, -zi), V(r.x, r.y, z2), 0.45, STEEL) : strut(V(p.x, p.y, zi), V(r.x, r.y, -z2), 0.45, STEEL));
  }
  return g;
}

// A steel trestle from y0 to y1, centred on the origin: four legs leaning together from a base
// bw × bd (along and across the bridge) to a head tw × td, with a ring of struts and a cross on
// every face at each stage.
export function trestle(y0, y1, bw, bd, tw, td, leg = 1.3) {
  const g = new THREE.Group(), n = Math.max(2, Math.round((y1 - y0) / 13));
  const c = (k, sx, sz) => { const t = k / n; return V(sx * (bw + (tw - bw) * t) / 2, y0 + (y1 - y0) * t, sz * (bd + (td - bd) * t) / 2); };
  for (let k = 0; k < n; k++) {
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) g.add(strut(c(k, sx, sz), c(k + 1, sx, sz), leg, STEEL));
    for (const s of [-1, 1]) {
      g.add(strut(c(k + 1, s, -1), c(k + 1, s, 1), 0.6, STEEL), strut(c(k + 1, -1, s), c(k + 1, 1, s), 0.6, STEEL));
      g.add(strut(c(k, s, -1), c(k + 1, s, 1), 0.45, STEEL), strut(c(k, s, 1), c(k + 1, s, -1), 0.45, STEEL));
      g.add(strut(c(k, -1, s), c(k + 1, 1, s), 0.45, STEEL), strut(c(k, 1, s), c(k + 1, -1, s), 0.45, STEEL));
    }
  }
  g.add(box(tw + 2.5, 1.4, td + 3, STEEL, 0, y1 - 0.7, 0));
  return g;
}

// A length of the deck along x, its top at y = 0: the plate under the track, two plate girders
// with their flanges, the footways' edge beams.
export const GIRDER = 4;
export function deckLength(len) {
  const g = new THREE.Group();
  g.add(box(len, 0.4, 13.5, STEEL, 0, -0.4, 0));
  for (const s of [-1, 1]) g.add(box(len, GIRDER - 0.4, 0.45, STEEL, 0, -GIRDER, s * 3.4), box(len, 0.3, 1.5, STEEL, 0, -GIRDER - 0.15, s * 3.4), box(len, 0.9, 0.3, STEEL, 0, -1.2, s * 6.6));
  return g;
}

// The piers along the path: [distance from the Bakkal abutment, kind]. The two great steel piers
// stand on the arch's foundations; steel trestles carry the higher spans of the approaches and
// concrete piers the lower ones.
export const PIERS = [[42, 'c'], [86, 'c'], [130, 's'], [168, 'S'], [668, 'S'], [712, 's'], [760, 's'], [806, 'c'], [852, 'c'], [898, 'c'], [944, 'c'], [990, 'c'], [1036, 'c'], [1082, 'c'], [1128, 'c'], [1174, 'c'], [1220, 'c'], [1266, 'c']];
// The spandrel columns on the arch, by x.
export const COLUMNS = [-190, -146, -98, -49, 49, 98, 146, 190];

export function buildChenabBridge() {
  const g = new THREE.Group(), f = new THREE.Group(), b = new THREE.Group();
  g.add(f);
  // The gorge: bare rock where it is steep, scrub and grass on the gentler ground.
  g.add(heightField(3200, 2800, detail.low ? 130 : 210, ground, { rock: ['#8d8474', '#7d776b', '#978b78', '#857c6c'], cover: '#6f7a4e', steep: 0.74, band: 24 }));
  b.add(arch());
  // The deck: one straight length over the Bakkal viaduct and the arch, then the curve in chords.
  const straight = XC - X0, nc = Math.ceil(ARC / 21), cl = ARC / nc;
  b.add(at(deckLength(straight), X0 + straight / 2, DECK, 0));
  for (let k = 0; k < nc; k++) b.add(onPath(deckLength(cl + 0.5), straight + (k + 0.5) * cl, DECK));
  // Spandrel columns: a leg over each rib leaning in to the girders, braced across.
  for (const x of COLUMNS) {
    const y0 = archTop(x) + 0.4, y1 = DECK - GIRDER - 0.3, zb = ribZ(x), zt = 3.6, n = Math.max(1, Math.round((y1 - y0) / 14));
    const c = (k, s) => V(x, y0 + ((y1 - y0) * k) / n, s * (zb + ((zt - zb) * k) / n));
    for (let k = 0; k < n; k++) {
      for (const s of [-1, 1]) b.add(strut(c(k, s), c(k + 1, s), 1.5, STEEL));
      b.add(strut(c(k + 1, -1), c(k + 1, 1), 0.6, STEEL), strut(c(k, -1), c(k + 1, 1), 0.45, STEEL), strut(c(k, 1), c(k + 1, -1), 0.45, STEEL));
    }
    b.add(box(2.2, 1.2, 2 * zb + 5, STEEL, x, y0 - 1.0, 0));
  }
  // Piers, each standing into the ground under it.
  const top = DECK - GIRDER - 0.3;
  for (const [s, kind] of PIERS) {
    const [x, z, a] = path(s), gy = ground(x, z), p = new THREE.Group();
    if (kind === 'c') {
      const h = top - gy + 6;
      p.add(box(4.2, h, 9.5, CONCRETE, 0, gy - 6, 0), box(5.4, 1.6, 12, CONCRETE, 0, top - 1.6, 0));
    } else {
      const big = kind === 'S', h = top - gy;
      p.add(trestle(gy + 3, top, big ? 18 : 6 + h * 0.07, big ? 34 : 14 + h * 0.12, big ? 7 : 5, 9, big ? 1.8 : 1.2));
      p.add(box((big ? 18 : 6 + h * 0.07) + 8, 14, (big ? 34 : 14 + h * 0.12) + 8, CONCRETE, 0, gy - 10.5, 0));
    }
    p.position.set(x, 0, z);
    p.rotation.y = -a;
    b.add(p);
  }
  // The arch's foundations, cut into the gorge walls, and the two abutments.
  for (const s of [-1, 1]) {
    const blk = box(34, 30, 44, CONCRETE, 0, 0, 0);
    blk.position.set(s * (SPAN / 2 + 9), archTop(SPAN / 2) - 9, 0);
    blk.rotation.z = s * 0.75;
    b.add(blk);
  }
  b.add(box(16, 22, 15, CONCRETE, X0 - 8, DECK - 22.4, 0), onPath(box(16, 22, 15, CONCRETE, 0, 0, 0), LENGTH + 8, DECK - 11.4));
  f.add(mergeByMaterial(b));
  addDetails(f, g);
  // The home view: the arch and the deck across the gorge from downstream, the river far below.
  // Hundreds of separate struts: merged into a few draw calls once built (js/batch.js).
  return { group: g, focus: f, view: [0.42, 0.03, 1], zoom: 0.4, target: [30, 262, 0], batch: true };
}

import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { M, mat, mesh, box, cyl, lathe, at, surface, doubleSided, rise, ONION, ellipseWall, ribbed, finial } from '../helpers.js';
import { attachSurface } from '../surface.js';

// Fine architectural parts shared by the detail modules: mouldings, arch rings, niches, roundels,
// corbels, balustrades, eaves, merlons, lotus petals, finials, kiosks and carved lettering. Each
// part faces +z and stands on y = 0 unless its comment says otherwise. A detail module builds its
// parts into a group and calls mergeByMaterial on it, so hundreds of small pieces cost a handful of
// draw calls.

// Materials the details need beyond the shared palette in helpers.js.
export const D = {
  ink: surface(mat('#26211d', 0.35), 'none'), // black marble inlay, incised lettering in shadow
  inkSoft: surface(mat('#6d5a45', 0.8), 'none'), // lettering cut into buff sandstone
  enamel: surface(mat('#f3efe4', 0.4), 'none'), // a clock dial
  brass: mat('#b8913f', 0.35, 0.8),
  jade: surface(mat('#5d7f6a', 0.5), 'none'), // pietra dura leaves
  carnelian: surface(mat('#a3473a', 0.5), 'none'), // pietra dura flowers
};

// The same stone with a pattern cut into it: 'lattice' pierces it (a jali), 'frieze' carves rosettes.
const variants = new Map();
export function carved(m, kind) {
  const key = m.uuid + ':' + kind;
  if (!variants.has(key)) {
    const c = attachSurface(m.clone());
    c.userData.surface = kind;
    variants.set(key, c);
  }
  return variants.get(key);
}
export const jali = (m) => carved(m, 'lattice');
export const frieze = (m) => carved(m, 'frieze');

/* ---------- arches ---------- */

// Points along an arch from its left springing (-r, s) over the crown to (r, s), on the same
// curves as helpers.archTop, so rings and niches line up with archWall openings.
export function archCurve(r, s, pointed, n = Math.max(5, Math.min(16, Math.round(4 + r * 2.5)))) {
  if (!pointed) {
    const pts = [];
    for (let k = 0; k <= n * 2; k++) { const a = Math.PI - (k / (n * 2)) * Math.PI; pts.push(new THREE.Vector2(Math.cos(a) * r, s + Math.sin(a) * r)); }
    return pts;
  }
  const a = new THREE.CubicBezierCurve(new THREE.Vector2(-r, s), new THREE.Vector2(-r, s + r * 0.75), new THREE.Vector2(-r * 0.3, s + r * 1.1), new THREE.Vector2(0, s + r * 1.4));
  const b = new THREE.CubicBezierCurve(new THREE.Vector2(0, s + r * 1.4), new THREE.Vector2(r * 0.3, s + r * 1.1), new THREE.Vector2(r, s + r * 0.75), new THREE.Vector2(r, s));
  return [...a.getPoints(n), ...b.getPoints(n).slice(1)];
}

// A moulded band following an arch of width aw and crown height ah: `band` wide, `depth` proud of
// the wall. With legs, the band runs down both jambs to y = 0; without, it stops at the springing.
export function archRing(aw, ah, pointed, band, depth, m, legs = true) {
  const r = aw / 2, s = ah - rise(r, pointed), R = r + band, foot = legs ? 0 : s;
  const outer = archCurve(R, s, pointed), inner = archCurve(r, s, pointed).reverse();
  const sh = new THREE.Shape();
  sh.moveTo(-R, foot);
  if (legs) sh.lineTo(outer[0].x, outer[0].y);
  outer.slice(1).forEach((p) => sh.lineTo(p.x, p.y));
  if (legs) { sh.lineTo(R, foot); sh.lineTo(r, foot); }
  inner.forEach((p) => sh.lineTo(p.x, p.y));
  if (legs) sh.lineTo(-r, foot);
  sh.closePath();
  return mesh(new THREE.ExtrudeGeometry(sh, { depth, bevelEnabled: false, curveSegments: 4 }), m);
}

// A flat arch-shaped slab (window, door or panel), back at z = 0.
export function archSlab(aw, ah, pointed, m, depth = 0.1) {
  const r = aw / 2, s = ah - rise(r, pointed), sh = new THREE.Shape();
  sh.moveTo(-r, 0);
  archCurve(r, s, pointed).forEach((p) => sh.lineTo(p.x, p.y));
  sh.lineTo(r, 0);
  sh.closePath();
  return mesh(new THREE.ExtrudeGeometry(sh, { depth, bevelEnabled: false, curveSegments: 4 }), m);
}

// The head of an arch above its springing, as a slab: with a jali material, the pierced screen
// that fills the top of an open arch. Back at z = 0, standing at the arch's own y = 0.
export function tympanum(aw, ah, pointed, m, depth = 0.1) {
  const r = aw / 2, s = ah - rise(r, pointed), sh = new THREE.Shape(), pts = archCurve(r, s, pointed);
  sh.moveTo(pts[0].x, pts[0].y);
  pts.slice(1).forEach((p) => sh.lineTo(p.x, p.y));
  sh.closePath();
  return mesh(new THREE.ExtrudeGeometry(sh, { depth, bevelEnabled: false }), m);
}

// A half-dome hood for the head of a niche of width aw, curving from the back wall (z = 0) out to
// the face (z = depth), seen from inside.
export function hood(aw, ah, pointed, depth, m) {
  const r = aw / 2, s = ah - rise(r, pointed);
  // A quarter sphere: the upper half (y >= 0) of the half with z <= 0, so its open sides face
  // down and forward. Squashed to the niche's depth and stretched to the arch's rise.
  const geo = new THREE.SphereGeometry(r, 24, 10, 0, Math.PI, 0, Math.PI / 2);
  geo.rotateY(Math.PI);
  geo.scale(1, rise(r, pointed) / r, depth / r);
  geo.translate(0, s, depth);
  const o = mesh(geo, doubleSided(m));
  o.castShadow = false;
  return o;
}

// An arched niche set into a wall face: a frame `depth` proud of the wall with the arch cut through
// it, a darker back, a half-dome hood and a thin ring round the opening ("an arch in an arch").
// Faces +z, back against the wall at z = 0. opts: frame (border width), top (height above crown),
// back (material for the back), inner (an inner arch ring on the back), ring (outer ring), hoodM.
export function niche(aw, ah, pointed, depth, m, opts = {}) {
  const { frame = aw * 0.14, top = aw * 0.2, back = M.recess, inner = true, ring = true, hoodM = m } = opts;
  const g = new THREE.Group();
  const w = aw + 2 * frame, h = ah + top, r = aw / 2, s = ah - rise(r, pointed);
  const sh = new THREE.Shape();
  sh.moveTo(-w / 2, 0); sh.lineTo(-r, 0);
  archCurve(r, s, pointed).forEach((p) => sh.lineTo(p.x, p.y));
  sh.lineTo(r, 0); sh.lineTo(w / 2, 0); sh.lineTo(w / 2, h); sh.lineTo(-w / 2, h); sh.closePath();
  g.add(mesh(new THREE.ExtrudeGeometry(sh, { depth, bevelEnabled: false, curveSegments: 4 }), m));
  g.add(at(archSlab(aw * 0.999, ah * 0.999, pointed, back, 0.04), 0, 0, 0.02));
  g.add(hood(aw * 0.995, ah * 0.995, pointed, depth, hoodM));
  if (inner) g.add(at(archRing(aw * 0.62, s + rise(aw * 0.31, pointed), pointed, aw * 0.035, 0.05, m), 0, 0, 0.06));
  if (ring) g.add(at(archRing(aw, ah, pointed, Math.min(0.3, aw * 0.05), 0.06, m), 0, 0, depth));
  return g;
}

/* ---------- round ornaments ---------- */

// A wedge-shaped keystone w wide at its foot, `flare` wider at the top, h tall, `depth` proud.
export function keystone(w, h, depth, m, flare = 0.35) {
  const sh = new THREE.Shape();
  sh.moveTo(-w / 2, 0); sh.lineTo(w / 2, 0); sh.lineTo(w / 2 + flare / 2, h); sh.lineTo(-w / 2 - flare / 2, h); sh.closePath();
  return mesh(new THREE.ExtrudeGeometry(sh, { depth, bevelEnabled: false }), m);
}

// A sunburst roundel of radius R facing +z, its back at z = 0: a moulded rim, alternating long and
// short rays on a sunk disc, an inner ring and a domed boss.
export function sunburst(R, m, opts = {}) {
  const { rays = 24, rim = R * 0.09, proud = R * 0.08, discM = m } = opts;
  const g = new THREE.Group(), seg = R > 0.8 ? 56 : 28;
  g.add(at(mesh(new THREE.TorusGeometry(R, rim, 6, seg), m), 0, 0, proud));
  g.add(at(mesh(new THREE.CylinderGeometry(R, R, 0.04, seg, 1, true).rotateX(Math.PI / 2), discM), 0, 0, 0.02));
  g.add(at(mesh(new THREE.CircleGeometry(R, seg), discM), 0, 0, 0.04));
  const ray = new THREE.Shape();
  ray.moveTo(-0.5, 0); ray.lineTo(0, 1); ray.lineTo(0.5, 0); ray.closePath();
  const rg = new THREE.ExtrudeGeometry(ray, { depth: proud * 0.7, bevelEnabled: false });
  for (let k = 0; k < rays; k++) {
    const a = (k / rays) * Math.PI * 2, long = k % 2 === 0;
    const len = (long ? 0.56 : 0.4) * R, w = (long ? 0.13 : 0.09) * R;
    const o = mesh(rg, m);
    o.scale.set(w, len, 1);
    o.position.set(Math.cos(a) * R * 0.34, Math.sin(a) * R * 0.34, 0.04);
    o.rotation.z = a - Math.PI / 2;
    g.add(o);
  }
  g.add(at(mesh(new THREE.TorusGeometry(R * 0.3, rim * 0.6, 5, seg / 2), m), 0, 0, proud * 0.6));
  const boss = mesh(new THREE.SphereGeometry(R * 0.24, seg / 2, 6, 0, Math.PI * 2, 0, Math.PI / 2).rotateX(Math.PI / 2), m);
  boss.scale.z = 0.6;
  g.add(at(boss, 0, 0, 0.04));
  return g;
}

// A carved rosette: petals round a boss, facing +z, back at z = 0.
export function rosette(R, m, petals = 8) {
  const g = new THREE.Group();
  const pg = new THREE.SphereGeometry(1, 8, 5);
  for (let k = 0; k < petals; k++) {
    const a = (k / petals) * Math.PI * 2;
    const p = mesh(pg, m);
    p.scale.set(R * 0.2, R * 0.48, R * 0.12);
    p.position.set(Math.cos(a) * R * 0.5, Math.sin(a) * R * 0.5, 0);
    p.rotation.z = a - Math.PI / 2;
    g.add(p);
  }
  const boss = mesh(new THREE.SphereGeometry(R * 0.22, 10, 5), m);
  boss.scale.z = 0.7;
  g.add(boss);
  return g;
}

// A clock dial of radius R facing +z: a brass bezel, a white face, twelve hour marks and two hands.
export function clockFace(R, hour = 10, minute = 10) {
  const g = new THREE.Group();
  g.add(at(mesh(new THREE.TorusGeometry(R, R * 0.07, 8, 48), D.brass), 0, 0, 0.06));
  g.add(at(mesh(new THREE.CylinderGeometry(R, R, 0.06, 48).rotateX(Math.PI / 2), D.enamel), 0, 0, 0.03));
  // A thin block of w x len, from radius r0 outward along the clock angle a (0 = twelve o'clock).
  const tick = (w, len, r0, a, z) => {
    const o = mesh(new THREE.BoxGeometry(w, len, 0.03), D.ink);
    o.position.set(Math.sin(a) * (r0 + len / 2), Math.cos(a) * (r0 + len / 2), z);
    o.rotation.z = -a;
    return o;
  };
  for (let k = 0; k < 12; k++) {
    const big = k % 3 === 0, len = R * (big ? 0.2 : 0.12);
    g.add(tick(R * (big ? 0.07 : 0.04), len, R * 0.86 - len, (k / 12) * Math.PI * 2, 0.075));
  }
  const hand = (len, w, a) => tick(w, len, -len * 0.15, a, 0.1);
  g.add(hand(R * 0.5, R * 0.07, ((hour % 12) + minute / 60) / 12 * Math.PI * 2));
  g.add(hand(R * 0.72, R * 0.045, (minute / 60) * Math.PI * 2));
  g.add(at(mesh(new THREE.CylinderGeometry(R * 0.06, R * 0.06, 0.05, 12).rotateX(Math.PI / 2), D.brass), 0, 0, 0.12));
  return g;
}

/* ---------- lettering ---------- */

// Block capitals from straight strokes and elliptical bowls, enough for the inscriptions here.
// Each glyph is [width, strokes], a stroke being [x1, y1, x2, y2] or ['arc', cx, cy, rx, ry, from, to]
// in a box one unit high.
const GLYPHS = {
  I: [0.18, [[0.09, 0, 0.09, 1]]],
  N: [0.7, [[0.07, 0, 0.07, 1], [0.07, 1, 0.63, 0], [0.63, 0, 0.63, 1]]],
  D: [0.68, [[0.07, 0, 0.07, 1], [0.07, 1, 0.3, 1], [0.07, 0, 0.3, 0], ['arc', 0.3, 0.5, 0.32, 0.5, -Math.PI / 2, Math.PI / 2]]],
  A: [0.76, [[0.04, 0, 0.38, 1], [0.38, 1, 0.72, 0], [0.18, 0.36, 0.58, 0.36]]],
  M: [0.86, [[0.07, 0, 0.07, 1], [0.07, 1, 0.43, 0.25], [0.43, 0.25, 0.79, 1], [0.79, 1, 0.79, 0]]],
  C: [0.64, [['arc', 0.36, 0.5, 0.3, 0.5, Math.PI * 0.27, Math.PI * 1.73]]],
  X: [0.66, [[0.05, 0, 0.61, 1], [0.05, 1, 0.61, 0]]],
  V: [0.68, [[0.04, 1, 0.34, 0], [0.34, 0, 0.64, 1]]],
  E: [0.56, [[0.07, 0, 0.07, 1], [0.07, 1, 0.52, 1], [0.07, 0.5, 0.44, 0.5], [0.07, 0, 0.52, 0]]],
  T: [0.62, [[0.31, 0, 0.31, 1], [0.02, 1, 0.6, 1]]],
  O: [0.78, [['arc', 0.39, 0.5, 0.33, 0.5, 0, Math.PI * 2]]],
  ' ': [0.4, []],
};

// A line of raised letters `size` high and `depth` proud, centred on x = 0 with its baseline at y = 0.
export function lettering(text, size, depth, m) {
  const g = new THREE.Group(), t = size * 0.13, gap = size * 0.2;
  let x = 0;
  for (const ch of text) {
    const [w, strokes] = GLYPHS[ch] || GLYPHS[' '];
    for (const s of strokes) {
      if (s[0] === 'arc') {
        const [, cx, cy, rx, ry, from, to] = s;
        // Turn the ring to its start angle before stretching it into an ellipse.
        const tube = t / 2 / size / Math.sqrt(rx * ry);
        const o = mesh(new THREE.TorusGeometry(1, tube, 6, 28, to - from).rotateZ(from), m);
        o.scale.set(rx * size, ry * size, depth / 2 / tube);
        o.position.set(x + cx * size, cy * size, depth / 2);
        g.add(o);
      } else {
        const [x1, y1, x2, y2] = s, dx = (x2 - x1) * size, dy = (y2 - y1) * size, len = Math.hypot(dx, dy);
        const o = mesh(new THREE.BoxGeometry(len + t * 0.6, t, depth), m);
        o.position.set(x + ((x1 + x2) / 2) * size, ((y1 + y2) / 2) * size, depth / 2);
        o.rotation.z = Math.atan2(dy, dx);
        g.add(o);
      }
    }
    x += w * size + gap;
  }
  x -= gap;
  g.children.forEach((o) => { o.position.x -= x / 2; });
  g.userData.width = x;
  return g;
}

/* ---------- brackets, eaves, railings, parapets ---------- */

// A corbel bracket: an S-curved stone block under a balcony or eave, `h` tall and projecting `d`,
// `w` wide. Its top is at y = 0 against the wall at z = 0, projecting towards +z.
export function bracketGeo(h, d, w) {
  const sh = new THREE.Shape();
  sh.moveTo(0, 0); sh.lineTo(d, 0); sh.lineTo(d, -h * 0.22);
  sh.bezierCurveTo(d * 0.55, -h * 0.25, d * 0.45, -h * 0.75, 0, -h);
  sh.closePath();
  const geo = new THREE.ExtrudeGeometry(sh, { depth: w, bevelEnabled: false, curveSegments: 8 });
  geo.rotateY(-Math.PI / 2);
  geo.translate(w / 2, 0, 0);
  return geo;
}

// Copies of a geometry placed by [x, y, z, rotY] (and optional uniform scale), as one mesh.
export function placeAll(geo, list, m) {
  const g = new THREE.Group();
  for (const [x, y, z, ry = 0, s = 1] of list) {
    const o = mesh(geo, m, x, y, z);
    o.rotation.y = ry;
    o.scale.setScalar(s);
    g.add(o);
  }
  return g;
}

// n points round a circle of radius r at height y, each facing outward: [x, y, z, rotY].
export function aroundCircle(r, n, y, phase = 0) {
  const pts = [];
  for (let k = 0; k < n; k++) { const a = phase + (k / n) * Math.PI * 2; pts.push([Math.sin(a) * r, y, Math.cos(a) * r, a]); }
  return pts;
}

// n points along a straight run of length len on a face at distance dist from the centre, facing
// `angle` (0 = +z): [x, y, z, rotY].
export function alongFace(angle, dist, len, n, y, margin = 0) {
  const pts = [];
  for (let k = 0; k < n; k++) {
    const lat = -len / 2 + margin + ((k + 0.5) / n) * (len - 2 * margin);
    pts.push([Math.sin(angle) * dist + Math.cos(angle) * lat, y, Math.cos(angle) * dist - Math.sin(angle) * lat, angle]);
  }
  return pts;
}

// A sloping eave (chhajja) of length len along x, projecting d towards +z from a wall at z = 0 and
// dropping `drop` at its lip; its top meets the wall at y = 0.
export function chhajja(len, d, drop, t, m) {
  const sh = new THREE.Shape();
  sh.moveTo(0, 0); sh.lineTo(d, -drop); sh.lineTo(d, -drop - t); sh.lineTo(0, -t * 1.6); sh.closePath();
  const geo = new THREE.ExtrudeGeometry(sh, { depth: len, bevelEnabled: false });
  geo.rotateY(-Math.PI / 2);
  geo.translate(len / 2, 0, 0);
  return mesh(geo, m);
}

// A frustum band between (r0, y0) and (r1, y1), seen from both sides: eaves, cornices, drums.
export function band(r0, y0, r1, y1, m, seg = 64) {
  const o = mesh(new THREE.LatheGeometry([new THREE.Vector2(r0, y0), new THREE.Vector2(r1, y1)], seg), doubleSided(m));
  return o;
}

// A ring eave round a tower or drum: its top slopes from (r0, y) out to (r1, y - drop), t thick.
export function chhajjaRing(r0, r1, y, drop, t, m, seg = 64) {
  const g = new THREE.Group();
  g.add(band(r1, y - drop, r0, y, m, seg));
  g.add(band(r1, y - drop - t, r1, y - drop, m, seg));
  g.add(band(r0, y - t * 1.6, r1, y - drop - t, m, seg));
  return g;
}

// A balcony railing round a circle: a pierced screen between a plinth course and a moulded rail.
export function railingRing(r, h, m, screenM = jali(m)) {
  const g = new THREE.Group(), t = Math.max(0.08, r * 0.03);
  g.add(ellipseWall(r, r, 0, Math.PI * 2, t, 0, h * 0.18, m));
  g.add(ellipseWall(r, r, 0, Math.PI * 2, t * 0.6, h * 0.18, h * 0.86, screenM));
  g.add(ellipseWall(r + t * 0.15, r + t * 0.15, 0, Math.PI * 2, t * 1.5, h * 0.86, h, m));
  return g;
}

// A straight railing of length len along x: posts, a pierced screen and a rail, centred at z = 0.
export function railing(len, h, t, m, post = 1.6, screenM = jali(m)) {
  const g = new THREE.Group();
  g.add(box(len, h * 0.16, t, m));
  g.add(box(len, h * 0.7, t * 0.5, screenM, 0, h * 0.16));
  g.add(box(len + t * 0.4, h * 0.14, t * 1.4, m, 0, h * 0.86));
  const n = Math.max(1, Math.round(len / post));
  for (let k = 0; k <= n; k++) g.add(box(t * 1.2, h * 0.86, t * 1.2, m, -len / 2 + (k / n) * len, 0));
  return g;
}

// A low screen len long and h high, pierced by n arched openings holeW wide and holeH high (their
// sills at `sill`): the arcaded balustrades of Qutb Shahi and Mughal galleries. Centred on x = 0,
// standing on y = 0, from z = -depth/2 to depth/2.
export function arcadeScreen(len, h, n, holeW, holeH, depth, m, { pointed = true, sill = h * 0.15 } = {}) {
  const sh = new THREE.Shape();
  sh.moveTo(-len / 2, 0); sh.lineTo(len / 2, 0); sh.lineTo(len / 2, h); sh.lineTo(-len / 2, h); sh.closePath();
  const r = holeW / 2, s = holeH - rise(r, pointed);
  for (let k = 0; k < n; k++) {
    const cx = -len / 2 + ((k + 0.5) / n) * len, hole = new THREE.Path();
    hole.moveTo(cx - r, sill);
    archCurve(r, s, pointed, 6).forEach((p) => hole.lineTo(cx + p.x, sill + p.y));
    hole.lineTo(cx + r, sill);
    hole.closePath();
    sh.holes.push(hole);
  }
  const geo = new THREE.ExtrudeGeometry(sh, { depth, bevelEnabled: false });
  geo.translate(0, 0, -depth / 2);
  return mesh(geo, m);
}

// A merlon (kangura): a leaf-tipped crenel w wide and h high, depth thick, standing on y = 0.
export function merlonGeo(w, h, depth) {
  const sh = new THREE.Shape();
  sh.moveTo(-w / 2, 0); sh.lineTo(-w / 2, h * 0.55);
  sh.quadraticCurveTo(-w / 2, h * 0.8, 0, h);
  sh.quadraticCurveTo(w / 2, h * 0.8, w / 2, h * 0.55);
  sh.lineTo(w / 2, 0); sh.closePath();
  const geo = new THREE.ExtrudeGeometry(sh, { depth, bevelEnabled: false, curveSegments: 6 });
  geo.translate(0, 0, -depth / 2);
  return geo;
}

// A run of merlons along x, len long, centred on x = 0.
export function merlons(len, w, h, depth, m, gap = 0.25) {
  const n = Math.max(1, Math.floor(len / (w * (1 + gap))));
  const geo = merlonGeo(w, h, depth), list = [];
  for (let k = 0; k < n; k++) list.push([-len / 2 + ((k + 0.5) / n) * len, 0, 0]);
  return placeAll(geo, list, m);
}

// A row of dentils (small blocks under a cornice) along x: n blocks of w × h × d.
export function dentils(len, w, h, d, m) {
  const g = new THREE.Group(), n = Math.floor(len / (w * 2));
  const geo = new THREE.BoxGeometry(w, h, d);
  for (let k = 0; k < n; k++) g.add(mesh(geo, m, -len / 2 + (k + 0.5) * (len / n), h / 2, d / 2));
  return g;
}

/* ---------- domes, petals and finials ---------- */

// A ring of n lotus petals round a circle of radius r: each len long, w wide, leaning out by `tilt`
// radians (past pi/2 they hang downward, as on an inverted lotus).
export function petalRing(r, n, len, w, tilt, m, thick = 0.35) {
  const g = new THREE.Group();
  const pg = new THREE.SphereGeometry(0.5, 8, 5).translate(0, 0.5, 0);
  for (let k = 0; k < n; k++) {
    const a = (k / n) * Math.PI * 2;
    const p = mesh(pg, m);
    p.scale.set(w, len, w * thick);
    p.quaternion.setFromEuler(new THREE.Euler(tilt, a, 0, 'YXZ'));
    p.position.set(Math.sin(a) * r, 0, Math.cos(a) * r);
    g.add(p);
  }
  return g;
}

// An onion dome (helpers.onionDome) with n shallow ribs, sitting in a cup of lotus petals.
export function lotusDome(r, m, { ribs = 16, petals = 16, ribAmt = 0.025, petalM = m } = {}) {
  const g = new THREE.Group();
  // Fewer segments on small domes, which are only ever seen from a distance.
  const dome = lathe(ONION.map(([a, b]) => [a * r, b * r]), m, r > 3 ? 48 : r > 1.2 ? 32 : 20);
  g.add(ribs ? ribbed(dome, ribs, ribAmt) : dome);
  if (petals) g.add(at(petalRing(r * 0.86, petals, r * 0.62, r * 0.42, 0.52, petalM, 0.3), 0, r * 0.02, 0));
  return g;
}

// A Mughal finial of height h: a stack of bulbs on a rod, ending in a crescent.
export function crescentFinial(h, m = M.gold) {
  const g = new THREE.Group();
  g.add(cyl(h * 0.02, h * 0.03, h * 0.8, m, 0, 0, 0, 10));
  const bulbs = [[0.05, 0.1], [0.17, 0.085], [0.3, 0.075], [0.42, 0.06]];
  for (const [y, r] of bulbs) {
    const b = mesh(new THREE.SphereGeometry(h * r, 12, 6), m, 0, h * y + h * r * 0.7, 0);
    b.scale.y = 0.8;
    g.add(b);
  }
  g.add(lathe([[0, 0], [h * 0.07, h * 0.02], [h * 0.05, h * 0.1], [h * 0.015, h * 0.14], [0, h * 0.16]].map(([a, b]) => [a, b + h * 0.52]), m, 16));
  g.add(cyl(h * 0.008, h * 0.015, h * 0.14, m, 0, h * 0.68, 0, 8));
  // The crescent: most of a ring, its gap centred at the top.
  const arc = Math.PI * 1.35;
  const cr = mesh(new THREE.TorusGeometry(h * 0.085, h * 0.016, 8, 24, arc), m, 0, h * 0.89, 0);
  cr.rotation.z = -Math.PI / 2 - arc / 2;
  g.add(cr);
  return g;
}

// A Mughal kiosk (chhatri) of radius r and height h on y = 0: octagonal platform, eight slender
// columns with pointed arches between them, a sloping eave, a drum, a ribbed onion dome in a lotus
// cup, and a crescent finial. opts: domeM, finialM, arches (false leaves the bays open), crescent
// (false puts a plain spike on top instead).
export function mughalChhatri(r, h, m, { domeM = m, finialM = M.gold, arches = true, eave = m, crescent = true } = {}) {
  const g = new THREE.Group();
  const ph = h * 0.07, colH = h * 0.36, cr = r * 0.82;
  g.add(cyl(r * 1.08, r * 1.12, ph, m, 0, 0, 0, 8));
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * Math.PI * 2 + Math.PI / 8;
    const x = Math.sin(a) * cr, z = Math.cos(a) * cr, cw = r * 0.075;
    g.add(cyl(cw * 1.5, cw * 1.6, colH * 0.06, m, x, ph, z, 8));
    g.add(cyl(cw, cw * 1.1, colH, m, x, ph, z, 8));
    g.add(cyl(cw * 1.6, cw, colH * 0.07, m, x, ph + colH * 0.93, z, 8));
  }
  if (arches) {
    // A pointed arch across each bay, on the chord between two columns.
    const bay = 2 * cr * Math.sin(Math.PI / 8);
    for (let k = 0; k < 8; k++) {
      const a = (k / 8) * Math.PI * 2, d = cr * Math.cos(Math.PI / 8);
      const ringM = archRing(bay * 0.78, colH * 0.98, true, bay * 0.11, r * 0.06, m, false);
      ringM.position.set(Math.sin(a) * (d - r * 0.03), ph + colH * 0.02, Math.cos(a) * (d - r * 0.03));
      ringM.rotation.y = a;
      g.add(ringM);
    }
  }
  const ey = ph + colH;
  g.add(cyl(r * 1.0, r * 0.95, h * 0.05, m, 0, ey, 0, 8));
  g.add(chhajjaRing(r * 0.98, r * 1.3, ey + h * 0.07, h * 0.04, h * 0.012, eave, 8));
  g.add(cyl(r * 0.92, r * 0.92, h * 0.07, m, 0, ey + h * 0.05, 0, 16));
  const dy = ey + h * 0.12, dr = r * 0.88;
  g.add(at(lotusDome(dr, domeM, { ribs: 16, petals: 16 }), 0, dy, 0));
  g.add(at(petalRing(dr * 0.2, 10, dr * 0.32, dr * 0.18, Math.PI - 0.7, domeM, 0.3), 0, dy + dr * 1.82, 0));
  g.add(at(crescent ? crescentFinial(dr * 1.4, finialM) : finial(dr * 1.5, finialM), 0, dy + dr * 1.78, 0));
  return g;
}

/* ---------- merging ---------- */

// Bake every plain mesh under root into one mesh per material, so many small parts draw cheaply.
// Instanced meshes are left alone.
export function mergeByMaterial(root) {
  root.updateMatrixWorld(true);
  const inv = root.matrixWorld.clone().invert(), groups = new Map(), done = [];
  const m4 = new THREE.Matrix4();
  root.traverse((o) => {
    if (!o.isMesh || o.isInstancedMesh) return;
    let geo = o.geometry.index ? o.geometry.toNonIndexed() : o.geometry.clone();
    for (const k of Object.keys(geo.attributes)) if (k !== 'position' && k !== 'normal') geo.deleteAttribute(k);
    m4.multiplyMatrices(inv, o.matrixWorld);
    geo.applyMatrix4(m4);
    // A mirrored placement turns the triangles inside out; turn them back.
    if (m4.determinant() < 0) {
      const p = geo.attributes.position, n = geo.attributes.normal;
      for (let i = 0; i < p.count; i += 3) for (const a of [p, n]) {
        const x = a.getX(i + 1), y = a.getY(i + 1), z = a.getZ(i + 1);
        a.setXYZ(i + 1, a.getX(i + 2), a.getY(i + 2), a.getZ(i + 2));
        a.setXYZ(i + 2, x, y, z);
      }
    }
    if (!groups.has(o.material)) groups.set(o.material, { list: [], shadow: o.castShadow });
    const e = groups.get(o.material);
    e.list.push(geo);
    e.shadow = e.shadow || o.castShadow;
    done.push(o);
  });
  done.forEach((o) => o.parent.remove(o));
  for (const [m, { list, shadow }] of groups) {
    const merged = mergeGeometries(list, false);
    list.forEach((g) => g.dispose());
    const o = mesh(merged, m);
    o.castShadow = shadow;
    root.add(o);
  }
  // Drop the groups that are now empty.
  const empty = [];
  root.traverse((o) => { if (o !== root && !o.isMesh && o.children.length === 0) empty.push(o); });
  empty.forEach((o) => o.parent && o.parent.remove(o));
  return root;
}

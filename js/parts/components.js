import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { M, mat, mesh, box, cyl, lathe, at, surface, doubleSided, rise, ONION, ellipseWall, ribbed, finial, inst, unitBox, unitCyl } from '../helpers.js';
import { attachSurface } from '../surface.js';
import { detail } from '../detail.js';

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

// Block capitals from straight strokes and elliptical bowls, enough for the inscriptions here:
// only the letters below. A letter that is not here is left as a space, with a warning.
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
  H: [0.7, [[0.07, 0, 0.07, 1], [0.63, 0, 0.63, 1], [0.07, 0.5, 0.63, 0.5]]],
  S: [0.62, [['arc', 0.32, 0.75, 0.25, 0.25, Math.PI * 0.05, Math.PI * 1.5], ['arc', 0.3, 0.25, 0.25, 0.25, -Math.PI * 0.95, Math.PI * 0.5]]],
  ' ': [0.4, []],
};

// A line of raised letters `size` high and `depth` proud, centred on x = 0 with its baseline at y = 0.
export function lettering(text, size, depth, m) {
  const g = new THREE.Group(), t = size * 0.13, gap = size * 0.2;
  let x = 0;
  for (const ch of text) {
    if (!GLYPHS[ch]) console.warn(`lettering: no glyph for "${ch}" in "${text}"; add it to GLYPHS`);
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
    // Parts keep their index (one without gets a plain one), so vertices shared within a part stay
    // shared: a turned or sculpted shape then holds a sixth of the vertices it would unrolled.
    const geo = o.geometry.clone();
    if (!geo.index) geo.setIndex([...Array(geo.attributes.position.count).keys()]);
    // Textured materials (a map or a bump map) keep their texture coordinates; a part without any
    // gets zeros, so every geometry merged into one material has the same attributes.
    const textured = !!(o.material.map || o.material.bumpMap);
    const keep = ['position', 'normal', ...(o.material.vertexColors ? ['color'] : []), ...(textured ? ['uv'] : [])];
    if (textured && !geo.attributes.uv) geo.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array(geo.attributes.position.count * 2), 2));
    for (const k of Object.keys(geo.attributes)) if (!keep.includes(k)) geo.deleteAttribute(k);
    m4.multiplyMatrices(inv, o.matrixWorld);
    geo.applyMatrix4(m4);
    // A mirrored placement turns the triangles inside out; turn them back.
    if (m4.determinant() < 0) { const ix = geo.index.array; for (let i = 0; i < ix.length; i += 3) { const t = ix[i + 1]; ix[i + 1] = ix[i + 2]; ix[i + 2] = t; } }
    geo.clearGroups();
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

/* ---------- walls: courses, pilasters, windows, balconies, niches ---------- */

// A moulded course round a rectangular block w × d centred on x = z = 0: a band h tall from height
// y, standing `proud` out from all four faces. It stands 2 mm clear of the wall rather than sinking
// into it, so its top and bottom never share a plane with the top of the wall or a ledge flush
// with it. The long strips on the ±z faces run over the corners; the ±x strips butt against them.
export function beltCourse(w, d, y, h, proud, m) {
  const g = new THREE.Group(), e = 0.002;
  for (const s of [-1, 1]) {
    g.add(box(w + 2 * proud, h, proud - e, m, 0, y, s * (d / 2 + (proud + e) / 2)));
    g.add(box(proud - e, h * 0.999, d + 2 * e, m, s * (w / 2 + (proud + e) / 2), y, 0));
  }
  return g;
}

// A stack of courses round a block w × d: [[y, h, proud], ...], as the mouldings of a temple's base
// (adhishthana) or a plinth.
export function mouldings(w, d, courses, m) {
  const g = new THREE.Group();
  for (const [y, h, proud, cm = m] of courses) g.add(beltCourse(w, d, y, h, proud, cm));
  return g;
}

// n flat pilasters spread over len along x, each w wide, h tall and `proud` out from a wall at
// z = 0, with a base block and a capital; facing +z.
export function pilasters(len, n, w, h, proud, m) {
  const g = new THREE.Group();
  for (let k = 0; k < n; k++) {
    const x = n === 1 ? 0 : -len / 2 + (k / (n - 1)) * len;
    g.add(box(w, h - 0.02, proud, m, x, 0.01, proud / 2));
    g.add(box(w * 1.3, Math.min(0.5, h * 0.06), proud * 1.5, m, x, 0, proud * 0.75));
    g.add(box(w * 1.35, Math.min(0.45, h * 0.05), proud * 1.6, m, x, h - Math.min(0.45, h * 0.05), proud * 0.8));
  }
  return g;
}

// A window on a wall at z = 0, w × h from its sill at y = 0: a dark recess, a moulded frame and a
// projecting sill, with a pierced screen in it if `screen` is a material. shape: 'pointed', 'round'
// or 'flat'.
export function windowFrame(w, h, m, { shape = 'pointed', screen = null, frame = Math.min(0.3, w * 0.12), back = M.recess } = {}) {
  const g = new THREE.Group();
  if (shape === 'flat') {
    g.add(box(w, h, 0.03, back, 0, 0, 0.015));
    if (screen) g.add(box(w * 0.98, h * 0.98, 0.03, screen, 0, h * 0.01, 0.05));
    for (const x of [-1, 1]) g.add(box(frame, h + frame, 0.1, m, x * (w + frame) / 2, 0, 0.05));
    g.add(box(w + 2 * frame, frame, 0.12, m, 0, h, 0.06));
  } else {
    const pointed = shape === 'pointed';
    g.add(at(archSlab(w, h, pointed, back, 0.03), 0, 0, 0));
    if (screen) g.add(at(archSlab(w * 0.98, h * 0.98, pointed, screen, 0.03), 0, 0, 0.035));
    g.add(at(archRing(w, h, pointed, frame, 0.1, m), 0, 0, 0));
  }
  g.add(box(w + 2.4 * frame, Math.max(0.08, frame * 0.6), 0.22, m, 0, -Math.max(0.08, frame * 0.6), 0.11));
  return g;
}

// A curved (bangla) roof w long along x and d deep, rising rh: the roof of the Bengali hut carried
// into stone and copper on the jharokhas and pavilions of Rajput and late Mughal buildings. Curved
// both ways: its section is half a sine from eave to eave, and both its ridge and its eaves droop
// towards the ends (by `droop` × rh at the corners), so the corners hang lowest. A shell th thick.
// Its eaves are at y = 0 (mid-length) from z = 0 to z = d.
export function banglaRoof(w, d, rh, m, { droop = 0.35, th = Math.max(0.06, rh * 0.1) } = {}) {
  // About two divisions a metre each way (fewer on phones), so a jharokha's roof stays light.
  const k = detail.low ? 1 : 2, nu = Math.max(4, Math.min(16, Math.round(w * k))), nv = Math.max(3, Math.min(12, Math.round(d * k * 1.5)));
  const pos = [], idx = [], N = (nu + 1) * (nv + 1);
  const top = (u, v) => { const e = (2 * u - 1) ** 2; return rh * Math.sin(Math.PI * v) * (1 - 0.3 * e) - droop * rh * e; };
  for (const side of [0, 1]) for (let j = 0; j <= nv; j++) for (let i = 0; i <= nu; i++) {
    const u = i / nu, v = j / nv;
    pos.push((u - 0.5) * w, top(u, v) - side * th, v * d);
  }
  const at_ = (side, i, j) => side * N + j * (nu + 1) + i;
  for (let j = 0; j < nv; j++) for (let i = 0; i < nu; i++) {
    const a = at_(0, i, j), b = at_(0, i + 1, j), c = at_(0, i + 1, j + 1), e = at_(0, i, j + 1);
    idx.push(a, e, b, b, e, c);
    const a1 = at_(1, i, j), b1 = at_(1, i + 1, j), c1 = at_(1, i + 1, j + 1), e1 = at_(1, i, j + 1);
    idx.push(a1, b1, e1, b1, c1, e1);
  }
  // The rim: the shell's thickness round its four edges.
  const rim = (list) => { for (let k = 0; k < list.length - 1; k++) { const [p, q] = [list[k], list[k + 1]]; idx.push(at_(0, ...p), at_(1, ...p), at_(0, ...q), at_(0, ...q), at_(1, ...p), at_(1, ...q)); } };
  rim(Array.from({ length: nu + 1 }, (_, i) => [i, 0]));
  rim(Array.from({ length: nu + 1 }, (_, i) => [nu - i, nv]));
  rim(Array.from({ length: nv + 1 }, (_, j) => [0, nv - j]));
  rim(Array.from({ length: nv + 1 }, (_, j) => [nu, j]));
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setIndex(idx);
  const flat = geo.toNonIndexed();
  flat.computeVertexNormals();
  return mesh(flat, doubleSided(m));
}

// A jharokha: an oriel window w wide and h high (sill to eave) projecting d from a wall at z = 0,
// its sill at y = 0. A corbelled base on brackets, a pierced panel on three sides, four posts, a
// dark opening behind, an eave and a roof: 'bangla' (curved), 'dome' (a small ribbed dome) or 'flat'.
export function jharokha(w, h, m, { d = w * 0.5, roof = 'bangla', roofM = m, trim = m, screen = jali(m) } = {}) {
  const g = new THREE.Group(), t = Math.max(0.1, h * 0.05), ph = h * 0.32;
  g.add(box(w, t, d, trim, 0, -t, d / 2));
  g.add(box(w * 0.8, t, d * 0.72, m, 0, -2 * t, d * 0.36), box(w * 0.55, t, d * 0.45, m, 0, -3 * t, d * 0.225));
  g.add(placeAll(bracketGeo(h * 0.32, d * 0.85, Math.max(0.08, w * 0.07)), [[-w * 0.36, -t, 0], [w * 0.36, -t, 0]], trim));
  g.add(box(w - 0.04, ph, 0.08, screen, 0, 0, d - 0.06));
  for (const s of [-1, 1]) g.add(box(0.08, ph, d - 0.14, screen, s * (w / 2 - 0.06), 0, d / 2 - 0.03));
  g.add(box(w * 0.86, h * 0.62, 0.03, M.recess, 0, 0.02, 0.016));
  const pr = Math.max(0.04, w * 0.03);
  for (const x of [-1, 1]) for (const z of [0.08, d - 0.08]) g.add(cyl(pr, pr * 1.2, h - ph - t * 0.5, m, x * (w / 2 - 0.08), ph, z, 8));
  g.add(box(w + 0.16, t, d + 0.12, trim, 0, h - t * 0.5, d / 2));
  const top = h + t * 0.5;
  if (roof === 'bangla') g.add(at(banglaRoof(w + 0.3, d + 0.24, Math.min(w, d) * 0.45, roofM), 0, top + 0.02, -0.04));
  else if (roof === 'dome') {
    const r = Math.min(w, d * 2) * 0.42;
    g.add(at(ribbed(mesh(new THREE.SphereGeometry(r, 20, 8, 0, Math.PI * 2, 0, Math.PI / 2), roofM), 12, 0.04), 0, top, d / 2));
    g.add(at(finial(r * 1.2), 0, top + r * 0.95, d / 2));
  } else g.add(box(w + 0.3, t * 0.8, d + 0.3, trim, 0, top, d / 2));
  return g;
}

// A niche on a temple wall (devakoshtha) at z = 0: a recess w × h with an image in it, pilasters
// either side, a sill and a lintel, and over it a small stepped pediment with an amalaka. Faces +z,
// sill at y = 0. figure: a group to stand in the niche (scaled to fit), or null for an empty niche.
export function templeNiche(w, h, m, { depth = Math.max(0.15, w * 0.18), figure = null, crown = true } = {}) {
  const g = new THREE.Group(), pw = w * 0.16;
  g.add(box(w, h, 0.03, M.recess, 0, 0, 0.015));
  for (const s of [-1, 1]) g.add(box(pw, h, depth, m, s * (w / 2 + pw / 2), 0, depth / 2));
  g.add(box(w + 2.6 * pw, pw * 0.7, depth * 1.25, m, 0, -pw * 0.7, depth * 0.62));
  g.add(box(w + 2.6 * pw, pw * 0.8, depth * 1.3, m, 0, h, depth * 0.65));
  if (crown) {
    let y = h + pw * 0.8, cw = w + 1.6 * pw;
    for (let k = 0; k < 3; k++) { g.add(box(cw, pw * 0.6, depth, m, 0, y, depth / 2)); y += pw * 0.6; cw *= 0.72; }
    const a = mesh(new THREE.SphereGeometry(cw * 0.55, 12, 6), m, 0, y + cw * 0.2, depth / 2);
    a.scale.y = 0.45;
    g.add(a);
  }
  if (figure) g.add(at(figure, 0, 0.02, 0.08));
  return g;
}

// A sunk panel w × h on a wall at z = 0: a frame of four bars `band` wide round a field carved or
// inlaid with `field` (a frieze, a jali, a dark stone; null for a bare frame), from y = 0.
export function panel(w, h, band, m, field = frieze(m), depth = 0.06) {
  const g = new THREE.Group();
  if (field) g.add(box(w - 2 * band + 0.02, h - 2 * band + 0.02, 0.025, field, 0, band - 0.01, 0.0125));
  for (const s of [-1, 1]) g.add(box(band, h, depth, m, s * (w - band) / 2, 0, depth / 2));
  for (const y of [0, h - band]) g.add(box(w - 2 * band, band, depth, m, 0, y, depth / 2));
  return g;
}

// A small standing image in relief, about h tall, facing +z on y = 0: a pedestal, legs and robe, a
// torso, arms at the sides, a head and a tall crown. Cheap enough to fill rows of niches where the
// sculpted guardian (figures.js) would cost too much.
export function idol(h, m) {
  const g = new THREE.Group(), u = h / 10;
  g.add(box(u * 3, u * 0.7, u * 1.6, m));
  g.add(cyl(u * 1.0, u * 1.35, u * 3.6, m, 0, u * 0.7, 0, 10));
  g.add(cyl(u * 1.15, u * 0.95, u * 2.4, m, 0, u * 4.3, 0, 10));
  for (const s of [-1, 1]) g.add(cyl(u * 0.32, u * 0.38, u * 2.6, m, s * u * 1.35, u * 4.0, 0, 6));
  g.add(at(mesh(new THREE.SphereGeometry(u * 0.75, 10, 8), m), 0, u * 7.5, 0));
  g.add(cyl(u * 0.25, u * 0.6, u * 1.6, m, 0, u * 8.1, 0, 8));
  g.add(at(mesh(new THREE.TorusGeometry(u * 1.3, u * 0.12, 4, 16, Math.PI), m), 0, u * 7.4, -u * 0.3));
  return g;
}

// A flat star of n points, R across its points, `depth` proud of a wall at z = 0: the inlaid stars
// of white marble on the red sandstone of Mughal spandrels.
export function star(n, R, m, depth = 0.05, inner = 0.58) {
  const sh = new THREE.Shape();
  for (let i = 0; i < n * 2; i++) {
    const a = Math.PI / 2 + (i / (n * 2)) * Math.PI * 2, r = i % 2 ? R * inner : R;
    if (i === 0) sh.moveTo(Math.cos(a) * r, Math.sin(a) * r); else sh.lineTo(Math.cos(a) * r, Math.sin(a) * r);
  }
  sh.closePath();
  return mesh(new THREE.ExtrudeGeometry(sh, { depth, bevelEnabled: false }), m);
}

// A pair of fish facing each other, the emblem of the Nawabs of Awadh carved over the arches of
// Lucknow: two bodies and their tails, about `len` across, facing +z on a wall at z = 0.
export function fishPair(len, m) {
  const g = new THREE.Group(), u = len / 2;
  for (const s of [-1, 1]) {
    const body = mesh(new THREE.SphereGeometry(1, 14, 8), m, s * u * 0.5, 0, u * 0.08);
    body.scale.set(u * 0.42, u * 0.17, u * 0.07);
    body.rotation.z = s * 0.35;
    const tail = mesh(new THREE.ConeGeometry(u * 0.16, u * 0.3, 3).rotateZ(-s * Math.PI / 2), m, s * u * 0.98, -s * u * 0.16 * 0.9, u * 0.06);
    tail.rotation.z += s * 0.35;
    tail.scale.z = 0.4;
    g.add(body, tail);
  }
  return g;
}

// A plain carved medallion of radius R facing +z on a wall at z = 0: a disc in a moulded rim. A
// cheap stand-in for the rosette where there are hundreds of them (railing posts).
export function medallion(R, m) {
  const g = new THREE.Group();
  g.add(at(mesh(new THREE.CylinderGeometry(R * 0.86, R * 0.86, 0.04, 12).rotateX(Math.PI / 2), m), 0, 0, 0.02));
  g.add(at(mesh(new THREE.TorusGeometry(R * 0.9, R * 0.12, 4, 12), m), 0, 0, 0.03));
  g.add(at(mesh(new THREE.SphereGeometry(R * 0.3, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2).rotateX(Math.PI / 2), m), 0, 0, 0.04));
  return g;
}

// A cusped (five-lobed) arch between two pillars: a panel aw wide hanging h down from y = 0, the
// opening cut in its lower edge, t thick and centred on z = 0. Shared by every bay of a width.
const archCache = new Map();
export function cuspedArchGeo(aw, h, t = 0.3) {
  const key = `${aw.toFixed(3)}:${h}`;
  if (!archCache.has(key)) {
    const r = aw / 2, rise = h * 0.72, N = 30, s = new THREE.Shape();
    s.moveTo(-r, -h); s.lineTo(-r, 0); s.lineTo(r, 0); s.lineTo(r, -h);
    // Round from the right springing over the crown to the left: the radius dips to a cusp at each
    // fifth of the way and swells into a lobe between.
    for (let i = 0; i <= N; i++) {
      const a = (i / N) * Math.PI, q = r * (1 - 0.14 * (1 - Math.abs(Math.sin(5 * a))));
      s.lineTo(q * Math.cos(a), -h + (q / r) * rise * Math.sin(a));
    }
    s.closePath();
    archCache.set(key, new THREE.ExtrudeGeometry(s, { depth: t, bevelEnabled: false }).translate(0, 0, -t / 2));
  }
  return archCache.get(key);
}

/* ---------- plain colonnades ---------- */
// Bases and capitals for a colonnade built as bare instanced shafts, [x, y, z, sx, sy, sz] each as
// given to inst(): under every shaft a square plinth and a round moulding, and at its head a
// necking ring under a square abacus (in capM). Instanced, three meshes for any number of columns.
export function columnTrim(list, m, { capM = m } = {}) {
  const g = new THREE.Group(), plinths = [], rings = [], caps = [];
  for (const [x, y, z, sx, sy, sz] of list) {
    const d = Math.max(sx, sz), bh = Math.min(0.5, sy * 0.05), ch = Math.min(0.6, sy * 0.06);
    plinths.push([x, y, z, d * 1.5, bh, d * 1.5]);
    rings.push([x, y + bh, z, d * 1.28, bh * 0.6, d * 1.28], [x, y + sy - ch * 1.7, z, d * 1.3, ch * 0.7, d * 1.3]);
    caps.push([x, y + sy - ch, z, d * 1.6, ch, d * 1.6]);
  }
  g.add(inst(unitBox(), plinths, m), inst(unitCyl(12), rings, m), inst(unitBox(), caps, capM));
  return g;
}

/* ---------- inlay ---------- */

// An inlaid border on a wall at z = 0: a rectangular frame w × h (from y = 0) of `band`-wide strips
// in `base`, 4 cm proud, with a run of lozenges in `inlay` along the middle of each strip, 2 cm
// further out, as the white and black marble that frames the panels of Mughal gates in red
// sandstone. `every` is the spacing of the lozenges (0 for none). Corners carry a small star.
export function inlayBorder(w, h, band, base, inlay, { every = band * 2.2 } = {}) {
  const g = new THREE.Group(), d = 0.04;
  for (const s of [-1, 1]) g.add(box(band, h, d, base, s * (w - band) / 2, 0, d / 2));
  for (const y of [0, h - band]) g.add(box(w - 2 * band, band, d, base, 0, y, d / 2));
  if (every > 0) {
    const geo = star(4, band * 0.32, inlay, 0.02, 0.45).geometry, list = [];
    const run = (x0, y0, x1, y1) => {
      const n = Math.max(1, Math.floor(Math.hypot(x1 - x0, y1 - y0) / every));
      for (let k = 0; k < n; k++) { const t = (k + 0.5) / n; list.push([x0 + (x1 - x0) * t, y0 + (y1 - y0) * t]); }
    };
    const m = band / 2;
    run(-w / 2 + m, band, -w / 2 + m, h - band); run(w / 2 - m, band, w / 2 - m, h - band);
    run(-w / 2 + band, m, w / 2 - band, m); run(-w / 2 + band, h - m, w / 2 - band, h - m);
    for (const [x, y] of list) g.add(mesh(geo, inlay, x, y, d));
    const sg = star(8, band * 0.42, inlay, 0.02).geometry;
    for (const x of [-w / 2 + m, w / 2 - m]) for (const y of [m, h - m]) g.add(mesh(sg, inlay, x, y, d));
  }
  return g;
}

// Louvred shutters, as on the windows of colonial Bengal: two leaves closed across an opening w × h
// from y = 0, standing `out` in front of z = 0, each a frame of stiles and rails round a panel of
// angled slats about 14 cm apart, a middle rail at a third of the height; in green by default.
const SHUTTER = surface(mat('#3f6b4f', 0.75), 'none');
export function louvredShutter(w, h, m = SHUTTER, { out = 0.06 } = {}) {
  const g = new THREE.Group(), lw = w / 2, st = Math.min(0.09, lw * 0.1), slats = [];
  for (const s of [-1, 1]) {
    const cx = s * lw / 2;
    for (const x of [cx - lw / 2 + st / 2, cx + lw / 2 - st / 2]) g.add(box(st, h, 0.06, m, x, 0, out));
    for (const y of [0, h / 3, h - st]) g.add(box(lw, st, 0.06, m, cx, y, out));
    const n = Math.max(3, Math.round((h - 2 * st) / 0.14));
    for (let k = 0; k < n; k++) {
      const y = st + (k + 0.5) * ((h - 2 * st) / n);
      if (Math.abs(y - h / 3 - st / 2) < 0.08) continue;
      slats.push(new THREE.BoxGeometry(lw - 2 * st, 0.02, 0.09).rotateX(0.6).translate(cx, y, out));
    }
  }
  g.add(mesh(mergeGeometries(slats.map((b) => b.toNonIndexed())), m));
  return g;
}

// A chadar: the carved cascade of a Mughal garden, down which water runs from one level to the next
// in a glittering sheet. A marble slab w wide sloping from y = drop at z = 0 down to y = 0 at z = len,
// its bed carved in fish scales (the 'scallop' surface) under a thin sheet of water, between kerbs,
// with a lip at the top and a small pool at its foot.
const SCALLOP = surface(mat('#e6ded2', 0.4), 'scallop');
const SHEET = mat('#dcecf4', 0.35, 0, { transparent: true, opacity: 0.16, depthWrite: false });
export function chadar(w, len, drop, m = M.marble) {
  const g = new THREE.Group(), slope = Math.atan2(drop, len), L = Math.hypot(len, drop);
  const bed = mesh(new THREE.BoxGeometry(w, 0.2, L).translate(0, -0.1, L / 2), SCALLOP);
  bed.position.set(0, drop, 0);
  bed.rotation.x = slope;
  const water = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.96, L).rotateX(-Math.PI / 2).translate(0, 0.03, L / 2), SHEET);
  water.position.copy(bed.position);
  water.rotation.x = slope;
  water.castShadow = false;
  g.add(bed, water);
  for (const s of [-1, 1]) {
    const k = box(0.3, 0.35, L, m, 0, -0.05, 0);
    k.geometry.translate(0, 0, L / 2);
    k.position.set(s * (w / 2 + 0.15), drop, 0);
    k.rotation.x = slope;
    g.add(k);
  }
  g.add(box(w + 0.6, 0.25, 0.4, m, 0, drop, -0.2), box(w + 1.2, 0.3, 1.6, m, 0, -0.3, len + 0.8), box(w + 0.6, 0.05, 1.0, M.water, 0, -0.04, len + 0.8));
  g.traverse((o) => { if (o.isMesh && o.material !== SHEET) { o.castShadow = o.receiveShadow = true; } });
  return g;
}

// A gable roof: a triangular prism w across its eaves, d long and h high to its ridge, standing on
// y = 0. The ridge runs along z, or along x with axis: 'x' (then w is the span across z and d the
// length along x). Pass doubleSided(m) for a roof seen from beneath.
export function gableRoof(w, d, h, m, { axis = 'z' } = {}) {
  if (axis === 'x') {
    const s = new THREE.Shape([new THREE.Vector2(-w / 2, 0), new THREE.Vector2(w / 2, 0), new THREE.Vector2(0, h)]);
    return mesh(new THREE.ExtrudeGeometry(s, { depth: d, bevelEnabled: false }).rotateY(Math.PI / 2).translate(-d / 2, 0, 0), m);
  }
  const s = new THREE.Shape();
  s.moveTo(-w / 2, 0); s.lineTo(w / 2, 0); s.lineTo(0, h); s.closePath();
  return mesh(new THREE.ExtrudeGeometry(s, { depth: d, bevelEnabled: false }).translate(0, 0, -d / 2), m);
}

// A lean-to roof over an aisle: a half-gable w wide and d long, sloping down from h high at x = 0
// to its eave at x = side * w (side 1 or -1). Two-sided, as it is seen from below.
export function leanTo(w, d, h, m, side) {
  const s = new THREE.Shape();
  s.moveTo(0, 0); s.lineTo(side * w, 0); s.lineTo(0, h); s.closePath();
  return mesh(new THREE.ExtrudeGeometry(s, { depth: d, bevelEnabled: false }).translate(0, 0, -d / 2), doubleSided(m));
}

// A Meitei roof w wide, d long and h high over y = 0: a steep gable whose sides sag a little, the
// ridge running along z and sweeping up at both ends into horns (in `horn`), as on the halls and
// shrines of Manipur.
export function meiteiRoof(w, d, h, m, horn = m) {
  const g = new THREE.Group(), s = new THREE.Shape(), e = w * 0.08;
  s.moveTo(-w / 2 - e, 0);
  for (let k = 1; k <= 8; k++) { const t = k / 8; s.lineTo(-w / 2 - e + (w / 2 + e) * t, h * (t - 0.18 * t * (1 - t))); }
  for (let k = 7; k >= 0; k--) { const t = k / 8; s.lineTo(w / 2 + e - (w / 2 + e) * t, h * (t - 0.18 * t * (1 - t))); }
  s.lineTo(w / 2 + e, -0.25); s.lineTo(-w / 2 - e, -0.25); s.closePath();
  g.add(mesh(new THREE.ExtrudeGeometry(s, { depth: d, bevelEnabled: false }).translate(0, 0, -d / 2), m));
  for (const sz of [-1, 1]) {
    const pts = [];
    for (let k = 0; k <= 8; k++) { const t = k / 8; pts.push(new THREE.Vector3(0, h + 0.1 + t * t * h * 0.35, sz * (d / 2 - 0.2 + t * h * 0.32))); }
    g.add(mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 10, Math.max(0.06, w * 0.02), 6, false), horn));
  }
  return g;
}

// A stone lattice filling a pointed arch aw wide and ah to its crown, as one flat mesh whose pattern
// is drawn on a canvas and cut out by its alpha, as in the windows of the Sidi Saiyyed Mosque. kind:
// 'tree', the Tree of Life: a trunk rising from a mound, its branches curling outward and ending in
// palm fronds, a creeper twined round it; 'branches', a tangle of intertwined boughs; 'lattice', a
// grid of six-pointed stars. A frame runs round each. color is the stone's.
const treeJalis = new Map();
function treeJaliTexture(kind, aw, ah) {
  const key = kind + aw.toFixed(2) + ah.toFixed(2);
  if (treeJalis.has(key)) return treeJalis.get(key);
  const W = detail.low ? 256 : 512, Hc = Math.round(W * ah / aw), c = document.createElement('canvas');
  c.width = W; c.height = Hc;
  const t = c.getContext('2d'), k = W / aw, X = (x) => W / 2 + x * k, Y = (y) => Hc - y * k;
  t.strokeStyle = t.fillStyle = '#ffffff'; t.lineCap = 'round';
  // The frame, following the arch.
  const r = aw / 2, s = ah - rise(r, true), outline = () => {
    t.beginPath(); t.moveTo(X(-r), Y(0));
    for (const p of archCurve(r, s, true, 24)) t.lineTo(X(p.x), Y(p.y));
    t.lineTo(X(r), Y(0)); t.closePath();
  };
  t.lineWidth = 0.22 * k; outline(); t.stroke();
  t.save(); outline(); t.clip();
  const R = (() => { let a = 7; return () => ((a = (a * 16807) % 2147483647) / 2147483647); })();
  const branch = (x, y, ang, len, w, depth) => {
    const ex = x + Math.cos(ang) * len, ey = y + Math.sin(ang) * len, bend = (R() - 0.5) * 0.8;
    t.lineWidth = w * k; t.beginPath(); t.moveTo(X(x), Y(y));
    t.quadraticCurveTo(X(x + Math.cos(ang + bend) * len * 0.6), Y(y + Math.sin(ang + bend) * len * 0.6), X(ex), Y(ey)); t.stroke();
    if (depth <= 0) {
      // A palm frond: a fan of leaves curling from the tip.
      for (let q = -3; q <= 3; q++) {
        const a2 = ang + q * 0.34; t.lineWidth = 0.055 * k; t.beginPath(); t.moveTo(X(ex), Y(ey));
        t.quadraticCurveTo(X(ex + Math.cos(a2) * 0.36), Y(ey + Math.sin(a2) * 0.36), X(ex + Math.cos(a2 - 0.5) * 0.55), Y(ey + Math.sin(a2 - 0.5) * 0.55)); t.stroke();
      }
      return;
    }
    for (const side of [-1, 1]) branch(ex, ey, ang + side * (0.45 + R() * 0.35), len * 0.72, w * 0.72, depth - 1);
  };
  if (kind === 'tree') {
    // The mound, the trunk, a creeper round it, and the branches.
    t.beginPath(); t.ellipse(X(0), Y(0.1), 0.6 * k, 0.28 * k, 0, 0, Math.PI * 2); t.fill();
    t.lineWidth = 0.16 * k; t.beginPath(); t.moveTo(X(0), Y(0.2)); t.lineTo(X(0), Y(ah * 0.45)); t.stroke();
    t.lineWidth = 0.05 * k; t.beginPath();
    for (let y = 0.2; y < ah * 0.45; y += 0.05) t.lineTo(X(Math.sin(y * 9) * 0.14), Y(y));
    t.stroke();
    for (const side of [-1, 1]) {
      branch(0, ah * 0.18, Math.PI / 2 + side * 1.3, aw * 0.3, 0.13, 3);
      branch(0, ah * 0.3, Math.PI / 2 + side * 0.9, aw * 0.3, 0.12, 4);
      branch(0, ah * 0.45, Math.PI / 2 + side * 0.45, aw * 0.28, 0.11, 4);
    }
    branch(0, ah * 0.45, Math.PI / 2, ah * 0.24, 0.1, 3);
  } else if (kind === 'branches') {
    for (let n = 0; n < 9; n++) branch(-r + R() * aw, 0.1, Math.PI / 2 + (R() - 0.5) * 1.4, ah * 0.32, 0.11, 4);
  } else {
    // Six-pointed stars on a grid, linked by bars.
    t.lineWidth = 0.05 * k;
    for (let y = 0.15; y < ah; y += 0.32) for (let x = -r + 0.16; x < r; x += 0.32) {
      t.beginPath();
      for (let q = 0; q < 12; q++) { const a = q * Math.PI / 6, rr = q % 2 ? 0.07 : 0.15; t.lineTo(X(x + Math.cos(a) * rr), Y(y + Math.sin(a) * rr)); }
      t.closePath(); t.stroke();
    }
  }
  t.restore();
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  treeJalis.set(key, tex);
  return tex;
}
export function treeJali(aw, ah, kind = 'tree', { color = '#c9a874' } = {}) {
  const r = aw / 2, s = ah - rise(r, true), sh = new THREE.Shape();
  sh.moveTo(-r, 0);
  archCurve(r, s, true, 16).forEach((p) => sh.lineTo(p.x, p.y));
  sh.lineTo(r, 0); sh.closePath();
  const geo = new THREE.ShapeGeometry(sh), uv = geo.attributes.uv, pos = geo.attributes.position;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, pos.getX(i) / aw + 0.5, pos.getY(i) / ah);
  const tex = treeJaliTexture(kind, aw, ah);
  const m = new THREE.MeshStandardMaterial({ color, alphaMap: tex, alphaTest: 0.5, roughness: 0.85, side: THREE.DoubleSide });
  const o = mesh(geo, m);
  o.userData.dressing = true;
  return o;
}

// The winged Faravahar, the emblem of Zoroastrianism, w across, in relief facing +z: a ring (the
// circle of eternity), above it the upper body of a man, one hand raised; spreading either side
// three tiers of feathers, and a fan of tail feathers below.
export function faravahar(w, m) {
  const g = new THREE.Group(), s = w / 6;
  g.add(at(mesh(new THREE.TorusGeometry(s * 0.55, s * 0.12, 8, 24), m), 0, s * 0.9, 0.12));
  g.add(box(s * 0.5, s * 0.95, s * 0.25, m, 0, s * 1.35, 0.1), box(s * 0.4, s * 0.42, s * 0.25, m, 0, s * 2.3, 0.1));
  for (const side of [-1, 1]) {
    for (let k = 0; k < 3; k++) {
      const len = s * (2.4 - k * 0.45), y = s * (1.15 + k * 0.24);
      const wing = box(len, s * 0.22, s * 0.18, m, side * (s * 0.6 + len / 2), y, 0.08);
      wing.rotation.z = side * (0.08 + k * 0.05);
      g.add(wing);
    }
    g.add(box(s * 0.08, s * 0.9, s * 0.12, m, side * s * 0.4, s * 1.4, 0.15));
  }
  for (let k = -2; k <= 2; k++) { const t = box(s * 0.26, s * 0.75, s * 0.15, m, k * s * 0.24, s * 0.05, 0.06); t.rotation.z = k * 0.12; g.add(t); }
  return g;
}

// Stepped merlons along a parapet len long, as on the walls of Persepolis: each w wide and h high,
// a block stepped back three times, depth deep.
export function steppedMerlons(len, w, h, m, depth = 0.4) {
  const g = new THREE.Group(), n = Math.floor(len / (w * 1.4));
  for (let k = 0; k < n; k++) {
    const x = -len / 2 + (k + 0.5) * (len / n);
    for (let q = 0; q < 3; q++) g.add(box(w * (1 - q * 0.3), h / 3, depth, m, x, q * h / 3, 0));
  }
  return g;
}

// A wall w wide, h high and t thick, its face at z = 0 facing +z, pierced by `holes`: circles
// [x, y, r] and arches ['arch', x, y0, r, spring] (a round head of radius r on straight sides), as
// in Louis Kahn's brick screens.
export function piercedWall(w, h, t, holes, m) {
  const s = new THREE.Shape([new THREE.Vector2(-w / 2, 0), new THREE.Vector2(w / 2, 0), new THREE.Vector2(w / 2, h), new THREE.Vector2(-w / 2, h)]);
  for (const hole of holes) {
    const p = new THREE.Path();
    if (hole[0] === 'arch') {
      const [, x, y0, r, spring] = hole;
      p.moveTo(x + r, y0); p.lineTo(x + r, spring); p.absarc(x, spring, r, 0, Math.PI, false); p.lineTo(x - r, y0); p.closePath();
    } else {
      const [x, y, r] = hole;
      p.absarc(x, y, r, 0, Math.PI * 2, false);
    }
    s.holes.push(p);
  }
  return mesh(new THREE.ExtrudeGeometry(s, { depth: t, bevelEnabled: false, curveSegments: 20 }).translate(0, 0, -t), m);
}

// A trishul, Shiva's trident, h high to the base of its prongs, its foot at the origin: a shaft
// with a collar, a crossbar, a straight middle blade and two curved side prongs with tips, and a
// damru (the hourglass drum) tied to the shaft. Merged.
const TRISHUL = mat('#1f1f22', 0.36, 0.55);
export function trishul(h, m = TRISHUL) {
  const g = new THREE.Group();
  g.add(cyl(0.16, 0.2, h, m, 0, 0, 0, 10), cyl(0.36, 0.36, 0.5, m, 0, h * 0.78, 0, 12));
  const y = h + 0.1;
  const prong = (s) => {
    const c = new THREE.CatmullRomCurve3([[0, y, 0], [s * 1.2, y + 0.25, 0], [s * 1.55, y + 1.3, 0], [s * 1.35, y + 2.6, 0]].map((p) => new THREE.Vector3(...p)));
    return mesh(new THREE.TubeGeometry(c, 16, 0.16, 8), m);
  };
  g.add(prong(-1), prong(1), cyl(0.0, 0.24, 3.6, m, 0, y, 0, 8), box(3.2, 0.3, 0.35, m, 0, y - 0.15, 0));
  for (const s of [-1, 1]) g.add(mesh(new THREE.ConeGeometry(0.2, 0.7, 8), m, s * 1.35, y + 2.9, 0));
  const dam = new THREE.Group();
  for (const s of [-1, 1]) { const c = mesh(new THREE.ConeGeometry(0.42, 0.55, 14), m, 0, s * 0.28, 0); if (s > 0) c.rotation.x = Math.PI; dam.add(c); }
  g.add(at(dam, 0.45, h * 0.7, 0));
  return mergeByMaterial(g);
}

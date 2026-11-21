import * as THREE from 'three';
import { M, mat, mesh, box, at, rise, surface, doubleSided } from '../helpers.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { detail } from '../detail.js';
import { archCurve, archRing, archSlab, tympanum, niche, jali, rosette, merlons, mergeByMaterial } from './components.js';
import { interior, doorLeaves, steps } from './doorways.js';

// Doorways, iwans and arcades for the Mughal, Indo-Islamic, Nawabi, Qutb Shahi and Deccan
// buildings. A door here is never a dark arch on a wall: it has a reveal (the sides and soffit of
// an opening cut through a slab), stepped arch orders, a door under a lintel with a pierced screen
// in the arch head, leaves standing open onto a dim room, and a threshold. Every part faces +z
// with its back at z = 0 and its sill at y = 0.

// A slab len wide, h high and `depth` thick (z = 0 to depth), pierced by pointed arched openings.
// holes: [[cx, sill, aw, ah]]. An opening whose sill is at 0 is cut into the slab's outline, as an
// arch through a wall; the others are holes in it.
export function pierced(len, h, holes, depth, m, pointed = true) {
  const sh = new THREE.Shape(), ground = [], raised = [];
  for (const o of holes) (o[1] < 0.01 ? ground : raised).push(o);
  ground.sort((a, b) => a[0] - b[0]);
  sh.moveTo(-len / 2, 0);
  for (const [cx, , aw, ah] of ground) {
    const r = aw / 2, s = ah - rise(r, pointed);
    sh.lineTo(cx - r, 0);
    archCurve(r, s, pointed).forEach((p) => sh.lineTo(cx + p.x, p.y));
    sh.lineTo(cx + r, 0);
  }
  sh.lineTo(len / 2, 0); sh.lineTo(len / 2, h); sh.lineTo(-len / 2, h); sh.closePath();
  for (const [cx, sill, aw, ah] of raised) {
    const r = aw / 2, s = ah - rise(r, pointed), p = new THREE.Path();
    p.moveTo(cx - r, sill);
    archCurve(r, s, pointed).forEach((q) => p.lineTo(cx + q.x, sill + q.y));
    p.lineTo(cx + r, sill);
    p.closePath();
    sh.holes.push(p);
  }
  return mesh(new THREE.ExtrudeGeometry(sh, { depth, bevelEnabled: false, curveSegments: 4 }), m);
}

// An arched doorway w wide and h to its crown, standing `depth` proud of the wall: an outer order
// with a moulded ring, an inner order a step narrower and half as deep, then at the back a door up
// to the springing under a lintel, a pierced screen in the arch head, timber leaves standing open
// onto a dim room, and a threshold. `room` is the free depth in front of the wall for the leaves
// to swing into (more inside an iwan).
export function mughalDoorway(w, h, { m, trim = m, depth = Math.max(0.45, w * 0.18), frame = w * 0.16, top = w * 0.22, room = depth * 0.5, leafM = undefined } = {}) {
  const g = new THREE.Group(), W = w + 2 * frame;
  g.add(pierced(W, h + top, [[0, 0, w, h]], depth, m));
  g.add(at(archRing(w, h, true, Math.min(0.2, w * 0.05), 0.05, trim), 0, 0, depth));
  // The inner order: the same springing, a narrower and lower arch.
  const wi = w * 0.8, hi = h - (w - wi) * 0.7, si = hi - rise(wi / 2, true), d2 = depth * 0.5;
  g.add(pierced(w + 0.04, h, [[0, 0, wi, hi]], d2, trim));
  // The door up to the springing, its lintel, and the screened arch head above.
  const lintel = Math.min(0.3, si * 0.06);
  g.add(at(interior(wi * 0.999, si - lintel, 0.14, 0.1), 0, 0, 0.012));
  g.add(box(wi, lintel, d2, trim, 0, si - lintel, d2 / 2));
  g.add(at(tympanum(wi * 0.999, hi * 0.999, true, M.recess, 0.03), 0, 0, 0.012));
  g.add(at(tympanum(wi * 0.998, hi * 0.998, true, jali(trim), 0.04), 0, 0, 0.05));
  const lw = wi / 2, open = Math.asin(Math.min(0.92, Math.max(0.2, (room - 0.05) / lw)));
  g.add(at(doorLeaves(wi * 0.996, (si - lintel - 0.15) * 0.99, { open, ...(leafM ? { m: leafM } : {}) }), 0, 0.15, 0.02));
  g.add(box(wi, 0.15, d2, trim, 0, 0, d2 / 2));
  mergeByMaterial(g);
  g.userData = { outerW: W, outerH: h + top, depth };
  return g;
}

// Muqarnas: the half-dome of a pointed arch w × h, `depth` deep (as hood() in components.js
// builds it: a quarter ellipsoid from the springing on the back wall to the crown on the opening),
// lined with tiers of small faceted cells, each a little scalloped niche corbelled out from the
// vault, its mouth facing in and down, the tiers staggered by half a cell and separated by fine
// ledges in `trim`. The cells grow fewer towards the crown, where the vault is left smooth.
// tiers: how many rows (by default about one per 1.2 m of rise). Faces +z, back at z = 0.
export function muqarnas(w, h, depth, { m, trim = m, tiers = 0 } = {}) {
  const r = w / 2, R = rise(r, true), s = h - R, D = depth, T = tiers || Math.max(3, Math.min(10, Math.round(R / 1.2)));
  const C = new THREE.Vector3(0, s, D), eMax = (Math.PI / 2) * 0.86;
  const P = (a, e) => new THREE.Vector3(r * Math.cos(a) * Math.cos(e), R * Math.sin(e), -D * Math.sin(a) * Math.cos(e)).add(C);
  const inward = (p) => { const q = p.clone().sub(C); return new THREE.Vector3(-q.x / (r * r), -q.y / (R * R), -q.z / (D * D)).normalize(); };
  const cell = new THREE.SphereGeometry(1, 6, 3, 0, Math.PI, 0, Math.PI / 2).rotateY(Math.PI);
  const mats = [], ledges = [], avg = (r + D) / 2;
  for (let k = 0; k < T; k++) {
    const e0 = (k / T) * eMax, e1 = ((k + 1) / T) * eMax, tierH = (e1 - e0) * Math.hypot(R, avg) * 0.72;
    const n = Math.max(2, Math.round((Math.PI * avg * Math.cos(e0)) / (tierH * 1.15)));
    const cw = (Math.PI * avg * Math.cos(e0)) / n, cd = Math.min(tierH, cw) * 0.45;
    for (let i = 0; i < n; i++) {
      const a = ((i + 0.5 + (k % 2) * 0.5) / (n + (k % 2) * 0.5)) * Math.PI;
      const p = P(a, e0), z = inward(p), up = P(a, e0 + 0.01).sub(p).normalize();
      const y = up.sub(z.clone().multiplyScalar(up.dot(z))).normalize(), x = new THREE.Vector3().crossVectors(y, z);
      const o = p.clone().addScaledVector(z, cd);
      mats.push(new THREE.Matrix4().makeBasis(x, y, z).scale(new THREE.Vector3(cw * 0.48, tierH, cd)).setPosition(o));
    }
    if (k > 0 && !detail.low) {
      const pts = [];
      for (let i = 0; i <= 24; i++) { const p = P((i / 24) * Math.PI, e0); pts.push(p.addScaledVector(inward(p), cd * 0.9)); }
      ledges.push(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 24, Math.min(0.07, tierH * 0.04), 4, false));
    }
  }
  const g = new THREE.Group(), im = new THREE.InstancedMesh(cell, doubleSided(m), mats.length);
  mats.forEach((mx, i) => im.setMatrixAt(i, mx));
  im.castShadow = false;
  im.receiveShadow = true;
  g.add(im);
  if (ledges.length) g.add(mesh(mergeGeometries(ledges.map((t) => t.toNonIndexed())), trim));
  return g;
}

// An inscription band round a pishtaq: black letters inlaid in white marble (the 'calligraphy'
// surface), as a frame `bw` wide standing just proud of the face at z = 0, round a rectangle
// W wide and up to yt high from y = 0.
const SCRIPT = surface(mat('#f1ece0', 0.5), 'calligraphy');
export function scriptFrame(W, yt, bw) {
  const g = new THREE.Group();
  for (const x of [-1, 1]) g.add(box(bw, yt, 0.05, SCRIPT, x * (W / 2 - bw / 2), 0, 0));
  g.add(box(W, bw, 0.05, SCRIPT, 0, yt, 0));
  return g;
}

// An iwan: a pointed arch w × h set in a rectangular frame (`frame` each side, `top` above),
// recessed `depth` with a half-dome over it, outlined in `trim` (a moulded ring and a flat band
// round the frame, as the white marble lines on red sandstone). At the back, fill: 'door' (a
// mughalDoorway below the springing and, if there is room, a screened window above it), 'jali' (a
// pierced screen), or 'none'; door: [width, height] to size the door rather than fill the space.
// Options: merlons along the top, rosettes in the spandrels, and steps down `stepsDown` metres;
// cells: muqarnas in the half-dome (desktops; on by default from 5 m wide); script: an inscription
// band round the frame.
export function iwan(w, h, {
  m, trim = m, shade = m, depth = w * 0.22, frame = w * 0.18, top = w * 0.25, fill = 'door', door = null,
  band = true, crest = false, rosettes = false, stepsDown = 0, cells = w >= 5, script = false,
} = {}) {
  const g = new THREE.Group(), s = h - rise(w / 2, true), W = w + 2 * frame;
  g.add(niche(w, h, true, depth, m, { frame, top, back: shade, inner: false, ring: false, hoodM: shade }));
  g.add(at(archRing(w, h, true, Math.min(0.35, w * 0.035), 0.07, trim), 0, 0, depth));
  // A blind arch traced on the back wall, round whatever stands there.
  g.add(at(archRing(w * 0.86, s + rise(w * 0.43, true), true, Math.min(0.22, w * 0.025), 0.06, trim), 0, 0, 0.06));
  if (fill === 'door') {
    const avail = s - 0.25, auto = Math.min(w * 0.44, avail / 1.75);
    const [dw, dh] = door || [auto, Math.min(auto * 1.55, avail - auto * 0.22)];
    const dd = mughalDoorway(dw, dh, { m: shade, trim, depth: Math.min(0.7, depth * 0.3), room: depth * 0.85 });
    g.add(at(dd, 0, 0, 0.06));
    const free = avail - dd.userData.outerH;
    if (free > 1.6) {
      const ww = dw * 0.7, wh = Math.min(free - 0.5, ww * 1.6), wy = dd.userData.outerH + 0.3;
      g.add(at(archSlab(ww, wh, true, M.recess, 0.04), 0, wy, 0.06), at(archSlab(ww * 0.998, wh * 0.998, true, jali(trim), 0.05), 0, wy, 0.1));
      g.add(at(archRing(ww, wh, true, ww * 0.06, 0.08, trim), 0, wy, 0.08));
    }
  } else if (fill === 'jali') {
    g.add(at(archSlab(w * 0.999, h * 0.999, true, M.recess, 0.03), 0, 0, 0.06), at(archSlab(w * 0.998, h * 0.998, true, jali(trim), 0.05), 0, 0, 0.09));
  }
  if (band) {
    const bw = Math.min(0.4, frame * 0.18), xo = w / 2 + frame * 0.55, yt = h + top * 0.55;
    for (const x of [-xo, xo]) g.add(box(bw, yt + bw, 0.06, trim, x, 0, depth + 0.01));
    g.add(box(2 * xo + bw, bw, 0.06, trim, 0, yt, depth + 0.01));
  }
  if (rosettes) for (const x of [-1, 1]) g.add(at(rosette(Math.min(frame, top) * 0.3, trim, 8), x * w * 0.38, h - rise(w / 2, true) * 0.12, depth + 0.02));
  // An inscription band round the frame, outside the trim band, where the frame is wide enough.
  if (script && frame > 1 && top >= frame * 0.8) { const bw = Math.min(0.9, frame * 0.25), W2 = W - frame * 0.16; g.add(at(scriptFrame(W2, h + top - frame * 0.08 - bw, bw), 0, 0, depth + 0.012)); }
  // Muqarnas in the half-dome, on desktops (and only in an iwan big enough to show them).
  if (cells && !detail.low) g.add(muqarnas(w * 0.99, h * 0.99, depth * 0.99, { m: shade, trim }));
  if (crest) g.add(at(merlons(W - 0.2, Math.min(0.8, W * 0.04), Math.min(1.1, W * 0.055), Math.min(0.4, depth * 0.4), m, 0.3), 0, h + top, depth / 2));
  if (stepsDown > 0) g.add(at(steps(Math.min(W, w + 2), stepsDown, Math.max(2, Math.ceil(stepsDown / 0.4)), shade), 0, -stepsDown, depth));
  mergeByMaterial(g);
  g.userData = { outerW: W, outerH: h + top, depth };
  return g;
}

// A facade len wide and h high pierced by a row of arched cells `depth` deep, with a moulded ring
// round each arch. It replaces the outer `depth` of a solid block: build the block that much
// shallower and set this in front of it, so the block's own face is the back of every cell. What
// each cell shows at its back, `fill` (or a fifth entry on the cell): 'door', a small framed door
// in the back wall, which stands in shade under the arch; 'room', an opening onto a dim gallery;
// 'jali', a pierced screen as a window; 'none', the bare back wall. cells: [[cx, sill, aw, ah, fill?]].
// pointed: false gives round arches, for the colonial and Indo-Saracenic arcades.
export function arcadeSkin(len, h, cells, depth, m, { trim = m, ring = true, fill = 'door', pointed = true } = {}) {
  const g = new THREE.Group();
  g.add(pierced(len, h, cells, depth, m, pointed));
  for (const [cx, sill, aw, ah, own] of cells) {
    const kind = own || fill;
    if (ring) g.add(at(archRing(aw, ah, pointed, Math.min(0.22, aw * 0.06), 0.05, trim), cx, sill, depth));
    // A sill slab whose top stands just above the opening's floor, so the two never share a plane.
    if (sill > 0.01) g.add(box(aw - 0.02, 0.14, depth - 0.04, trim, cx, sill - 0.12, depth / 2));
    if (kind === 'room') g.add(at(interior(aw * 0.999, ah, 0.2, 0), cx, sill, 0.012));
    if (kind === 'jali') g.add(at(archSlab(aw * 0.999, ah * 0.999, pointed, M.recess, 0.03), cx, sill, 0.012), at(archSlab(aw * 0.998, ah * 0.998, pointed, jali(trim), 0.05), cx, sill, 0.05));
    if (kind === 'door') {
      const s = ah - rise(aw / 2, pointed), dw = Math.min(aw * 0.46, 1.5), dh = Math.min(s * 0.92, dw * 2.1), f = Math.max(0.1, dw * 0.1);
      g.add(at(interior(dw, dh, 0.15, 0.05), cx, sill, 0.012));
      for (const x of [-1, 1]) g.add(box(f, dh + f, 0.1, trim, cx + x * (dw + f) / 2, sill, 0.05));
      g.add(box(dw + 2 * f, f, 0.1, trim, cx, sill + dh, 0.05));
    }
  }
  return mergeByMaterial(g);
}

// Cells for arcadeSkin: n arches aw × ah on a sill, centred `pitch` apart about x = 0, leaving out
// any whose centre falls in one of the `skip` ranges [[from, to]].
export function cellRow(n, pitch, sill, aw, ah, skip = []) {
  const out = [];
  for (let k = 0; k < n; k++) {
    const cx = (k - (n - 1) / 2) * pitch;
    if (!skip.some(([a, b]) => cx > a && cx < b)) out.push([cx, sill, aw, ah]);
  }
  return out;
}

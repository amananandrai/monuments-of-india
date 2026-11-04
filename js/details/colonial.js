import * as THREE from 'three';
import { M, mat, mesh, box, cyl, at, surface, ribbed } from '../helpers.js';
import { archCurve, jali, mergeByMaterial } from './components.js';
import { corinthianCapital } from './sculpture.js';
import { interior, doorLeaves, steps } from './doorways.js';

// Doors, windows and porches for the colonial, Gothic Revival, Baroque and Indo-Saracenic
// buildings. As in the rest of the doorway kit, an opening is never a dark shape stuck on a wall: it
// is cut through a surround that stands `depth` proud of the wall (so its sides are the reveal),
// framed by a moulded architrave, and has something at the back (door leaves before a dim room,
// glazing with its bars, a screen). Every part faces +z with its back against the wall at z = 0 and
// its sill at y = 0.

// Glazing: dark, smooth and a little metallic, so it shows the sky from the environment map.
export const GLASS = surface(mat('#26303a', 0.12, 0.7), 'none');

/* ---------- opening shapes ---------- */

// The head of an opening of half-width r whose crown is at `top`, as points from its left springing
// to its right one, and the springing height. shape: 'flat' (a lintel), 'round', 'pointed', or
// 'segment' (a shallow arc rising 0.36 r).
export function head(r, top, shape) {
  if (shape === 'flat') return { sp: top, pts: [new THREE.Vector2(-r, top), new THREE.Vector2(r, top)] };
  if (shape === 'segment') {
    const f = r * 0.36, rho = (r * r + f * f) / (2 * f), cy = top - rho, a0 = Math.asin(r / rho), pts = [];
    for (let k = 0; k <= 12; k++) { const a = -a0 + (2 * a0 * k) / 12; pts.push(new THREE.Vector2(Math.sin(a) * rho, cy + Math.cos(a) * rho)); }
    return { sp: top - f, pts };
  }
  const pointed = shape === 'pointed', sp = top - (pointed ? r * 1.4 : r);
  return { sp, pts: archCurve(r, sp, pointed) };
}

// A slab len × h, `depth` thick (z = 0 to depth), with openings cut through it: [[cx, sill, w, h,
// shape]]. An opening whose sill is at 0 is cut into the slab's outline.
export function cutSlab(len, h, holes, depth, m) {
  const sh = new THREE.Shape(), ground = holes.filter((o) => o[1] < 0.01).sort((a, b) => a[0] - b[0]);
  sh.moveTo(-len / 2, 0);
  for (const [cx, , w, hh, shape = 'round'] of ground) {
    sh.lineTo(cx - w / 2, 0);
    head(w / 2, hh, shape).pts.forEach((p) => sh.lineTo(cx + p.x, p.y));
    sh.lineTo(cx + w / 2, 0);
  }
  sh.lineTo(len / 2, 0); sh.lineTo(len / 2, h); sh.lineTo(-len / 2, h); sh.closePath();
  for (const [cx, sill, w, hh, shape = 'round'] of holes.filter((o) => o[1] >= 0.01)) {
    const p = new THREE.Path();
    p.moveTo(cx - w / 2, sill);
    head(w / 2, hh, shape).pts.forEach((q) => p.lineTo(cx + q.x, sill + q.y));
    p.lineTo(cx + w / 2, sill);
    p.closePath();
    sh.holes.push(p);
  }
  return mesh(new THREE.ExtrudeGeometry(sh, { depth, bevelEnabled: false, curveSegments: 4 }), m);
}

// The opening itself as a solid slab from height `from` up to its head (glazing, a fanlight, a back).
export function headSlab(w, h, shape, m, depth = 0.04, from = 0) {
  const sh = new THREE.Shape(), { pts } = head(w / 2, h, shape);
  sh.moveTo(-w / 2, from);
  pts.forEach((p) => { if (p.y > from + 1e-3) sh.lineTo(p.x, p.y); });
  sh.lineTo(w / 2, from);
  sh.closePath();
  return mesh(new THREE.ExtrudeGeometry(sh, { depth, bevelEnabled: false }), m);
}

// A moulded band `band` wide round an opening, running down both jambs to y = 0.
export function headRing(w, h, shape, band, depth, m) {
  const r = w / 2, R = r + band, outer = head(R, h + band, shape).pts, inner = head(r, h, shape).pts.reverse();
  const sh = new THREE.Shape();
  sh.moveTo(-R, 0);
  outer.forEach((p) => sh.lineTo(p.x, p.y));
  sh.lineTo(R, 0); sh.lineTo(r, 0);
  inner.forEach((p) => sh.lineTo(p.x, p.y));
  sh.lineTo(-r, 0);
  sh.closePath();
  return mesh(new THREE.ExtrudeGeometry(sh, { depth, bevelEnabled: false }), m);
}

// Glazing bars across an opening w × h, from height `from`: a mullion up to a transom (at the
// springing of an arched head, or two-thirds up a flat one) and, above the transom, bars radiating
// from its middle like a fanlight's, or two short bars in a flat one.
function glazingBars(w, h, shape, t, m, z, from = 0) {
  const g = new THREE.Group(), { sp } = head(w / 2, h, shape), b = Math.max(0.04, w * 0.025);
  const tr = shape === 'flat' ? (from > 0 ? from : h * 0.66) : Math.max(sp, from);
  if (tr - from > 0.3) g.add(box(b, tr - from, t, m, 0, from, z));
  g.add(box(w, b, t, m, 0, tr - b / 2, z));
  if (shape === 'flat') {
    for (const x of [-w / 4, w / 4]) g.add(box(b, h - tr, t, m, x, tr, z));
  } else {
    const r = w / 2, up = h - tr;
    for (let k = 1; k < 6; k++) {
      const a = (k / 6) * Math.PI, len = Math.hypot(Math.cos(a) * r, Math.sin(a) * up) * 0.97;
      const bar = mesh(new THREE.BoxGeometry(b, len, t).translate(0, len / 2, 0), m, 0, tr, z);
      bar.rotation.z = a - Math.PI / 2;
      g.add(bar);
    }
  }
  return g;
}

/* ---------- classical parts ---------- */

// A column rc in radius and hc tall, standing at y = 0: a square plinth, a moulded base, a shaft
// tapering a little, a bell capital and an abacus. order: 'corinthian' gives the shaft flutes and
// a capital of acanthus leaves and volutes instead.
export function column(rc, hc, m, { order = 'plain' } = {}) {
  const g = new THREE.Group(), pl = rc * 0.5, ab = rc * 0.35, cap = rc * 1.1;
  g.add(box(rc * 2.6, pl, rc * 2.6, m), cyl(rc * 1.2, rc * 1.28, rc * 0.3, m, 0, pl, 0, 16));
  if (order === 'corinthian') {
    const ch = rc * 2.2 + rc * 0.32, sh = hc - pl - rc * 0.3 - ch;
    g.add(cyl(rc * 1.1, rc * 1.1, rc * 0.12, m, 0, pl + rc * 0.3, 0, 16));
    g.add(ribbed(cyl(rc * 0.88, rc, sh, m, 0, pl + rc * 0.3, 0, 32), 16, 0.05));
    g.add(at(corinthianCapital(rc * 0.9, m), 0, hc - ch, 0));
    return g;
  }
  g.add(cyl(rc * 0.86, rc, hc - pl - rc * 0.3 - cap - ab, m, 0, pl + rc * 0.3, 0, 16));
  g.add(cyl(rc * 1.32, rc * 0.88, cap, m, 0, hc - ab - cap, 0, 16), box(rc * 2.7, ab, rc * 2.7, m, 0, hc - ab, 0));
  return g;
}

// A row of balusters len long and h high between a plinth and a handrail, along x.
export function balustrade(len, h, m, { t = Math.min(0.4, h * 0.3) } = {}) {
  const g = new THREE.Group(), bh = h - 2 * t * 0.5;
  g.add(box(len, t * 0.5, t * 1.1, m, 0, 0, 0), box(len + 0.1, t * 0.5, t * 1.25, m, 0, h - t * 0.5, 0));
  const prof = [[0.001, 0], [0.42, 0], [0.42, 0.08], [0.24, 0.16], [0.36, 0.38], [0.18, 0.62], [0.2, 0.86], [0.34, 0.92], [0.34, 1], [0.001, 1]];
  const geo = new THREE.LatheGeometry(prof.map(([r, y]) => new THREE.Vector2(r * t, y * bh)), 8);
  const n = Math.max(2, Math.floor(len / (t * 1.1)));
  for (let k = 0; k < n; k++) g.add(mesh(geo, m, -len / 2 + (k + 0.5) * (len / n), t * 0.5, 0));
  return g;
}

// A triangular pediment w wide and h high on y = 0, `depth` deep: the tympanum set back a little
// behind the raking cornices.
export function pediment(w, h, depth, m, trim = m) {
  const g = new THREE.Group(), sh = new THREE.Shape(), c = Math.min(0.5, h * 0.18);
  sh.moveTo(-w / 2, 0); sh.lineTo(w / 2, 0); sh.lineTo(0, h); sh.closePath();
  g.add(mesh(new THREE.ExtrudeGeometry(sh, { depth: depth - 0.12, bevelEnabled: false }), m));
  const len = Math.hypot(w / 2, h), a = Math.atan2(h, w / 2);
  for (const s of [-1, 1]) {
    const r = box(len + c, c, depth + 0.05, trim, 0, -c / 2, 0);
    r.position.set(s * w / 4, h / 2 + c * 0.2, (depth + 0.05) / 2);
    r.rotation.z = -s * a;
    g.add(r);
  }
  g.add(box(w + 0.1, c, depth + 0.05, trim, 0, -c, (depth + 0.05) / 2));
  return g;
}

// A segmental pediment w wide rising h on y = 0, `depth` deep, with a moulded rim along its arc.
function segmentPediment(w, h, depth, m, trim = m) {
  const g = new THREE.Group(), c = Math.min(0.4, h * 0.25), rho = (w * w / 4 + h * h) / (2 * h);
  const arc = (R, from) => {
    const sh = new THREE.Shape(), a0 = Math.asin(Math.min(1, (w / 2) / R)), cy = h - rho;
    sh.moveTo(-w / 2, from);
    for (let k = 0; k <= 16; k++) { const a = -a0 + (2 * a0 * k) / 16; sh.lineTo(Math.sin(a) * R, cy + Math.cos(a) * R); }
    sh.lineTo(w / 2, from); sh.closePath();
    return sh;
  };
  g.add(mesh(new THREE.ExtrudeGeometry(arc(rho, 0), { depth: depth - 0.12, bevelEnabled: false }), m));
  const rim = arc(rho + c, 0);
  rim.holes.push(arc(rho, -0.001));
  g.add(at(mesh(new THREE.ExtrudeGeometry(rim, { depth: 0.18, bevelEnabled: false }), trim), 0, 0, depth - 0.13));
  g.add(box(w + 0.1, c, depth + 0.05, trim, 0, -c, (depth + 0.05) / 2));
  return g;
}

// A classical door or window, w wide and h to the crown of its head:
// - shape: 'round', 'flat', 'segment' or 'pointed';
// - fill: 'door' (panelled leaves standing open onto a dim room, under a transom and a glazed
//   fanlight), 'glass' (a sash window with its bars), 'room' (an opening onto a dim room) or 'jali';
// - top: 'cornice', 'pediment', 'segment', 'broken' (a Baroque pediment parted round a finial),
//   or null;
// - columns: free-standing columns per side (0, 1 or 2) carrying an entablature; pilasters: flat
//   ones on the surround instead;
// - keystone at the crown of an arch; sill: a projecting sill (for windows); stepsDown: a flight of
//   steps down to the ground in front.
export function classicalDoor(w, h, {
  m, trim = m, shape = 'round', fill = 'door', top = 'cornice', depth = Math.max(0.3, w * 0.16),
  frame = w * 0.17, band = Math.min(0.3, w * 0.07), columns = 0, pilasters = false, colM = trim,
  keystone = shape === 'round' || shape === 'segment', sill = fill === 'glass', leafM = undefined,
  stepsDown = 0,
} = {}) {
  const g = new THREE.Group(), r = w / 2, { sp } = head(r, h, shape);
  let W = w + 2 * frame;
  const H = h + Math.max(frame * 0.9, band * 1.8);
  // Columns stand in front of the surround, clear of the architrave.
  const rc = Math.max(0.1, frame * 0.34), xs = [];
  for (let k = 0; k < columns; k++) xs.push(r + band + rc * 1.5 + k * rc * 3);
  if (columns) W = Math.max(W, 2 * (xs[xs.length - 1] + rc * 1.6));
  const dc = columns ? depth + rc * 2.8 : depth;
  g.add(cutSlab(W, H, [[0, 0, w, h, shape]], depth, m));
  g.add(at(headRing(w, h, shape, band, 0.06, trim), 0, 0, depth));
  // What stands at the back of the opening.
  if (fill === 'door') {
    const dh = shape === 'flat' ? h * 0.78 : Math.max(sp, h * 0.55), lt = Math.min(0.14, dh * 0.04);
    g.add(at(interior(w * 0.998, dh, 0.12, 0.08), 0, 0, 0.012));
    g.add(at(headSlab(w * 0.999, h * 0.999, shape, GLASS, 0.03, dh), 0, 0, 0.012));
    g.add(glazingBars(w * 0.999, h * 0.999, shape, 0.05, trim, 0.05, dh));
    g.add(box(w, lt, depth * 0.6, trim, 0, dh - lt / 2, depth * 0.3));
    const open = Math.asin(Math.min(0.9, Math.max(0.15, (depth - 0.06) / r))) * 0.85;
    g.add(at(doorLeaves(w * 0.996, (dh - lt / 2 - 0.08) * 0.995, { open, studs: false, ...(leafM ? { m: leafM } : {}) }), 0, 0.08, 0.02));
    g.add(box(w, 0.08, depth, trim, 0, 0, depth / 2));
  } else if (fill === 'glass') {
    g.add(at(headSlab(w * 0.999, h * 0.999, shape, GLASS, 0.03), 0, 0, 0.012));
    g.add(glazingBars(w * 0.999, h * 0.999, shape, 0.05, trim, 0.05));
  } else if (fill === 'room') {
    g.add(at(interior(w * 0.998, h, 0.16, 0.05), 0, 0, 0.012));
  } else if (fill === 'jali') {
    g.add(at(headSlab(w * 0.999, h * 0.999, shape, M.recess, 0.03), 0, 0, 0.012), at(headSlab(w * 0.998, h * 0.998, shape, jali(trim), 0.05), 0, 0, 0.05));
  }
  if (keystone && shape !== 'flat') {
    const kw = Math.max(0.18, w * 0.13), kh = Math.min(H - h + band * 0.6, band * 1.4 + frame * 0.5), sh = new THREE.Shape();
    sh.moveTo(-kw / 2, 0); sh.lineTo(kw / 2, 0); sh.lineTo(kw * 0.75, kh); sh.lineTo(-kw * 0.75, kh); sh.closePath();
    g.add(at(mesh(new THREE.ExtrudeGeometry(sh, { depth: 0.14, bevelEnabled: false }), trim), 0, h - band * 0.4, depth));
  }
  if (pilasters) {
    const pw = Math.max(0.12, frame * 0.5);
    for (const s of [-1, 1]) {
      const x = s * (W / 2 - pw / 2);
      g.add(box(pw, H, 0.1, trim, x, 0, depth + 0.05), box(pw + 0.1, Math.min(0.3, H * 0.05), 0.2, trim, x, 0, depth + 0.1));
      g.add(box(pw + 0.12, Math.min(0.25, H * 0.04), 0.22, trim, x, H - Math.min(0.25, H * 0.04), depth + 0.11));
    }
  }
  let yTop = H;
  if (columns) {
    for (const s of [-1, 1]) for (const x of xs) g.add(at(column(rc, H, colM), s * x, 0, depth + rc * 1.4));
    const ent = Math.max(0.3, rc * 2.2);
    g.add(box(W, ent, dc, trim, 0, H, dc / 2));
    yTop += ent;
  }
  const dt = dc + 0.25, Wt = W + 0.3, c = Math.max(0.12, Math.min(0.32, W * 0.04));
  if (top) {
    g.add(box(Wt, c, dt, trim, 0, yTop, dt / 2));
    const n = Math.floor(Wt / (c * 1.4));
    for (let k = 0; k < n; k++) g.add(box(c * 0.6, c * 0.6, c * 0.6, trim, -Wt / 2 + (k + 0.5) * (Wt / n), yTop - c * 0.6, dt - c * 0.4));
    yTop += c;
    if (top === 'pediment') { g.add(at(pediment(Wt, Wt * 0.22, dt, m, trim), 0, yTop + c, 0)); yTop += c + Wt * 0.22; }
    if (top === 'segment') { g.add(at(segmentPediment(Wt, Wt * 0.16, dt, m, trim), 0, yTop + c, 0)); yTop += c + Wt * 0.16; }
    if (top === 'broken') {
      // Two raking halves parted round an urn.
      const ph = Wt * 0.22, gap = Wt * 0.32, clip = new THREE.Group();
      for (const s of [-1, 1]) {
        const sh = new THREE.Shape(), x0 = s * gap / 2, x1 = s * Wt / 2;
        sh.moveTo(x0, 0); sh.lineTo(x1, 0); sh.lineTo(x0, ph * (1 - gap / Wt)); sh.closePath();
        clip.add(mesh(new THREE.ExtrudeGeometry(sh, { depth: dt - 0.1, bevelEnabled: false }), trim));
      }
      g.add(at(clip, 0, yTop, 0));
      const u = Math.min(0.5, Wt * 0.09);
      g.add(cyl(u * 0.6, u * 0.8, u * 0.4, trim, 0, yTop, dt / 2, 12), cyl(u * 0.5, u, u * 1.2, trim, 0, yTop + u * 0.4, dt / 2, 12));
      g.add(cyl(0, u * 0.35, u * 0.9, trim, 0, yTop + u * 1.6, dt / 2, 10));
      yTop += ph;
    }
  }
  if (sill) g.add(box(W + 0.24, 0.16, depth + 0.18, trim, 0, -0.16, (depth + 0.18) / 2));
  if (stepsDown > 0) g.add(at(steps(W, stepsDown, Math.max(2, Math.ceil(stepsDown / 0.18)), trim, 0.32), 0, -stepsDown, depth));
  mergeByMaterial(g);
  g.userData = { outerW: Wt, outerH: yTop, depth: dt };
  return g;
}

// An open porch w wide and d deep in front of a wall (back at z = 0), its columns h tall standing
// on a low floor: an entablature with a dentilled cornice spanning back to the wall, and on top a
// pediment ('pediment'), a balustrade ('balustrade') or nothing more ('cornice'). door: a door to set
// in the wall at the back (a classicalDoor or any part built the same way); stepsDown: steps down
// to the ground in front. cols columns along the front, in pairs if `paired`, with pilasters
// answering the end ones against the wall; order: 'corinthian' for fluted columns with acanthus
// capitals.
export function porch(w, d, h, {
  m, trim = m, colM = trim, cols = 4, paired = false, r = Math.min(0.9, Math.max(0.25, w / (cols * 5))),
  top = 'cornice', ent = Math.max(0.8, h * 0.15), door = null, stepsDown = 0, side = true, order = 'plain',
} = {}) {
  const g = new THREE.Group(), fl = 0.25, hc = h - fl;
  g.add(box(w, fl, d, trim, 0, 0, d / 2));
  const xa = -w / 2 + r * 1.5, xb = w / 2 - r * 1.5, xs = [];
  if (paired) {
    const np = Math.max(1, Math.round(cols / 2));
    for (let p = 0; p < np; p++) { const cx = np === 1 ? 0 : xa + r * 1.4 + (p * (xb - xa - r * 2.8)) / (np - 1); xs.push(cx - r * 1.4, cx + r * 1.4); }
  } else {
    for (let k = 0; k < cols; k++) xs.push(cols === 1 ? 0 : xa + (k * (xb - xa)) / (cols - 1));
  }
  const zc = d - r * 1.5;
  for (const x of xs) g.add(at(column(r, hc, colM, { order }), x, fl, zc));
  // Columns down the open sides, when the porch is deep enough to need them.
  if (side && zc > r * 6) {
    const n = Math.floor(zc / (r * 5));
    for (let k = 1; k <= n; k++) for (const x of [xs[0], xs[xs.length - 1]]) g.add(at(column(r, hc, colM, { order }), x, fl, zc - (k * zc) / (n + 1)));
  }
  for (const x of [xs[0], xs[xs.length - 1]]) g.add(box(r * 2.2, hc, 0.25, colM, x, fl, 0.125));
  // Architrave, a frieze set back, and the cornice with dentils under its front edge.
  const a = ent * 0.4, f = ent * 0.32, c = ent * 0.28;
  g.add(box(w, a, d, trim, 0, h, d / 2), box(w - 0.12, f, d - 0.12, m, 0, h + a, (d - 0.12) / 2));
  g.add(box(w + 0.6, c, d + 0.35, trim, 0, h + a + f, (d + 0.35) / 2));
  const dw = Math.min(0.22, f * 0.4), n = Math.floor((w + 0.4) / (dw * 2));
  for (let k = 0; k < n; k++) g.add(box(dw, dw, dw, trim, -(w + 0.4) / 2 + (k + 0.5) * ((w + 0.4) / n), h + a + f - dw, d + 0.35 - dw / 2 - 0.02));
  let yTop = h + ent;
  if (top === 'pediment') { const ph = (w + 0.6) * 0.2; g.add(at(pediment(w + 0.6, ph, Math.min(2, d), m, trim), 0, yTop + Math.min(0.5, ph * 0.18), d + 0.35 - Math.min(2, d))); yTop += ph; }
  if (top === 'balustrade') {
    const bh = Math.min(1.2, h * 0.14);
    g.add(at(balustrade(w + 0.2, bh, trim), 0, yTop, d + 0.1));
    for (const s of [-1, 1]) { const b = balustrade(d, bh, trim); b.rotation.y = Math.PI / 2; g.add(at(b, s * (w / 2 + 0.05), yTop, d / 2 + 0.05)); }
    yTop += bh;
  }
  if (door) g.add(at(door, 0, fl, 0));
  if (stepsDown > 0) g.add(at(steps(Math.min(w, xs[xs.length - 1] - xs[0]), stepsDown + fl, Math.max(2, Math.ceil(stepsDown / 0.18)), trim, 0.34), 0, -stepsDown, d));
  mergeByMaterial(g);
  g.userData = { top: yTop };
  return g;
}

/* ---------- Gothic Revival ---------- */

// A Gothic portal w wide and h to its crown: `orders` pointed arches stepping out and forward, each
// with a roll moulding and, in each re-entrant angle, a colonnette with its capital; a studded door
// under a lintel, and a tympanum carved with a quatrefoil roundel; above, a gable with crockets
// and a finial, between two pinnacles.
export function gothicDoor(w, h, {
  m, trim = m, orders = 3, step = Math.max(0.25, w * 0.12), depth = Math.max(0.6, w * 0.3), gable = true,
  pinnacles = true, leafM = undefined, stepsDown = 0,
} = {}) {
  const g = new THREE.Group(), frame = step * 1.4;
  const wk = (k) => w + 2 * k * step, hk = (k) => h + k * step * 1.25, dk = (k) => (depth * (k + 1)) / orders;
  const Wout = wk(orders - 1) + 2 * frame, Hout = hk(orders - 1) + frame, rs = step * 0.3;
  for (let k = 0; k < orders; k++) {
    const outer = k === orders - 1;
    g.add(cutSlab(outer ? Wout : wk(k + 1) + 0.04, outer ? Hout : hk(k + 1) + 0.03, [[0, 0, wk(k), hk(k), 'pointed']], dk(k), m));
    g.add(at(headRing(wk(k), hk(k), 'pointed', step * 0.3, 0.05, trim), 0, 0, dk(k)));
    if (k > 0) {
      const sp = hk(k) - 1.4 * wk(k) / 2;
      for (const s of [-1, 1]) {
        const x = s * (wk(k) / 2 - rs * 1.1), z = dk(k - 1) + rs * 1.05;
        g.add(cyl(rs, rs, sp, trim, x, 0, z, 10), cyl(rs * 1.6, rs, rs * 1.6, trim, x, sp - rs * 1.6, z, 10), box(rs * 3, rs * 0.8, rs * 3, trim, x, 0, z));
      }
    }
  }
  // The door up to the springing, its lintel and the carved tympanum above.
  const s0 = h - 1.4 * w / 2, lt = Math.min(0.3, s0 * 0.06), d0 = dk(0);
  g.add(at(interior(w * 0.998, s0 - lt, 0.13, 0.09), 0, 0, 0.012));
  g.add(box(w, lt, d0, trim, 0, s0 - lt, d0 / 2));
  g.add(at(headSlab(w * 0.999, h * 0.999, 'pointed', trim, 0.06, s0), 0, 0, 0.012));
  const Rq = Math.min(w * 0.22, (h - s0) * 0.3), cy = s0 + (h - s0) * 0.42, tg = Math.max(0.035, Rq * 0.1);
  g.add(at(mesh(new THREE.TorusGeometry(Rq, tg, 6, 28), trim), 0, cy, 0.075));
  for (let k = 0; k < 4; k++) {
    const a = (k / 4) * Math.PI * 2 + Math.PI / 4;
    g.add(at(mesh(new THREE.TorusGeometry(Rq * 0.42, tg * 0.8, 6, 18), trim), Math.cos(a) * Rq * 0.48, cy + Math.sin(a) * Rq * 0.48, 0.08));
  }
  const open = Math.asin(Math.min(0.9, Math.max(0.2, (d0 - 0.05) / (w / 2))));
  g.add(at(doorLeaves(w * 0.996, (s0 - lt - 0.1) * 0.99, { open, studs: true, ...(leafM ? { m: leafM } : {}) }), 0, 0.1, 0.02));
  g.add(box(w, 0.1, d0, trim, 0, 0, d0 / 2));
  let outerH = Hout, outerW = Wout;
  if (gable) {
    const gh = Wout * 0.5, gd = Math.min(0.4, depth * 0.5), sh = new THREE.Shape();
    sh.moveTo(-Wout / 2, 0); sh.lineTo(Wout / 2, 0); sh.lineTo(0, gh); sh.closePath();
    g.add(at(mesh(new THREE.ExtrudeGeometry(sh, { depth: gd, bevelEnabled: false }), m), 0, Hout, depth - gd));
    const len = Math.hypot(Wout / 2, gh), a = Math.atan2(gh, Wout / 2), cw = Math.min(0.3, step * 0.8);
    const cg = new THREE.ConeGeometry(cw * 0.45, cw * 1.3, 6);
    for (const s of [-1, 1]) {
      const rk = box(len + cw, cw, gd + 0.12, trim, 0, -cw / 2, 0);
      rk.position.set(s * Wout / 4, Hout + gh / 2 + cw * 0.25, depth - gd + (gd + 0.12) / 2);
      rk.rotation.z = -s * a;
      g.add(rk);
      // Crockets: little leaves curling up along the rake.
      for (let t = 0.2; t < 0.95; t += 0.18) {
        const c = mesh(cg, trim, s * (Wout / 2) * (1 - t), Hout + gh * t + cw * 0.9, depth - gd / 2);
        c.rotation.z = -s * 0.5;
        g.add(c);
      }
    }
    g.add(cyl(0, cw * 0.7, cw * 3.2, trim, 0, Hout + gh + cw * 0.2, depth - gd / 2, 8));
    for (const s of [-1, 1]) g.add(box(cw * 0.5, cw * 1.6, cw * 0.5, trim, s * cw * 0.5, Hout + gh + cw * 1.6, depth - gd / 2).rotateZ(s * 0.9));
    outerH = Hout + gh + cw * 3.4;
  }
  if (pinnacles) {
    const pw = Math.min(depth, frame * 1.1), ph = Hout + Wout * 0.3, cone = new THREE.ConeGeometry(pw * 0.72, pw * 2.6, 4).rotateY(Math.PI / 4);
    for (const s of [-1, 1]) {
      const x = s * (Wout / 2 + pw / 2);
      g.add(box(pw, ph, pw, m, x, 0, depth - pw / 2), box(pw + 0.12, 0.18, pw + 0.12, trim, x, ph, depth - pw / 2));
      g.add(mesh(cone, trim, x, ph + 0.18 + pw * 1.3, depth - pw / 2), cyl(0, pw * 0.12, pw * 0.8, trim, x, ph + 0.18 + pw * 2.6, depth - pw / 2, 6));
    }
    outerW = Wout + 2 * pw;
    outerH = Math.max(outerH, ph + pw * 3.6);
  }
  if (stepsDown > 0) g.add(at(steps(Wout, stepsDown, Math.max(2, Math.ceil(stepsDown / 0.18)), trim, 0.34), 0, -stepsDown, depth));
  mergeByMaterial(g);
  g.userData = { outerW, outerH, depth };
  return g;
}

// A pointed Gothic window w × h in a stone surround `depth` proud: glazing, a mullion dividing it
// into two lights with their own pointed heads, and a roundel in the head above them.
export function gothicWindow(w, h, { m, trim = m, depth = Math.max(0.2, w * 0.14), frame = w * 0.17, sill = true } = {}) {
  const g = new THREE.Group(), r = w / 2, sp = h - 1.4 * r, W = w + 2 * frame, H = h + frame * 0.9, band = Math.min(0.2, w * 0.07);
  g.add(cutSlab(W, H, [[0, 0, w, h, 'pointed']], depth, m));
  g.add(at(headRing(w, h, 'pointed', band, 0.05, trim), 0, 0, depth));
  g.add(at(headSlab(w * 0.999, h * 0.999, 'pointed', GLASS, 0.03), 0, 0, 0.012));
  const mw = Math.max(0.06, w * 0.06), wl = (w - mw) / 2, hl = sp + 1.4 * wl / 2;
  g.add(box(mw, sp, 0.1, trim, 0, 0, 0.06));
  for (const s of [-1, 1]) g.add(at(headRing(wl * 0.96, hl, 'pointed', mw * 0.42, 0.08, trim), s * (wl + mw) / 2, 0, 0.04));
  const R = Math.min(wl * 0.42, (h - hl) * 0.44);
  if (R > 0.08) g.add(at(mesh(new THREE.TorusGeometry(R, Math.max(0.03, mw * 0.4), 6, 20), trim), 0, hl + (h - hl) * 0.45, 0.07));
  if (sill) g.add(box(W + 0.16, 0.14, depth + 0.14, trim, 0, -0.14, (depth + 0.14) / 2));
  return mergeByMaterial(g);
}

// A round window R in radius in a moulded frame `depth` proud, glazed, with a cross of bars and a
// ring of foils round its rim. Its centre is at y = 0.
export function oculus(R, { m, trim = m, depth = Math.max(0.2, R * 0.25), frame = R * 0.3 } = {}) {
  const g = new THREE.Group(), sh = new THREE.Shape(), hole = new THREE.Path();
  sh.absarc(0, 0, R + frame, 0, Math.PI * 2, false);
  hole.absarc(0, 0, R, 0, Math.PI * 2, true);
  sh.holes.push(hole);
  g.add(mesh(new THREE.ExtrudeGeometry(sh, { depth, bevelEnabled: false, curveSegments: 24 }), m));
  g.add(at(mesh(new THREE.TorusGeometry(R + frame * 0.15, Math.min(0.12, frame * 0.25), 6, 32), trim), 0, 0, depth));
  g.add(at(mesh(new THREE.CircleGeometry(R * 1.001, 32), GLASS), 0, 0, 0.012));
  const b = Math.max(0.05, R * 0.06);
  g.add(box(b, R * 2, 0.06, trim, 0, -R, 0.05), box(R * 2, b, 0.06, trim, 0, -b / 2, 0.05));
  g.add(at(mesh(new THREE.TorusGeometry(R * 0.38, b * 0.6, 6, 24), trim), 0, 0, 0.06));
  return mergeByMaterial(g);
}

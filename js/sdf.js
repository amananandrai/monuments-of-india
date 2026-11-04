import * as THREE from 'three';
import { attachSurface } from './surface.js';

// Sculpting with signed distance fields, for statues and animals. A figure is a function giving the
// distance from any point to its surface (negative inside), built from ellipsoids, tapered capsules
// and chains of them, joined with a smooth minimum so that each part grows out of the next, as in a
// carving, instead of meeting it in a crease. The field is turned into a mesh in the browser by
// surface nets, once per figure, and the mesh is shared by every copy. Crevices are darkened in a
// vertex colour baked from the field, so the folds, armpits and the gaps between legs hold shadow
// the way weathered stone and patinated bronze do. See docs/realistic-statues-research.md.

const len = (x, y, z) => Math.sqrt(x * x + y * y + z * z);

/* ---------- combining ---------- */

// Polynomial smooth minimum and maximum: k is the width of the fillet between the two.
export const smin = (a, b, k) => { if (k <= 0) return Math.min(a, b); const h = Math.max(k - Math.abs(a - b), 0) / k; return Math.min(a, b) - h * h * k * 0.25; };
export const smax = (a, b, k) => -smin(-a, -b, k);

// A union of [field, k] terms, each blended into what came before with its own fillet k (0 for a
// hard join). List the big masses first and the small parts after them.
export function blend(terms) {
  return (x, y, z) => { let d = Infinity; for (const [f, k] of terms) d = smin(d, f(x, y, z), k); return d; };
}
// Carve g out of f, with a fillet k.
export const carve = (f, g, k = 0) => (x, y, z) => smax(f(x, y, z), -g(x, y, z), k);
// The same part on both sides of x = 0 (define it on the +x side).
export const mirrorX = (f) => (x, y, z) => f(Math.abs(x), y, z);
// A flat underside at y = y0, so a figure sits on its plinth.
export const flatBase = (f, y0 = 0, k = 0.03) => (x, y, z) => smax(f(x, y, z), y0 - y, k);
// A part turned by angle about the y axis (or x, or z) round the point c.
export function turn(f, axis, angle, c = [0, 0, 0]) {
  const cs = Math.cos(angle), sn = Math.sin(angle);
  return (x, y, z) => {
    let px = x - c[0], py = y - c[1], pz = z - c[2];
    if (axis === 'y') [px, pz] = [px * cs - pz * sn, px * sn + pz * cs];
    else if (axis === 'x') [py, pz] = [py * cs + pz * sn, -py * sn + pz * cs];
    else [px, py] = [px * cs + py * sn, -px * sn + py * cs];
    return f(px + c[0], py + c[1], pz + c[2]);
  };
}

/* ---------- primitives ---------- */

export const sphere = (c, r) => (x, y, z) => len(x - c[0], y - c[1], z - c[2]) - r;
// An ellipsoid with radii r = [rx, ry, rz] (a close bound, not an exact distance).
export function ellipsoid(c, r) {
  return (x, y, z) => {
    const px = x - c[0], py = y - c[1], pz = z - c[2];
    const k0 = len(px / r[0], py / r[1], pz / r[2]), k1 = len(px / (r[0] * r[0]), py / (r[1] * r[1]), pz / (r[2] * r[2]));
    return k1 === 0 ? -Math.min(...r) : (k0 * (k0 - 1)) / k1;
  };
}
// A capsule from a (radius r1) to b (radius r2): limbs, necks, horns, trunks.
export function cone(a, b, r1, r2 = r1) {
  const bx = b[0] - a[0], by = b[1] - a[1], bz = b[2] - a[2], l2 = bx * bx + by * by + bz * bz || 1e-9;
  return (x, y, z) => {
    const px = x - a[0], py = y - a[1], pz = z - a[2];
    const h = Math.min(1, Math.max(0, (px * bx + py * by + pz * bz) / l2));
    return len(px - bx * h, py - by * h, pz - bz * h) - (r1 + (r2 - r1) * h);
  };
}
// A part that only needs working out near itself: further than `margin` outside the sphere (c, r)
// that holds it, the distance to that sphere stands in for it. That is never more than the true
// distance, so meshing stays safe, and points far from small parts skip them.
export function bounded(f, c, r, margin = 0.4) {
  return (x, y, z) => { const d = len(x - c[0], y - c[1], z - c[2]) - r; return d > margin ? d : f(x, y, z); };
}
// A chain of capsules through points [[x, y, z, r], ...], each joint blended with fillet k.
export function chain(pts, k = 0.05) {
  const segs = [], lo = [Infinity, Infinity, Infinity], hi = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i + 1 < pts.length; i++) segs.push(cone(pts[i], pts[i + 1], pts[i][3], pts[i + 1][3]));
  for (const p of pts) for (let a = 0; a < 3; a++) { lo[a] = Math.min(lo[a], p[a] - p[3]); hi[a] = Math.max(hi[a], p[a] + p[3]); }
  const c = lo.map((v, a) => (v + hi[a]) / 2), r = len(hi[0] - lo[0], hi[1] - lo[1], hi[2] - lo[2]) / 2;
  return bounded((x, y, z) => { let d = Infinity; for (const s of segs) d = smin(d, s(x, y, z), k); return d; }, c, r);
}
// A box with half-sizes b = [bx, by, bz], its edges rounded by r.
export function roundBox(c, b, r = 0) {
  return (x, y, z) => {
    const qx = Math.abs(x - c[0]) - b[0] + r, qy = Math.abs(y - c[1]) - b[1] + r, qz = Math.abs(z - c[2]) - b[2] + r;
    return len(Math.max(qx, 0), Math.max(qy, 0), Math.max(qz, 0)) + Math.min(Math.max(qx, qy, qz), 0) - r;
  };
}
// A ring of radius R and thickness r round the y axis through c (turn it for other axes).
export const torus = (c, R, r) => (x, y, z) => len(Math.hypot(x - c[0], z - c[2]) - R, y - c[1], 0) - r;

/* ---------- meshing ---------- */

// Surface nets over the box lo..hi with cells h wide. Space is first sampled every B cells, and
// only the blocks the surface can pass near are filled in at full resolution, so a figure costs
// about its surface area rather than its volume. Each vertex is pulled onto the surface by a
// Newton step and given the field's gradient as its normal, so the shading is smooth even where
// the grid is coarse.
export function surfaceNets(f, lo, hi, h) {
  const nx = Math.ceil((hi[0] - lo[0]) / h) + 1, ny = Math.ceil((hi[1] - lo[1]) / h) + 1, nz = Math.ceil((hi[2] - lo[2]) / h) + 1;
  const F = new Float32Array(nx * ny * nz), I = (i, j, k) => i + nx * (j + ny * k);
  const B = 4, bx = Math.ceil((nx - 1) / B) + 1, by = Math.ceil((ny - 1) / B) + 1, bz = Math.ceil((nz - 1) / B) + 1;
  const C = new Float32Array(bx * by * bz), CI = (i, j, k) => i + bx * (j + by * k);
  for (let k = 0; k < bz; k++) for (let j = 0; j < by; j++) for (let i = 0; i < bx; i++) C[CI(i, j, k)] = f(lo[0] + i * B * h, lo[1] + j * B * h, lo[2] + k * B * h);
  // A block whose eight corners all lie further from the surface than its diagonal (with a margin,
  // since blended fields are only roughly distances) cannot contain it.
  const far = B * h * Math.sqrt(3) * 1.5;
  for (let K = 0; K < bz - 1; K++) for (let J = 0; J < by - 1; J++) for (let Ii = 0; Ii < bx - 1; Ii++) {
    let near = false, s = 0;
    for (let c = 0; c < 8; c++) { const v = C[CI(Ii + (c & 1), J + ((c >> 1) & 1), K + ((c >> 2) & 1))]; if (Math.abs(v) < far) near = true; s += v; }
    const i0 = Ii * B, j0 = J * B, k0 = K * B, i1 = Math.min(nx - 1, i0 + B), j1 = Math.min(ny - 1, j0 + B), k1 = Math.min(nz - 1, k0 + B);
    for (let k = k0; k <= k1; k++) for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
      const id = I(i, j, k);
      if (near) F[id] = f(lo[0] + i * h, lo[1] + j * h, lo[2] + k * h);
      else if (F[id] === 0) F[id] = s > 0 ? far : -far;
    }
  }
  const cx = nx - 1, cy = ny - 1, CC = (i, j, k) => i + cx * (j + cy * k), vid = new Int32Array(cx * cy * (nz - 1)).fill(-1);
  const pos = [], corner = [[0, 0, 0], [1, 0, 0], [0, 1, 0], [1, 1, 0], [0, 0, 1], [1, 0, 1], [0, 1, 1], [1, 1, 1]];
  const edges = [[0, 1], [2, 3], [4, 5], [6, 7], [0, 2], [1, 3], [4, 6], [5, 7], [0, 4], [1, 5], [2, 6], [3, 7]];
  const v = new Float32Array(8);
  for (let k = 0; k < nz - 1; k++) for (let j = 0; j < cy; j++) for (let i = 0; i < cx; i++) {
    let mask = 0;
    for (let c = 0; c < 8; c++) { v[c] = F[I(i + corner[c][0], j + corner[c][1], k + corner[c][2])]; if (v[c] < 0) mask |= 1 << c; }
    if (mask === 0 || mask === 255) continue;
    let sx = 0, sy = 0, sz = 0, n = 0;
    for (const [a, b] of edges) {
      if ((v[a] < 0) === (v[b] < 0)) continue;
      const t = v[a] / (v[a] - v[b]), A = corner[a], Bc = corner[b];
      sx += A[0] + (Bc[0] - A[0]) * t; sy += A[1] + (Bc[1] - A[1]) * t; sz += A[2] + (Bc[2] - A[2]) * t; n++;
    }
    vid[CC(i, j, k)] = pos.length / 3;
    pos.push(lo[0] + (i + sx / n) * h, lo[1] + (j + sy / n) * h, lo[2] + (k + sz / n) * h);
  }
  const idx = [], quad = (a, b, c, d, flip) => { if (a < 0 || b < 0 || c < 0 || d < 0) return; flip ? idx.push(a, d, c, a, c, b) : idx.push(a, b, c, a, c, d); };
  for (let k = 1; k < nz - 1; k++) for (let j = 1; j < ny - 1; j++) for (let i = 0; i < cx; i++) {
    const s0 = F[I(i, j, k)] < 0, s1 = F[I(i + 1, j, k)] < 0;
    if (s0 !== s1) quad(vid[CC(i, j - 1, k - 1)], vid[CC(i, j, k - 1)], vid[CC(i, j, k)], vid[CC(i, j - 1, k)], s1);
  }
  for (let k = 1; k < nz - 1; k++) for (let j = 0; j < cy; j++) for (let i = 1; i < nx - 1; i++) {
    const s0 = F[I(i, j, k)] < 0, s1 = F[I(i, j + 1, k)] < 0;
    if (s0 !== s1) quad(vid[CC(i - 1, j, k - 1)], vid[CC(i - 1, j, k)], vid[CC(i, j, k)], vid[CC(i, j, k - 1)], s1);
  }
  for (let k = 0; k < nz - 1; k++) for (let j = 1; j < ny - 1; j++) for (let i = 1; i < nx - 1; i++) {
    const s0 = F[I(i, j, k)] < 0, s1 = F[I(i, j, k + 1)] < 0;
    if (s0 !== s1) quad(vid[CC(i - 1, j - 1, k)], vid[CC(i, j - 1, k)], vid[CC(i, j, k)], vid[CC(i - 1, j, k)], s1);
  }
  const nrm = new Float32Array(pos.length), e = h * 0.25;
  for (let p = 0; p < pos.length; p += 3) {
    const x = pos[p], y = pos[p + 1], z = pos[p + 2];
    let gx = f(x + e, y, z) - f(x - e, y, z), gy = f(x, y + e, z) - f(x, y - e, z), gz = f(x, y, z + e) - f(x, y, z - e);
    const gl = len(gx, gy, gz) || 1, d = f(x, y, z);
    gx /= gl; gy /= gl; gz /= gl;
    pos[p] -= gx * d; pos[p + 1] -= gy * d; pos[p + 2] -= gz * d;
    nrm[p] = gx; nrm[p + 1] = gy; nrm[p + 2] = gz;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute('normal', new THREE.Float32BufferAttribute(nrm, 3));
  geo.setIndex(idx);
  geo.computeBoundingSphere();
  return geo;
}

// Darken the crevices: at each vertex, step out along the normal and see how soon the field comes
// back towards the surface (ambient occlusion from a distance field). reach is how far to look;
// the vertex colour runs from `deep` in the deepest folds to white in the open.
export function bakeCavities(geo, f, reach, deep = [0.45, 0.42, 0.4]) {
  const p = geo.attributes.position, n = geo.attributes.normal, col = new Float32Array(p.count * 3);
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i), nx = n.getX(i), ny = n.getY(i), nz = n.getZ(i);
    let occ = 0, w = 1;
    for (let k = 1; k <= 5; k++) {
      const t = (reach * k) / 5;
      occ += w * Math.max(0, t - f(x + nx * t, y + ny * t, z + nz * t)) / reach;
      w *= 0.6;
    }
    const a = Math.min(1, Math.max(0, 1 - occ * 1.6)), ao = a * a * (3 - 2 * a);
    col.set([deep[0] + (1 - deep[0]) * ao, deep[1] + (1 - deep[1]) * ao, deep[2] + (1 - deep[2]) * ao], i * 3);
  }
  geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  return geo;
}

// Mesh a figure once and keep it: build() returns { f, lo, hi } (the field and its bounds); h is
// the cell size; reach and deep set the cavity shading (reach 0 for none).
const cache = new Map();
export function sculpt(key, build, { h, reach = h * 6, deep } = {}) {
  if (!cache.has(key)) {
    const { f, lo, hi } = build();
    const geo = surfaceNets(f, lo, hi, h);
    if (reach > 0) bakeCavities(geo, f, reach, deep);
    cache.set(key, geo);
  }
  return cache.get(key);
}

// The material a figure is carved or cast in: the given one, using the baked cavity colours, and
// for stone the 'carved' surface (fine grain, no block joints, and no wall photo).
const statueMats = new Map();
export function statueMaterial(m) {
  if (!statueMats.has(m)) {
    const c = attachSurface(m.clone());
    c.vertexColors = true;
    delete c.userData.photoKey;
    c.userData.surface = m.metalness >= 0.35 || m.userData.surface === 'none' ? 'none' : 'carved';
    // Dark stone in sculpture is basalt or granite rubbed with oil: glossy, so its form shows in
    // the sky it reflects rather than vanishing into black.
    const hsl = c.color.getHSL({});
    if (hsl.l < 0.25 && m.metalness < 0.35) { c.color.offsetHSL(0, 0, 0.03); c.roughness = Math.min(c.roughness, 0.42); c.envMapIntensity = 0.8; }
    statueMats.set(m, c);
  }
  return statueMats.get(m);
}

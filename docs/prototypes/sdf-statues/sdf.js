// Research prototype for docs/realistic-statues-research.md, not used by the site yet.
import * as THREE from 'three';
// Signed-distance sculpting: primitives, smooth union, and a surface-nets mesher.
const len = (x, y, z) => Math.sqrt(x * x + y * y + z * z);
export const smin = (a, b, k) => { const h = Math.max(k - Math.abs(a - b), 0) / k; return Math.min(a, b) - h * h * k * 0.25; };
export const smax = (a, b, k) => -smin(-a, -b, k);
export function ellipsoid(c, r) {
  return (x, y, z) => {
    const px = x - c[0], py = y - c[1], pz = z - c[2];
    const k0 = len(px / r[0], py / r[1], pz / r[2]), k1 = len(px / (r[0] * r[0]), py / (r[1] * r[1]), pz / (r[2] * r[2]));
    return k1 === 0 ? -Math.min(...r) : (k0 * (k0 - 1)) / k1;
  };
}
// A capsule from a (radius r1) to b (radius r2).
export function cone(a, b, r1, r2 = r1) {
  const bx = b[0] - a[0], by = b[1] - a[1], bz = b[2] - a[2], l2 = bx * bx + by * by + bz * bz;
  return (x, y, z) => {
    const px = x - a[0], py = y - a[1], pz = z - a[2];
    const h = Math.min(1, Math.max(0, (px * bx + py * by + pz * bz) / l2));
    return len(px - bx * h, py - by * h, pz - bz * h) - (r1 + (r2 - r1) * h);
  };
}
// A chain of capsules through points [[x,y,z,r], ...], smoothly joined.
export function chain(pts, k = 0.05) {
  const segs = [];
  for (let i = 0; i + 1 < pts.length; i++) segs.push(cone(pts[i], pts[i + 1], pts[i][3], pts[i + 1][3]));
  return (x, y, z) => { let d = Infinity; for (const s of segs) d = smin(d, s(x, y, z), k); return d; };
}
// Union of [fn, k] terms: each term blends into what came before with its own radius.
export function blend(terms) {
  return (x, y, z) => { let d = Infinity; for (const [f, k] of terms) d = k ? smin(d, f(x, y, z), k) : Math.min(d, f(x, y, z)); return d; };
}
export const mirrorX = (f) => (x, y, z) => f(Math.abs(x), y, z);

// Surface nets over the box lo..hi with cell size h. Returns an indexed BufferGeometry whose
// vertices are pulled onto the surface and whose normals come from the field's gradient.
export function surfaceNets(f, lo, hi, h) {
  const nx = Math.ceil((hi[0] - lo[0]) / h) + 1, ny = Math.ceil((hi[1] - lo[1]) / h) + 1, nz = Math.ceil((hi[2] - lo[2]) / h) + 1;
  const F = new Float32Array(nx * ny * nz), I = (i, j, k) => i + nx * (j + ny * k);
  for (let k = 0; k < nz; k++) for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) F[I(i, j, k)] = f(lo[0] + i * h, lo[1] + j * h, lo[2] + k * h);
  const cx = nx - 1, cy = ny - 1, C = (i, j, k) => i + cx * (j + cy * k), vid = new Int32Array(cx * cy * (nz - 1)).fill(-1);
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
      const t = v[a] / (v[a] - v[b]), A = corner[a], B = corner[b];
      sx += A[0] + (B[0] - A[0]) * t; sy += A[1] + (B[1] - A[1]) * t; sz += A[2] + (B[2] - A[2]) * t; n++;
    }
    vid[C(i, j, k)] = pos.length / 3;
    pos.push(lo[0] + (i + sx / n) * h, lo[1] + (j + sy / n) * h, lo[2] + (k + sz / n) * h);
  }
  const idx = [], quad = (a, b, c, d, flip) => { if (a < 0 || b < 0 || c < 0 || d < 0) return; flip ? idx.push(a, d, c, a, c, b) : idx.push(a, b, c, a, c, d); };
  for (let k = 1; k < nz - 1; k++) for (let j = 1; j < ny - 1; j++) for (let i = 0; i < cx; i++) {
    const s0 = F[I(i, j, k)] < 0, s1 = F[I(i + 1, j, k)] < 0;
    if (s0 !== s1) quad(vid[C(i, j - 1, k - 1)], vid[C(i, j, k - 1)], vid[C(i, j, k)], vid[C(i, j - 1, k)], s1);
  }
  for (let k = 1; k < nz - 1; k++) for (let j = 0; j < cy; j++) for (let i = 1; i < nx - 1; i++) {
    const s0 = F[I(i, j, k)] < 0, s1 = F[I(i, j + 1, k)] < 0;
    if (s0 !== s1) quad(vid[C(i - 1, j, k - 1)], vid[C(i - 1, j, k)], vid[C(i, j, k)], vid[C(i, j, k - 1)], s1);
  }
  for (let k = 0; k < nz - 1; k++) for (let j = 1; j < ny - 1; j++) for (let i = 1; i < nx - 1; i++) {
    const s0 = F[I(i, j, k)] < 0, s1 = F[I(i, j, k + 1)] < 0;
    if (s0 !== s1) quad(vid[C(i - 1, j - 1, k)], vid[C(i, j - 1, k)], vid[C(i, j, k)], vid[C(i - 1, j, k)], s1);
  }
  // One Newton step onto the surface, then normals from the gradient.
  const nrm = new Float32Array(pos.length), e = h * 0.25;
  for (let p = 0; p < pos.length; p += 3) {
    const [x, y, z] = [pos[p], pos[p + 1], pos[p + 2]];
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
  return geo;
}

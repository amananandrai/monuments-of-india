import * as THREE from 'three';
import { M, mat, mesh, box, cyl, at, onFace, doubleSided, surface } from '../helpers.js';
import { arcadeSkin, cellRow } from '../parts/mughal.js';
import { addDetails } from '../details/rang-ghar.js';

// Rang Ghar, the Ahom kings' pavilion for watching the games on the Rupohi Pathar: thin baked
// brick laid in a mortar of rice and eggs, washed pinkish red.
export const BRICK = surface(mat('#b8604f', 0.9), 'terracotta');
export const BRICK_DARK = surface(mat('#9a4c40', 0.92), 'terracotta');
export const TRIM = mat('#e2cdb6', 0.85);
export const ROOF = mat('#a3594b', 0.9);

// The building's measures, shared with js/details/rang-ghar.js. Its long axis runs along x.
// Ground storey from P to P + H1 (L × W), a cornice C high, the upper storey (L2 × W2) from Y2 to
// its level wall head at TOP; the roof's eave is at EAVE in the middle of each long side and
// droops by DROOP to the ends, its ridge RISE above the eave.
export const R = { L: 27, W: 11, P: 0.4, H1: 3.2, C: 0.3, L2: 26.4, W2: 10.4, Y2: 3.9, TOP: 6.3, EAVE: 7.1, DROOP: 0.8, RISE: 2.2, OVER: 0.55, SKIN: 0.6 };

// The roof's height at (u, v): u along its length, v across it, both 0 to 1. An upturned long
// boat: a curved vault whose ridge and eaves sink towards both ends.
export function roofY(u, v) {
  const e = (2 * u - 1) ** 2;
  return R.EAVE + R.RISE * (1 - Math.abs(2 * v - 1) ** 1.8) * (1 - 0.2 * e) - R.DROOP * e;
}
export const roofX = (u) => (u - 0.5) * (R.L2 + 2 * R.OVER), roofZ = (v) => (v - 0.5) * (R.W2 + 2 * R.OVER);
export const roofU = (x) => x / (R.L2 + 2 * R.OVER) + 0.5, roofV = (z) => z / (R.W2 + 2 * R.OVER) + 0.5;

// A shell th thick whose top follows P(u, v): top, underside and the rim round its edge.
function shell(nu, nv, P, th, m) {
  const pos = [], idx = [], N = (nu + 1) * (nv + 1), id = (s, i, j) => s * N + j * (nu + 1) + i;
  for (const s of [0, 1]) for (let j = 0; j <= nv; j++) for (let i = 0; i <= nu; i++) { const [x, y, z] = P(i / nu, j / nv); pos.push(x, y - s * th, z); }
  for (let j = 0; j < nv; j++) for (let i = 0; i < nu; i++) {
    idx.push(id(0, i, j), id(0, i, j + 1), id(0, i + 1, j), id(0, i + 1, j), id(0, i, j + 1), id(0, i + 1, j + 1));
    idx.push(id(1, i, j), id(1, i + 1, j), id(1, i, j + 1), id(1, i + 1, j), id(1, i + 1, j + 1), id(1, i, j + 1));
  }
  const rim = (list) => { for (let k = 0; k < list.length - 1; k++) { const p = list[k], q = list[k + 1]; idx.push(id(0, ...p), id(1, ...p), id(0, ...q), id(0, ...q), id(1, ...p), id(1, ...q)); } };
  rim(Array.from({ length: nu + 1 }, (_, i) => [i, 0]));
  rim(Array.from({ length: nu + 1 }, (_, i) => [nu - i, nv]));
  rim(Array.from({ length: nv + 1 }, (_, j) => [0, nv - j]));
  rim(Array.from({ length: nv + 1 }, (_, j) => [nu, j]));
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setIndex(idx);
  geo.computeVertexNormals();
  return mesh(geo, doubleSided(m));
}

// A wall face hung under a curve: from each of the top points [x, y, z] straight down to y0.
export function curtain(top, y0, m) {
  const pos = [], idx = [];
  top.forEach(([x, y, z], k) => {
    pos.push(x, y, z, x, y0, z);
    if (k) idx.push(2 * k - 2, 2 * k - 1, 2 * k, 2 * k, 2 * k - 1, 2 * k + 1);
  });
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setIndex(idx);
  geo.computeVertexNormals();
  return mesh(geo, doubleSided(m));
}

export function buildRangGhar() {
  const g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  const { L, W, P, H1, L2, W2, Y2, TOP, SKIN: d } = R;
  // The low plinth, and the two storeys: each a core with a face of arched cells set on every side.
  f.add(box(L + 1.6, P, W + 1.6, BRICK_DARK));
  f.add(box(L - 2 * d, H1, W - 2 * d, BRICK, 0, P, 0));
  f.add(box(L2 - 2 * d, TOP - Y2, W2 - 2 * d, BRICK, 0, Y2, 0));
  const storey = (len, wid, y, h, nLong, cell, endCells) => {
    for (const a of [0, Math.PI]) f.add(onFace(at(arcadeSkin(len, h, cellRow(nLong, (len - 1.6) / nLong, ...cell), d, BRICK, { trim: TRIM, fill: 'room' }), 0, y, 0), a, wid / 2 - d));
    for (const a of [Math.PI / 2, -Math.PI / 2]) f.add(onFace(at(arcadeSkin(wid - 2 * d, h, endCells, d, BRICK, { trim: TRIM, fill: 'room' }), 0, y, 0), a, len / 2 - d));
  };
  // Seven arched openings down each long side of both storeys; three at each end below (the
  // entrance in the middle), two windows either side of the porch's roof above.
  storey(L, W, P, H1, 7, [0, 1.9, 2.6], [[-3.2, 0.5, 1.3, 1.9], [0, 0, 2.2, 2.8], [3.2, 0.5, 1.3, 1.9]]);
  storey(L2, W2, Y2, TOP - Y2, 7, [0.35, 1.7, 1.9], [[-2.9, 0.35, 1.4, 1.8], [0, 0.35, 1.4, 1.8], [2.9, 0.35, 1.4, 1.8]]);
  // The walls carried up under the curve of the roof: along the long sides, and the gables at
  // the two ends.
  const n = 28, side = [], gable = [];
  for (let k = 0; k <= n; k++) {
    const u = roofU((k / n - 0.5) * L2), v = roofV((k / n - 0.5) * W2);
    side.push([(k / n - 0.5) * L2, roofY(u, roofV(W2 / 2)) - 0.05, W2 / 2]);
    gable.push([L2 / 2, roofY(roofU(L2 / 2), v) - 0.05, (k / n - 0.5) * W2]);
  }
  for (const s of [-1, 1]) {
    f.add(curtain(side.map(([x, y, z]) => [x, y, s * z]), TOP - 0.02, BRICK));
    f.add(curtain(gable.map(([x, y, z]) => [s * x, y, z]), TOP - 0.02, BRICK));
  }
  // The roof.
  f.add(shell(36, 16, (u, v) => [roofX(u), roofY(u, v), roofZ(v)], 0.16, ROOF));
  // The kiosk astride the ridge: a saddle carrying three small domed turrets, the middle one taller.
  const k = new THREE.Group(), yr = roofY(0.5, 0.5);
  k.add(box(3.4, 0.7, 1.5, BRICK, 0, yr - 0.45, 0), box(3.7, 0.12, 1.8, TRIM, 0, yr + 0.25, 0));
  for (const [x, r, h] of [[-1.15, 0.36, 0.3], [0, 0.48, 0.5], [1.15, 0.36, 0.3]]) {
    k.add(cyl(r, r * 1.05, h, BRICK, x, yr + 0.37, 0, 12));
    k.add(mesh(new THREE.SphereGeometry(r * 1.08, 14, 7, 0, Math.PI * 2, 0, Math.PI / 2), ROOF, x, yr + 0.37 + h, 0));
    k.add(cyl(0.03, 0.07, 0.3, TRIM, x, yr + 0.37 + h + r * 1.0, 0, 6));
  }
  f.add(k);
  f.add(box(L + 0.2, 0.02, W + 0.2, M.recess, 0, P + 0.001, 0));
  addDetails(f, g);
  return { group: g, focus: f, view: [0.7, 0.16, 1], zoom: 0.8 };
}

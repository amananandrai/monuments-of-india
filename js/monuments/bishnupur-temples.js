import * as THREE from 'three';
import { M, mat, mesh, box, at, onFace, FACES, flat, doubleSided, surface, photo } from '../helpers.js';
import { arcadeSkin, cellRow } from '../parts/mughal.js';
import { archSlab, mergeByMaterial } from '../parts/components.js';
import { addDetails } from '../details/bishnupur-temples.js';

// The Malla kings' temples at Bishnupur: no stone in the country, so laterite for the plinths and
// thin brick for everything else, faced with moulded terracotta plaques.
export const BRICK = surface(mat('#8a4a33', 0.93), 'terracotta');
export const BRICK_DARK = surface(mat('#733d29', 0.95), 'terracotta');
export const PLAQUES = surface(mat('#a8633f', 0.9), 'plaques');
export const LATERITE = photo(mat('#7a4b3a', 0.95), 'laterite');

// Where the three stand in the model, [x, z] (in the town they are a few hundred metres apart),
// and their measures, shared with js/details/bishnupur-temples.js.
export const SITES = { ras: [0, -20], shyam: [-23, 17], jor: [23, 17] };
export const SHYAM = { W: 11.4, P: 0.9, WALL: 3.9, CURVE: 0.8, SKIN: 0.5 };
export const JOR = { L: 11.8, D: 5.6, P: 0.8, WALL: 3.5, CURVE: 0.9, RISE: 2.3, SKIN: 0.5 };
export const RAS = { PL: 24.5, P: 1.5, W: 22.4, H: 3.4, SKIN: 0.9 };

function meshOf(pos, idx, m) {
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setIndex(idx);
  geo.computeVertexNormals();
  return mesh(geo, doubleSided(m));
}

// A char-chala: the four-sided curved roof of Bengal over a rectangle w × d, copied from bent
// bamboo and thatch. Each eave is highest in the middle of its side (y = 0) and droops by `droop`
// to the corners; the roof swells up to `rise` at its peak (or a ridge `ridge` long, along x).
// With `skirt`, a curved cornice hangs from each eave down to `skirt` below the corners, to stand
// on a level wall head.
export function chala(w, d, rise, m, { ridge = 0, droop = rise * 0.4, pow = 1.5, skirt = 0, ns = 12, nt = 6 } = {}) {
  const pos = [], idx = [];
  const side = (A, half, topHalf, depth, off) => {
    const put = (a, r, y) => pos.push(Math.sin(A) * r + Math.cos(A) * a, y, Math.cos(A) * r - Math.sin(A) * a);
    let b0 = pos.length / 3;
    for (let j = 0; j <= nt; j++) for (let i = 0; i <= ns; i++) {
      const s = (2 * i) / ns - 1, t = j / nt, q = 1 - t;
      put(s * (half * q + topHalf * t), off + depth * q, rise * (1 - q ** pow) - droop * s * s * q * q);
    }
    for (let j = 0; j < nt; j++) for (let i = 0; i < ns; i++) { const a = b0 + j * (ns + 1) + i, c = a + ns + 1; idx.push(a, a + 1, c, a + 1, c + 1, c); }
    if (!skirt) return;
    b0 = pos.length / 3;
    for (let i = 0; i <= ns; i++) {
      const s = (2 * i) / ns - 1;
      put(s * half, off + depth, -droop * s * s);
      put(s * half, off + depth, -droop - skirt);
      if (i) idx.push(b0 + 2 * i - 2, b0 + 2 * i - 1, b0 + 2 * i, b0 + 2 * i, b0 + 2 * i - 1, b0 + 2 * i + 1);
    }
  };
  side(0, w / 2, ridge / 2, d / 2, 0);
  side(Math.PI, w / 2, ridge / 2, d / 2, 0);
  side(Math.PI / 2, d / 2, 0, (w - ridge) / 2, ridge / 2);
  side(-Math.PI / 2, d / 2, 0, (w - ridge) / 2, ridge / 2);
  return meshOf(pos, idx, m);
}

// A do-chala: the two-sided hut roof, its ridge (along x) and both eaves bowed, sinking to the
// ends. The eaves' middles are at y = 0, the ridge's middle at `rise`; gables and a cornice hang
// from its edges down to `skirt` below the corners.
export function dochala(w, d, rise, m, { droop = rise * 0.4, skirt = 0, nu = 16, nv = 10 } = {}) {
  const pos = [], idx = [];
  const Y = (u, v) => { const e = (2 * u - 1) ** 2; return rise * (1 - Math.abs(2 * v - 1) ** 1.3) * (1 - 0.22 * e) - droop * e; };
  for (let j = 0; j <= nv; j++) for (let i = 0; i <= nu; i++) pos.push((i / nu - 0.5) * w, Y(i / nu, j / nv), (j / nv - 0.5) * d);
  for (let j = 0; j < nv; j++) for (let i = 0; i < nu; i++) { const a = j * (nu + 1) + i, c = a + nu + 1; idx.push(a, c, a + 1, a + 1, c, c + 1); }
  const hang = (n, P) => {
    const b0 = pos.length / 3;
    for (let k = 0; k <= n; k++) { const [x, y, z] = P(k / n); pos.push(x, y, z, x, -droop - skirt, z); if (k) idx.push(b0 + 2 * k - 2, b0 + 2 * k - 1, b0 + 2 * k, b0 + 2 * k, b0 + 2 * k - 1, b0 + 2 * k + 1); }
  };
  if (skirt) {
    for (const v of [0, 1]) hang(nu, (u) => [(u - 0.5) * w, Y(u, v), (v - 0.5) * d]);
    for (const u of [0, 1]) hang(nv, (v) => [(u - 0.5) * w, Y(u, v), (v - 0.5) * d]);
  }
  return meshOf(pos, idx, m);
}

// A prism of `sides` (4 or 8) faces, its faces r from the axis and square to x and z.
const prism = (sides, r0, r1, h, m, y = 0) => mesh(new THREE.CylinderGeometry(r1 / Math.cos(Math.PI / sides), r0 / Math.cos(Math.PI / sides), h, sides).rotateY(Math.PI / sides).translate(0, h / 2, 0), flat(m), 0, y, 0);

// A ratna, the small tower on a Bengal temple's roof: a square or octagonal cell with an arched
// opening in each face, under a ridged spire that curves in to a finial.
export function ratna(sides, r, bodyH, capH, m) {
  const g = new THREE.Group(), n = 7, pts = [];
  g.add(prism(sides, r, r, bodyH, m), prism(sides, r * 1.12, r * 1.12, 0.14, BRICK_DARK, bodyH));
  for (let k = 0; k < sides; k++) {
    const a = (k / sides) * Math.PI * 2, aw = sides === 4 ? r * 0.8 : r * 0.46;
    g.add(onFace(at(archSlab(aw, bodyH * 0.72, true, M.recess, 0.03), 0, bodyH * 0.1, 0), a, r));
  }
  // The spire: courses stepping in, each a ridge, on a curve.
  for (let k = 0; k <= n; k++) {
    const t = k / n, rr = r * 1.04 * (1 - 0.82 * t ** 1.5) / Math.cos(Math.PI / sides), y = bodyH + 0.14 + capH * 0.82 * t;
    pts.push(new THREE.Vector2(rr, y));
    if (k < n) pts.push(new THREE.Vector2(rr, y + (capH * 0.82) / n * 0.55), new THREE.Vector2(rr * 0.93, y + (capH * 0.82) / n * 0.6));
  }
  pts.push(new THREE.Vector2(0, bodyH + 0.14 + capH * 0.84));
  g.add(mesh(new THREE.LatheGeometry(pts, sides).rotateY(Math.PI / sides), flat(m)));
  const top = bodyH + 0.14 + capH * 0.82;
  g.add(mesh(new THREE.SphereGeometry(r * 0.2, 10, 8), BRICK_DARK, 0, top + r * 0.14, 0), mesh(new THREE.ConeGeometry(r * 0.07, capH * 0.3, 6), BRICK_DARK, 0, top + r * 0.3 + capH * 0.15, 0));
  return g;
}

// The Rasmancha (1600), where the town's images were shown at the Ras festival: a laterite plinth,
// an arcaded gallery round it under a row of hut roofs (a char-chala on each corner, four
// do-chalas between), and the inner galleries rising as a stepped pyramid.
function rasmancha() {
  const g = new THREE.Group(), { PL, P, W, H, SKIN: d } = RAS;
  g.add(box(PL, P, PL, LATERITE));
  g.add(box(W - 2 * d, H, W - 2 * d, BRICK, 0, P, 0));
  for (const a of FACES) g.add(onFace(at(arcadeSkin(a === 0 || a === Math.PI ? W : W - 2 * d, H, cellRow(9, 2.3, 0, 1.55, 2.5), d, BRICK, { trim: BRICK_DARK, fill: 'room' }), 0, P, 0), a, W / 2 - d));
  const y1 = P + H;
  g.add(box(W + 0.5, 0.25, W + 0.5, BRICK_DARK, 0, y1, 0));
  const huts = new THREE.Group(), yh = y1 + 0.25;
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) huts.add(at(chala(4.1, 4.1, 1.5, BRICK, { droop: 0.5, skirt: 0.3, ns: 8, nt: 4 }), sx * 9.2, yh + 0.8, sz * 9.2));
  for (const a of FACES) for (let k = 0; k < 4; k++) huts.add(onFace(at(dochala(3.45, 3.7, 1.25, BRICK, { droop: 0.45, skirt: 0.3, nu: 10, nv: 8 }), 0, yh + 0.75, 0), a, 9.4, (k - 1.5) * 3.6));
  g.add(mergeByMaterial(huts));
  // The second gallery's wall behind the huts, and the pyramid: seven steps, then smooth faces to
  // a small flat top.
  g.add(box(15.6, 1.9, 15.6, BRICK, 0, yh, 0));
  let y = yh + 1.9;
  for (let k = 0; k < 7; k++) { g.add(box(15.9 - k * 1.0, 0.36, 15.9 - k * 1.0, k % 2 ? BRICK : BRICK_DARK, 0, y, 0)); y += 0.36; }
  g.add(prism(4, 4.5, 1.3, 12.2 - y, BRICK, y), box(2.9, 0.3, 2.9, BRICK_DARK, 0, 12.2, 0));
  return g;
}

// Shyam Rai (1643), the pancha-ratna: a square temple under a curved cornice, a triple-arched
// porch in every side, an octagonal tower in the middle of the roof and a square one on each corner.
function shyamRai() {
  const g = new THREE.Group(), { W, P, WALL, CURVE, SKIN: d } = SHYAM;
  g.add(box(W + 1.8, P, W + 1.8, LATERITE));
  g.add(box(W - 2 * d, WALL, W - 2 * d, BRICK, 0, P, 0));
  for (const a of FACES) g.add(onFace(at(arcadeSkin(a === 0 || a === Math.PI ? W : W - 2 * d, WALL, cellRow(3, 2.15, 0, 1.45, 2.55), d, BRICK, { trim: BRICK_DARK, fill: 'room' }), 0, P, 0), a, W / 2 - d));
  const ye = P + WALL + CURVE;
  g.add(at(chala(W + 0.36, W + 0.36, 1.25, BRICK, { droop: CURVE, pow: 1.25, skirt: 0.02, ns: 16 }), 0, ye, 0));
  const t = new THREE.Group();
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) t.add(at(ratna(4, 0.95, 1.9, 1.9, BRICK), sx * 4.1, ye - 0.45, sz * 4.1));
  t.add(box(4.6, 0.7, 4.6, BRICK, 0, ye + 0.75, 0), at(ratna(8, 1.75, 2.5, 2.6, BRICK), 0, ye + 1.45, 0));
  g.add(mergeByMaterial(t));
  return g;
}

// Jor Bangla, the Kesta Rai temple (1655): two do-chala huts side by side, the porch in front
// and the shrine behind, joined, with a char-chala tower on the join.
function jorBangla() {
  const g = new THREE.Group(), { L, D, P, WALL, CURVE, RISE, SKIN: d } = JOR;
  g.add(box(L + 1.6, P, 2 * D + 1.8, LATERITE));
  for (const s of [-1, 1]) {
    g.add(box(L, WALL, D - (s > 0 ? d : 0), BRICK, 0, P, s * D / 2 - (s > 0 ? d / 2 : 0)));
    g.add(at(dochala(L + 0.3, D + 0.24, RISE, BRICK, { droop: CURVE, skirt: 0.02, nu: 24, nv: 12 }), 0, P + WALL + CURVE, s * (D / 2 + 0.01)));
  }
  g.add(at(arcadeSkin(L, WALL, cellRow(3, 2.2, 0, 1.5, 2.6), d, BRICK, { trim: BRICK_DARK, fill: 'room' }), 0, P, D - d));
  // The tower astride the valley between the two roofs.
  const y0 = P + WALL + CURVE, t = new THREE.Group();
  t.add(box(3.3, 3.4, 3.3, BRICK, 0, y0 + 0.2, 0));
  for (const a of FACES) t.add(onFace(at(archSlab(1.0, 1.4, true, M.recess, 0.03), 0, y0 + 1.95, 0), a, 1.65));
  t.add(at(chala(3.7, 3.7, 1.5, BRICK, { droop: 0.45, skirt: 0.25, ns: 8, nt: 5 }), 0, y0 + 3.6 + 0.7, 0));
  t.add(mesh(new THREE.SphereGeometry(0.22, 10, 8), BRICK_DARK, 0, y0 + 5.9, 0), mesh(new THREE.ConeGeometry(0.08, 0.6, 6), BRICK_DARK, 0, y0 + 6.35, 0));
  g.add(t);
  return g;
}

export function buildBishnupur() {
  const g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  g.add(box(420, 0.06, 380, M.grass, 0, -0.06, 0));
  f.add(at(rasmancha(), SITES.ras[0], 0, SITES.ras[1]), at(shyamRai(), SITES.shyam[0], 0, SITES.shyam[1]), at(jorBangla(), SITES.jor[0], 0, SITES.jor[1]));
  addDetails(f, g);
  // From the south-east: Jor Bangla in front, Shyam Rai beyond the walk, the Rasmancha behind.
  return { group: g, focus: f, view: [0.5, 0.17, 1], zoom: 0.6 };
}

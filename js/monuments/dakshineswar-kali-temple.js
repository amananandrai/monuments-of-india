import * as THREE from 'three';
import { M, mat, mesh, box, cyl, lathe, at, onFace, FACES, doubleSided, photo, ribbed, latheStripes, kalash, sheet, aroundRect } from '../helpers.js';
import { arcadeSkin, cellRow } from '../parts/mughal.js';
import { column } from '../parts/colonial.js';
import { steps } from '../parts/doorways.js';
import { archSlab, mergeByMaterial } from '../parts/components.js';
import { detail } from '../detail.js';
import { addDetails } from '../details/dakshineswar-kali-temple.js';

// Rani Rashmoni's temple of Bhavatarini on the Hooghly (1855): brick and lime plaster, washed
// white and cream and picked out in red.
export const WHITE = photo(mat('#f1ebdc', 0.8), 'plaster');
export const CREAM = photo(mat('#e4d3ac', 0.85), 'plaster');
export const RED = photo(mat('#9d3f30', 0.85), 'plaster');
export const PAVE = mat('#c9bfae', 0.95);

// The site's measures, shared with js/details/dakshineswar-kali-temple.js. +z is south, the way
// the temple faces; the river is to the west (-x). B: the courtyard's height over the river's
// flood plain. The main temple: platform PH high, first storey W1 square and H1 high, second W2.
// The Shiva temples stand on a terrace at x = SX, at z = ±(11 + 8k).
export const D = { B: 2.2, PH: 1.8, W1: 14, H1: 7.2, W2: 8.6, H2: 5, SX: -52, EDGE: -59, SHIVA: [0, 1, 2, 3, 4, 5].flatMap((k) => [11 + 8 * k, -11 - 8 * k]) };

// A char-chala, the four-sided curved roof of Bengal over a rectangle w × d: each eave is highest
// in the middle of its side (y = 0) and droops by `droop` to the corners, and the roof swells up
// to `rise`. `skirt`: a curved cornice hanging from each eave to that far below the corners.
export function chala(w, d, rise, m, { droop = rise * 0.4, pow = 1.5, skirt = 0, ns = 12, nt = 6 } = {}) {
  const pos = [], idx = [];
  for (const A of FACES) {
    const half = A === 0 || A === Math.PI ? w / 2 : d / 2, depth = A === 0 || A === Math.PI ? d / 2 : w / 2;
    const put = (a, r, y) => pos.push(Math.sin(A) * r + Math.cos(A) * a, y, Math.cos(A) * r - Math.sin(A) * a);
    let b0 = pos.length / 3;
    for (let j = 0; j <= nt; j++) for (let i = 0; i <= ns; i++) {
      const s = (2 * i) / ns - 1, q = 1 - j / nt;
      put(s * half * q, depth * q, rise * (1 - q ** pow) - droop * s * s * q * q);
    }
    for (let j = 0; j < nt; j++) for (let i = 0; i < ns; i++) { const a = b0 + j * (ns + 1) + i, c = a + ns + 1; idx.push(a, a + 1, c, a + 1, c + 1, c); }
    if (!skirt) continue;
    b0 = pos.length / 3;
    for (let i = 0; i <= ns; i++) {
      const s = (2 * i) / ns - 1;
      put(s * half, depth, -droop * s * s);
      put(s * half, depth, -droop - skirt);
      if (i) idx.push(b0 + 2 * i - 2, b0 + 2 * i - 1, b0 + 2 * i, b0 + 2 * i, b0 + 2 * i - 1, b0 + 2 * i + 1);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setIndex(idx);
  geo.computeVertexNormals();
  return mesh(geo, doubleSided(m));
}

// One of the nine spires (ratnas): a square cell with an arch in each face under a curved
// cornice, and a tall ribbed dome drawn up to a point, its ribs picked out in red, under a finial.
const DOME = [[0.9, 0], [1, 0.22], [0.97, 0.55], [0.84, 0.92], [0.62, 1.28], [0.38, 1.56], [0.18, 1.76], [0.07, 1.87], [0, 1.9]];
export function spire(r, bodyH) {
  const g = new THREE.Group(), rd = r * 1.1, seg = detail.low ? 24 : 36;
  g.add(box(2 * r, bodyH, 2 * r, WHITE));
  for (const a of FACES) g.add(onFace(at(archSlab(r * 0.95, bodyH * 0.78, true, M.recess, 0.03), 0, bodyH * 0.06, 0), a, r));
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) g.add(box(r * 0.22, bodyH, r * 0.22, RED, sx * r * 0.93, 0, sz * r * 0.93));
  g.add(at(chala(2 * r + 0.5, 2 * r + 0.5, r * 0.5, WHITE, { droop: r * 0.28, pow: 1.2, skirt: 0.14, ns: 8, nt: 3 }), 0, bodyH + r * 0.28 + 0.1, 0));
  const y0 = bodyH + r * 0.5;
  g.add(cyl(rd * 0.9, rd * 0.96, r * 0.3, RED, 0, y0, 0, 24));
  const pts = DOME.map(([a, b]) => [a * rd, b * rd]);
  g.add(at(ribbed(lathe(pts, CREAM, seg), 12, 0.07), 0, y0 + r * 0.3, 0));
  const stripes = latheStripes(pts.map(([a, b]) => [a * 1.07, b]), 12, 0.16, RED, 2, 0.03);
  g.add(at(stripes, 0, y0 + r * 0.3, 0));
  const yt = y0 + r * 0.3 + rd * 1.87;
  g.add(cyl(r * 0.2, r * 0.26, r * 0.14, RED, 0, yt, 0, 12), at(kalash(r * 0.62, M.gold), 0, yt + r * 0.12, 0));
  return g;
}

// The main temple, a navaratna: three storeys stepping in, four spires on the corners of the
// first, four on the second and the great one over the third, on a high platform.
function navaratna() {
  const g = new THREE.Group(), { PH, W1, H1, W2, H2 } = D, d = 0.8;
  g.add(box(22, PH, 22, CREAM), box(22.3, 0.22, 22.3, RED, 0, PH - 0.5, 0));
  g.add(box(W1 - 2 * d, H1, W1 - 2 * d, WHITE, 0, PH, 0));
  const cells = [[-4.15, 0, 2.2, 4.3], [0, 0, 2.8, 4.9], [4.15, 0, 2.2, 4.3]];
  for (const a of FACES) g.add(onFace(at(arcadeSkin(a === 0 || a === Math.PI ? W1 : W1 - 2 * d, H1, cells, d, WHITE, { trim: RED, fill: 'room' }), 0, PH, 0), a, W1 / 2 - d));
  const y1 = PH + H1;
  g.add(at(chala(W1 + 0.5, W1 + 0.5, 0.9, WHITE, { droop: 1, pow: 1.2, skirt: 0.03, ns: 16 }), 0, y1 + 1, 0));
  const y2 = y1 + 0.9, y3 = y2 + H2;
  g.add(box(W2, H2, W2, WHITE, 0, y2, 0), at(chala(W2 + 0.4, W2 + 0.4, 0.8, WHITE, { droop: 0.7, pow: 1.2, skirt: 0.03 }), 0, y3 + 0.7, 0));
  g.add(box(4.3, 3.3, 4.3, WHITE, 0, y3 + 0.5, 0));
  const s = new THREE.Group();
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    s.add(at(spire(1.15, 2.5), sx * 5.5, y1 + 0.3, sz * 5.5));
    s.add(at(spire(0.95, 2.2), sx * 3.25, y3 + 0.25, sz * 3.25));
  }
  s.add(at(spire(1.9, 4.2), 0, y3 + 3.8, 0));
  g.add(mergeByMaterial(s));
  // The flight of steps up to the platform on the south, and narrower ones on the other sides.
  g.add(at(steps(12, PH, 10, CREAM, 0.38), 0, 0, 11));
  for (const a of [Math.PI / 2, -Math.PI / 2, Math.PI]) g.add(onFace(steps(5, PH, 10, CREAM, 0.38), a, 11));
  return g;
}

// One of the twelve Shiva temples: an aat-chala, a curved four-sided roof with a smaller cell
// and a second such roof on top of it, its door to the east (+x).
function shiva() {
  const g = new THREE.Group(), w = 5.4, h = 4.4;
  g.add(box(w, h, w, WHITE), box(w + 0.3, 0.3, w + 0.3, RED));
  g.add(onFace(at(archSlab(1.5, 3, true, M.recess, 0.04), 0, 0.3, 0), Math.PI / 2, w / 2), onFace(at(archSlab(1.5, 3, true, M.recess, 0.04), 0, 0.3, 0), -Math.PI / 2, w / 2));
  g.add(at(chala(w + 0.5, w + 0.5, 2.6, CREAM, { droop: 0.6, pow: 1.15, skirt: 0.16, ns: 10, nt: 5 }), 0, h + 0.6, 0));
  g.add(box(2.5, 2.6, 2.5, WHITE, 0, h + 1.6, 0));
  g.add(at(chala(2.9, 2.9, 1.7, CREAM, { droop: 0.35, pow: 1.15, skirt: 0.12, ns: 8, nt: 4 }), 0, h + 4.55, 0));
  g.add(cyl(0.2, 0.3, 0.2, RED, 0, h + 6.2, 0, 10), at(kalash(0.75, M.gold), 0, h + 6.35, 0));
  return g;
}

// The Natmandir, the hall for music before the goddess: a flat roof on two rings of columns, open
// on every side, with a parapet.
function natmandir() {
  const g = new THREE.Group(), w = 15, d = 23, h = 6.4, cols = new THREE.Group();
  g.add(box(w + 1.6, 0.9, d + 1.6, CREAM));
  for (const [x, z] of aroundRect(w, d, (w - 1) / 4, 0.5)) cols.add(at(column(0.42, h, WHITE), x, 0.9, z));
  if (!detail.low) for (const [x, z] of aroundRect(w - 7, d - 7, (w - 8) / 2, 0.5)) cols.add(at(column(0.42, h, WHITE), x, 0.9, z));
  g.add(mergeByMaterial(cols));
  g.add(box(w, 1.1, d, WHITE, 0, 0.9 + h, 0), box(w + 0.8, 0.3, d + 0.8, RED, 0, 2 + h, 0), box(w + 0.2, 0.9, d + 0.2, WHITE, 0, 2.3 + h, 0), box(w - 0.6, 0.06, d - 0.6, M.recess, 0, 0.9 + h - 0.06, 0));
  for (const s of [-1, 1]) g.add(at(steps(9, 0.9, 5, CREAM, 0.36), 0, 0, s * (d / 2 + 0.8)).rotateY(s > 0 ? 0 : Math.PI));
  return g;
}

export function buildDakshineswar() {
  const g = new THREE.Group(), f = new THREE.Group(), S = at(new THREE.Group(), 0, D.B, 0);
  g.add(f);
  f.add(S);
  const { B, SX, EDGE } = D;
  // The bank the temple stands on, the paved courtyard on it, and the Hooghly along its west side.
  g.add(box(700, B, 900, M.grass, EDGE + 350, 0, 0), box(112, 0.08, 150, PAVE, -3, B, -4));
  g.add(sheet(760, 3000, M.river, EDGE - 380, 0.3, 0), box(1.2, B + 0.5, 900, CREAM, EDGE + 0.6, 0, 0));
  S.add(navaratna(), at(natmandir(), 0, 0, 29));
  // The Shiva temples on their terrace along the river, six either side of the chandni, with
  // steps down into the courtyard.
  const row = new THREE.Group();
  row.add(box(13, 1.2, 122, CREAM, SX, 0, 0), box(13.2, 0.18, 122.2, RED, SX, 0.85, 0));
  for (const z of D.SHIVA) row.add(at(shiva(), SX, 1.2, z));
  row.add(onFace(steps(122, 1.2, 6, CREAM, 0.36), Math.PI / 2, SX + 6.5));
  // The chandni: the open pavilion at the head of the bathing ghat, an arcade to east and west.
  row.add(box(9, 6.2, 15, WHITE, SX, 1.2, 0), box(11.4, 0.3, 16.4, RED, SX, 7.4, 0), box(10.8, 0.9, 15.8, WHITE, SX, 7.7, 0));
  for (const a of [Math.PI / 2, -Math.PI / 2]) { const c = onFace(at(arcadeSkin(15, 6.2, cellRow(3, 4.6, 0, 3.1, 4.8), 0.8, WHITE, { trim: RED, fill: 'room' }), 0, 1.2, 0), a, 4.5); c.position.x += SX; row.add(c); }
  S.add(mergeByMaterial(row));
  // The ghat: steps from the chandni down into the river.
  const ghat = onFace(steps(34, B + 1.6, 16, CREAM, 0.5), -Math.PI / 2, -EDGE);
  ghat.position.y = -0.4;
  f.add(ghat);
  // The Vishnu (Radha-Kanta) temple to the north-east: a flat-roofed hall on a platform, a
  // columned verandah on its west front.
  const v = at(new THREE.Group(), 30, 0, -38), vc = new THREE.Group();
  v.add(box(17, 1.5, 14, CREAM), box(11, 6, 11, WHITE, 1.5, 1.5, 0), box(15.4, 0.9, 12.4, WHITE, 0, 7.5, 0), box(16, 0.3, 13, RED, 0, 8.4, 0), box(15.4, 0.8, 12.4, WHITE, 0, 8.7, 0));
  for (let k = 0; k < 6; k++) vc.add(at(column(0.38, 6, WHITE), -6.6, 1.5, (k - 2.5) * 2.2));
  v.add(mergeByMaterial(vc), onFace(steps(8, 1.5, 8, CREAM, 0.36), -Math.PI / 2, 8.5));
  v.add(onFace(at(archSlab(1.6, 3.4, true, M.recess, 0.04), 0, 1.5, 0), -Math.PI / 2, 4));
  S.add(v);
  addDetails(f, g);
  // From the east side of the courtyard: the nine spires, the Natmandir to the left, the Shiva
  // temples and the river beyond.
  return { group: g, focus: f, view: [1, 0.12, 0.62], zoom: 0.36, target: [0, B + 14, 8] };
}

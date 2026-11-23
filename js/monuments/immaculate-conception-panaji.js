import * as THREE from 'three';
import { M, mat, mesh, box, cyl, at, photo, onFace, FACES } from '../helpers.js';
import { mergeByMaterial, gableRoof } from '../parts/components.js';
import { classicalDoor, balustrade, pediment } from '../parts/colonial.js';
import { pinnacle } from '../parts/sculpture.js';
import { steps } from '../parts/doorways.js';
import { addDetails, lattice, lampPier } from '../details/immaculate-conception-panaji.js';

// The church of Our Lady of the Immaculate Conception, Panaji: laterite under lime plaster washed
// a brilliant white, cornices and pilasters white too but a shade warmer, its roofs of red tiles.
export const WHITE = photo(mat('#f7f5f0', 0.8), 'plaster');
export const TRIM = mat('#ece6d8', 0.78);
export const TILE = mat('#a4492f', 0.82);
export const LAT = M.laterite;
// Its shutters and doors are brown, the cross on the belfry red, the balcony on the stairs blue.
export const BROWN = mat('#6b3f26', 0.7);
export const BLUE = mat('#2f6fb3', 0.6);
const RED = mat('#b5261e', 0.6), DARK = mat('#2a2522', 0.7);
// Sources: en.wikipedia.org/wiki/Our_Lady_of_the_Immaculate_Conception_Church,_Goa and the
// photographs of the front on Wikimedia Commons (Panaji, nostra signora dell'immacolata concezione,
// esterno 04).

// The measures, shared with js/details/immaculate-conception-panaji.js. The church stands on a
// terrace H0 above Church Square, its front facing +z at z = FZ. The façade is FW wide: a tower
// TW wide at each end, three storeys to TH, and between them the central bay carried up as the
// great belfry gable. The nave behind is NW wide, NH high and LEN long. The famous stairs fall from
// the terrace in three zig-zag stages of 26 steps (78 in all), each a pair of flights along a retaining wall STEP apart.
export const S = { H0: 9, FZ: 0, FW: 22, TW: 6, TH: 21, NW: 13, NH: 14, LEN: 40, STEP: 3.4, LEVELS: 3 };

export function buildImmaculateConceptionPanaji() {
  const g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  const { H0, FZ, FW, TW, TH, NW, NH, LEN, STEP, LEVELS } = S, d = new THREE.Group(), c = new THREE.Group();
  // The terrace the church stands on: laterite retaining walls, plastered white across the front.
  d.add(box(FW + 16, H0, LEN + 20, WHITE, 0, 0, FZ - LEN / 2 - 2), box(FW + 16.4, 0.6, LEN + 20.4, LAT, 0, 0, FZ - LEN / 2 - 2));
  d.add(box(FW + 16, 0.3, 7.1, M.path, 0, H0, FZ + 4.45));
  // The nave and its tiled roof, the sacristy behind, and the side chapels.
  c.add(box(NW, NH, LEN, WHITE, 0, 0, FZ - 1 - LEN / 2), at(gableRoof(NW + 1.2, LEN, 5.2, TILE), 0, NH, FZ - 1 - LEN / 2));
  for (const s of [-1, 1]) c.add(box(4, 8, LEN - 12, WHITE, s * (NW / 2 + 2), 0, FZ - 8 - (LEN - 12) / 2), at(gableRoof(4.6, LEN - 11.4, 1.6, TILE), s * (NW / 2 + 2), 8, FZ - 8 - (LEN - 12) / 2));
  c.add(box(10, 9, 8, WHITE, 0, 0, FZ - LEN - 4), at(gableRoof(10.8, 8.6, 3, TILE), 0, 9, FZ - LEN - 4));
  // The façade, set a little forward of the nave: three storeys of white between pilastered
  // towers, cornices across the whole width at each floor.
  const zf = FZ + 0.9;
  c.add(box(FW - 2 * TW, 14.2, 1.8, WHITE, 0, 0, FZ));
  for (const s of [-1, 1]) c.add(box(TW, TH, TW, WHITE, s * (FW / 2 - TW / 2), 0, FZ - TW / 2 + 0.9));
  for (const y of [7.2, 14.2]) c.add(box(FW + 0.6, 0.55, 2.6, TRIM, 0, y - 0.55, FZ), box(FW + 0.6, 0.55, TW + 0.6, TRIM, 0, y - 0.55, FZ - TW / 2 + 0.9));
  for (const s of [-1, 1]) c.add(box(TW + 0.6, 0.55, TW + 0.6, TRIM, s * (FW / 2 - TW / 2), TH - 0.55, FZ - TW / 2 + 0.9));
  for (const x of [-FW / 2 + 0.3, -FW / 2 + TW - 0.3, FW / 2 - TW + 0.3, FW / 2 - 0.3]) c.add(box(0.7, TH - 0.6, 0.3, TRIM, x, 0, zf + 0.12));
  for (const s of [-1, 1]) c.add(box(0.7, 13.6, 0.3, TRIM, s * 3.2, 0, zf + 0.12));
  // The doors and windows of the front: the main door between pilasters under a pediment and a
  // door in each tower; across the first floor five pedimented windows with brown shutters, the
  // middle one arched.
  const op = { m: WHITE, trim: TRIM };
  c.add(at(classicalDoor(2.8, 5.4, { ...op, pilasters: true, top: 'pediment', depth: 0.4, leafM: BROWN }), 0, 0, zf));
  c.add(at(classicalDoor(1.9, 3.5, { ...op, top: 'pediment', depth: 0.3, leafM: BROWN, sill: true }), 0, 8.6, zf));
  for (const x of [-FW / 2 + TW / 2, -4.2, 4.2, FW / 2 - TW / 2]) {
    const w = Math.abs(x) > 5 ? 1.5 : 1.05;
    c.add(at(classicalDoor(w, 2.6, { ...op, shape: 'flat', fill: 'glass', top: 'pediment', depth: 0.25 }), x, 9.1, zf), box(w * 0.97, 2.52, 0.05, BROWN, x, 9.12, zf + 0.07));
  }
  const bellGeo = new THREE.LatheGeometry([[0.05, 0], [0.95, 0], [0.85, 0.25], [0.62, 0.9], [0.55, 1.5], [0.3, 1.7], [0, 1.72]].map(([r, y]) => new THREE.Vector2(r, y)), 16), BRONZE = mat('#8a6a3a', 0.4, 0.7);
  for (const s of [-1, 1]) {
    const x = s * (FW / 2 - TW / 2), tz = FZ - TW / 2 + 0.9;
    c.add(at(classicalDoor(1.6, 3.6, { ...op, top: 'cornice', depth: 0.3, leafM: BROWN }), x, 0, zf));
    // The towers' belfry stage: an open arch on every face.
    for (const a of FACES) c.add(at(onFace(classicalDoor(1.8, 3.6, { ...op, fill: 'room', top: null, depth: 0.3 }), a, TW / 2), x + Math.sin(a) * TW / 2, 15.4, tz + Math.cos(a) * TW / 2));
    // The towers end flat: a balustrade round the top between four corner pinnacles (no domes).
    for (const a of FACES) c.add(at(onFace(balustrade(TW - 1, 1, TRIM), a, 0), x + Math.sin(a) * (TW / 2 - 0.3), TH, tz + Math.cos(a) * (TW / 2 - 0.3)));
    for (const cx of [-1, 1]) for (const cz of [-1, 1]) c.add(box(0.75, 1.1, 0.75, WHITE, x + cx * (TW / 2 - 0.3), TH, tz + cz * (TW / 2 - 0.3)), at(pinnacle(1.5, TRIM), x + cx * (TW / 2 - 0.3), TH + 1.1, tz + cz * (TW / 2 - 0.3)));
    c.add(box(TW - 0.6, 0.12, TW - 0.6, TILE, x, TH, tz));
  }
  // A bell hangs in the front arch of the left tower.
  c.add(at(mesh(bellGeo, BRONZE), -FW / 2 + TW / 2, 16.6, zf - 0.5), box(1.8, 0.14, 0.14, M.wood, -FW / 2 + TW / 2, 17.7, zf - 0.5));
  c.children[c.children.length - 2].scale.setScalar(0.62);
  // The belfry over the middle bay, a tall narrow aedicule in three stages about a third of the
  // front's width. First a stage with a niche, scroll volutes at its foot filling out to the towers.
  const AW = 6.4, scroll = new THREE.Shape();
  scroll.moveTo(0, 0); scroll.lineTo(1.75, 0); scroll.lineTo(1.75, 1.3);
  scroll.quadraticCurveTo(0.35, 1.7, 0.4, 5.4); scroll.lineTo(0, 5.4); scroll.closePath();
  for (const s of [-1, 1]) {
    const v = at(mesh(new THREE.ExtrudeGeometry(scroll, { depth: 1, bevelEnabled: false, curveSegments: 10 }), WHITE), s * AW / 2, 14.2, FZ + (s > 0 ? -0.5 : 0.5));
    v.rotation.y = s > 0 ? 0 : Math.PI;
    c.add(v, at(cyl(0.62, 0.62, 1.1, TRIM, 0, 0, 0, 16).rotateX(Math.PI / 2), s * (AW / 2 + 1.1), 14.2 + 0.75, FZ));
    c.add(box(0.6, 6.25, 0.25, TRIM, s * (AW / 2 - 0.3), 14.2, zf + 0.1), box(0.5, 5.2, 0.22, TRIM, s * 2.25, TH, zf + 0.1));
  }
  c.add(box(AW, TH - 14.2, 1.8, WHITE, 0, 14.2, FZ), box(AW + 0.6, 0.5, 2.5, TRIM, 0, TH - 0.5, FZ));
  c.add(at(classicalDoor(1.1, 2.2, { ...op, fill: 'glass', top: 'cornice', depth: 0.22 }), 0, 17, zf), box(1.8, 0.7, 0.08, TRIM, 0, 15.6, zf + 0.04));
  // Then the bell arch between pilasters, the great bell hung in it.
  const stage = new THREE.Shape([new THREE.Vector2(-2.6, 0), new THREE.Vector2(2.6, 0), new THREE.Vector2(2.6, 5.4), new THREE.Vector2(-2.6, 5.4)]), hole = new THREE.Path();
  hole.moveTo(-1.3, 0.7); hole.lineTo(1.3, 0.7); hole.lineTo(1.3, 3.1); hole.absarc(0, 3.1, 1.3, 0, Math.PI, false); hole.lineTo(-1.3, 0.7);
  stage.holes.push(hole);
  c.add(at(mesh(new THREE.ExtrudeGeometry(stage, { depth: 1.6, bevelEnabled: false, curveSegments: 10 }), WHITE), 0, TH, FZ - 0.8));
  c.add(at(mesh(bellGeo, BRONZE), 0, TH + 1.5, FZ), box(2.6, 0.2, 0.2, M.wood, 0, TH + 3.4, FZ));
  c.add(box(5.8, 0.4, 2.2, TRIM, 0, TH + 5.4, FZ), at(pediment(4.6, 0.9, 1.9, WHITE, TRIM), 0, TH + 5.9, FZ - 0.95));
  // Last a small pedimented stage between finials, and the red cross.
  c.add(box(2.3, 2.6, 1.3, WHITE, 0, TH + 6, FZ), box(0.9, 1.5, 0.06, M.recess, 0, TH + 6.9, FZ + 0.66), box(2.7, 0.3, 1.7, TRIM, 0, TH + 8.6, FZ), at(pediment(2.7, 0.8, 1.6, WHITE, TRIM), 0, TH + 9, FZ - 0.8));
  for (const s of [-1, 1]) c.add(at(pinnacle(1.5, TRIM), s * 2.35, TH + 5.8, FZ), at(pinnacle(0.9, TRIM), s * 1.1, TH + 8.9, FZ));
  c.add(box(0.5, 0.6, 0.5, WHITE, 0, TH + 9.7, FZ), box(0.2, 2, 0.2, RED, 0, TH + 10.3, FZ), box(1.1, 0.2, 0.2, RED, 0, TH + 11.5, FZ));
  d.add(at(c, 0, H0, 0));
  // The zig-zag stairs, 78 steps in three stages of 26. At each stage a white retaining wall and
  // two flights against its face: from the ends of the top terrace in to a middle landing, out
  // again to the ends, and in to the foot. Every flight and terrace edge has a balustrade of
  // criss-cross lattice, with white globe lamps on its piers.
  const rise = H0 / LEVELS, n = 26, tread = 0.36, run = n * tread, C = 3.2;
  for (let i = 0; i < LEVELS; i++) {
    const zw = FZ + 8 + i * STEP, ytop = H0 - i * rise, ybot = ytop - rise, wl = i ? 30 : FW + 16, outward = i % 2 === 1, hx = C + run;
    if (i > 0) d.add(box(wl, ytop, STEP, WHITE, 0, 0, zw - STEP / 2), box(wl + 0.2, 0.18, STEP + 0.1, M.path, 0, ytop, zw - STEP / 2));
    for (const s of [-1, 1]) {
      const x0 = outward ? s * C : s * hx, dir = outward ? s : -s;
      const fl = steps(2.4, rise, n, WHITE, tread);
      fl.rotation.y = dir * Math.PI / 2;
      d.add(at(fl, x0, ybot, zw + 1.2));
      // The balustrade on the open side of the flight, sloping with it, between lamp piers.
      const b = lattice(Math.hypot(run, rise), 0.95, TRIM);
      b.position.set(x0 + dir * run / 2, ybot + rise / 2, zw + 2.3);
      b.rotation.z = -dir * Math.atan2(rise, run);
      d.add(b, at(lampPier(WHITE), x0 + dir * (run + 0.4), ybot, zw + 2.3));
      // The landing at the flight's head.
      if (!outward) d.add(box(2.4, ytop, 2.4, WHITE, s * (hx + 1.2), 0, zw + 1.2), at(lattice(2.4, 0.95, TRIM), s * (hx + 1.2), ytop, zw + 2.3), at(lampPier(WHITE), s * (hx + 2.4), ytop, zw + 2.3));
    }
    // The balustrade along the terrace's edge, open at the flights' heads, a lamp pier at each end.
    const yb = ytop + (i ? 0.18 : 0.3), gaps = outward ? [[-C, C]] : [[-(hx + 2.4), -hx], [hx, hx + 2.4]];
    let from = -wl / 2;
    for (const [a0, a1] of [...gaps, [wl / 2, wl / 2]]) {
      if (a0 - from > 0.6) d.add(at(lattice(a0 - from, 0.95, TRIM), (from + a0) / 2, yb, zw - 0.2));
      from = a1;
    }
    for (const x of [-wl / 2 + 0.2, wl / 2 - 0.2, ...gaps.flat()]) if (Math.abs(x) < wl / 2) d.add(at(lampPier(WHITE), x, yb, zw - 0.2));
  }
  // The middle landing, on the centre line: a balcony painted blue, standing out over the lowest
  // wall, and under it a dark cross.
  const zb = FZ + 8 + STEP, yl = H0 - rise;
  d.add(box(2 * C, yl, 2.4, WHITE, 0, 0, zb + 1.2), box(2 * C + 0.6, 0.3, 3.3, BLUE, 0, yl - 0.3, zb + 1.65), at(lattice(2 * C + 0.4, 1, BLUE), 0, yl, zb + 3.15));
  for (const s of [-1, 1]) d.add(at(lattice(0.9, 1, BLUE), s * (C + 0.2), yl, zb + 2.75).rotateY(Math.PI / 2), box(0.3, 0.9, 0.9, BLUE, s * (C - 0.6), yl - 1.2, zb + 2.85));
  d.add(box(0.22, 2.3, 0.12, DARK, 0, 0.3, zb + STEP + 0.07), box(1.3, 0.22, 0.12, DARK, 0, 1.7, zb + STEP + 0.07));
  // The paved landing at the foot, where the lowest flights meet.
  d.add(box(12, 0.12, 4, M.path, 0, 0, FZ + 8 + (LEVELS - 1) * STEP + 4));
  f.add(mergeByMaterial(d));
  addDetails(f, g);
  // From the square below, a little to the north, looking up the stairs.
  return { group: g, focus: f, view: [0.3, 0.13, 1], zoom: 0.72 };
}

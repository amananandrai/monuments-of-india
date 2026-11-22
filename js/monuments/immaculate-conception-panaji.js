import * as THREE from 'three';
import { M, mat, mesh, box, cyl, at, photo, hemi } from '../helpers.js';
import { mergeByMaterial, sunburst, gableRoof } from '../parts/components.js';
import { classicalDoor, oculus, balustrade } from '../parts/colonial.js';
import { steps } from '../parts/doorways.js';
import { addDetails } from '../details/immaculate-conception-panaji.js';

// The church of Our Lady of the Immaculate Conception, Panaji: laterite under lime plaster washed
// a brilliant white, cornices and pilasters white too but a shade warmer, its roofs of red tiles.
export const WHITE = photo(mat('#f7f5f0', 0.8), 'plaster');
export const TRIM = mat('#ece6d8', 0.78);
export const TILE = mat('#a4492f', 0.82);
export const LAT = M.laterite;

// The measures, shared with js/details/immaculate-conception-panaji.js. The church stands on a
// terrace H0 above Church Square, its front facing +z at z = FZ. The façade is FW wide: a tower
// TW wide at each end, three storeys to TH, and between them the central bay carried up as the
// great belfry gable. The nave behind is NW wide, NH high and LEN long. The famous stairs fall from
// the terrace in three zig-zag stages, each a pair of flights along a retaining wall STEP apart.
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
  c.add(box(FW - 2 * TW, TH, 1.8, WHITE, 0, 0, FZ));
  for (const s of [-1, 1]) c.add(box(TW, TH, TW, WHITE, s * (FW / 2 - TW / 2), 0, FZ - TW / 2 + 0.9));
  for (const y of [7.2, 14.2, TH]) c.add(box(FW + 0.6, 0.55, 2.6, TRIM, 0, y - 0.55, FZ), box(FW + 0.6, 0.55, TW + 0.6, TRIM, 0, y - 0.55, FZ - TW / 2 + 0.9).translateX(0));
  for (const x of [-FW / 2 + 0.3, -FW / 2 + TW - 0.3, FW / 2 - TW + 0.3, FW / 2 - 0.3, -2.6, 2.6]) c.add(box(0.7, TH - 0.6, 0.3, TRIM, x, 0, zf + 0.12));
  // The doors and windows of the front: the main door between pilasters under a pediment, a
  // window over it with a balcony, and an oculus in the top storey; a door and windows in each tower.
  const op = { m: WHITE, trim: TRIM };
  c.add(at(classicalDoor(2.8, 5.4, { ...op, pilasters: true, top: 'pediment', depth: 0.4 }), 0, 0, zf));
  c.add(at(classicalDoor(2.2, 4, { ...op, fill: 'glass', top: 'segment', depth: 0.3 }), 0, 8.4, zf), at(balustrade(3.4, 0.9, TRIM), 0, 7.2, zf + 0.5));
  c.add(at(oculus(1.3, op), 0, 17.6, zf));
  for (const s of [-1, 1]) {
    const x = s * (FW / 2 - TW / 2);
    c.add(at(classicalDoor(1.6, 3.6, { ...op, top: 'cornice', depth: 0.3 }), x, 0, zf));
    c.add(at(classicalDoor(1.3, 2.8, { ...op, fill: 'glass', top: 'cornice', depth: 0.25 }), x, 9.2, zf));
    // The towers' belfry stage: an open arch on every face.
    for (const a of [0, Math.PI / 2, Math.PI, -Math.PI / 2]) {
      const o = at(classicalDoor(1.8, 3.6, { ...op, fill: 'room', top: null, depth: 0.3 }), x + Math.sin(a) * TW / 2, 15.4, FZ - TW / 2 + 0.9 + Math.cos(a) * TW / 2);
      o.rotation.y = a;
      c.add(o);
    }
    // Over each tower: a balustrade, a drum and a little dome with a lantern and a cross.
    const tz = FZ - TW / 2 + 0.9;
    c.add(at(balustrade(TW, 0.9, TRIM), x, TH, tz + TW / 2 - 0.25), at(balustrade(TW, 0.9, TRIM), x, TH, tz - TW / 2 + 0.25));
    c.add(cyl(2.1, 2.2, 2.2, WHITE, x, TH, tz, 16), cyl(2.35, 2.35, 0.35, TRIM, x, TH + 2.2, tz, 16));
    c.add(at(hemi(2.2, WHITE), x, TH + 2.5, tz), cyl(0.45, 0.5, 1.2, WHITE, x, TH + 4.6, tz, 8), box(0.14, 1.3, 0.14, TRIM, x, TH + 5.8, tz), box(0.7, 0.14, 0.14, TRIM, x, TH + 6.6, tz));
  }
  // The great belfry gable over the middle bay: a stepped Baroque crest with scrolls, the bell hung
  // in its arched opening, a sunburst over it, and a cross at the top.
  const bw = FW - 2 * TW, crest = new THREE.Shape();
  crest.moveTo(-bw / 2, 0); crest.lineTo(bw / 2, 0); crest.lineTo(bw / 2, 1.2);
  crest.quadraticCurveTo(bw / 2 - 0.4, 3.2, bw / 2 - 2.2, 3.6); crest.lineTo(bw / 2 - 2.2, 6.8);
  crest.quadraticCurveTo(bw / 2 - 2.6, 8.6, 0, 9.4); crest.quadraticCurveTo(-bw / 2 + 2.6, 8.6, -bw / 2 + 2.2, 6.8);
  crest.lineTo(-bw / 2 + 2.2, 3.6); crest.quadraticCurveTo(-bw / 2 + 0.4, 3.2, -bw / 2, 1.2); crest.closePath();
  const hole = new THREE.Path();
  hole.moveTo(-1.5, 2.2); hole.lineTo(1.5, 2.2); hole.lineTo(1.5, 5.4); hole.absarc(0, 5.4, 1.5, 0, Math.PI, false); hole.lineTo(-1.5, 2.2);
  crest.holes.push(hole);
  c.add(at(mesh(new THREE.ExtrudeGeometry(crest, { depth: 1.6, bevelEnabled: false, curveSegments: 10 }), WHITE), 0, TH, FZ - 0.9));
  c.add(box(3, 0.2, 1.4, M.recess, 0, TH + 2.2, FZ - 0.1));
  const bell = mesh(new THREE.LatheGeometry([[0.05, 0], [0.95, 0], [0.85, 0.25], [0.62, 0.9], [0.55, 1.5], [0.3, 1.7], [0, 1.72]].map(([r, y]) => new THREE.Vector2(r, y)), 16), mat('#8a6a3a', 0.4, 0.7), 0, TH + 3.0, FZ - 0.1);
  c.add(bell, box(2.6, 0.2, 0.2, M.wood, 0, TH + 4.9, FZ - 0.1));
  c.add(at(sunburst(0.7, TRIM, { rays: 16 }), 0, TH + 7.6, FZ + 0.72));
  c.add(box(0.2, 1.8, 0.2, TRIM, 0, TH + 9.4, FZ - 0.1), box(1.0, 0.2, 0.2, TRIM, 0, TH + 10.4, FZ - 0.1));
  d.add(at(c, 0, H0, 0));
  // The zig-zag stairs: at each stage a retaining wall, white, with a balustrade along its edge,
  // and two flights against its face, running outward from the middle at the first and third
  // stages and inward from the ends at the second.
  const rise = H0 / LEVELS, n = 16, tread = 0.42, run = n * tread;
  for (let i = 0; i < LEVELS; i++) {
    const zw = FZ + 8 + i * STEP, ytop = H0 - i * rise, ybot = ytop - rise, wl = 26;
    if (i > 0) d.add(box(wl, ytop, STEP, WHITE, 0, 0, zw - STEP / 2), box(wl + 0.2, 0.18, STEP + 0.1, M.path, 0, ytop, zw - STEP / 2));
    for (const s of [-1, 1]) {
      const outward = i % 2 === 0, x0 = outward ? s * 1.2 : s * (1.2 + run + 1.6);
      const fl = steps(2.4, rise, n, WHITE, tread);
      fl.rotation.y = outward ? s * Math.PI / 2 : -s * Math.PI / 2;
      d.add(at(fl, x0, ybot, zw + 1.2));
      // The balustrade on the open side of the flight, sloping with it.
      const b = balustrade(run + 0.6, 0.85, TRIM);
      const xm = x0 + (outward ? s : -s) * run / 2;
      b.position.set(xm, ybot + rise / 2 - 0.05, zw + 2.5);
      b.rotation.z = (outward ? -s : s) * Math.atan2(rise, run);
      d.add(b);
    }
    // The balustrade along the terrace's edge, over the flights' heads, with an urn-topped pier
    // at each end.
    const yb = ytop + (i ? 0.18 : 0.3), gaps = i % 2 === 0 ? [[-2.6, 2.6]] : [[-(run + 4.2), -(run + 1.6)], [run + 1.6, run + 4.2]];
    let from = -wl / 2;
    for (const [a0, a1] of [...gaps, [wl / 2, wl / 2]]) {
      if (a0 - from > 0.6) d.add(at(balustrade(a0 - from, 0.9, TRIM), (from + a0) / 2, yb, zw - 0.2));
      from = a1;
    }
    for (const s of [-1, 1]) d.add(box(0.7, 1.4, 0.7, WHITE, s * (wl / 2 - 0.2), ytop, zw - 0.2), cyl(0.15, 0.3, 0.6, TRIM, s * (wl / 2 - 0.2), ytop + 1.4, zw - 0.2, 8));
  }
  // The landing at the foot, before the middle flights.
  d.add(box(8, 0.12, 4, M.path, 0, 0, FZ + 8 + (LEVELS - 1) * STEP + 4));
  f.add(mergeByMaterial(d));
  addDetails(f, g);
  // From the square below, a little to the north, looking up the stairs.
  return { group: g, focus: f, view: [0.45, 0.2, 1], zoom: 0.9 };
}

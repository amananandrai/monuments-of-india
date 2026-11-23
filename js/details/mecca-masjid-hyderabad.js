import * as THREE from 'three';
import { M, mat, mesh, box, cyl, at, sheet, hemi, finial, onionDome } from '../helpers.js';
import { arcadeSkin, cellRow, pierced } from '../parts/mughal.js';
import { steps } from '../parts/doorways.js';
import { merlons, merlonGeo, jali, chhajja, bracketGeo, placeAll, archRing, medallion, rosette, mergeByMaterial } from '../parts/components.js';
import { trees, lampPosts, benches, along, cityAround, stalls } from '../parts/realism.js';
import { detail } from '../detail.js';

// The granite of the Mecca Masjid, weathered to a warm grey, and the lime plaster of its trim.
export const STONE = mat('#8e8273', 0.92);
export const TRIM = mat('#c9bfae', 0.85);
// The same granite inside the hall, out of the sun.
export const SHADE = mat('#4f4840', 0.95);
const MARBLE = M.marble;

// The Mecca Masjid, finer detail and setting. From photographs: round each arch a moulded ring, a
// carved medallion in either spandrel and, over the middle arch, a rosette at its head; pilaster
// strips between the arches; the deep eave on its row of lotus brackets across the front and
// along the sides, the plain parapet above it and its crest of big merlons. The court in front,
// paved and walled, with the long pool for ablutions in the middle and the famous stone benches
// beside it, a sundial on its pedestal and the low broken walls of the old hammam. Along the south
// side of the court from the hall's corner, the tombs of the Nizams (1914): a long flat-roofed
// canopy of arches over the marble graves, with a block at each end that carries four slender
// minarets with round balconies. The gate on the court's east side, onto the street that runs to
// the Charminar; and the old city all round. Dimensions follow
// js/monuments/mecca-masjid-hyderabad.js: the hall HW wide, HD deep and HH high to the tips of its
// merlons on a plinth P high, its front at z = 0 facing east, so that south is -x.
function architecture(f, { P, HW, HD, HH, EAVE, WALL, FRONT, SIDE }) {
  const d = new THREE.Group(), hz = -HD / 2;
  // The faces that carry an eave: [length, centre along the face, turn, x, z].
  const faces = [[HW - 9.6, 0, 0, 0], [HD - 6, Math.PI / 2, HW / 2, hz - 3], [HD - 6, -Math.PI / 2, -HW / 2, hz - 3]];
  const br = bracketGeo(1.9, 1.3, 0.34), ml = merlonGeo(1.3, HH - WALL, 0.45), list = [], crest = [];
  for (const [len, a, x, z] of faces) {
    const n = Math.round(len / ((HW - 9.6) / 26));
    d.add(at(chhajja(len + 1, 2, 0.75, 0.3, TRIM), x, P + EAVE + 0.75, z).rotateY(a));
    for (let k = 0; k <= n; k++) { const u = -len / 2 + (k / n) * len; list.push([x + Math.cos(a) * u, P + EAVE, z - Math.sin(a) * u, a]); }
    const m = Math.floor(len / 1.7);
    for (let k = 0; k < m; k++) { const u = -len / 2 + ((k + 0.5) / m) * len; crest.push([x + Math.cos(a) * u - Math.sin(a) * 0.3, P + WALL, z - Math.sin(a) * u - Math.cos(a) * 0.3, a]); }
    d.add(at(box(len, 0.35, 0.3, TRIM, 0, 0, 0.1), x, P + WALL - 0.35, z).rotateY(a));
  }
  d.add(placeAll(br, list, TRIM), placeAll(ml, crest, TRIM));
  d.add(at(merlons(HW - 6, 1.3, HH - WALL, 0.45, TRIM, 0.3), 0, P + WALL, -HD + 0.4));
  // The arches' rings and medallions; pilaster strips between the arches of the front.
  const dress = (cells, x, z, a) => {
    const o = new THREE.Group();
    for (const [cx, , aw, ah] of cells) {
      o.add(at(archRing(aw, ah, true, 0.4, 0.12, TRIM), cx, 0, 0));
      for (const s of [-1, 1]) o.add(at(medallion(0.62, TRIM), cx + s * (aw / 2 + 0.75), ah - 1.5, 0));
    }
    d.add(at(o, x, P, z).rotateY(a));
  };
  dress(FRONT, 0, 0.01, 0);
  for (const s of [-1, 1]) dress(SIDE, s * (HW / 2 + 0.01), hz - 1.3, s * Math.PI / 2);
  for (const x of [-18, -6, 6, 18]) d.add(box(0.9, EAVE - 2.6, 0.14, STONE, x, P, 0.07));
  d.add(at(rosette(0.8, TRIM, 12), 0, P + FRONT[2][3] + 1.1, 0.03), at(medallion(1.05, TRIM), 0, P + FRONT[2][3] + 1.1, 0.01));
  // The court: 110 wide, from the hall's front to the gate 80 m east, paved and walled.
  const CZ = 80, CW = 110;
  d.add(box(CW, 0.3, CZ, M.path, 0, 0, CZ / 2));
  for (const s of [-1, 1]) d.add(box(1.2, 4, CZ, STONE, s * (CW / 2 + 0.6), 0, CZ / 2), box(1.5, 0.3, CZ, TRIM, s * (CW / 2 + 0.6), 4, CZ / 2));
  for (const s of [-1, 1]) d.add(box(CW / 2 - 8, 4, 1.2, STONE, s * (CW / 4 + 4), 0, CZ + 0.6), box(CW / 2 - 8, 0.3, 1.5, TRIM, s * (CW / 4 + 4), 4, CZ + 0.6));
  // Steps up to the hall's plinth, before the three middle arches.
  d.add(at(steps(38, P - 0.3, 4, STONE, 0.5), 0, 0.3, 4));
  // The gate: an arch through a block with two small domed turrets.
  const gate = new THREE.Group();
  gate.add(at(arcadeSkin(16, 10, [[0, 0, 6, 8]], 6, STONE, { trim: TRIM, fill: 'none' }), 0, 0, -3));
  gate.add(box(16.4, 0.6, 6.4, TRIM, 0, 10, 0));
  for (const x of [-7.4, 7.4]) gate.add(cyl(0.9, 1, 3, TRIM, x, 10.6, 2.6, 8), at(hemi(1, TRIM, 16), x, 13.6, 2.6), at(finial(1.4, TRIM), x, 14.5, 2.6));
  d.add(at(gate, 0, 0, CZ + 0.6));
  // The pool for ablutions, its kerb of granite, and stone benches either side.
  d.add(box(26, 0.6, 12, STONE, 0, 0.3, 34), box(24.6, 0.05, 10.6, M.recess, 0, 0.3, 34));
  for (const x of [-16.5, 16.5]) d.add(box(4.8, 0.5, 1.1, STONE, x, 0.3, 30.5), box(4.8, 0.5, 1.1, STONE, x, 0.3, 37.5));
  // The sundial, a slab and its gnomon on a stepped pedestal, north of the pool; and what is left
  // of the hammam in the court's north-east corner: low walls round two rooms and a cistern.
  d.add(box(2.2, 0.3, 2.2, STONE, 26, 0.3, 22), box(1.5, 0.9, 1.5, STONE, 26, 0.6, 22), cyl(0.85, 0.85, 0.12, TRIM, 26, 1.5, 22, 20));
  d.add(at(mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.9, 6).rotateX(0.95), M.stoneDark), 26, 1.9, 22));
  for (const [w, dd, x, z, h] of [[10, 0.6, 44, 66, 1.2], [10, 0.6, 44, 73, 0.8], [0.6, 7, 39, 69.5, 1], [0.6, 7, 49, 69.5, 0.6], [0.6, 7, 44, 69.5, 0.7]]) d.add(box(w, h, dd, STONE, x, 0.3, z));
  d.add(box(4, 0.5, 3, STONE, 41.5, 0.3, 68), box(3.2, 0.05, 2.2, M.recess, 41.5, 0.8, 68));
  d.add(tombs());
  f.add(mergeByMaterial(d));
  f.add(sheet(24.6, 10.6, M.water, 0, 0.92, 34));
}

// The tombs of the Nizams, TL long: its arcade faces +z (turned to the north, onto the court).
function tombs() {
  const tomb = new THREE.Group(), TL = 46, TD = 9, TH = 6.2, BL = 6, n = 9, len = TL - 2 * BL;
  // The canopy: an arcade of nine arches down each long side on square piers, low pierced
  // screens between them, a flat roof with an eave and a crest of merlons.
  tomb.add(box(TL, 0.5, TD + 2, TRIM, 0, 0.3, 0), box(len, 0.5, TD + 0.6, TRIM, 0, 0.8 + TH, 0));
  for (const s of [-1, 1]) {
    tomb.add(at(pierced(len, TH, cellRow(n, len / n, 0, len / n - 1, TH - 1.1), 0.8, TRIM), 0, 0.8, s * (TD / 2) - (s > 0 ? 0.8 : 0)));
    tomb.add(box(len, 1, 0.1, jali(MARBLE), 0, 0.8, s * (TD / 2 - 0.4)));
    tomb.add(at(chhajja(len, 0.9, 0.3, 0.1, TRIM), 0, 0.8 + TH + 0.2, s * TD / 2).rotateY(s > 0 ? 0 : Math.PI));
    tomb.add(at(merlons(len, 0.6, 0.8, 0.3, TRIM, 0.35), 0, 1.3 + TH, s * (TD / 2 + 0.1)));
  }
  // The graves, in a row down the middle: marble on dark plinths.
  for (let k = 0; k < 7; k++) tomb.add(box(1.5, 0.25, 2.9, M.stoneDark, -len / 2 + 3 + k * (len - 6) / 6, 0.8, 0), box(1.1, 0.7, 2.4, MARBLE, -len / 2 + 3 + k * (len - 6) / 6, 1.05, 0), box(0.6, 0.3, 1.9, MARBLE, -len / 2 + 3 + k * (len - 6) / 6, 1.75, 0));
  // The block at each end, a little wider and higher, an arch in each face, and at its four
  // corners a slender minaret with a round balcony and a small dome.
  for (const e of [-1, 1]) {
    const b = new THREE.Group(), BW = TD + 1.6, BH = TH + 1.4;
    b.add(at(pierced(BL, BH, [[0, 0, 3, 5.2]], 0.8, TRIM), 0, 0, BW / 2 - 0.8), at(pierced(BL, BH, [[0, 0, 3, 5.2]], 0.8, TRIM), 0, 0, -BW / 2));
    b.add(at(pierced(BW - 1.6, BH, [[0, 0, 3.4, 5.2]], 0.8, TRIM), e * (BL / 2 - 0.4), 0, 0).rotateY(Math.PI / 2).translateZ(-0.4));
    b.add(box(BL, 0.5, BW - 1.6, TRIM, 0, BH - 0.5, 0), box(BL + 0.5, 0.3, BW + 0.5, TRIM, 0, BH, 0));
    for (const s of [-1, 1]) b.add(at(merlons(BL, 0.6, 0.8, 0.3, TRIM, 0.35), 0, BH + 0.3, s * (BW / 2 - 0.1)));
    for (const x of [-1, 1]) for (const z of [-1, 1]) {
      const px = x * (BL / 2 - 0.1), pz = z * (BW / 2 - 0.1);
      b.add(cyl(0.42, 0.5, BH + 2.6, TRIM, px, 0, pz, 8), cyl(0.85, 0.5, 0.4, TRIM, px, BH + 2.2, pz, 12), cyl(0.85, 0.85, 0.45, jali(MARBLE), px, BH + 2.6, pz, 12));
      b.add(cyl(0.32, 0.36, 2, TRIM, px, BH + 2.6, pz, 8), cyl(0.55, 0.32, 0.3, TRIM, px, BH + 4.5, pz, 12), at(onionDome(0.5, TRIM), px, BH + 4.8, pz), at(finial(0.9, TRIM), px, BH + 5.7, pz));
    }
    tomb.add(at(b, e * (TL / 2 - BL / 2), 0.8, 0));
  }
  // South of the hall's front corner, running east along the court's south side.
  const t = at(tomb, -31, 0, 28);
  t.rotation.y = Math.PI / 2;
  return t;
}

export function addDetails(f, g, dims) {
  architecture(f, dims);
  g.add(box(700, 0.2, 700, M.path, 0, -0.2, 0));
  g.add(trees([[-46, 62], [40, 44], [46, 14], [-30, 74]], { kind: 'neem', seed: 2 }));
  g.add(benches(along(5, [-48, 56], [-48, 74]).map(([x, z]) => [x, z, Math.PI / 2])));
  g.add(lampPosts([[-50, 8], [50, 8], [-50, 76], [50, 76], [-12, 78], [12, 78]]));
  // The street east of the gate, towards the Charminar, with its stalls of bangles and pearls.
  g.add(box(30, 0.06, 300, M.asphalt, 0, 0, 96).rotateY(Math.PI / 2));
  g.add(stalls([...along(10, [-120, 88], [-14, 88]), ...along(10, [14, 88], [120, 88])].map(([x, z]) => [x, z, Math.PI])));
  g.add(cityAround([-62, 62, -62, 84], { rows: detail.low ? 2 : 3, every: detail.low ? 2 : 1, gap: 8, seed: 17, fine: !detail.low,
    paint: ['#efe6d2', '#e3d3b2', '#d9c7a6', '#f1e9d8', '#cfd8d4', '#e8d0b8', '#c9d6a3'], keep: [[-150, 150, 84, 104]] }));
}

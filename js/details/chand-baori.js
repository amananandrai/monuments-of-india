import * as THREE from 'three';
import { M, mat, box, cyl, at, sheet, hemi, flag, inst, unitBox } from '../helpers.js';
import { mergeByMaterial, arcadeScreen, jharokha, templeNiche, idol, chhajja, frieze, railing } from '../parts/components.js';
import { carvedPillar } from '../parts/temples.js';
import { steps } from '../parts/doorways.js';
import { trees, shrubs, asiBoard, scatter, townHouses } from '../parts/realism.js';
import { detail } from '../detail.js';
import { STONE, BUFF, BUFF_DARK, D, S, TIER, ZA, ZB, ZC } from '../monuments/chand-baori.js';

// Chand Baori, finer detail. From photographs of the north side, which is not stepped like the
// other three but built up in storeys, the upper ones added by later (Chauhan and Mughal) hands:
// - at the top, against the back wall, two storeys of arcaded galleries stand on the first great
//   terrace, with a third on the rim above them, looking down into the well;
// - below, in the middle of the terrace's face, a pillared pavilion of two storeys projects over
//   the well; in it stood the images of Ganesha and of Durga killing the buffalo demon;
// - balconied windows (jharokhas) and image niches flank it, a sloping eave over each storey;
// - round the rim runs a walk, enclosed by a colonnade against a wall, where the sculpture found
//   at Abhaneri is laid out.
// Dimensions follow js/monuments/chand-baori.js: the rim at y = D, the terraces' faces at ZA, ZB, ZC.
const PLASTER = mat('#dccba3', 0.85);

function pavilions(f) {
  const d = new THREE.Group(), yB = D - 4 * TIER, yC = D - 8 * TIER, F = 2 * TIER, W = 27;
  // The two gallery storeys on the upper terrace: an arcade in front, a floor between, a dim
  // room behind.
  for (let s = 0; s < 2; s++) {
    const y = yB + s * F;
    d.add(at(arcadeScreen(W, F - 0.35, 12, 1.5, 2.5, 0.4, PLASTER, { sill: 0.02 }), 0, y, ZA + 2.2));
    d.add(box(W + 0.5, 0.35, 2.7, BUFF, 0, y + F - 0.35, ZA + 1.3), box(W - 0.4, F - 0.4, 0.06, M.recess, 0, y, ZA + 0.05));
    d.add(at(chhajja(W + 0.5, 0.8, 0.3, 0.08, BUFF_DARK), 0, y + F - 0.06, ZA + 2.42));
    for (const sx of [-1, 1]) d.add(box(0.4, F - 0.35, 2.4, PLASTER, sx * (W / 2 - 0.2), y, ZA + 1.2));
  }
  // The pavilion on the rim over them, open to the well.
  const cols = [];
  for (let k = 0; k <= 12; k++) for (const z of [ZA + 0.4, ZA - 2.6]) cols.push([-W / 2 + 0.3 + k * ((W - 0.6) / 12), D, z, 0.36, 3.2, 0.36]);
  d.add(inst(unitBox(), cols, PLASTER), box(W + 0.6, 0.4, 4.2, BUFF, 0, D + 3.2, ZA - 1.1), at(chhajja(W + 0.6, 0.9, 0.3, 0.08, BUFF_DARK), 0, D + 3.5, ZA + 1.0));
  d.add(at(railing(W, 0.9, 0.16, BUFF), 0, D + 0.15, ZA + 0.7));
  // The projecting pavilion of two storeys, on carved pillars, under a low domed roof.
  const pw = 6.4, pd = 1.7;
  for (let s = 0; s < 2; s++) {
    const y = yC + s * 3.6;
    for (const x of [-pw / 2 + 0.4, -1.1, 1.1, pw / 2 - 0.4]) { const p = carvedPillar(3.1, BUFF); p.scale.set(0.55, 1, 0.55); d.add(at(p, x, y + 0.2, ZB + pd - 0.35)); }
    d.add(box(pw, 0.2, pd, BUFF, 0, y, ZB + pd / 2), box(pw + 0.3, 0.3, pd + 0.2, BUFF, 0, y + 3.3, ZB + pd / 2), box(pw - 0.6, 3.1, 0.06, M.recess, 0, y + 0.2, ZB + 0.05));
    d.add(at(chhajja(pw + 0.4, 0.7, 0.28, 0.07, BUFF_DARK), 0, y + 3.56, ZB + pd + 0.1), at(railing(pw - 1, 0.7, 0.12, BUFF), 0, y + 0.2, ZB + pd - 0.1));
    d.add(at(idol(2.2, STONE), 0, y + 0.5, ZB + 0.12));
  }
  d.add(at(hemi(1.5, BUFF, 16), 0, yB + 0.1, ZB + 0.6), cyl(0.12, 0.2, 0.7, BUFF_DARK, 0, yB + 1.55, ZB + 0.6, 8));
  // Jharokhas and niches along the terrace's face, and a carved band under its edge.
  for (const sx of [-1, 1]) {
    d.add(at(jharokha(2.6, 2.8, BUFF, { roof: 'dome' }), sx * 8.2, yC + 2.6, ZB));
    for (const x of [5, 11.4, 14.6]) d.add(at(templeNiche(1.1, 2, BUFF, { figure: idol(1.7, STONE) }), sx * x, yC + 1.2, ZB + 0.01));
  }
  d.add(box(S - 0.4, 0.5, 0.08, frieze(BUFF), 0, yB - 0.7, ZB + 0.04), box(S - 0.2, 0.25, 0.5, BUFF_DARK, 0, yB - 0.24, ZB + 0.25));
  // The lower terrace: a low parapet, and niches in its face over the last five storeys.
  d.add(at(railing(S - 12, 0.8, 0.14, STONE), 0, yC, ZC - 0.15));
  if (!detail.low) for (let k = -3; k <= 3; k++) d.add(at(templeNiche(1, 1.8, STONE, { figure: idol(1.5, STONE), crown: false }), k * 1.9, yC - 3, ZC + 0.01));
  mergeByMaterial(d);
  f.add(d);
}

// The walk round the rim and the colonnade that encloses it.
function enclosure(f) {
  const d = new THREE.Group(), e0 = 21.5, e1 = 25.5, H = 3.3, cols = [];
  for (const s of [-1, 1]) {
    // The paving of the walk, the back wall and the roof, strip by strip.
    d.add(box(2 * e1, 0.08, e1 - S / 2 - 1, M.path, 0, D, s * (e1 + S / 2 + 1) / 2), box(e1 - S / 2 - 1, 0.08, S + 2, M.path, s * (e1 + S / 2 + 1) / 2, D, 0));
    d.add(box(2 * e1 + 0.8, H + 0.9, 0.8, BUFF, 0, D, s * (e1 + 0.4)), box(0.8, H + 0.9, 2 * e1, BUFF, s * (e1 + 0.4), D, 0));
    d.add(box(2 * e1, 0.35, e1 - e0 + 0.5, BUFF_DARK, 0, D + H, s * (e1 + e0 - 0.5) / 2), box(e1 - e0 + 0.5, 0.35, 2 * e0 - 0.5, BUFF_DARK, s * (e1 + e0 - 0.5) / 2, D + H, 0));
    for (let k = 0; k <= 18; k++) { const t = -e0 + k * (2 * e0 / 18); if (s < 0 && Math.abs(t) < 14) { /* the rim pavilion stands here */ } else cols.push([t, D, s * e0, 0.4, H, 0.4]); if (k > 0 && k < 18) cols.push([s * e0, D, t, 0.4, H, 0.4]); }
  }
  d.add(inst(unitBox(), cols, BUFF));
  // The gate in the west wall, and fragments of sculpture set out along the back wall.
  d.add(box(0.1, 2.6, 2, M.recess, -e1 - 0.82, D, 0), at(steps(3, 0.5, 3, STONE), -e1 - 0.8, D, 0).rotateY(-Math.PI / 2));
  const bits = [];
  for (let k = 0; k < 14; k++) for (const s of [-1, 1]) { bits.push([s * (e1 - 0.6), D + 0.08, -20 + k * 3, 0.5, 0.5 + (k % 3) * 0.3, 0.7]); if (s > 0) bits.push([-18 + k * 2.8, D + 0.08, e1 - 0.6, 0.7, 0.4 + (k % 4) * 0.25, 0.5]); }
  d.add(inst(unitBox(), bits, frieze(STONE)));
  mergeByMaterial(d);
  f.add(d);
}

// The Harshat Mata temple, west of the well: of the 9th-century temple only the great stepped
// terraces and the sanctum stand, the sanctum under a low dome of a later repair; pillar stumps
// and carved stones of the lost hall lie round it.
function harshatMata(g) {
  const d = at(new THREE.Group(), -92, D, 6), T = mat('#b9a27d', 0.9), TD = mat('#9c8762', 0.9);
  d.add(box(40, 2.2, 30, T), box(33, 2, 23, T, 0, 2.2, -1), box(24, 1.6, 16, T, -1, 4.2, -1));
  for (const [w, dp, y] of [[40, 30, 2.2], [33, 23, 4.2], [24, 16, 5.8]]) d.add(box(w + 0.3, 0.25, dp + 0.3, TD, y > 2.2 ? (y > 4.2 ? -1 : 0) : 0, y - 0.25 + 0.001, y > 2.2 ? -1 : 0));
  d.add(box(0.08, 1.2, 28, frieze(T), 20.04, 0.6, 0), box(38, 1.2, 0.08, frieze(T), 0, 0.6, 15.04));
  // The stair up the east front.
  for (let k = 0; k < 14; k++) d.add(box(0.5, 5.8 - k * 0.41, 5, T, 12 + k * 0.5 + 0.25, 0, -1));
  d.add(box(8, 6, 7.5, T, -5, 5.8, -1), box(8.6, 0.4, 8.1, TD, -5, 11.8, -1), at(hemi(3.6, mat('#d8cfb8', 0.85), 20), -5, 12.2, -1), cyl(0.15, 0.3, 1.2, TD, -5, 15.7, -1, 8));
  d.add(box(0.06, 2.6, 1.6, M.recess, -0.97, 6, -1), at(flag(5, M.saffron), -5, 16.5, -1));
  for (const [x, z] of [[2, -5], [2, 3], [5.5, -5], [5.5, 3], [8.5, -5], [8.5, 3]]) { const p = carvedPillar(2.6, T); p.scale.set(0.7, 1, 0.7); d.add(at(p, x, 5.8, z)); }
  for (let k = 0; k < 16; k++) d.add(box(0.9, 0.5 + (k % 3) * 0.2, 0.6, frieze(T), -15 + k * 2, 2.2, 12.6), cyl(0.5, 0.5, 0.35, TD, 14 - k * 1.8, 2.2, -12.4, 12));
  mergeByMaterial(d);
  g.add(d);
}

export function addDetails(f, g) {
  pavilions(f);
  enclosure(f);
  harshatMata(g);
  // Abhaneri: a village of low flat-roofed houses among fields of mustard and wheat, with the
  // khejri, neem and babul of eastern Rajasthan.
  const lane = mat('#a8946f', 0.95);
  g.add(sheet(8, 300, lane, -40, D + 0.03, 20), sheet(180, 7, lane, -10, D + 0.03, 62));
  for (const [x, z, w, dp, c] of [[70, -60, 70, 50, '#b9b04a'], [80, 10, 60, 60, '#7d9a4a'], [10, -90, 60, 40, '#8aa34e'], [-110, -80, 80, 60, '#c2b651'], [60, 120, 90, 60, '#869e4c']]) g.add(sheet(w, dp, mat(c, 0.95), x, D + 0.04, z));
  const R = [[-60, 84, 9, 8, 1, Math.PI], [-46, 86, 8, 9, 2, Math.PI], [-18, 84, 10, 8, 1, Math.PI], [0, 86, 8, 8, 1, Math.PI], [16, 84, 9, 9, 2, Math.PI], [36, 86, 10, 8, 1, Math.PI], [-52, 44, 8, 9, 1, Math.PI / 2], [-52, 30, 8, 8, 1, Math.PI / 2], [-54, -40, 9, 9, 1, Math.PI / 2], [52, 48, 9, 8, 1, Math.PI]];
  g.add(townHouses(R.map(([x, z, w, dp, n, ry]) => [x, z, w, dp, n, ry, D]), { seed: 5, tanks: 0.2, paint: ['#e9d9b8', '#d9c7a0', '#cfd8dc', '#e7c9a8'], fine: false }));
  const keep = [[-30, 30, -30, 30], [-116, -68, -14, 26], [-45, -35, -130, 170]];
  g.add(trees(scatter(14, [-130, 120, -110, 130], { seed: 3, gap: 22, avoid: keep }), { kind: 'khejri', seed: 3, y: D }));
  g.add(trees(scatter(9, [-130, 120, -110, 130], { seed: 8, gap: 30, avoid: keep }), { kind: 'neem', seed: 8, y: D }));
  g.add(trees(scatter(8, [-130, 120, -110, 130], { seed: 13, gap: 30, avoid: keep }), { kind: 'babul', seed: 13, y: D }));
  g.add(shrubs(scatter(30, [-120, 110, -100, 120], { seed: 5, gap: 10, avoid: keep }).map(([x, z]) => [x, z, 0.9]), { y: D, seed: 6, dry: true }));
  g.add(asiBoard('Chand Baori, Abhaneri', -30, 6, Math.PI / 2, { y: D }));
}

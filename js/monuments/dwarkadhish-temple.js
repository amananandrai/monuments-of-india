import * as THREE from 'three';
import { M, mat, box, at, onFace, sheet, shikhara, pidaRoof, bell, kalash, photo, rng } from '../helpers.js';
import { carvedPillar, tierSpires, trabeateGate, wallWithGaps, nagaraTemple } from '../parts/temples.js';
import { templeDoorway, templePorch, grandStair, steps } from '../parts/doorways.js';
import { railing, chhajja, cuspedArchGeo, placeAll, mergeByMaterial } from '../parts/components.js';
import { miniSpireGeo } from '../parts/sculpture.js';
import { townHouses, houseRow, cityAround } from '../parts/realism.js';
import { addDetails } from '../details/dwarkadhish-temple.js';
import { detail } from '../detail.js';

// The Jagat Mandir is built of the pale limestone of the coast, weathered grey-buff.
const STONE = photo(mat('#cdc1a8', 0.88), 'blocks');
const SHADE = mat('#a89b84', 0.9);
const PAVE = mat('#c9bfa8', 0.95);

// The layout (js/details/dwarkadhish-temple.js repeats it). The temple faces west, here +z; the
// Gomti lies to the south, +x. T: the height of the mound the temple court stands on, above the
// ghat; P: the temple's own plinth; F: a storey of the hall and of the tower beside it.
const T = 5, P = 2, F = 4.2, Y0 = T + P;
const TOWER_Z = -14, TOWER_W = 16, SPIRE_Y = Y0 + 5 * F, SPIRE_H = 41, SPIRE_W = 14.5;
const HALL_BACK = -5, HALL_W = [24, 24, 21, 18, 15];
// The spire holds its width over the lower storeys and curves in late: taller and straighter than
// Somnath's.
const spireProfile = (t) => 1 - 0.62 * Math.pow(t, 1.8);

// One storey of the Ladwa Mandap, w square and F high on y = 0: a solid core, a gallery of carved
// pillars along the front and the two sides (the back is against the tower), a cusped arch in each
// bay, a balustrade between the pillars of an upper floor, the floor slab above and an eave round it.
function gallery(w, rail) {
  const g = new THREE.Group(), c = new THREE.Group(), arches = [], seen = new Set();
  const n = Math.max(3, Math.round(w / 2.6)), e = w / 2 - 0.6, step = (2 * e) / n, ph = F - 1;
  const on = (a, t) => [Math.sin(a) * e + Math.cos(a) * t, Math.cos(a) * e - Math.sin(a) * t];
  for (const a of [0, Math.PI / 2, -Math.PI / 2]) {
    for (let i = 0; i <= n; i++) {
      const t = -e + i * step, [x, z] = on(a, t), key = `${x.toFixed(2)},${z.toFixed(2)}`;
      if (!seen.has(key)) c.add(at(carvedPillar(ph, STONE), x, 0, z));
      seen.add(key);
      if (i === n) continue;
      const tm = t + step / 2, [bx, bz] = on(a, tm);
      arches.push([bx, ph, bz, a]);
      if (rail) c.add(onFace(at(railing(step - 0.95, 1, 0.2, STONE, 2), 0, 0, 0), a, e, tm));
    }
    c.add(onFace(at(chhajja(w + 2.2, 1.1, 0.45, 0.14, STONE), 0, F - 0.2, 0), a, w / 2 - 0.1));
  }
  c.add(placeAll(cuspedArchGeo(step - 0.9, 1.5), arches, STONE));
  g.add(box(w - 3, F, w - 3, SHADE), box(w - 0.2, 1, w - 0.2, STONE, 0, ph, 0), mergeByMaterial(c));
  return g;
}

export function buildDwarkadhish() {
  const g = new THREE.Group(), f = new THREE.Group(), R = rng(31);
  g.add(f);
  // The ground of the town, the paved ghat along the river and the Gomti, running south-west to
  // the sea.
  g.add(box(170, 0.2, 300, PAVE, -15, 0, 0), box(34, 0.4, 260, M.path, 53, 0, 0), sheet(180, 700, M.river, 158, 0.14, 0));
  // The mound: a walled terrace 72 × 92, the temple court on top.
  f.add(box(72, T, 92, SHADE, 0, 0, 2));

  // The sanctum's tower, seven floors in all: five storeys of wall beside the hall's five, drawing
  // in a little at the fourth, then the spire with a ring of half-spires on its faces and a
  // smaller ring on its corners, to the amalaka and the kalash at about 78 m.
  const tw = at(new THREE.Group(), 0, Y0, TOWER_Z);
  tw.add(box(TOWER_W, 3 * F, TOWER_W, STONE), box(TOWER_W - 0.8, 2 * F, TOWER_W - 0.8, STONE, 0, 3 * F, 0));
  const spire = shikhara(SPIRE_W, SPIRE_H, STONE, spireProfile, 20);
  tw.add(at(spire, 0, 5 * F, 0));
  for (const [n, dist, s, hs, ph] of [[4, 0.5, 0.5, 0.6, 0], [4, 0.7, 0.3, 0.36, Math.PI / 4]]) {
    for (let k = 0; k < n; k++) tw.add(onFace(at(shikhara(SPIRE_W * s, SPIRE_H * hs, STONE, spireProfile, 10), 0, 5 * F, 0), (k / n) * Math.PI * 2 + ph, SPIRE_W * dist));
  }
  f.add(tw);
  f.userData.spireTop = Y0 + 5 * F + spire.userData.top;

  // The Ladwa Mandap before it: five storeys of open pillared galleries, the upper three each
  // standing back from the one below on the front and sides, under a stepped roof.
  const hall = new THREE.Group();
  HALL_W.forEach((w, k) => hall.add(at(gallery(w, k > 0), 0, Y0 + k * F, HALL_BACK + w / 2)));
  const wt = HALL_W[4], zt = HALL_BACK + wt / 2, ry = Y0 + 5 * F;
  const roof = pidaRoof(wt * 0.9, wt * 0.36, 5, 0.8, STONE, SHADE);
  hall.add(box(wt + 0.4, 0.7, wt + 0.4, SHADE, 0, ry, zt), at(roof, 0, ry + 0.7, zt));
  hall.add(at(placeAll(miniSpireGeo(), tierSpires(wt * 0.9, wt * 0.36, 5, 0.8, 0, 1.1), STONE), 0, ry + 0.7, zt));
  hall.add(at(bell(wt * 0.16, STONE), 0, ry + 0.7 + roof.userData.top, zt), at(kalash(wt * 0.11), 0, ry + 0.7 + roof.userData.top + wt * 0.16, zt));
  f.add(hall);
  // The link between hall and tower, and the plinth under both with its stairs: the broad one at
  // the west front, and steps at the hall's two sides towards the Swarga and Moksha gates.
  const front = HALL_BACK + HALL_W[0];
  f.add(box(12, 5 * F, 2, SHADE, 0, Y0, -5.5), box(30, P, 47, SHADE, 0, T, -1.5));
  const ent = new THREE.Group();
  ent.add(at(templeDoorway(2, 3, { m: STONE }), 0, Y0, front - 1.5));
  ent.add(at(templePorch(8, 3.6, 3.6, STONE, SHADE), 0, Y0, front - 0.4));
  ent.add(at(grandStair(P, 8, SHADE, STONE, { cheek: 0.6 }), 0, T, 22));
  for (const s of [-1, 1]) {
    ent.add(onFace(at(templeDoorway(1.6, 2.6, { m: STONE, guardians: false }), 0, Y0, 0), (s * Math.PI) / 2, 10.5, -s * (HALL_BACK + 12)));
    ent.add(at(steps(5, P, 5, SHADE), s * 15, T, HALL_BACK + 12).rotateY((s * Math.PI) / 2));
  }
  f.add(mergeByMaterial(ent));

  // The court's wall on the edge of the mound, open at the two gates: the Swarga Dwar on the south,
  // towards the river, and the Moksha Dwar on the north, towards the bazaar; each a gatehouse under
  // a stepped roof set with small spires.
  const court = at(new THREE.Group(), 0, T, 0);
  for (const s of [-1, 1]) court.add(wallWithGaps('z', 92, 3.6, 1.2, STONE, [[7, 11]], s * 35.4, 2), wallWithGaps('x', 72, 3.6, 1.2, STONE, [], 0, 2 + s * 45.4));
  for (const s of [-1, 1]) {
    const gate = new THREE.Group();
    gate.add(trabeateGate(11, 7.5, 5, 3.4, 5, { m: STONE, trim: SHADE }), box(11.8, 0.5, 5.8, SHADE, 0, 7.5, 0));
    const gr = pidaRoof(10, 4, 4, 0.7, STONE, SHADE);
    gate.add(at(gr, 0, 8, 0), at(placeAll(miniSpireGeo(), tierSpires(10, 4, 4, 0.7, 0, 0.8), STONE), 0, 8, 0), at(kalash(0.8), 0, 8 + gr.userData.top, 0));
    court.add(at(gate, s * 36.5, 0, 7).rotateY((s * Math.PI) / 2));
  }
  f.add(court);
  // The 56 steps of the Swarga Dwar, down the mound to the ghat, between side walls; and a
  // shorter flight from the Moksha Dwar into the town.
  f.add(at(steps(12, T, 56, STONE, 0.33), 39, 0, 7).rotateY(Math.PI / 2));
  for (const s of [-1, 1]) f.add(box(19.5, T + 1, 1, SHADE, 48.7, 0, 7 + s * 6.5));
  f.add(at(steps(9, T, 26, STONE, 0.33), -39, 0, 7).rotateY(-Math.PI / 2));
  for (const s of [-1, 1]) f.add(box(9.6, T + 1, 1, SHADE, -43.8, 0, 7 + s * 5));

  // The lesser shrines of the court: Balarama's (Trivikrama) and Pradyumna's, each with a small
  // hall, and single cells for Kusheshwar Mahadev, Devaki, Radha, Jambavati and the others.
  const small = (w, h, halls, x, z, turn) => {
    const t = nagaraTemple({ w, h, m: STONE, shade: SHADE, plinth: 0.8, urus: 4, halls, apron: 2, base: null, stair: null, friezeSpacing: detail.low ? 2 : 1 });
    f.add(at(t, x, T, z).rotateY(turn));
  };
  small(5.5, 13, [[6.5, 4.2, 3]], -22, -14, 0);
  small(5, 11, [[6, 4, 3]], 23, -30, 0);
  for (const [x, z, turn, w] of [[-26, 30, Math.PI / 2, 3.6], [-26, 40, Math.PI / 2, 3.2], [24, 34, -Math.PI / 2, 3.6], [-10, -36, 0, 3.4], [6, -36, 0, 3], [25, -8, -Math.PI / 2, 3.2]]) small(w, w * 2.1, [], x, z, turn);

  // The town close round the mound (js/parts/realism.js): flat-roofed houses of two to four
  // storeys on the three landward sides, and a row along the ghat either side of the steps,
  // looking over the river.
  const paint = ['#e9dfc8', '#d9c9a8', '#f1e9d8', '#c9d3d6', '#e3c7a8', '#d8b9a0', '#bfcfc0'];
  g.add(cityAround([-36, 36, -44, 48], { rows: detail.low ? 2 : 3, gap: 9, storeys: [2, 4], seed: 31, paint, tanks: 0.4, every: detail.low ? 2 : 1, keep: [[36, 999, -999, 999], [-52, -36, 0, 14]] }));
  const quay = [...houseRow(R, 'z', 44.5, -128, -4, Math.PI / 2, { n: [2, 3], d: [10, 13] }), ...houseRow(R, 'z', 44.5, 18, 128, Math.PI / 2, { n: [2, 3], d: [10, 13] })];
  g.add(townHouses(quay, { seed: 32, paint, tanks: 0.4 }));

  addDetails(f, g);
  // The view from across the Gomti: the hall on the left, the tower and its flag on the right, over
  // the steps of the Swarga Dwar.
  return { group: g, focus: f, view: [1, 0.2, 0.5], zoom: 0.75 };
}

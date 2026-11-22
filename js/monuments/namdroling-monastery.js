import * as THREE from 'three';
import { M, mat, box, cyl, at, hipRoof, TIBETAN } from '../helpers.js';
import { hall, ganjira, roofCorners, dharmaWheel, gyaltsen, quarters, parapetDiscs } from '../parts/tibetan.js';
import { tibetanPortico } from '../parts/doorways.js';
import { mergeByMaterial } from '../parts/components.js';
import { addDetails } from '../details/namdroling-monastery.js';

// The Golden Temple's walls, ochre-yellow and white; its red pillars; the gilded roofs.
export const YELLOW = mat('#e2b046', 0.78);
export const RED = mat('#a3291f', 0.6);
export const GILT = mat('#e7b84a', 0.3, 0.6, { emissive: '#3d2a06' });

// A gilded roof in two tiers: a broad hipped roof over the hall, a clerestory, and an upper hipped
// roof crowned by the ganjira, with gilt tips at every corner. Stands on y = 0, over a hall w x d.
export function goldRoof(w, d, { rise = 5, clere = 4.5, upper = 0.55 } = {}) {
  const g = new THREE.Group(), uw = w * upper, ud = d * upper;
  g.add(hipRoof(w + 3, d + 3, rise, GILT), at(roofCorners(w + 3, d + 3), 0, 0.05, 0));
  g.add(box(uw, clere, ud, YELLOW, 0, rise * 0.7, 0), box(uw + 0.4, 0.9, ud + 0.4, TIBETAN.maroon, 0, rise * 0.7 + clere - 0.9, 0));
  const y = rise * 0.7 + clere;
  g.add(at(hipRoof(uw + 2.4, ud + 2.4, rise * 0.8, GILT), 0, y, 0), at(roofCorners(uw + 2.4, ud + 2.4), 0, y + 0.05, 0));
  g.add(at(ganjira(4.2), 0, y + rise * 0.8 - 0.3, 0));
  for (const x of [-1, 1]) for (const z of [-1, 1]) g.add(at(gyaltsen(2.2), x * uw / 2, y - 0.1, z * ud / 2));
  return g;
}

// Namdroling's Golden Temple, the Padmasambhava Buddhist Vihara at Bylakuppe (1999): a great hall
// about 46 m wide and 36 deep, its ochre walls rising 24 m to a two-tiered gilded roof, about 34 m
// high in all. Its front is a portico of tall red pillars three storeys high, the Dharma wheel over
// it; inside sit gilded statues of the Buddha, Padmasambhava and Amitayus, about 18 m high. To its
// east stands the Zangdog Palri temple, in three diminishing storeys under gilded roofs; monks'
// quarters close the court. +z is the front, facing the court.
export const HW = 46, HD = 36, HH = 24;
function goldenTemple() {
  const g = new THREE.Group();
  g.add(box(HW + 6, 1.6, HD + 6, TIBETAN.white, 0, 0, 0));
  g.add(at(hall(HW, HH, HD, { floors: 4, wall: YELLOW, cap: 1.8, door: 0, doorW: 18, y0: 2.2 }), 0, 1.6, 0));
  g.add(at(goldRoof(HW, HD, { rise: 5.5 }), 0, 1.6 + HH, 0));
  // The front portico: eight red pillars, 18 m high, under three beams and a flat roof, the floors
  // marked by balconies between them; a broad stair up to it.
  const P = new THREE.Group(), pw = 32, pd = 6, ph = 18;
  for (let k = 0; k < 8; k++) { const x = -pw / 2 + 1 + (k * (pw - 2)) / 7; P.add(cyl(0.6, 0.7, ph, RED, x, 0, pd - 0.8, 12), box(1.8, 0.9, 1.8, GILT, x, ph - 0.9, pd - 0.8)); }
  for (const y of [6, 12]) P.add(box(pw, 0.5, pd, YELLOW, 0, y, pd / 2), box(pw, 1, 0.12, GILT, 0, y + 0.5, pd - 0.06));
  P.add(box(pw + 1, 1.4, pd + 1, RED, 0, ph, pd / 2), box(pw + 1.4, 0.8, pd + 1.4, TIBETAN.maroon, 0, ph + 1.4, pd / 2), at(parapetDiscs(pw, 2.4, 0.3), 0, ph + 1.8, pd + 0.72));
  P.add(at(tibetanPortico(14, 3, 7, [5, 6.2]), 0, 0, 0));
  for (let k = 0; k < 8; k++) P.add(box(20, 1.6 * (8 - k) / 8, 0.6, TIBETAN.white, 0, -1.6, pd + 0.3 + k * 0.6));
  g.add(at(P, 0, 1.6, HD / 2));
  g.add(at(dharmaWheel(6.4), 0, 1.6 + HH + 1, HD / 2 + 1.2));
  return g;
}

// Zangdog Palri: three square storeys, each under its own gilded roof, the top one crowned.
function zangdogPalri() {
  const g = new THREE.Group();
  let y = 0;
  for (const [w, h] of [[24, 9], [17, 7], [11, 6]]) {
    g.add(at(hall(w, h, w, { floors: 2, wall: YELLOW, cap: 1, door: y === 0 ? 0 : null, doorW: 4 }), 0, y, 0));
    g.add(at(hipRoof(w + 3, w + 3, 2.8, GILT), 0, y + h, 0), at(roofCorners(w + 3, w + 3), 0, y + h + 0.05, 0));
    y += h + 1.6;
  }
  g.add(at(hipRoof(9, 9, 3.2, GILT), 0, y - 1.6, 0), at(ganjira(3.4), 0, y + 1.2, 0));
  return g;
}

export function buildNamdrolingMonastery() {
  const g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  f.add(goldenTemple());
  f.add(at(zangdogPalri(), 52, 0, 6));
  // Monks' quarters: long white blocks on the west and south of the court.
  f.add(quarters([[-50, 0, 10, 14, 10, 60, Math.PI / 2], [-30, 0, 70, 50, 9, 12, 0], [36, 0, 74, 40, 9, 12, 0]], { seed: 5 }));
  // The court: paved, between the temple and its gate.
  f.add(box(110, 0.2, 54, mat('#cfc9bc', 0.9), 0, 0, 46));
  // The gate into the court, under a gilded roof.
  const gt = new THREE.Group();
  for (const s of [-1, 1]) gt.add(box(4, 8, 4, TIBETAN.white, s * 6, 0, 0), box(4.2, 0.8, 4.2, TIBETAN.maroon, s * 6, 8, 0));
  gt.add(box(16, 2, 4.4, RED, 0, 8, 0), at(hipRoof(18, 7, 2.6, GILT), 0, 10, 0), at(roofCorners(18, 7), 0, 10.05, 0), at(ganjira(1.6), 0, 12.3, 0));
  f.add(mergeByMaterial(at(gt, 0, 0, 74)));
  addDetails(f, g, { HW, HD, HH });
  // From the court, a little to the east: the portico, the gilded roofs and Zangdog Palri.
  return { group: g, focus: f, view: [0.45, 0.26, 1], zoom: 0.62 };
}

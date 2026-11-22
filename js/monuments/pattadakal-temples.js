import * as THREE from 'three';
import { box, at, onFace, shikhara, nagaraProfile } from '../helpers.js';
import { dravidaVimana, dravidaDress, nandiMandapa, trabeateGate, wallWithGaps, carvedPillar } from '../parts/temples.js';
import { templeDoorway, steps } from '../parts/doorways.js';
import { haraRow, shala } from '../parts/sculpture.js';
import { addDetails, STONE as S, SHADE as Sd, TEMPLES } from '../details/pattadakal-temples.js';

// A Dravida temple of the Chalukyas, facing +z: the sanctum (w square, walls h high) under a vimana
// of `tiers` storeys, the vestibule, and a closed hall W wide and D deep with porches on its front
// and sides. Its walls are dressed with pilasters, an eave and a parapet of miniature shrines.
function dravida(w, h, tiers, W, D) {
  const g = new THREE.Group(), hz = w / 2 + 2 + D / 2;
  g.add(box(w, h, w, S), at(dravidaDress(w, w, h, S, { eaveM: Sd }), 0, 0, 0));
  g.add(at(dravidaVimana(w - 1, tiers, w * 0.24, S, Sd, { taper: 0.45, capScale: 0.33, kalashScale: 0.5, kalashM: S }), 0, h + 0.3, 0));
  // The vestibule, with the gable of its tower (sukanasa) against the vimana's front.
  g.add(box(w * 0.5, h - 0.4, 4.2, S, 0, 0, w / 2 + 1.9), at(shala(w * 0.5, w * 0.3, S), 0, h + 0.3, w / 2 + 0.6).rotateY(Math.PI / 2));
  if (!W) { g.add(at(templeDoorway(1.3, 2.6, { m: S, guardianH: 1.3 }), 0, 0.9, w / 2 + 4)); return g; }
  g.add(box(W, h - 0.6, D, S, 0, 0, hz), at(dravidaDress(W, D, h - 0.6, S, { eaveM: Sd }), 0, 0, hz));
  // Porches on the front and the two sides: four pillars, a slab and an eave, steps up.
  const porch = (pw, pd) => {
    const p = new THREE.Group(), ph = h - 1.6;
    p.add(box(pw, 1, pd, Sd, 0, 0, pd / 2));
    for (const x of [-pw / 2 + 0.6, pw / 2 - 0.6]) for (const z of [0.6, pd - 0.6]) p.add(at(carvedPillar(ph, S), x, 1, z));
    p.add(box(pw + 0.6, 0.5, pd + 0.6, Sd, 0, 1 + ph, pd / 2), box(pw, 0.4, pd, S, 0, 1.5 + ph, pd / 2));
    p.add(at(steps(pw - 1.6, 1, 4, Sd), 0, 0, pd), at(templeDoorway(1.5, 2.8, { m: S, guardianH: 1.4 }), 0, 1, 0));
    return p;
  };
  g.add(at(porch(5.4, 4), 0, 0, hz + D / 2));
  for (const s of [-1, 1]) { const p = at(porch(4.4, 3.2), 0, 0, 0); g.add(onFace(p, s * Math.PI / 2, W / 2, hz)); }
  return g;
}

// An early Nagara shrine of the 7th–8th centuries: a square sanctum on a moulded base, its curved
// spire crowned by an amalaka, and a small porch or flat-roofed hall in front.
function nagara(w, h, spireH, hall = 0) {
  const g = new THREE.Group();
  g.add(box(w + 1.4, 1.1, w + 1.4, Sd), box(w, h, w, S, 0, 1.1, 0), box(w + 0.6, 0.4, w + 0.6, Sd, 0, 1.1 + h, 0));
  g.add(at(shikhara(w * 0.95, spireH, S, nagaraProfile, 16, S), 0, 1.5 + h, 0));
  if (hall) {
    g.add(box(hall + 1, 1.1, hall + 2, Sd, 0, 0, w / 2 + hall / 2 + 0.6), box(hall, h - 0.5, hall, S, 0, 1.1, w / 2 + hall / 2 + 0.6));
    g.add(box(hall + 0.8, 0.5, hall + 0.8, Sd, 0, 0.6 + h, w / 2 + hall / 2 + 0.6), box(hall * 0.6, 0.5, hall * 0.6, S, 0, 1.1 + h, w / 2 + hall / 2 + 0.6));
    g.add(at(templeDoorway(1.2, 2.3, { m: S, guardians: false }), 0, 1.1, w / 2 + hall + 0.6));
  } else g.add(at(templeDoorway(1.1, 2.2, { m: S, guardians: false }), 0, 1.1, w / 2));
  return g;
}

// Pattadakal, on the west bank of the Malaprabha, where the Chalukyas of Badami were crowned. The
// temples face east, here +z, towards the river. In the middle the Virupaksha temple (about 745),
// the largest: its sanctum under a three-storeyed Dravida vimana, a hall with porches on three
// sides, a Nandi pavilion before it, all within a walled court with a gateway on the east. To its
// north the Mallikarjuna, its near twin; beyond them, in a line along the old road, the Nagara
// temples with their curved spires: Galaganatha, Kashi Vishwanatha, Jambulinga, Kadasiddheshvara,
// and the Dravida Sangameshvara. South, the Papanatha, a Nagara spire over a long hall.
export function buildPattadakal() {
  const g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  const T = TEMPLES;
  // The Virupaksha: sanctum 10 m square, hall 18 × 16; its court 31.5 × 67.
  const v = at(dravida(10, 7.4, 3, 18, 16), ...T.virupaksha);
  v.add(at(nandiMandapa(6.2, 3.6, S, Sd), 0, 0, 30));
  const cw = 31.5, cd = 67, cz = 8;
  v.add(at(wallWithGaps('x', cw, 3.2, 1.2, Sd, [[0, 6]]), 0, 0, cz + cd / 2), at(wallWithGaps('x', cw, 3.2, 1.2, Sd, [[0, 4]]), 0, 0, cz - cd / 2));
  for (const s of [-1, 1]) v.add(box(1.2, 3.2, cd, Sd, s * cw / 2, 0, cz));
  v.add(at(trabeateGate(10, 5.5, 5, 2.6, 4, { m: S, trim: Sd, guardians: true }), 0, 0, cz + cd / 2));
  v.add(at(shala(8, 4, S), 0, 5.5, cz + cd / 2), at(haraRow(9.4, 0.9, S), 0, 5.5, cz + cd / 2 + 2.1));
  f.add(v);
  f.add(at(dravida(8.6, 6.6, 3, 15, 13), ...T.mallikarjuna));
  f.add(at(dravida(7.4, 6, 2, 0, 0), ...T.sangameshvara));
  f.add(at(nagara(5.4, 4.2, 6.6, 5.2), ...T.galaganatha), at(nagara(5, 4, 6.2, 4.2), ...T.kashi));
  f.add(at(nagara(4, 3.4, 4.8, 3), ...T.jambulinga), at(nagara(3.8, 3.2, 4.6, 0), ...T.kadasiddheshvara));
  f.add(at(nagara(5.8, 4.6, 7, 9), ...T.papanatha));
  addDetails(f, g);
  // From the north-east, across the Mallikarjuna to the Virupaksha's court.
  return { group: g, focus: f, view: [-0.55, 0.4, 1], zoom: 0.5 };
}

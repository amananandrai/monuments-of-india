import * as THREE from 'three';
import { mesh, box, at, onFace } from '../helpers.js';
import { dravidaVimana, dravidaDress, gopuram, wallWithGaps, nandiMandapa, carvedPillar } from '../parts/temples.js';
import { templeDoorway, steps } from '../parts/doorways.js';
import { mergeByMaterial } from '../parts/components.js';
import { carvedWheelGeo, haraRow } from '../parts/sculpture.js';
import { horse, elephant } from '../parts/animals.js';
import { detail } from '../detail.js';
import { addDetails, GRANITE as S, SHADE as Sd, GOPURAM_STONE, DIMS } from '../details/airavatesvara-temple.js';

// The Airavatesvara temple at Darasuram, built under Rajaraja II in the 12th century. It faces
// east (+z). From the west: the sanctum under a vimana of five storeys, 24 m high; the closed
// halls before it (ardha- and maha-mandapa); then the open front hall, the Rajagambhiran
// mandapa, built as a chariot: carved stone wheels on its north and south sides, rearing horses
// and elephants at its front corners, and its stairs rising from the sides. On the axis in front
// stand the Nandi pavilion and the altar, with the musical steps; round them the cloistered
// enclosure wall and, on the east, the inner gopuram.
export function buildAiravatesvara() {
  const g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  const { B, VW, VH, vz, mz, az, aw, ad, AB, AH } = DIMS;
  // The sanctum: a block VW square and VH high (B of it its moulded base), the vimana over it.
  f.add(box(VW, VH, VW, S, 0, 0, vz), at(dravidaDress(VW, VW, VH, S, { eaveM: Sd }), 0, 0, vz));
  const vim = dravidaVimana(VW - 1.2, 5, 2.25, S, Sd, { taper: 0.5, capScale: 0.3, kalashScale: 0.55, kalashM: Sd });
  f.add(at(vim, 0, VH + 0.35, vz));
  // The vestibule and the closed hall, walled, under flat roofs with parapets of shrines.
  f.add(box(7, VH - 1, 5, S, 0, 0, vz + VW / 2 + 2.5), at(dravidaDress(7, 5, VH - 1, S, { eaveM: Sd, hara: false }), 0, 0, vz + VW / 2 + 2.5));
  f.add(box(14, VH - 1, 13, S, 0, 0, mz), at(dravidaDress(14, 13, VH - 1, S, { eaveM: Sd }), 0, 0, mz));
  f.add(at(templeDoorway(1.6, 3, { m: S, guardianH: 1.5 }), 0, AB, mz + 6.5));
  // The front hall, the chariot: a tall moulded platform AB high, rows of carved pillars AH high,
  // the beams and a flat roof.
  const ah = at(new THREE.Group(), 0, 0, az);
  ah.add(box(aw, AB, ad, Sd), box(aw + 0.4, 0.3, ad + 0.4, S, 0, AB - 0.3, 0));
  const cols = new THREE.Group();
  for (let i = 0; i < 5; i++) for (let j = 0; j < 6; j++) {
    const x = -aw / 2 + 1 + (i / 4) * (aw - 2), z = -ad / 2 + 1 + (j / 5) * (ad - 2);
    cols.add(at(carvedPillar(AH, S), x, AB, z));
  }
  ah.add(mergeByMaterial(cols));
  ah.add(box(aw + 1.4, 0.7, ad + 1.4, Sd, 0, AB + AH, 0), box(aw + 0.4, 0.6, ad + 0.4, S, 0, AB + AH + 0.7, 0));
  // Its parapet of miniature shrines.
  for (const a of [0, Math.PI / 2, -Math.PI / 2]) {
    const long = Math.abs(Math.sin(a)) > 0.5;
    ah.add(onFace(at(haraRow((long ? ad : aw) - 0.4, 0.9, S), 0, AB + AH + 1.3, 0), a, (long ? aw : ad) / 2 - 0.25));
  }
  // The chariot's wheels on its two long sides, and its stairs: one up each side, in front of the
  // wheels.
  const wheel = carvedWheelGeo(1.35, { low: detail.low });
  for (const s of [-1, 1]) {
    const w = mesh(wheel, Sd, s * (aw / 2 + 0.02), 1.4, -ad / 2 + 4.5);
    w.rotation.y = s * Math.PI / 2;
    ah.add(w);
    ah.add(onFace(at(steps(2.6, AB, 9, S), 0, 0, 0), s * Math.PI / 2, aw / 2, ad / 2 - 3.2));
  }
  // The horses rearing at the chariot's front corners, the elephants beside them.
  for (const s of [-1, 1]) {
    const h = at(horse(S, { coarse: detail.low }), s * (aw / 2 - 1.3), AB - 1.2, ad / 2 + 1.2);
    h.scale.setScalar(0.5);
    ah.add(box(1.4, AB - 1.2, 3.2, Sd, s * (aw / 2 - 1.3), 0, ad / 2 + 1.4), h);
  }
  for (const s of [-1, 1]) ah.add(at(elephant(S, 0.5, { coarse: true }), s * (aw / 2 + 1.6), 0, ad / 2 - 0.6));
  f.add(ah);
  addDetails(f, g);
  // From the north-east, the chariot hall in front and the vimana behind it.
  return { group: g, focus: f, view: [-0.62, 0.3, 1], zoom: 0.85 };
}

// The enclosure: the inner gopuram on the east, the Nandi pavilion and the altar, and the wall with
// its cloister. Part of the setting, so outside the focus.
export function enclosure(g) {
  const { ez, EW, ED } = DIMS;
  g.add(at(gopuram(15, 9, 21, 3, 11, GOPURAM_STONE), 0, 0, ez));
  g.add(wallWithGaps('x', EW, 5, 1.8, Sd, [[0, 10]], 0, ez), box(EW, 5, 1.8, Sd, 0, 0, ez - ED));
  for (const s of [-1, 1]) g.add(box(1.8, 5, ED, Sd, s * EW / 2, 0, ez - ED / 2));
  // The Nandi pavilion and the altar (balipitha), a few steps down from the court.
  g.add(at(nandiMandapa(5.6, 3.2, S, Sd), 0, 0, ez - 9));
  g.add(box(3.4, 1, 3.4, Sd, 0, 0, ez - 16), box(2.2, 1.2, 2.2, S, 0, 1, ez - 16));
}

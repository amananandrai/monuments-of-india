import * as THREE from 'three';
import { at } from '../helpers.js';
import { mergeByMaterial } from '../parts/components.js';
import { dharmaWheel, gyaltsen, parapetDiscs, maniWheels, chorten } from '../parts/tibetan.js';
import { trees, prayerFlags, along } from '../parts/realism.js';

// Thiksey, finer detail. From photographs: the Dharma wheel and its deer stand over the front of
// the assembly hall's gilded roof, with victory banners at its corners; gilded discs run along its
// ochre parapet. (Its windows, awnings and window bay are in its builder.) Dimensions follow
// js/monuments/thiksey-monastery.js: the summit H = 48, the hall 18 × 9 × 14 at (-4, H - 6, 0).
function architecture(f) {
  const d = new THREE.Group(), H = 48;
  d.add(at(dharmaWheel(4), -4, H + 3, 7.6));
  for (const x of [-13.4, 5.4]) for (const z of [-7.4, 7.4]) d.add(at(gyaltsen(1.8), x, H + 3, z));
  d.add(at(parapetDiscs(17.6, 1.8, 0.2), -4, H + 2.2, 7.2));
  mergeByMaterial(d);
  f.add(d);
}

// Thiksey above the Indus: strings of prayer flags from the top of the hill down over the
// monastery, a row of whitewashed chortens at the foot of the hill, and the poplars and willows
// that grow along the river.
export function addDetails(f, g) {
  architecture(f);
  const H = 48;
  for (let k = 0; k < 6; k++) { const a = Math.PI * 0.2 + k * 0.13; f.add(prayerFlags([-4, H + 8, 0], [Math.cos(a) * 40, H * (1 - 40 / 62) + 4, Math.sin(a) * 40], { sag: 2.5, size: 0.6 })); }
  along(7, [-30, 66], [30, 66]).forEach(([x, z]) => g.add(at(chorten(1.2), x, 0, z)));
  // A gallery of prayer wheels along the path in front of the chortens.
  f.add(at(maniWheels(52, { back: true }), 0, 0, 74));
  g.add(trees(along(10, [100, -170], [100, 170]), { kind: 'poplar', seed: 4, h: 12 }), trees(along(8, [140, -160], [140, 160]), { kind: 'willow', seed: 5, h: 9 }));
}

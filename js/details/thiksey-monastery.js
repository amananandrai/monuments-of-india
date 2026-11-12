import * as THREE from 'three';
import { mat, cyl, at, hemi, box } from '../helpers.js';
import { mergeByMaterial } from './components.js';
import { dharmaWheel, gyaltsen, shabkhep, parapetDiscs } from './tibetan.js';
import { trees, prayerFlags, along } from './realism.js';

// Thiksey, finer detail. From photographs: the Dharma wheel and its deer stand over the front of
// the assembly hall's gilded roof, with victory banners at its corners; gilded discs run along its
// ochre parapet; and its windows are hung with pleated awnings. Dimensions follow
// js/monuments/thiksey-monastery.js: the summit H = 48, the hall 18 × 9 × 14 at (-4, H - 6, 0).
function architecture(f) {
  const d = new THREE.Group(), H = 48;
  d.add(at(dharmaWheel(4), -4, H + 3, 7.6));
  for (const x of [-13.4, 5.4]) for (const z of [-7.4, 7.4]) d.add(at(gyaltsen(1.8), x, H + 3, z));
  for (let fl = 0; fl < 2; fl++) for (let k = 0; k < 5; k++) d.add(at(shabkhep(1.1), -4 - 9 + (k + 0.5) * (18 / 5), H - 6 + 0.8 + fl * 3.6 + 1.55, 7.1));
  d.add(at(parapetDiscs(17.6, 1.8, 0.2), -4, H + 2.2, 7.16));
  mergeByMaterial(d);
  f.add(d);
}

// Thiksey above the Indus: strings of prayer flags from the top of the hill down over the
// monastery, a row of whitewashed chortens at the foot of the hill, and the poplars and willows
// that grow along the river.
const WHITE = mat('#efece4', 0.85);
function chorten(s) {
  const g = new THREE.Group();
  g.add(box(3 * s, 1.2 * s, 3 * s, WHITE), box(2.4 * s, 0.8 * s, 2.4 * s, WHITE, 0, 1.2 * s), at(hemi(1.1 * s, WHITE, 16), 0, 2 * s, 0), cyl(0.25 * s, 0.4 * s, 1.6 * s, mat('#b8862a', 0.4, 0.6), 0, 3 * s, 0, 8));
  return g;
}
export function addDetails(f, g) {
  architecture(f);
  const H = 48;
  for (let k = 0; k < 6; k++) { const a = Math.PI * 0.2 + k * 0.13; f.add(prayerFlags([-4, H + 8, 0], [Math.cos(a) * 40, H * (1 - 40 / 62) + 4, Math.sin(a) * 40], { sag: 2.5, size: 0.6 })); }
  along(7, [-30, 66], [30, 66]).forEach(([x, z]) => g.add(at(chorten(1.2), x, 0, z)));
  g.add(trees(along(10, [100, -170], [100, 170]), { kind: 'poplar', seed: 4, h: 12 }), trees(along(8, [140, -160], [140, 160]), { kind: 'willow', seed: 5, h: 9 }));
}

import * as THREE from 'three';
import { mat, cyl, at, hemi, box, onFace, FACES, TIBETAN } from '../helpers.js';
import { mergeByMaterial } from './components.js';
import { dharmaWheel, gyaltsen, shabkhep, parapetDiscs } from './tibetan.js';
import { prayerFlags } from './realism.js';
import { yaks } from './animals.js';
import { HILL_H, HILL_R } from '../monuments/key-monastery.js';

// Key Monastery, finer detail. From photographs: the gilded roof of the top hall carries the Dharma
// wheel between two deer over its front and a victory banner (gyaltsen) at each corner; gilded discs
// are set along its maroon parapet; and its windows are hung with pleated awnings.
// Dimensions follow js/monuments/key-monastery.js: the hall 10 square from H - 4 to H + 2 (H = HILL_H).
function architecture(f) {
  const d = new THREE.Group(), H = HILL_H;
  d.add(at(dharmaWheel(4.2), 0, H + 2.7, 4.6));
  for (const x of [-4.9, 4.9]) for (const z of [-4.9, 4.9]) d.add(at(gyaltsen(1.8), x, H + 2.7, z));
  for (const a of FACES) {
    d.add(onFace(at(parapetDiscs(9.6, 1.6, 0.18), 0, H + 2.35, 0), a, 5.16));
    for (const l of a === 0 ? [-3, 3] : [-2.4, 2.4]) {
      d.add(onFace(at(new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.5, 0.2), TIBETAN.window), 0, H - 1.25, 0), a, 5, l));
      d.add(onFace(at(shabkhep(1.1), 0, H - 0.4, 0), a, 5.05, l));
    }
  }
  mergeByMaterial(d);
  f.add(d);
}

// Key Monastery in Spiti: strings of prayer flags running from the top hall down the hill,
// whitewashed chortens at the foot of the hill, and yaks grazing on the scree below.
const WHITE = mat('#efece4', 0.85);
function chorten(s) {
  const g = new THREE.Group();
  g.add(box(3 * s, 1.2 * s, 3 * s, WHITE), box(2.4 * s, 0.8 * s, 2.4 * s, WHITE, 0, 1.2 * s), at(hemi(1.1 * s, WHITE, 16), 0, 2 * s, 0));
  g.add(cyl(0.25 * s, 0.4 * s, 1.6 * s, mat('#b8862a', 0.4, 0.6), 0, 3 * s, 0, 8));
  return g;
}
export function addDetails(f, g) {
  architecture(f);
  const H = HILL_H, r = HILL_R * 0.66;
  // From the roof of the top hall down to poles part-way down the hill, clear of its slope
  for (let k = 0; k < 8; k++) { const a = (k / 8) * Math.PI * 2 + 0.2; f.add(prayerFlags([0, H + 6, 0], [Math.cos(a) * r, H * (1 - r / HILL_R) + 4, Math.sin(a) * r], { sag: 2, size: 0.6 })); }
  for (const [x, z] of [[-34, 58], [-25, 64], [-16, 68], [23, 64]]) g.add(at(chorten(1.4), x, 0, z));
  g.add(yaks([[66, 76, 0.4], [74, 68, 1.2], [-76, 86, -0.6]]));
}

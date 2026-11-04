import * as THREE from 'three';
import { mat, cyl, at, hemi, box } from '../helpers.js';
import { people, MONKS, prayerFlags, around } from './realism.js';
import { yaks } from './animals.js';

// Key Monastery in Spiti: strings of prayer flags running from the top hall down the hill, monks
// on the paths between the buildings, whitewashed chortens at the foot of the hill, and yaks
// grazing on the scree below.
const WHITE = mat('#efece4', 0.85);
function chorten(s) {
  const g = new THREE.Group();
  g.add(box(3 * s, 1.2 * s, 3 * s, WHITE), box(2.4 * s, 0.8 * s, 2.4 * s, WHITE, 0, 1.2 * s), at(hemi(1.1 * s, WHITE, 16), 0, 2 * s, 0));
  g.add(cyl(0.25 * s, 0.4 * s, 1.6 * s, mat('#b8862a', 0.4, 0.6), 0, 3 * s, 0, 8));
  return g;
}
export function addDetails(f, g) {
  const H = 40;
  // From the roof of the top hall down to poles part-way down the hill, clear of its slope
  for (let k = 0; k < 8; k++) { const a = (k / 8) * Math.PI * 2 + 0.2; f.add(prayerFlags([0, H + 6, 0], [Math.cos(a) * 32, H * (1 - 32 / 48) + 4, Math.sin(a) * 32], { sag: 2, size: 0.6 })); }
  const path = [];
  for (let tier = 0; tier < 6; tier++) { const y = 14 + tier * 4.2, r = 48 * (1 - y / H) + 6; around(4, r, 0, 0, tier).forEach(([x, z]) => path.push([x, z, 40 * (1 - Math.hypot(x, z) / 48) + 0.3])); }
  f.add(people(path, { seed: 3, palette: MONKS }));
  for (const [x, z] of [[-30, 50], [-22, 56], [-14, 60], [20, 56]]) g.add(at(chorten(1.4), x, 0, z));
  g.add(yaks([[60, 70, 0.4], [68, 62, 1.2], [-70, 80, -0.6]]));
}

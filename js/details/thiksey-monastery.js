import * as THREE from 'three';
import { mat, cyl, at, hemi, box } from '../helpers.js';
import { trees, people, MONKS, prayerFlags, around, along } from './realism.js';

// Thiksey above the Indus: strings of prayer flags from the top of the hill down over the
// monastery, monks on the paths between its buildings, a row of whitewashed chortens at the foot of
// the hill, and the poplars and willows that grow along the river.
const WHITE = mat('#efece4', 0.85);
function chorten(s) {
  const g = new THREE.Group();
  g.add(box(3 * s, 1.2 * s, 3 * s, WHITE), box(2.4 * s, 0.8 * s, 2.4 * s, WHITE, 0, 1.2 * s), at(hemi(1.1 * s, WHITE, 16), 0, 2 * s, 0), cyl(0.25 * s, 0.4 * s, 1.6 * s, mat('#b8862a', 0.4, 0.6), 0, 3 * s, 0, 8));
  return g;
}
export function addDetails(f, g) {
  const H = 48;
  for (let k = 0; k < 6; k++) { const a = Math.PI * 0.2 + k * 0.13; f.add(prayerFlags([-4, H + 8, 0], [Math.cos(a) * 40, H * (1 - 40 / 62) + 4, Math.sin(a) * 40], { sag: 2.5, size: 0.6 })); }
  const path = [];
  for (let tier = 0; tier < 7; tier++) { const y = tier * 6, r = 56 * (1 - y / H) - 9; around(3, r, 0, 0, Math.PI * 0.3 + tier).forEach(([x, z]) => { if (z > 0) path.push([x, z, H * (1 - Math.hypot(x, z) / 62) + 0.3]); }); }
  f.add(people(path, { seed: 3, palette: MONKS }));
  along(7, [-30, 66], [30, 66]).forEach(([x, z]) => g.add(at(chorten(1.2), x, 0, z)));
  g.add(trees([...along(14, [100, -180], [100, 180]), ...along(14, [140, -180], [140, 180])], { kind: 'ashoka', seed: 4, h: 14 }));
}

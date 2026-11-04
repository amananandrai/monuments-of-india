import * as THREE from 'three';
import { M, mat, cyl, box, at } from '../helpers.js';
import { mergeByMaterial } from './components.js';
import { dharmaWheel, shabkhep, parapetDiscs } from './tibetan.js';
import { prayerFlags, copies } from './realism.js';

// Rumtek, finer detail. From photographs: the Dharma wheel and its two deer stand over the front
// of the gilded roof; gilded discs are set along the maroon parapet bands; and each window of the
// main hall's front is hung with a pleated awning in red, blue and green.
// Dimensions follow js/monuments/rumtek-monastery.js: the hall 28 × 14 × 22 at z = -12 (its front
// at z = -1), three floors of windows; the upper storey's roof eave at y 19, z -5.
function architecture(f) {
  const d = new THREE.Group();
  d.add(at(dharmaWheel(4.6), 0, 19.6, -5.6));
  const n = Math.floor(28 / 3.4);
  for (let fl = 0; fl < 3; fl++) for (let k = 0; k < n; k++) {
    const x = -14 + (k + 0.5) * (28 / n), y = 0.8 + fl * ((14 * 0.8) / 3);
    if (fl === 0 && Math.abs(x) < 7) continue;
    d.add(at(shabkhep(1.1), x, y + 1.55, -0.9));
  }
  d.add(at(parapetDiscs(27.6, 2.2, 0.22), 0, 13.2, -0.84), at(parapetDiscs(18, 2, 0.2), 0, 18.6, -6.78));
  mergeByMaterial(d);
  f.add(d);
}

// Rumtek, seat of the Karmapa: rows of prayer wheels along the courtyard walls, tall darchor poles
// with long vertical prayer flags round the court, and strings of flags from the main temple.
export function addDetails(f, g) {
  architecture(f);
  const wheels = [];
  for (const s of [-1, 1]) for (let k = -12; k <= 12; k++) wheels.push([k * 2.2, 0.8, s * 28.6, 1, 0], [s * 28.6, 0.8, k * 2.2, 1, Math.PI / 2]);
  const geo = new THREE.CylinderGeometry(0.35, 0.35, 0.9, 12).translate(0, 0.45, 0);
  f.add(copies(geo, M.gild, wheels.filter(([x, , z]) => Math.abs(x) > 4 || z < 0)));
  for (const [x, z] of [[-22, 22], [22, 22], [-22, -2], [22, -2]]) {
    f.add(cyl(0.12, 0.15, 12, mat('#8a6a3a', 0.8), x, 0, z, 6), box(0.05, 7, 1.2, mat('#f2f2f2', 0.9, 0, { side: 2 }), x, 4.6, z + 0.65));
  }
  for (const [a, b] of [[[0, 24, -14], [-26, 3, 26]], [[0, 24, -14], [26, 3, 26]], [[-14, 14, -20], [-26, 3, -26]], [[14, 14, -20], [26, 3, -26]]]) f.add(prayerFlags(a, b, { sag: 2.5, size: 0.5 }));
}

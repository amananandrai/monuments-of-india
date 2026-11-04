import * as THREE from 'three';
import { M, mat, cyl, box } from '../helpers.js';
import { prayerFlags, copies } from './realism.js';

// Rumtek, seat of the Karmapa: rows of prayer wheels along the courtyard walls, tall darchor poles
// with long vertical prayer flags round the court, and strings of flags from the main temple.
export function addDetails(f, g) {
  const wheels = [];
  for (const s of [-1, 1]) for (let k = -12; k <= 12; k++) wheels.push([k * 2.2, 0.8, s * 28.6, 1, 0], [s * 28.6, 0.8, k * 2.2, 1, Math.PI / 2]);
  const geo = new THREE.CylinderGeometry(0.35, 0.35, 0.9, 12).translate(0, 0.45, 0);
  f.add(copies(geo, M.gild, wheels.filter(([x, , z]) => Math.abs(x) > 4 || z < 0)));
  for (const [x, z] of [[-22, 22], [22, 22], [-22, -2], [22, -2]]) {
    f.add(cyl(0.12, 0.15, 12, mat('#8a6a3a', 0.8), x, 0, z, 6), box(0.05, 7, 1.2, mat('#f2f2f2', 0.9, 0, { side: 2 }), x, 4.6, z + 0.65));
  }
  for (const [a, b] of [[[0, 24, -14], [-26, 3, 26]], [[0, 24, -14], [26, 3, 26]], [[-14, 14, -20], [-26, 3, -26]], [[14, 14, -20], [26, 3, -26]]]) f.add(prayerFlags(a, b, { sag: 2.5, size: 0.5 }));
}

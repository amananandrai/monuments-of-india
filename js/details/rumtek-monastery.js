import * as THREE from 'three';
import { M, mat, cyl, box, at, hipRoof, tibetanBlock, TIBETAN, lathe } from '../helpers.js';
import { mergeByMaterial } from './components.js';
import { dharmaWheel, shabkhep, parapetDiscs } from './tibetan.js';
import { prayerFlags, copies } from './realism.js';

// Rumtek, finer detail. From photographs: the Dharma wheel and its two deer stand over the front
// of the gilded roof; gilded discs are set along the maroon parapet bands; and each window of the
// main hall's front is hung with a pleated awning in red, blue and green.
// A gatehouse under a gilded roof rises over the way in through the south range; a tall stone
// pillar stands in the court before the hall; and on the terrace behind stand the Karma Shri
// Nalanda Institute, four storeys under its own gilded roof, and the hall of the Golden Stupa.
// Dimensions follow js/monuments/rumtek-monastery.js: the hall 28 × 14 × 22 at z = -12 (its front
// at z = -1), three floors of windows; the upper storey's roof eave at y 19, z -5.
const GILT_ = mat('#e7b84a', 0.32, 0.55, { emissive: '#3d2a06' }), RED_ = mat('#9a2b22', 0.7), STONE_ = mat('#b9b2a6', 0.9), TERRACE = mat('#c9c2b4', 0.9);
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
  // The gatehouse over the entrance in the south range (the range 6 deep at z = 32, 7 high).
  d.add(box(11, 10.5, 7.4, TIBETAN.white, 0, 0, 32), box(11.4, 0.9, 7.8, TIBETAN.maroon, 0, 9.6, 32), at(hipRoof(13.5, 9.6, 2.4, GILT_), 0, 10.5, 32));
  for (const z of [35.72, 28.28]) d.add(box(3.4, 4.4, 0.08, M.recess, 0, 0.4, z), box(4.2, 0.5, 0.3, RED_, 0, 4.8, z), box(1.2, 1.5, 0.08, TIBETAN.window, -3.2, 6.2, z), box(1.2, 1.5, 0.08, TIBETAN.window, 3.2, 6.2, z));
  d.add(at(parapetDiscs(10.6, 1.8, 0.2), 0, 10.05, 35.94));
  // The pillar in the court.
  d.add(box(2.4, 0.5, 2.4, STONE_, 0, 0.4, 16), box(1.7, 0.4, 1.7, STONE_, 0, 0.9, 16), cyl(0.38, 0.46, 6.2, STONE_, 0, 1.3, 16, 12), box(1.1, 0.35, 1.1, STONE_, 0, 7.5, 16), at(lathe([[0.3, 0], [0.45, 0.3], [0.2, 0.7], [0, 0.9]], M.gild, 12), 0, 7.85, 16));
  mergeByMaterial(d);
  f.add(d);
  // Behind the court, on a terrace 5 m up the hill, beside the framed group: the Nalanda
  // Institute and, to its west, the hall of the Golden Stupa.
  const s = new THREE.Group();
  s.add(box(96, 5, 34, TERRACE, 0, 0, -62), at(tibetanBlock(44, 15, 16, 4), 10, 5, -62), box(16, 3.4, 10, TIBETAN.white, 10, 20, -62), box(16.4, 0.6, 10.4, TIBETAN.maroon, 10, 22.8, -62), at(hipRoof(19, 13, 3, GILT_), 10, 23.4, -62));
  s.add(at(tibetanBlock(14, 9, 12, 2), -30, 5, -60), at(hipRoof(16, 14, 2.6, GILT_), -30, 14, -60), cyl(0.3, 0.8, 2.2, GILT_, -30, 16.4, -60, 10));
  for (let k = 0; k < 10; k++) s.add(box(10, 0.5 * (10 - k), 0.7, TERRACE, 10, 0, -44.6 + k * 0.7));
  f.parent.add(s);
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

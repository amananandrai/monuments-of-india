import * as THREE from 'three';
import { mat, cyl, at } from '../helpers.js';
import { jharokha, merlonGeo, placeAll, aroundCircle, beltCourse, mergeByMaterial } from './components.js';
import { towerDetail } from './forts.js';
import { trees, scatter } from './realism.js';
import { camels as camelHerd } from './animals.js';

// Jaisalmer, finer detail. Each of the 99 bastions has a moulded course below its crown and a ring
// of merlons on top; the gate's towers are banded and slit; and the palace front over the town is
// hung with tiers of jharokhas under curved bangla roofs, as on the havelis of the golden city.
// Dimensions follow js/monuments/jaisalmer-fort.js.
const GOLD = mat('#d9a85a', 0.85), GOLD_DARK = mat('#b8873f', 0.9);
function architecture(f) {
  const d = new THREE.Group(), H = 22, RX = 92, RZ = 54, mg = merlonGeo(0.9, 1.1, 0.5), list = [];
  for (let k = 0; k < 99; k++) {
    if (k >= 24 && k <= 26) continue;
    const a = (k / 99) * Math.PI * 2, x = Math.cos(a) * RX, z = Math.sin(a) * RZ, top = H + 13 + (k % 3) * 0.25;
    d.add(cyl(4.15, 4.15, 0.45, GOLD_DARK, x, H + 9.5, z, 12));
    for (const [px, py, pz, ry] of aroundCircle(3.55, 9, top, k * 0.3)) list.push([x + px, py, z + pz, ry]);
  }
  d.add(placeAll(mg, list, GOLD));
  for (const s of [-1, 1]) d.add(at(towerDetail(3.67, 3.4, 14, GOLD, GOLD_DARK, { seg: 12, courses: [], slits: [0.3, 0.7] }), s * 7.53, H, RZ + 1.96));
  // The palace (30 × 20 × 16 at (-20, H, 10)): three tiers of jharokhas on its front and a course
  // between each.
  for (let r = 0; r < 3; r++) {
    for (let k = 0; k < 6; k++) d.add(at(jharokha(2.2, 2.8, GOLD, { d: 1.1, trim: GOLD_DARK }), -20 - 12.5 + k * 5, H + 5 + r * 5, 18.02));
    d.add(beltCourse(30, 16, H + 4 + r * 5, 0.35, 0.18, GOLD_DARK).translateX(-20).translateZ(10));
  }
  mergeByMaterial(d);
  f.add(d);
}

// Jaisalmer, the golden fort of the Thar: camels in their saddle cloths on the sand below the hill,
// and khejri and kair trees dotting the desert.
export function addDetails(f, g) {
  architecture(f);
  g.add(camelHerd([[60, 110, -2.2], [66, 116, -2.0], [-80, 96, 1.1], [-74, 104, 1.3], [120, 40, -1.5], [-130, 30, 0.6]]));
  g.add(trees(scatter(40, [-290, 290, -290, 290], { seed: 3, gap: 22 }).filter(([x, z]) => Math.hypot(x / 125, z / 75) > 1.1), { kind: 'mango', seed: 3, h: 6 }));
}

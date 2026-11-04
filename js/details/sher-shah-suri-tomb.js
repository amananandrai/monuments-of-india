import * as THREE from 'three';
import { M, mat, box, cyl, at, onFace, FACES } from '../helpers.js';
import { merlonGeo, placeAll, alongFace, archRing, archSlab, frieze, petalRing, bracketGeo, mergeByMaterial } from './components.js';
import { trees, boats, asiBoard, scatter } from './realism.js';

// Sher Shah Suri's Tomb, finer detail. From photographs: a carved frieze runs under the cornice of
// each octagonal storey, which is carried on brackets and crested with merlons; the faces of the
// stepped platform are opened in blind arcades and its edge is crested too; and the dome rises from
// a moulded ring to a lotus at its crown. Dimensions follow js/monuments/sher-shah-suri-tomb.js.
const STONE = mat('#c39a6e', 0.88), SHADE_ = mat('#a27b52', 0.9);
function architecture(f) {
  const d = new THREE.Group(), mg = merlonGeo(1, 1.2, 0.5);
  for (const [r, h, y0] of [[22, 13, 8], [17, 7, 21]]) {
    const ap = r * Math.cos(Math.PI / 8), side = 2 * r * Math.sin(Math.PI / 8), list = [], br = [];
    for (let k = 0; k < 8; k++) {
      const a = (k / 8) * Math.PI * 2;
      d.add(onFace(box(side * 0.98, 0.7, 0.05, frieze(STONE), 0, y0 + h - 1.6, 0), a, ap + 0.01));
      for (const p of alongFace(a, ap - 0.4, side * 0.92, Math.floor(side / 1.6), y0 + h)) list.push(p);
      for (const p of alongFace(a, ap, side * 0.9, Math.floor(side / 2.2), y0 + h - 0.8)) br.push(p);
    }
    d.add(placeAll(mg, list, STONE), placeAll(bracketGeo(0.9, 0.5, 0.3), br, SHADE_));
  }
  // The platform: blind arcades on the upper stage's faces (66 square, y 4 to 8), merlons on both
  // stages' edges.
  const list = [];
  for (const a of FACES) {
    for (let k = 0; k < 14; k++) {
      const lat = -33 + 2.2 + k * (61.6 / 13);
      if (a === 0 && Math.abs(lat) < 5) continue;
      d.add(onFace(at(archSlab(2.2, 3, true, M.recess, 0.03), 0, 4.4, 0), a, 33, lat), onFace(at(archRing(2.2, 3, true, 0.2, 0.08, SHADE_), 0, 4.4, 0), a, 33, lat));
    }
    for (const p of alongFace(a, 39.6, 78, 40, 4)) list.push(p);
  }
  d.add(placeAll(merlonGeo(0.9, 1, 0.5), list, SHADE_));
  d.add(cyl(14.3, 14.3, 0.5, SHADE_, 0, 30.6, 0, 40));
  d.add(at(petalRing(1.9, 14, 2, 1.0, 0.55, STONE), 0, 44.4, 0));
  mergeByMaterial(d);
  f.add(d);
}

// Sher Shah Suri's tomb at Sasaram, in the middle of its lake: a few boats on the water, the ghats
// and trees round the shore, and the ASI board.
export function addDetails(f, g) {
  architecture(f);
  g.add(boats([[-60, 50, 0.4], [70, -40, 2.1], [-40, -70, 1.3]], { y: 0.3, size: 1.6 }));
  const shore = scatter(60, [-128, 128, -128, 128], { seed: 5, gap: 12 }).filter(([x, z]) => Math.max(Math.abs(x), Math.abs(z)) > 104);
  g.add(trees(shore, { kind: 'mango', seed: 5 }));
  g.add(asiBoard("Sher Shah Suri's Tomb", 8, 104, 0));
}

import * as THREE from 'three';
import { M, mat, box, cyl, at, onFace, lathe, surface } from '../helpers.js';
import { bracketGeo, placeAll, aroundCircle, windowFrame, frieze, railing, mergeByMaterial } from './components.js';
import { trees, lampPosts, scatter, along, around } from './realism.js';

// Shaheed Minar, finer detail. From photographs: the two balconies near the top rest on rings of
// brackets; the cupola's drum opens in arched windows; and a carved band runs round the top of the
// Egyptian-style base, under the flaring cavetto cornice of an Egyptian pylon, and a doorway in a
// battered frame opens in each face of it; the shaft stands on a moulded foot and is ringed by
// bands; steps climb to the plinth on all four sides inside an iron railing. Dimensions follow js/monuments/shaheed-minar.js: the shaft r 3 to 2.4 from
// 9.2 to 39.2, balconies at 39 and 43, the cupola's drum r 2.2 from 44.6.
const IRON = surface(mat('#2f2c2a', 0.5, 0.4), 'none');
const STONE = mat('#e6dcc8', 0.85), SHADE = mat('#c8bba1', 0.9);
function architecture(f) {
  const d = new THREE.Group();
  for (const y of [39, 43]) d.add(placeAll(bracketGeo(0.9, 1, 0.3), aroundCircle(2.45, 14, y), SHADE));
  for (let k = 0; k < 6; k++) d.add(onFace(at(windowFrame(0.7, 1.8, SHADE, { shape: 'pointed', frame: 0.12 }), 0, 45, 0), (k / 6) * Math.PI * 2, 2.25));
  // The base (a four-sided pylon, 6.4 out at y 2 tapering to 5.6 at 8, on a plinth 16 square and
  // 2 high): a carved band and a cavetto cornice at its head, and a doorway in each face.
  const cornice = lathe([[5.45, 0], [5.5, 0.5], [5.9, 1.0], [6.3, 1.15], [6.3, 1.4], [0, 1.4]], STONE, 4);
  cornice.rotation.y = Math.PI / 4;
  d.add(at(cornice, 0, 7.6, 0));
  for (let k = 0; k < 4; k++) {
    const a = (k / 4) * Math.PI * 2, ap = Math.SQRT1_2;
    d.add(onFace(box(7.2, 0.7, 0.08, frieze(STONE), 0, 6.6, 0), a, 5.74 * ap + 0.02));
    d.add(onFace(box(2.6, 3.9, 0.3, SHADE, 0, 2, 0), a, 6.25 * ap), onFace(box(1.5, 3, 0.08, M.recess, 0, 2, 0), a, 6.25 * ap + 0.14), onFace(box(3.1, 0.45, 0.6, STONE, 0, 5.9, 0), a, 6.1 * ap));
    // Steps up to the plinth, and the railing round it either side of them.
    for (let s = 0; s < 4; s++) d.add(onFace(box(6, 0.5, 0.6, SHADE, 0, s * 0.5, 0), a, 9.9 - s * 0.6));
    for (const sx of [-1, 1]) d.add(onFace(at(railing(4.6, 1.1, 0.1, IRON, 1.5, IRON), 0, 2, 0), a, 7.8, sx * 5.5));
  }
  // The shaft's moulded foot and the bands round it.
  d.add(cyl(3.3, 3.7, 0.9, SHADE, 0, 9.2, 0, 32), cyl(3.15, 3.3, 0.5, STONE, 0, 10.1, 0, 32));
  for (const y of [18, 28, 37.6]) d.add(cyl(3.12 - ((y - 9.2) / 30) * 0.6, 3.12 - ((y - 9.2) / 30) * 0.6, 0.45, SHADE, 0, y, 0, 32));
  mergeByMaterial(d);
  f.add(d);
}

// The Shaheed Minar on Kolkata's Maidan: the old trees of the Maidan, and lamps round the paved
// square at its foot.
export function addDetails(f, g) {
  architecture(f);
  g.add(trees([...along(14, [-195, -105], [195, -105]), ...along(14, [-195, 185], [195, 185]), ...scatter(16, [-190, 190, -100, 180], { seed: 5, gap: 30, avoid: [[-60, 60, -60, 60]] })], { kind: 'banyan', seed: 5 }));
  g.add(lampPosts(around(12, 30, 0, 0, 0.26)));
}

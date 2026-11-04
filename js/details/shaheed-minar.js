import * as THREE from 'three';
import { mat, at, onFace } from '../helpers.js';
import { bracketGeo, placeAll, aroundCircle, windowFrame, mergeByMaterial } from './components.js';
import { trees, lampPosts, scatter, along, around } from './realism.js';

// Shaheed Minar, finer detail. From photographs: the two balconies near the top rest on rings of
// brackets; the cupola's drum opens in arched windows; and a carved band runs round the top of the
// Egyptian-style base. Dimensions follow js/monuments/shaheed-minar.js: the shaft r 3 to 2.4 from
// 9.2 to 39.2, balconies at 39 and 43, the cupola's drum r 2.2 from 44.6.
const STONE = mat('#e6dcc8', 0.85), SHADE = mat('#c8bba1', 0.9);
function architecture(f) {
  const d = new THREE.Group();
  for (const y of [39, 43]) d.add(placeAll(bracketGeo(0.9, 1, 0.3), aroundCircle(2.45, 14, y), SHADE));
  for (let k = 0; k < 6; k++) d.add(onFace(at(windowFrame(0.7, 1.8, SHADE, { shape: 'pointed', frame: 0.12 }), 0, 45, 0), (k / 6) * Math.PI * 2, 2.25));
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

import * as THREE from 'three';
import { mat, box, at, onFace, FACES } from '../helpers.js';
import { clockFace, rosette, merlons, petalRing, jharokha, windowFrame, mergeByMaterial } from './components.js';
import { trees, shrubs, lampPosts, fountains, scatter, along } from './realism.js';

// Laxmi Vilas Palace, finer detail. From photographs: the clock tower has a dial on each face and
// arched windows and balconies (jharokhas) up its shaft; stucco rosettes sit over the piers of the
// arcaded wings, which are crested with merlons between the guldastas; and the domes of the end
// pavilions rise from a cup of lotus petals. Dimensions follow js/monuments/laxmi-vilas-palace.js:
// the main wing 200 × 16 with its front at z = 13; the tower 14 square at z = 22.
const OCHRE = mat('#c2774f', 0.85), CREAM = mat('#eadfc6', 0.85);
function architecture(f) {
  const d = new THREE.Group(), tw = at(new THREE.Group(), 0, 0, 22);
  for (const a of FACES) {
    tw.add(onFace(at(clockFace(3.0, 10, 10), 0, 37, 0), a, a === 0 ? 7.42 : 7.02));
    for (const y of [12, 19.5]) tw.add(onFace(at(windowFrame(2, 4.4, CREAM, { frame: 0.3 }), 0, y, 0), a, 7.01));
    tw.add(onFace(at(jharokha(2.6, 2.6, OCHRE, { d: 1.1, trim: CREAM, roof: 'dome' }), 0, 25.6, 0), a, 7.02));
  }
  d.add(tw);
  // The main wing's arcade: 40 bays of 5; rosettes over the piers of the upper storey.
  for (let k = 1; k < 40; k++) if (Math.abs(-100 + k * 5) > 24) d.add(at(rosette(0.45, CREAM, 8), -100 + k * 5, 14.8, 13.02));
  for (const [x0, x1] of [[-100, -23], [23, 100]]) d.add(at(merlons(x1 - x0 - 1, 0.6, 0.8, 0.3, OCHRE, 0.7), (x0 + x1) / 2, 16.9, 12.6));
  for (const x of [-100, 100]) d.add(at(petalRing(6.4 * 0.86, 20, 3.4, 2.2, 0.55, CREAM, 0.3), x, 23.1, 0));
  mergeByMaterial(d);
  f.add(d);
}

// Laxmi Vilas Palace at Vadodara: the long drive to the porch lined with palms and lamps, the
// fountain on the forecourt lawn, flower beds, and the great trees of the 700-acre grounds.
export function addDetails(f, g) {
  architecture(f);
  g.add(trees([...along(9, [-12, 40], [-12, 160]), ...along(9, [12, 40], [12, 160])], { kind: 'palm', seed: 3 }));
  g.add(lampPosts([...along(8, [-8.5, 40], [-8.5, 160]), ...along(8, [8.5, 40], [8.5, 160])]));
  g.add(fountains([[-40, 60], [40, 60]], { h: 3 }), shrubs([...scatter(14, [-70, -18, 40, 90], { seed: 4, gap: 5 }), ...scatter(14, [18, 70, 40, 90], { seed: 5, gap: 5 })].map(([x, z]) => [x, z, 1.6]), { flowers: '#d0306f', seed: 4 }));
  g.add(trees(scatter(40, [-195, 195, -100, 185], { seed: 6, gap: 18, avoid: [[-115, 115, -25, 40], [-20, 20, 30, 170], [-75, 75, 35, 95]] }), { kind: 'banyan', seed: 6 }));
}

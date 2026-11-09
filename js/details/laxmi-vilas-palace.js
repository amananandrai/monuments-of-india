import * as THREE from 'three';
import { M, mat, at, onFace, FACES } from '../helpers.js';
import { clockFace, petalRing, jharokha, windowFrame, mughalChhatri, mergeByMaterial } from './components.js';
import { DURBAR, TOWER, EAST } from '../monuments/laxmi-vilas-palace.js';
import { trees, shrubs, lampPosts, fountains, scatter, along } from './realism.js';

// Laxmi Vilas Palace, finer detail. From photographs: the clock tower has a dial on each face and
// arched windows and balconies (jharokhas) up its shaft; the domes rise from a cup of lotus petals;
// and the Durbar Hall and the east tower are hung with tiers of jharokhas. (The wings' rosettes,
// merlons and guldastas are built with them in js/monuments/laxmi-vilas-palace.js.) Dimensions
// follow that file: the tower 14 square at TOWER, the Durbar Hall 30 × 24 × 36 at DURBAR (front at
// z + 18), the east tower 18 square and 34 high at EAST (front at z + 9).
const OCHRE = mat('#c2774f', 0.85), CREAM = mat('#eadfc6', 0.85);
function architecture(f) {
  const d = new THREE.Group(), tw = at(new THREE.Group(), TOWER[0], 0, TOWER[1]);
  for (const a of FACES) {
    tw.add(onFace(at(clockFace(3.0, 10, 10), 0, 37, 0), a, a === 0 ? 7.42 : 7.02));
    for (const y of [12, 19.5]) tw.add(onFace(at(windowFrame(2, 4.4, CREAM, { frame: 0.3 }), 0, y, 0), a, 7.01));
    tw.add(onFace(at(jharokha(2.6, 2.6, OCHRE, { d: 1.1, trim: CREAM, roof: 'dome' }), 0, 25.6, 0), a, 7.02));
  }
  d.add(tw);
  d.add(at(petalRing(9.6 * 0.86, 24, 3.4, 2.2, 0.55, CREAM, 0.3), DURBAR[0], 30.1, DURBAR[1]), at(petalRing(5 * 0.86, 16, 2.6, 1.8, 0.5, CREAM, 0.3), -60, 21, 4));
  // Jharokhas: three tiers on the Durbar Hall's front and ends, and two on each face of the east
  // tower above the wing.
  for (const x of [-9, 0, 9]) for (const y of [5.5, 11.5, 17.5]) d.add(at(jharokha(2.6, 3, OCHRE, { d: 1.1, trim: CREAM, roof: x ? 'bangla' : 'dome' }), DURBAR[0] + x, y, DURBAR[1] + 18.02));
  for (const a of FACES) for (const y of [21.5, 27.5]) {
    const o = onFace(at(jharokha(2.4, 3, OCHRE, { d: 1, trim: CREAM, roof: 'bangla' }), 0, y, 0), a, 9.02);
    o.position.x += EAST[0]; o.position.z += EAST[1];
    d.add(o);
  }
  for (const x of [-84, -72, -44, -28, 30, 52]) d.add(at(mughalChhatri(1.5, 5, CREAM, { finialM: M.gild }), x, x > 14 ? 19.9 : 16.9, -4));
  mergeByMaterial(d);
  f.add(d);
}

// Laxmi Vilas Palace at Vadodara: the long drive to the porch lined with palms and lamps, the
// fountain on the forecourt lawn, flower beds, and the great trees of the 700-acre grounds.
export function addDetails(f, g) {
  architecture(f);
  g.add(trees([...along(9, [-18, 40], [-18, 160]), ...along(9, [6, 40], [6, 160])], { kind: 'palm', seed: 3 }));
  g.add(lampPosts([...along(8, [-14.5, 40], [-14.5, 160]), ...along(8, [2.5, 40], [2.5, 160])]));
  g.add(fountains([[-40, 60], [40, 60]], { h: 3 }), shrubs([...scatter(14, [-70, -18, 40, 90], { seed: 4, gap: 5 }), ...scatter(14, [18, 70, 40, 90], { seed: 5, gap: 5 })].map(([x, z]) => [x, z, 1.6]), { flowers: '#d0306f', seed: 4 }));
  g.add(trees(scatter(40, [-195, 195, -100, 185], { seed: 6, gap: 18, avoid: [[-135, 100, -72, 40], [-26, 14, 30, 170], [-75, 75, 35, 95]] }), { kind: 'banyan', seed: 6 }));
}

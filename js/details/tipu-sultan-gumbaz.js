import * as THREE from 'three';
import { M, mat, box, at, onFace, FACES, aroundRect } from '../helpers.js';
import { chhajja, railing, petalRing, windowFrame, archRing, jali, mergeByMaterial } from './components.js';
import { doorLeaves, interior } from './doorways.js';
import { shrubs, lampPosts, asiBoard, scatter, along } from './realism.js';

// Tipu Sultan's Gumbaz, finer detail. From photographs: the polished black granite pillars of the
// verandah stand on moulded bases under square capitals, with a cusped arch between each pair;
// a deep eave runs round the roof under a balustrade; the tomb's walls open in a door (its famous
// ivory-inlaid leaves) and screened windows; the dome rises from a cup of lotus petals.
// Dimensions follow js/monuments/tipu-sultan-gumbaz.js.
const WHITE = mat('#efebe2', 0.8), GRANITE = mat('#3e3b39', 0.7), IVORY = mat('#6b4a33', 0.6);
function architecture(f) {
  const d = new THREE.Group(), pts = aroundRect(28, 28, 3.1);
  for (const [x, z] of pts) d.add(box(1.4, 0.5, 1.4, GRANITE, x, 2, z), box(1.4, 0.45, 1.4, GRANITE, x, 11.55, z));
  // A cusped arch between neighbouring pillars along each side (pillars 3.1 apart from -14).
  for (const a of FACES) for (let k = 0; k < 9; k++) {
    const lat = -14 + 1.55 + k * 3.1;
    if (lat > 13.5) continue;
    d.add(onFace(at(archRing(2.05, 9.4, true, 0.18, 0.2, WHITE, false), 0, 2, 0), a, 14 - 0.1, lat));
  }
  for (const a of FACES) {
    d.add(onFace(at(chhajja(31.6, 1.4, 0.55, 0.14, WHITE), 0, 12.8, 0), a, 15.4));
    d.add(onFace(at(railing(30, 1, 0.24, WHITE, 2), 0, 12.8, 0), a, 15.1));
    if (a === 0) continue;
    for (const lat of [-5, 5]) d.add(onFace(at(windowFrame(1.6, 3.2, WHITE, { screen: jali(WHITE) }), 0, 4.6, 0), a, 10, lat));
  }
  // The door on the front (+z) face, its dark leaves standing open.
  d.add(at(interior(2.58, 4.38, 0.15, 0.1), 0, 2, 10.04), at(windowFrame(2.6, 4.4, WHITE, { shape: 'flat', back: M.recess }), 0, 2, 10));
  d.add(at(doorLeaves(2.6, 4.3, { open: 1.2, m: IVORY }), 0, 2.02, 10.1));
  d.add(at(petalRing(7.6, 24, 3.2, 2, 0.6, WHITE), 0, 12.8, 0));
  mergeByMaterial(d);
  f.add(d);
}

// The Gumbaz at Srirangapatna, Tipu Sultan's mausoleum: flower beds along the cypress avenue,
// lamps, and the ASI board.
export function addDetails(f, g) {
  architecture(f);
  g.add(shrubs([...along(10, [-6.5, 20], [-6.5, 82]), ...along(10, [6.5, 20], [6.5, 82])].map(([x, z]) => [x, z, 1.3]), { flowers: '#d0306f', seed: 3 }));
  g.add(shrubs(scatter(30, [-80, 80, -80, 80], { seed: 4, gap: 8, avoid: [[-22, 22, -22, 22], [-14, 14, 15, 90]] }).map(([x, z]) => [x, z, 2.2]), { seed: 4 }));
  g.add(lampPosts([...along(5, [-13, 25], [-13, 80]), ...along(5, [13, 25], [13, 80])]));
  g.add(asiBoard('Gumbaz, Srirangapatna', 8, 86, 0));
}

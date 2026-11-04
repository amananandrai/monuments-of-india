import * as THREE from 'three';
import { mat, box, at, surface } from '../helpers.js';
import { fishPair, rosette, merlons, petalRing, mergeByMaterial } from './components.js';
import { trees, shrubs, lampPosts, asiBoard, fountains, scatter, along } from './realism.js';

// The Chota Imambara, finer detail. From photographs: the black band along the front is lettered
// in white Arabic calligraphy; rosettes fill the spandrels of its arcade; a parapet of merlons runs
// between the small guldastas; the gateway's arch carries the pair of fish of Awadh; the ribbed
// dome stands in a ring of lotus petals. Dimensions follow js/monuments/chota-imambara.js.
const WHITE = mat('#f1ede6', 0.8), SHADE = mat('#d9d2c6', 0.85), INSCRIPTION = surface(mat('#2c2724', 0.5), 'script');
function architecture(f) {
  const d = new THREE.Group();
  d.add(box(44.2, 0.9, 0.03, INSCRIPTION, 0, 10.9, -7.76));
  // A rosette over each pier between the seven arches (5.8 apart).
  for (let k = 0; k < 6; k++) d.add(at(rosette(0.5, SHADE, 8), -14.5 + k * 5.8, 1.2 + 7.2, -7.98));
  d.add(at(merlons(44, 0.6, 0.8, 0.25, WHITE, 0.6), 0, 13.8, -8.3));
  d.add(at(fishPair(2.8, SHADE), -3.4, 9.2, 77.42), at(fishPair(2.8, SHADE), 3.4, 9.2, 77.42));
  d.add(at(petalRing(6.4, 24, 3, 1.9, 0.55, WHITE), 0, 16.8, -18));
  mergeByMaterial(d);
  f.add(d);
}

// The Chota Imambara at Lucknow, the "palace of lights": fountains in the long water channel, the
// rows of lamps that line it, and hedges and shade trees in the garden.
export function addDetails(f, g) {
  architecture(f);
  f.add(fountains(along(7, [0, 2], [0, 60]), { y: 0.5, h: 1.6 }));
  f.add(lampPosts([...along(8, [-7, 0], [-7, 64]), ...along(8, [7, 0], [7, 64])], { h: 3.6 }));
  f.add(shrubs([...along(10, [-12, 4], [-12, 60]), ...along(10, [12, 4], [12, 60])].map(([x, z]) => [x, z, 1]), { seed: 3 }));
  g.add(trees(scatter(18, [-75, 75, -60, 120], { seed: 4, gap: 14, avoid: [[-28, 28, -34, 80], [-40, 40, 8, 28]] }), { kind: 'neem', seed: 4 }));
  g.add(asiBoard('Chota Imambara', 10, 82, 0));
}

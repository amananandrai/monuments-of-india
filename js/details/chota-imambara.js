import * as THREE from 'three';
import { M, mat, box, cyl, at, onFace, surface, onionDome, finial, guldasta } from '../helpers.js';
import { fishPair, rosette, merlons, petalRing, windowFrame, jali, mergeByMaterial } from './components.js';
import { trees, shrubs, lampPosts, asiBoard, fountains, scatter, along } from './realism.js';

// The Chota Imambara, finer detail. From photographs: the black band along the front is lettered
// in white Arabic calligraphy; rosettes fill the spandrels of its arcade; a parapet of merlons runs
// between the small guldastas; the gateway's arch carries the pair of fish of Awadh; the ribbed
// dome stands in a ring of lotus petals. The hall's sides and back are lit by arched windows
// screened in jali under the same parapet; and the mosque stands on the west of the forecourt, an
// arcaded front under three domes between two slender minarets. Dimensions follow js/monuments/chota-imambara.js.
const WHITE = mat('#f1ede6', 0.8), SHADE = mat('#d9d2c6', 0.85), INSCRIPTION = surface(mat('#2c2724', 0.5), 'script');
function architecture(f) {
  const d = new THREE.Group();
  d.add(box(44.2, 0.9, 0.03, INSCRIPTION, 0, 10.9, -7.76));
  // A rosette over each pier between the seven arches (5.8 apart).
  for (let k = 0; k < 6; k++) d.add(at(rosette(0.5, SHADE, 8), -14.5 + k * 5.8, 1.2 + 7.2, -7.98));
  d.add(at(merlons(44, 0.6, 0.8, 0.25, WHITE, 0.6), 0, 13.8, -8.3));
  d.add(at(fishPair(2.8, SHADE), -3.4, 9.2, 77.42), at(fishPair(2.8, SHADE), 3.4, 9.2, 77.42));
  d.add(at(petalRing(6.4, 24, 3, 1.9, 0.55, WHITE), 0, 16.8, -18));
  // The hall (44 × 18.8 from y = 1.2, centred on z = -18.6): windows on its sides and back.
  const hall = at(new THREE.Group(), 0, 1.2, -18.6);
  for (const [a, len, dist] of [[Math.PI / 2, 18.8, 22], [-Math.PI / 2, 18.8, 22], [Math.PI, 44, 9.4]]) {
    const n = Math.round(len / 6.2);
    for (let k = 0; k < n; k++) hall.add(onFace(at(windowFrame(2.2, 5.4, SHADE, { screen: jali(WHITE) }), 0, 1.6, 0), a, dist + 0.01, -len / 2 + (k + 0.5) * (len / n)));
    hall.add(onFace(at(merlons(len - 0.6, 0.6, 0.8, 0.25, WHITE, 0.6), 0, 12.6, 0), a, dist - 0.3));
  }
  d.add(hall);
  // The mosque, west of the channel, facing it: 22 × 8 × 12 on a plinth.
  const mq = at(new THREE.Group(), -46, 0, 46);
  mq.rotation.y = Math.PI / 2;
  mq.add(box(26, 0.8, 16, SHADE), box(22, 8, 12, WHITE, 0, 0.8, -1), box(22.6, 0.5, 12.6, SHADE, 0, 8.8, -1));
  for (let k = -2; k <= 2; k++) mq.add(at(windowFrame(2.6, 5.4, SHADE), k * 4.2, 1.2, 5.01));
  for (const [x, r] of [[-7, 2.2], [0, 2.9], [7, 2.2]]) mq.add(cyl(r, r, 1, WHITE, x, 9.3, -1, 20), at(onionDome(r, WHITE), x, 10.3, -1), at(finial(r * 0.8), x, 10.3 + r * 1.8, -1));
  for (const x of [-12, 12]) mq.add(at(guldasta(17, 0.7, WHITE), x, 0.8, 5));
  mq.add(at(merlons(21.4, 0.5, 0.7, 0.25, WHITE, 0.6), 0, 9.3, 4.7));
  d.add(mq);
  mergeByMaterial(d);
  f.add(d);
}

// The Chota Imambara at Lucknow, the "palace of lights": fountains in the court basin, the
// rows of lamps that line it, and hedges and shade trees in the garden.
export function addDetails(f, g) {
  architecture(f);
  f.add(fountains(along(3, [0, 10], [0, 26]), { y: 0.5, h: 1.6 }));
  f.add(lampPosts([...along(8, [-7, 0], [-7, 64]), ...along(8, [7, 0], [7, 64])], { h: 3.6 }));
  f.add(shrubs([...along(10, [-12, 4], [-12, 60]), ...along(10, [12, 4], [12, 60])].map(([x, z]) => [x, z, 1]), { seed: 3 }));
  g.add(trees(scatter(18, [-75, 75, -60, 120], { seed: 4, gap: 14, avoid: [[-28, 28, -34, 80], [-40, 40, 8, 28]] }), { kind: 'neem', seed: 4 }));
  g.add(asiBoard('Chota Imambara', 10, 82, 0));
}

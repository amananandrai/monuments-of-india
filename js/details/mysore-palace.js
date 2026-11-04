import * as THREE from 'three';
import { M, mat, at, onFace, FACES } from '../helpers.js';
import { rosette, chhajja, merlons, petalRing, bracketGeo, placeAll, alongFace, jharokha, mergeByMaterial } from './components.js';
import { trees, shrubs, lampPosts, scatter, along } from './realism.js';
import { rideElephant } from './animals.js';

// Mysore Palace, finer detail. From photographs: carved rosettes fill the spandrels of the great
// arcade; a sloping eave on brackets runs over it, and a crest of merlons along the roof; the
// upper storeys of the central tower have balconies (jharokhas) on their sides; the gilded dome
// and the rose domes of the side towers rise from cups of lotus petals. Dimensions follow
// js/monuments/mysore-palace.js: base b = 1, the arcade front at z = 23, the tower at z = 18.
function architecture(f) {
  const d = new THREE.Group(), b = 1, S = M.mysore, L = M.lime;
  for (const x of [-25, -15, 15, 25]) d.add(at(rosette(0.7, L, 10), x, b + 9.6, 23.02));
  for (const [x0, x1] of [[-28.8, -8.6], [8.6, 28.8]]) {
    const c = (x0 + x1) / 2, len = x1 - x0;
    d.add(at(chhajja(len, 1.3, 0.5, 0.14, L), c, b + 16, 23));
    d.add(placeAll(bracketGeo(1, 1.1, 0.3), alongFace(0, 23, len - 1, Math.round(len / 3), b + 15.9).map(([x, y, z, r]) => [x + c, y, z, r]), L));
  }
  for (const a of FACES) {
    const long = Math.abs(Math.sin(a)) < 0.5;
    d.add(onFace(at(merlons(long ? 76 : 46, 0.7, 0.9, 0.3, S, 0.5), 0, b + 16.8, 0), a, (long ? 47 : 77) / 2 - 0.3));
  }
  for (let i = 3; i < 5; i++) for (const s of [-1, 1]) {
    const o = onFace(at(jharokha(2.2, 2.6, S, { d: 0.9, trim: L, roofM: M.mysoreRose }), 0, b + i * 6.2 + 0.6, 0), s * Math.PI / 2, 8.5, 0);
    o.position.z += 18 + 4.5;
    d.add(o);
  }
  d.add(at(petalRing(6.5 * 0.86, 22, 2.6, 1.8, 0.55, M.gild, 0.3), 0, b + 33, 18));
  for (const s of [-1, 1]) d.add(at(petalRing(4.2 * 0.86, 16, 2.4, 1.6, 0.55, M.mysoreRose, 0.3), s * 34, b + 23.5, 19));
  mergeByMaterial(d);
  f.add(d);
}

// The Mysore Palace at Dasara: the caparisoned elephants of the procession on the forecourt lawn,
// one under the golden howdah, palms and flower beds, and lamps along the drive.
export function addDetails(f, g) {
  architecture(f);
  [[-24, 55, '#b3262e', '#e3b54a'], [-12, 58, '#2f5d9a', '#e3b54a'], [12, 58, '#2f7a3f', '#e3b54a'], [24, 55, '#7a1f5a', '#e3b54a']].forEach(([x, z, c, t], i) => {
    const e = rideElephant(mat('#6a605a', 0.9), 1, { cloth: c, trim: t, howdah: i === 1 });
    e.position.set(x, 0.15, z);
    e.rotation.y = Math.PI;
    g.add(e);
  });
  g.add(trees([...along(6, [-75, 35], [-75, 112]), ...along(6, [75, 35], [75, 112])], { kind: 'palm', seed: 4 }));
  g.add(shrubs(scatter(20, [-60, 60, 70, 110], { seed: 5, gap: 5, avoid: [[-8, 8, 30, 120]] }).map(([x, z]) => [x, z, 1.4]), { flowers: '#f08a1c', seed: 5 }));
  g.add(lampPosts([...along(6, [-8, 32], [-8, 112]), ...along(6, [8, 32], [8, 112])]));
}

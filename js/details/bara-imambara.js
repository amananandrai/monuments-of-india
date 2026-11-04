import * as THREE from 'three';
import { mat, at, onFace, FACES, M, box } from '../helpers.js';
import { fishPair, rosette, merlons, windowFrame, chhajja, bracketGeo, placeAll, aroundCircle, mergeByMaterial } from './components.js';
import { trees, shrubs, lampPosts, asiBoard, fountains, scatter, along } from './realism.js';

// The Bara Imambara, finer detail. From photographs: stucco rosettes in the spandrels between the
// arches of the long front; a crenellated parapet of merlons between the guldastas; the pair of
// fish of the Nawabs of Awadh carved over the gateway's arch; arched openings and eaves on the
// domed kiosks over the roof (the Bhool Bhulaiya); brackets under the Asfi Mosque's minaret
// balconies. Dimensions follow js/monuments/bara-imambara.js.
const LIME = mat('#e6d8b8', 0.85), LIME_DARK = mat('#cbb994', 0.85);
function architecture(f) {
  const d = new THREE.Group();
  // The great hall's range (82 × 17, front at z = 3, from y = 1.2).
  for (let k = 1; k < 12; k++) d.add(at(rosette(0.55, LIME_DARK, 8), -41 + k * (82 / 12), 1.2 + 6.9, 3.01));
  d.add(at(merlons(81, 0.8, 1, 0.3, LIME, 0.6), 0, 1.2 + 17.8, 2.75));
  // The gateway (front at z = 67, its iwan 9 wide).
  d.add(at(fishPair(3.4, LIME_DARK), -3.6, 11.4, 68.62), at(fishPair(3.4, LIME_DARK), 3.6, 11.4, 68.62));
  d.add(at(merlons(39, 0.7, 0.9, 0.3, LIME, 0.6), 0, 15.8, 66.75));
  // The roof kiosks (12 × 4 × 10 at (x, 19, -12)).
  for (const x of [-22, 0, 22]) {
    const t = at(new THREE.Group(), x, 19, -12);
    for (const a of FACES) {
      const long = Math.abs(Math.sin(a)) < 0.5;
      for (const l of long ? [-3.5, 0, 3.5] : [-2.5, 2.5]) t.add(onFace(at(windowFrame(1.4, 2.6, LIME_DARK, { frame: 0.15 }), 0, 0.4, 0), a, long ? 5 : 6, l));
      t.add(onFace(at(chhajja(long ? 12.6 : 10.6, 0.8, 0.3, 0.1, LIME_DARK), 0, 4, 0), a, long ? 5 : 6));
    }
    d.add(t);
  }
  // The Asfi Mosque's minarets: the mosque is turned a quarter round to stand at (-78, 0, 24), its
  // minarets at (±20, 3, 8) in its own frame.
  const m = at(new THREE.Group(), -78, 0, 24);
  m.rotation.y = Math.PI / 2;
  for (const x of [-20, 20]) for (let i = 1; i <= 3; i++) {
    const y = 3 + 32 * 0.04 + ((32 * 0.8 - 32 * 0.04) * i) / 3, rt = 1.6 * (1 - 0.14 * i / 3);
    m.add(placeAll(bracketGeo(0.7, rt * 0.5, 0.18), aroundCircle(rt, 10, y - 0.45).map(([px, py, pz, ry]) => [px + x, py, pz + 8, ry]), LIME));
  }
  d.add(m);
  mergeByMaterial(d);
  f.add(d);
}

// The Bara Imambara at Lucknow: the forecourt garden between the gateway and the imambara, with
// lawns, hedges and a fountain, the trees of the outer garden, and lamps along the approach.
export function addDetails(f, g) {
  architecture(f);
  for (const x of [-1, 1]) g.add(box(24, 0.3, 36, M.grass, x * 22, 0, 34));
  g.add(fountains([[0, 34]], { h: 2.4 }), shrubs([...along(9, [-34, 17], [-34, 51]), ...along(9, [34, 17], [34, 51])].map(([x, z]) => [x, z, 1]), { y: 0.3 }));
  g.add(trees(scatter(20, [-110, 110, -80, 140], { seed: 3, gap: 14, avoid: [[-50, 50, -32, 72], [-100, -56, -2, 50], [-10, 10, 70, 120]] }), { kind: 'neem', seed: 3 }));
  g.add(trees([...along(5, [-12, 75], [-12, 108]), ...along(5, [12, 75], [12, 108])], { kind: 'ashoka', seed: 4 }));
  g.add(lampPosts([...along(5, [-8, 72], [-8, 110]), ...along(5, [8, 72], [8, 110])]));
  g.add(asiBoard('Bara Imambara', 10, 112, 0));
}

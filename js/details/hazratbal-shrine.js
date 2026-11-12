import * as THREE from 'three';
import { M, at, onFace, FACES } from '../helpers.js';
import { rosette, chhajja, archRing, petalRing, bracketGeo, placeAll, aroundCircle, mergeByMaterial } from './components.js';
import { trees, lampPosts, boats, houseboats, along } from './realism.js';

// Hazratbal, finer detail. From photographs: carved rosettes between the arches of the marble
// hall; a sloping eave round its top; a ring of blind arches round the drum and a lotus round the
// dome's finial; the minaret's balconies on rings of brackets. Dimensions follow
// js/monuments/hazratbal-shrine.js: base b = 1.2, the hall 40 × 30 and 12 high.
function architecture(f) {
  const d = new THREE.Group(), b = 1.2, Mb = M.marble, Sh = M.marbleShade;
  for (const a of FACES) {
    const wide = a === 0 || a === Math.PI, p = wide ? 5.2 : 3.8, dist = wide ? 15 : 20, len = wide ? 40 : 30;
    for (let k = 0; k < 6; k++) d.add(onFace(at(rosette(0.45, Sh, 8), 0, b + 1.5 + 7.6, 0), a, dist + 0.02, (k - 2.5) * p));
    d.add(onFace(at(chhajja(len + 1.2, 1.2, 0.45, 0.12, Sh), 0, b + 12.8, 0), a, dist + 0.3));
  }
  for (let k = 0; k < 20; k++) d.add(onFace(at(archRing(1.8, 2.8, true, 0.15, 0.08, Sh), 0, b + 13.2, 0), (k / 20) * Math.PI * 2, 10));
  d.add(at(petalRing(1.5, 12, 2, 0.9, 0.55, Mb), 0, b + 16.8 + 18.2, 0));
  const m = at(new THREE.Group(), 24, b, 12);
  for (let i = 1; i <= 3; i++) {
    const y = 34 * 0.04 + ((34 * 0.8 - 34 * 0.04) * i) / 3, rt = 2 * (1 - 0.14 * i / 3);
    m.add(placeAll(bracketGeo(0.8, rt * 0.5, 0.2), aroundCircle(rt, 12, y - 0.56), Sh));
  }
  d.add(m);
  mergeByMaterial(d);
  f.add(d);
}

// Hazratbal on the shore of Dal Lake: shikaras with their canopies out on the water, houseboats
// moored along the far shore, and more chinars along the lakeside promenade with its lamps.
export function addDetails(f, g) {
  architecture(f);
  g.add(boats([[-60, 70, 0.4], [-20, 90, 1.2], [40, 76, -0.6], [90, 110, 2.0], [-120, 130, 0.9], [10, 140, 2.6], [150, 80, 1.5]], { y: 0.4, size: 1.3, canopy: true, colours: ['#8a3a2a', '#5a3d2a', '#2f5d9a', '#8a6a2a'] }));
  g.add(houseboats([[-200, 260, 0.1], [-160, 262, -0.05], [-120, 258, 0.08], [130, 266, 0], [172, 262, -0.1]], { y: 0.4 }));
  g.add(trees([...along(7, [-100, 40], [-30, 42]), ...along(7, [30, 42], [100, 40])], { kind: 'chinar', seed: 3, h: 14 }));
  g.add(lampPosts(along(12, [-105, 44], [105, 44])));
}

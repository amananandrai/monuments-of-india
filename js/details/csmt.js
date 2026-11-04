import * as THREE from 'three';
import { M, mat, box, cyl, at, onFace } from '../helpers.js';
import { railing, jali, clockFace, rosette, mergeByMaterial } from './components.js';
import { trees, lampPosts, along } from './realism.js';

// CSMT, finer detail. From photographs of the terminus: a pierced Gothic parapet runs along the
// eaves of every range, with pinnacles at the corners; carved roundels sit between the windows of
// the central block; a clock is set over the main portal; and the turrets carry a second band and
// slit windows. Dimensions follow js/monuments/csmt.js: the ranges [w, h, d] stand on a 1 m base.
const BAND = mat('#7e7c78', 0.9);
function architecture(f) {
  const d = new THREE.Group();
  // Each range: [x, z, rotY, w, h, d].
  const ranges = [[0, 0, 0, 36, 22, 26], [-33, -5, 0, 30, 16, 16], [33, -5, 0, 30, 16, 16], [-52, 14, -Math.PI / 2, 16, 18, 30], [52, 14, Math.PI / 2, 16, 18, 30]];
  for (const [x, z, ry, w, h, dd] of ranges) {
    const t = at(new THREE.Group(), x, 1, z);
    t.rotation.y = ry;
    t.add(at(railing(w - 0.4, 1.1, 0.22, M.cream, 1.8, jali(M.cream)), 0, h, dd / 2 + 0.05));
    for (const sx of [-1, 1]) t.add(cyl(0.05, 0.42, 3, BAND, sx * (w / 2 - 0.3), h, dd / 2 - 0.1, 8));
    d.add(t);
  }
  for (let k = 0; k < 9; k++) {
    const x = -16.2 + (k + 1) * 3.6 - 1.8;
    for (const y of [8.7, 16]) if (Math.abs(x) > 4 || y > 10) d.add(at(rosette(0.45, BAND, 8), x, 1 + y, 13.02));
  }
  d.add(at(clockFace(1.2, 10, 10), 0, 1 + 19.5, 13.02));
  for (const x of [-18, 18]) for (const z of [-13, 13]) {
    d.add(cyl(1.72, 1.72, 0.5, BAND, x, 1 + 8, z, 8));
    const t = at(new THREE.Group(), x, 0, z);
    for (let k = 0; k < 4; k++) t.add(onFace(box(0.3, 1.4, 0.05, M.recess, 0, 1 + 18, 0), (k / 4) * Math.PI * 2 + Math.PI / 8, 1.5 * Math.cos(Math.PI / 8) + 0.02));
    d.add(t);
  }
  mergeByMaterial(d);
  f.add(d);
}

// Chhatrapati Shivaji Maharaj Terminus: lamps along the forecourt and the road in front, and the
// rain trees along the road.
export function addDetails(f, g) {
  architecture(f);
  g.add(lampPosts([...along(9, [-100, 58], [100, 58]), ...along(9, [-100, 90], [100, 90])], { h: 5 }));
  g.add(trees(along(8, [-100, 95], [100, 95]), { kind: 'banyan', seed: 7, h: 12 }));
}

import * as THREE from 'three';
import { chhajja, bracketGeo, placeAll, alongFace, windowFrame, railing, jali, aroundCircle, mergeByMaterial } from './components.js';
import { M, box, cyl, at, onFace, FACES, tricolour } from '../helpers.js';
import { trees, lampPosts, along } from './realism.js';

// Rashtrapati Bhavan, finer detail. From photographs and descriptions of Lutyens' design:
// - the Delhi Order on the portico columns: a moulded base and a capital hung with bells at its
//   corners;
// - deep chhajjas (sloping eaves) on brackets along the cream upper storey and over the portico;
// - rows of windows in the cream storey and the red base below it, with pierced stone screens
//   (jalis) in the upper ones;
// - the railing band round the foot of the dome, posts and rails as at the Sanchi stupa;
// - a pierced parapet along the roof.
// Dimensions follow js/monuments/rashtrapati-bhavan.js: the red base 196 × 64 and 10 high, the cream
// storey 186 × 58 above it to 22.
function architecture(f) {
  const d = new THREE.Group(), Rd = M.red, Cr = M.cream, Bf = M.buff;
  for (let k = 0; k < 12; k++) {
    const x = -27.5 + k * 5;
    d.add(box(3, 0.6, 3, Cr, x, 10, 38), cyl(1.6, 1.35, 1.0, Bf, x, 21.4, 38, 16), box(3.0, 0.6, 3.0, Bf, x, 22.4, 38));
    for (const [bx, bz] of [[-1.25, -1.25], [1.25, -1.25], [-1.25, 1.25], [1.25, 1.25]]) d.add(cyl(0.12, 0.35, 0.8, Bf, x + bx, 21.6, 38 + bz, 8));
  }
  for (const a of FACES) {
    const long = Math.abs(Math.sin(a)) < 0.5, len = long ? 186 : 58, dist = (long ? 58 : 186) / 2;
    d.add(onFace(at(chhajja(len + 1.4, 2.2, 0.8, 0.18, Bf), 0, 21.5, 0), a, dist));
    d.add(placeAll(bracketGeo(1.2, 2.0, 0.4), alongFace(a, dist, len - 2, Math.round(len / 4), 21.4), Bf));
    d.add(onFace(at(railing(len - 1, 1.3, 0.3, Cr, 3, jali(Cr)), 0, 22.6, 0), a, dist - 0.6));
    const n = Math.floor(len / 6);
    for (let k = 0; k < n; k++) {
      const lat = -len / 2 + (k + 0.5) * (len / n);
      if (a === 0 && Math.abs(lat) < 36) continue;
      d.add(onFace(at(windowFrame(2, 4.2, Cr, { shape: 'flat', screen: jali(Cr) }), 0, 13.6, 0), a, dist + 0.01, lat));
      d.add(onFace(at(windowFrame(1.6, 3, Rd, { shape: 'flat' }), 0, 3.6, 0), a, dist + 5.01 - (long ? 2 : 0), lat));
    }
  }
  d.add(at(chhajja(66, 2, 0.8, 0.18, Bf), 0, 23, 41));
  // The railing band round the dome's foot (r = 15.6, y 27.6 to 29): posts and two rails.
  d.add(placeAll(new THREE.BoxGeometry(0.4, 1.3, 0.3), aroundCircle(15.65, 72, 28.3), Rd));
  for (const y of [27.9, 28.6]) d.add(cyl(15.75, 15.75, 0.22, Rd, 0, y, 0, 72));
  mergeByMaterial(d);
  f.add(d);
}

// Rashtrapati Bhavan: the tricolour on the dome, and lamps and trees along the avenue to the Jaipur
// Column.
export function addDetails(f, g) {
  architecture(f);
  f.add(at(tricolour(10), 0, 45.6, 0));
  g.add(trees([...along(8, [-38, 70], [-38, 200]), ...along(8, [38, 70], [38, 200])], { kind: 'neem', seed: 5 }));
  g.add(lampPosts([...along(8, [-20, 70], [-20, 200]), ...along(8, [20, 70], [20, 200])]));
}

import * as THREE from 'three';
import { M, mat, at, onFace, FACES } from '../helpers.js';
import { archRing, archSlab, arcadeScreen, petalRing, bracketGeo, placeAll, aroundCircle, mergeByMaterial } from './components.js';
import { trees, shrubs, lampPosts, scatter, along } from './realism.js';

// The Qutb Shahi Tombs, finer detail. From photographs: each tomb chamber is faced with two tiers of
// blind arches in moulded rings, crowned by a parapet of small arches; its bulbous dome sits in a
// cup of lotus petals on the drum; the mosque's minarets carry their balconies on brackets.
// Dimensions follow tomb(s) in js/monuments/qutb-shahi-tombs.js: chamber w = 20 s square from 8 s
// to 8 s + 12 s, the dome r = 0.38 w on a drum 2 s high.
const STONE = mat('#a59a86', 0.9), PLASTER = mat('#cfc4ae', 0.85);
function architecture(f) {
  const d = new THREE.Group();
  for (const [x, z, s] of [[0, 0, 1.3], [-60, -20, 1], [56, -24, 1.05], [-40, 50, 0.85], [40, 54, 0.9], [-90, 40, 0.7], [90, 20, 0.75]]) {
    const t = at(new THREE.Group(), x, 0, z), w = 20 * s, h = 12 * s, y0 = 8 * s;
    for (const a of FACES) {
      for (const [y, ah] of [[y0 + 0.6 * s, 5.4 * s], [y0 + 6.6 * s, 4 * s]]) for (const k of [-1, 0, 1]) {
        const aw = (k ? 0.17 : 0.24) * w;
        t.add(onFace(at(archSlab(aw, ah, true, M.recess, 0.03), 0, y, 0), a, w / 2, k * w * 0.3));
        t.add(onFace(at(archRing(aw, ah, true, 0.22 * s, 0.1, STONE), 0, y, 0), a, w / 2, k * w * 0.3));
      }
      t.add(onFace(at(arcadeScreen(w - 0.4, 1.3 * s, 9, 0.6 * s, 0.9 * s, 0.3 * s, PLASTER), 0, y0 + h, 0), a, w / 2 - 0.2 * s));
    }
    const r = 0.38 * w;
    t.add(at(petalRing(r * 0.86, 20, r * 0.6, r * 0.4, 0.55, PLASTER, 0.3), 0, y0 + h + 2 * s + r * 0.02, 0));
    d.add(t);
  }
  // The mosque's minarets (28 high, r = 1.6, at (±20, 0, -63)): brackets under each balcony.
  for (const x of [-20, 20]) for (let i = 1; i <= 3; i++) {
    const y = 28 * 0.04 + ((28 * 0.8 - 28 * 0.04) * i) / 3, rt = 1.6 * (1 - 0.14 * i / 3);
    d.add(placeAll(bracketGeo(0.7, rt * 0.5, 0.18), aroundCircle(rt, 10, y - 0.45).map(([px, py, pz, ry]) => [px + x, py, pz - 63, ry]), PLASTER));
  }
  mergeByMaterial(d);
  f.add(d);
}

// The Qutb Shahi tombs at Hyderabad: the restored heritage park round them, with lawns, hedges,
// neem trees on the lawns, and lamps along the walks.
export function addDetails(f, g) {
  architecture(f);
  g.add(trees(scatter(40, [-125, 125, -105, 105], { seed: 3, gap: 13, avoid: [[-25, 25, -25, 25], [-80, -40, -40, 0], [36, 76, -44, -4], [-58, -22, 32, 68], [22, 58, 36, 72], [-106, -74, 24, 56], [72, 108, 4, 36], [-24, 24, -80, -58]] }), { kind: 'neem', seed: 3 }));
  g.add(shrubs(along(20, [-110, -95], [110, -95]).map(([x, z]) => [x, z, 1.2]), { seed: 4 }));
  g.add(lampPosts([...along(8, [-6, -55], [-6, 100]), ...along(8, [6, -55], [6, 100])]));
}

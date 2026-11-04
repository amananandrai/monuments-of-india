import * as THREE from 'three';
import { M, box, at, onFace, FACES } from '../helpers.js';
import { rosette, windowFrame, mergeByMaterial } from './components.js';
import { balustrade, GLASS } from './colonial.js';
import { trees, shrubs, lampPosts, scatter, along } from './realism.js';

// The Victoria Memorial, finer detail. From photographs: a balustrade runs along the roof of the
// main block between the corner pavilions; each pavilion opens in a tall arched window on its two
// outer faces and is ringed by a balustrade under its cupola; the columns round the drum stand on
// bases and carry capitals; carved roundels are set between the upper windows.
// Dimensions follow js/monuments/victoria-memorial.js: terrace b = 3.5, the block 84 × 56 and 18 high.
function architecture(f) {
  const d = new THREE.Group(), b = 3.5, Mb = M.marble, Sh = M.marbleShade;
  for (const a of FACES) {
    const long = Math.abs(Math.sin(a)) < 0.5, dist = long ? 28 : 42, span = long ? 62 : 34;
    if (a === 0) for (const x of [-22.5, 22.5]) d.add(at(balustrade(17, 1.4, Mb, { t: 0.5 }), x, b + 19.2, 28.6));
    else d.add(onFace(at(balustrade(span - 1, 1.4, Mb, { t: 0.5 }), 0, b + 19.2, 0), a, dist + 0.6));
    for (let k = -2; k <= 2; k++) {
      const lat = (k + 0.5 * Math.sign(k || 1)) * (long ? 9 : 6);
      if (Math.abs(lat) > (long ? 26 : 16) || (a === 0 && Math.abs(lat) < 14)) continue;
      d.add(onFace(at(rosette(0.6, Sh, 10), 0, b + 10.4, 0), a, dist + 0.02, lat));
    }
  }
  for (const x of [-38, 38]) for (const z of [-24, 24]) {
    const t = at(new THREE.Group(), x, b, z);
    for (const a of [Math.atan2(Math.sign(x), 0), Math.atan2(0, Math.sign(z))]) t.add(onFace(at(windowFrame(3.2, 9, Sh, { shape: 'round', back: GLASS, frame: 0.4 }), 0, 4, 0), a, 7.01));
    for (const a of FACES) t.add(onFace(at(balustrade(13, 1, Mb, { t: 0.45 }), 0, 23, 0), a, 7.2));
    d.add(t);
  }
  const top = b + 19.2;
  for (let k = 0; k < 24; k++) {
    const a = (k / 24) * Math.PI * 2, x = Math.cos(a) * 15.6, z = Math.sin(a) * 15.6;
    d.add(box(1.4, 0.45, 1.4, Sh, x, top + 0.05, z), box(1.5, 0.55, 1.5, Sh, x, top + 7.95, z));
  }
  mergeByMaterial(d);
  f.add(d);
}

// The Victoria Memorial at Kolkata: flower beds along the main walk, the trees of the 64-acre
// garden, and lamps along the walk.
export function addDetails(f, g) {
  architecture(f);
  g.add(shrubs([...along(14, [-8, 48], [-8, 160]), ...along(14, [8, 48], [8, 160])].map(([x, z]) => [x, z, 1.2]), { flowers: '#d0306f', seed: 5 }));
  g.add(trees(scatter(40, [-115, 115, -85, 165], { seed: 6, gap: 16, avoid: [[-60, 60, -45, 45], [-36, 36, 60, 160], [-10, 10, 40, 170]] }), { kind: 'banyan', seed: 6 }));
  g.add(lampPosts([...along(8, [-5.5, 44], [-5.5, 165]), ...along(8, [5.5, 44], [5.5, 165])]));
}

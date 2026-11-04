import * as THREE from 'three';
import { M, mat, at, surface } from '../helpers.js';
import { panel, archRing, archSlab, merlons, star, bracketGeo, placeAll, aroundCircle, mergeByMaterial } from './components.js';
import { stalls, along } from './realism.js';

// The Jama Masjid, finer detail. From photographs: over each arch of the prayer hall's front is a
// white marble panel lettered in black; a parapet of merlons runs along the top; the cloisters open
// on the courtyard in a long arcade; marble stars are inlaid on the gateways' faces; the minarets'
// balconies stand on rings of brackets. Dimensions follow js/monuments/jama-masjid.js: platform
// P = 6, the prayer hall's front at z = -29.4.
const LETTERS = surface(mat('#ebe6dc', 0.6), 'script');
function architecture(f) {
  const d = new THREE.Group(), P = 6, Rd = M.red, Mb = M.marble, hz = -40;
  for (const s of [-1, 1]) for (let k = 0; k < 5; k++) d.add(at(panel(4.4, 1.6, 0.18, Mb, LETTERS), s * (14 + k * 5.6), P + 11.1, hz + 12 + 0.01));
  d.add(at(merlons(79, 0.8, 1, 0.3, Rd, 0.5), 0, P + 14, hz + 11.9));
  // Cloister arcades on the courtyard side (inner faces at z = 47 and x = ±47).
  const arcs = [];
  for (let k = 0; k < 19; k++) { const t = -45 + k * 5; if (Math.abs(t) > 13.5) arcs.push([t, 47, Math.PI]); }
  for (const sx of [-1, 1]) for (let k = 0; k < 19; k++) { const t = -45 + k * 5; if (Math.abs(t) > 10) arcs.push([sx * 47, t, -sx * Math.PI / 2]); }
  for (const [x, z, a] of arcs) {
    const o = new THREE.Group();
    o.add(archSlab(3.2, 5.4, true, M.recess, 0.03), archRing(3.2, 5.4, true, 0.2, 0.1, Mb));
    o.position.set(x, P + 0.4, z);
    o.rotation.y = a;
    d.add(o);
  }
  // Stars on the east gate's face either side of its iwan (gate 24 wide, face at z = 58).
  for (const x of [-8.6, 8.6]) for (const y of [P + 4, P + 11]) d.add(at(star(6, 1.1, Mb), x, y, 58.01));
  for (const sx of [-1, 1]) for (const lat of [-6.5, 6.5]) {
    const o = at(star(6, 0.9, Mb), sx * 58.01, P + 8, lat);
    o.rotation.y = sx * Math.PI / 2;
    d.add(o);
  }
  for (const sx of [-1, 1]) for (let i = 1; i <= 3; i++) {
    const y = P + 34 * 0.04 + ((34 * 0.8 - 34 * 0.04) * i) / 3, rt = 2.2 * (1 - 0.14 * i / 3);
    d.add(placeAll(bracketGeo(0.9, rt * 0.5, 0.22), aroundCircle(rt, 12, y - 0.62).map(([px, py, pz, ry]) => [px + sx * 40, py, pz + hz + 12, ry]), Rd));
  }
  mergeByMaterial(d);
  f.add(d);
}

// The Jama Masjid in Old Delhi: the stalls of the bazaar that crowds the foot of its steps.
export function addDetails(f, g) {
  architecture(f);
  g.add(stalls([...along(8, [-80, 80], [-25, 80]).map(([x, z]) => [x, z, 0]), ...along(8, [25, 80], [80, 80]).map(([x, z]) => [x, z, 0])]));
}

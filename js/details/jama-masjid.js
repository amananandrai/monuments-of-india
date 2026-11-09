import * as THREE from 'three';
import { M, mat, at, surface } from '../helpers.js';
import { panel, merlons, star, bracketGeo, placeAll, aroundCircle, mergeByMaterial } from './components.js';
import { stalls, along, cityAround } from './realism.js';

// The Jama Masjid, finer detail. From photographs: over each arch of the prayer hall's front is a
// white marble panel lettered in black; a parapet of merlons runs along the top (the cloisters' open
// arcades are in js/monuments/jama-masjid.js); marble stars are inlaid on the gateways' faces; the minarets'
// balconies stand on rings of brackets. Dimensions follow js/monuments/jama-masjid.js: platform
// P = 6, the prayer hall's front at z = -29.4.
const LETTERS = surface(mat('#ebe6dc', 0.6), 'script');
function architecture(f) {
  const d = new THREE.Group(), P = 6, Rd = M.red, Mb = M.marble, hz = -40;
  for (const s of [-1, 1]) for (let k = 0; k < 5; k++) d.add(at(panel(4.4, 1.6, 0.18, Mb, LETTERS), s * (14 + k * 5.6), P + 11.1, hz + 12 + 0.01));
  d.add(at(merlons(79, 0.8, 1, 0.3, Rd, 0.5), 0, P + 14, hz + 11.9));
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
  // Old Delhi crowds in round the open ground at the mosque's foot: rows of houses and shops two to
  // five storeys high along the lanes, leaving the bazaar before the east steps and the streets out
  // from the north and south gates open.
  g.add(cityAround([-62, 62, -58, 62], { rows: 4, gap: 26, seed: 61, paint: ['#d9b48f', '#c98a6a', '#e3cfa8', '#b98a6a', '#e8d8b8', '#cfa37a', '#d7b56d', '#c9b49a'],
    keep: [[-90, 90, 62, 100], [-14, 14, 62, 400], [56, 400, -10, 10], [-400, -56, -10, 10]] }));
}

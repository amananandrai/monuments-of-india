import * as THREE from 'three';
import { M, mat, mesh, box, cyl, at, onFace, FACES, ribbed, finial } from '../helpers.js';
import {
  archRing, archSlab, rosette, clockFace, bracketGeo, placeAll, aroundCircle, alongFace, chhajjaRing,
  railingRing, arcadeScreen, merlons, lotusDome, petalRing, mergeByMaterial,
} from './components.js';

// Charminar, finer detail (Muhammad Quli Qutb Shah, 1591). From photographs and descriptions:
// - four minarets, each a fluted shaft rising through the building and on above the roof in two
//   storeys, ringed by balconies on carved brackets with pierced railings, with arched windows on
//   every storey, and capped by a ribbed onion dome in a cup of lotus petals;
// - a moulded ring round each great pointed arch, a second arch traced inside it, and stucco
//   rosettes in the spandrels;
// - the four clock faces above the arches, added in 1889;
// - the first-floor gallery on a row of brackets with an arcaded balustrade, the openings of the
//   upper arcades framed in mouldings, a second bracketed cornice and balustrade, and a crowning
//   parapet of small arches topped with merlons.
// Dimensions follow js/monuments/charminar.js: plinth b, outer faces at ±10, minarets at the corners.

const STUCCO = mat('#e6dccb', 0.8); // the lime stucco of the carved work, a shade lighter than the walls

// One minaret, standing on y = 0, with its outward diagonal at angle `out` (0 = +z).
export function charminarMinaret(m, out) {
  const t = new THREE.Group();
  const fluted = (r0, r1, y0, y1, flutes) => ribbed(cyl(r1, r0, y1 - y0, m, 0, y0, 0, 64), flutes, 0.045);
  // Shaft sections: [bottom radius, top radius, from, to]; a balcony at the top of each but the last.
  const secs = [[2.7, 2.45, 0, 21], [2.45, 2.38, 21, 31.5], [2.28, 2.15, 31.5, 38.3], [2.08, 1.96, 38.3, 45.45]];
  secs.forEach(([r0, r1, y0, y1], i) => t.add(fluted(r0, r1, y0, y1, i === 0 ? 16 : 12)));
  // The outer face of the flutes at height y (the flutes stand up to 4.5% proud of the shaft).
  const outerAt = (y) => {
    const [r0, r1, y0, y1] = secs.find(([, , a, b]) => y >= a && y <= b) || secs[secs.length - 1];
    return (r0 + ((r1 - r0) * (y - y0)) / (y1 - y0)) * 1.045;
  };
  // Balconies: a corbelled cone on brackets, a floor slab and a pierced railing.
  const balcony = (y, r, R) => {
    t.add(cyl(R * 0.97, R * 0.8, 0.3, m, 0, y - 0.3, 0, 32));
    t.add(placeAll(bracketGeo(0.95, R - r, 0.26), aroundCircle(r, 16, y), STUCCO));
    t.add(cyl(R, R, 0.22, STUCCO, 0, y, 0, 32));
    t.add(at(railingRing(R - 0.12, 1.05, STUCCO), 0, y + 0.22, 0));
  };
  balcony(21, 2.48, 3.75);
  balcony(31.5, 2.4, 3.6);
  balcony(38.3, 2.17, 3.25);
  // Arched windows round each storey, each in a moulded frame; on the lower shafts only on the
  // side facing away from the building.
  const windows = (y, aw, ah, angles) => {
    const r = outerAt(y + ah / 2);
    for (const a of angles) {
      t.add(onFace(at(archSlab(aw, ah, true, M.recess, 0.12), 0, y, 0), a, r - 0.1));
      t.add(onFace(at(archRing(aw, ah, true, 0.12, 0.1, STUCCO), 0, y, 0), a, r - 0.03));
    }
  };
  const outside = [-2, -1, 0, 1, 2].map((k) => out + (k * Math.PI) / 4);
  const all = [0, 1, 2, 3, 4, 5, 6, 7].map((k) => out + (k * Math.PI) / 4);
  for (const y of [3.5, 9, 14.5]) windows(y, 0.85, 2.6, outside);
  windows(24.5, 0.8, 2.7, outside);
  windows(33.4, 0.8, 2.6, all);
  windows(40.4, 0.72, 2.4, all);
  // Moulded rings between the windows.
  for (const y of [7.6, 13.1, 18.6, 28.6, 36.6, 43.6]) { const r = outerAt(y) + 0.06; t.add(cyl(r, r, 0.22, STUCCO, 0, y, 0, 48)); }
  // The top: an eave, a short drum, a ribbed onion dome in a cup of petals, and the spike.
  t.add(chhajjaRing(1.96, 2.85, 45.5, 0.35, 0.12, STUCCO, 48));
  t.add(cyl(2.0, 2.0, 0.5, m, 0, 45.4, 0, 32));
  t.add(at(lotusDome(2.3, m, { ribs: 20, petals: 18, ribAmt: 0.03, petalM: STUCCO }), 0, 45.9, 0));
  t.add(at(petalRing(0.35, 10, 0.5, 0.26, Math.PI - 0.6, STUCCO), 0, 45.9 + 2.3 * 1.83, 0));
  mergeByMaterial(t);
  t.add(at(finial(4), 0, 50.0, 0));
  return t;
}

// The carving on the four faces, the clocks, the galleries and the parapet.
export function addCharminarDetails(g, { b }) {
  const m = M.plaster, d = new THREE.Group();
  for (const a of FACES) {
    // The great arch: an outer moulded ring, and a lighter arch traced inside the opening.
    d.add(onFace(at(archRing(11, 16.5, true, 0.5, 0.16, STUCCO), 0, b, 0), a, 10));
    d.add(onFace(at(archRing(12.5, 17.55, true, 0.16, 0.1, STUCCO), 0, b, 0), a, 10));
    // Rosettes in the spandrels, and the clock above the crown.
    for (const x of [-6.5, 6.5]) d.add(onFace(at(rosette(0.75, STUCCO, 12), 0, b + 17.3, 0), a, 10.05, x));
    d.add(onFace(at(clockFace(1.1, 10, 10), 0, b + 19.5, 0), a, 10.02));
    d.add(onFace(at(mesh(new THREE.TorusGeometry(1.25, 0.1, 6, 40), STUCCO), 0, b + 19.5, 0), a, 10.06));
    // First-floor gallery: brackets under the slab, an arcaded balustrade along its edge, and
    // moulded frames round the arched openings behind.
    d.add(placeAll(bracketGeo(1.1, 0.78, 0.4), alongFace(a, 10, 12.4, 8, b + 21), STUCCO));
    d.add(onFace(at(arcadeScreen(12.4, 1.05, 9, 0.85, 0.75, 0.16, STUCCO), 0, b + 21.9, 0), a, 10.6));
    for (let k = -2; k <= 2; k++) d.add(onFace(at(archRing(1.8, 3.2, true, 0.16, 0.08, STUCCO), 0, b + 22.4, 0), a, 9.8, k * 3.2));
    for (let k = -1; k <= 2; k++) d.add(onFace(box(0.32, 3.9, 0.1, STUCCO, 0, b + 22.7, 0), a, 9.85, (k - 0.5) * 3.2));
    // Second cornice: brackets, and a lower balustrade.
    d.add(placeAll(bracketGeo(0.75, 0.62, 0.32), alongFace(a, 9.8, 14.4, 10, b + 26.5), STUCCO));
    d.add(onFace(at(arcadeScreen(14.8, 0.85, 13, 0.7, 0.6, 0.14, STUCCO), 0, b + 27.2, 0), a, 10.32));
    // Top-floor arcade frames.
    for (let k = -3; k <= 3; k++) d.add(onFace(at(archRing(1.5, 2.6, true, 0.13, 0.08, STUCCO), 0, b + 27.6, 0), a, 9.3, k * 2.4));
    // The crowning parapet: small arches with merlons above.
    d.add(onFace(at(arcadeScreen(12.6, 1.25, 12, 0.62, 0.85, 0.24, STUCCO), 0, b + 31.8, 0), a, 9.45));
    d.add(onFace(at(merlons(12.4, 0.5, 0.7, 0.2, STUCCO, 0.45), 0, b + 33.05, 0), a, 9.45));
  }
  mergeByMaterial(d);
  g.add(d);
}

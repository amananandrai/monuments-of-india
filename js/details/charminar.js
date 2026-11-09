import * as THREE from 'three';
import { M, mat, mesh, box, cyl, at, onFace, FACES, ribbed, finial } from '../helpers.js';
import {
  archRing, archSlab, rosette, clockFace, bracketGeo, placeAll, aroundCircle, alongFace, chhajjaRing,
  railingRing, arcadeScreen, merlons, lotusDome, petalRing, mergeByMaterial,
} from './components.js';
import { stalls, along, cityAround } from './realism.js';
import { iwan } from './mughal.js';

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
  const secs = [[2.7, 2.45, 0, 21], [2.45, 2.2, 21, 31.5], [1.8, 1.68, 31.5, 38.3], [1.62, 1.5, 38.3, 45.45]];
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
  balcony(31.5, 2.22, 3.3);
  balcony(38.3, 1.7, 2.7);
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
  windows(33.4, 0.7, 2.6, all);
  windows(40.4, 0.62, 2.4, all);
  // Moulded rings between the windows.
  for (const y of [7.6, 13.1, 18.6, 28.6, 36.6, 43.6]) { const r = outerAt(y) + 0.06; t.add(cyl(r, r, 0.22, STUCCO, 0, y, 0, 48)); }
  // The top: an eave, a short drum, a ribbed onion dome in a cup of petals, and the spike.
  t.add(chhajjaRing(1.5, 2.3, 45.5, 0.35, 0.12, STUCCO, 48));
  t.add(cyl(1.55, 1.55, 0.5, m, 0, 45.4, 0, 32));
  t.add(at(lotusDome(1.85, m, { ribs: 20, petals: 18, ribAmt: 0.03, petalM: STUCCO }), 0, 45.9, 0));
  t.add(at(petalRing(0.3, 10, 0.45, 0.22, Math.PI - 0.6, STUCCO), 0, 45.9 + 1.85 * 1.83, 0));
  mergeByMaterial(t);
  t.add(at(finial(3.6), 0, 49.2, 0));
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

// Charminar in the middle of Hyderabad's old city: the road that runs round it and the four streets
// that leave it, and the bangle shops of the Laad Bazaar along the western street.
export function addDetails(f, g) {
  // The ring road round the monument and the four streets leaving it (each fades out into the land
  // at its far end, js/landscape.js), not a square of asphalt.
  g.add(cyl(30, 30, 0.1, M.asphalt, 0, -0.06, 0, 48));
  g.add(box(360, 0.1, 18, M.asphalt, 0, -0.07, 0), box(18, 0.1, 360, M.asphalt, 0, -0.08, 0));
  g.add(stalls([...along(8, [-40, -9], [-100, -9]).map(([x, z]) => [x, z, 0]), ...along(8, [-40, 9], [-100, 9]).map(([x, z]) => [x, z, Math.PI])], { goods: ['#d9342b', '#2f7a3f', '#e3b54a', '#7a3f8f', '#2f5d9a'] }));
  // The Mecca Masjid, a hundred metres to the south-west (north is -z), and the old city filling
  // the four quarters between the streets.
  g.add(at(meccaMasjid(), -95, 0, 90));
  g.add(cityAround([-34, 34, -34, 34], { rows: 4, gap: 10, seed: 71, paint: ['#efe6d2', '#e3d3b2', '#d9c7a6', '#f1e9d8', '#cfd8d4', '#e8d0b8'],
    keep: [[-400, 400, -12, 12], [-12, 12, -400, 400], [-145, -42, 42, 140]] }));
}

// The Mecca Masjid (1617–94): a court of grey granite before the prayer hall on its west side,
// five great arches in the hall's front between two octagonal minarets crowned by arcaded
// galleries and small domes, a pool in the court and low ranges round it. Centred on the court.
function meccaMasjid() {
  const g = new THREE.Group(), G = M.granite, Gd = M.graniteDark;
  g.add(box(80, 0.5, 76, mat('#c9c4ba', 0.9)), box(18, 0.6, 10, Gd, 8, 0.5, 0), box(16, 0.7, 8, M.water, 8, 0.5, 0));
  for (const s of [-1, 1]) g.add(box(80, 5, 3, G, 0, 0.5, s * 38));
  g.add(box(3, 5, 30, G, 40, 0.5, -23), box(3, 5, 30, G, 40, 0.5, 23));
  const hall = new THREE.Group();
  hall.add(box(66, 20, 22, G, 0, 0, -11), box(66.6, 0.8, 22.6, Gd, 0, 20, -11));
  for (let k = 0; k < 5; k++) hall.add(at(iwan(7, 14, { m: G, trim: Gd, shade: M.recess, depth: 1.8, frame: 1.2, top: 1.4, fill: 'room' }), -24 + k * 12, 0, -1.8));
  for (const s of [-1, 1]) {
    hall.add(cyl(3.2, 3.6, 34, G, s * 33, 0, 0, 8), cyl(4.2, 3.4, 1.2, Gd, s * 33, 26, 0, 8));
    for (let k = 0; k < 8; k++) { const a = (k / 8) * Math.PI * 2; hall.add(box(0.5, 3.6, 0.5, G, s * 33 + Math.cos(a) * 3, 27.2, Math.sin(a) * 3)); }
    hall.add(cyl(3.4, 3.4, 0.6, Gd, s * 33, 30.8, 0, 8), at(mesh(new THREE.SphereGeometry(3.1, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), G), s * 33, 31.4, 0), at(finial(2), s * 33, 34.4, 0));
  }
  g.add(at(hall, -37, 0.5, 0).rotateY(Math.PI / 2));
  return g;
}

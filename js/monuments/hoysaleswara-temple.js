import * as THREE from 'three';
import { box, at, onFace, starPrism, steppedPlan, planPrism, planBand } from '../helpers.js';
import { nandiMandapa, dravidaVimana } from '../parts/temples.js';
import { templeDoorway, steps } from '../parts/doorways.js';
import { mergeByMaterial, chhajja } from '../parts/components.js';
import { addDetails, SOAP as S, SOAP_DARK as Sd, DIMS } from '../details/hoysaleswara-temple.js';

// A plan along x: steppedPlan's profile runs along z with half-widths in x, so its points are
// swapped to run the profile along x, then moved to z = cz.
export const alongX = (profile, opts, cz = 0) => steppedPlan(profile, opts).map(([w, x]) => [x, cz + w]).reverse();

// The Hoysaleswara temple at Halebidu, the old Hoysala capital Dorasamudra, built about 1121–1160 by
// Ketamalla, an officer of King Vishnuvardhana. A twin temple (dvikuta): two shrines side by side,
// for Hoysaleshvara (south, +x) and Shantaleshvara (north), each with its sanctum on a star-shaped
// plan behind a hall, the two halls joined into one long hall with a jagged outline of projecting
// bays. It faces east (+z) and stands on a broad platform (jagati) that follows the same outline.
// Its towers over the sanctums are lost, so it ends today in a flat roof under a deep sloping eave.
// Before each shrine, a pavilion with its Nandi.
export function buildHoysaleswaraTemple() {
  const g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  const { J, WH, xs, sz, hz, PROF } = DIMS;
  // The platform, its outline grown 3.5 m round the hall's, with steps up to each door.
  const hall = alongX(PROF, { cut: 0.9, notches: 3 }, hz), jag = alongX(PROF, { grow: 3.5, cut: 1.1, notches: 2 }, hz);
  f.add(planPrism(jag, 0, J - 0.3, Sd), planPrism(jag, J - 0.3, 0.3, S));
  // The shrines: a star of sixteen points round each sanctum, behind the halls.
  for (const x of xs) {
    f.add(at(starPrism(16, 9.4, 8.4, J, Sd), x, 0, sz), at(starPrism(16, 9.6, 8.6, 0.3, S), x, J - 0.3, sz));
    f.add(at(starPrism(16, 6.4, 5.4, WH, S), x, J, sz), at(starPrism(16, 6.9, 5.9, 0.5, Sd), x, J + WH, sz));
    // The base of the lost tower: one plain storey and a stump.
    f.add(at(dravidaVimana(7, 1, 2.2, S, Sd, { capScale: 0.001, kalashScale: 0.001 }), x, J + WH + 0.5, sz));
  }
  // The joined halls: walls WH high on the jagged plan, a flat roof and a deep eave.
  f.add(planPrism(hall, J, WH, S), planPrism(alongX(PROF, { grow: 0.3, cut: 0.9, notches: 3 }, hz), J + WH, 0.45, Sd));
  f.add(planBand(alongX(PROF, { grow: 0.45, cut: 0.9, notches: 3 }, hz), J + WH - 0.55, 0.5, 0.7, Sd));
  const inner = PROF.map(([x, w], i) => [i === 0 ? x + 1.2 : i === PROF.length - 1 ? x - 1.2 : x, w - 1.2]);
  f.add(planPrism(alongX(inner, { cut: 0.9, notches: 2 }, hz), J + WH + 0.45, 0.6, S));
  // The doors: two on the east, one at each end; each up a flight of steps, between door guardians,
  // under a small porch.
  const doors = new THREE.Group();
  const door = (x, z, a) => {
    const d = new THREE.Group();
    d.add(at(templeDoorway(1.6, 3, { m: S, guardianH: 1.6, bands: 4 }), 0, J, 0.02));
    d.add(at(steps(3, J, 6, S), 0, 0, 3.5));
    for (const sx of [-1.9, 1.9]) d.add(box(0.5, 3.4, 0.5, S, sx, J, 2.6));
    d.add(box(4.8, 0.35, 3.4, Sd, 0, J + 3.4, 1.6), at(chhajja(4.8, 1, 0.4, 0.12, Sd), 0, J + 3.75, 3.1));
    const o = onFace(d, a, 0);
    o.position.x += x;
    o.position.z += z;
    doors.add(o);
  };
  for (const x of xs) door(x, hz + 8.5, 0);
  door(-23, hz, -Math.PI / 2);
  door(23, hz, Math.PI / 2);
  f.add(mergeByMaterial(doors));
  // The two Nandi pavilions on the shrines' axes, the Surya shrine behind the southern one.
  for (const x of xs) f.add(at(nandiMandapa(7, 3.6, S, Sd, { nandiM: Sd }), x, 0, hz + 26));
  addDetails(f, g);
  // From the north-east, along the jagged front and its two pavilions.
  return { group: g, focus: f, view: [-0.75, 0.3, 1], zoom: 0.58 };
}

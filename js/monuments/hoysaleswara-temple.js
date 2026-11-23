import * as THREE from 'three';
import { M, mesh, box, cyl, at, onFace, FACES, inst, starPrism, steppedPlan, planPrism, planBand } from '../helpers.js';
import { dravidaVimana } from '../parts/temples.js';
import { templeDoorway, steps, guardian } from '../parts/doorways.js';
import { mergeByMaterial, chhajja, frieze, carved } from '../parts/components.js';
import { figure } from '../parts/sculpture.js';
import { nandi } from '../parts/animals.js';
import { detail } from '../detail.js';
import { addDetails, turnedPillarGeo, SOAP as S, SOAP_DARK as Sd, DIMS } from '../details/hoysaleswara-temple.js';

// A plan along x: steppedPlan's profile runs along z with half-widths in x, so its points are
// swapped to run the profile along x, then moved to z = cz.
export const alongX = (profile, opts, cz = 0) => steppedPlan(profile, opts).map(([w, x]) => [x, cz + w]).reverse();

// The Hoysaleswara temple at Halebidu, the old Hoysala capital Dorasamudra, built about 1121–1160 by
// Ketamalla, an officer of King Vishnuvardhana. A twin temple (dvikuta): two shrines side by side,
// for Hoysaleshvara (south) and Shantaleshvara (north), each with its sanctum on a star-shaped plan
// behind a hall, the two halls joined into one long hall with a jagged outline of projecting bays.
// It faces east (+z), so north is +x and the southern shrine stands at -x. All of it stands on one
// broad platform (jagati) that follows the same outline and runs on east to carry the two Nandi
// halls: open pillared halls, the southern one the larger, with the small Surya shrine built on to
// its east side. The towers over the sanctums are lost, so it ends today in a flat roof under a
// deep sloping eave. Plan: the Mysore Archaeological Department's, as annotated on Wikimedia Commons.
export function buildHoysaleswaraTemple() {
  const g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  const { J, F, WH, xs, sz, hz, PROF, NH, SU } = DIMS;
  // The platform, its outline grown 3.5 m round the hall's, with steps up to each door.
  const hall = alongX(PROF, { cut: 0.9, notches: 3 }, hz), jag = alongX(PROF, { grow: 3.5, cut: 1.1, notches: 2 }, hz);
  f.add(planPrism(jag, 0, J - 0.3, Sd), planPrism(jag, J - 0.3, 0.3, S));
  // Its eastward arms under the Nandi halls (a finger lower, as the paving steps down), the
  // southern one running on round the Surya shrine.
  for (const [x, prof] of [[xs[0], [[11.7, 10.2], [SU.z - SU.d / 2 + 0.4, 5.8], [SU.z + SU.d / 2 + 3.4, 0]]], [xs[1], [[11.7, 6.6], [31, 0]]]]) {
    const arm = steppedPlan(prof, { cut: 0.8, notches: 2 }).map(([px, pz]) => [px + x, pz]);
    f.add(planPrism(arm, 0, J - 0.34, Sd), planPrism(arm, J - 0.34, 0.3, S));
  }
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
  // The four doors: two on the east, one at each end. The floor inside is as high as the eight
  // bands, so each door stands over a landing and a flight of steps on the platform, between two
  // miniature shrines; the doors at the ends have a second flight up the platform, with its own
  // pair. Door guardians six feet high, cut free of the wall, stand at the south and south-east
  // doors under a lintel of the dancing Shiva among musicians; at the north-east only their
  // pedestals are left, and the north door has a mismatched pair brought from other ruins.
  const doors = new THREE.Group();
  const door = (x, z, a, guards, ground) => {
    const d = new THREE.Group();
    d.add(at(templeDoorway(1.5, 2.3, { m: S, guardians: false, hood: false, bands: 3, bw: 0.22 }), 0, J + F, 0.02));
    d.add(box(5.8, F, 1.1, Sd, 0, J, 0.55), at(steps(2.6, F, 8, S, 0.29), 0, J, 1.1));
    for (const s of [-1, 1]) {
      d.add(at(miniShrine(3.1, S, Sd), s * 2.15, J, 2.0), box(0.8, 0.28, 0.6, S, s * 2.25, J + F, 0.5));
      if (guards) d.add(at(guardian(guards[(s + 1) / 2], Sd), s * 2.25, J + F + 0.28, 0.5), box(0.95, guards[(s + 1) / 2] + 0.25, 0.1, S, s * 2.25, J + F + 0.28, 0.12));
      if (ground) d.add(at(miniShrine(2.6, S, Sd), s * 2.3, 0, 4.4));
    }
    // The lintel: Nataraja in the middle, gods and musicians either side (the south doors).
    d.add(box(2.9, 0.56, 0.1, carved(Sd, 'reliefs'), 0, J + F + 3.0, 0.07));
    if (guards && guards[0] > 1.8) {
      d.add(at(figure(0.52, S, 'dancer'), 0, J + F + 3.02, 0.14));
      if (!detail.low) for (const s of [-1, 1]) for (let k = 1; k <= 3; k++) d.add(at(figure(0.4, S, k % 2 ? 'musician' : 'standing'), s * k * 0.38, J + F + 3.02, 0.14));
    }
    if (ground) d.add(at(steps(3, J, 6, S), 0, 0, 3.5));
    const o = onFace(d, a, 0);
    o.position.x += x;
    o.position.z += z;
    doors.add(o);
  };
  door(xs[0], hz + 8.5, 0, [1.83, 1.83]);
  door(xs[1], hz + 8.5, 0, null);
  door(-23, hz, -Math.PI / 2, [1.83, 1.83], true);
  door(23, hz, Math.PI / 2, [1.5, 1.65], true);
  f.add(mergeByMaterial(doors));
  // The two Nandi halls on the shrines' axes, each bull facing its sanctum through the east door.
  for (const n of NH) f.add(at(nandiHall(n), n.x, J - 0.04, n.z));
  // The Surya shrine on the east of the southern hall, where a seven-foot Surya faces the bull and
  // the sanctum beyond it: a small walled cell under an eave.
  f.add(box(SU.w, WH - 0.4, SU.d, S, SU.x, J - 0.04, SU.z), box(SU.w + 1.1, 0.4, SU.d + 1.1, Sd, SU.x, J + WH - 0.44, SU.z), box(SU.w - 0.8, 0.5, SU.d - 0.8, S, SU.x, J + WH - 0.04, SU.z));
  for (const a of [0, Math.PI / 2, -Math.PI / 2]) { const o = onFace(at(chhajja((a ? SU.d : SU.w) + 1.1, 0.8, 0.35, 0.1, Sd), 0, J + WH - 0.3, 0), a, (a ? SU.w : SU.d) / 2 + 0.5); o.position.x += SU.x; o.position.z += SU.z; f.add(o); }
  addDetails(f, g);
  // From the north-east, as visitors come to it: the screened front, the Nandi halls before it.
  return { group: g, focus: f, view: [0.75, 0.3, 1], zoom: 0.58 };
}

// A miniature shrine h high, as stand in pairs beside every flight of steps: a moulded foot, a cell
// with a niche in each face, and a tower of diminishing tiers under a dome and its finial.
function miniShrine(h, m, sh) {
  const g = new THREE.Group(), u = h / 3.1;
  g.add(box(1.3 * u, 0.3 * u, 1.3 * u, sh), box(1.1 * u, 0.25 * u, 1.1 * u, m, 0, 0.3 * u), box(0.95 * u, 0.85 * u, 0.95 * u, m, 0, 0.55 * u), box(1.25 * u, 0.1 * u, 1.25 * u, sh, 0, 1.4 * u));
  for (const a of FACES) g.add(onFace(box(0.42 * u, 0.6 * u, 0.04, M.recess, 0, 0.68 * u, 0), a, 0.47 * u));
  [[1.0, 1.5], [0.8, 1.8], [0.6, 2.1]].forEach(([w, y]) => g.add(box(w * u, 0.2 * u, w * u, m, 0, y * u), box((w + 0.14) * u, 0.1 * u, (w + 0.14) * u, sh, 0, (y + 0.2) * u)));
  const dome = mesh(new THREE.SphereGeometry(0.3 * u, 8, 5), m, 0, 2.55 * u, 0);
  dome.scale.y = 0.75;
  g.add(dome, cyl(0.03 * u, 0.1 * u, 0.35 * u, m, 0, 2.75 * u, 0, 6));
  return g;
}

// A Nandi hall w × d: an open hall of lathe-turned pillars on a moulded plinth, a seat-back
// parapet between the outer pillars, a flat roof under a deep eave, and the great bull lying in
// the middle, facing west to the sanctum. The larger (southern) hall has a porch on three sides.
function nandiHall({ w, d, big }) {
  const g = new THREE.Group(), P = 1.3, ph = 3.4, pillars = [], nx = Math.round(w / 2.5), nz = Math.round(d / 2.5);
  g.add(box(w + 0.7, 0.45, d + 0.7, Sd), box(w + 0.3, P - 0.6, d + 0.3, frieze(S), 0, 0.45), box(w + 0.5, 0.15, d + 0.5, Sd, 0, P - 0.15));
  for (let i = 0; i <= nx; i++) for (let k = 0; k <= nz; k++) {
    const edge = i === 0 || i === nx || k === 0 || k === nz, x = (i / nx - 0.5) * (w - 1), z = (k / nz - 0.5) * (d - 1);
    if (edge || (Math.abs(x) < w * 0.3 && Math.abs(z) < d * 0.3 && Math.hypot(x, z) > 2.4)) pillars.push([x, P, z, edge ? 0.7 : 0.95, ph, edge ? 0.7 : 0.95]);
  }
  // The seat-back between the outer pillars, open at the middle of each side.
  for (const a of FACES) {
    const len = Math.abs(Math.sin(a)) > 0.5 ? d : w, dist = (Math.abs(Math.sin(a)) > 0.5 ? w : d) / 2 - 0.45;
    for (const s of [-1, 1]) g.add(onFace(box(len / 2 - 1.9, 0.85, 0.28, carved(S, 'reliefs'), 0, P, 0), a, dist, s * (len / 4 + 0.75)));
    g.add(onFace(at(chhajja(len + 1, 1.1, 0.4, 0.12, Sd), 0, P + ph + 0.5, 0), a, dist + 0.75));
    // Steps up from the platform on the west, between two miniature shrines; a porch on the others.
    if (a === Math.PI) { g.add(onFace(at(steps(2.6, P, 5, S, 0.3), 0, 0, 0), a, dist + 0.8)); for (const s of [-1, 1]) g.add(onFace(at(miniShrine(2.4, S, Sd), 0, 0, 0), a, dist + 1.6, s * 2.1)); }
    else if (big && a) { g.add(onFace(box(4.6, P, 1.5, Sd), a, dist + 1.5), onFace(box(4.9, 0.3, 1.7, Sd, 0, P + ph - 0.3, 0), a, dist + 1.5)); for (const s of [-1, 1]) pillars.push([Math.sin(a) * (dist + 1.8), P, -Math.sin(a) * s * 1.9, 0.7, ph - 0.3, 0.7]); }
  }
  g.add(box(w + 0.3, 0.5, d + 0.3, S, 0, P + ph), box(w - 0.6, 0.5, d - 0.6, Sd, 0, P + ph + 0.5));
  const o = mergeByMaterial(g);
  o.add(inst(turnedPillarGeo(), pillars, S), at(nandi(Sd, big ? 1.05 : 0.9), 0, P, 0).rotateY(Math.PI));
  return o;
}

import * as THREE from 'three';
import { M, mesh, box, cyl, at } from '../helpers.js';
import { mouldings, frieze, mergeByMaterial } from './components.js';
import { trees, shrubs, asiBoard, scatter, along } from './realism.js';

// Kandariya Mahadeva, finer detail. From photographs: the high base (adhishthana) is a stack of
// carved mouldings; the balconied windows of the halls have dwarf pillars on a sloping seat-back
// (kakshasana) along their edges; carved bands frame the two rows of figures on the walls; and
// ribbed amalaka stones mark the storeys on the corners of the main spire.
// Dimensions follow js/monuments/kandariya-mahadeva.js: base 24 × 42 from y 3 to 5, the walls
// 22 × 40 to y 11 at z = -4; balconies 29 wide at z = 0 and 12.25; the main spire 15 wide and
// 19 high from y 11.5 at z = -15.
function architecture(f) {
  const d = new THREE.Group(), S = M.khaj, Sd = M.khajShade;
  d.add(at(mouldings(24, 42, [[0.2, 0.4, 0.15, frieze(S)], [1.0, 0.5, 0.3, Sd], [1.5, 0.4, 0.12, frieze(S)]], Sd), 0, 3, -4));
  d.add(at(mouldings(22, 40, [[0.3, 0.2, 0.06], [2.2, 0.2, 0.06], [4.3, 0.2, 0.06]].map(([y, h, p]) => [5 + y, h, p, Sd]), S), 0, 0, -4));
  for (const [z, dd] of [[0, 9], [12.25, 7.5]]) for (const s of [-1, 1]) {
    const seat = box(0.5, 1.3, dd - 0.6, Sd, s * 14.2, 9.6, z);
    seat.rotation.z = -s * 0.35;
    d.add(seat);
    for (let k = 0; k < 4; k++) d.add(cyl(0.12, 0.14, 1.5, S, s * 14.45, 10.1, z - dd / 2 + 0.8 + k * ((dd - 1.6) / 3), 6));
  }
  const prof = (t) => 1 - 0.7 * Math.pow(t, 1.3), am = new THREE.SphereGeometry(1, 16, 6);
  for (let k = 1; k <= 4; k++) {
    const t = k / 5, wt = 15 * prof(t), y = 11.5 + t * 19, r = wt * 0.08;
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) { const o = mesh(am, S, sx * wt * 0.42, y, -15 + sz * wt * 0.42); o.scale.set(r, r * 0.42, r); d.add(o); }
  }
  mergeByMaterial(d);
  f.add(d);
}

// The Kandariya Mahadeva in the western group at Khajuraho: the kept lawns of the temple park, with
// clipped hedges, flowering bougainvillea and shade trees, and the ASI board.
export function addDetails(f, g) {
  architecture(f);
  g.add(trees(scatter(18, [-44, 44, -54, 54], { seed: 3, gap: 12, avoid: [[-20, 20, -36, 42]] }), { kind: 'neem', seed: 3 }));
  g.add(shrubs([...along(10, [-20, -38], [-20, 40]), ...along(10, [20, -38], [20, 40])].map(([x, z]) => [x, z, 1.1]), { seed: 4 }));
  g.add(shrubs(scatter(10, [-44, 44, 42, 54], { seed: 5, gap: 5 }).map(([x, z]) => [x, z, 1.8]), { flowers: '#d0306f', seed: 5 }));
  g.add(asiBoard('Khajuraho Group of Monuments', 14, 52, 0, { line2: 'WORLD HERITAGE SITE' }));
}

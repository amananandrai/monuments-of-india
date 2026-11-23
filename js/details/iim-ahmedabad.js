import * as THREE from 'three';
import { M, box, group } from '../helpers.js';
import { mergeByMaterial } from '../parts/components.js';
import { trees, shrubs, benches, scatter, along, cityAround } from '../parts/realism.js';
import { detail } from '../detail.js';
import { P, BRICK, CONC, dorm, cutWall } from '../monuments/iim-ahmedabad.js';

// IIM Ahmedabad, finer detail. From photographs: the plaza is a court of brick paving, stepped
// down to a lawn, with a low brick seat-wall along its edges; brick drains (khadkis) of small
// arches run along the base of the classroom wings. Measures follow js/monuments/iim-ahmedabad.js.
function architecture(f) {
  const { PW, PL } = P, d = new THREE.Group();
  d.add(box(PW - 1, 0.12, PL - 2, BRICK, 0, 0, PL / 2 + 1));
  d.add(box(PW - 10, 0.4, PL - 24, BRICK, 0, 0, PL / 2 + 6), box(PW - 12, 0.08, PL - 26, M.grass, 0, 0.4, PL / 2 + 6));
  for (const s of [-1, 1]) d.add(box(0.5, 0.6, PL - 6, BRICK, s * (PW / 2 - 2.2), 0, PL / 2 + 1));
  d.add(box(PW - 2, 0.6, 0.5, BRICK, 0, 0, PL - 0.4));
  f.add(mergeByMaterial(d));
}

// The old campus at Vastrapur: the plaza between the main building and the classrooms; the
// dormitories in their staggered diagonal rows to the south-east and south-west, linked by
// arcades; lawns, neem and gulmohur; the city's houses beyond the campus wall.
export function addDetails(f, g) {
  architecture(f);
  const { PW, PL, MW } = P;
  g.add(box(620, 0.06, 560, M.grass, 0, -0.06, 60));
  // The eighteen dormitories (D1 to D18): staggered rows of blocks turned at 45°, stepping away
  // from the plaza, each row strung along a low arched brick corridor.
  const dorms = new THREE.Group(), places = [], q = 18.4;
  for (const s of [-1, 1]) {
    for (let k = 0; k < 5; k++) places.push([s * (PW / 2 + 36 + k * 18), 42 + k * 18]);
    if (!detail.low) for (let k = 0; k < 4; k++) places.push([s * (PW / 2 + 45 + q + k * 18), 51 - q + k * 18]);
  }
  for (const [x, z] of places) {
    const b = dorm();
    b.rotation.y = x > 0 ? -Math.PI / 4 : Math.PI / 4;
    b.position.set(x, 0, z);
    dorms.add(b);
  }
  const arches = [];
  for (let k = 0; k < 26; k++) arches.push(['arch', -60 + k * 4.8, 0, 1.5, 1.6]);
  for (const s of [-1, 1]) for (const r of detail.low ? [0] : [0, 1]) {
    const a = group(cutWall(126 - r * 20, 3.6, 2.6, arches.slice(r * 2, 26 - r * 2).map(([k, x, ...o]) => [k, x, ...o])), box(127 - r * 20, 0.3, 3.2, CONC, 0, 3.6, -1.3));
    a.rotation.y = -s * Math.PI / 4;
    a.position.set(s * (PW / 2 + 56 + r * (q + 4)), 0, 50 - r * (q - 4));
    dorms.add(a);
  }
  g.add(mergeByMaterial(dorms));
  // Paths.
  g.add(box(8, 0.05, 120, M.path, 0, 0.01, PL + 60), box(MW + 40, 0.05, 6, M.path, 0, 0.01, -30));
  // Trees: neem and gulmohur round the lawns, avoiding the buildings.
  const avoid = [[-MW / 2 - 6, MW / 2 + 6, -32, PL + 6]];
  for (const [x, z] of places) avoid.push([x - 15, x + 15, z - 15, z + 15]);
  for (const s of [-1, 1]) for (let k = 0; k < 8; k++) avoid.push([s * (PW / 2 + 10 + k * 14) - 9, s * (PW / 2 + 10 + k * 14) + 9, k * 14 - 2, k * 14 + 24]);
  g.add(trees(scatter(detail.low ? 40 : 70, [-260, 260, -150, 300], { seed: 5, gap: 13, avoid }), { kind: 'neem', seed: 5 }));
  g.add(trees(along(8, [-6, PL + 20], [-6, PL + 110]).concat(along(8, [6, PL + 20], [6, PL + 110])), { kind: 'mango', seed: 8 }));
  g.add(shrubs(along(14, [-MW / 2, -26], [MW / 2, -26]).map(([x, z]) => [x, z, 1]), { seed: 2, flowers: '#e0503a' }));
  g.add(benches([[-10, PL - 4], [10, PL - 4]]));
  g.add(cityAround([-280, 280, -170, 320], { rows: detail.low ? 1 : 2, every: detail.low ? 3 : 1, fine: false, gap: 8, storeys: [3, 6], seed: 13 }));
}

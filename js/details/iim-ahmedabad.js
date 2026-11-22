import * as THREE from 'three';
import { M, box, at } from '../helpers.js';
import { mergeByMaterial } from '../parts/components.js';
import { trees, shrubs, benches, scatter, along, cityAround } from '../parts/realism.js';
import { detail } from '../detail.js';
import { P, BRICK, CONC, dorm } from '../monuments/iim-ahmedabad.js';

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
  // The dormitories: rows of blocks turned at 45°, stepping away from the plaza.
  const dorms = new THREE.Group(), places = [];
  for (let k = 0; k < (detail.low ? 4 : 6); k++) places.push([PW / 2 + 36 + k * 18, 42 + k * 18], [-PW / 2 - 36 - k * 18, 42 + k * 18]);
  for (const [x, z] of places) {
    const b = dorm();
    b.rotation.y = x > 0 ? -Math.PI / 4 : Math.PI / 4;
    b.position.set(x, 0, z);
    dorms.add(b);
  }
  g.add(mergeByMaterial(dorms));
  // Arcades linking the dormitories, low brick walks.
  for (const s of [-1, 1]) {
    const a = box(130, 3.4, 3, BRICK, 0, 0, 0);
    a.rotation.y = -s * Math.PI / 4;
    a.position.set(s * (PW / 2 + 56), 0, 50);
    g.add(a, at(box(130, 0.3, 3.6, CONC), s * (PW / 2 + 56), 3.4, 50).rotateY(-s * Math.PI / 4));
  }
  // Paths.
  g.add(box(8, 0.05, 120, M.path, 0, 0.01, PL + 60), box(MW + 40, 0.05, 6, M.path, 0, 0.01, -30));
  // Trees: neem and gulmohur round the lawns, avoiding the buildings.
  const avoid = [[-MW / 2 - 6, MW / 2 + 6, -32, PL + 6]];
  for (const [x, z] of places) avoid.push([x - 15, x + 15, z - 15, z + 15]);
  g.add(trees(scatter(detail.low ? 40 : 70, [-260, 260, -150, 300], { seed: 5, gap: 13, avoid }), { kind: 'neem', seed: 5 }));
  g.add(trees(along(8, [-6, PL + 20], [-6, PL + 110]).concat(along(8, [6, PL + 20], [6, PL + 110])), { kind: 'mango', seed: 8 }));
  g.add(shrubs(along(14, [-MW / 2, -26], [MW / 2, -26]).map(([x, z]) => [x, z, 1]), { seed: 2, flowers: '#e0503a' }));
  g.add(benches([[-10, PL - 4], [10, PL - 4]]));
  g.add(cityAround([-280, 280, -170, 320], { rows: detail.low ? 1 : 2, every: detail.low ? 3 : 1, fine: false, gap: 8, storeys: [3, 6], seed: 13 }));
}

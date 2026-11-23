import * as THREE from 'three';
import { M, box, at } from '../helpers.js';
import { arcadeSkin } from '../parts/mughal.js';
import { mergeByMaterial } from '../parts/components.js';
import { trees, lampPosts, cityAround, traffic } from '../parts/realism.js';
import { detail } from '../detail.js';
import { nishanSahib, sikhDome } from '../parts/sikh.js';

// Patna Sahib in the lanes of old Patna (Patna City): the marble court round the Takht, ranges of
// white rooms for pilgrims on three sides, three storeys of arches each, the arched gate onto the
// street, the two Nishan Sahibs wrapped in saffron before the front, and the old city pressing in
// all round. The building is 28 m square on a plinth of 32 m (js/monuments).
export function addDetails(f, g, { P }) {
  const C = 40;
  g.add(box(2 * C, 0.25, 2 * C + 20, M.marble, 0, 0, 10), box(500, 0.2, 500, M.path, 0, -0.2, 0));
  // The pilgrims' ranges: three storeys of arches, white, round the court.
  const range = (len, x, z, ry) => {
    const n = Math.floor(len / 4.6), cells = [];
    for (let k = 0; k < n; k++) { const cx = -len / 2 + (k + 0.5) * (len / n); cells.push([cx, 0.4, 2.6, 3.4, 'room'], [cx, 4.8, 2.4, 3, 'room'], [cx, 8.8, 2.4, 3, 'room']); }
    const r = new THREE.Group();
    r.add(box(len, 12.6, 7, M.lime, 0, 0, -4.2), arcadeSkin(len, 12.6, cells, 0.7, M.lime, { trim: M.marble }), box(len, 0.9, 1.2, M.marble, 0, 12.6, 0.1));
    for (const y of [4.3, 8.3]) r.add(box(len, 0.25, 0.3, M.marble, 0, y, 0.75));
    g.add(at(mergeByMaterial(r), x, 0, z).rotateY(ry));
  };
  range(2 * C, 0, -C, 0);
  range(2 * C + 18, C, 9, -Math.PI / 2);
  range(2 * C + 18, -C, 9, Math.PI / 2);
  // The gate onto the street (+z), under a small white dome.
  const gate = new THREE.Group();
  gate.add(box(14, 10, 8, M.lime), box(15, 0.5, 9, M.marble, 0, 10, 0), at(sikhDome(2.6, M.marble), 0, 10.5, 0));
  for (const a of [0, Math.PI]) { const s = arcadeSkin(14, 10, [[0, 0, 5, 7.8, 'door']], 0.8, M.lime, { trim: M.marble }); s.rotation.y = a; s.position.z = a ? -3.2 : 3.2; gate.add(s); }
  for (const s of [-1, 1]) g.add(box(C - 7, 6, 4, M.lime, s * (C + 7) / 2, 0, C + 18));
  g.add(at(mergeByMaterial(gate), 0, 0, C + 20));
  g.add(at(nishanSahib(30), -19, 0.25, 21), at(nishanSahib(30), 19, 0.25, 21));
  g.add(lampPosts([[-8, 27], [8, 27], [-24, 34], [24, 34], [-28, -10], [28, -10]], { y: 0.25 }));
  g.add(trees([[-30, 36], [30, 36]], { kind: 'ashoka', seed: 3, y: 0.25 }));
  // The street before the gate, and the crowded old city beyond.
  g.add(box(400, 0.06, 14, M.asphalt, 0, -0.02, C + 31));
  g.add(traffic([[C + 28, 1], [C + 34, -1]], -190, 190, { gap: 20, seed: 6, taxis: 0.2, buses: 0.05 }));
  g.add(cityAround([-C - 9, C + 9, -C - 9, C + 39], { rows: detail.low ? 2 : 4, every: detail.low ? 2 : 1, fine: !detail.low, gap: 1, lane: 6, storeys: [2, 5], seed: 41 }));
}

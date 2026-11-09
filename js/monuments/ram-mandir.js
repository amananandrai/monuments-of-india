import * as THREE from 'three';
import { M, at, planPrism } from '../helpers.js';
import { mergeByMaterial } from '../details/components.js';
import { grandStair } from '../details/doorways.js';
import { addDetails, plinthPlan, hall, sanctum, porch, parkota, HALLS, SANCTUM, P } from '../details/ram-mandir.js';

export function buildRamMandir() {
  const m = M.pink, sh = M.pinkShade, g = new THREE.Group(), t = new THREE.Group();
  // The plinth in three tiers, each following the plan's offsets, and the stair at its front.
  t.add(planPrism(plinthPlan(4), 0, 2, sh), planPrism(plinthPlan(2), 2, 2, m), planPrism(plinthPlan(0), 4, P - 4, sh));
  // The stair up the east face to the Singh Dwar: 32 steps in two flights of 16 with a landing,
  // elephants at its foot, lions at the landing and Hanuman and Garuda at the top.
  t.add(at(mergeByMaterial(grandStair(P, 12, m, sh, { n: 32, foot: 'elephant', mid: 'lion', top: true })), 0, 0, 44));
  // The sanctum and the five halls, three storeys each (js/details/ram-mandir.js), and the porch.
  const [sx, sz, sw] = SANCTUM, foot = [[sx, sz, sw / 2], ...HALLS.map(([x, z, w]) => [x, z, w / 2])];
  t.add(at(sanctum(m, sh), sx, P, sz));
  HALLS.forEach(([x, z, w, roofs, doors], i) => {
    const others = foot.filter((_, k) => k !== i + 1);
    t.add(at(hall(w, roofs, m, sh, { doors, others, x0: x, z0: z }), x, P, z));
  });
  t.add(at(porch(m, sh), 0, P, 0));
  g.add(t);
  // The parkota: the walled enclosure round the temple, open on the east to its gate, with the
  // four shrines at its corners (js/details/ram-mandir.js).
  g.add(parkota(m, sh));
  addDetails(t, g);
  // Framed on the temple; the enclosure lies round it.
  return { group: g, focus: t, view: [0.95, 0.38, 1.15], batch: true };
}

import * as THREE from 'three';
import { M, mesh, box, at, planPrism } from '../helpers.js';
import { mergeByMaterial } from '../details/components.js';
import { statue } from '../details/sculpture.js';
import { elephant, lion } from '../details/animals.js';
import { addDetails, plinthPlan, hall, sanctum, porch, HALLS, SANCTUM, P } from '../details/ram-mandir.js';

// The stair up the east face to the Singh Dwar: 32 steps rising P from the ground to the top of
// the plinth at z0, in two flights of 16 with a landing between, walled at both sides. Elephants
// stand at its foot, lions on the walls at the landing and two figures (Hanuman and Garuda) at
// the top.
function stair(P, z0, m, sh) {
  const g = new THREE.Group(), W = 12, t = 0.36, LD = 2.4, h = P / 32;
  let z = z0;
  for (let k = 1; k <= 31; k++) {
    const d = k === 16 ? LD : t;
    g.add(box(W, P - k * h, d, m, 0, 0, z + d / 2));
    z += d;
  }
  const z1 = z0 + 15 * t, z2 = z1 + LD, zE = z;
  // The side walls, a metre above the line of the steps, drawn in (z, y) and turned to run along z.
  const cheek = new THREE.Shape([[z0 - 0.01, 0], [z0 - 0.01, P + 1], [z1, P / 2 + 1], [z2, P / 2 + 1], [zE, 1], [zE, 0]].map(([a, b]) => new THREE.Vector2(a, b)));
  const cg = new THREE.ExtrudeGeometry(cheek, { depth: 1.2, bevelEnabled: false }).rotateY(-Math.PI / 2);
  for (const s of [-1, 1]) {
    g.add(mesh(cg, sh, s > 0 ? W / 2 + 1.19 : -W / 2 + 0.01, 0, 0));
    g.add(box(2.4, 1, 3.8, sh, s * 8.8, 0, zE - 1.9));
    g.add(at(elephant(m, 0.55), s * 8.8, 1, zE - 1.9));
    g.add(at(lion(0.55, m), s * (W / 2 + 0.6), P / 2 + 1, (z1 + z2) / 2));
    g.add(at(statue(2.4, m), s * 8.6, P, z0 - 1.4));
  }
  return mergeByMaterial(g);
}

export function buildRamMandir() {
  const m = M.pink, sh = M.pinkShade, g = new THREE.Group();
  // The plinth in three tiers, each following the plan's offsets, and the stair at its front.
  g.add(planPrism(plinthPlan(4), 0, 2, sh), planPrism(plinthPlan(2), 2, 2, m), planPrism(plinthPlan(0), 4, P - 4, sh));
  g.add(stair(P, 44, m, sh));
  // The sanctum and the five halls, three storeys each (js/details/ram-mandir.js), and the porch.
  const [sx, sz, sw] = SANCTUM, foot = [[sx, sz, sw / 2], ...HALLS.map(([x, z, w]) => [x, z, w / 2])];
  g.add(at(sanctum(m, sh), sx, P, sz));
  HALLS.forEach(([x, z, w, roofs, doors], i) => {
    const others = foot.filter((_, k) => k !== i + 1);
    g.add(at(hall(w, roofs, m, sh, { doors, others, x0: x, z0: z }), x, P, z));
  });
  g.add(at(porch(m, sh), 0, P, 0));
  addDetails(g, g);
  return { group: g, view: [0.95, 0.38, 1.15], batch: true };
}

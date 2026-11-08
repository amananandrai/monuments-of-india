import * as THREE from 'three';
import { M, mesh, box, at, onFace, FACES, shikhara, flag, nagaraProfile, planPrism } from '../helpers.js';
import { mandap } from '../details/temples.js';
import { mergeByMaterial } from '../details/components.js';
import { statue } from '../details/sculpture.js';
import { elephant, lion } from '../details/animals.js';
import { addDetails, plinthPlan } from '../details/ram-mandir.js';

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
  const P = 6.5;
  g.add(planPrism(plinthPlan(4), 0, 2, sh), planPrism(plinthPlan(2), 2, 2, m), planPrism(plinthPlan(0), 4, P - 4, sh));
  g.add(stair(P, 44, m, sh));
  // Garbhagriha with the main shikhara and four attached minor spires
  const gz = -26;
  g.add(box(22, 12, 22, m, 0, P, gz));
  g.add(box(24, 1.2, 24, sh, 0, P + 12, gz));
  const main = shikhara(19, 30, m, nagaraProfile, 18);
  g.add(at(main, 0, P + 13.2, gz));
  g.add(at(flag(7, M.saffron), 0, P + 13.2 + main.userData.top - 1, gz));
  for (const a of FACES) {
    const u = onFace(at(shikhara(8, 14, m, nagaraProfile, 10), 0, P + 13.2, 0), a, 9.5);
    u.position.z += gz;
    g.add(u);
  }
  // The halls, with doorways on the faces that stand free: the front hall's front and sides, the
  // middle hall's sides, and the outer face of each side hall.
  const side = [Math.PI / 2, -Math.PI / 2];
  g.add(at(mandap(24, 10, 8, m, sh), 0, P, -3));
  g.add(at(mandap(18, 9, 7, m, sh, side), 0, P, 17));
  g.add(at(mandap(14, 8, 6, m, sh, [0, ...side]), 0, P, 33));
  for (const x of [-17, 17]) g.add(at(mandap(10, 8, 5, m, sh, [Math.sign(x) * Math.PI / 2]), x, P, -3));
  addDetails(g, g);
  return { group: g, view: [0.95, 0.38, 1.15] };
}

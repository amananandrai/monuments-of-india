import * as THREE from 'three';
import { M, box, group, at, onFace, FACES, shikhara, flag, nagaraProfile } from '../helpers.js';
import { mandap } from '../details/temples.js';
import { addDetails } from '../details/ram-mandir.js';

export function buildRamMandir() {
  const m = M.pink, sh = M.pinkShade, g = new THREE.Group();
  g.add(box(62, 2, 96, sh));
  g.add(box(58, 2, 92, m, 0, 2));
  g.add(box(54, 2.5, 88, sh, 0, 4));
  const P = 6.5;
  for (let i = 0; i < 6; i++) g.add(box(10, P - i * 1.08, 1.4, m, 0, 0, 44 + 1.4 * i + 0.7));
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

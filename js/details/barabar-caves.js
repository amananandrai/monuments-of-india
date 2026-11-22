import * as THREE from 'three';
import { M, mat, box, cyl, at, flag, inst, unitBox } from '../helpers.js';
import { trees, shrubs, asiBoard, scatter, along } from '../parts/realism.js';
import { rockY, FW, FH, POLISHED, DOMES } from '../monuments/barabar-caves.js';
import { detail } from '../detail.js';

const WHITE = mat('#ece7dc', 0.85), INK = mat('#6c635a', 0.6);

// Barabar, finer detail and setting. From photographs: Ashoka's dedication, a short Brahmi
// inscription, cut beside the doorway of Sudama; a stair of rough steps
// climbing the rock east of the face towards the shrine of Siddheshwarnath on the summit, a small
// white temple with a saffron flag; the dry plain below planted with palmyra palms, mango and
// scrub; and a path from the road to the ledge before the caves. Dimensions follow
// js/monuments/barabar-caves.js: the face FW wide and FH high at z = 0, the caves at x = -8 and 8,
// the domes of rock in DOMES.
export function addDetails(f, g, { R }) {
  // Inscription panels beside the plain doorways: rows of tiny incised letters.
  const ins = [];
  for (const x0 of [9.4]) for (let r = 0; r < 4; r++) for (let k = 0; k < 9; k++) ins.push([x0 + k * 0.13, 2.4 + r * 0.22, 0.01, 0.07, 0.1, 0.01, 0]);
  f.add(inst(unitBox(), ins, INK));
  // Rough steps up the rock beside the face, and the summit shrine.
  const st = [];
  for (let k = 0; k < 44; k++) {
    const x = FW / 2 + 6 + k * 0.5, z = -1 - k * 0.75, y = rockY(x, z);
    if (y > 0.3) st.push([x, y - 0.35, z, 2, 0.6, 1, 0.3]);
  }
  g.add(inst(unitBox(), st, POLISHED));
  // The temple on the summit of the dome.
  const [cx, , cz, , ry] = DOMES[0], t = new THREE.Group();
  t.add(box(5, 3.4, 5, WHITE, 0, 0, 0), box(5.6, 0.3, 5.6, WHITE, 0, 3.4, 0), cyl(0.4, 2.2, 3.6, WHITE, 0, 3.7, 0, 12), at(flag(3, M.flagSaffron), 1.6, 3.7, 0));
  g.add(at(t, cx, ry - 0.6, cz));
  // The path to the ledge, the board, and palms, mango and scrub on the plain.
  g.add(box(3, 0.05, 70, M.path, -4, 0, 44));
  g.add(asiBoard('Barabar Caves', 4, 14, -0.3));
  g.add(trees(along(5, [30, 30], [44, 80]), { kind: 'palm', seed: 2 }));
  const plain = scatter(60, [-300, 300, 14, 300], { seed: 3, gap: 16 }).filter(([x, z]) => Math.abs(x + 4) > 8 && !(x < 10 && x > -120 && z < 110));
  g.add(trees(plain.slice(0, 24), { kind: 'palm', seed: 3 }), trees(plain.slice(24, 44), { kind: 'mango', seed: 4 }), trees(plain.slice(44), { kind: 'babul', seed: 5 }));
  g.add(shrubs(scatter(60, [-160, 160, -40, 0], { seed: 6, gap: 6 }).filter(([x]) => Math.abs(x) > FW / 2 + 2).map(([x, z]) => [x, z]), { dry: true }));
  void detail; void FH; void R;
}

import * as THREE from 'three';
import { M, box, at, sheet } from '../helpers.js';
import { mergeByMaterial } from '../parts/components.js';
import { steps } from '../parts/doorways.js';
import { trees, shrubs, lampPosts, benches, asiBoard, scatter, along } from '../parts/realism.js';
import { detail } from '../detail.js';
import { T, BRICK, BRICK_DARK } from '../monuments/talatal-ghar.js';

// Talatal Ghar, finer detail. From photographs: the terraces of the ruin are grassed over where
// their roofs have fallen; brick stairs climb the outside from one terrace to the next; the
// parapets are broken, standing in stretches; and small shrubs grow from the brickwork.
// Measures follow js/monuments/talatal-ghar.js.
function ruin(f) {
  const d = new THREE.Group(), st = T.storeys;
  // Grass on each terrace, round the storey above it.
  for (let k = 0; k < st.length - 1; k++) {
    const [w, dd, y, h] = st[k], top = y + h + 0.45;
    d.add(box(w - 0.6, 0.06, dd - 0.6, M.grass, 0, top, 0));
  }
  // Stretches of broken parapet along the terraces' edges.
  for (let k = 0; k < st.length - 1; k++) {
    const [w, dd, y, h] = st[k], top = y + h + 0.45;
    for (const s of [-1, 1]) for (let x = -w / 2 + 2; x < w / 2 - 4; x += 7) {
      const len = 2 + ((x * 7.3 + k * 3) % 3.5 + 3.5) % 3.5;
      d.add(box(len, 0.7 + ((x + k) % 2 === 0 ? 0.35 : 0), 0.5, BRICK_DARK, x + len / 2, top, s * (dd / 2 - 0.3)));
    }
  }
  // Brick stairs up the front, from the ground to the first terrace and on to the second.
  const [s0, s1] = st;
  for (const x of [-22, 22]) d.add(at(steps(2.6, s0[2] + s0[3] + 0.45, 24, BRICK, 0.3), x, 0, s0[1] / 2));
  d.add(at(steps(2.4, s1[3] + 0.45, 14, BRICK, 0.3), 0, s1[2] + 0.02, s1[1] / 2));
  f.add(mergeByMaterial(d));
  // Shrubs rooted in the terraces.
  if (!detail.low) f.add(shrubs([[-30, 18], [24, -16], [-12, -9], [16, 12], [-28, -12], [30, 11]].map(([x, z], i) => [x, z, 0.9, i < 2 ? st[0][2] + st[0][3] + 0.5 : st[1][2] + st[1][3] + 0.5]), { seed: 11 }));
}

// Rangpur round the palace: a mown lawn with a path to the front, an Ahom tank to the south-west
// with brick steps down to it, and groves of mango, areca palm and banyan beyond, with sal forest
// on the horizon.
export function addDetails(f, g) {
  ruin(f);
  const [s0] = T.storeys;
  g.add(box(460, 0.06, 420, M.grass, 0, -0.06, 0));
  g.add(box(6, 0.05, 60, M.path, 0, 0, s0[1] / 2 + 32), box(130, 0.05, 4, M.path, 0, 0.001, s0[1] / 2 + 8), box(240, 0.05, 8, M.asphalt, 0, 0, s0[1] / 2 + 66));
  // The tank.
  g.add(box(70, 0.6, 50, BRICK_DARK, -110, -0.55, 50), sheet(66, 46, M.lake, -110, 0.05, 50));
  g.add(trees(scatter(22, [-200, 200, -170, 110], { seed: 6, gap: 15, avoid: [[-60, 60, -36, 62], [-150, -70, 20, 80], [-130, 130, 56, 76]] }), { kind: 'mango', seed: 6 }));
  g.add(trees([[80, -60], [-80, -70], [100, 40]], { kind: 'banyan', seed: 2 }));
  g.add(trees([...along(6, [-100, 80], [-30, 80]), ...along(6, [30, 80], [100, 80]), ...along(5, [-90, -40], [-90, 10]), ...along(5, [80, -40], [80, 10])], { kind: 'palm', seed: 9, h: 12 }));
  g.add(trees(scatter(30, [-230, 230, -220, -140], { seed: 12, gap: 14 }), { kind: 'sal', seed: 12 }));
  g.add(shrubs(scatter(16, [-70, 70, -40, 60], { seed: 8, gap: 9, avoid: [[-52, 52, -25, 26], [-4, 4, 20, 62]] }), { seed: 8 }));
  g.add(lampPosts([...along(4, [-4, 28], [-4, 58]), ...along(4, [4, 28], [4, 58])]));
  g.add(benches([[-10, 34], [10, 34], [-10, 50], [10, 50]]));
  g.add(asiBoard('Talatal Ghar', 7, s0[1] / 2 + 60, 0));
}

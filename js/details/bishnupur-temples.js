import * as THREE from 'three';
import { M, mat, box, at, onFace, FACES, surface } from '../helpers.js';
import { beltCourse, mergeByMaterial } from '../parts/components.js';
import { steps } from '../parts/doorways.js';
import { trees, shrubs, lampPosts, benches, asiBoard, scatter, along } from '../parts/realism.js';
import { detail } from '../detail.js';
import { BRICK_DARK, PLAQUES, LATERITE, SITES, SHYAM, JOR, RAS } from '../monuments/bishnupur-temples.js';

// Bishnupur, finer detail. From photographs: the walls of Shyam Rai and Jor Bangla are covered
// with terracotta plaques (the Ras circle, scenes from the epics, boats and hunts): a deep panel
// over the three arches of each porch, panels either side of them, and two friezes along the foot
// of every wall; the Rasmancha is plainer, a band of lotus plaques over its arcade. Dimensions
// follow js/monuments/bishnupur-temples.js.
const LIFT = 0.03;
// A plaque panel w × h on a wall at z = 0, its foot at y.
const plaque = (w, h, y, x = 0) => box(w, h, LIFT, PLAQUES, x, y, LIFT / 2);

// The dress of a triple-arched front `len` long whose wall stands from y0 to y0 + wall: the
// panel over the arches, the panels beside them, and the two friezes at the foot.
function front(len, y0, wall, half = 3.15) {
  const g = new THREE.Group(), sw = len / 2 - half - 0.35;
  g.add(plaque(len - 0.5, wall - 2.95, y0 + 2.85));
  for (const s of [-1, 1]) {
    const x = s * (half + 0.1 + sw / 2);
    g.add(plaque(sw, 1.75, y0 + 0.95, x), plaque(sw, 0.3, y0 + 0.12, x), plaque(sw, 0.3, y0 + 0.52, x));
  }
  return g;
}
// A plain wall `len` long dressed in a grid of plaque panels over the two friezes.
function panelled(len, y0, wall, n) {
  const g = new THREE.Group(), pw = (len - 0.6) / n;
  for (let k = 0; k < n; k++) {
    const x = (k - (n - 1) / 2) * pw;
    g.add(plaque(pw - 0.22, (wall - 1.35) / 2 - 0.1, y0 + 0.95, x), plaque(pw - 0.22, (wall - 1.35) / 2 - 0.1, y0 + 0.95 + (wall - 1.35) / 2 + 0.08, x));
  }
  g.add(plaque(len - 0.5, 0.3, y0 + 0.12), plaque(len - 0.5, 0.3, y0 + 0.52));
  return g;
}

function architecture(f) {
  const d = new THREE.Group(), STEP = mat('#6f4a3c', 0.95);
  // Shyam Rai: all four fronts alike; mouldings on the plinth; steps to each porch.
  const s = at(new THREE.Group(), SITES.shyam[0], 0, SITES.shyam[1]);
  for (const a of FACES) {
    s.add(onFace(front(SHYAM.W, SHYAM.P, SHYAM.WALL), a, SHYAM.W / 2));
    s.add(onFace(steps(4.4, SHYAM.P, 4, STEP, 0.34), a, SHYAM.W / 2 + 0.9));
  }
  s.add(beltCourse(SHYAM.W + 1.8, SHYAM.W + 1.8, SHYAM.P - 0.16, 0.16, 0.1, BRICK_DARK), beltCourse(SHYAM.W, SHYAM.W, SHYAM.P + SHYAM.WALL - 0.12, 0.12, 0.07, BRICK_DARK));
  d.add(s);
  // Jor Bangla: the porch's front, panelled flanks and back, steps in front.
  const j = at(new THREE.Group(), SITES.jor[0], 0, SITES.jor[1]), { L, D, P, WALL } = JOR;
  j.add(at(front(L, P, WALL, 3.2), 0, 0, D));
  j.add(onFace(panelled(L, P, WALL, 5), Math.PI, D));
  for (const a of [Math.PI / 2, -Math.PI / 2]) for (const z of [-1, 1]) j.add(onFace(panelled(D - 0.3, P, WALL, 2), a, L / 2, z * (D / 2) * (a > 0 ? -1 : 1)));
  j.add(at(steps(4.6, P, 4, STEP, 0.34), 0, 0, D + 0.9));
  j.add(beltCourse(L + 1.6, 2 * D + 1.8, P - 0.16, 0.16, 0.1, BRICK_DARK));
  d.add(j);
  // The Rasmancha: lotus plaques over the arcade, a moulding on the plinth, steps up each side.
  const r = at(new THREE.Group(), SITES.ras[0], 0, SITES.ras[1]);
  for (const a of FACES) {
    r.add(onFace(plaque(RAS.W - 0.6, 0.45, RAS.P + 2.8), a, RAS.W / 2));
    r.add(onFace(steps(5, RAS.P, 6, LATERITE, 0.36), a, RAS.PL / 2));
  }
  r.add(beltCourse(RAS.PL, RAS.PL, RAS.P - 0.2, 0.2, 0.1, LATERITE));
  d.add(r);
  mergeByMaterial(d);
  f.add(d);
}

// The setting: the Survey's lawns round each temple, hedged, with walks of red laterite gravel
// between them, and the trees of the Bankura country: mango and neem, sal beyond, palmyra-like
// palms on the skyline.
export function addDetails(f, g) {
  architecture(f);
  const GRAVEL = surface(mat('#a9694c', 0.95), 'ground');
  const [rx, rz] = SITES.ras, [sx, sz] = SITES.shyam, [jx, jz] = SITES.jor;
  // Walks: one across between the two brick temples, one up to the Rasmancha, a ring round each.
  g.add(box(jx - sx - 16, 0.05, 3, GRAVEL, 0, 0, sz), box(3, 0.05, sz - rz - 15, GRAVEL, 0, 0.002, (sz + rz + 15) / 2 - 0.5), box(3, 0.05, 40, GRAVEL, 0, 0.002, sz + 20));
  const ring = (x, z, w, dd) => { for (const s of [-1, 1]) g.add(box(w + 4, 0.05, 2, GRAVEL, x, 0.004, z + s * (dd / 2 + 1)), box(2, 0.05, dd, GRAVEL, x + s * (w / 2 + 1), 0.006, z)); };
  ring(rx, rz, 32, 32); ring(sx, sz, 19, 19); ring(jx, jz, 19, 19);
  const keep = [[rx - 20, rx + 20, rz - 20, rz + 20], [sx - 13, sx + 13, sz - 13, sz + 13], [jx - 13, jx + 13, jz - 13, jz + 13], [-3, 3, rz, 62], [sx, jx, sz - 3, sz + 3]];
  // Clipped hedges along the walks.
  const hedge = [];
  for (const [x, z, h] of [[rx, rz, 20.5], [sx, sz, 13.5], [jx, jz, 13.5]]) for (const s of [-1, 1]) hedge.push(...along(detail.low ? 8 : 14, [x - h, z + s * h], [x + h, z + s * h]), ...along(detail.low ? 8 : 14, [x + s * h, z - h], [x + s * h, z + h]));
  g.add(shrubs(hedge.filter(([x, z]) => Math.abs(x) > 3 && !(Math.abs(z - sz) < 3 && Math.abs(x) < jx)).map(([x, z]) => [x, z, 0.9]), { seed: 4 }));
  g.add(trees(scatter(22, [-95, 95, -75, 70], { seed: 5, gap: 16, avoid: keep }), { kind: 'mango', seed: 5 }));
  g.add(trees(scatter(14, [-100, 100, -80, 75], { seed: 9, gap: 18, avoid: keep }), { kind: 'neem', seed: 9 }));
  g.add(trees(scatter(46, [-200, 200, -180, -85], { seed: 14, gap: 12 }), { kind: 'sal', seed: 14 }));
  g.add(trees([[-70, -40], [-84, 12], [78, -36], [88, 30], [-58, 58], [62, 60]], { kind: 'palm', seed: 3, h: 13 }));
  g.add(lampPosts([...along(3, [-2.4, sz + 8], [-2.4, sz + 36]), ...along(3, [2.4, sz + 8], [2.4, sz + 36])]));
  g.add(benches([[-8, sz + 2.6], [8, sz + 2.6], [-2.6, 2], [2.6, -6]]));
  g.add(asiBoard('Rasmancha', 7, rz + 21, 0), asiBoard('Shyam Rai Temple', sx + 8, sz + 15, 0), asiBoard('Jor Bangla Temple', jx - 8, jz + 15, 0));
}

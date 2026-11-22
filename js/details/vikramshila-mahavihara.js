import * as THREE from 'three';
import { M, mat, surface, box, at, onFace, FACES, inst, unitBox, rng } from '../helpers.js';
import { mergeByMaterial } from '../parts/components.js';
import { figure } from '../parts/sculpture.js';
import { trees, shrubs, scatter, along, asiBoard, lampPosts, benches } from '../parts/realism.js';
import { detail } from '../detail.js';

// Vikramshila's brick, old and weathered to a dull red-brown; its terracotta plaques; and the lime
// stucco of the Buddhas, gone grey.
export const BRICK = surface(mat('#8f5c47', 0.95), 'terracotta');
export const BRICK_DARK = surface(mat('#71483a', 0.95), 'terracotta');
export const PLAQUES = surface(mat('#ab6e4e', 0.9), 'plaques');
const STUCCO = mat('#b9ae98', 0.9);

// A cruciform block, `span` across each way and its arms `arm` wide, h high from y, the corners
// between the arms filled out in a step (as the stupa's plan steps round in offsets): a list of
// three boxes.
export function cross(span, arm, h, m, y = 0, z = 0) {
  const g = new THREE.Group(), mid = (span + arm) / 2;
  g.add(box(span, h, arm, m, 0, y, z), box(arm, h, span, m, 0, y, z), box(mid, h, mid, m, 0, y, z));
  return g;
}

// Vikramshila, finer detail. From photographs and the excavation reports: brick mouldings above
// and below the bands of plaques; on each side of the core, on the upper terrace, a chamber with
// its antechamber of brick pillar bases, and in it the great seated Buddha in stucco (the knees
// and lap are what is left of most of them); before each, on the lower terrace, a pillared hall
// of which only the pillar bases remain.
function architecture(f, { T, L1, L2, C, y0 }) {
  const d = new THREE.Group();
  for (const [span, arm, y] of [[L1[0], L1[1], 0], [L2[0], L2[1], T]]) {
    d.add(cross(span + 0.4, arm + 0.4, 0.25, BRICK_DARK, y + 0.3), cross(span + 0.3, arm + 0.3, 0.2, BRICK_DARK, y + 1.6), cross(span + 0.5, arm + 0.5, 0.3, BRICK_DARK, y + T - 0.3));
  }
  // The four chambers: a brick cell built out from the core on the upper terrace, open to the
  // outside, its dark interior behind the Buddha.
  const buddhas = [];
  for (const a of FACES) {
    const c = onFace(at(new THREE.Group(), 0, y0, 0), a, C[0] / 2);
    for (const s of [-1, 1]) c.add(box(1.2, 4.6 - (s + 1) * 0.4, 4.6, BRICK, s * 3.4, 0, 2.3));
    c.add(box(5.6, 3.6, 0.05, M.recess, 0, 0.3, 0.03), box(5.8, 0.4, 4.4, BRICK, 0, 0, 2.2));
    // The antechamber's pillar bases.
    for (const s of [-1, 1]) for (const z of [5.2, 7.2]) c.add(box(0.9, 0.5 + (z > 6 ? 0 : 0.4), 0.9, BRICK_DARK, s * 2.2, 0, z));
    d.add(c);
    buddhas.push([a, C[0] / 2 + 1.4]);
    // The mandapa before it on the lower terrace: pillar bases in four rows.
    const m = onFace(at(new THREE.Group(), 0, T, 0), a, L2[0] / 2);
    for (let i = 0; i < 3; i++) for (const x of [-4.5, -1.5, 1.5, 4.5]) m.add(box(0.8, 0.35 + ((i + x) % 2 ? 0.25 : 0), 0.8, BRICK_DARK, x, 0, 1.5 + i * 2.2));
    d.add(m);
  }
  f.add(mergeByMaterial(d));
  // The Buddhas, seated in meditation on their pedestals.
  const bg = new THREE.Group();
  for (const [a, dist] of buddhas) {
    const b = onFace(at(new THREE.Group(), 0, y0 + 0.4, 0), a, dist);
    b.add(box(3.2, 0.9, 1.8, STUCCO, 0, 0, 0), at(figure(2.8, STUCCO, 'seated'), 0, 0.9, 0.1));
    bg.add(b);
  }
  f.add(bg);
}

// The monastery round the stupa: a square 330 m across of 208 cells, 4.15 m square, in a row
// along each side behind a veranda, the walls standing a metre or two; a great gate on the north.
// Built as runs of wall in short lengths, instanced, with gaps where the brick is lost.
function monastery(g) {
  const R = rng(9), list = [], H = 165, cell = 4.15, back = H, front = H - cell - 1;
  const run = (x0, z0, x1, z1, t, hi) => {
    const len = Math.hypot(x1 - x0, z1 - z0), n = Math.max(1, Math.round(len / 4)), ry = Math.atan2(x1 - x0, z1 - z0);
    for (let k = 0; k < n; k++) {
      if (R() < 0.08) continue;
      const u = (k + 0.5) / n;
      list.push([x0 + (x1 - x0) * u, 0, z0 + (z1 - z0) * u, t, hi * (0.4 + 0.6 * R()), len / n + 0.02, ry]);
    }
  };
  for (const s of [-1, 1]) {
    run(s * back, -back, s * back, back, 1.6, 2.4);
    run(s * front, -front, s * front, front, 1.0, 1.4);
    run(-back, s * back, back, s * back, 1.6, 2.4);
    run(-front, s * front, front, s * front, 1.0, 1.4);
  }
  // The walls between the cells, on all four sides.
  for (let c = -front + cell; c < front; c += cell + 0.8) for (const s of [-1, 1]) {
    if (s > 0 && Math.abs(c) < 12) continue;
    list.push([c, 0, s * (back + front) / 2, 0.8, 1.2 + R() * 0.8, back - front, 0], [s * (back + front) / 2, 0, c, back - front, 1.2 + R() * 0.8, 0.8, 0]);
  }
  g.add(inst(unitBox(), list, BRICK_DARK));
  g.add(box(2 * front - 2, 0.08, 2 * front - 2, mat('#7c9350', 0.95), 0, -0.04, 0));
}

// Vikramshila at Antichak, on the plain of the Ganga: the stupa on its lawn at the middle of the
// monastery's ruins; paths from the north gate; the ASI's board, the site museum's low building;
// mango, peepal and palmyra trees, and the fields beyond.
export function addDetails(f, g, dims) {
  architecture(f, dims);
  g.add(box(1200, 0.1, 1200, M.grass, 0, -0.12, 0));
  monastery(g);
  g.add(box(5, 0.08, 130, M.path, 0, 0, 95), box(80, 0.08, 4, M.path, 0, 0, 40));
  g.add(lampPosts([...along(5, [-4, 40], [-4, 150]), ...along(5, [4, 40], [4, 150])]));
  g.add(benches([[-10, 40, 0], [10, 40, 0]]));
  g.add(asiBoard('Vikramshila Mahavihara', -8, 50, 0));
  // The museum, outside the monastery to the north-east.
  const mu = new THREE.Group();
  mu.add(box(30, 5, 14, mat('#e4d8c0', 0.85), 0, 0, 0), box(32, 0.5, 16, mat('#9a5a40', 0.85), 0, 5, 0), box(5, 3, 0.2, M.recess, 0, 0, 7.05));
  g.add(at(mergeByMaterial(mu), 90, 0, 200));
  const keep = [[-40, 40, -40, 40], [-10, 10, 30, 400]];
  g.add(trees(scatter(detail.low ? 14 : 28, [-150, 150, -150, 150], { seed: 4, gap: 18, avoid: keep }), { kind: 'mango', seed: 4 }));
  g.add(trees([[-60, 70], [70, -60], [-70, -70], [60, 72]], { kind: 'peepal', seed: 6 }));
  g.add(trees(scatter(detail.low ? 10 : 22, [-400, 400, -400, 400], { seed: 13, gap: 30, avoid: [[-175, 175, -175, 175]] }), { kind: 'palm', seed: 13 }));
  g.add(shrubs(scatter(30, [-120, 120, -120, 120], { seed: 8, gap: 6, avoid: keep }), { seed: 8, size: 1.2 }));
}

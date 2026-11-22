import * as THREE from 'three';
import { M, mat, box, cyl, at, inst, unitBox, unitCyl } from '../helpers.js';
import { heightField, fbm, smooth } from '../parts/terrain.js';
import { trees, shrubs, asiBoard, scatter } from '../parts/realism.js';
import { STONE, DRESSED, houses, RES } from '../monuments/dholavira.js';
import { detail } from '../detail.js';

const SALT = mat('#ece8dc', 0.9);
const BOARD = mat('#3a2e24', 0.9), SIGN = mat('#f1ece0', 0.6);

// Dholavira, finer detail and setting. From the excavation and photographs of the site: the two
// chambers of the north gate carry the polished bases of their columns, square and round; before
// the gate lies a copy of the great signboard, ten Harappan signs inlaid in white on a timber
// board; the ceremonial ground, a level open field, separates the castle from the middle town, whose
// houses stand to knee height on a grid of streets within its own wall; and the lower town spreads
// over the east of the city. Khadir Bet is a low island of dry scrub, and round it, to the
// horizon, the white salt of the Rann. Dimensions follow js/monuments/dholavira.js: the castle w by
// d, its platform at `top`, the gate between x = ±8 at z = d / 2, the city between cx0..cx1 and
// cz0..cz1.
export function addDetails(f, g, { w, d, top, pf, cx0, cx1, cz0, cz1, bx, R }) {
  const gz = d / 2;
  // The bases of the gate's columns: square slabs and round polished drums on each chamber.
  const bases = [], drums = [];
  for (const sx of [-1, 1]) for (let k = 0; k < 4; k++) {
    const x = sx * 5.25, z = gz - 15 + k * 4.2;
    bases.push([x, top + 2.4, z, 1.1, 0.25, 1.1, 0]);
    drums.push([x, top + 2.65, z, 0.8, 0.45, 0.8, 0]);
  }
  f.add(inst(unitBox(), bases, DRESSED), inst(unitCyl(16), drums, mat('#d9cfbb', 0.45)));
  // The signboard, lying on the ground beside the foot of the gate's stair.
  const sb = new THREE.Group(), signs = [];
  sb.add(box(3.4, 0.08, 0.45, BOARD, 0, 0, 0));
  for (let k = 0; k < 10; k++) signs.push([-1.5 + k * 0.33, 0.08, 0, 0.18, 0.03, 0.3, 0]);
  sb.add(inst(unitBox(), signs, SIGN));
  f.add(at(sb, 9, 0, gz + 14));
  // The middle town, north of the ceremonial ground, inside its own wall; the lower town to the
  // east.
  const mz0 = gz + 58, mz1 = cz1 - 14;
  g.add(inst(unitBox(), houses(-120, 120, mz0, mz1, 0, R, 10), STONE));
  const mw = [];
  for (const z of [mz0 - 4, mz1 + 2]) for (let x = -126; x < 126; x += 6) if (R() > 0.1) mw.push([x + 3, 0, z, 6.05, 1.5 + R() * 1.4, 4, 0]);
  for (const x of [-128, 128]) for (let z = mz0 - 4; z < mz1; z += 6) if (R() > 0.1) mw.push([x, 0, z + 3, 4, 1.5 + R() * 1.4, 6.05, 0]);
  g.add(inst(unitBox(), mw, DRESSED));
  g.add(inst(unitBox(), houses(140, cx1 - 12, gz + 30, cz1 - 14, 0, R, 10), STONE));
  // Paths for visitors: up to the gate across the ground, and round to the east reservoir.
  g.add(box(4, 0.05, mz0 - gz - 18, M.path, 0, 0, (gz + 14 + mz0 - 4) / 2), box(80, 0.05, 4, M.path, 60, 0, gz + 30));
  g.add(asiBoard('Dholavira', -8, gz + 26, 0, { line2: 'WORLD HERITAGE SITE' }));
  // Khadir Bet: low, scrubby hills rising round the city, falling at the island's edge to the salt.
  g.add(heightField(2600, 2600, detail.low ? 120 : 180, (x, z) => {
    const r = Math.hypot(x, (z - 60) * 1.15), inCity = smooth(370, 470, r);
    const hills = inCity * (10 + 45 * Math.max(0, fbm(x, z, { scale: 0.003, octaves: 4 }) + 0.3));
    if (x > cx0 - 30 && x < cx1 + 30 && z > cz0 - 30 && z < cz1 + 30) return -12;
    return -0.7 + hills * smooth(1150, 780, r) - 0.6 * smooth(900, 1150, r);
  }, { cz: 60, cover: '#a99872', rock: ['#9b8a6b', '#8a7a5e', '#a69476'], band: 6, steep: 0.82 }));
  // The salt beyond the island, round the square of ground.
  for (const [x, z, w, d] of [[0, 60 - 2900, 9000, 3200], [0, 60 + 2900, 9000, 3200], [-2900, 60, 3200, 2600], [2900, 60, 3200, 2600]]) g.add(box(w, 0.2, d, SALT, x, -1.5, z));
  // Thorn scrub: babul, khejri and ber, on the island round the city, thinner inside its walls.
  const out = ([x, z]) => x < cx0 - 20 || x > cx1 + 20 || z < cz0 - 20 || z > cz1 + 20;
  g.add(trees(scatter(70, [-650, 650, -500, 700], { seed: 4, gap: 22 }).filter(out), { kind: 'babul', seed: 4 }));
  g.add(trees(scatter(40, [-650, 650, -500, 700], { seed: 7, gap: 24 }).filter(out), { kind: 'khejri', seed: 7 }));
  g.add(trees(scatter(14, [cx0 + 10, cx1 - 10, cz0 + 10, cz1 - 10], { seed: 9, gap: 30, avoid: [[-w / 2 - 110, w / 2 + 10, -d / 2 - 10, d / 2 + 30], ...RES.map(([x, z, rw, rl]) => [x - rw / 2 - 4, x + rw / 2 + 4, z - rl / 2 - 4, z + rl / 2 + 4]), [-130, 130, gz + 10, gz + 55]] }), { kind: 'ber', seed: 9 }));
  g.add(shrubs(scatter(120, [-500, 500, -400, 600], { seed: 12, gap: 8 }).filter(out), { dry: true, size: 1 }));
  // The site museum and the rest house, south-east of the city.
  const mus = new THREE.Group();
  mus.add(box(26, 4.5, 12, mat('#d8c9a8', 0.9), 0, 0, 0), box(28, 0.4, 14, mat('#8d7a5c', 0.9), 0, 4.5, 0));
  mus.add(cyl(0.12, 0.12, 6, mat('#5b5b5b', 0.6), 16, 0, 0, 6));
  g.add(at(mus, cx1 + 60, 0, cz0 + 10));
  void bx;
}

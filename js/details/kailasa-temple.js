import * as THREE from 'three';
import { mat, mesh, cyl, at, onFace, FACES } from '../helpers.js';
import { pilasters, templeNiche, idol, mouldings, frieze, mergeByMaterial } from './components.js';
import { trees, shrubs, asiBoard, scatter } from './realism.js';

// Kailasa, Ellora, finer detail. From photographs: above the elephant frieze the plinth ends in a
// carved moulding; the walls of the hall and the shrine, cut from the living rock, are divided by
// pilasters into bays, each with a niche and its image; the storeys of the vimana have kudus along
// their cornices; and the victory pillars (dhvajastambhas) are carved in bands up their shafts.
// Dimensions follow js/monuments/kailasa-temple.js: plinth 40 × 62 and 8 high at z = -12; the hall
// 22 × 24 at z = 5 and the shrine 20 square at z = -26, both 8 high from y = 8.
const ROCK = mat('#6f675e', 0.95), ROCK_DARK = mat('#57514a', 0.95);
function architecture(f) {
  const d = new THREE.Group();
  d.add(at(mouldings(40, 62, [[6.6, 0.6, 0.25], [7.2, 0.8, 0.12, frieze(ROCK)]], ROCK_DARK), 0, 0, -12));
  for (const [w, dd, z] of [[22, 24, 5], [20, 20, -26]]) {
    for (const a of FACES) {
      const long = Math.abs(Math.sin(a)) > 0.5, len = long ? dd : w, dist = (long ? w : dd) / 2;
      if (a === 0) continue; // the hall's doorway, and the shrine's face against the hall
      const n = Math.max(2, Math.round(len / 5)), t = at(new THREE.Group(), 0, 0, z);
      t.add(onFace(at(pilasters(len - 1, n + 1, 0.7, 7.6, 0.18, ROCK), 0, 8.2, 0), a, dist));
      for (let k = 0; k < n; k++) t.add(onFace(at(templeNiche(1.5, 3.4, ROCK, { figure: idol(3, ROCK) }), 0, 9.6, 0), a, dist, -(len - 1) / 2 + (k + 0.5) * ((len - 1) / n)));
      d.add(t);
    }
  }
  // Kudus along the lower two cornices of the vimana (w = 19, 3 tiers of 3.4 from y = 16).
  const tg = new THREE.TorusGeometry(0.45, 0.12, 4, 10, Math.PI * 1.3).rotateZ(-Math.PI * 0.15);
  for (let i = 0; i < 2; i++) {
    const tw = 19 * (1 - (0.45 * i) / 3), n = Math.floor((tw * 0.7) / 1.5), y = 16 + i * 3.4 + 3.4 * 0.86;
    for (const a of FACES) for (let k = 0; k < n; k++) { const o = onFace(mesh(tg, ROCK, 0, y, 0), a, (tw + 0.8) / 2 + 0.07, -tw * 0.35 + (k + 0.5) * ((tw * 0.7) / n)); o.position.z += -26; d.add(o); }
  }
  for (const x of [-15, 15]) for (const y of [5, 8.5, 12]) d.add(cyl(1.13 - y * 0.012, 1.13 - y * 0.012, 0.8, frieze(ROCK), x, y, 30, 8));
  mergeByMaterial(d);
  f.add(d);
}

// Kailasa at Ellora: the scrub and trees on the basalt above the scarp round the great court cut
// down into the rock, and the ASI board.
export function addDetails(f, g) {
  architecture(f);
  const H = 32;
  const top = [...scatter(30, [-74, 74, -84, -52], { seed: 5, gap: 8 }), ...scatter(16, [-74, -30, -48, 48], { seed: 6, gap: 9 }), ...scatter(16, [30, 74, -48, 48], { seed: 7, gap: 9 })];
  g.add(trees(top.filter((_, i) => i % 2 === 0), { kind: 'mango', seed: 8, y: H, h: 7 }), shrubs(top.filter((_, i) => i % 2).map(([x, z]) => [x, z, 2.4]), { y: H, dry: true, seed: 9 }));
  g.add(asiBoard('Kailasa Temple, Ellora (Cave 16)', 10, 62, 0, { line2: 'WORLD HERITAGE SITE' }));
}

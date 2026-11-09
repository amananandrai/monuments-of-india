import * as THREE from 'three';
import { at, onFace, FACES, flag, mat } from '../helpers.js';
import { mouldings, frieze, templeNiche, idol, mergeByMaterial } from './components.js';
import { trees, scatter } from './realism.js';
import { nilachal } from '../monuments/kamakhya-temple.js';

// Kamakhya, finer detail. From photographs: the cross-shaped base of the sanctum is banded with
// carved friezes and set with sculpted panels of deities (Ganesha among them) in niches; the
// Natmandir's walls are carved in a band under the eaves of its curved roof.
// Dimensions follow js/monuments/kamakhya-temple.js: the hilltop at T = 40, the sanctum's base
// (beehive r = 9: arms 19.8 × 12.6) from T + 2.5 to T + 10.6 at z = -14.
const STONE = mat('#a08766', 0.9), STONE_DARK = mat('#7c6a52', 0.9);
function architecture(f) {
  const d = new THREE.Group(), T = 40, r = 9, y0 = T + 2.5, s = at(new THREE.Group(), 0, y0, -14);
  s.add(mouldings(r * 2.2, r * 1.4, [[0.02, 0.6, 0.25, STONE_DARK], [r * 0.9 - 1.2, 0.7, 0.08, frieze(STONE)]], STONE));
  s.add(mouldings(r * 1.4, r * 2.2, [[0.03, 0.6, 0.25, STONE_DARK], [r * 0.9 - 1.19, 0.7, 0.08, frieze(STONE)]], STONE));
  for (const a of FACES) for (const lat of [-2.4, 2.4]) s.add(onFace(at(templeNiche(1.5, 3, STONE, { figure: idol(2.5, STONE), crown: false }), 0, 1.6, 0), a, r * 1.1, lat));
  d.add(s);
  // The Natmandir (16 × 6 × 20 at (0, T, 18)): a carved band under its eaves.
  d.add(at(mouldings(16, 20, [[5, 0.7, 0.06, frieze(STONE)]], STONE), 0, T, 18));
  mergeByMaterial(d);
  f.add(d);
}

// Kamakhya on the Nilachal hill above Guwahati: the forest that covers the hill, and the red flags
// of the goddess on the temple terrace.
const RED = mat('#c62a2a', 0.8, 0, { side: 2 });
export function addDetails(f, g) {
  architecture(f);
  const T = 40, slope = scatter(90, [-145, 145, -145, 145], { seed: 3, gap: 11 }).filter(([x, z]) => { const r = Math.hypot(x, z); return r > 64 && r < 158; });
  for (const s of slope) s.push(nilachal(s[0], s[1]) - 0.4);
  // Each tree stands on the slope, at the hill's height where it grows.
  g.add(trees(slope.map(([x, z, y]) => [x, z, null, y]), { kind: 'mango', seed: 4, h: 9 }));
  for (const [x, z] of [[-30, -36], [30, -36], [-30, 36], [30, 36], [0, 46]]) f.add(at(flag(6, RED), x, T, z));
}

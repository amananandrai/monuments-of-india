import * as THREE from 'three';
import { M, mat, box, at, onFace, FACES } from '../helpers.js';
import { panel, frieze, railing, pilasters, beltCourse, mergeByMaterial } from '../parts/components.js';
import { trees, shrubs, lampPosts, scatter, along } from '../parts/realism.js';

// The Statue of Unity, finer detail. From photographs: the top tier of the pedestal is faced with
// bronze relief panels, three to a side, between stone bands; the terraces below are edged with
// railings for the viewing walks; and the concrete stages are banded. Dimensions follow
// js/monuments/statue-of-unity.js: stages 82, 62 and 46 square, to 22, 42 and 55.6. Also: stone
// fins between the bronze panels of the top tier and a cornice under its plinth; the museum's
// glazed entrance at the head of the front steps; reveals round the corner towers.
const GLASS = mat('#2b3b48', 0.15, 0.6), STONE = mat('#8e8a83', 0.9), STONE_DARK = mat('#6f6b65', 0.9);
function architecture(f) {
  const d = new THREE.Group();
  for (const a of FACES) {
    for (const l of [-14, 0, 14]) d.add(onFace(at(panel(11, 10, 0.5, M.marbleShade, frieze(M.bronze)), 0, 45, 0), a, 23.01, l));
    for (const [w, y] of [[82, 22], [62, 42]]) d.add(onFace(at(railing(w - 2, 1.1, 0.18, M.steel, 2.5, M.steel), 0, y, 0), a, w / 2 - 0.6));
    for (const [w, y] of [[82, 10.5], [62, 31.5]]) d.add(onFace(box(w, 0.5, 0.2, M.marbleShade, 0, y, 0.1), a, w / 2));
  }
  // The top tier: stone fins between and beside the bronze panels, and a cornice under the plinth.
  for (const a of FACES) d.add(onFace(at(pilasters(42.8, 4, 1.2, 12.9, 0.4, M.marbleShade), 0, 42.3, 0), a, 23), onFace(at(pilasters(14, 2, 1.2, 12.9, 0.4, M.marbleShade), 0, 42.3, 0), a, 23));
  d.add(beltCourse(46, 46, 54.6, 0.7, 0.35, M.marbleShade));
  // The museum's entrance at the head of the front steps: a glazed wall between the fins, its
  // transoms and frame of steel, under a stone lintel.
  d.add(box(24, 9.2, 0.06, GLASS, 0, 8.8, 41.03));
  for (let y = 11.8; y < 18; y += 3) d.add(box(24, 0.15, 0.1, M.steel, 0, y, 41.08));
  for (const s of [-1, 1]) d.add(box(0.4, 9.2, 0.4, M.steel, s * 12.2, 8.8, 41.2));
  d.add(box(27, 1, 1.4, STONE_DARK, 0, 18, 42.3));
  // Reveals round the corner towers.
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) for (const y of [7, 14]) d.add(at(beltCourse(10.4, 10.4, y, 0.4, 0.1, STONE), sx * 37, 0, sz * 37));
  mergeByMaterial(d);
  f.add(d);
}

// The Statue of Unity at Kevadia: the beds of the Valley of Flowers laid out on the bank below it,
// and lamps.
export function addDetails(f, g) {
  architecture(f);
  const beds = ['#d0306f', '#f2c21c', '#f08a1c', '#7a3f8f', '#f4f1ea', '#d9342b'];
  beds.forEach((c, i) => g.add(shrubs(scatter(14, [-78, 78, 58 + i * 3.6, 61 + i * 3.6], { seed: 6 + i, gap: 2.5 }).map(([x, z]) => [x, z, 1.4]), { y: 0.3, flowers: c, seed: 6 + i })));
  g.add(trees([...along(8, [-78, -78], [-78, 78]), ...along(8, [78, -78], [78, 78])], { kind: 'neem', seed: 13, y: 0.3 }));
  g.add(lampPosts([...along(6, [-46, -46], [-46, 46]), ...along(6, [46, -46], [46, 46])], { y: 0.3 }));
}

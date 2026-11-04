import * as THREE from 'three';
import { M, box, at, onFace, FACES } from '../helpers.js';
import { panel, frieze, railing, mergeByMaterial } from './components.js';
import { trees, shrubs, lampPosts, scatter, along } from './realism.js';

// The Statue of Unity, finer detail. From photographs: the top tier of the pedestal is faced with
// bronze relief panels, three to a side, between stone bands; the terraces below are edged with
// railings for the viewing walks; and the concrete stages are banded. Dimensions follow
// js/monuments/statue-of-unity.js: stages 82, 62 and 46 square, to 22, 42 and 55.6.
function architecture(f) {
  const d = new THREE.Group();
  for (const a of FACES) {
    for (const l of [-14, 0, 14]) d.add(onFace(at(panel(11, 10, 0.5, M.marbleShade, frieze(M.bronze)), 0, 45, 0), a, 23.01, l));
    for (const [w, y] of [[82, 22], [62, 42]]) d.add(onFace(at(railing(w - 2, 1.1, 0.18, M.steel, 2.5, M.steel), 0, y, 0), a, w / 2 - 0.6));
    for (const [w, y] of [[82, 10.5], [62, 31.5]]) d.add(onFace(box(w, 0.5, 0.2, M.marbleShade, 0, y, 0.1), a, w / 2));
  }
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

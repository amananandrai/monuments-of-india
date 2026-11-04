import * as THREE from 'three';
import { mat, at, onFace, FACES, inst, unitCyl } from '../helpers.js';
import { chhajja, bracketGeo, placeAll, mergeByMaterial } from './components.js';
import { trees, asiBoard, scatter } from './realism.js';

// Vittala, Hampi, finer detail. From photographs: each pillar of the halls is a cluster, a central
// shaft ringed by slender colonnettes (the "musical pillars"), with a bracket capital at its top;
// and a deep curved eave runs round the hall under its roof. Dimensions follow
// js/monuments/vittala-temple-hampi.js: the halls [w, d, h, step, clear] at their positions, their
// floor 2.6 high.
const GRANITE = mat('#a58d6e', 0.9), GRANITE_DARK = mat('#7d6a53', 0.9);
function architecture(f) {
  const d = new THREE.Group(), cols = [], br = [];
  for (const [w, dd, h, step, clear, cx, cz] of [[34, 28, 6, 3.2, 3.8, 0, -6], [20, 20, 5, 3.4, 0, -30, 28], [18, 18, 5, 3.4, 0, 30, -40]]) {
    for (let x = -w / 2 + 1.5; x <= w / 2 - 1.4; x += step) for (let z = -dd / 2 + 1.5; z <= dd / 2 - 1.4; z += step) {
      if (Math.abs(x) < clear && z < -dd / 2 + 3) continue;
      for (let k = 0; k < 6; k++) { const a = (k / 6) * Math.PI * 2; cols.push([cx + x + Math.sin(a) * 0.72, 2.6, cz + z + Math.cos(a) * 0.72, 0.26, h, 0.26]); }
      for (const a of FACES) br.push([cx + x + Math.sin(a) * 0.65, 2.6 + h, cz + z + Math.cos(a) * 0.65, a]);
    }
    for (const a of FACES) {
      const long = Math.abs(Math.sin(a)) < 0.5, len = long ? w : dd;
      const e = onFace(at(chhajja(len + 2.4, 1.6, 0.9, 0.15, GRANITE_DARK), 0, 2.6 + h + 0.4, 0), a, (long ? dd : w) / 2 + 0.8);
      e.position.x += cx;
      e.position.z += cz;
      d.add(e);
    }
  }
  d.add(placeAll(bracketGeo(0.8, 0.6, 0.5), br, GRANITE));
  mergeByMaterial(d);
  f.add(d, inst(unitCyl(8), cols, GRANITE));
}

// The Vittala temple at Hampi: coconut palms and banana groves among the boulders, and the ASI
// board.
export function addDetails(f, g) {
  architecture(f);
  g.add(trees(scatter(40, [-140, 140, -140, 140], { seed: 4, gap: 14 }).filter(([x, z]) => (Math.abs(x) > 58 || Math.abs(z) > 82)), { kind: 'palm', seed: 4 }));
  g.add(asiBoard('Vittala Temple, Hampi', 10, 90, 0, { line2: 'WORLD HERITAGE SITE' }));
}

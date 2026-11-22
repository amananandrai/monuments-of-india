import * as THREE from 'three';
import { M, mat, box, at, onFace, FACES } from '../helpers.js';
import { merlons, chhajja, carved, mergeByMaterial } from '../parts/components.js';
import { trees, shrubs, lampPosts, benches, asiBoard, scatter, along } from '../parts/realism.js';
import { RED, PLASTER } from '../monuments/bara-gumbad.js';

// Bara Gumbad, finer detail. From photographs: a crest of small merlons runs along the parapet; the
// red band under it is carved; the mosque's front is covered in incised plaster, its bays under a
// deep eave. Dimensions follow js/monuments/bara-gumbad.js: the court P high, the gumbad S square
// with walls WH, the mosque at z = MZ.
function architecture(f, { P, S, WH, MZ }) {
  const d = new THREE.Group();
  for (const a of FACES) {
    for (const lat of [-7.35, 7.35]) d.add(onFace(at(merlons(4.6, 0.55, 0.7, 0.3, RED, 0.2), 0, P + WH + 1.1, 0), a, S / 2 - 0.35, lat));
    d.add(onFace(box(S - 2.4, 0.4, 0.05, carved(RED, 'reliefs'), 0, P + WH - 1.58, 0), a, S / 2 + 0.25));
  }
  // The mosque's eave and its incised front over the arches.
  d.add(at(chhajja(27, 0.9, 0.35, 0.12, PLASTER), 0, P + 6.6, MZ + 3.7), box(26, 0.7, 0.05, carved(PLASTER, 'calligraphy'), 0, P + 6.0, MZ + 4.36));
  d.add(at(merlons(26.6, 0.5, 0.6, 0.3, PLASTER, 0.2), 0, P + 8.5, MZ + 3.4));
  f.add(mergeByMaterial(d));
}

// Lodhi Gardens: lawns all round, gravel paths, old trees (neem, peepal, jamun, palms), the Sheesh
// Gumbad's neighbours left out; stairs up to the court; lamps, benches and the ASI board.
export function addDetails(f, g, dims) {
  architecture(f, dims);
  const lawn = mat('#5f8a43', 0.95);
  g.add(box(320, 0.15, 320, lawn, 0, 0, -10));
  g.add(box(4, 0.06, 140, M.path, 0, 0.15, 80), box(150, 0.06, 4, M.path, 0, 0.15, 36), box(4, 0.06, 120, M.path, -40, 0.15, -20));
  // Steps up to the court on its east, in front of the gumbad.
  for (let k = 0; k < 5; k++) g.add(box(7, dims.P * (5 - k) / 5, 0.4, RED, 0, 0, 9.2 + k * 0.4));
  const avoid = [[-24, 24, -46, 16], [-3, 3, 9, 150], [-80, 80, 33, 39], [-43, -37, -80, 40]];
  g.add(trees(scatter(26, [-140, 140, -130, 140], { seed: 5, gap: 16, avoid }), { kind: 'neem', seed: 5 }));
  g.add(trees(scatter(10, [-140, 140, -130, 140], { seed: 11, gap: 18, avoid }), { kind: 'peepal', seed: 11 }));
  g.add(trees(scatter(8, [-120, 120, -120, -50], { seed: 3, gap: 14 }), { kind: 'palm', seed: 3 }));
  g.add(shrubs(scatter(40, [-60, 60, -60, 60], { seed: 8, gap: 4, avoid: [[-22, 22, -42, 14], [-4, 4, 9, 70], [-70, 70, 33, 39]] }).map(([x, z]) => [x, z, 1.1]), { seed: 8 }));
  g.add(lampPosts([...along(5, [-4.5, 20], [-4.5, 90]), ...along(5, [4.5, 20], [4.5, 90])]));
  g.add(benches(along(4, [-20, 40], [20, 40]).map(([x, z]) => [x, z + 1.5, Math.PI])));
  g.add(asiBoard('Bara Gumbad', 7, 18, 0));
}

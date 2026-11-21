import * as THREE from 'three';
import { M, at, box } from '../helpers.js';
import { mouldings, frieze, mergeByMaterial } from './components.js';
import { steps } from './doorways.js';
import { trees, shrubs, asiBoard, scatter, along } from './realism.js';

// Parshvanath, finer architecture. Dimensions follow js/monuments/parshvanath-temple-khajuraho.js:
// the high platform (jagati) 26 × 44 and 3 high, centred on z = 6, the temple on it. The platform is
// moulded at its foot and its top and carved in a band between, as Khajuraho's are, and a broad
// flight climbs to it on the axis from the east (+z).
function jagati(f) {
  const d = new THREE.Group(), Sd = M.khajShade, S = M.khaj;
  d.add(at(mouldings(26, 44, [[0, 0.45, 0.3], [0.45, 0.25, 0.14], [1.0, 0.8, 0.05, frieze(S)], [2.55, 0.45, 0.25]], Sd), 0, 0, 6));
  d.add(at(steps(9, 3, 8, Sd, 0.42), 0, 0, 28.05));
  for (const s of [-1, 1]) d.add(box(0.7, 3, 3.4, Sd, s * 4.85, 0, 29.75));
  f.add(mergeByMaterial(d));
}

// The Parshvanath temple in Khajuraho's eastern group: the lawns, hedges and trees of the temple
// park, and the ASI board.
export function addDetails(f, g) {
  jagati(f);
  g.add(trees(scatter(14, [-46, 46, -46, 46], { seed: 4, gap: 14, avoid: [[-17, 17, -20, 34]] }), { kind: 'neem', seed: 4 }));
  g.add(shrubs([...along(8, [-16, -18], [-16, 26]), ...along(8, [16, -18], [16, 26])].map(([x, z]) => [x, z, 1]), { seed: 5 }));
  g.add(asiBoard('Parshvanath Temple, Khajuraho', 8, 40, 0, { line2: 'WORLD HERITAGE SITE' }));
}

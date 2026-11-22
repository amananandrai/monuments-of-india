import * as THREE from 'three';
import { M, mat, box, sheet, at } from '../helpers.js';
import { mergeByMaterial } from '../parts/components.js';
import { trees, shrubs, fountains, asiBoard, scatter, along, townHouses } from '../parts/realism.js';
import { detail } from '../detail.js';
import { SHADE, TRIM } from '../monuments/ibrahim-rauza.js';

// Ibrahim Rauza, its garden. Between the tomb and the mosque, on the plinth, a square tank with a
// fountain; round the plinth, lawns quartered by paths, palms and old tamarinds within the walls;
// outside, the low houses of the town. Dimensions follow js/monuments/ibrahim-rauza.js: the plinth
// PH high, the tomb at x = TX and the mosque at x = MX; the garden wall L square.
export function addDetails(f, g, { PH, L }) {
  const d = new THREE.Group();
  for (const [x, z, w, dd] of [[0, 7.35, 15.4, 0.7], [0, -7.35, 15.4, 0.7], [7.35, 0, 0.7, 14], [-7.35, 0, 0.7, 14]]) d.add(box(w, 0.5, dd, TRIM, x, PH, z));
  d.add(sheet(14, 14, M.lake, 0, PH + 0.3, 0));
  // Steps up to the plinth, north and south.
  for (const s of [-1, 1]) for (let k = 0; k < 4; k++) d.add(box(10, (PH * (4 - k)) / 4, 0.45, SHADE, 0, 0, s * (25.2 + k * 0.45)));
  f.add(mergeByMaterial(d));
  g.add(fountains([[0, 0]], { y: PH + 0.5, h: 2.4 }));
  // The garden inside the walls, and the ground outside.
  g.add(box(L - 2, 0.12, L - 2, mat('#6b8a46', 0.95), 0, 0, 0), box(600, 0.08, 600, mat('#a89a78', 0.96), 0, -0.05, 0));
  g.add(box(6, 0.06, L / 2 - 26, M.path, 0, 0.12, (L / 2 + 25) / 2), box(L - 4, 0.06, 4, M.path, 0, 0.12, 40), box(L - 4, 0.06, 4, M.path, 0, 0.12, -40));
  const avoid = [[-62, 62, -27, 27], [-4, 4, 20, 72], [-70, 70, 37, 43], [-70, 70, -43, -37]];
  g.add(trees(scatter(18, [-64, 64, -64, 64], { seed: 4, gap: 12, avoid }), { kind: 'tamarind', seed: 4 }));
  g.add(trees([...along(6, [-60, 46], [60, 46]), ...along(6, [-60, -46], [60, -46])], { kind: 'palm', seed: 6 }));
  g.add(shrubs(scatter(40, [-64, 64, -64, 64], { seed: 7, gap: 5, avoid }).map(([x, z]) => [x, z, 1]), { seed: 7, y: 0.12 }));
  if (!detail.low) g.add(townHouses(scatter(60, [-220, 220, -220, 220], { seed: 9, gap: 16, avoid: [[-80, 80, -80, 80]] }).map(([x, z], i) => [x, z, 8 + (i % 3) * 2, 9, 1 + (i % 2), (i % 4) * Math.PI / 2]), { seed: 9, fine: false }));
  g.add(asiBoard('Ibrahim Rauza', 8, L / 2 + 6, 0));
}

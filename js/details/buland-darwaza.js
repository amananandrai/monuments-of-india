import * as THREE from 'three';
import { M, mat, box, cyl, at, surface } from '../helpers.js';
import { arcadeScreen, star, mergeByMaterial } from './components.js';
import { trees, asiBoard, scatter } from './realism.js';

// Buland Darwaza, finer detail. From photographs and descriptions: the great arch is framed in a
// band of Quranic inscription, cut in black marble on white; white marble stars are inlaid along
// the spandrels; a blind arcade runs along the parapet under the row of kiosks; and the octagonal
// turrets at the ends are banded in white marble. Dimensions follow js/monuments/buland-darwaza.js:
// platform P = 13, the iwan 26 × 32 with its face at z = 8.
const SCRIPT = surface(mat('#ece6da', 0.6), 'script');
function architecture(f) {
  const d = new THREE.Group(), P = 13, Mb = M.marble;
  for (const x of [-13.65, 13.65]) d.add(box(0.85, 32.4, 0.05, SCRIPT, x, P + 0.3, 8.02));
  d.add(box(28.15, 0.85, 0.05, SCRIPT, 0, P + 32.3, 8.02));
  for (const x of [-10.2, -6.6, 6.6, 10.2]) d.add(at(star(6, 0.75, Mb), x, P + 30.4 - Math.abs(x) * 0.12, 8.02));
  d.add(at(arcadeScreen(30.6, 2.6, 17, 1.1, 1.9, 0.2, M.redLight), 0, P + 35.2, 8.1));
  for (const s of [-1, 1]) for (let k = 1; k <= 4; k++) d.add(cyl(1.86, 1.86, 0.35, Mb, s * 21, P + k * 8.2, 8.2, 8));
  mergeByMaterial(d);
  f.add(d);
}

// Buland Darwaza at Fatehpur Sikri: neem trees on the ridge either side of the great flight of
// steps and round the mosque behind, and the ASI board.
export function addDetails(f, g) {
  architecture(f);
  g.add(trees(scatter(22, [-125, 125, -210, 115], { seed: 6, gap: 15, avoid: [[-70, 70, -25, 45], [-92, 78, -152, -8]] }), { kind: 'neem', seed: 6 }));
  g.add(asiBoard('Buland Darwaza, Fatehpur Sikri', 30, 60, 0, { line2: 'WORLD HERITAGE SITE' }));
}

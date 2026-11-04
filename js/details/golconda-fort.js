import * as THREE from 'three';
import { mat, at, onFace } from '../helpers.js';
import { archRing, rosette, chhajja, arcadeScreen, mergeByMaterial } from './components.js';
import { towerDetail } from './forts.js';
import { RINGS, ringPoint, hillRadius, hillY } from '../monuments/golconda-fort.js';
import { trees, shrubs, lampPosts, asiBoard, scatter, along } from './realism.js';

// Golconda, finer detail. The granite bastions on every ring of wall are banded and slit, as are
// the towers of the Fateh Darwaza, whose face carries carved medallions in its spandrels; the Bala
// Hissar pavilion's arches are framed in moulded rings under a sloping eave and an arcaded parapet.
// Dimensions follow js/monuments/golconda-fort.js.
const GRANITE = mat('#9a917f', 0.9), TRIM = mat('#b5ac98', 0.9), PAV = mat('#d9d1c0', 0.85);
function architecture(f) {
  const d = new THREE.Group(), H = 60;
  for (const q of RINGS) {
    for (let k = 0; k < 8; k++) { const [x, y, z] = ringPoint(q, (k / 8) * Math.PI * 2 + 0.2); d.add(at(towerDetail(4.6, 4, 10, GRANITE, TRIM, { n: 7, courses: [0.55], slits: [0.3, 0.75] }), x, y - 1, z)); }
  }
  for (const a of [Math.PI / 2 + 0.55, Math.PI / 2 - 0.55]) d.add(at(towerDetail(5, 4.4, 12, GRANITE, TRIM, { n: 8 }), Math.cos(a) * 120, 0, Math.sin(a) * 120));
  for (const s of [-1, 1]) {
    d.add(at(towerDetail(3.67, 3.4, 16, GRANITE, TRIM, { n: 7, courses: [], slits: [0.3, 0.7] }), s * 10.53, 0, 121.96));
    d.add(at(rosette(0.9, TRIM, 12), s * 5.6, 11.2, 124.05));
  }
  // The Bala Hissar pavilion: 20 × 9 × 12 from y = H - 3.
  for (const a of [0, Math.PI]) {
    for (let k = -1; k <= 1; k++) d.add(onFace(at(archRing(4, 6, true, 0.3, 0.1, PAV), 0, H - 2.4, 0), a, 6.26, k * 6));
    d.add(onFace(at(chhajja(20.6, 1.2, 0.45, 0.14, PAV), 0, H + 5.9, 0), a, 6));
    d.add(onFace(at(arcadeScreen(20, 1, 14, 0.7, 0.7, 0.25, PAV), 0, H + 6, 0), a, 5.85));
  }
  for (const a of [Math.PI / 2, -Math.PI / 2]) d.add(onFace(at(chhajja(12.6, 1.2, 0.45, 0.14, PAV), 0, H + 5.9, 0), a, 10));
  mergeByMaterial(d);
  f.add(d);
}

// Golconda: babul and neem trees on the plain round the hill and scrub among its boulders, lamps
// along the road in (for the evening sound-and-light show), and the ASI board.
export function addDetails(f, g) {
  architecture(f);
  const plain = scatter(40, [-240, 240, -240, 240], { seed: 3, gap: 16 }).filter(([x, z]) => Math.hypot(x, z) > 125);
  g.add(trees(plain, { kind: 'neem', seed: 3 }));
  const slope = scatter(60, [-120, 120, -120, 120], { seed: 4, gap: 6 }).filter(([x, z]) => { const q = Math.hypot(x, z) / hillRadius(Math.atan2(z, x)); return q > 0.32 && q < 0.86 && !RINGS.some((w) => Math.abs(q - w) < 0.06); });
  // Each bush sits on the slope of the hill.
  g.add(shrubs(slope.map(([x, z]) => [x, z, 2.2, hillY(x, z) - 0.3]), { dry: true, seed: 5 }));
  g.add(lampPosts([...along(6, [-7, 128], [-7, 200]), ...along(6, [7, 128], [7, 200])]));
  g.add(asiBoard('Golconda Fort', 14, 150, 0));
}

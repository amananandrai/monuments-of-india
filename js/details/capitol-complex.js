import * as THREE from 'three';
import { mat, at, M, box } from '../helpers.js';
import { mergeByMaterial } from './components.js';
import { trees, along } from './realism.js';

// The Capitol Complex, finer detail. From photographs of Le Corbusier's buildings: the great pivoting
// door of the Palace of Assembly, enamelled in Le Corbusier's own design in squares of bright colour;
// the Assembly's side walls screened by a deep egg-crate brise-soleil; and the High Court's front
// shaded by a grid of concrete fins and shelves. Dimensions follow js/monuments/capitol-complex.js:
// the Assembly 64 square and 16 high at the origin; the High Court 90 × 18 × 30, turned to face
// south at (60, 0, 180).
const CONCRETE_DARK = mat('#8f8a80', 0.95);
const ENAMEL = ['#d23a2a', '#f2c230', '#2f5d9a', '#3d8a4f', '#f1ede4', '#1f1f22'].map((c) => mat(c, 0.35));
function architecture(f) {
  const d = new THREE.Group();
  // The enamelled door, 8 m square, on the Assembly's front under the portico.
  for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) d.add(new THREE.Mesh(new THREE.BoxGeometry(1.96, 1.96, 0.12), ENAMEL[(i * 3 + j * 2) % ENAMEL.length]).translateX(-3 + i * 2).translateY(1 + j * 2).translateZ(32.06));
  // Egg-crate screens on the Assembly's two sides.
  for (const s of [-1, 1]) {
    for (let k = 0; k <= 20; k++) d.add(new THREE.Mesh(new THREE.BoxGeometry(1.4, 15, 0.3), CONCRETE_DARK).translateX(s * 32.7).translateY(8).translateZ(-30 + k * 3));
    for (let y = 2; y < 16; y += 3.2) d.add(new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.3, 60.3), CONCRETE_DARK).translateX(s * 32.7).translateY(y));
  }
  const hc = at(new THREE.Group(), 60, 0, 180);
  hc.rotation.y = Math.PI;
  for (let k = 0; k <= 30; k++) hc.add(new THREE.Mesh(new THREE.BoxGeometry(0.3, 17.6, 1.6), CONCRETE_DARK).translateX(-44 + k * (88 / 30)).translateY(8.8).translateZ(15.8));
  for (const y of [4.5, 9, 13.5]) hc.add(new THREE.Mesh(new THREE.BoxGeometry(88.3, 0.3, 1.6), CONCRETE_DARK).translateY(y).translateZ(15.8));
  d.add(hc);
  mergeByMaterial(d);
  f.add(d);
}

// Le Corbusier's Capitol Complex at Chandigarh: the shallow reflecting pools in front of the Palace
// of Assembly, and the rows of trees planted along the edges of the great concrete esplanade.
export function addDetails(f, g) {
  architecture(f);
  g.add(box(70, 0.35, 14, M.water, 0, 0, 62), box(14, 0.35, 40, M.water, 60, 0, 120));
  g.add(trees([...along(14, [-230, 220], [230, 220]), ...along(10, [-230, -140], [-230, 200]), ...along(10, [230, -140], [230, 200])], { kind: 'mango', seed: 5 }));
}

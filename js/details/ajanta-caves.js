import * as THREE from 'three';
import { mat, mesh, box, at, surface } from '../helpers.js';
import { pilasters, templeNiche, idol, mergeByMaterial } from './components.js';
import { trees, shrubs, asiBoard, scatter } from './realism.js';

// Ajanta, finer detail. From photographs of the caves: the facades of the chaitya halls 19 and 26
// are carved round the great horseshoe window, which is outlined by a projecting horseshoe arch,
// with a row of small kudu arches above it and pilasters and niches of standing Buddhas either side
// of the doorway; over the mouth of every other cave runs a carved beam. Dimensions follow
// js/monuments/ajanta-caves.js: the caves on an arc R = 70 (z squeezed by 0.8), the chaityas 9 wide
// and 12 high with their face at z = 1.1 in their own frame.
const ROCK_LIGHT = mat('#968672', 0.95), FRAME = surface(mat('#b7a48c', 0.85), 'frieze');
function architecture(f) {
  const d = new THREE.Group(), R = 70, a0 = -0.15 * Math.PI, a1 = 1.15 * Math.PI, N = 30;
  const kg = new THREE.TorusGeometry(0.4, 0.1, 4, 10, Math.PI * 1.3).rotateZ(-Math.PI * 0.15);
  for (let i = 0; i < N; i++) {
    const t = a0 + 0.06 + (i / (N - 1)) * (a1 - a0 - 0.12), x = Math.cos(t) * R, z = -Math.sin(t) * R * 0.8;
    const ry = Math.atan2(-x, -z), y = 14 + Math.sin(i * 1.7) * 3, o = at(new THREE.Group(), x, 0, z);
    o.rotation.y = ry;
    if (i === 18 || i === 25) {
      const w = 9, h = 12, ar = (w * 0.7) / 2, sy = y + h * 0.9 - ar;
      o.add(mesh(new THREE.TorusGeometry(ar + 0.35, 0.3, 6, 24, Math.PI * 1.3).rotateZ(-Math.PI * 0.15), ROCK_LIGHT, 0, sy, 1.15));
      for (let k = -3; k <= 3; k++) o.add(mesh(kg, ROCK_LIGHT, k * 1.1, y + h + 0.3, 1.12));
      for (const s of [-1, 1]) {
        o.add(at(pilasters(1.1, 2, 0.3, h * 0.65, 0.12, ROCK_LIGHT), s * (ar + 1.15), y, 1.1));
        o.add(at(templeNiche(0.6, 1.8, ROCK_LIGHT, { figure: idol(1.5, ROCK_LIGHT), crown: false }), s * (ar + 1.15), y + h * 0.35, 1.12));
      }
    } else if (i !== 10) o.add(box(9, 0.6, 0.3, FRAME, 0, y + 5.05, 0.86));
    d.add(o);
  }
  mergeByMaterial(d);
  f.add(d);
}

// Ajanta: the teak and scrub forest over the plateau and down in the valley of the Waghora, and the
// ASI board.
export function addDetails(f, g) {
  architecture(f);
  const R = 70, H = 40, a0 = -0.15 * Math.PI, a1 = 1.15 * Math.PI;
  // The forest on top of the cliff, set back from its edge
  const top = [];
  for (let k = 0; k < 70; k++) {
    const t = a0 + ((k + 0.5) / 70) * (a1 - a0), x = Math.cos(t) * R, z = -Math.sin(t) * R * 0.8, l = Math.hypot(x, z), d = 6 + ((k * 37) % 45);
    top.push([x + (x / l) * d, z + (z / l) * d]);
  }
  g.add(trees(top, { kind: 'mango', seed: 7, y: H + 3, h: 9 }));
  g.add(shrubs(top.map(([x, z], k) => [x + Math.sin(k) * 4, z + Math.cos(k) * 4, 2.4]), { y: H + 3, dry: true, seed: 8 }));
  // The valley floor inside the horseshoe, either side of the river
  const valley = scatter(26, [-50, 50, -40, 140], { seed: 9, gap: 9, avoid: [[-11, 11, -60, 200]] }).filter(([x, z]) => z > 10 || Math.hypot(x, z / 0.8) < 48);
  g.add(trees(valley, { kind: 'neem', seed: 10, y: 0.2 }));
  g.add(asiBoard('Ajanta Caves', 16, 70, -Math.PI / 2, { line2: 'WORLD HERITAGE SITE' }));
}

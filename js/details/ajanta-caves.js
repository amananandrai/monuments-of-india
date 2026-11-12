import * as THREE from 'three';
import { mat, mesh, box, cyl, at, surface } from '../helpers.js';
import { pilasters, templeNiche, idol, panel, frieze, windowFrame, mergeByMaterial } from './components.js';
import { figure } from './sculpture.js';
import { doorFrame } from './doorways.js';
import { trees, shrubs, asiBoard, scatter } from './realism.js';
import { openDistance } from '../monuments/ajanta-caves.js';
import { detail } from '../detail.js';
import { caveFront } from '../monuments/ajanta-caves.js';

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
      // On desktops (js/detail.js), a row of seated Buddhas in niches above them, as on the faces
      // of Caves 19 and 26.
      if (!detail.low) for (let k = -3; k <= 3; k++) o.add(at(templeNiche(0.7, 1.1, ROCK_LIGHT, { figure: figure(0.95, ROCK_LIGHT, 'seated'), crown: false }), k * 1.1, y + h + 1.15, 1.12));
      for (const s of [-1, 1]) {
        o.add(at(pilasters(1.1, 2, 0.3, h * 0.65, 0.12, ROCK_LIGHT), s * (ar + 1.15), y, 1.1));
        o.add(at(templeNiche(0.6, 1.8, ROCK_LIGHT, { figure: idol(1.5, ROCK_LIGHT), crown: false }), s * (ar + 1.15), y + h * 0.35, 1.12));
      }
    } else if (caveFront(i).chaitya) {
      // The smaller chaityas: a horseshoe arch round the window, a row of kudus over it, and a
      // pilaster either side of the doorway.
      o.add(mesh(new THREE.TorusGeometry(2.55, 0.22, 6, 20, Math.PI * 1.3).rotateZ(-Math.PI * 0.15), ROCK_LIGHT, 0, y + 6.6, 1.0));
      for (let k = -2; k <= 2; k++) o.add(mesh(kg, ROCK_LIGHT, k * 1.1, y + 9.6, 0.98));
      for (const s of [-1, 1]) o.add(at(pilasters(0.6, 1, 0.4, 4.2, 0.12, ROCK_LIGHT), s * 2, y, 0.72));
    } else if (i !== 10) o.add(box(9, 0.6, 0.3, FRAME, 0, y + 5.05, 0.86));
    d.add(o);
  }
  mergeByMaterial(d);
  f.add(d);
}

// The fronts of the other caves, after photographs: each verandah's pillars stand on square bases,
// are girdled by a carved band and carry cushion capitals under the beam; the mouth is framed in a
// moulding; on the verandah's back wall a carved doorway leads into the hall between two windows,
// with the seated Buddha of the shrine seen through it. In each cave's own frame
// (as js/monuments/ajanta-caves.js places them): the mouth 8 wide and 5 high with its face at
// z = 0.7, the verandah pillars at z = 1.4, four or six across (caveFront in that file).
const DARK_ = mat('#231d19', 0.9);
function caveFronts(f) {
  const d = new THREE.Group(), R = 70, a0 = -0.15 * Math.PI, a1 = 1.15 * Math.PI, N = 30, L = ROCK_LIGHT;
  for (let i = 0; i < N; i++) {
    if (i === 10 || i === 18 || i === 25 || caveFront(i).chaitya) continue;
    const t = a0 + 0.06 + (i / (N - 1)) * (a1 - a0 - 0.12), x = Math.cos(t) * R, z = -Math.sin(t) * R * 0.8;
    const ry = Math.atan2(-x, -z), y = 14 + Math.sin(i * 1.7) * 3, o = at(new THREE.Group(), x, 0, z);
    o.rotation.y = ry;
    for (const c of caveFront(i).cols) {
      o.add(box(1.1, 0.5, 1.1, L, c, y, 1.4), cyl(0.47, 0.47, 0.4, frieze(L), c, y + 2.3, 1.4, 8));
      o.add(cyl(0.62, 0.42, 0.45, L, c, y + 4.1, 1.4, 8), box(1.2, 0.3, 1.2, L, c, y + 4.55, 1.4));
    }
    o.add(at(panel(9.4, 5.86, 0.35, L, null, 0.1), 0, y - 0.25, 0.73));
    o.add(at(doorFrame(1.6, 3, { bands: 2, bw: 0.24, depth: 0.25, d0: 0.12, m: L }), 0, y, 0.71));
    for (const s of [-1, 1]) {
      o.add(at(windowFrame(1.2, 1.4, L, { shape: 'flat', back: DARK_, frame: 0.18 }), s * 2.6, y + 1.5, 0.71));
    }
    o.add(at(figure(1.5, L, 'seated'), 0, y + 0.1, 0.74));
    d.add(o);
  }
  mergeByMaterial(d);
  f.add(d);
}


// Ajanta: the teak and scrub forest over the plateau and down in the valley of the Waghora, and the
// ASI board.
export function addDetails(f, g) {
  architecture(f);
  caveFronts(f);
  const R = 70, H = 40, a0 = -0.15 * Math.PI, a1 = 1.15 * Math.PI;
  // The forest on top of the cliff, set back from its edge
  const top = [];
  for (let k = 0; k < 70; k++) {
    const t = a0 + ((k + 0.5) / 70) * (a1 - a0), x = Math.cos(t) * R, z = -Math.sin(t) * R * 0.8, l = Math.hypot(x, z), d = 6 + ((k * 37) % 45);
    top.push([x + (x / l) * d, z + (z / l) * d]);
  }
  g.add(trees(top, { kind: 'teak', seed: 7, y: H + 3, h: 11 }));
  g.add(shrubs(top.map(([x, z], k) => [x + Math.sin(k) * 4, z + Math.cos(k) * 4, 2.4]), { y: H + 3, dry: true, seed: 8 }));
  // The valley floor inside the horseshoe, either side of the river
  const valley = scatter(26, [-50, 50, -40, 140], { seed: 9, gap: 9, avoid: [[-11, 11, -60, 200]] }).filter(([x, z]) => z > 10 || Math.hypot(x, z / 0.8) < 48);
  g.add(trees(valley, { kind: 'neem', seed: 10, y: 0.2 }));
  // The teak forest running on across the plateau, back from the cliff's own band of trees.
  const plateau = scatter(160, [-420, 420, -420, 520], { seed: 11, gap: 18 }).filter(([x, z]) => openDistance(x, z) > 75);
  g.add(trees(plateau, { kind: 'teak', seed: 12, y: H + 1.2, h: 11 }));
  g.add(asiBoard('Ajanta Caves', 16, 70, -Math.PI / 2, { line2: 'WORLD HERITAGE SITE' }));
}

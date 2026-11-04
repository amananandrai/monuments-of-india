import * as THREE from 'three';
import { mat, box, at, onFace, FACES, surface } from '../helpers.js';
import { windowFrame, mergeByMaterial } from './components.js';
import { balustrade, GLASS } from './colonial.js';
import { trees, shrubs, lampPosts, asiBoard, scatter, along } from './realism.js';

// Cooch Behar Palace, finer detail. From photographs (it was modelled on Buckingham Palace in the
// Italian Renaissance manner): a balustrade along the roof; a band of round-arched windows round
// the drum of the Durbar Hall's dome; moulded capitals on the white pilasters between the arches.
// Dimensions follow js/monuments/cooch-behar-palace.js: 120 × 30, 18 high, the drum r = 9 from
// y = 19.2.
const BRICK = surface(mat('#a9583f', 0.85), 'brick'), WHITE = mat('#ece6da', 0.8);
function architecture(f) {
  const d = new THREE.Group(), W = 120, D = 30, H = 18;
  for (const a of FACES) {
    const long = Math.abs(Math.sin(a)) < 0.5, len = long ? W : D;
    if (a === 0) for (const [x0, x1] of [[-W / 2, -13.5], [13.5, W / 2]]) d.add(at(balustrade(x1 - x0 - 0.4, 1.2, WHITE, { t: 0.5 }), (x0 + x1) / 2, H + 1.2, D / 2 + 0.2));
    else d.add(onFace(at(balustrade(len - 0.4, 1.2, WHITE, { t: 0.5 }), 0, H + 1.2, 0), a, (long ? D : W) / 2 + 0.2));
  }
  for (let k = 0; k < 12; k++) d.add(onFace(at(windowFrame(1.6, 3.6, WHITE, { shape: 'round', back: GLASS, frame: 0.3 }), 0, H + 3, 0), (k / 12) * Math.PI * 2, 9.02));
  for (let k = 0; k <= 24; k++) for (const y of [H / 2 - 1.5, H - 1.4]) {
    const x = -W / 2 + k * (W / 24);
    if (y < H / 2 && Math.abs(x) < 4) continue;
    d.add(box(1.05, 0.45, 0.8, WHITE, x, y, D / 2 + 0.3));
  }
  mergeByMaterial(d);
  f.add(d);
}

// The Cooch Behar Palace: lotus leaves on the pond, palms and flowering shrubs in the gardens, and
// lamps along the drive.
export function addDetails(f, g) {
  architecture(f);
  const pads = scatter(26, [-96, -44, 68, 92], { seed: 3, gap: 1.6 });
  g.add(shrubs(pads.map(([x, z]) => [x, z, 1.4]), { y: 0.4, flowers: '#4f8a3a', seed: 3 }));
  g.add(trees(scatter(26, [-145, 145, -80, 165], { seed: 4, gap: 14, avoid: [[-70, 70, -25, 40], [-102, -38, 62, 98], [-8, 8, 20, 145]] }), { kind: 'palm', seed: 4 }));
  g.add(trees([...along(6, [-12, 50], [-12, 135]), ...along(6, [12, 50], [12, 135])], { kind: 'ashoka', seed: 5 }));
  g.add(shrubs(scatter(20, [-60, 60, 34, 60], { seed: 6, gap: 5, avoid: [[-16, 16, 30, 70]] }).map(([x, z]) => [x, z, 1.6]), { flowers: '#d0306f', seed: 6 }));
  g.add(lampPosts([...along(6, [-6, 35], [-6, 135]), ...along(6, [6, 35], [6, 135])]));
  g.add(asiBoard('Cooch Behar Palace', 9, 138, 0));
}

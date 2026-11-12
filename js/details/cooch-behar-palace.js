import * as THREE from 'three';
import { mat, box, at, onFace, FACES, surface } from '../helpers.js';
import { windowFrame, keystone, mergeByMaterial } from './components.js';
import { urn } from './sculpture.js';
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

// The sculpture and finer parts, after photographs: urns along the roof balustrade; a keystone in
// every arch of the two arcades; pilasters between the windows of the dome's drum; and a ring of
// small round-arched openings in its lantern. Dimensions follow js/monuments/cooch-behar-palace.js.
function sculpture(f) {
  const d = new THREE.Group(), W = 120, D = 30, H = 18;
  for (let x = -57; x <= 57; x += 9.5) if (Math.abs(x) > 14) d.add(at(urn(1.3, WHITE), x, H + 2.4, D / 2 + 0.2));
  for (let k = 0; k < 24; k++) for (const y of [0, H / 2 + 1]) {
    const cx = -W / 2 + k * (W / 24) + W / 48;
    if (y === 0 && Math.abs(cx) < 4) continue;
    d.add(at(keystone(0.4, 0.75, 0.16, WHITE, 0.2), cx, y + 6.0, D / 2));
  }
  for (let k = 0; k < 12; k++) d.add(onFace(box(0.5, 7.6, 0.18, WHITE, 0, H + 1.4, 0.09), ((k + 0.5) / 12) * Math.PI * 2, 9));
  for (let k = 0; k < 6; k++) d.add(onFace(at(windowFrame(0.5, 1.4, WHITE, { shape: 'round', frame: 0.1 }), 0, H + 26.2, 0), (k / 6) * Math.PI * 2, 1.62));
  mergeByMaterial(d);
  f.add(d);
}


// The Cooch Behar Palace: lawns, an ashoka row along the drive, a few flowering shrubs, and
// lamps along the drive.
export function addDetails(f, g) {
  architecture(f);
  sculpture(f);
  g.add(trees([...along(6, [-12, 50], [-12, 135]), ...along(6, [12, 50], [12, 135])], { kind: 'ashoka', seed: 5 }));
  g.add(shrubs(scatter(20, [-60, 60, 34, 60], { seed: 6, gap: 5, avoid: [[-16, 16, 30, 70]] }).slice(0, 5).map(([x, z]) => [x, z, 1.6]), { flowers: '#d0306f', seed: 6 }));
  g.add(lampPosts([...along(6, [-6, 35], [-6, 135]), ...along(6, [6, 35], [6, 135])]));
  g.add(asiBoard('Cooch Behar Palace', 9, 138, 0));
}

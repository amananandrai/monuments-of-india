import * as THREE from 'three';
import { at } from '../helpers.js';
import { mergeByMaterial } from './components.js';
import { dharmaWheel, parapetDiscs, maniWheels } from './tibetan.js';
import { prayerFlags, trees, scatter } from './realism.js';
import { yaks } from './animals.js';
import { spurY } from '../monuments/tawang-monastery.js';

// Tawang, finer detail. From photographs of the Dukhang: the Dharma wheel and its deer over the
// front of the gilded roof; gilded discs along the maroon parapet; and in the courtyard before it,
// galleries of prayer wheels. (The hall's windows, awnings and window bay are in its builder.) Dimensions follow js/monuments/tawang-monastery.js: the
// ridge top T = 24, the hall 30 × 15 × 24 at z = -16 (front at -4), three floors of windows.
function architecture(f) {
  const d = new THREE.Group(), T = 24;
  d.add(at(dharmaWheel(4.4), 0, T + 20.6, -11.1));
  // Galleries of prayer wheels down both sides of the courtyard before the hall, facing in.
  for (const s of [-1, 1]) d.add(at(maniWheels(14, { back: true }), s * 24, T, 12).rotateY(-s * Math.PI / 2));
  d.add(at(parapetDiscs(29.6, 2.2, 0.24), 0, T + 14.1, -3.83), at(parapetDiscs(16, 2, 0.2), 0, T + 19.6, -11.78));
  mergeByMaterial(d);
  f.add(d);
}

// Tawang, the largest monastery in India: more strings of prayer flags across the great courtyard,
// and yaks grazing on the ridge below the walls.
export function addDetails(f, g) {
  architecture(f);
  const T = 24;
  for (const [a, b] of [[[0, T + 25, -18], [-40, T + 1, 34]], [[0, T + 25, -18], [40, T + 1, 34]], [[-30, T + 6, -10], [30, T + 6, -10]], [[0, T + 25, -18], [0, T + 1, 30]]]) f.add(prayerFlags(a, b, { sag: 3, size: 0.6 }));
  // Yaks on the spur below the gate, each on the ground where it stands.
  // Firs on the ridge above the monastery, uphill of the compound's west wall (x = -80).
  g.add(trees(scatter(12, [-150, -96, -26, 26], { seed: 8, gap: 8 }).map(([x, z]) => [x, z, null, spurY(x, z) - 0.3]), { kind: 'fir', seed: 8 }));
  for (const [x, z, ry] of [[132, 10, 0.4], [140, -6, 1.6], [150, 14, 2.2], [158, -12, 0.9]]) g.add(yaks([[x, z, ry]], { y: spurY(x, z) + 0.1 }));
}

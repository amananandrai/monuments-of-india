import * as THREE from 'three';
import { at } from '../helpers.js';
import { mergeByMaterial } from './components.js';
import { dharmaWheel, shabkhep, parapetDiscs } from './tibetan.js';
import { prayerFlags } from './realism.js';
import { yaks } from './animals.js';

// Tawang, finer detail. From photographs of the Dukhang: the Dharma wheel and its deer over the
// front of the gilded roof; gilded discs along the maroon parapet; and pleated awnings in red, blue
// and green over every window of its front. Dimensions follow js/monuments/tawang-monastery.js: the
// ridge top T = 24, the hall 30 × 15 × 24 at z = -16 (front at -4), three floors of windows.
function architecture(f) {
  const d = new THREE.Group(), T = 24;
  d.add(at(dharmaWheel(4.4), 0, T + 20.6, -11.1));
  const n = Math.floor(30 / 3.4);
  for (let fl = 0; fl < 3; fl++) for (let k = 0; k < n; k++) {
    const x = -15 + (k + 0.5) * (30 / n), y = 1 + fl * ((15 * 0.85) / 3);
    if (fl < 2 && Math.abs(x) < 3) continue;
    d.add(at(shabkhep(1.2), x, T + y + 1.65, -3.9));
  }
  d.add(at(parapetDiscs(29.6, 2.2, 0.24), 0, T + 14.1, -3.83), at(parapetDiscs(16, 2, 0.2), 0, T + 19.6, -11.78));
  mergeByMaterial(d);
  f.add(d);
}

// Tawang, the largest monastery in India: more strings of prayer flags across the great courtyard,
// and yaks grazing on the ridge below the walls.
export function addDetails(f, g) {
  architecture(f);
  const T = 24;
  for (const [a, b] of [[[0, T + 25, -18], [-40, T + 1, 34]], [[0, T + 25, -18], [40, T + 1, 34]], [[-30, T + 6, -10], [30, T + 6, -10]], [[0, T + 25, -18], [0, T + 1, 40]]]) f.add(prayerFlags(a, b, { sag: 3, size: 0.6 }));
  g.add(yaks([[-60, 80, 0.4], [-52, 86, 1.6], [70, -76, 2.2], [78, -70, 0.9]], { y: 0.5 }));
}

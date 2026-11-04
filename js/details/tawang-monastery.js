import { prayerFlags } from './realism.js';
import { yaks } from './animals.js';

// Tawang, the largest monastery in India: more strings of prayer flags across the great courtyard,
// and yaks grazing on the ridge below the walls.
export function addDetails(f, g) {
  const T = 24;
  for (const [a, b] of [[[0, T + 25, -18], [-40, T + 1, 34]], [[0, T + 25, -18], [40, T + 1, 34]], [[-30, T + 6, -10], [30, T + 6, -10]], [[0, T + 25, -18], [0, T + 1, 40]]]) f.add(prayerFlags(a, b, { sag: 3, size: 0.6 }));
  g.add(yaks([[-60, 80, 0.4], [-52, 86, 1.6], [70, -76, 2.2], [78, -70, 0.9]], { y: 0.5 }));
}

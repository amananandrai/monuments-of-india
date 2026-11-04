import { trees, scatter } from './realism.js';
import { ridgeY, PEAKS } from '../monuments/shikharji.js';

// Shikharji in the Parasnath hills: the forest that covers the ridge up to just below the summits.
export function addDetails(f, g) {
  const spots = scatter(150, [-200, 200, -110, 110], { seed: 5, gap: 9 })
    .filter(([x, z]) => { const y = ridgeY(x, z); return y > 4 && !PEAKS.some(([px, pz]) => Math.hypot(x - px, z - pz) < 9); })
    .map(([x, z]) => [x, z, null, ridgeY(x, z) - 0.4]);
  g.add(trees(spots, { kind: 'mango', seed: 5, h: 10 }));
}

import { at, tricolour } from '../helpers.js';
import { trees, shrubs, lampPosts, scatter, around } from './realism.js';

// The Cellular Jail at Port Blair, now a National Memorial: the tricolour flying over the central
// watchtower, coconut palms and flowering shrubs in the memorial gardens between the wings, and
// lamps round the tower.
export function addDetails(f, g) {
  f.add(at(tricolour(9), 0, 27.6, 0));
  const lawn = scatter(36, [-150, 150, -140, 140], { seed: 3, gap: 9 }).filter(([x, z]) => {
    // Keep clear of the three long wings, which run out from the tower at these angles
    return [0, 1, 2].every((k) => { const a = (k / 7) * Math.PI * 2 + 0.4, u = x * Math.sin(a) + z * Math.cos(a), v = x * Math.cos(a) - z * Math.sin(a); return u < 0 || u > 112 || Math.abs(v) > 9; }) && Math.hypot(x, z) > 30;
  });
  g.add(trees(lawn, { kind: 'palm', seed: 3, y: 0.7 }), shrubs(lawn.map(([x, z]) => [x + 3, z + 2, 1.4]), { y: 0.7, flowers: '#d63c6a', seed: 4 }));
  g.add(lampPosts(around(8, 18), { y: 0.7 }));
}

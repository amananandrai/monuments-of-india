import { trees, lampPosts, scatter, along } from './realism.js';

// The Rumi Darwaza at Lucknow, with the road still running through the gate: lawns either side with
// neem trees, and lamps.
export function addDetails(f, g) {
  g.add(trees(scatter(26, [-95, 95, -75, 75], { seed: 21, gap: 14, avoid: [[-36, 36, -8, 10], [-10, 10, -80, 80]] }), { kind: 'neem', seed: 21 }));
  g.add(lampPosts([...along(8, [-8.5, -75], [-8.5, 75]), ...along(8, [8.5, -75], [8.5, 75])]));
}

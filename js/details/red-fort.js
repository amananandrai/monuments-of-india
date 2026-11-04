import { trees, lampPosts, asiBoard, along } from './realism.js';

// The Red Fort, from Netaji Subhash Marg: the neem trees on the strip of lawn along the moat,
// lamps, and the ASI board.
export function addDetails(f, g) {
  g.add(trees(along(14, [-140, 18], [140, 18]).filter(([x]) => Math.abs(x) > 20), { kind: 'neem', seed: 16 }));
  g.add(lampPosts([...along(12, [-140, 25.5], [140, 25.5]), ...along(12, [-140, 46.5], [140, 46.5])]));
  g.add(asiBoard('Red Fort Complex', 22, 24, 0, { line2: 'WORLD HERITAGE SITE' }));
}

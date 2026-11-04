import { M, box } from '../helpers.js';
import { trees, shrubs, lampPosts, asiBoard, fountains, scatter, along } from './realism.js';

// The Bara Imambara at Lucknow: the forecourt garden between the gateway and the imambara, with
// lawns, hedges and a fountain, the trees of the outer garden, and lamps along the approach.
export function addDetails(f, g) {
  for (const x of [-1, 1]) g.add(box(24, 0.3, 36, M.grass, x * 22, 0, 34));
  g.add(fountains([[0, 34]], { h: 2.4 }), shrubs([...along(9, [-34, 17], [-34, 51]), ...along(9, [34, 17], [34, 51])].map(([x, z]) => [x, z, 1]), { y: 0.3 }));
  g.add(trees(scatter(20, [-110, 110, -80, 140], { seed: 3, gap: 14, avoid: [[-50, 50, -32, 72], [-100, -56, -2, 50], [-10, 10, 70, 120]] }), { kind: 'neem', seed: 3 }));
  g.add(trees([...along(5, [-12, 75], [-12, 108]), ...along(5, [12, 75], [12, 108])], { kind: 'ashoka', seed: 4 }));
  g.add(lampPosts([...along(5, [-8, 72], [-8, 110]), ...along(5, [8, 72], [8, 110])]));
  g.add(asiBoard('Bara Imambara', 10, 112, 0));
}

import { M, box } from '../helpers.js';
import { trees, shrubs, people, asiBoard, scatter, along } from './realism.js';

// The Gol Gumbaz at Vijayapura: visitors walking round the base and up in the whispering gallery
// on the drum, lawns and neem trees in the garden round the platform, and the ASI board.
export function addDetails(f, g) {
  for (const [x, z, w, d] of [[-45, 0, 26, 110], [45, 0, 26, 110], [0, -45, 60, 26], [0, 45, 60, 26]]) g.add(box(w, 0.3, d, M.grass, x, 0, z));
  g.add(trees([...along(5, [-52, -48], [-52, 48]), ...along(5, [52, -48], [52, 48]), ...along(4, [-36, -54], [36, -54])], { kind: 'neem', seed: 3 }));
  g.add(shrubs([...along(8, [-34, 34], [-34, 56]), ...along(8, [34, 34], [34, 56])].map(([x, z]) => [x, z, 1.2]), { y: 0.3, seed: 4 }));
  f.add(people(scatter(30, [-29, 29, -29, 29], { seed: 5, avoid: [[-24, 24, -24, 24]] }).map(([x, z]) => [x, z, 1.5]), { seed: 5 }));
  const gallery = [];
  for (let k = 0; k < 18; k++) { const a = (k / 18) * Math.PI * 2 + 0.2; gallery.push([Math.sin(a) * 22.6, Math.cos(a) * 22.6, 31.1]); }
  f.add(people(gallery, { seed: 6 }));
  f.add(people(scatter(14, [-6, 6, 34, 58], { seed: 7 }), { seed: 7 }));
  g.add(asiBoard('Gol Gumbaz', 9, 56, 0));
}

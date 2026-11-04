import { shrubs, lampPosts, asiBoard, scatter, along } from './realism.js';

// The Gumbaz at Srirangapatna, Tipu Sultan's mausoleum: flower beds along the cypress avenue,
// lamps, and the ASI board.
export function addDetails(f, g) {
  g.add(shrubs([...along(10, [-6.5, 20], [-6.5, 82]), ...along(10, [6.5, 20], [6.5, 82])].map(([x, z]) => [x, z, 1.3]), { flowers: '#d0306f', seed: 3 }));
  g.add(shrubs(scatter(30, [-80, 80, -80, 80], { seed: 4, gap: 8, avoid: [[-22, 22, -22, 22], [-14, 14, 15, 90]] }).map(([x, z]) => [x, z, 2.2]), { seed: 4 }));
  g.add(lampPosts([...along(5, [-13, 25], [-13, 80]), ...along(5, [13, 25], [13, 80])]));
  g.add(asiBoard('Gumbaz, Srirangapatna', 8, 86, 0));
}

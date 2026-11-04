import { mat, box, cyl } from '../helpers.js';
import { trees, shrubs, lampPosts, asiBoard, scatter, along } from './realism.js';

// The Basilica of Bom Jesus in Old Goa: coconut palms and bougainvillea round the lawns, the stone
// cross on its pedestal before the church, and lamps along the square.
const LATERITE = mat('#9b5b3f', 0.95), LIME = mat('#ece6da', 0.85);
export function addDetails(f, g) {
  g.add(trees(scatter(24, [-78, 78, -58, 98], { seed: 3, gap: 10, avoid: [[-30, 32, -48, 20], [-16, 16, 18, 82]] }), { kind: 'palm', seed: 3 }));
  g.add(shrubs(scatter(16, [-70, 70, 22, 90], { seed: 4, gap: 6, avoid: [[-17, 17, 18, 82]] }).map(([x, z]) => [x, z, 1.8]), { flowers: '#d0306f', seed: 4 }));
  // The cross in front of the church: a laterite pedestal, a whitewashed shaft and cross
  f.add(box(3, 2, 3, LATERITE, 0, 0, 40), box(2.2, 0.4, 2.2, LIME, 0, 2, 40), cyl(0.18, 0.22, 4.5, LIME, 0, 2.4, 40, 8), box(2, 0.32, 0.32, LIME, 0, 5.6, 40));
  g.add(lampPosts([...along(5, [-15, 24], [-15, 78]), ...along(5, [15, 24], [15, 78])]));
  g.add(asiBoard('Basilica of Bom Jesus', 20, 80, 0, { line2: 'WORLD HERITAGE SITE' }));
}

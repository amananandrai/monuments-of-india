import { trees, lampPosts, along } from './realism.js';

// Soniji ki Nasiyan at Ajmer: neem trees along the street outside the red sandstone temple and the
// Swarna Nagari hall with its gilded city, and lamps.
export function addDetails(f, g) {
  g.add(trees([...along(9, [-65, 55], [65, 55]), ...along(5, [-65, -55], [65, -55])], { kind: 'neem', seed: 4 }));
  g.add(lampPosts(along(8, [-60, 50], [60, 50])));
}

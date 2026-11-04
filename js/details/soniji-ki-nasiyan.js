import { trees, people, lampPosts, scatter, along } from './realism.js';

// Soniji ki Nasiyan at Ajmer: Jain devotees and visitors at the red sandstone temple and the
// Swarna Nagari hall with its gilded city, neem trees along the street, and lamps.
export function addDetails(f, g) {
  f.add(people(scatter(34, [-60, 60, 14, 50], { seed: 3 }), { seed: 3, palette: ['#f4f1ea', '#f7f7f7', '#f2d23a', '#d9342b', '#2f5d9a', '#e26a9c'] }));
  g.add(trees([...along(9, [-65, 55], [65, 55]), ...along(5, [-65, -55], [65, -55])], { kind: 'neem', seed: 4 }));
  g.add(lampPosts(along(8, [-60, 50], [60, 50])));
}

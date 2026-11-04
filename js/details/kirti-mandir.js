import { trees, shrubs, lampPosts, scatter, along } from './realism.js';

// Kirti Mandir at Porbandar, by Gandhi's birthplace: the lawn's hedges and flower beds, lamps, and
// neem trees along the street.
export function addDetails(f, g) {
  g.add(shrubs([...along(8, [-28, 27], [-28, 53]), ...along(8, [28, 27], [28, 53])].map(([x, z]) => [x, z, 1]), { seed: 3 }));
  g.add(shrubs(scatter(10, [-24, 24, 30, 52], { seed: 4, gap: 4, avoid: [[-6, 6, 14, 60]] }).map(([x, z]) => [x, z, 1.4]), { flowers: '#f08a1c', seed: 4 }));
  g.add(trees([...along(6, [-62, 58], [62, 58]), ...along(4, [-62, -50], [62, -50])], { kind: 'neem', seed: 5 }));
  g.add(lampPosts(along(4, [-4, 18], [-4, 54]).concat(along(4, [4, 18], [4, 54]))));
}

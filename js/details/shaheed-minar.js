import { trees, people, lampPosts, scatter, along, around } from './realism.js';

// The Shaheed Minar on Kolkata's Maidan: the crowds that gather on the great green round it, the
// old trees of the Maidan, and lamps round the paved square at its foot.
export function addDetails(f, g) {
  g.add(people(scatter(90, [-190, 190, -100, 180], { seed: 3, gap: 3, avoid: [[-31, 31, -31, 31]] }), { seed: 3 }));
  f.add(people(scatter(26, [-29, 29, -29, 29], { seed: 4, avoid: [[-9, 9, -9, 9]] }), { seed: 4 }));
  g.add(trees([...along(14, [-195, -105], [195, -105]), ...along(14, [-195, 185], [195, 185]), ...scatter(16, [-190, 190, -100, 180], { seed: 5, gap: 30, avoid: [[-60, 60, -60, 60]] })], { kind: 'banyan', seed: 5 }));
  g.add(lampPosts(around(12, 30, 0, 0, 0.26)));
}

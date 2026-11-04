import { trees, shrubs, people, lampPosts, vehicles, scatter, along } from './realism.js';

// The Statue of Unity at Kevadia: visitors on the pedestal's terraces and the walkway round its
// foot, the beds of the Valley of Flowers laid out on the bank below it, lamps, and the tour buses
// in the car park.
export function addDetails(f, g) {
  f.add(people(scatter(40, [-40, 40, -40, 40], { seed: 3, avoid: [[-30, 30, -30, 30]] }).map(([x, z]) => [x, z, 22]), { seed: 3 }));
  f.add(people(scatter(26, [-30, 30, -30, 30], { seed: 4, avoid: [[-22, 22, -22, 22]] }).map(([x, z]) => [x, z, 42]), { seed: 4 }));
  g.add(people(scatter(40, [-75, 75, -75, 75], { seed: 5, avoid: [[-44, 44, -44, 44]] }), { seed: 5, y: 0.3 }));
  const beds = ['#d0306f', '#f2c21c', '#f08a1c', '#7a3f8f', '#f4f1ea', '#d9342b'];
  beds.forEach((c, i) => g.add(shrubs(scatter(14, [-78, 78, 46 + i * 5, 50 + i * 5], { seed: 6 + i, gap: 2.5 }).map(([x, z]) => [x, z, 1.4]), { y: 0.3, flowers: c, seed: 6 + i })));
  g.add(trees([...along(8, [-78, -78], [-78, 78]), ...along(8, [78, -78], [78, 78])], { kind: 'neem', seed: 13, y: 0.3 }));
  g.add(lampPosts([...along(6, [-46, -46], [-46, 46]), ...along(6, [46, -46], [46, 46])], { y: 0.3 }));
  g.add(vehicles(along(6, [-70, -70], [-30, -70]).map(([x, z]) => [x, 0.3, z, 0]), { busShare: 1, busPaints: ['#f2f2f2', '#c2512a', '#2f5d9a'], seed: 14 }));
}

import { trees, shrubs, lampPosts, fountains, garland, scatter, along } from './realism.js';

// Akshardham: fountains playing in the Narayan Sarovar round the mandir, the gardens between it and
// the colonnade, lamps at the corners, and marigold garlands over the main door.
export function addDetails(f, g) {
  const jets = [...along(9, [-64, -76], [-64, 76]), ...along(9, [64, -76], [64, 76]), ...along(7, [-48, -76], [48, -76])];
  g.add(fountains(jets, { y: 0.3, h: 2.6 }));
  const garden = [];
  for (const [x0, x1, z0, z1] of [[-110, -80, -115, 115], [80, 110, -115, 115], [-75, 75, -118, -88]]) garden.push(...scatter(8, [x0, x1, z0, z1], { seed: Math.abs(x0 + z0), gap: 12 }));
  g.add(trees(garden, { kind: 'neem', seed: 3 }), shrubs(garden.map(([x, z]) => [x + 4, z + 3, 1.6]), { flowers: '#d24d8a', seed: 4 }));
  g.add(trees([...along(6, [-20, 95], [-20, 125]), ...along(6, [20, 95], [20, 125])], { kind: 'ashoka', seed: 5 }));
  g.add(lampPosts([[-80, 90], [80, 90], [-80, -90], [80, -90], ...along(4, [-12, 90], [-12, 125]), ...along(4, [12, 90], [12, 125])]));
  f.add(garland([-1.9, 15.4, 41.7], [1.9, 15.4, 41.7], { sag: 0.45, strands: 2 }));
}

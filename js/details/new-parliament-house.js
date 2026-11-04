import { trees, shrubs, people, lampPosts, vehicles, scatter, around } from './realism.js';
import { at, tricolour } from '../helpers.js';

// The new Parliament House in Delhi: the tricolour over the building, lawns and hedges round the
// triangle, neem trees on the edge of the grounds, lamps, official cars at the ceremonial
// entrances, and visitors.
export function addDetails(f, g) {
  f.add(at(tricolour(12), 18, 24, 0));
  g.add(trees(around(30, 120, 0, 0, 0.05), { kind: 'neem', seed: 3 }), shrubs(around(48, 102).map(([x, z]) => [x, z, 1.4]), { seed: 4 }));
  g.add(lampPosts(around(18, 96, 0, 0, 0.17)));
  const V3 = [0, 1, 2].map((i) => { const a = Math.PI / 2 + (i * 2 * Math.PI) / 3; return [Math.cos(a) * 74, Math.sin(a) * 74]; });
  const cars = [], crowd = [];
  V3.forEach(([x, z]) => { const a = Math.atan2(x, z), d = Math.hypot(x, z) + 10; cars.push([Math.sin(a) * d - Math.cos(a) * 9, 0.2, Math.cos(a) * d + Math.sin(a) * 9, a + Math.PI / 2], [Math.sin(a) * d - Math.cos(a) * 14, 0.2, Math.cos(a) * d + Math.sin(a) * 14, a + Math.PI / 2]); crowd.push(...scatter(8, [-6, 6, 0, 10], { seed: Math.round(a * 10) }).map(([u, v]) => [Math.sin(a) * (d - 2 + v) + Math.cos(a) * u, Math.cos(a) * (d - 2 + v) - Math.sin(a) * u])); });
  g.add(vehicles(cars, { paints: ['#f2f2f2', '#1d1d1d'], busShare: 0, seed: 5 }), people(crowd, { seed: 6 }));
}

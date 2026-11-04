import { trees, people, lampPosts, vehicles, scatter, along } from './realism.js';
import { rng } from '../helpers.js';

// Chhatrapati Shivaji Maharaj Terminus: the black-and-yellow taxis waiting in the forecourt and the
// red BEST buses on the road in front, the crowds of passengers coming and going, lamps, and the
// rain trees along the road.
export function addDetails(f, g) {
  const R = rng(17), taxis = [];
  for (let k = 0; k < 12; k++) for (const x of [-30, -24]) taxis.push([x + (k % 2) * 0.2, 1, 20 + k * 1.4 + (x < -26 ? 0 : 0.7), Math.PI / 2]);
  for (let k = 0; k < 10; k++) taxis.push([28, 1, 18 + k * 4.8, 0]);
  g.add(vehicles(taxis, { paints: ['#1d1d1d'], busShare: 0, seed: 3 }));
  const road = [];
  for (const [z, ry] of [[66, Math.PI / 2], [71, Math.PI / 2], [78, -Math.PI / 2], [83, -Math.PI / 2]]) for (let x = -100; x < 100; x += 14 + R() * 24) road.push([x, 0.2, z, ry]);
  g.add(vehicles(road, { paints: ['#1d1d1d', '#1d1d1d', '#f2f2f2', '#c8c8c8', '#2b2b2b', '#b3262e'], busPaints: ['#c4262e'], busShare: 0.18, seed: 4 }));
  f.add(people([...scatter(70, [-46, 46, 14, 42], { seed: 5, avoid: [[-32, -22, 18, 40], [26, 30, 16, 66]] }), ...scatter(40, [-100, 100, 50, 60], { seed: 6 })].map(([x, z]) => [x, z, z < 30 ? 1 : 0.2]), { seed: 5 }));
  g.add(lampPosts([...along(9, [-100, 58], [100, 58]), ...along(9, [-100, 90], [100, 90])], { h: 5 }));
  g.add(trees(along(8, [-100, 95], [100, 95]), { kind: 'banyan', seed: 7, h: 12 }));
}

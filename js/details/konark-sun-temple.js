import { trees, shrubs, asiBoard, scatter, along } from './realism.js';

// The Sun Temple at Konark: the casuarina and palm groves and kept lawns of the temple park, and
// the ASI board.
export function addDetails(f, g) {
  g.add(trees(scatter(30, [-75, 75, -85, 100], { seed: 3, gap: 11 }).filter(([x, z]) => Math.abs(x) > 26), { kind: 'palm', seed: 3 }));
  g.add(trees([...along(6, [-34, -70], [-34, 90]), ...along(6, [34, -70], [34, 90])], { kind: 'cypress', seed: 4, h: 12 }));
  g.add(shrubs(scatter(16, [-30, 30, 66, 92], { seed: 5, gap: 4 }).map(([x, z]) => [x, z, 1.6]), { flowers: '#d0306f', seed: 5 }));
  g.add(asiBoard('Sun Temple, Konark', 10, 92, 0, { line2: 'WORLD HERITAGE SITE' }));
}

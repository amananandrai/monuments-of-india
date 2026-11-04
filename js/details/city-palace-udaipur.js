import { trees, shrubs, boats, scatter, along } from './realism.js';

// The City Palace at Udaipur: canopied boats on Lake Pichola and round the Lake Palace, the scrub
// and trees of the ridge behind, and bougainvillea on the terraces.
export function addDetails(f, g) {
  g.add(boats([[-80, 60, 0.3], [-30, 95, 1.2], [90, 110, -0.5], [120, 60, 2.3], [-120, 130, 0.9], [-10, 150, 1.8], [75, 205, 0.2]], { y: 0.3, size: 1.8, canopy: true, colours: ['#f4f1ea', '#e8d9b0', '#c2512a'] }));
  g.add(trees(scatter(40, [-380, 380, -230, -50], { seed: 3, gap: 16, avoid: [[-130, 130, -30, 20]] }), { kind: 'mango', seed: 3, y: 0.2, h: 8 }));
  f.add(shrubs(along(14, [-120, 9.5], [120, 9.5]).map(([x, z]) => [x, z, 1.6]), { y: 14, flowers: '#d0306f', seed: 4 }));
}

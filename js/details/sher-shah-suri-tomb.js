import { trees, people, boats, asiBoard, scatter, along } from './realism.js';

// Sher Shah Suri's tomb at Sasaram, in the middle of its lake: visitors on the causeway and the
// terrace, a few boats on the water, the ghats and trees round the shore, and the ASI board.
export function addDetails(f, g) {
  g.add(people(scatter(16, [-3, 3, 36, 100], { seed: 3 }).map(([x, z]) => [x, z, 1.2]), { seed: 3 }));
  f.add(people(scatter(24, [-37, 37, -37, 37], { seed: 4, avoid: [[-31, 31, -31, 31]] }).map(([x, z]) => [x, z, 4]), { seed: 4 }));
  g.add(boats([[-60, 50, 0.4], [70, -40, 2.1], [-40, -70, 1.3]], { y: 0.3, size: 1.6 }));
  const shore = scatter(60, [-128, 128, -128, 128], { seed: 5, gap: 12 }).filter(([x, z]) => Math.max(Math.abs(x), Math.abs(z)) > 104);
  g.add(trees(shore, { kind: 'mango', seed: 5 }));
  g.add(asiBoard("Sher Shah Suri's Tomb", 8, 104, 0));
}

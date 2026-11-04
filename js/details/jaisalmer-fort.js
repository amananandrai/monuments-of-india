import { trees, people, scatter } from './realism.js';
import { camels as camelHerd } from './animals.js';

// Jaisalmer, the golden fort of the Thar: camels and their drivers on the sand below the hill,
// khejri and kair trees dotting the desert, and visitors in the lanes inside the walls.
export function addDetails(f, g) {
  g.add(camelHerd([[60, 110, -2.2, true], [66, 116, -2.0, false], [-80, 96, 1.1, true], [-74, 104, 1.3, true], [120, 40, -1.5, false], [-130, 30, 0.6, true]]));
  g.add(trees(scatter(40, [-290, 290, -290, 290], { seed: 3, gap: 22 }).filter(([x, z]) => Math.hypot(x / 125, z / 75) > 1.1), { kind: 'mango', seed: 3, h: 6 }));
  f.add(people(scatter(40, [-70, 70, -40, 40], { seed: 4 }).filter(([x, z]) => (x / 82) ** 2 + (z / 48) ** 2 < 1), { seed: 4, y: 22 }));
  g.add(people(scatter(12, [-20, 20, 64, 90], { seed: 5 }), { seed: 5 }));
}

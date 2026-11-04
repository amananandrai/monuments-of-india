import { trees, scatter } from './realism.js';
import { camels as camelHerd } from './animals.js';

// Jaisalmer, the golden fort of the Thar: camels in their saddle cloths on the sand below the hill,
// and khejri and kair trees dotting the desert.
export function addDetails(f, g) {
  g.add(camelHerd([[60, 110, -2.2], [66, 116, -2.0], [-80, 96, 1.1], [-74, 104, 1.3], [120, 40, -1.5], [-130, 30, 0.6]]));
  g.add(trees(scatter(40, [-290, 290, -290, 290], { seed: 3, gap: 22 }).filter(([x, z]) => Math.hypot(x / 125, z / 75) > 1.1), { kind: 'mango', seed: 3, h: 6 }));
}

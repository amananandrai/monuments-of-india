import { M, mat, at, flag } from '../helpers.js';
import { trees, people, PILGRIMS, garland, asiBoard, scatter, along } from './realism.js';
import { rideElephant } from './animals.js';
import { lamp } from './doorways.js';

// The Brihadeeswara at Thanjavur: devotees in the great court, the temple elephant blessing them
// by the Nandi pavilion, marigold garlands over the main doorway, lamps lit before it, coconut
// palms round the court, and the ASI board at the gate.
export function addDetails(f, g) {
  g.add(people(scatter(60, [-33, 33, -40, 102], { seed: 3, avoid: [[-16, 16, -16, 16], [-12, 12, 14, 72], [-9, 9, 88, 104]] }), { seed: 3, palette: [...PILGRIMS, '#f4f1ea', '#f4f1ea', '#b3262e', '#2f7a3f'] }));
  const tusker = rideElephant(mat('#5e5650', 0.9), 0.9, { cloth: '#b3262e', howdah: false });
  tusker.position.set(12, 0, 84);
  tusker.rotation.y = -Math.PI / 2;
  g.add(tusker);
  g.add(garland([-2.2, 7.6, 70.9], [2.2, 7.6, 70.9], { sag: 0.5, strands: 3 }));
  for (const x of [-2.8, 2.8]) g.add(at(lamp(1.6), x, 1, 72));
  g.add(trees([...along(9, [-32, -40], [-32, 100]), ...along(9, [32, -40], [32, 100])], { kind: 'palm', seed: 4 }));
  g.add(asiBoard('Brihadisvara Temple', 10, 104, 0, { line2: 'GREAT LIVING CHOLA TEMPLES' }));
}

import { trees, people, MONKS, prayerFlags, asiBoard, scatter, around } from './realism.js';
import { deer } from './animals.js';

// The Dhamek Stupa at Sarnath, in the deer park (Isipatana) where the Buddha first taught: monks
// and pilgrims walking round the stupa, prayer flags strung from it, the deer of the park, ashoka
// and bodhi trees, and the ASI board.
export function addDetails(f, g) {
  f.add(people(around(26, 18.5, 0, 0, 0.1).map(([x, z], i) => [x + Math.sin(i) * 0.6, z]), { seed: 3, palette: MONKS }));
  for (let k = 0; k < 6; k++) { const a = (k / 6) * Math.PI * 2; f.add(prayerFlags([Math.sin(a) * 12, 40, Math.cos(a) * 12], [Math.sin(a) * 34, 3, Math.cos(a) * 34], { sag: 2.5, size: 0.5 })); }
  g.add(trees(scatter(20, [-100, 100, -95, 95], { seed: 4, gap: 14, avoid: [[-36, 36, -36, 36], [-95, 5, 25, 95]] }), { kind: 'neem', seed: 4 }));
  g.add(trees([[40, -38], [-42, -40]], { kind: 'banyan', seed: 5, h: 14 }));
  g.add(deer(scatter(14, [40, 100, -90, 90], { seed: 6, gap: 4 }).map(([x, z], i) => [x, z, i * 2.3])));
  g.add(people(scatter(16, [-90, 90, -90, 20], { seed: 7, avoid: [[-36, 36, -36, 36]] }), { seed: 7 }));
  g.add(asiBoard('Dhamekh Stupa, Sarnath', 24, -40, Math.PI));
}

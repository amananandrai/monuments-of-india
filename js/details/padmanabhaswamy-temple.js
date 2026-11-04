import { mat } from '../helpers.js';
import { trees, people, scatter, along } from './realism.js';
import { rideElephant } from './animals.js';

// The Sree Padmanabhaswamy temple at Thiruvananthapuram: devotees in the white and cream of
// Kerala dress (men in mundu, women in kasavu sarees) in the court and round the Padma Theertham
// tank, the temple elephant, and coconut palms round the tank and the walls.
const KERALA = ['#f4f1ea', '#f7f7f7', '#efe2c0', '#f4f1ea', '#e3b54a', '#b3262e'];
export function addDetails(f, g) {
  f.add(people(scatter(60, [-46, 46, -60, 62], { seed: 3, avoid: [[-40, 40, -51, 51]] }), { seed: 3, palette: KERALA }));
  f.add(people(scatter(26, [-34, 34, 18, 46], { seed: 4, avoid: [[-3, 3, 23, 30]] }).map(([x, z]) => [x, z, 1.2]), { seed: 4, palette: KERALA }));
  g.add(people(scatter(26, [-27, 27, 68, 116], { seed: 5, avoid: [[-24, 24, 73, 111]] }).map(([x, z]) => [x, z, 1]), { seed: 5, palette: KERALA }));
  const tusker = rideElephant(mat('#4f4844', 0.9), 0.95, { cloth: '#e3b54a', trim: '#e3b54a', howdah: false });
  tusker.position.set(-14, 0.3, 40);
  tusker.rotation.y = 0.3;
  f.add(tusker);
  g.add(trees([...along(8, [-34, 66], [-34, 120]), ...along(8, [34, 66], [34, 120]), ...along(10, [-60, -70], [-60, 60]), ...along(10, [60, -70], [60, 60])], { kind: 'palm', seed: 6 }));
}

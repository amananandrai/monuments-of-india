import { mat } from '../helpers.js';
import { trees, along, cityAround } from './realism.js';
import { rideElephant } from './animals.js';

// The Sree Padmanabhaswamy temple at Thiruvananthapuram: the temple elephant, and coconut palms
// round the Padma Theertham tank and the walls.
export function addDetails(f, g) {
  const tusker = rideElephant(mat('#4f4844', 0.9), 0.95, { cloth: '#e3b54a', trim: '#e3b54a', howdah: false });
  tusker.position.set(-14, 0.3, 40);
  tusker.rotation.y = 0.3;
  f.add(tusker);
  g.add(trees([...along(8, [-34, 66], [-34, 120]), ...along(8, [34, 66], [34, 120]), ...along(10, [-60, -70], [-60, 60]), ...along(10, [60, -70], [60, 60])], { kind: 'palm', seed: 6 }));
  // The East Fort quarter of Thiruvananthapuram round the temple and its tank: tiled-roof houses
  // along the streets, the road east from the tank kept open.
  g.add(cityAround([-64, 64, -70, 120], { rows: 3, gap: 8, seed: 97, roof: 'pitched', roofs: ['#9a4a32', '#a85a3a', '#8a4030'],
    paint: ['#f1ece0', '#e8dcc0', '#f3e3c8', '#dfe8e2', '#efd9c9'], keep: [[-16, 16, 120, 400]] }));
}

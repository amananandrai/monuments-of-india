import { rng } from '../helpers.js';
import { people, vehicles, autos, shrubs, scatter } from './realism.js';

// The Hawa Mahal on Jaipur's Badi Chaupar road: auto-rickshaws and cars in the traffic, crowds on
// the pavement in front of the screen and the shops along it, and the bazaar's bright clothes.
export function addDetails(f, g) {
  const R = rng(7), cars = [], three = [];
  for (const [z, ry] of [[8, Math.PI / 2], [11, Math.PI / 2], [14, -Math.PI / 2], [17, -Math.PI / 2]]) {
    for (let x = -48; x < 48; x += 7 + R() * 9) (R() < 0.55 ? three : cars).push([x, 0.2, z, ry]);
  }
  g.add(autos(three), vehicles(cars, { seed: 8, busShare: 0.08 }));
  f.add(people(scatter(36, [-48, 48, 1.8, 5.2], { seed: 9 }), { seed: 9 }));
  g.add(people(scatter(14, [-48, 48, 19.5, 22], { seed: 10 }), { seed: 10 }));
  g.add(shrubs([[-26, 3.6, 1.2], [26, 3.6, 1.2]], { flowers: '#d0306f', y: 0.3 }));
}

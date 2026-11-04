import { shrubs } from './realism.js';

// The Hawa Mahal on Jaipur's Badi Chaupar road: flowering bougainvillea at either end of the
// pavement in front of the screen.
export function addDetails(f, g) {
  g.add(shrubs([[-26, 3.6, 1.2], [26, 3.6, 1.2]], { flowers: '#d0306f', y: 0.3 }));
}

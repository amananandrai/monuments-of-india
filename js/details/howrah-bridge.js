import { rng } from '../helpers.js';
import { lampPosts, boats } from './realism.js';

// Howrah Bridge over the Hooghly: lamps on the deck, and country boats with their curved hoods on
// the river.
export function addDetails(t, g) {
  const R = rng(11);
  const lamps = [];
  for (let x = -520; x <= 520; x += 30) lamps.push([x, -12.9], [x, 12.9]);
  g.add(lampPosts(lamps, { y: 10, h: 6 }));
  const fleet = [];
  for (let i = 0; i < 16; i++) fleet.push([-700 + R() * 1400, (R() < 0.5 ? -1 : 1) * (40 + R() * 200), R() * 6.28]);
  g.add(boats(fleet, { y: 0.15, size: 2.4, canopy: true, colours: ['#5a3d2a', '#3d2f24', '#7a4e2d'] }));
}

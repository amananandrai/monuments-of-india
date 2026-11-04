import { M, box, mat, rng } from '../helpers.js';
import { lampPosts, vehicles, boats } from './realism.js';

// The Bandra–Worli Sea Link: traffic in all eight lanes, crash barriers and lamp posts along both
// edges of the deck, and the Koli fishermen's boats of Worli and Mahim out in the bay.
export function addDetails(f, g) {
  const deckY = 20.3, R = rng(21), places = [];
  for (const [z, ry] of [[-9.2, Math.PI / 2], [-5.6, Math.PI / 2], [-2, Math.PI / 2], [2, -Math.PI / 2], [5.6, -Math.PI / 2], [9.2, -Math.PI / 2]]) {
    for (let x = -790; x < 790; x += 22 + R() * 40) places.push([x, deckY, z, ry]);
  }
  g.add(vehicles(places));
  for (const s of [-1, 1]) g.add(box(1600, 1.1, 0.4, mat('#d8d5ce', 0.8), 0, deckY, s * 11.6), box(1600, 0.2, 0.6, M.steel, 0, deckY + 1.1, s * 11.6));
  const lamps = [];
  for (let x = -780; x <= 780; x += 40) if (Math.abs(x) > 12) lamps.push([x, -11.9], [x, 11.9]);
  g.add(lampPosts(lamps, { h: 10, y: deckY }));
  const fleet = [];
  for (let i = 0; i < 18; i++) fleet.push([-500 + R() * 1000, (R() < 0.5 ? -1 : 1) * (90 + R() * 300), R() * 6.28]);
  g.add(boats(fleet, { y: 0.25, size: 2.2, colours: ['#2f5d9a', '#c2512a', '#f2d23a', '#3c8a5a'] }));
}


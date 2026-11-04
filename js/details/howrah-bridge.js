import { rng } from '../helpers.js';
import { people, lampPosts, vehicles, boats } from './realism.js';

// Howrah Bridge over the Hooghly: the traffic of Kolkata crossing it, yellow Ambassador taxis
// among the cars and the blue-and-yellow buses, pedestrians streaming along the footways outside
// the trusses, lamps on the deck, and country boats with their curved hoods on the river.
export function addDetails(t, g) {
  const R = rng(11), traffic = [];
  for (const [z, ry] of [[-7.5, Math.PI / 2], [-3, Math.PI / 2], [3, -Math.PI / 2], [7.5, -Math.PI / 2]]) for (let x = -540; x < 540; x += 9 + R() * 22) traffic.push([x, 10, z, ry]);
  g.add(vehicles(traffic, { paints: ['#f2c21c', '#f2c21c', '#f2c21c', '#f2f2f2', '#2b2b2b', '#c8c8c8', '#b3262e'], busPaints: ['#2f5d9a', '#e3b23c'], busShare: 0.14, seed: 12 }));
  const walk = [];
  for (const z of [-12.2, 12.2]) for (let x = -540; x < 540; x += 8 + R() * 16) walk.push([x, z + (R() - 0.5) * 0.9, 10]);
  g.add(people(walk, { seed: 13 }));
  const lamps = [];
  for (let x = -520; x <= 520; x += 30) lamps.push([x, -12.9], [x, 12.9]);
  g.add(lampPosts(lamps, { y: 10, h: 6 }));
  const fleet = [];
  for (let i = 0; i < 16; i++) fleet.push([-700 + R() * 1400, (R() < 0.5 ? -1 : 1) * (40 + R() * 200), R() * 6.28]);
  g.add(boats(fleet, { y: 0.15, size: 2.4, canopy: true, colours: ['#5a3d2a', '#3d2f24', '#7a4e2d'] }));
}

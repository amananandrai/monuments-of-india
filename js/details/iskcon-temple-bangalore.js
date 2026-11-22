import * as THREE from 'three';
import { M, mat, box, at } from '../helpers.js';
import { mergeByMaterial, railing } from '../parts/components.js';
import { steps } from '../parts/doorways.js';
import { heightField, fbm, smooth } from '../parts/terrain.js';
import { trees, shrubs, lampPosts, along, scatter, townHouses, traffic, garland } from '../parts/realism.js';
import { detail } from '../detail.js';

// The hilltop's height over the road.
export const HILL = 12;
const GRANITE = mat('#9b9289', 0.85), RAIL = mat('#e8e2d2', 0.6), CANOPY = mat('#d9a441', 0.6);

// Hare Krishna Hill: a low rocky hillock, its top levelled for the temple (about 34 × 50 m round
// the terrace), falling away in grassy slopes to the road; a cut on the south (+z) for the stair.
function hill(x, z) {
  const r = Math.hypot(x * 1.05, (z - 4) * 0.85);
  let y = HILL * (1 - smooth(40, 105, r)) + 1.2 * fbm(x, z, { scale: 0.03, octaves: 3 }) * smooth(36, 60, r);
  if (Math.abs(x) < 9 && z > 36) y = Math.min(y, 0.2 + (HILL - 0.2) * (1 - smooth(38, 80, z)) - (Math.abs(x) < 7.2 ? 2 : 0));
  return y - 0.1;
}

// ISKCON Bangalore's setting, from photographs: the temple on its levelled hilltop, the long stair
// up from the road under a canopy for the queues, with brass lamps and railings; gardens of palms and
// flowering shrubs on the slopes; Chord Road below with its traffic, and the houses and flats of
// Rajajinagar round the hill. Dimensions follow js/monuments/iskcon-temple-bangalore.js.
export function addDetails(f, g, { y0 }) {
  g.add(heightField(560, 560, detail.low ? 90 : 140, hill, { rock: ['#8a7f72', '#958a7c'], cover: '#6c8a46', steep: 0.72, band: 5 }));
  // The stair up the hill: two flights with a landing, between granite side walls with railings
  // and lamps, and a light canopy over the queue lane beside it.
  const st = new THREE.Group();
  st.add(at(steps(12, HILL / 2, 18, GRANITE, 0.9), 0, HILL / 2, 38), box(12, HILL / 2, 6, GRANITE, 0, 0, 57.3 + 3));
  st.add(at(steps(12, HILL / 2, 18, GRANITE, 0.9), 0, 0, 63.3));
  for (const s of [-1, 1]) st.add(box(1, HILL, 26, GRANITE, s * 6.5, 0, 50), box(1, HILL / 2 + 1, 20, GRANITE, s * 6.5, 0, 72));
  g.add(mergeByMaterial(st));
  const rails = new THREE.Group();
  for (const s of [-1, 1]) rails.add(at(railing(30, 1, 0.25, RAIL), s * 6.5, y0, 22).rotateY(Math.PI / 2));
  g.add(mergeByMaterial(rails), lampPosts([...along(5, [-7, 40], [-7, 80]), ...along(5, [7, 40], [7, 80])]));
  const canopy = new THREE.Group();
  for (let k = 0; k < 9; k++) { const z = 40 + k * 5, yy = Math.max(0.2, hill(-11, z)); canopy.add(box(0.2, 3, 0.2, RAIL, -9, yy, z), box(0.2, 3, 0.2, RAIL, -13, yy, z), box(5, 0.15, 5.2, CANOPY, -11, yy + 3, z)); }
  g.add(mergeByMaterial(canopy));
  // Garlands of marigolds across the porch, and the terrace's gardens.
  f.add(garland([-7, y0 + 8.4, 23.4], [7, y0 + 8.4, 23.4], { sag: 0.8, strands: 2 }));
  g.add(trees([[-22, 30], [22, 30], [-24, -32], [24, -32], ...along(5, [-30, -20], [-30, 24]), ...along(5, [30, -20], [30, 24])].map(([x, z]) => [x, z, null, y0]), { kind: 'palm', seed: 31 }));
  g.add(shrubs([...scatter(30, [-90, -20, 20, 90], { seed: 32 }), ...scatter(30, [20, 90, 20, 90], { seed: 33 })].map(([x, z]) => [x, z, 1.5, hill(x, z)]), { flowers: '#e05a8a' }));
  g.add(trees(scatter(26, [-130, 130, -130, -40], { seed: 34, gap: 12 }).map(([x, z]) => [x, z, null, hill(x, z)]), { kind: 'neem', seed: 35 }));
  // The road below the hill and the town round it.
  g.add(box(560, 0.15, 16, M.asphalt, 0, -0.05, 120), traffic([[116, 1], [124, -1]], -260, 260, { y: 0.1, gap: 18, seed: 5, buses: 0.15 }));
  const houses = [];
  const R = scatter(detail.low ? 60 : 120, [-270, 270, -270, 270], { seed: 36, gap: 14, avoid: [[-125, 125, -125, 112], [-280, 280, 108, 134]] });
  for (const [x, z] of R) houses.push([x, z, 9 + (Math.abs(x * 7 + z) % 6), 10 + (Math.abs(z * 3) % 5), 2 + Math.floor(Math.abs(x + z) % 3), Math.round(((x * 13 + z) % 4)) * Math.PI / 2, 0]);
  g.add(townHouses(houses, { seed: 37, fine: false }));
}

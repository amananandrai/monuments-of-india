import * as THREE from 'three';
import { M, box, rng } from '../helpers.js';
import { mergeByMaterial } from '../parts/components.js';
import { trees, shrubs, lampPosts, benches, scatter, along, townHouses } from '../parts/realism.js';
import { heightField, fbm, ridged, smooth } from '../parts/terrain.js';
import { detail } from '../detail.js';
import { S, MARBLE, SHADE } from '../monuments/solomons-temple-aizawl.js';

// Solomon's Temple, its setting. From photographs: the temple stands alone on a levelled hilltop in
// the Kidron Valley at the edge of Aizawl, in lawns edged with flowering shrubs, a broad drive
// climbing to its front between white walls and lamps. Round it the green ridges of Mizoram fold
// away, forested in bamboo, teak and pine, and the houses of Aizawl, many storeys of concrete in
// pastel colours, crowd the slopes across the valley.
const HILLS = (x, z) => {
  const r = Math.hypot(x, z * 1.2), top = -70 * smooth(70, 260, r);
  const ridges = 150 * ridged(x + 400, z, { scale: 0.0022, octaves: 4 }) * smooth(240, 700, r);
  return top + ridges + 10 * fbm(x, z, { scale: 0.006, octaves: 3 }) * smooth(60, 120, r) - 0.08;
};

export function addDetails(f, g) {
  const { H, PD } = S, W = H + 2 * PD;
  g.add(heightField(2200, 2200, detail.low ? 110 : 170, HILLS, { rock: ['#7d7462', '#6f6a5c'], cover: '#4c7339', steep: 0.55 }));
  // The levelled hilltop: lawns, the drive to the main porch, and a white wall round the edge.
  g.add(box(150, 0.1, 130, M.grass, 0, 0, 10), box(12, 0.12, 50, M.path, 0, 0, W / 2 + 29), box(W + 14, 0.12, W + 14, M.path, 0, 0, 0));
  const wall = new THREE.Group();
  for (const s of [-1, 1]) {
    wall.add(box(150, 1.2, 0.5, MARBLE, 0, 0, 10 + s * 65), box(0.5, 1.2, 130, MARBLE, s * 75, 0, 10));
    wall.add(box(1.4, 3.2, 1.4, MARBLE, s * 6.5, 0, 75), box(1.7, 0.3, 1.7, SHADE, s * 6.5, 3.2, 75));
  }
  g.add(mergeByMaterial(wall));
  g.add(shrubs([...along(9, [-9, W / 2 + 8], [-9, 70]), ...along(9, [9, W / 2 + 8], [9, 70]), ...along(10, [-W / 2 - 10, -W / 2 - 10], [W / 2 + 10, -W / 2 - 10])].map(([x, z]) => [x, z, 1.2]), { flowers: '#c8325f', seed: 3 }));
  g.add(lampPosts([...along(5, [-7, W / 2 + 10], [-7, 72]), ...along(5, [7, W / 2 + 10], [7, 72])]));
  g.add(benches([[-24, 44], [24, 44], [-50, 0], [50, 0]]));
  g.add(trees(scatter(14, [-70, 70, -50, 70], { seed: 6, gap: 12, avoid: [[-W / 2 - 10, W / 2 + 10, -W / 2 - 10, W / 2 + 10], [-12, 12, 0, 80]] }), { kind: 'fir', seed: 6 }));
  // Forest over the slopes and ridges.
  const R = rng(21), T = [];
  for (let k = 0; k < (detail.low ? 260 : 520); k++) {
    const x = (R() - 0.5) * 1600, z = (R() - 0.5) * 1600, y = HILLS(x, z);
    if (Math.hypot(x, z * 1.2) < 110) continue;
    T.push([x, z, 12 + R() * 8, y]);
  }
  g.add(trees(T.filter((_, k) => k % 3 === 0), { kind: 'fir', seed: 7 }), trees(T.filter((_, k) => k % 3 === 1), { kind: 'teak', seed: 8 }), trees(T.filter((_, k) => k % 3 === 2), { kind: 'jamun', seed: 9 }));
  // Aizawl across the valley: tall houses crowded along the ridges to the north and west.
  const houses = [];
  for (let k = 0; k < (detail.low ? 90 : 420); k++) {
    const a = -Math.PI * 0.15 + R() * Math.PI * 1.1, r = 260 + R() * 420, x = -Math.cos(a) * r, z = -Math.sin(a) * r, y = HILLS(x, z);
    houses.push([x, z, 9 + R() * 6, 9 + R() * 5, 3 + Math.floor(R() * 4), Math.atan2(-x, -z), y - 3]);
  }
  g.add(townHouses(houses, { seed: 5, fine: false, tanks: 0.6, paint: ['#f1e6cf', '#9fc3c9', '#e7b9b0', '#c9d6a3', '#f4f1ea', '#b9a7cf', '#e9d9b8'] }));
}

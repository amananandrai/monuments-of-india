import * as THREE from 'three';
import { M, box, at, hipRoof } from '../helpers.js';
import { mergeByMaterial } from '../parts/components.js';
import { trees, shrubs, lampPosts, stalls, scatter, along, townHouses } from '../parts/realism.js';
import { detail } from '../detail.js';
import { P, LIME, TRIM, TILE } from '../monuments/paradesi-synagogue.js';

// Jew Town, Mattancherry, round the Paradesi Synagogue: Synagogue Lane, narrow and paved, running
// up to the clock tower between rows of two-storey houses, their fronts painted and their roofs
// tiled, most of them now antique and spice shops with stalls before them; a laterite wall round
// the synagogue's yard; the palms and mango trees of the yards behind; and to the west the wall
// of the Mattancherry Palace compound.
export function addDetails(f, g) {
  const { W, D, FZ, TX } = P, lx = 2.5;
  g.add(box(380, 0.06, 380, M.grass, 0, -0.06, 30));
  // The lane, paved in stone, and a cross street at its far end.
  g.add(box(9, 0.05, 130, M.path, lx, 0, FZ + 64), box(220, 0.05, 8, M.asphalt, 0, 0, FZ + 132));
  g.add(box(26, 0.04, 6, M.path, 0, 0, FZ + 2.6));
  // The synagogue's yard: a laterite wall round the back and sides, whitewashed, with a tiled
  // coping, and a gate in the side.
  const wl = new THREE.Group(), x0 = -W / 2 - 9, x1 = W / 2 + 9, z0 = -D / 2 - 8;
  wl.add(box(x1 - x0, 2.6, 0.5, LIME, (x0 + x1) / 2, 0, z0), box(x1 - x0 + 0.3, 0.16, 0.8, TILE, (x0 + x1) / 2, 2.6, z0));
  for (const x of [x0, x1]) wl.add(box(0.5, 2.6, FZ - 1 - z0, LIME, x, 0, (z0 + FZ - 1) / 2), box(0.8, 0.16, FZ - 1 - z0 + 0.3, TILE, x, 2.6, (z0 + FZ - 1) / 2));
  // A small gatehouse on the yard's east wall, under a tiled roof.
  wl.add(box(3, 3, 3, LIME, x1, 0, -2), at(hipRoof(4, 4, 1.4, TILE), x1, 3, -2));
  f.add(mergeByMaterial(wl));
  // The houses along the lane: on each side a row of narrow two-storey fronts, facing it.
  const R = (k) => ((Math.sin(k * 12.9898) * 43758.5453) % 1 + 1) % 1, left = [], right = [];
  for (let z = FZ + 16, k = 0; z < FZ + 126; k++) { const w = 7 + R(k) * 4; left.push([lx - 4.5 - 5.5, z + w / 2, w, 11, 2, Math.PI / 2]); z += w + 0.3; }
  for (let z = FZ + 18, k = 50; z < FZ + 126; k++) { const w = 7 + R(k) * 4; right.push([lx + 4.5 + 5.5, z + w / 2, w, 11, 2, -Math.PI / 2]); z += w + 0.3; }
  g.add(townHouses([...left, ...right], { seed: 4, roof: 'pitched', roofs: ['#8e4630', '#9a4a32', '#7d3e2a'], tanks: 0, paint: ['#f1e6c8', '#c7dbe0', '#e8c9a0', '#f4f1ea', '#d9e6c8', '#e7b9a8'] }));
  // Rows behind them, and the houses either side of the synagogue.
  g.add(townHouses([...Array(7)].map((_, k) => [lx - 24, FZ + 14 + k * 16, 14, 12, 2, -Math.PI / 2]).concat([...Array(7)].map((_, k) => [lx + 26, FZ + 14 + k * 16, 14, 12, 2, Math.PI / 2])), { seed: 8, roof: 'pitched', roofs: ['#8e4630', '#7d3e2a'], tanks: 0 }));
  g.add(townHouses([[x1 + 12, -4, 12, 14, 2, -Math.PI / 2], [x1 + 12, -20, 12, 12, 2, -Math.PI / 2]], { seed: 11, roof: 'pitched', roofs: ['#8e4630'], tanks: 0 }));
  // The Mattancherry Palace compound to the west: its laterite wall.
  g.add(box(0.7, 2.4, 70, TRIM, x0 - 16, 0, -6));
  // Stalls of the antique and spice shops along the lane.
  if (!detail.low) g.add(stalls([...along(6, [lx - 3.2, FZ + 22], [lx - 3.2, FZ + 78])].map(([x, z]) => [x, z, Math.PI / 2]).concat([...along(5, [lx + 3.2, FZ + 26], [lx + 3.2, FZ + 70])].map(([x, z]) => [x, z, -Math.PI / 2]))));
  g.add(lampPosts([...along(5, [lx - 3.9, FZ + 8], [lx - 3.9, FZ + 110])]));
  // Palms and mangoes in the yards; flowering shrubs in the synagogue's yard.
  g.add(trees([[x0 + 3, z0 + 4], [x1 - 3, z0 + 3], [x0 + 3, 4], [-40, -20], [-52, 8], [44, -30], [56, 18], [-36, 70], [48, 90]], { kind: 'palm', seed: 3 }));
  g.add(trees(scatter(18, [-170, 170, -150, 190], { seed: 6, gap: 14, avoid: [[-45, 50, -30, FZ + 140]] }), { kind: 'mango', seed: 6 }));
  g.add(shrubs([[x0 + 2, -6, 1.2], [x0 + 2, -12, 1], [x1 - 2, -14, 1.2], [x1 - 2, 8, 1]], { flowers: '#e05a7a', seed: 2 }));
}

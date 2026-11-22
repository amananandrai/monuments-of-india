import * as THREE from 'three';
import { M, mat, box, at, archPanel } from '../helpers.js';
import { archRing, mergeByMaterial } from '../parts/components.js';
import { trees, shrubs, lampPosts, bollards, along, cityAround, traffic } from '../parts/realism.js';
import { detail } from '../detail.js';

// The mosque's honey-coloured sandstone, and the same stone in shade.
export const STONE = mat('#c9a874', 0.88);
export const SHADE = mat('#a88b5e', 0.9);

// The Sidi Saiyyed Mosque, finer detail and setting. From photographs: the walled-up middle bay of
// the west wall shows a blind arch; moulded rings frame its windows. The mosque stands in a small
// walled garden on a traffic island at Lal Darwaja, the old city's busy roads all round it.
// Dimensions follow js/monuments/sidi-saiyyed-mosque.js: L long, D deep, H high on a plinth P.
function architecture(f, { L, D, P }) {
  const d = new THREE.Group();
  d.add(at(archPanel(2.6, 5.4, true, SHADE, 0.08), 0, P + 2.4, D / 2), at(archRing(2.6, 5.4, true, 0.18, 0.1, SHADE), 0, P + 2.4, D / 2 + 0.02));
  f.add(mergeByMaterial(d));
}

export function addDetails(f, g, dims) {
  architecture(f, dims);
  g.add(box(400, 0.2, 400, M.asphalt, 0, -0.2, 0));
  // The garden: a lawn inside a low wall with railings, paths to the mosque, palms and neem.
  const GW = 46, GD = 40;
  g.add(box(GW, 0.35, GD, M.grass, 0, 0, 0), box(GW + 1, 0.8, 0.5, SHADE, 0, 0, GD / 2), box(GW + 1, 0.8, 0.5, SHADE, 0, 0, -GD / 2));
  for (const s of [-1, 1]) g.add(box(0.5, 0.8, GD, SHADE, s * (GW / 2 + 0.25), 0, 0));
  g.add(box(3, 0.4, GD / 2 - 8, M.path, 0, 0, GD / 4 + 4));
  g.add(trees([[-18, 14], [18, 14], [-18, -14], [18, -14]], { kind: 'palm', seed: 2 }), trees([[-20, 0], [20, 0]], { kind: 'neem', seed: 4 }));
  g.add(shrubs(along(10, [-20, 17], [20, 17]).filter(([x]) => Math.abs(x) > 3), { seed: 3, flowers: '#d63c6a', y: 0.35 }));
  g.add(lampPosts([[-23, 20], [23, 20], [-23, -20], [23, -20]]));
  g.add(bollards(along(14, [-24, 22.5], [24, 22.5])));
  // The roads round the island, and the old city beyond.
  g.add(traffic([[27, 1], [31, -1]], -120, 120, { y: 0.02, gap: 14, seed: 6, taxis: 0.25, buses: 0.12 }));
  g.add(traffic([[-27, -1], [-31, 1]], -120, 120, { y: 0.02, gap: 16, seed: 9, taxis: 0.25, buses: 0.1 }));
  g.add(cityAround([-40, 40, -40, 40], { rows: detail.low ? 1 : 2, every: detail.low ? 2 : 1, gap: 4, seed: 23, fine: !detail.low }));
}

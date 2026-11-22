import * as THREE from 'three';
import { M, mat, box, cyl, at } from '../helpers.js';
import { maniWheels } from '../parts/tibetan.js';
import { mergeByMaterial } from '../parts/components.js';
import { trees, shrubs, lampPosts, prayerFlags, scatter, along } from '../parts/realism.js';
import { detail } from '../detail.js';

// Namdroling, its setting in the Tibetan settlement at Bylakuppe: galleries of prayer wheels along
// the sides of the court, flagpoles with long banners, strings of prayer flags from the temple's
// roof, lamps along the walks, flower beds, and coconut palms, areca and teak in the plantations of
// Coorg all round. Dimensions follow js/monuments/namdroling-monastery.js: the hall HW x HD, HH high,
// its front at z = HD / 2; the court from z = 22 to 72.
export function addDetails(f, g, { HD, HH }) {
  const d = new THREE.Group();
  for (const s of [-1, 1]) d.add(at(maniWheels(36, { h: 2.6 }), s * 42, 0.2, 48).rotateY(-s * Math.PI / 2));
  // Two tall flagpoles before the portico, and a stone incense burner between them.
  for (const s of [-1, 1]) d.add(cyl(0.2, 0.25, 16, mat('#8a6a3a', 0.8), s * 14, 0, 40, 8), box(0.06, 9, 1.4, mat('#e3b23c', 0.9, 0, { side: 2 }), s * 14, 6.2, 40.75));
  d.add(cyl(1.4, 1.8, 1, TIB_STONE, 0, 0.2, 52, 12), cyl(0.9, 1.2, 2.2, TIB_STONE, 0, 1.2, 52, 12), cyl(0.3, 0.9, 1.2, M.gild, 0, 3.4, 52, 12));
  f.add(mergeByMaterial(d));
  for (const [a, b] of [[[-20, HH + 6, 0], [-40, 4, 46]], [[20, HH + 6, 0], [40, 4, 46]], [[0, HH + 9, 0], [-22, 4, 70]], [[0, HH + 9, 0], [22, 4, 70]]]) f.add(prayerFlags(a, b, { sag: 3, size: 0.6 }));
  g.add(box(500, 0.12, 500, mat('#5f8a3e', 0.95), 0, -0.06, 20));
  g.add(box(10, 0.06, 60, M.path, 0, 0.05, 105));
  g.add(lampPosts([...along(6, [-30, 28], [-30, 66]), ...along(6, [30, 28], [30, 66]), ...along(4, [-4, 80], [-4, 130]), ...along(4, [4, 80], [4, 130])], { y: 0.2 }));
  g.add(shrubs([...along(10, [-28, 34], [-28, 64]), ...along(10, [28, 34], [28, 64])].map(([x, z]) => [x, z, 1]), { y: 0.2, seed: 4, flowers: ['#e3402f', '#f2c21a', '#e87aa8'] }));
  const avoid = [[-70, 75, -30, 84], [-8, 8, 76, 140]];
  g.add(trees(scatter(detail.low ? 40 : 90, [-220, 220, -200, 230], { seed: 6, gap: 9, avoid }), { kind: 'palm', seed: 6 }));
  g.add(trees(scatter(30, [-220, 220, -200, 230], { seed: 8, gap: 16, avoid }), { kind: 'teak', seed: 8 }));
}
const TIB_STONE = mat('#b9b2a6', 0.9);

import * as THREE from 'three';
import { M, mat, mesh, box, cyl, at, lathe, flag } from '../helpers.js';
import { mergeByMaterial } from '../parts/components.js';
import { mountainRing } from '../parts/terrain.js';
import { trees, shrubs, lampPosts, along, scatter } from '../parts/realism.js';
import { detail } from '../detail.js';

const DARK = mat('#3d3b38', 0.8), PAVE = mat('#5a5651', 0.85), LINGA = mat('#1d1c1b', 0.4), CLOTH = mat('#c8322b', 0.8);

// The setting of Adiyogi, from photographs: a wide lawn round the bust's dark platform, a paved
// forecourt in front where pilgrims walk round the Yogeshwar linga, which sits under the trident on
// a low black pedestal, its base wound with red cloth; coconut palms and neem along the edges, and
// behind, the forested Velliangiri hills rising steeply, their summits in cloud. Dimensions follow
// js/monuments/adiyogi.js.
export function addDetails(f, g) {
  g.add(box(240, 0.2, 220, M.grass, 0, -0.2, 20));
  g.add(box(46, 0.06, 40, PAVE, 0, 0, 34), box(8, 0.06, 80, PAVE, 0, 0, 92));
  // The Yogeshwar linga before the bust, in its yoni, on a round pedestal.
  const lin = new THREE.Group();
  lin.add(cyl(3.4, 3.6, 0.8, DARK, 0, 0, 0, 32), cyl(2.2, 2.2, 0.5, LINGA, 0, 0.8, 0, 32), box(0.9, 0.3, 1.8, LINGA, 0, 1.0, 2.6));
  lin.add(at(lathe([[0, 0], [0.9, 0], [0.9, 1.4], [0.75, 1.85], [0.4, 2.1], [0, 2.15]], LINGA, 32), 0, 1.3, 0));
  lin.add(mesh(new THREE.TorusGeometry(0.95, 0.12, 8, 28).rotateX(Math.PI / 2), CLOTH, 0, 1.6, 0));
  f.add(at(lin, 0, 0, 30));
  // Low walls of dark stone framing the forecourt, lamps along its sides, a saffron flag.
  const wall = new THREE.Group();
  for (const s of [-1, 1]) wall.add(box(0.8, 0.9, 38, DARK, s * 23, 0, 34));
  g.add(mergeByMaterial(wall), lampPosts([...along(6, [-24.5, 18], [-24.5, 52]), ...along(6, [24.5, 18], [24.5, 52]), ...along(6, [-5, 60], [-5, 130]), ...along(6, [5, 60], [5, 130])]));
  g.add(at(flag(9, M.saffron), 26, 0, 14));
  // Palms and neem round the lawn, shrubs along its edges.
  g.add(trees([...along(9, [-70, -50], [-70, 110]), ...along(9, [70, -50], [70, 110])], { kind: 'palm', seed: 41 }));
  g.add(trees([...scatter(16, [-110, -40, -80, 120], { seed: 42, gap: 10 }), ...scatter(16, [40, 110, -80, 120], { seed: 43, gap: 10 })], { kind: 'neem', seed: 44 }));
  g.add(shrubs([...along(14, [-30, 60], [-30, 120]), ...along(14, [30, 60], [30, 120])], { flowers: '#e8a23a' }));
  // The Velliangiri hills behind, rising steeply from the plain.
  g.add(mountainRing({ inner: 520, outer: 1300, h: 560, vary: 160, size: 4000, cz: 300, aspect: 1.1, cover: '#3f6a34', rock: ['#5d6b4a', '#6a7653'], steep: 0.62 }));
  if (!detail.low) g.add(trees(scatter(60, [-300, 300, -260, -90], { seed: 45, gap: 14 }), { kind: 'teak', seed: 46 }));
}

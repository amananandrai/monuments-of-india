import * as THREE from 'three';
import { M, box, cyl, at, sheet, chhatri } from '../helpers.js';
import { arcadeSkin } from '../parts/mughal.js';
import { mergeByMaterial } from '../parts/components.js';
import { steps } from '../parts/doorways.js';
import { trees, lampPosts, scatter, traffic, cityAround } from '../parts/realism.js';
import { detail } from '../detail.js';
import { GILT, SAFFRON } from './takht-sri-hazur-sahib.js';

// Bangla Sahib in Lutyens' Delhi: the marble forecourt and its gilded Nishan Sahib, the sarovar to
// the west (-x) inside a marble walk with arcaded ranges round it, lawns and trees, Baba Kharak
// Singh Marg in front (+z) and the city beyond. The hall is w × d on its plinth (js/monuments).
export function addDetails(f, g, { w, d }) {
  g.add(box(600, 0.2, 600, M.grass, 0, -0.2, 0), box(77, 0.25, 110, M.marble, -3.5, 0, 0), box(17, 0.25, 110, M.marble, -106.5, 0, 0));
  for (const z of [-38.5, 38.5]) g.add(box(56, 0.25, 33, M.marble, -70, 0, z));
  const NX = -30, NZ = 30;
  // The Nishan Sahib here is cased in gilt, on a tall marble plinth.
  g.add(box(2.4, 2.2, 2.4, M.marble, NX, 0.25, NZ), cyl(0.3, 0.45, 32, GILT, NX, 2.45, NZ, 12));
  const cl = new THREE.Mesh(new THREE.PlaneGeometry(6.5, 3), SAFFRON);
  cl.position.set(NX, 33, NZ + 3.4); cl.rotation.y = Math.PI / 2; g.add(cl, box(0.1, 1, 1, GILT, NX, 34.4, NZ));
  // The sarovar: a pool 56 × 44 m, steps down at the sides, inside a marble walk, two storeys of
  // arches round it on three sides.
  const sx = -70, T = new THREE.Group();
  T.add(sheet(56, 44, M.lake, sx, 0.05, 0));
  for (const s of [-1, 1]) T.add(box(58, 1.2, 1, M.marbleShade, sx, -0.95, s * 22.5), box(1, 1.2, 46, M.marbleShade, sx + s * 28.5, -0.95, 0));
  for (const s of [-1, 1]) T.add(at(steps(16, 0.25, 3, M.marble), sx, 0, s * 22).rotateY(s > 0 ? Math.PI : 0));
  const range = (len, x, z, ry) => {
    const n = Math.floor(len / 4.6), cells = [];
    for (let k = 0; k < n; k++) { const cx = -len / 2 + (k + 0.5) * (len / n); cells.push([cx, 0.4, 2.8, 3.8, 'room'], [cx, 5.2, 2.4, 3, 'jali']); }
    const r = new THREE.Group();
    r.add(box(len, 9, 6, M.marble, 0, 0, -3.6), arcadeSkin(len, 9, cells, 0.6, M.marble, { trim: M.marbleShade }), box(len, 0.5, 1, M.marble, 0, 9, 0));
    for (let k = 0; k < Math.floor(len / 20); k++) r.add(at(chhatri(1, 3.2, M.marble, GILT), -len / 2 + 10 + k * 20, 9.5, -1));
    T.add(at(mergeByMaterial(r), x, 0.25, z).rotateY(ry));
  };
  range(90, sx, -46, 0);
  range(90, sx, 46, Math.PI);
  range(70, sx - 44, 0, Math.PI / 2);
  g.add(T);
  g.add(lampPosts([[-14, 28], [14, 28], [-41, -24], [-41, 24], [-99, -24], [-99, 24], [-70, -26], [-70, 26]], { y: 0.25 }));
  // Lawns with trees round the complex; the road in front; Delhi beyond.
  g.add(trees(scatter(40, [-200, 200, -200, 200], { seed: 5, gap: 14, avoid: [[-122, 34, -60, 60], [-300, 300, 50, 80]] }), { kind: 'neem', seed: 5 }));
  g.add(trees([[30, -10], [30, 10], [-20, 40], [-60, 40]], { kind: 'ashoka', seed: 9, y: 0.25 }));
  g.add(box(600, 0.06, 18, M.asphalt, 0, -0.02, 65));
  g.add(traffic([[59, 1], [62.5, 1], [67.5, -1], [71, -1]], -280, 280, { gap: 18, seed: 4, buses: 0.08 }));
  g.add(cityAround([-180, 180, -150, 150], { rows: detail.low ? 1 : 2, every: detail.low ? 3 : 1, fine: false, gap: 50, storeys: [3, 6], seed: 52 }));
}

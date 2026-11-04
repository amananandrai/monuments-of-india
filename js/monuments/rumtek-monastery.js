import * as THREE from 'three';
import { M, mat, mesh, box, cyl, lathe, at, rng, hipRoof, tibetanBlock, TIBETAN, inst, unitBox } from '../helpers.js';
import { tibetanPortico } from '../details/doorways.js';
import { mergeByMaterial } from '../details/components.js';
import { mountainRing } from '../details/terrain.js';
import { addDetails } from '../details/rumtek-monastery.js';

const YELLOW = mat('#e6b94a', 0.8);
// Gilded copper roofing, bright in the mountain light.
const GILT = mat('#e7b84a', 0.32, 0.55, { emissive: '#3d2a06' });

export function buildRumtek() {
  const g = new THREE.Group(), f = new THREE.Group(), R = rng(59);
  g.add(f);
  // Forested Sikkim hills
  g.add(box(300, 0.2, 300, mat('#58783f', 0.95)));
  // Forested Sikkim ridges (js/details/terrain.js).
  g.add(mountainRing({ inner: 400, outer: 700, h: 170, vary: 60, rock: ['#4a5d3a', '#56693f'], cover: '#4e6e3c', steep: 0.6 }));

  // Courtyard ringed by monks' quarters
  f.add(box(70, 0.4, 70, M.path));
  const q = [];
  for (const s of [-1, 1]) q.push([0, 0, s * 32, 70, 7, 6], [s * 32, 0, 0, 6, 7, 58]);
  f.add(inst(unitBox(), q, YELLOW), inst(unitBox(), q.map(([x, y, z, w, h, d]) => [x, h, z, w + 0.4, 0.8, d + 0.4]), TIBETAN.maroon));
  // The main shrine hall: four storeys under a gilded roof with its golden finial
  f.add(at(tibetanBlock(28, 14, 22, 3), 0, 0, -12), box(18, 5, 14, TIBETAN.white, 0, 14, -14), box(18.4, 0.8, 14.4, TIBETAN.maroon, 0, 18.2, -14));
  // The gilded roof that marks Rumtek from across the valley: a broad lower roof, a clerestory, and
  // an upper roof, crowned by the golden gyaltsen (a bell-shaped victory banner) and a finial.
  f.add(at(hipRoof(23, 19, 3.4, GILT), 0, 19, -14), box(10, 2.6, 8, TIBETAN.white, 0, 22.2, -14), box(10.4, 0.5, 8.4, TIBETAN.maroon, 0, 24.6, -14));
  f.add(at(hipRoof(13, 10.5, 2.8, GILT), 0, 25.1, -14));
  f.add(at(lathe([[0.9, 0], [1.25, 0.25], [1.15, 1.6], [0.8, 2.6], [0.55, 2.9], [0.35, 3.0], [0.4, 3.3], [0.15, 3.7], [0.05, 4.4], [0, 4.6]], GILT, 20), 0, 27.6, -14));
  for (const x of [-12, 12]) f.add(cyl(0.6, 0.9, 3, GILT, x, 14, -1, 8));
  // The pillared portico before the hall's door, under its gilded roof
  f.add(mergeByMaterial(at(tibetanPortico(12, 6, 6, [1.8, 3.4]), 0, 0, -1)), at(hipRoof(14, 8, 2.4, GILT), 0, 6.85, 2));
  addDetails(f, g);
  return { group: g, focus: f, view: [0.6, 0.4, 1.25] };
}

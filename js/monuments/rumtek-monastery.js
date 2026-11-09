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
  f.add(box(69.8, 0.4, 69.8, M.path));
  const q = [];
  for (const s of [-1, 1]) q.push([0, 0, s * 32, 70, 7, 6], [s * 32, 0, 0, 6, 7, 58]);
  f.add(inst(unitBox(), q, YELLOW), inst(unitBox(), q.map(([x, y, z, w, h, d]) => [x, h, z, w + 0.4, 0.8, d + 0.4]), TIBETAN.maroon));
  // The quarters are two storeys of monks' cells: on both faces a row of dark-framed windows on
  // each floor, a door every few cells on the court side, and a maroon band under the eave. Each
  // face is [centre x, z, length, facing].
  const wins = [], frames = [], doors = [], bands = [];
  for (const s of [-1, 1]) for (const [cx, cz, len, ry] of [[0, s * 32, 70, s > 0 ? Math.PI : 0], [s * 32, 0, 58, s > 0 ? -Math.PI / 2 : Math.PI / 2]]) {
    for (const side of [1, -1]) {
      const a = ry + (side > 0 ? 0 : Math.PI), ox = Math.sin(a) * 3.03, oz = Math.cos(a) * 3.03, tx = Math.cos(a), tz = -Math.sin(a);
      const n = Math.floor(len / 3.2);
      for (let k = 0; k < n; k++) {
        const t = -len / 2 + (k + 0.5) * (len / n), x = cx + ox + tx * t, z = cz + oz + tz * t;
        for (const y of side > 0 && k % 4 === 2 ? [4.2] : [1.4, 4.2]) { wins.push([x, y, z, 0.9, 1.3, 0.06, a]); frames.push([x - Math.sin(a) * 0.01, y - 0.18, z - Math.cos(a) * 0.01, 1.3, 1.66, 0.04, a]); }
        if (side > 0 && k % 4 === 2) doors.push([x, 0, z, 1.2, 2.4, 0.08, a]);
      }
      bands.push([cx + ox * 1.01, 6.2, cz + oz * 1.01, len, 0.5, 0.06, a]);
    }
  }
  f.add(inst(unitBox(), frames, mat('#2a2220', 0.8)), inst(unitBox(), wins, M.recess), inst(unitBox(), doors, mat('#9a2b22', 0.7)), inst(unitBox(), bands, TIBETAN.maroon));
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

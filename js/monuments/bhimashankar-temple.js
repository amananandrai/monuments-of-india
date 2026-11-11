import * as THREE from 'three';
import { M, mat, mesh, box, cyl, at, rng, lathe, doubleSided, photo } from '../helpers.js';
import { nagaraTemple } from '../details/temples.js';
import { trees as plantTrees } from '../details/realism.js';
import { mountainRing } from '../details/terrain.js';
import { addDetails } from '../details/bhimashankar-temple.js';

const BASALT = photo(mat('#4f4a45', 0.85), 'blocks');
const SHADE = mat('#3b3734', 0.9);

export function buildBhimashankar() {
  const g = new THREE.Group(), f = new THREE.Group(), R = rng(43);
  g.add(f);
  // A forested valley in the Sahyadri hills
  g.add(box(260, 0.2, 260, mat('#5a7242', 0.95)));
  // The forested crests of the Sahyadri (js/details/terrain.js).
  g.add(mountainRing({ inner: 300, outer: 560, h: 95, vary: 30, rock: ['#4f5a3a', '#5d6644'], cover: '#3f5e34', steep: 0.6 }));

  const trees = [];
  // The temple lies in a hollow of the forest, the trees crowding down close round its court.
  for (let i = 0; i < 170; i++) {
    const a = R() * Math.PI * 2, d = 32 + Math.pow(R(), 0.8) * 130;
    trees.push([Math.cos(a) * d, Math.sin(a) * d, 11 + R() * 7]);
  }
  g.add(plantTrees(trees.slice(0, 110), { kind: 'mango', seed: 15 }), plantTrees(trees.slice(110), { kind: 'neem', seed: 16 }));
  // The dark basalt temple, and the great bell hung in its own frame
  f.add(box(40, 0.4, 44, M.path), at(nagaraTemple({ w: 8, h: 13, m: BASALT, shade: SHADE, plinth: 1.5, urus: 4, halls: [[11, 6, 4]] }), 0, 0, -8));
  // The great bell (cast in 1729) in its frame of dark stone: two square piers on moulded bases, a
  // carved beam across them and a small stepped cap, the bell hung from an iron yoke beneath.
  for (const x of [-12.6, -7.4]) f.add(box(1.1, 0.5, 1.1, SHADE, x, 0.4, 8), box(0.8, 6, 0.8, BASALT, x, 0.9, 8), box(1.1, 0.4, 1.1, SHADE, x, 6.9, 8));
  f.add(box(6.4, 0.7, 1.0, SHADE, -10, 7.3, 8), box(5.6, 0.5, 0.8, BASALT, -10, 8.0, 8), box(3.4, 0.4, 0.6, SHADE, -10, 8.5, 8));
  f.add(cyl(0.08, 0.08, 1.0, M.steel, -10, 6.3, 8, 8), at(lathe([[1.3, 0], [1.22, 0.14], [0.98, 0.32], [0.8, 0.7], [0.74, 1.15], [0.6, 1.5], [0, 1.6]], doubleSided(M.bronze), 32), -10, 4.75, 8));
  addDetails(f, g);
  return { group: g, focus: f, view: [0.85, 0.36, 1.15] };
}

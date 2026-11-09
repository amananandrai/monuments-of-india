import * as THREE from 'three';
import { M, mat, box, at, rng } from '../helpers.js';
import { gopuram, wallWithGaps, dravidaVimana, dwajasthambha } from '../details/temples.js';
import { mountainRing } from '../details/terrain.js';
import { townHouses } from '../details/realism.js';
import { addDetails } from '../details/tirumala-temple.js';

const WHITE = ['#f2ede2', '#e9e1cf', '#f6f2ea', '#dcd3c0'];
const LIME = mat('#efe9dd', 0.85);

export function buildTirumala() {
  const g = new THREE.Group(), f = new THREE.Group(), R = rng(29);
  g.add(f);
  // The seven hills of the Seshachalam, rocky and wooded (js/details/terrain.js).
  g.add(mountainRing({ inner: 440, outer: 760, h: 130, vary: 45, rock: ['#8a7b66', '#766a58'], cover: '#5b7445', steep: 0.72 }));

  g.add(box(220, 0.2, 220, M.path));
  const town = [];
  for (let i = 0; i < 30; i++) {
    const a = R() * Math.PI * 2, d = 80 + R() * 25;
    town.push([Math.cos(a) * d, Math.sin(a) * d, 8 + R() * 8, 7 + R() * 5, 1 + Math.floor(R() * 3), Math.PI / 2 - a + Math.PI]);
  }
  // The temple town: pilgrim lodges and shops, whitewashed and pastel, facing the temple.
  g.add(townHouses(town, { seed: 47, paint: ['#f1ece0', '#e8dcc0', '#f3e3c8', '#dfe8e2', '#f1ece0', '#efd9c9'] }));
  // Swami Pushkarini tank beside the temple
  g.add(box(36, 1, 30, M.granite, -62, 0, -4), box(30, 1.1, 24, M.water, -62, 0, -4));
  // Walled complex with the white Mahadwara gopuram at the entrance
  for (const s of [-1, 1]) f.add(wallWithGaps('x', 80, 8, 2.5, LIME, s > 0 ? [[0, 21]] : [], 0, s * 52), box(2.5, 8, 104, LIME, s * 40, 0, 0));
  f.add(at(gopuram(22, 12, 30, 7, 2, WHITE), 0, 0, 52), at(gopuram(14, 9, 18, 5, 4, WHITE), 0, 0, 22));
  for (const s of [-1, 1]) f.add(wallWithGaps('x', 52, 6, 2, LIME, s > 0 ? [[0, 13]] : [], 0, s * 22), box(2, 6, 44, LIME, s * 26, 0, 0));
  // Ananda Nilayam: the sanctum at ground level under its gold vimana of three storeys, the
  // ledges set with gilt kutas and shalas, a round cap and a tall kalash.
  f.add(box(12, 7, 12, M.gild, 0, 0, 0), box(12.8, 0.6, 12.8, M.gildDeep, 0, 7, 0));
  f.add(at(dravidaVimana(11, 3, 3.3, M.gild, M.gildDeep, { cap: 'round', capScale: 0.3, kalashM: M.gild, kalashScale: 0.85, taper: 0.4 }), 0, 7.6, 0));
  f.add(dwajasthambha(0, 14, 19));
  addDetails(f, g);
  return { group: g, focus: f, view: [0.7, 0.42, 1.2] };
}

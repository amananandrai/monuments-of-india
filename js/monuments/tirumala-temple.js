import * as THREE from 'three';
import { M, mat, box, at, rng } from '../helpers.js';
import { gopuram, wallWithGaps, dravidaVimana, dwajasthambha } from '../details/temples.js';
import { mountainRing } from '../details/terrain.js';
import { townHouses, houseRow } from '../details/realism.js';
import { addDetails } from '../details/tirumala-temple.js';

const WHITE = ['#f2ede2', '#e9e1cf', '#f6f2ea', '#dcd3c0'];
const LIME = mat('#efe9dd', 0.85);

export function buildTirumala() {
  const g = new THREE.Group(), f = new THREE.Group(), R = rng(29);
  g.add(f);
  // The seven hills of the Seshachalam, rocky and wooded (js/details/terrain.js).
  g.add(mountainRing({ inner: 440, outer: 760, h: 130, vary: 45, rock: ['#8a7b66', '#766a58'], cover: '#5b7445', steep: 0.72 }));

  g.add(box(220, 0.2, 220, M.path));
  // The temple town (js/details/realism.js): round the temple's outer wall, beyond the broad Mada
  // streets, rows of pilgrim lodges and shops face it on every side, with more rows behind along
  // lanes. To the south they line the approach either side of the stalls, and the large choultries
  // (rest houses for pilgrims, four and five storeys) stand at the corners. The rows stop short of
  // the Swami Pushkarini on the west.
  const town = [], big = [], E = Math.PI / 2, S = Math.PI;
  const tank = (c) => c > -24 && c < 16;
  town.push(...houseRow(R, 'x', -74, -66, 66, 0), ...houseRow(R, 'x', -89, -104, 104, S), ...houseRow(R, 'x', -103, -104, 104, 0, { d: [8, 10] }));
  for (const s of [-1, 1]) {
    town.push(...houseRow(R, 'z', s * 76, -66, 56, -s * E, { skip: s < 0 ? tank : null }), ...houseRow(R, 'z', s * 91, -80, 104, s * E), ...houseRow(R, 'z', s * 104, -80, 104, -s * E, { d: [7, 9] }));
    // The approach: two rows a side behind the stalls, facing the street, and one behind them.
    town.push(...houseRow(R, 'z', s * 25, 60, 106, -s * E, { d: [10, 12] }), ...houseRow(R, 'z', s * 40, 60, 106, s * E, { d: [10, 12] }));
    big.push([s * 62, 66, 22, 14, 5, -s * E], [s * 62, 92, 22, 14, 4, -s * E]);
  }
  g.add(townHouses(town, { seed: 47, paint: ['#f1ece0', '#e8dcc0', '#f3e3c8', '#dfe8e2', '#f1ece0', '#efd9c9'] }));
  g.add(townHouses(big, { seed: 48, paint: ['#f4efe4', '#efe4cc'] }));
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

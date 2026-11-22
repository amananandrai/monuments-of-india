import * as THREE from 'three';
import { mat, box, at, inst, unitBox, photo } from '../helpers.js';
import { addDetails } from '../details/kohima-war-cemetery.js';

// Kohima War Cemetery, Garrison Hill, from photographs and the Commonwealth War Graves
// Commission's account. The cemetery climbs the north-east face of the hill in terraces, each held
// by a grey stone retaining wall a few metres high, with a broad stair up the middle. The 1,420
// graves stand in rows on the lawns, each a low stone pedestal carrying a bronze plaque on its
// sloping top. At the foot of the hill stands the memorial of the 2nd Division, a great rough-hewn
// monolith on a plinth, with the Kohima Epitaph; at the top, the Deputy Commissioner's tennis
// court, its lines set in white concrete, where the fighting turned, and over it the Cross of
// Sacrifice on a shelter; higher still the memorial to the Hindu and Sikh soldiers who were
// cremated. Downhill is +z, so the home view looks up the terraces.
export const STONE = photo(mat('#8d8a82', 0.9), 'blocks'), STONE_LIGHT = mat('#bdb8ac', 0.85), BRONZE = mat('#6e5532', 0.45, 0.6);
export const TERRACES = 9, RISE = 2.6, DEPTH = 13, HALF = 58;

// The ground's height at z on the terraced slope (the lowest terrace at z = 0, the court at the
// top): used by the details to stand the graves and trees on it.
export const terraceY = (z) => { const k = Math.min(TERRACES, Math.max(0, Math.floor(-z / DEPTH + 0.5))); return k * RISE; };

export function buildKohimaWarCemetery() {
  const g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  // The terraces: lawns falling to the north-east, each a level shelf DEPTH deep held by a wall,
  // cut by the central stair; the width narrows a little up the hill.
  const lawns = [], walls = [];
  for (let k = 0; k <= TERRACES; k++) {
    const z = -k * DEPTH, w = 2 * HALF - k * 3, y = k * RISE;
    lawns.push([0, 0, z, w, y + 0.06, DEPTH, 0]);
    // The retaining wall at the front edge of the terrace, with a coping, split by the stair.
    if (k > 0) for (const s of [-1, 1]) walls.push([s * (w / 4 + 2.65), y - RISE, z + DEPTH / 2, w / 2 - 4.7, RISE + 0.35, 0.8, 0]);
  }
  f.add(inst(unitBox(), lawns, mat('#5f8a43', 0.95)), inst(unitBox(), walls, STONE));
  // The central stair, a flight between each pair of terraces, with stone cheeks.
  const steps = [], cheeks = [];
  for (let k = 1; k <= TERRACES; k++) {
    // edge: the front of terrace k, where the stair arrives; the flight stands on terrace k - 1.
    const y0 = (k - 1) * RISE + 0.06, edge = -k * DEPTH + DEPTH / 2;
    for (let s = 0; s < 8; s++) steps.push([0, y0, edge + 2.88 - (s + 0.5) * 0.36, 9.6, (s + 1) * (RISE / 8) - 0.01, 0.36, 0]);
    for (const x of [-5.1, 5.1]) cheeks.push([x, y0 - 0.06, edge + 1.45, 0.6, RISE + 0.5, 2.9, 0]);
  }
  f.add(inst(unitBox(), steps, STONE_LIGHT), inst(unitBox(), cheeks, STONE));
  // The tennis court at the top of the slope, its surface and white lines (in concrete).
  const top = TERRACES * RISE, cz = -TERRACES * DEPTH - 6;
  f.add(box(34, 0.4, 20, mat('#6c8f4a', 0.95), 0, top, cz), box(23.8, 0.04, 11, mat('#77984f', 0.9), 0, top + 0.4, cz));
  const L = [];
  for (const z of [-5.48, 5.48, -4.11, 4.11]) L.push([0, top + 0.44, cz + z, 23.77, 0.02, 0.08, 0]);
  for (const x of [-11.88, 11.88, -6.4, 6.4]) L.push([x, top + 0.44, cz, 0.08, 0.02, x === -11.88 || x === 11.88 ? 11 : 8.23, 0]);
  L.push([0, top + 0.44, cz, 12.8, 0.02, 0.08, Math.PI / 2]);
  f.add(inst(unitBox(), L, mat('#f2f2ee', 0.6)));
  // The Cross of Sacrifice: a tall stone cross with a bronze sword on its face, on an octagonal
  // stepped base, standing on the roof of an open shelter at the head of the court.
  const sz = cz - 16;
  f.add(box(30, top + 4, 12, STONE, 0, 0, sz), box(16, 4.2, 6, STONE_LIGHT, 0, top + 4, sz), box(17, 0.4, 7, STONE, 0, top + 8.2, sz));
  const C = top + 8.6;
  f.add(box(4, 0.5, 4, STONE_LIGHT, 0, C, sz), box(3, 0.5, 3, STONE_LIGHT, 0, C + 0.5, sz), box(1.8, 0.7, 1.8, STONE_LIGHT, 0, C + 1, sz));
  f.add(box(0.55, 7.2, 0.45, STONE_LIGHT, 0, C + 1.7, sz), box(2.6, 0.5, 0.45, STONE_LIGHT, 0, C + 6.1, sz), box(0.16, 3.4, 0.06, BRONZE, 0, C + 4.3, sz + 0.25), box(0.9, 0.16, 0.06, BRONZE, 0, C + 6.95, sz + 0.25));
  addDetails(f, g, { top, cz, sz, C });
  // From below the 2nd Division memorial, looking up the terraces.
  return { group: g, focus: f, view: [0.45, 0.3, 1], zoom: 0.55 };
}

import * as THREE from 'three';
import { M, mat, mesh, box, cyl, at, group, rng, inst, unitBox, hipRoof, onFace } from '../helpers.js';
import { tibetanPortico, steps } from '../details/doorways.js';
import { mergeByMaterial } from '../details/components.js';
import { mountainRing, heightField, rough, smooth } from '../details/terrain.js';
import { addDetails } from '../details/tawang-monastery.js';

const WHITE = mat('#efece4', 0.85);
const MAROON = mat('#6b2a22', 0.85);
const WINDOW = mat('#2a2220', 0.8);
const RIDGE = mat('#6f7a55', 0.95, 0, { flatShading: true });

// A Tibetan block: whitewashed walls, tapering dark windows and a maroon parapet band.
// doorX: where a door stands, so the two lowest rows of windows leave room for it.
function tibetan(w, h, d, floors, doorX = null) {
  const g = new THREE.Group();
  g.add(box(w, h, d, WHITE), box(w + 0.3, h * 0.12, d + 0.3, MAROON, 0, h * 0.88));
  const n = Math.max(1, Math.floor(w / 3.4));
  for (let fl = 0; fl < floors; fl++) for (let k = 0; k < n; k++) {
    const x = -w / 2 + (k + 0.5) * (w / n), y = 1 + fl * ((h * 0.85) / floors);
    if (doorX !== null && fl < 2 && Math.abs(x - doorX) < 3) continue;
    g.add(onFace(box(1.2, 1.6, 0.2, WINDOW, 0, y), 0, d / 2, x));
  }
  return g;
}

const CW = 160, CD = 70;
// The spur: a crest line flat across the compound, falling 0.3 m per metre towards the valley (+x)
// and climbing towards the mountain (-x); across it, a flat top 40 m wide then slopes of about 45°
// down to the valley floor, level with the land round the site.
// Under the compound the ground sinks out of sight beneath the paving.
export function spurY(x, z) {
  if (Math.abs(x) < CW / 2 - 0.5 && Math.abs(z) < CD / 2 - 0.5) return 23;
  const crest = 23.6 - 0.3 * Math.max(0, x - CW / 2 - 6) + 0.38 * Math.max(0, -CW / 2 - 6 - x);
  const side = Math.max(0, Math.abs(z) - 40 - 8 * Math.sin(x * 0.02));
  return Math.max(-1.5, crest - side * (0.95 + 0.2 * Math.sin(x * 0.05)) + rough(x, z, 1.6, 0.5) * smooth(0, 10, side + Math.max(0, x - CW / 2)));
}
// Where a building w × d at (x, z) must stand so that none of its footprint floats: the ground at
// its lowest corner, less a little so it sits into the slope.
function spurBase(x, z, w, d) {
  return Math.min(...[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([a, b]) => spurY(x + a * w / 2, z + b * d / 2))) - 0.4;
}

export function buildTawang() {
  const g = new THREE.Group(), f = new THREE.Group(), R = rng(5);
  g.add(f);
  // The spur it stands on: a ridge running down from the mountain (-x) towards the valley (+x),
  // flattened on top for the monastery, its sides falling steeply away. Snow peaks beyond.
  g.add(heightField(900, 700, 180, spurY, { rock: ['#6f7a55', '#66704f', '#757e5c'], cover: '#6f7a55', steep: 0.7, band: 8 }));
  // Himalayan ridges round the valley, rock to snow (js/details/terrain.js).
  g.add(mountainRing({ inner: 470, outer: 820, h: 230, vary: 70, snow: 190, rock: ['#7e8084', '#8a8c8f', '#74767a'], cover: '#5f7349', steep: 0.82 }));

  const T = 24;
  // The compound runs along the ridge top, about 160 × 70 m, entered from the downhill end.
  f.add(box(CW, 0.6, CD, M.path, 0, T - 0.6, 0));
  for (const s of [-1, 1]) f.add(box(CW, 3, 1.5, WHITE, 0, T, s * CD / 2), box(1.5, 3, CD, WHITE, -CW / 2, T, 0));
  for (const s of [-1, 1]) f.add(box(1.5, 3, CD / 2 - 5, WHITE, CW / 2, T, s * (CD / 4 + 2.5)));
  // The three-storey Dukhang (assembly hall) with its gilded roof
  f.add(at(tibetan(30, 15, 24, 3, 0), 0, T, -16));
  f.add(box(16, 5, 12, WHITE, 0, T + 15, -18), box(16.4, 0.8, 12.4, MAROON, 0, T + 19.2, -18));
  f.add(at(hipRoof(19, 15, 5, M.gild), 0, T + 20, -18), cyl(0.3, 0.7, 2.4, M.gild, 0, T + 25, -18, 8));
  for (const x of [-13, 13]) f.add(cyl(0.6, 0.9, 3, M.gild, x, T + 15, -5, 8));
  // The landing before the hall, steps up to it, and the pillared portico over its door
  f.add(box(18, 2, 7, WHITE, 0, T, -0.5), box(18.4, 0.6, 7.4, MAROON, 0, T + 2, -0.5));
  f.add(mergeByMaterial(group(at(tibetanPortico(7, 3.2, 4.6, [2.2, 3.4]), 0, T + 2.6, -4), at(steps(5, 2.6, 6, WHITE), 0, T, 3.2))));
  // Monks' quarters in rows along the compound's long sides, then stepping down the spur outside it
  // on the downhill end and down the slope below the north wall, each standing on the ground.
  const blocks = [];
  for (let x = -CW / 2 + 8; x < CW / 2 - 6; x += 10 + R() * 3) for (const s of [-1, 1]) {
    if (s < 0 && Math.abs(x) < 20) continue;
    blocks.push([x, T, s * (CD / 2 - 5), 7 + R() * 3, 5 + R() * 4, 7 + R() * 2, 0]);
  }
  for (let x = CW / 2 + 12; x < CW / 2 + 70; x += 11 + R() * 3) for (const z of [-17, 17]) {
    const sx = 7 + R() * 3, sz = 6 + R() * 2;
    blocks.push([x, spurBase(x, z, sx, sz), z, sx, 5 + R() * 3, sz, 0]);
  }
  for (let x = -CW / 2 + 10; x < CW / 2; x += 12 + R() * 4) for (const z of [-CD / 2 - 10, -CD / 2 - 21]) {
    const sx = 8 + R() * 3, sz = 6;
    blocks.push([x, spurBase(x, z, sx, sz), z, sx, 5 + R() * 3, sz, 0]);
  }
  // The Kakaling: the gate house on the spur below the compound, the way in.
  const kx = CW / 2 + 85;
  f.add(at(tibetan(10, 7, 9, 2, 0), kx, spurBase(kx, 0, 10, 9), 0).rotateY(Math.PI / 2), box(0.2, 4, 3.4, WINDOW, kx + 5.01, spurBase(kx, 0, 10, 9), 0));
  f.add(inst(unitBox(), blocks, WHITE));
  f.add(inst(unitBox(), blocks.map(([x, y, z, sx, sy, sz, ry]) => [x, y + sy, z, sx + 0.2, 0.7, sz + 0.2, ry]), MAROON));
  // Prayer-flag lines strung from the courtyard poles
  for (const x of [-20, 20]) {
    f.add(cyl(0.12, 0.12, 10, WINDOW, x, T, 20, 6));
    for (let k = 0; k < 8; k++) f.add(box(0.8, 0.6, 0.05, [M.flagRed, M.saffron, M.flagGreen, M.navy, M.flagWhite][k % 5], x - Math.sign(x) * (1 + k * 1.6), T + 9.4 - k * 0.6, 20));
  }
  addDetails(f, g);
  return { group: g, focus: f, view: [0.6, 0.38, 1.25], fog: 10 };
}

import * as THREE from 'three';
import { M, mat, box, at, sheet, inst, unitBox, rng } from '../helpers.js';
import { mergeByMaterial, templeNiche, idol } from '../parts/components.js';
import { trees, shrubs, scatter, asiBoard, townHouses } from '../parts/realism.js';
import { heightField, fbm, ridged, smooth } from '../parts/terrain.js';
import { detail } from '../detail.js';
import { ROCK, ROCK_DARK, SHRINES } from '../monuments/masrur-temples.js';

// Masrur, finer detail and setting. Images in niches on the walls of the shrines that face the
// tank; the rubble of fallen spires on the terrace and at the foot of the front; the tank before
// the temples, its sides cut in steps; the ridge rising behind; fields, mango and pine round the
// village; and the snows of the Dhauladhar across the valley to the north-east.
// Dimensions follow js/monuments/masrur-temples.js: the terrace T high, its front at z = 7.

// The land: the ridge behind (west, -z) rising to some 60 m, gentle fields in front, and the
// Dhauladhar range, snow-capped, far off to the north.
function landY(x, z) {
  const ridge = smooth(-18, -120, z) * (45 + 25 * ridged(x, z, { scale: 0.006, octaves: 3 }));
  const range = smooth(-900, -1500, x - 0.3 * z) * (700 + 260 * ridged(x, z, { scale: 0.0018, octaves: 4 }));
  // The tank, cut down into the ground before the temples.
  if (Math.abs(x) < 27 && Math.abs(z - 28) < 14) return -2.6;
  return ridge + range + 2.5 * fbm(x, z, { scale: 0.01, octaves: 3 }) * smooth(30, 80, Math.abs(z - 20) + Math.abs(x) * 0.5) - 0.3;
}

export function addDetails(f, g, { T }) {
  const d = new THREE.Group();
  // Images on the front faces of the shrines nearest the tank.
  for (const [x, z, w] of SHRINES.slice(0, 5)) d.add(at(templeNiche(w * 0.2, w * 0.3, ROCK, { figure: idol(w * 0.25, ROCK_DARK) }), x, T + 0.1, z + w / 2 + 0.26));
  // Rubble of fallen spires: on the terrace and heaped at the foot of the front.
  const R = rng(8), rub = [];
  for (let k = 0; k < (detail.low ? 40 : 90); k++) {
    const onTop = k % 3 === 0, x = (R() - 0.5) * (onTop ? 30 : 56), z = onTop ? -6 + (R() - 0.5) * 20 : 8 + R() * 5, s = 0.4 + R() * 1.1;
    if (!onTop && Math.abs(x) < 9 && z < 14) continue;
    rub.push([x, onTop ? T : 0, z, s * 1.3, s * 0.7, s, R() * 3]);
  }
  d.add(inst(unitBox(), rub, ROCK_DARK));
  f.add(mergeByMaterial(d));
  // The ground and the ridge.
  g.add(heightField(3600, 3600, detail.low ? 110 : 170, landY, { rock: ['#8c7d64', '#7a6f5e', '#9a8a70'], cover: '#5f7a3f', steep: 0.72, band: 30, snow: 520 }));
  // The tank: 50 m by 26, its water a metre and a half down, stepped stone sides, a causeway to
  // the porch.
  const tz = 28, tw = 52, td = 26, tank = new THREE.Group();
  for (let k = 0; k < 4; k++) {
    const i = k * 0.7, y = -k * 0.4;
    tank.add(box(tw - 2 * i, 0.4, 0.7, ROCK, 0, y - 0.4, tz - td / 2 + i + 0.35), box(tw - 2 * i, 0.4, 0.7, ROCK, 0, y - 0.4, tz + td / 2 - i - 0.35));
    for (const s of [-1, 1]) tank.add(box(0.7, 0.4, td - 2 * i, ROCK, s * (tw / 2 - i - 0.35), y - 0.4, tz));
  }
  tank.add(box(tw + 4, 0.25, 3, ROCK, 0, -0.2, tz - td / 2 - 1.5), box(tw + 4, 0.25, 3, ROCK, 0, -0.2, tz + td / 2 + 1.5));
  for (const s of [-1, 1]) tank.add(box(2, 0.25, td + 6, ROCK, s * (tw / 2 + 1), -0.2, tz));
  g.add(mergeByMaterial(tank), box(tw - 5, 0.4, td - 5, M.bank, 0, -2.4, tz), sheet(tw - 4.4, td - 4.4, M.lake, 0, -1.55, tz));
  // A path from the tank to the porch, and round the terrace.
  g.add(box(4, 0.06, 6, M.path, 0, -0.03, 15), box(62, 0.06, 3, M.path, 0, -0.03, 13.5));
  g.add(asiBoard('Rock-cut Temples, Masrur', 22, 12, -0.4));
  // The village: slate-roofed houses on the slopes to either side.
  g.add(townHouses([[-60, 30, 8, 9, 2], [-74, 44, 9, 8, 2], [-58, 58, 8, 9, 1], [64, 34, 9, 8, 2], [78, 50, 8, 8, 2], [60, 64, 9, 9, 1], [-88, 18, 8, 8, 2]], { seed: 6, roof: 'pitched', roofs: ['#5f6266', '#6c6f73'], paint: ['#e9e3d6', '#d8cdb8', '#efe7d6'], tanks: 0 }));
  // Fields below the tank.
  for (const [x, z, w, dd, c] of [[-40, 80, 60, 40, '#8aa34e'], [30, 85, 50, 45, '#a3ac55'], [-5, 130, 90, 40, '#7d9a4a']]) g.add(sheet(w, dd, mat(c, 0.95), x, 0.02, z));
  // Mango and peepal in the village, pines up the ridge.
  const keep = [[-48, 48, -30, 52], [-90, 90, 60, 160]];
  g.add(trees(scatter(detail.low ? 14 : 24, [-130, 130, -10, 110], { seed: 3, gap: 14, avoid: keep }), { kind: 'mango', seed: 3 }));
  g.add(trees([[-54, 0], [56, 4], [-58, 54], [60, 56]], { kind: 'peepal', seed: 5 }));
  const pines = scatter(detail.low ? 70 : 150, [-300, 300, -320, -30], { seed: 9, gap: 12, avoid: [[-34, 34, -30, 10]] }).map(([x, z]) => [x, z, 14 + 8 * fbm(x, z, { scale: 0.05, octaves: 2 }), landY(x, z)]);
  g.add(trees(pines, { kind: 'fir', seed: 9 }));
  g.add(shrubs(scatter(40, [-110, 110, -30, 70], { seed: 4, gap: 6, avoid: keep }).map(([x, z]) => [x, z, 1.1]), { seed: 4 }));
}

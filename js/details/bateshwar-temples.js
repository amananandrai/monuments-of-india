import * as THREE from 'three';
import { M, mat, box, sheet, inst, unitBox, photo } from '../helpers.js';
import { mergeByMaterial } from '../parts/components.js';
import { trees, shrubs, scatter, asiBoard } from '../parts/realism.js';
import { heightField, fbm, ridged, smooth } from '../parts/terrain.js';
import { detail } from '../detail.js';
import { NEW, OLD, ROWS } from '../monuments/bateshwar-temples.js';

// Bateshwar, the setting: the terraces the rows of shrines stand on, held by walls of rough
// stone; stacks of loose, numbered stones on the terraces and beside them, still to be set up;
// the stepped tank at the foot of the slope; and the scrub-covered ravines of the Chambal round
// about, with babul and dhok. Terraces follow ROWS in js/monuments/bateshwar-temples.js.
const WALL = photo(mat('#8a7a63', 0.95), 'rubble');
const EARTH = mat('#a89270', 0.95);

// Ravines and low hills round the site, cut down to level ground for it and its tank.
function landY(x, z) {
  if (Math.abs(x) < 16 && Math.abs(z - 40) < 12) return -3;
  const away = Math.max(Math.abs(x) - 80, z < 0 ? -z - 60 : z - 70);
  return smooth(0, 90, away) * (14 + 22 * ridged(x, z, { scale: 0.008, octaves: 4 })) + (z < -60 ? smooth(-60, -140, z) * 16 : 0) + 1.2 * fbm(x, z, { scale: 0.02, octaves: 3 }) - 0.3;
}

export function addDetails(f, g, { R }) {
  const t = new THREE.Group();
  // The terraces, each a platform of earth faced in front with a stone wall.
  ROWS.forEach(([z0, y], r) => {
    if (!r) return;
    t.add(box(140, y - 0.05, 14, EARTH, 0, 0, z0 - 3), box(140, y + 0.05, 0.8, WALL, 0, 0, z0 + 4.2));
  });
  const [zl, yl] = ROWS[ROWS.length - 1];
  t.add(box(140, yl, 40, EARTH, 0, 0, zl - 30));
  // Stairs up the middle of the terraces.
  ROWS.forEach(([z0, y], r) => {
    if (!r) return;
    for (let k = 0; k < 11; k++) t.add(box(3, (k + 1) * 0.2, 0.36, WALL, -10, y - 2.2, z0 + 8.2 - k * 0.36));
  });
  g.add(mergeByMaterial(t));
  // Loose stones: stacked in rows on the terraces and heaped in the gaps, waiting to be set up.
  const stones = [], n = detail.low ? 110 : 260;
  for (let k = 0; k < n; k++) {
    const row = ROWS[Math.floor(R() * ROWS.length)], s = 0.4 + R() * 0.7;
    const x = (R() - 0.5) * 128, z = row[0] - 0.4 - R() * 1.6;
    if (row === ROWS[0] && Math.abs(x) < 16) continue;
    stones.push([x, row[1], z, s * 1.4, s * 0.5, s * 0.8, R() * 0.4]);
  }
  for (let k = 0; k < (detail.low ? 50 : 120); k++) { const x = 70 + R() * 18, z = -40 + R() * 60, s = 0.4 + R() * 0.6; stones.push([x, 0, z, s * 1.4, s * 0.5, s * 0.8, R() * 3]); }
  g.add(inst(unitBox(), stones, OLD));
  // The ground and the ravines.
  g.add(heightField(1500, 1500, detail.low ? 100 : 150, landY, { rock: ['#9b7f62', '#8d735a', '#a88d6e'], cover: '#8b8a52', steep: 0.74, band: 10 }));
  g.add(box(150, 0.12, 26, EARTH, 0, -0.1, 14), box(56, 0.12, 30, M.grass, -50, -0.1, 42), box(56, 0.12, 30, M.grass, 50, -0.1, 42));
  // The tank at the foot: 30 m by 22, its sides stepped, its water low and green.
  const tz = 40, tw = 30, td = 22, tank = new THREE.Group();
  for (let k = 0; k < 6; k++) {
    const i = k * 0.55, y = -k * 0.35;
    tank.add(box(tw - 2 * i, 0.35, 0.55, OLD, 0, y - 0.35, tz - td / 2 + i + 0.27), box(tw - 2 * i, 0.35, 0.55, OLD, 0, y - 0.35, tz + td / 2 - i - 0.27));
    for (const s of [-1, 1]) tank.add(box(0.55, 0.35, td - 2 * i, OLD, s * (tw / 2 - i - 0.27), y - 0.35, tz));
  }
  for (const s of [-1, 1]) tank.add(box(tw + 2, 0.3, 1, NEW, 0, -0.1, tz + s * (td / 2 + 0.5)), box(1, 0.3, td, NEW, s * (tw / 2 + 0.5), -0.1, tz));
  g.add(mergeByMaterial(tank), sheet(tw - 6, td - 6, M.water, 0, -1.6, tz), box(tw - 6.4, 0.3, td - 6.4, M.bank, 0, -2.4, tz));
  // A path from the tank to the Bhuteshwar temple.
  g.add(box(4, 0.06, 10, M.path, 0, -0.02, 25.5));
  g.add(asiBoard('Bateshwar Group of Temples', 12, 26, -0.3));
  // Babul, dhok and neem on the slopes and in the ravines.
  const keep = [[-72, 72, -62, 56]];
  g.add(trees(scatter(detail.low ? 30 : 60, [-260, 260, -260, 240], { seed: 3, gap: 14, avoid: keep }).map(([x, z]) => [x, z, null, landY(x, z)]), { kind: 'babul', seed: 3 }));
  g.add(trees(scatter(detail.low ? 25 : 50, [-260, 260, -260, 240], { seed: 7, gap: 14, avoid: keep }).map(([x, z]) => [x, z, null, landY(x, z)]), { kind: 'dhok', seed: 7 }));
  g.add(trees([[-28, 30], [28, 32], [-60, 50], [60, 48]], { kind: 'neem', seed: 4 }));
  g.add(shrubs(scatter(60, [-150, 150, -120, 120], { seed: 5, gap: 6, avoid: keep }).map(([x, z]) => [x, z, 1, landY(x, z)]), { seed: 5, dry: true }));
}

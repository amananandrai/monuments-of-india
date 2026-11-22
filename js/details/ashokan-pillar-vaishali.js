import * as THREE from 'three';
import { M, box, cyl, at, hemi, inst, unitBox, surface, mat } from '../helpers.js';
import { heightField, fbm } from '../parts/terrain.js';
import { trees, shrubs, asiBoard, scatter, along, benches, townHouses } from '../parts/realism.js';
import { BRICK, BRICK_DARK } from '../monuments/ashokan-pillar-vaishali.js';
import { detail } from '../detail.js';

const LAWN = surface(mat('#6f8a49', 0.95), 'ground');

// Kolhua, finer detail and setting. From photographs of the site: the excavated monastery
// (kutagarashala) west of the stupa, its cells round a court in low brick; small votive stupas of
// brick round the main one; brick-paved walks between them across mown lawns; and round the
// whole, mango orchards and the fields and houses of the village. Dimensions follow
// js/monuments/ashokan-pillar-vaishali.js: the pillar at the origin, the stupa's centre at z = sz,
// the tank tw by tl centred at z = tz.
export function addDetails(f, g, { sz, tz, tw, tl, R }) {
  // The ground: lawn round the monuments, open over the tank.
  const x0 = -110, x1 = 110, z0 = -90, z1 = 100, a = -tw / 2, b = tw / 2, c = tz - tl / 2, d = tz + tl / 2;
  g.add(box(a - x0, 0.5, z1 - z0, LAWN, (x0 + a) / 2, -0.5, (z0 + z1) / 2), box(x1 - b, 0.5, z1 - z0, LAWN, (b + x1) / 2, -0.5, (z0 + z1) / 2));
  g.add(box(tw, 0.5, c - z0, LAWN, 0, -0.5, (z0 + c) / 2), box(tw, 0.5, z1 - d, LAWN, 0, -0.5, (d + z1) / 2));
  g.add(heightField(2400, 2400, detail.low ? 80 : 120, (x, z) => (x > x0 + 15 && x < x1 - 15 && z > z0 + 15 && z < z1 - 15 ? -6 : -0.6) + 0.8 * fbm(x, z, { scale: 0.004, octaves: 3 }), { cover: '#6d8848', rock: ['#8a7c5e'], steep: 0.5 }));
  // Brick walks: from the pillar to the stupa, round the stupa, and down to the tank.
  const walks = [[0, 0.02, 6.5, 1.8, 0.04, 5, 0], [0, 0.02, -10.2, 1.8, 0.04, 16, 0], [-30, 0.02, 0, 1.8, 0.04, 52, 0], [-15, 0.02, -12, 30, 0.04, 1.8, 0]];
  g.add(inst(unitBox(), walks, surface(mat('#a8786a', 0.95), 'paving')));
  // The monastery: cells round a court, its walls standing knee-high.
  const mx = -58, mz = 18, cells = [], h = 26, n = 7;
  for (const s of [-1, 1]) {
    cells.push([mx, 0, mz + s * h / 2, h + 1.2, 1.1, 1.2, 0], [mx + s * h / 2, 0, mz, 1.2, 1.1, h, 0], [mx, 0, mz + s * (h / 2 - 4), h - 8, 0.8, 0.8, 0], [mx + s * (h / 2 - 4), 0, mz, 0.8, 0.8, h - 8, 0]);
    for (let k = 1; k < n; k++) { const u = -h / 2 + (k * h) / n; cells.push([mx + u, 0, mz + s * (h / 2 - 2), 0.6, 0.9, 4, 0], [mx + s * (h / 2 - 2), 0, mz + u, 4, 0.9, 0.6, 0]); }
  }
  g.add(inst(unitBox(), cells, BRICK), box(h - 9, 0.12, h - 9, BRICK_DARK, mx, 0, mz));
  // Votive stupas round the main one.
  const vs = new THREE.Group();
  for (let k = 0; k < 7; k++) {
    const ang = 1.2 + k * 0.32, r = 16 + (k % 2) * 3, x = Math.sin(ang) * r, z = sz + Math.cos(ang) * r, s = 0.6 + R() * 0.4;
    vs.add(box(2.4 * s, 0.9 * s, 2.4 * s, BRICK, x, 0, z), cyl(0.95 * s, 1 * s, 0.4 * s, BRICK_DARK, x, 0.9 * s, z, 14));
    if (k % 3) vs.add(at(hemi(0.95 * s, BRICK, 14), x, 1.3 * s, z));
  }
  g.add(vs);
  g.add(asiBoard('Kolhua, Vaishali', 12, -6, -Math.PI / 4));
  g.add(benches([[14, 8, -Math.PI / 2], [-14, -16, Math.PI / 2]]));
  // Mango orchards round the site, and the village to the east, in its trees.
  const away = ([x, z]) => !(x > -80 && x < 70 && z > -60 && z < 60);
  g.add(trees(scatter(46, [-220, 220, -200, 220], { seed: 3, gap: 14 }).filter(away), { kind: 'mango', seed: 3 }));
  g.add(trees(along(8, [-40, -75], [40, -75]), { kind: 'ashoka', seed: 4 }));
  g.add(trees(scatter(14, [-300, 300, -300, 300], { seed: 9, gap: 50 }).filter(away), { kind: 'peepal', seed: 9 }));
  g.add(shrubs(scatter(40, [-100, 100, -85, 95], { seed: 5, gap: 6 }).filter(([x, z]) => Math.hypot(x, z - sz) > 14 && Math.hypot(x, z) > 6 && Math.abs(z - tz) > tl / 2 + 3), { size: 0.9 }));
  g.add(townHouses(scatter(30, [150, 320, -160, 160], { seed: 6, gap: 13 }).map(([x, z], k) => [x, z, 6 + (k % 3) * 1.5, 7 + (k % 2) * 2, 1 + (k % 4 === 0), (k * 0.7) % 1.57]), { seed: 6, roof: 'pitched' }));
  void M;
}

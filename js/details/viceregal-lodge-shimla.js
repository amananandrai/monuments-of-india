import * as THREE from 'three';
import { M, box, rng } from '../helpers.js';
import { mergeByMaterial } from '../parts/components.js';
import { heightField, mountainRing, smooth, fbm } from '../parts/terrain.js';
import { trees, shrubs, lampPosts, benches, scatter, along, townHouses } from '../parts/realism.js';
import { detail } from '../detail.js';
import { P, STONE, DRESSED } from '../monuments/viceregal-lodge-shimla.js';

// The Viceregal Lodge, finer detail. From photographs: stone bay windows on the ground floor of the
// north front; a low stone wall round the lawn; quoins at the corners of the main tower.
// Measures follow js/monuments/viceregal-lodge-shimla.js.
function architecture(f) {
  const { L, D, TX, TZ, TW, TH, EH } = P, d = new THREE.Group(), fz = D / 2;
  for (const x of [-24, -6, 12, 28]) d.add(box(4.6, 3.4, 1.6, STONE, x, 1, -fz - 0.8), box(5, 0.4, 2, DRESSED, x, 4.4, -fz - 1), box(3.6, 2.2, 0.06, M.recess, x, 1.6, -fz - 1.63));
  // Quoins up the main tower's front corners above the roofs, alternately long and short.
  for (let y = EH + 3, k = 0; y < TH - 9; y += 1.4, k++) for (const s of [-1, 1]) d.add(box(k % 2 ? 0.7 : 1.2, 0.7, 0.12, DRESSED, TX + s * (TW / 2 - (k % 2 ? 0.35 : 0.6)), y, TZ + TW / 2 + 0.06));
  // The terrace wall round the lawn before the entrance front.
  d.add(box(L + 30, 0.9, 0.6, DRESSED, 0, 0, fz + 40), box(0.6, 0.9, 40, DRESSED, -L / 2 - 15, 0, fz + 20), box(0.6, 0.9, 40, DRESSED, L / 2 + 15, 0, fz + 20));
  f.add(mergeByMaterial(d));
}

// Observatory Hill: its top levelled for the Lodge and its lawns, the slopes falling steeply away
// through deodar forest to the town of Shimla.
function hillY(x, z) {
  const r = Math.hypot(x / 1.3, z + 5);
  return -70 * smooth(120, 330, r) + 6 * fbm(x, z, { scale: 0.01, octaves: 4 }) * smooth(110, 170, r);
}

// The Lodge on Observatory Hill: the lawn and terrace before its entrance front, the garden
// behind, deodars and flowering shrubs, the drive, cottages of Shimla on the slopes below and
// the Himalayan ridges all round, snow on the far peaks.
export function addDetails(f, g) {
  architecture(f);
  const { L, D } = P, fz = D / 2;
  g.add(heightField(1100, 1100, detail.low ? 90 : 150, hillY, { rock: ['#7b7466', '#8a8272'], cover: '#4f6a3a', steep: 0.72 }));
  g.add(mountainRing({ inner: 700, outer: 1500, h: 520, vary: 180, size: 4200, snow: 520, rock: ['#6e6a60', '#7c776c'], cover: '#4b6338', steep: 0.72 }));
  g.add(box(L + 60, 0.1, 120, M.grass, 0, -0.06, 10));
  g.add(box(L + 28, 0.06, 38, M.grass, 0, 0.02, fz + 20.5), box(8, 0.08, 60, M.path, P.PX, 0.03, fz + 40), box(L + 10, 0.08, 4, M.path, 0, 0.03, fz + 10));
  g.add(shrubs([...along(12, [-L / 2 - 10, fz + 38], [-6, fz + 38]), ...along(12, [18, fz + 38], [L / 2 + 10, fz + 38])].map(([x, z]) => [x, z, 1]), { seed: 6, flowers: '#c93a5a' }));
  g.add(lampPosts(along(5, [P.PX - 5, fz + 18], [P.PX - 5, fz + 68])));
  g.add(benches([[-20, fz + 30], [30, fz + 30]]));
  // Deodars round the lawns and down the slopes.
  const near = scatter(40, [-140, 140, -110, 110], { seed: 4, gap: 11, avoid: [[-L / 2 - 18, L / 2 + 18, -D / 2 - 50, fz + 44]] });
  const slope = scatter(detail.low ? 80 : 200, [-420, 420, -400, 400], { seed: 8, gap: 12 }).filter(([x, z]) => { const r = Math.hypot(x / 1.3, z + 5); return r > 125 && r < 360; });
  g.add(trees([...near, ...slope].map(([x, z]) => [x, z, null, hillY(x, z)]), { kind: 'deodar', seed: 4 }));
  // Cottages of Shimla on the slopes, under red and green tin roofs.
  const R = rng(17), spots = [];
  for (let k = 0; k < (detail.low ? 30 : 70); k++) {
    const a = R() * Math.PI * 2, r = 220 + R() * 140, x = Math.cos(a) * r * 1.3, z = Math.sin(a) * r - 5;
    if (z > 60 && Math.abs(x) < 60) continue;
    spots.push([x, z, 8 + R() * 4, 9 + R() * 3, 2 + Math.floor(R() * 2), -a + Math.PI / 2, hillY(x, z) - 0.5]);
  }
  g.add(townHouses(spots, { roof: 'pitched', roofs: ['#8a3b2a', '#3c6a4f', '#7a7f84', '#a3402f'], fine: false, seed: 17 }));
}

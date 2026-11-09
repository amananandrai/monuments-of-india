import * as THREE from 'three';
import { mat, box, at, inst, unitBox, unitHemi } from '../helpers.js';
import { heightField, rough, smooth } from '../details/terrain.js';
import { nagaraTemple } from '../details/temples.js';
import { addDetails } from '../details/shikharji.js';

const WHITE = mat('#f2eee6', 0.7);
const SHADE = mat('#d8d1c2', 0.85);

// Parasnath Hill: a long forested ridge in the Jharkhand plain, whose crest breaks into a chain of
// small rocky summits, each crowned by a tonk, a white shrine to one of the Tirthankaras who attained
// liberation here; Parshvanath's, the highest, at the eastern end. A pilgrim path climbs to it.
const H = 90, L = 260;
// The summits along the crest, [x, z, height], and the height of the ridge at (x, z).
export const PEAKS = Array.from({ length: 20 }, (_, i) => { const x = -L / 2 + 20 + (i / 19) * (L - 40); return [x, 10 * Math.sin(i * 0.9), H + 4 + 5 * Math.sin(i * 1.7) + (i === 17 ? 9 : 0)]; });
export function ridgeY(x, z) {
  const along = smooth(L / 2 + 70, L / 2 - 10, Math.abs(x)), cz = 6 * Math.sin(x * 0.02);
  let y = H * along * Math.exp(-(((z - cz) / 62) ** 2) * 1.6) + rough(x, z, 3, 0.7);
  for (const [px, pz, ph] of PEAKS) { const d = Math.hypot(x - px, z - pz); y = Math.max(y, ph - (d / 6.5) ** 2 * 2.2 - (ph - H) * smooth(5, 9, d)); }
  return y;
}
export function buildShikharji() {
  const g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  g.add(box(700, 0.2, 500, mat('#5b7a43', 0.95)));
  g.add(heightField(440, 240, 180, (x, z) => ridgeY(x, z) - 0.3, { rock: ['#7d7462', '#8b8170'], cover: '#47693a', steep: 0.55, band: 12 }));
  // A tonk on each summit: a square shrine under a dome, footprints of the Tirthankara inside;
  // Parshvanath's tonk, larger, with a spire.
  const bodies = [], domes = [], plinths = [];
  // No two tonks alike: each its own size, the height of its walls and the rise of its dome vary.
  PEAKS.forEach(([x, z, h], i) => {
    if (i === 17) return;
    const s = 0.8 + 0.45 * ((i * 0.618) % 1), wall = 3.4 * (0.8 + 0.4 * ((i * 0.381 + 0.5) % 1)), rise = 2.8 * (0.75 + 0.6 * ((i * 0.737 + 0.2) % 1)), b = 3.6 * s;
    plinths.push([x, h - 0.6, z, 6 * s, 1, 6 * s]);
    bodies.push([x, h + 0.4, z, b, wall, b]);
    domes.push([x, h + 0.4 + wall, z, b, rise * s, b]);
  });
  f.add(inst(unitBox(), plinths, SHADE), inst(unitBox(), bodies, WHITE), inst(unitHemi(16), domes, WHITE));
  const [px, pz, ph] = PEAKS[17];
  f.add(box(14, 1.2, 14, SHADE, px, ph - 0.8, pz), at(nagaraTemple({ w: 7, h: 11, m: WHITE, shade: SHADE, plinth: 0.6, urus: 4, halls: [[8, 4.5, 0, 'dome']] }), px, ph + 0.4, pz - 3));
  // The Jal Mandir, a larger temple in a saddle of the ridge.
  const jx = -40, jy = ridgeY(jx, 0);
  f.add(box(20, 1, 26, SHADE, jx, jy - 0.6, 0), at(nagaraTemple({ w: 8, h: 12, m: WHITE, shade: SHADE, plinth: 1, urus: 4, halls: [[10, 5, 0, 'dome']] }), jx, jy + 0.4, -4));
  // The pilgrim path, zig-zagging up the southern slope.
  const steps = [];
  for (let k = 0; k < 60; k++) { const z = 120 - k * 1.9, x = 70 + 22 * Math.sin(k * 0.35); steps.push([x, ridgeY(x, z) - 0.2, z, 2.6, 0.5, 2.6]); }
  g.add(inst(unitBox(), steps, SHADE));
  addDetails(f, g);
  return { group: g, focus: f, view: [0.35, 0.36, 1.2] };
}

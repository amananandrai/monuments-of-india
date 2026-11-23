import * as THREE from 'three';
import { M, mat, box, cyl, at, flag, inst, unitBox } from '../helpers.js';
import { heightField, mountainRing, fbm, smooth, ridged } from '../parts/terrain.js';
import { scatter, shrubs, garland } from '../parts/realism.js';
import { detail } from '../detail.js';
import { nishanSahib } from '../parts/sikh.js';

// The lake: a bowl of water some 240 × 180 m before the gurdwara (+z), whose buttresses stand at
// its edge.
const LZ = 115, LA = 120, LB = 90;
// The gurdwara's floor, on its paved apron above the water. The lake lies just above y = 0, the
// level of the open land, so that the land never shows through it.
export const Y0 = 0.5;
const lakeR = (x, z) => Math.hypot(x / LA, (z - LZ) / LB);

// The ground round the lake: a stony bench by the gurdwara, the lake's bed, and the slopes rising to
// the ring of seven peaks round the cirque.
function ground(x, z) {
  const r = lakeR(x, z), rr = Math.hypot(x, z - LZ);
  let y = 0.6 * fbm(x, z, { scale: 0.03, octaves: 3 });
  y -= 4 * smooth(1.05, 0.85, r);
  y += smooth(170, 440, rr) * (160 + 140 * ridged(x, z, { scale: 0.004, octaves: 4 }));
  if (Math.hypot(x, z) < 40) y = Math.min(y, 0.05 + 0.2 * fbm(x, z, { scale: 0.05 }));
  return y + 0.1;
}

// Hemkund: the lake under its peaks at the gurdwara's foot, snow on the slopes and floes on the
// water even in summer, the paved apron and the Nishan Sahib, the long open shed beside the
// building, saffron bunting under its eaves, small Nishan Sahibs on the crags round the cirque, the
// small stone temple of Lakshman on the shore, and flowers and scree round about.
export function addDetails(f, g, { PY, LY, RP, RL, P3, TURN }) {
  g.add(heightField(1500, 1500, detail.low ? 130 : 190, ground, { cz: LZ, rock: ['#6e6a66', '#7c776f', '#5f5b58'], cover: '#7d8058', steep: 0.82, snow: 70, band: 22 }));
  g.add(mountainRing({ inner: 700, outer: 1300, h: 700, vary: 200, size: 4200, cz: LZ, snow: 260, rock: ['#6a6660', '#78726a'], cover: '#6f7650' }));
  // The lake, glacier-green, with floes of snow on it and drifts on its far shore.
  const lake = new THREE.Mesh(new THREE.CircleGeometry(1, 72).rotateX(-Math.PI / 2).scale(LA * 1.02, 1, LB * 1.02), M.lake);
  lake.position.set(0, 0.06, LZ);
  g.add(lake);
  const SNOW = mat('#eef1f3', 0.6);
  for (const [x, z, w, d] of [[-90, 215, 30, 10], [70, 220, 24, 8], [140, 135, 9, 26], [-150, 85, 10, 22]]) { const s = new THREE.Mesh(new THREE.CircleGeometry(1, 20).rotateX(-Math.PI / 2).scale(w, 1, d), SNOW); s.position.set(x, ground(x, z) + 0.5, z); g.add(s); }
  for (const [x, z, w, d] of [[22, 52, 13, 6], [-30, 66, 9, 5], [48, 78, 7, 4]]) { const s = new THREE.Mesh(new THREE.CircleGeometry(1, 14).rotateX(-Math.PI / 2).scale(w, 1, d), SNOW); s.position.set(x, 0.12, z); g.add(s); }
  // The paved apron the gurdwara stands on, running to the water, and the path along the shore.
  const PAVE = mat('#a39e94', 0.95);
  g.add(cyl(24, 24.6, 0.9, PAVE, 0, Y0 - 0.9, 0, 40), box(40, 0.5, 9, PAVE, -40, Y0 - 0.55, 14));
  g.add(at(nishanSahib(18), -24, Y0, 13));
  // The long open shed beside the building: steel posts under a low sheeted roof.
  const posts = [], SH = mat('#3f3c3a', 0.8);
  for (let k = 0; k < 8; k++) for (const z of [9.6, 13, 16.4]) posts.push([-56 + k * 3.6, Y0 - 0.1, z, 0.16, 3.3, 0.16]);
  g.add(inst(unitBox(), posts, SH), box(27, 0.18, 8.2, SH, -43.4, Y0 + 3.2, 13), box(27, 0.5, 0.12, SH, -43.4, Y0 + 2.7, 9.6), box(27, 0.5, 0.12, SH, -43.4, Y0 + 2.7, 16.4));
  // Saffron bunting hung under each prow, from below the peak out to the corners.
  for (let i = 0; i < (detail.low ? 1 : 5); i++) for (const s of [-1, 1]) {
    const a = P3(RP - 0.5, i * TURN, PY - 0.75), b = P3(RL - 0.5, (i + s / 2) * TURN, LY - 0.7);
    f.add(garland(a.toArray(), b.toArray(), { sag: 0.25, strands: 2, gapY: 0.2 }));
  }
  // Small Nishan Sahibs on the crags round the lake.
  for (const [x, z] of [[-170, -40], [150, -70], [70, -140], [-70, -150], [-215, 60]]) g.add(at(flag(5, M.saffron), x, ground(x, z) - 0.2, z));
  // The temple of Lakshman, a small stone shrine with a pyramid roof and a saffron flag.
  const T = new THREE.Group(), st = mat('#8d8478', 0.9);
  T.add(box(5, 3.6, 5, st, 0, 0, 0), at(new THREE.Mesh(new THREE.ConeGeometry(3.6, 3.2, 4).rotateY(Math.PI / 4), st), 0, 4.8, 0), at(flag(2.4, M.saffron), 0, 6.4, 0));
  g.add(at(T, 52, 0.1, -4));
  // Scree and flowering alpine plants round the shore.
  if (!detail.low) g.add(shrubs(scatter(90, [-90, 90, -70, 20], { seed: 8, gap: 3, avoid: [[-62, 26, -26, 26]] }), { seed: 8, size: 0.6, flowers: ['#c94f9c', '#3e7bd1', '#f1d64a'] }));
}

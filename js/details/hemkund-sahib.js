import * as THREE from 'three';
import { M, mat, box, at, flag } from '../helpers.js';
import { heightField, mountainRing, fbm, smooth, ridged } from '../parts/terrain.js';
import { scatter, shrubs } from '../parts/realism.js';
import { detail } from '../detail.js';
import { nishanSahib } from './takht-sri-hazur-sahib.js';

// The lake: a bowl of water some 240 × 180 m north (-z) of the gurdwara.
const LZ = -150, LA = 120, LB = 90;
const lakeR = (x, z) => Math.hypot(x / LA, (z - LZ) / LB);

// The ground round the lake: a stony bench by the gurdwara, the lake's bed, and the slopes rising to
// the ring of seven peaks round the cirque.
function ground(x, z) {
  const r = lakeR(x, z), rr = Math.hypot(x, z - LZ);
  let y = 0.6 * fbm(x, z, { scale: 0.03, octaves: 3 });
  y -= 4 * smooth(1.05, 0.85, r);
  y += smooth(170, 440, rr) * (160 + 140 * ridged(x, z, { scale: 0.004, octaves: 4 }));
  if (Math.hypot(x, z) < 40) y = Math.min(y, 0.05 + 0.2 * fbm(x, z, { scale: 0.05 }));
  return y - 0.3;
}

// Hemkund: the lake under its peaks, snow on the slopes even in summer, the Nishan Sahib, the small
// stone temple of Lakshman on the shore, and flowers and scree round the gurdwara.
export function addDetails(f, g) {
  g.add(heightField(1500, 1500, detail.low ? 130 : 190, ground, { cz: LZ, rock: ['#6e6a66', '#7c776f', '#5f5b58'], cover: '#7d8058', steep: 0.82, snow: 70, band: 22 }));
  g.add(mountainRing({ inner: 700, outer: 1300, h: 700, vary: 200, size: 4200, cz: LZ, snow: 260, rock: ['#6a6660', '#78726a'], cover: '#6f7650' }));
  // The lake, glacier-green, and floes of snow on its far shore.
  const lake = new THREE.Mesh(new THREE.CircleGeometry(1, 72).rotateX(-Math.PI / 2).scale(LA * 0.97, 1, LB * 0.97), M.lake);
  lake.position.set(0, -0.4, LZ);
  g.add(lake);
  const SNOW = mat('#eef1f3', 0.6);
  for (const [x, z, w, d] of [[-90, -250, 30, 10], [70, -255, 24, 8], [140, -170, 9, 26], [-150, -120, 10, 22]]) { const s = new THREE.Mesh(new THREE.CircleGeometry(1, 20).rotateX(-Math.PI / 2).scale(w, 1, d), SNOW); s.position.set(x, ground(x, z) + 0.5, z); g.add(s); }
  // The paved terrace before the gurdwara, a stair down to the water, the Nishan Sahib.
  g.add(box(36, 0.3, 14, M.path, 0, 0, 22), box(10, 0.3, 46, M.path, -30, -0.25, -40));
  g.add(at(nishanSahib(18), -22, 0.3, 4));
  // The temple of Lakshman, a small stone shrine with a pyramid roof and a saffron flag.
  const T = new THREE.Group(), st = mat('#8d8478', 0.9);
  T.add(box(5, 3.2, 5, st), at(new THREE.Mesh(new THREE.ConeGeometry(3.6, 3.2, 4).rotateY(Math.PI / 4), st), 0, 4.8, 0), at(flag(2.4, M.saffron), 0, 6.4, 0));
  g.add(at(T, 48, 0, -40));
  // Scree and flowering alpine plants round the shore.
  if (!detail.low) g.add(shrubs(scatter(90, [-90, 90, -70, 40], { seed: 8, gap: 3, avoid: [[-32, 32, -22, 40]] }), { seed: 8, size: 0.6, flowers: ['#c94f9c', '#3e7bd1', '#f1d64a'] }));
}

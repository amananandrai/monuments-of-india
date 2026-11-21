import * as THREE from 'three';
import { M, mat, box, at, onFace, inst, unitBox, pidaRoof, kalash } from '../helpers.js';
import { pilasters, chhajja, columnTrim, mergeByMaterial } from './components.js';
import { dravidaDress, carvedPillar } from './temples.js';
import { detail } from '../detail.js';
import { trees, stalls, scatter, along } from './realism.js';
import { rideElephant } from './animals.js';

// Tirumala, finer architecture. Dimensions follow js/monuments/tirumala-temple.js: the outer wall
// 80 × 104, 8 high and 2.5 thick, the Mahadwaram gopuram in its south side (z = 52); the inner
// wall 52 × 44, 6 high, its gopuram at z = 22; the gold sanctum, Ananda Nilayam, 12 square and 7
// high at the centre; the Swami Pushkarini (36 × 30) at x = -62, z = -4. The sanctum's gilded walls
// are moulded and pilastered under a gilt eave; the Sampangi prakaram, a pillared corridor, runs
// round the inside of the outer wall; the walls are moulded and coped; and the Neerazhi mandapam
// stands in the middle of the tank, a small pillared pavilion, with a kerb round the water.
const LIME = mat('#efe9dd', 0.85), TRIM = mat('#d6cdbb', 0.88), GRANITE = M.granite;

// Coping (and, outside, a base course and pilasters) along a run of wall.
function wallRun(d, a, dist, p, q, H, T, outer) {
  const l = q - p, mid = (p + q) / 2, lat = a === Math.PI || a === Math.PI / 2 ? -mid : mid;
  const g = new THREE.Group().add(box(l + 0.01, 0.4, T + 0.5, TRIM, 0, H, 0));
  if (outer) g.add(box(l, 0.5, 0.25, TRIM, 0, 0, T / 2 + 0.12), at(pilasters(l - 2, Math.max(2, Math.round(l / 5)), 0.6, H - 1.6, 0.14, LIME), 0, 0.8, T / 2));
  d.add(onFace(g, a, dist, lat));
}

function walls(d) {
  for (const [a, runs] of [[0, [[-40, -10.5], [10.5, 40]]], [Math.PI, [[-40, 40]]]]) for (const [p, q] of runs) wallRun(d, a, 52, p, q, 8, 2.5, true);
  for (const a of [Math.PI / 2, -Math.PI / 2]) wallRun(d, a, 40, -52, 52, 8, 2.5, true);
  for (const [a, runs] of [[0, [[-26, -6.5], [6.5, 26]]], [Math.PI, [[-26, 26]]]]) for (const [p, q] of runs) wallRun(d, a, 22, p, q, 6, 2, false);
  for (const a of [Math.PI / 2, -Math.PI / 2]) wallRun(d, a, 26, -22, 22, 6, 2, false);
}

// The Sampangi prakaram: a row of pillars 4 m in from the outer wall's inner face, carrying a flat
// roof back to the wall, with an eave on the court side. Open where the gopuram stands.
function prakaram(d) {
  const cols = [], H = 5;
  for (const s of [-1, 1]) {
    for (let z = -47; z <= 47; z += 3.13) cols.push([s * 34.6, 0, z, 0.7, H, 0.7]);
    d.add(box(4.8, 0.5, 101, LIME, s * 36.6, H, 0), onFace(at(chhajja(101, 0.9, 0.35, 0.12, TRIM), 0, H + 0.3, 0), s > 0 ? -Math.PI / 2 : Math.PI / 2, -34.2));
  }
  for (let x = -31.3; x <= 31.4; x += 3.13) cols.push([x, 0, -46.6, 0.7, H, 0.7]);
  d.add(box(68.4, 0.5, 4.8, LIME, 0, H, -48.6), at(chhajja(68.4, 0.9, 0.35, 0.12, TRIM), 0, H + 0.3, -46.2));
  for (const s of [-1, 1]) {
    for (let x = 13.4; x <= 31.4; x += 3) cols.push([s * x, 0, 46.6, 0.7, H, 0.7]);
    d.add(box(20.6, 0.5, 4.8, LIME, s * 23.9, H, 48.6), onFace(at(chhajja(20.6, 0.9, 0.35, 0.12, TRIM), 0, H + 0.3, 0), Math.PI, -46.2, -s * 23.9));
  }
  d.add(inst(unitBox(), cols, LIME), columnTrim(cols, LIME, { capM: TRIM }));
}

// The Neerazhi mandapam in the middle of the Swami Pushkarini, and a kerb round the water.
function pushkarini(g) {
  const p = at(new THREE.Group(), -62, 0, -4);
  for (const s of [-1, 1]) p.add(box(36, 0.5, 0.6, GRANITE, 0, 1, s * 14.7), box(0.6, 0.5, 29.4, GRANITE, s * 17.7, 1, 0));
  p.add(box(6, 1.6, 6, GRANITE), box(6.6, 0.3, 6.6, M.graniteDark, 0, 1.6));
  for (const x of [-2.2, 2.2]) for (const z of [-2.2, 2.2]) p.add(at(carvedPillar(3, GRANITE), x, 1.9, z));
  p.add(box(6, 0.5, 6, GRANITE, 0, 4.9), box(6.8, 0.25, 6.8, M.graniteDark, 0, 5.4));
  const roof = pidaRoof(5, 2, 3, 0.5, LIME, TRIM);
  p.add(at(roof, 0, 5.65, 0), at(kalash(0.5, M.gold), 0, 5.65 + roof.userData.top, 0));
  g.add(mergeByMaterial(p));
}

// Tirumala: the temple elephant, flower and prasadam stalls along the approach, trees along the
// Mada streets between the temple wall and the town (js/monuments/tirumala-temple.js), and the
// trees of the Seshachalam hills beyond it.
export function addDetails(f, g) {
  const d = new THREE.Group();
  d.add(dravidaDress(12, 12, 7, M.gild, { eaveM: M.gildDeep, hara: false }));
  walls(d);
  if (!detail.low) prakaram(d);
  f.add(mergeByMaterial(d));
  pushkarini(g);
  const tusker = rideElephant(mat('#5e5650', 0.9), 0.9, { cloth: '#e3b54a', howdah: false });
  tusker.position.set(14, 0, 64);
  tusker.rotation.y = -0.4;
  g.add(tusker);
  g.add(stalls([...along(8, [-14, 60], [-14, 100]).map(([x, z]) => [x, z, Math.PI / 2]), ...along(8, [14, 60], [14, 100]).map(([x, z]) => [x, z, -Math.PI / 2])]));
  g.add(trees(scatter(40, [-108, 108, -108, 108], { seed: 6, gap: 12 }).filter(([x, z]) => Math.hypot(x, z) > 112 || (Math.abs(x) > 44 && Math.abs(x) < 66 && Math.abs(z) < 60) || (Math.abs(z) > 56 && Math.abs(z) < 66 && Math.abs(x) < 66 && Math.abs(x) > 20)), { kind: 'mango', seed: 6 }));
}

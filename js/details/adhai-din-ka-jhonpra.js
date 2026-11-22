import * as THREE from 'three';
import { M, mat, box, at, inst, unitCyl, unitBox } from '../helpers.js';
import { merlons, mergeByMaterial } from '../parts/components.js';
import { steps } from '../parts/doorways.js';
import { heightField, fbm, ridged, smooth } from '../parts/terrain.js';
import { trees, shrubs, asiBoard, scatter, cityAround } from '../parts/realism.js';
import { detail } from '../detail.js';

// The yellow limestone of the screen, and the same stone weathered darker on the hall and court.
export const LIME = mat('#c7a66c', 0.9);
export const LIME_DARK = mat('#a88a5a', 0.92);

// Adhai Din Ka Jhonpra, finer detail and setting. From photographs: the court before the screen is
// ruined: the colonnades that ran down its sides survive as rows of pillars on a low plinth, its
// walls stand to a few courses with the stumps of round bastions at the corners; a flight of steps
// climbs to the gate in the middle of the east side. The mosque stands at the foot of the Taragarh
// hill, Ajmer's old houses crowding round it. Dimensions follow js/monuments/adhai-din-ka-jhonpra.js:
// platform P high, the screen's front at z = 3.6, the court to z = 46.
function court(f, { P }) {
  const d = new THREE.Group(), z0 = 4, z1 = 46, W = 70;
  // The side colonnades: a plinth and two rows of pillars with lintels, the roof long gone.
  const shafts = [], beams = [];
  for (const s of [-1, 1]) {
    d.add(box(7, 0.6, z1 - z0, LIME_DARK, s * (W / 2 - 3.5), P, (z0 + z1) / 2));
    for (let z = z0 + 2; z < z1 - 1; z += 3.2) for (const x of [W / 2 - 1.5, W / 2 - 5.5]) {
      if ((z * 7 + x) % 5 < 1.2) continue;
      shafts.push([s * x, P + 0.6, z, 0.45, 5.2, 0.45]);
    }
    beams.push([s * (W / 2 - 1.5), P + 5.8, (z0 + z1) / 2 - 6, 0.6, 0.5, 18], [s * (W / 2 - 5.5), P + 5.8, (z0 + z1) / 2 + 8, 0.6, 0.5, 12]);
  }
  d.add(inst(unitCyl(8), shafts, LIME), inst(unitBox(), beams, LIME_DARK));
  // The ruined east wall, either side of the gate, and the stumps of corner bastions.
  for (const s of [-1, 1]) d.add(box(W / 2 - 6, 3.2, 1.6, LIME_DARK, s * (W / 4 + 3), P, z1), at(merlons(W / 2 - 6, 0.7, 0.9, 0.4, LIME_DARK, 0.4), s * (W / 4 + 3), P + 3.2, z1));
  for (const x of [-W / 2, W / 2]) d.add(box(5, 6, 5, LIME_DARK, x, 0, z1).rotateY(Math.PI / 8), box(5, 4.5, 5, LIME_DARK, x, 0, -12).rotateY(Math.PI / 8));
  // The gate: two piers and a lintel, and the steps down to the street.
  for (const x of [-4, 4]) d.add(box(2, 6.5, 2.4, LIME, x, P, z1));
  d.add(box(10, 1, 2.4, LIME, 0, P + 6.5, z1));
  d.add(at(steps(8, P, 6, LIME_DARK), 0, 0, z1 + 1.2));
  // Fallen and loose blocks in the court.
  const R = (k) => ((Math.sin(k * 91.7) * 43758.5) % 1 + 1) % 1, loose = [];
  for (let k = 0; k < 40; k++) loose.push([-28 + R(k) * 56, P, 8 + R(k + 50) * 34, 0.6 + R(k + 9) * 0.8, 0.4 + R(k + 3) * 0.4, 0.5 + R(k + 7) * 0.6, R(k + 1) * 3]);
  d.add(inst(unitBox(), loose.filter(([x, , z]) => Math.abs(x) > 6 || z < 10), LIME_DARK));
  f.add(mergeByMaterial(d));
}

// Taragarh hill, rising steeply behind (west of) the mosque.
function hillY(x, z) {
  const t = smooth(110, 420, -z + 0.15 * Math.abs(x));
  return t * (90 + 60 * ridged(x, z, { scale: 0.004, octaves: 4 }) + 25 * fbm(x, z, { scale: 0.01, octaves: 3 })) - 0.4;
}

export function addDetails(f, g, dims) {
  court(f, dims);
  g.add(box(500, 0.2, 500, M.path, 0, -0.2, 40));
  g.add(heightField(1200, 900, detail.low ? 100 : 150, hillY, { cz: -300, rock: ['#8b7a5c', '#9a8866'], cover: '#7d7a4e', steep: 0.6, band: 20 }));
  g.add(trees(scatter(10, [-90, 90, 50, 90], { seed: 3, gap: 14, avoid: [[-50, 50, 46, 120]] }), { kind: 'neem', seed: 3 }));
  g.add(trees(scatter(8, [-90, 90, -40, 0], { seed: 5, gap: 16, avoid: [[-45, 45, -30, 50]] }), { kind: 'babul', seed: 5 }));
  g.add(shrubs(scatter(20, [-40, 40, 8, 44], { seed: 6, gap: 4, avoid: [[-8, 8, 0, 50]] }), { seed: 6, dry: true, size: 0.7, y: dims.P }));
  g.add(asiBoard('Adhai Din Ka Jhonpra', 9, 54, -0.3));
  // The old town of Ajmer round the mosque, the street open before its steps.
  g.add(cityAround([-48, 48, -24, 58], { rows: detail.low ? 1 : 2, every: detail.low ? 2 : 1, gap: 8, seed: 41, fine: false,
    paint: ['#e8d8b8', '#d9b48f', '#cfd8d4', '#f1e6cf', '#e7b9b0', '#c9d6a3'], keep: [[-75, 75, 46, 400], [-400, 400, -400, -26]] }));
}

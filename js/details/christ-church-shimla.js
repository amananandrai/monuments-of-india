import * as THREE from 'three';
import { mat, box, at, tricolour } from '../helpers.js';
import { mergeByMaterial, beltCourse } from '../parts/components.js';
import { trees, lampPosts, benches, along, townHouses } from '../parts/realism.js';
import { heightField, fbm, smooth } from '../parts/terrain.js';
import { detail } from '../detail.js';
import { rng } from '../helpers.js';
import { S, WHITE } from '../monuments/christ-church-shimla.js';

// Christ Church, finer detail. From photographs: a white plinth and string course run round the
// church. Round it, the Ridge at Shimla: the open square paved in stone before the tower, with its
// iron railing at the edge and lamps along it; the mock-Tudor State Library beside the church; and
// the hill falling away on every side into deodar forest and the town's houses under red, green and
// grey iron roofs, stepping down the slopes, with Jakhu hill rising behind.
function architecture(f) {
  const { FZ, LEN, NW, T } = S, d = new THREE.Group();
  d.add(at(beltCourse(NW + 0.2, LEN, 0, 0.7, 0.18, WHITE), 0, 0, FZ - T - LEN / 2));
  d.add(at(beltCourse(NW, LEN, 1.9, 0.22, 0.12, WHITE), 0, 0, FZ - T - LEN / 2));
  f.add(mergeByMaterial(d));
}

// The ground: the Ridge level round the church and the square, falling away steeply to the north
// and south and gently east and west; Jakhu rising to the north-east behind the church.
const RIDGE = (x, z) => {
  const off = Math.max(0, Math.abs(z - 20 + 0.08 * x) - 55 - 18 * Math.max(0, -x / 80));
  const fall = -150 * smooth(0, 260, off) - 18 * smooth(120, 400, Math.abs(x));
  const jakhu = 190 * Math.exp(-((x - 180) ** 2 + (z + 380) ** 2) / (2 * 130 ** 2)) * smooth(150, 300, Math.hypot(x, z));
  return fall + jakhu + (off > 2 ? 6 * fbm(x, z, { scale: 0.01, octaves: 3 }) : 0) - 0.08;
};

export function addDetails(f, g) {
  architecture(f);
  const { FZ, LEN, T } = S, BZ = FZ - T - LEN;
  g.add(heightField(1500, 1500, detail.low ? 110 : 170, RIDGE, { rock: ['#7a7266', '#857c6e'], cover: '#4f6b3c', steep: 0.6 }));
  // The paved Ridge: the square before the tower and the promenade running west along the crest.
  const P = mat('#b8b2a6', 0.92);
  g.add(box(110, 0.12, 60, P, -20, 0, FZ + 30), box(170, 0.12, 30, P, -150, 0, FZ + 20), box(30, 0.12, LEN + 20, P, 22, 0, FZ - LEN / 2));
  // The railing along the square's southern edge, and the lamps and benches of the promenade.
  const rail = new THREE.Group(), RL = mat('#2d3a33', 0.6, 0.3);
  rail.add(box(160, 0.1, 0.1, RL, -60, 1.05, FZ + 59.5), box(160, 0.08, 0.08, RL, -60, 0.55, FZ + 59.5));
  for (let x = -140; x <= 20; x += 2.5) rail.add(box(0.1, 1.1, 0.1, RL, x, 0, FZ + 59.5));
  g.add(mergeByMaterial(rail));
  g.add(lampPosts([...along(7, [-70, FZ + 57], [30, FZ + 57]), ...along(5, [-220, FZ + 33], [-90, FZ + 33])]));
  g.add(benches([[-50, FZ + 55], [-25, FZ + 55], [0, FZ + 55], [-120, FZ + 30], [-160, FZ + 30]]));
  // The State Library, to the west of the church: a timber-framed Tudor gable on a stone base.
  const lib = new THREE.Group(), lx = -46, lz = FZ - 34, TIM = mat('#4a3426', 0.8), ROOF = mat('#7a3428', 0.75, 0.1);
  lib.add(box(14, 4, 10, mat('#9a9080', 0.9), lx, 0, lz), box(14, 4, 10, WHITE, lx, 4, lz));
  for (let k = -3; k <= 3; k++) lib.add(box(0.25, 4, 0.1, TIM, lx + k * 2, 4, lz + 5.02));
  lib.add(box(14, 0.25, 0.1, TIM, lx, 6, lz + 5.02));
  const s = new THREE.Shape();
  s.moveTo(-7.6, 0); s.lineTo(7.6, 0); s.lineTo(0, 5); s.closePath();
  lib.add(at(new THREE.Mesh(new THREE.ExtrudeGeometry(s, { depth: 11, bevelEnabled: false }).translate(0, 0, -5.5), ROOF), lx, 8, lz));
  g.add(mergeByMaterial(lib));
  // Deodars over the slopes, thickest on Jakhu.
  const R = rng(17), dz = [];
  for (let k = 0; k < (detail.low ? 220 : 480); k++) {
    const x = (R() - 0.5) * 1200, z = (R() - 0.5) * 1200, y = RIDGE(x, z);
    if (y > -4 && y < 12) continue;
    dz.push([x, z, 16 + R() * 10, y]);
  }
  // Jakhu's forest, close-set over the hill behind.
  for (let k = 0; k < (detail.low ? 70 : 150); k++) {
    const a = R() * 6.28, r = 40 + Math.sqrt(R()) * 230, x = 180 + Math.cos(a) * r, z = -380 + Math.sin(a) * r;
    if (Math.hypot(x, z) > 170) dz.push([x, z, 16 + R() * 10, RIDGE(x, z)]);
  }
  g.add(trees(dz, { kind: 'deodar', seed: 3 }));
  g.add(trees([[40, FZ + 20], [44, FZ - 10], [-70, FZ - 6], [-90, FZ - 14]].map(([x, z]) => [x, z, 18]), { kind: 'deodar', seed: 5 }));
  // The town: houses stepping down the slopes below the Ridge, under painted iron roofs.
  const H = rng(29), houses = [];
  for (let k = 0; k < (detail.low ? 90 : 200); k++) {
    const x = (H() - 0.5) * 700, z = FZ + (H() < 0.6 ? 70 + H() * 230 : -80 - H() * 200), y = RIDGE(x, z);
    if (y > -6 || y < -140) continue;
    houses.push([x, z, 7 + H() * 6, 8 + H() * 4, 2 + Math.floor(H() * 3), z > FZ ? 0 : Math.PI, y - 2]);
  }
  g.add(townHouses(houses, { seed: 9, roof: 'pitched', roofs: ['#9a3b2c', '#3e6b48', '#6d7479', '#9a3b2c'], tanks: 0, fine: false, paint: ['#efe6d2', '#e3c98d', '#d9e1e3', '#e7cdbf', '#f4f1ea', '#cfdcc0'] }));
  // The national flag on the square.
  g.add(at(tricolour(12, 3), -45, 0, FZ + 30));
}

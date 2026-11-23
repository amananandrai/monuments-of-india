import * as THREE from 'three';
import { M, mat, mesh, box, cyl, at } from '../helpers.js';
import { mergeByMaterial, beltCourse } from '../parts/components.js';
import { classicalDoor } from '../parts/colonial.js';
import { figure } from '../parts/sculpture.js';
import { trees, shrubs, lampPosts, benches, scatter, along, traffic, townHouses } from '../parts/realism.js';
import { heightField, fbm, smooth } from '../parts/terrain.js';
import { detail } from '../detail.js';
import { rng } from '../helpers.js';
import { S, WHITE, TRIM, BLUE } from '../monuments/immaculate-conception-panaji.js';

// The church, finer detail. From photographs: tall round-headed windows between pilasters down the
// nave's sides, a cornice along its eaves, and a painted statue of the Virgin on a square pedestal
// before the door; the stairs' balustrades are a criss-cross lattice, with globe lamps on the piers. Round it, the middle of Panaji: Church Square at the foot of the stairs, with its
// lawns, palms and the road (Emidio Gracia Road) between; old Portuguese houses under tiled roofs in
// yellow, blue and ochre; and the wooded slope of Altinho hill rising behind the church.
// A balustrade of criss-cross lattice len long and h high, along x on y = 0: a plinth and a rail,
// and between them a saltire to each panel.
export function lattice(len, h, m) {
  const g = new THREE.Group(), n = Math.max(1, Math.round(len / (h * 1.15))), pw = len / n, ih = h - 0.24, L = Math.hypot(pw, ih), a = Math.atan2(ih, pw);
  g.add(box(len, 0.12, 0.24, m), box(len + 0.06, 0.12, 0.28, m, 0, h - 0.12, 0));
  for (let k = 0; k <= n; k++) g.add(box(0.1, ih, 0.16, m, -len / 2 + k * pw, 0.12, 0));
  for (let k = 0; k < n; k++) for (const s of [-1, 1]) {
    const o = at(box(L, 0.08, 0.1, m), -len / 2 + (k + 0.5) * pw, h / 2, s * 0.012);
    o.geometry.translate(0, -0.04, 0);
    o.rotation.z = s * a;
    g.add(o);
  }
  return g;
}

// A pier of the stairs with its lamp: a white globe on a short stem.
const GLOBE = mat('#fdfcf6', 0.35);
export function lampPier(m) {
  const g = new THREE.Group();
  g.add(box(0.6, 1.25, 0.6, m), box(0.72, 0.12, 0.72, m, 0, 1.25, 0), cyl(0.05, 0.07, 0.3, m, 0, 1.37, 0, 8), at(mesh(new THREE.SphereGeometry(0.27, 12, 8), GLOBE), 0, 1.9, 0));
  return g;
}

function architecture(f) {
  const { H0, FZ, NW, NH, LEN } = S, d = new THREE.Group();
  const win = classicalDoor(1.6, 3.6, { m: WHITE, trim: TRIM, fill: 'glass', top: null, depth: 0.25 });
  for (const s of [-1, 1]) for (let k = 0; k < 5; k++) {
    const z = FZ - 6 - k * 6.4;
    d.add(at(win.clone(), s * NW / 2, H0 + 9, z).rotateY(s * Math.PI / 2));
    d.add(box(0.6, NH - 0.6, 0.3, TRIM, s * (NW / 2 + 0.1), H0, z - 3.2));
  }
  d.add(at(beltCourse(NW + 0.2, LEN, H0 + NH - 0.6, 0.6, 0.2, TRIM), 0, 0, FZ - 1 - LEN / 2));
  // The Virgin before the door: a statue painted blue and white on a tall square masonry pedestal.
  const z = FZ + 5.4;
  d.add(box(2, 0.5, 2, WHITE, 0, H0 + 0.3, z), box(1.5, 3.4, 1.5, WHITE, 0, H0 + 0.8, z), box(1.9, 0.3, 1.9, TRIM, 0, H0 + 4.2, z), box(1.1, 0.9, 0.06, TRIM, 0, H0 + 2.2, z + 0.76));
  const mantle = cyl(0.17, 0.42, 1.75, BLUE, 0, H0 + 4.5, z - 0.06, 12);
  mantle.scale.z = 0.7;
  d.add(at(figure(2.3, WHITE), 0, H0 + 4.5, z + 0.05), mantle, at(mesh(new THREE.SphereGeometry(0.19, 10, 8), BLUE), 0, H0 + 6.55, z - 0.08));
  f.add(mergeByMaterial(d));
}

// Altinho hill behind the church, and the level town below.
const HILL = (x, z) => {
  const back = smooth(-40, -260, z + 0.15 * x);
  return back * (60 + 25 * fbm(x, z, { scale: 0.006, octaves: 4 })) + smooth(-20, -50, z) * smooth(30, 18, Math.abs(x)) * S.H0 - 0.08;
};

export function addDetails(f, g) {
  architecture(f);
  const { FZ, LEN } = S, foot = FZ + 8 + 3 * S.STEP;
  g.add(heightField(1200, 1000, detail.low ? 100 : 150, HILL, { cz: -150, rock: ['#8a5c44', '#7d5a46'], cover: '#5b7d3e', steep: 0.55 }));
  // The road at the foot of the stairs, and Church Square beyond it: lawns, palms and paths.
  g.add(box(400, 0.07, 14, M.asphalt, 0, 0, foot + 12));
  g.add(traffic([[foot + 9.5, 1], [foot + 14, -1]], -190, 190, { gap: 18, seed: 5, taxis: 0.1, buses: 0.06, trucks: 0.02 }));
  g.add(box(90, 0.1, 60, M.grass, 0, 0, foot + 52), box(90, 0.11, 4, M.path, 0, 0, foot + 52), box(4, 0.11, 60, M.path, 0, 0, foot + 52));
  g.add(box(400, 0.05, 6, M.path, 0, 0, foot + 2.5));
  g.add(trees([...along(5, [-40, foot + 25], [-40, foot + 78]), ...along(5, [40, foot + 25], [40, foot + 78]), [-14, foot + 36], [14, foot + 66]], { kind: 'palm', seed: 4 }));
  g.add(trees([[-25, foot + 68], [25, foot + 38]], { kind: 'banyan', seed: 6 }));
  g.add(shrubs(scatter(16, [-42, 42, foot + 24, foot + 80], { seed: 3, gap: 6, avoid: [[-3, 3, foot, foot + 90], [-50, 50, foot + 50, foot + 54]] }).map(([x, z]) => [x, z, 1.3]), { flowers: '#d0306f', seed: 3 }));
  g.add(lampPosts([...along(6, [-44, foot + 5], [44, foot + 5]), [-6, foot + 24], [6, foot + 24]]));
  g.add(benches([[-10, foot + 40], [10, foot + 40], [-10, foot + 64], [10, foot + 64]]));
  // Old Panaji: rows of two-storey houses under tiled roofs along the road on either side of the
  // church, and round the square.
  const R = rng(13), houses = [], paint = ['#e8c35a', '#5f86b8', '#d98c4a', '#f1e6c8', '#9cc08c', '#c25b4a', '#e7d6a0'];
  for (const s of [-1, 1]) for (let x = 32; x < 180; x += 11 + R() * 3) houses.push([s * x, foot - 6, 10, 12, 2, 0]);
  for (const s of [-1, 1]) for (let z = foot + 26; z < foot + 140; z += 12 + R() * 3) houses.push([s * (60 + R() * 4), z, 11, 12, 2 + Math.floor(R() * 2), s > 0 ? -Math.PI / 2 : Math.PI / 2]);
  for (let x = -50; x < 60; x += 12 + R() * 3) houses.push([x, foot + 98, 11, 12, 2 + Math.floor(R() * 2), Math.PI]);
  g.add(townHouses(houses, { seed: 7, roof: 'pitched', roofs: ['#a4492f', '#94402a', '#b0573a'], tanks: 0, paint, fine: !detail.low }));
  // Trees on Altinho behind the church: mango, jackfruit and palms among the houses on its slope.
  const T = [];
  for (let k = 0; k < (detail.low ? 90 : 180); k++) {
    const x = (R() - 0.5) * 600, z = -40 - LEN - R() * 320, y = HILL(x, z);
    T.push([x, z, 9 + R() * 5, y]);
  }
  g.add(trees(T.filter((_, k) => k % 3), { kind: 'mango', seed: 8 }), trees(T.filter((_, k) => !(k % 3)), { kind: 'palm', seed: 9 }));
  g.add(trees([[-26, FZ - 10, 13, S.H0], [26, FZ - 16, 13, S.H0], [-24, FZ - 40, 12, S.H0]], { kind: 'palm', seed: 11 }));
}

import * as THREE from 'three';
import { M, mat, box, at, onFace, rng, mesh } from '../helpers.js';
import { templeNiche, idol, mergeByMaterial } from '../parts/components.js';
import { figureFrieze } from '../parts/sculpture.js';
import { heightField, fbm, smooth } from '../parts/terrain.js';
import { trees, shrubs, asiBoard, townHouses, along, scatter } from '../parts/realism.js';
import { detail } from '../detail.js';

// Lepakshi's grey granite, and the whitewashed stucco of the shrine's tower.
export const GRANITE = mat('#a0978a', 0.92);
export const SHADE = mat('#7a7266', 0.94);
export const STUCCO = mat('#e8e0cf', 0.85);
const ROCK = mat('#8b8378', 0.95, 0, { flatShading: true });

// R: the height of the levelled rock; the dance hall at z = nz, the sanctum at sz (its closed hall
// in front); the wedding hall at (kx, kz); the Nagalinga at (lx, lz).
export const DIMS = { R: 2, nz: 17, sz: -6, kx: -16, kz: -16, lx: 12, lz: -6 };

// Lepakshi, finer detail. From photographs: the plinth of the dance hall carries bands of dancers
// and of elephants; the sanctum's outer walls hold images in niches between their pilasters; and
// the Kalyana Mandapa's platform is moulded, with friezes of the gods' wedding guests.
function architecture(f) {
  const { R, nz, sz, kx, kz } = DIMS, d = new THREE.Group();
  for (const [a, len, dist] of [[0, 20, 9.4], [Math.PI / 2, 18, 10.4], [-Math.PI / 2, 18, 10.4]]) {
    const fr = onFace(at(figureFrieze(len - (a ? 0 : 5), 0.55, GRANITE, { pitch: detail.low ? 1.4 : 0.7, kinds: ['dancer', 'standing', 'elephant'], proud: 0.06 }), a ? 0 : 0, R + 0.35, 0), a, dist + 0.01, a ? 0 : 0);
    fr.position.z += nz;
    f.add(fr);
  }
  for (const a of [Math.PI, Math.PI / 2, -Math.PI / 2]) for (const lat of [-2.6, 2.6]) {
    const o = onFace(at(templeNiche(1, 2.3, GRANITE, { figure: idol(2, GRANITE) }), 0, R + 1.5, 0), a, 4.64, lat);
    o.position.z += sz;
    d.add(o);
  }
  f.add(mergeByMaterial(d));
  for (const a of [0, Math.PI, Math.PI / 2, -Math.PI / 2]) {
    const fr = onFace(at(figureFrieze(15.2, 0.5, GRANITE, { pitch: detail.low ? 1.4 : 0.8, kinds: ['standing', 'dancer'], proud: 0.06 }), 0, R + 0.5, 0), a, 7.9);
    fr.position.x += kx;
    fr.position.z += kz;
    f.add(fr);
  }
}

// The low granite hill the temple stands on, and the fields round it: the rock bare and rounded,
// sloping into red earth and dry grass.
function groundY(x, z) {
  const r = Math.hypot(x / 1.1, (z - 4) / 1.2), hill = smooth(70, 40, r) * 1.75;
  return hill + 0.6 * fbm(x, z, { scale: 0.03, octaves: 3 }) * smooth(30, 60, r) - 0.15;
}

// Lepakshi village: the hill and its boulders, the road north to the Nandi lined with tamarinds,
// village houses either side of it, coconut palms and the ASI board.
export function addDetails(f, g) {
  architecture(f);
  const R = rng(4);
  // The courts paved in granite flags over the rock.
  g.add(box(73, 0.06, 85, M.path, 0, DIMS.R, 4));
  g.add(heightField(600, 600, detail.low ? 90 : 140, groundY, { cz: 40, rock: ['#8f877b', '#9a9285', '#837b70'], cover: '#9b9466', steep: 0.9 }));
  for (let i = 0; i < 14; i++) {
    const a = R() * Math.PI * 2, d = 48 + R() * 25, r = 2 + R() * 4;
    const b = mesh(new THREE.IcosahedronGeometry(r, 1), ROCK, Math.cos(a) * d, r * 0.4, 4 + Math.sin(a) * d * 1.1);
    b.scale.y = 0.6;
    g.add(b);
  }
  // The road from the gopuram to the Nandi and on north.
  g.add(box(10, 0.1, 200, M.asphalt, 0, 0.05, 150));
  g.add(trees([...along(9, [-9, 60], [-9, 230]), ...along(9, [9, 70], [9, 230])], { kind: 'tamarind', seed: 3 }));
  if (!detail.low) g.add(townHouses([...along(6, [-26, 150], [-26, 250]), ...along(6, [26, 150], [26, 250])].map(([x, z], i) => [x, z, 8, 9, 1 + (i % 2), x < 0 ? Math.PI / 2 : -Math.PI / 2]), { seed: 5, roof: 'pitched', roofs: ['#9a4a32', '#8a3b2a', '#7a7f84'] }));
  g.add(trees([...scatter(18, [-150, -55, -80, 140], { seed: 6, gap: 12 }), ...scatter(18, [55, 150, -80, 140], { seed: 7, gap: 12 })], { kind: 'palm', seed: 8 }));
  g.add(trees(scatter(detail.low ? 6 : 12, [-150, 150, -160, -70], { seed: 9, gap: 14 }), { kind: 'neem', seed: 2 }));
  g.add(shrubs([...along(5, [-6, 108], [-6, 132]), ...along(5, [6, 108], [6, 132])], { size: 1, dry: true }));
  g.add(asiBoard('Veerabhadra Temple, Lepakshi', 7, 56, -0.4));
}

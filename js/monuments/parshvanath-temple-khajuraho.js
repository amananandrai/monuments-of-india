import * as THREE from 'three';
import { M, mat, box, cyl, at, aroundRect, shikhara, clothGeometry } from '../helpers.js';
import { nagaraTemple } from '../details/temples.js';
import { figureRow, figure } from '../details/sculpture.js';
import { addDetails } from '../details/parshvanath-temple-khajuraho.js';

export function buildParshvanath() {
  const S = M.khaj, Sd = M.khajShade, g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  g.add(box(100, 0.2, 100, M.grass));
  // High platform, then the temple with its spire, minor spires and bands of sculpture
  f.add(box(26, 3, 40, Sd, 0, 0, 4));
  // The Jain flag, in its five colours, flies from the finial. In the sanctum's niches, a seated
  // tirthankara in meditation rather than a Shaiva guardian.
  const crown = new THREE.Group(), jain = ['#d2302c', '#f2c21c', '#f5f2ea', '#2f8a4a', '#2f5d9a'];
  crown.add(cyl(0.05, 0.07, 5, M.wood, 0, 0, 0, 6));
  jain.forEach((c, k) => { const cl = new THREE.Mesh(clothGeometry(3.6, 2.5, { y0: k * 0.5, y1: (k + 1) * 0.5 }), mat(c, 0.8, 0, { side: THREE.DoubleSide })); cl.position.set(0, 4.9, 0); crown.add(cl); });
  f.add(at(nagaraTemple({ w: 11, h: 15, m: S, shade: Sd, plinth: 1, urus: 4, uruScale: 0.55, crown, halls: [[12, 6, 4], [9, 5, 3]], prof: (t) => 1 - 0.66 * Math.pow(t, 1.3), nicheFigure: (h, m) => figure(h * 0.62, m, 'seated') }), 0, 3, -8));
  // The shrine built on behind the sanctum, as Parshvanath alone of the Khajuraho temples has, with
  // its own small spire.
  f.add(box(7, 7, 6, S, 0, 4, -8 - 6.3 - 3), box(7.6, 0.5, 6.6, Sd, 0, 11, -8 - 6.3 - 3), at(shikhara(6, 6.5, S, (t) => 1 - 0.66 * Math.pow(t, 1.3), 8), 0, 11.5, -8 - 6.3 - 3));
  // Its walls carry no balconies but are covered in bands of sculpture: round the sanctum and its
  // rear shrine, and along both sides of the halls.
  const figs = [];
  for (const y of [5.0, 7.3]) {
    aroundRect(13, 13, 1.25).forEach(([x, z, ry]) => figs.push([x, y, z - 8, 0.7, 1.95, 0.3, ry]));
    for (const sx of [-1, 1]) for (let z = -1; z <= 9.5; z += 1.25) figs.push([sx * 6.15, y, z, 0.7, 1.95, 0.3, sx > 0 ? Math.PI / 2 : -Math.PI / 2]);
    for (let x = -3; x <= 3.01; x += 1.25) figs.push([x, y, -8 - 6.3 - 6.15, 0.7, 1.95, 0.3, Math.PI]);
  }
  f.add(figureRow(figs, Sd, { poses: ['mirror', 'standing', 'thorn', 'dancer', 'chauri', 'mirror', 'seated', 'dancer', 'thorn'] }));
  addDetails(f, g);
  return { group: g, focus: f, view: [1.0, 0.35, 0.9] };
}

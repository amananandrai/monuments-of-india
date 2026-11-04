import * as THREE from 'three';
import { mat, mesh, at, onFace } from '../helpers.js';
import { mouldings, templeNiche, idol, pilasters, mergeByMaterial } from './components.js';
import { scatter } from './realism.js';
import { horse } from './animals.js';

// Kedarnath, finer detail. From photographs: the grey stone sanctum stands on moulded courses, with
// a niche and image in each of its outer faces; pilasters divide the walls of the hall; and amalaka
// stones mark the corners of the spire's storeys. Dimensions follow js/monuments/kedarnath-temple.js:
// the sanctum 12 square from y 2 to 11 at z = -9; the hall 14 square at z = 5.
const STONE = mat('#8e8a82', 0.9), STONE_DARK = mat('#6f6b64', 0.9);
function architecture(f) {
  const d = new THREE.Group(), s = at(new THREE.Group(), 0, 2, -9);
  s.add(mouldings(12, 12, [[0, 0.5, 0.25, STONE_DARK], [0.5, 0.35, 0.12], [8.2, 0.4, 0.15, STONE_DARK]], STONE));
  for (const a of [Math.PI, Math.PI / 2, -Math.PI / 2]) s.add(onFace(at(templeNiche(1.6, 3.4, STONE, { figure: idol(2.9, STONE) }), 0, 2.2, 0), a, 6));
  d.add(s);
  const h = at(new THREE.Group(), 0, 2, 5);
  for (const a of [Math.PI / 2, -Math.PI / 2]) h.add(onFace(at(pilasters(13, 4, 0.7, 7.6, 0.15, STONE), 0, 0.1, 0), a, 7));
  h.add(mouldings(14, 14, [[0, 0.45, 0.2, STONE_DARK]], STONE));
  d.add(h);
  const prof = (k) => 1 - 0.5 * Math.pow(k, 1.6), am = new THREE.SphereGeometry(1, 16, 6);
  for (let k = 1; k <= 3; k++) {
    const t = k / 4, wt = 11 * prof(t), y = 11.6 + t * 13, r = wt * 0.085;
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) { const o = mesh(am, STONE, sx * wt * 0.42, y, -9 + sz * wt * 0.42); o.scale.set(r, r * 0.42, r); d.add(o); }
  }
  mergeByMaterial(d);
  f.add(d);
}

// Kedarnath at 3,583 m: the ponies that carry pilgrims up the trek from Gaurikund, waiting on the
// path from the lodges, and snow lying in the hollows of the meadow.
const PONY = mat('#6b4a33', 0.85), SNOW = mat('#f4f6f8', 0.8);
export function addDetails(f, g) {
  architecture(f);
  for (const [x, z, ry] of [[10, 44, 0.2], [12, 50, 0.4], [-11, 58, -0.3], [9, 66, 3.0], [-12, 74, 2.8]]) {
    const p = horse(PONY, { coarse: true });
    p.scale.setScalar(0.4);
    p.position.set(x, 0, z);
    p.rotation.y = ry;
    g.add(p);
  }
  for (const [x, z, r] of scatter(16, [-110, 110, -110, 110], { seed: 5, gap: 14, avoid: [[-50, 50, -40, 110]] }).map(([x, z], i) => [x, z, 3 + (i % 4) * 2])) {
    const s = mesh(new THREE.SphereGeometry(1, 16, 6, 0, Math.PI * 2, 0, Math.PI / 2), SNOW, x, 0.05, z);
    s.scale.set(r, 0.25, r * 0.7);
    g.add(s);
  }
}

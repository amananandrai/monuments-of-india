import * as THREE from 'three';
import { M, mesh, at } from '../helpers.js';
import { templeNiche, idol, medallion, mergeByMaterial } from './components.js';
import { prayerFlags } from './realism.js';
import { lamp } from './doorways.js';

// The Mahabodhi Temple, finer detail. From photographs: the faces of the great tower are covered in
// rows of niches, each under a horseshoe (chaitya) arch and holding a seated Buddha; and the posts of
// the old stone railing carry carved medallions. Dimensions follow js/monuments/mahabodhi-temple.js:
// the tower 15 wide at its foot, 38 high from y = 13 on the profile 1 - 0.66 t; the railing posts
// 1.5 apart on a square of side 36.
function architecture(f) {
  const d = new THREE.Group(), S = M.bodh, ka = new THREE.TorusGeometry(0.62, 0.12, 5, 12, Math.PI * 1.3).rotateZ(-Math.PI * 0.15);
  for (let r = 0; r < 7; r++) {
    const t = 0.04 + r * 0.115, wt = 15 * (1 - 0.66 * t), y = 13 + t * 38, n = r < 3 ? 3 : r < 5 ? 2 : 1;
    for (const a of [0, Math.PI / 2, Math.PI, -Math.PI / 2]) for (let k = 0; k < n; k++) {
      const lat = (k - (n - 1) / 2) * wt * 0.22, o = new THREE.Group();
      o.add(templeNiche(0.9, 1.5, S, { figure: idol(1.25, S), crown: false }), mesh(ka, S, 0, 2.0, 0.12));
      o.position.set(Math.sin(a) * (wt / 2) + Math.cos(a) * lat, y, Math.cos(a) * (wt / 2) - Math.sin(a) * lat);
      o.rotation.y = a;
      d.add(o);
    }
  }
  // Medallions on the railing posts, outward.
  for (let k = -18; k <= 18; k += 1.5) for (const s of [-18, 18]) {
    if (!(s > 0 && Math.abs(k) < 2.5)) { const o = medallion(0.17, S); o.position.set(k, 1.25, s + Math.sign(s) * 0.21); o.rotation.y = s > 0 ? 0 : Math.PI; d.add(o); }
    const o = medallion(0.17, S); o.position.set(s + Math.sign(s) * 0.21, 1.25, k); o.rotation.y = Math.sign(s) * Math.PI / 2; d.add(o);
  }
  mergeByMaterial(d);
  f.add(d);
}

// The Mahabodhi Temple at Bodh Gaya: prayer flags strung across the courtyard, and butter lamps lit
// on the steps.
export function addDetails(f, g) {
  architecture(f);
  for (const [a, b] of [[[0, 30, 0], [-18, 2.6, -18]], [[0, 30, 0], [18, 2.6, -18]], [[0, 30, 0], [-18, 2.6, 18]], [[0, 30, 0], [18, 2.6, 18]], [[-18, 2.6, -18], [0, 18, -28]], [[18, 2.6, -18], [0, 18, -28]]]) f.add(prayerFlags(a, b, { sag: 2, size: 0.45 }));
  for (let k = 0; k < 6; k++) f.add(at(lamp(0.9), -2.2 + k * 0.9, 5, 13.6));
}

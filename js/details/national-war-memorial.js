import * as THREE from 'three';
import { M, mat, box, cyl, surface } from '../helpers.js';
import { frieze, panel, mergeByMaterial } from './components.js';
import { lampPosts, around } from './realism.js';

// The National War Memorial, finer detail. From photographs: the covered gallery of the Veerta
// Chakra is lined on its inner wall with six bronze murals of battle scenes, each in a granite
// frame; each granite tablet of the Tyag Chakra is lettered with names; and the base of the
// obelisk is ringed by a carved bronze band. Dimensions follow js/monuments/national-war-memorial.js:
// the gallery ring r = 42, 4 high; the tablets 2.6 × 2.4 on rings r = 76, 68 and 60.
const BRONZE = frieze(M.bronze), GRANITE = mat('#6f6a66', 0.6), NAMES = surface(mat('#8a8278', 0.55), 'script');
function architecture(f) {
  const d = new THREE.Group();
  for (let k = 0; k < 6; k++) {
    const a = ((k + 0.5) / 6) * Math.PI * 2, x = Math.sin(a) * 41.9, z = Math.cos(a) * 41.9;
    const p = panel(9, 3, 0.25, GRANITE, BRONZE, 0.08);
    p.position.set(x, 0.8, z);
    p.rotation.y = a + Math.PI;
    d.add(p);
  }
  for (const r of [76, 68, 60]) {
    const n = Math.round(r * 1.6);
    for (let k = 0; k < n; k++) {
      const a = (k / n) * Math.PI * 2;
      if (Math.abs(Math.sin(a)) < 0.05 && Math.cos(a) > 0) continue;
      for (const s of [-1, 1]) {
        const t = box(2.2, 1.8, 0.03, NAMES, 0, 0, 0);
        t.position.set(Math.cos(a) * (r + s * 0.315), 0.6, Math.sin(a) * (r + s * 0.315));
        t.rotation.y = -a + Math.PI / 2 + (s < 0 ? Math.PI : 0);
        d.add(t);
      }
    }
  }
  d.add(cyl(1.92, 1.92, 0.6, BRONZE, 0, 2.6, 0, 4).rotateY(Math.PI / 4));
  mergeByMaterial(d);
  f.add(d);
}

// The National War Memorial in Delhi: lamps round the outer path of the Tyag Chakra and the Veerta
// Chakra.
export function addDetails(f, g) {
  architecture(f);
  g.add(lampPosts(around(24, 86)));
}

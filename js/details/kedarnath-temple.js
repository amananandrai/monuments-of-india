import * as THREE from 'three';
import { mat, mesh } from '../helpers.js';
import { scatter } from './realism.js';
import { horse } from './animals.js';

// Kedarnath at 3,583 m: the ponies that carry pilgrims up the trek from Gaurikund, waiting on the
// path from the lodges, and snow lying in the hollows of the meadow.
const PONY = mat('#6b4a33', 0.85), SNOW = mat('#f4f6f8', 0.8);
export function addDetails(f, g) {
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

import * as THREE from 'three';
import { mat, mesh } from '../helpers.js';
import { people, scatter } from './realism.js';
import { horse } from './animals.js';

// Kedarnath at 3,583 m: pilgrims in warm shawls and jackets in front of the temple and along the
// path from the lodges, the ponies that carry many of them up the trek from Gaurikund, and snow
// lying in the hollows of the meadow.
const PONY = mat('#6b4a33', 0.85), SNOW = mat('#f4f6f8', 0.8);
export function addDetails(f, g) {
  f.add(people(scatter(40, [-12, 12, -2, 34], { seed: 3, avoid: [[-8, 8, -2, 17], [-2.5, 2.5, 14, 22]] }).map(([x, z]) => [x, z, z < 17 ? 2 : 0]), { seed: 3, palette: ['#b3262e', '#f08a1c', '#2f5d9a', '#1f2d3d', '#e26a9c', '#6b5a48', '#f4f1ea'] }));
  g.add(people(scatter(30, [-8, 8, 36, 100], { seed: 4 }), { seed: 4, palette: ['#b3262e', '#f08a1c', '#2f5d9a', '#1f2d3d', '#3c8a5a'] }));
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

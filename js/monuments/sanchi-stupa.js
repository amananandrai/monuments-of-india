import * as THREE from 'three';
import { M, mesh, box, cyl, ring, group, onFace, FACES, instBoxes, torana } from '../helpers.js';

export function buildSanchi() {
  const S = M.sanchi, g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  g.add(cyl(44, 44, 0.2, M.grass, 0, 0, 0, 64), cyl(25.5, 25.5, 0.3, M.path, 0, 0, 0, 64));
  // Medhi (drum) with its walkway railing, then the hemispherical anda
  f.add(cyl(18.3, 18.6, 4.3, S, 0, 0, 0, 64), ring(18.2, 1.1, S, 4.3, 64));
  const dome = mesh(new THREE.SphereGeometry(16.5, 64, 24, 0, Math.PI * 2, 0, Math.PI / 2), S, 0, 4.3, 0);
  dome.scale.y = 0.75;
  f.add(dome);
  const top = 4.3 + 16.5 * 0.75 - 0.3;
  for (const x of [-2, -0.67, 0.67, 2]) for (const z of [-2, 2]) f.add(box(0.3, 1.6, 0.3, S, x, top, z), box(0.3, 1.6, 0.3, S, z, top, x));
  for (const y of [0.5, 1.2]) for (const s of [-2, 2]) f.add(box(4.3, 0.25, 0.3, S, 0, top + y, s), box(0.3, 0.25, 4.3, S, s, top + y, 0));
  f.add(cyl(0.15, 0.15, 4.6, S, 0, top, 0, 8));
  [[1.8, 2.0], [1.4, 3.1], [1.0, 4.2]].forEach(([r, y]) => f.add(cyl(r, r, 0.25, S, 0, top + y, 0, 24)));
  // Ground railing (vedika) and the four gateways
  const posts = [];
  for (let k = 0; k < 120; k++) { const a = (k / 120) * Math.PI * 2; posts.push([Math.cos(a) * 22, 0, Math.sin(a) * 22, 0.5, 3, 0.5]); }
  f.add(instBoxes(posts, S));
  for (const y of [0.9, 1.7, 2.5]) f.add(ring(22, 0.35, S, y, 120));
  f.add(ring(22, 0.45, S, 3, 120));
  for (const a of FACES) f.add(onFace(torana(S), a, 23.4));
  return { group: g, focus: f, view: [0.9, 0.32, 1.25] };
}

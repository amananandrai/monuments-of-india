import * as THREE from 'three';
import { M, mesh, box, cyl, group, at, archPanel, hemi, shikhara, rng, instBoxes } from '../helpers.js';

export function buildMahabodhi() {
  const S = M.bodh, g = new THREE.Group(), f = new THREE.Group(), R = rng(11);
  g.add(f);
  g.add(box(80, 0.3, 90, M.path, 0, 0, -6));
  f.add(box(28, 5, 28, S), box(17, 8, 17, S, 0, 5, 0));
  f.add(box(8, 7, 6, S, 0, 5, 11), at(archPanel(3.4, 5, true, M.recess, 0.3), 0, 5, 14));
  const main = shikhara(15, 38, S, (t) => 1 - 0.66 * t, 22);
  f.add(at(main, 0, 13, 0));
  for (const x of [-10.5, 10.5]) for (const z of [-10.5, 10.5]) f.add(at(shikhara(4, 13, S, (t) => 1 - 0.6 * t, 10), x, 5, z));
  // Stone railing around the temple
  const posts = [];
  for (let k = -18; k <= 18; k += 1.5) for (const s of [-18, 18]) posts.push([k, 0, s, 0.4, 2.4, 0.4], [s, 0, k, 0.4, 2.4, 0.4]);
  f.add(instBoxes(posts, S));
  for (const y of [0.8, 1.6]) for (const s of [-18, 18]) f.add(box(36, 0.25, 0.3, S, 0, y, s), box(0.3, 0.25, 36, S, s, y, 0));
  // The Bodhi tree behind the temple, and votive stupas in the courtyard
  f.add(cyl(1.1, 1.7, 10, M.wood, 0, 0, -28, 10));
  for (let i = 0; i < 10; i++) f.add(at(mesh(new THREE.IcosahedronGeometry(5 + R() * 2.5, 1), M.leaf), (R() - 0.5) * 12, 11 + R() * 6, -28 + (R() - 0.5) * 12));
  for (let i = 0; i < 12; i++) {
    const x = (R() < 0.5 ? -1 : 1) * (22 + R() * 12), z = (R() - 0.5) * 60;
    f.add(cyl(1.3, 1.5, 1, S, x, 0, z, 16), at(hemi(1.3, S, 16), x, 1, z), cyl(0.1, 0.1, 1.2, S, x, 2.2, z, 6));
  }
  return { group: g, focus: f, view: [0.95, 0.35, 1.15] };
}

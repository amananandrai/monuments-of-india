import * as THREE from 'three';
import { mat, box, at, barrelVault } from '../helpers.js';
import { trees, shrubs, asiBoard, scatter } from './realism.js';

// Gwalior Fort: the Teli ka Mandir, the tall 8th-century temple with a wagon-vaulted roof, on the
// plateau behind the Man Mandir; neem and scrub over the plateau; and the ASI board.
const SAND = mat('#c9b08a', 0.9), SAND_DARK = mat('#a68d68', 0.9);
export function addDetails(p, g) {
  const H = 36, t = new THREE.Group();
  t.add(box(20, 3, 14, SAND_DARK), box(16, 20, 10, SAND, 0, 3), box(17, 1, 11, SAND_DARK, 0, 23));
  for (let k = 0; k < 4; k++) t.add(box(16 - k * 2, 2.6, 10 - k * 0.8, SAND, 0, 24 + k * 2.6));
  t.add(at(barrelVault(3.2, 9, SAND), 0, 34.4, 0), box(5, 6, 0.4, SAND_DARK, 0, 3, 5.2));
  g.add(at(t, -70, H, -18));
  const top = scatter(50, [-140, 140, -62, 62], { seed: 3, gap: 9 }).filter(([x, z]) => (x / 140) ** 2 + (z / 62) ** 2 < 0.85 && !(Math.abs(x) < 70 && z > 45) && Math.hypot(x + 70, z + 18) > 16);
  g.add(trees(top.slice(0, 22), { kind: 'neem', seed: 4, y: H }), shrubs(top.slice(22).map(([x, z]) => [x, z, 2.4]), { y: H, dry: true, seed: 5 }));
  g.add(asiBoard('Gwalior Fort', 70, 72, 0.6, { y: H }));
}

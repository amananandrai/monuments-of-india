import * as THREE from 'three';
import { mat, mesh, at, onFace, FACES } from '../helpers.js';
import { pilasters, mergeByMaterial } from './components.js';
import { lion } from './animals.js';
import { trees, boats, asiBoard, scatter, along } from './realism.js';

// The Shore Temple, finer detail. From photographs: the walls of the shrines are divided by
// pilasters, rearing lions (vyalas) at the corners of the main shrine on
// its sea side; and the cornice of each
// storey of the two vimanas is lined with kudus, small horseshoe-arched dormers.
// Dimensions follow js/monuments/shore-temple.js: the main shrine 9 square from 1.4 to 7.4 at
// z = -10, its vimana of five storeys 2.8 high; the small shrine 6 square to 5.9 at z = 9.
const GRANITE = mat('#8f8577', 0.95), GRANITE_DARK = mat('#6d655a', 0.95);
function architecture(f) {
  const d = new THREE.Group();
  for (const [w, h, z] of [[9, 6, -10], [6, 4.5, 9]]) for (const a of FACES) {
    const p = onFace(at(pilasters(w - 0.6, w > 7 ? 4 : 3, 0.45, h - 0.3, 0.12, GRANITE), 0, 1.45, 0), a, w / 2);
    p.position.z += z;
    d.add(p);
  }
  const tg = new THREE.TorusGeometry(0.3, 0.08, 4, 10, Math.PI * 1.3).rotateZ(-Math.PI * 0.15);
  for (const [w, tiers, th, y0, z] of [[9, 5, 2.8, 7.4, -10], [6, 4, 2.2, 5.9, 9]]) for (let i = 0; i < tiers - 1; i++) {
    const tw = w * (1 - (0.55 * i) / tiers), n = Math.max(2, Math.floor((tw * 0.6) / 1));
    for (const a of FACES) for (let k = 0; k < n; k++) {
      const o = onFace(mesh(tg, GRANITE, 0, y0 + i * th + th * 0.85, 0), a, (tw + 0.5) / 2 + 0.05, -tw * 0.3 + (k + 0.5) * ((tw * 0.6) / n));
      o.position.z += z;
      d.add(o);
    }
  }
  mergeByMaterial(d);
  f.add(d);
  for (const sx of [-1, 1]) for (const sz of [-1]) {
    const l = lion(0.9, GRANITE_DARK);
    l.position.set(sx * 4.75, 1.4, -10 + sz * 4.75);
    l.rotation.y = Math.atan2(sx, sz);
    f.add(l);
  }
}

// The Shore Temple at Mamallapuram: fishing boats drawn up on the sand and out at sea, casuarina
// and coconut palms behind the beach, and the ASI board.
export function addDetails(f, g) {
  architecture(f);
  g.add(boats(along(7, [60, -28], [100, -20]).map(([x, z], i) => [x, z, 0.3 + i * 0.15]), { y: 0.35, size: 1.6, colours: ['#2f5d9a', '#c2512a', '#f2d23a', '#3c8a5a'] }));
  g.add(boats([[-60, -110, 1.2], [20, -140, 2.2], [90, -120, 0.4], [-130, -150, 2.8]], { y: 0.3, size: 1.8 }));
  g.add(trees([...along(12, [-105, 92], [105, 92]), ...scatter(14, [-105, 105, 60, 95], { seed: 5, gap: 9 })], { kind: 'palm', seed: 5, y: 0.3 }));
  g.add(asiBoard('Shore Temple, Mamallapuram', 30, 40, 0, { y: 0.3, line2: 'WORLD HERITAGE SITE' }));
}

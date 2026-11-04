import * as THREE from 'three';
import { mat, at, onFace, FACES, aroundRect, inst, unitBox } from '../helpers.js';
import { mouldings, frieze, chhajja, bracketGeo, placeAll, templeNiche, mergeByMaterial } from './components.js';
import { boats, lampPosts, along } from './realism.js';

// The Vivekananda Rock Memorial, finer detail. From photographs of the mandapam (built in 1970 in a
// blend of temple styles from across India): its platform is moulded and carved in a band; the
// pillars of its colonnade stand on bases and carry bracket capitals under a deep sloping eave; and
// the small Shripada Mandapam has a niche in each side wall. Dimensions follow
// js/monuments/vivekananda-rock-memorial.js: the platform 34 × 44 from T = 8.8, the colonnade round
// a 22 m square at z = 4 from T + 1.4 to T + 9.4.
const STONE = mat('#c9a98a', 0.85), SHADE = mat('#9c7e62', 0.9);
function architecture(f) {
  const d = new THREE.Group(), T = 8.8, bases = [], caps = [], br = [];
  d.add(at(mouldings(34, 44, [[0.15, 0.4, 0.12, frieze(STONE)], [1.0, 0.4, 0.2]], SHADE), 0, T, 0));
  for (const [x, z, a] of aroundRect(22, 22, 2.6)) {
    bases.push([x, T + 1.4, z + 4, 1.7, 0.5, 1.7]);
    caps.push([x, T + 8.7, z + 4, 1.7, 0.7, 1.7]);
    const o = a + Math.PI;
    br.push([x + Math.sin(o) * 0.6, T + 8.7, z + 4 + Math.cos(o) * 0.6, o]);
  }
  d.add(placeAll(bracketGeo(1.0, 0.9, 0.5), br, SHADE));
  const roof = at(new THREE.Group(), 0, 0, 4);
  for (const a of FACES) roof.add(onFace(at(chhajja(27, 1.6, 0.7, 0.16, SHADE), 0, T + 10.4, 0), a, 13));
  d.add(roof);
  for (const a of [Math.PI / 2, -Math.PI / 2, Math.PI]) {
    const n = onFace(at(templeNiche(1.4, 2.6, STONE), 0, T + 2.2, 0), a, a === Math.PI ? 5 : 6);
    n.position.z += -16;
    d.add(n);
  }
  mergeByMaterial(d);
  f.add(d, inst(unitBox(), bases, SHADE), inst(unitBox(), caps, SHADE));
}

// The Vivekananda Rock Memorial off Kanyakumari: the ferries out from the shore, fishing boats in
// the bay, and lamps along the promenade.
export function addDetails(f, g) {
  architecture(f);
  g.add(boats([[20, 80, 0.2], [-20, 170, 3.3], [30, 260, 0.1]], { y: 0.3, size: 3.4, canopy: true, colours: ['#f4f1ea', '#2f5d9a', '#f4f1ea'] }));
  g.add(boats([[-200, 200, 1.2], [180, 150, 2.4], [260, 300, 0.6], [-260, 280, 2.9]], { y: 0.3, size: 1.8, colours: ['#2f5d9a', '#c2512a', '#f2d23a'] }));
  g.add(lampPosts(along(14, [-200, 362], [200, 362]), { y: 0.3 }));
}

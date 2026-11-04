import * as THREE from 'three';
import { mat, mesh, box, cyl, at, onFace, FACES } from '../helpers.js';
import { frieze, beltCourse, mergeByMaterial } from './components.js';
import { garland } from './realism.js';
import { yaks } from './animals.js';

// Hidimba Devi, finer detail. From photographs: the timber of the walls is carved in bands of
// scrolls and figures; a fringe of carved wooden pendants hangs from the eaves of each of the three
// roofs; and the walls are hung with the horns of ibex and deer, offered by villagers.
// Dimensions follow js/monuments/hidimba-devi-temple.js: the stone walls 11 square from 1.2 to 7.2.
const WOOD = mat('#6d5034', 0.85), HORN = mat('#d8c9a6', 0.6);
function architecture(f) {
  const d = new THREE.Group();
  d.add(beltCourse(11, 11, 6.2, 0.8, 0.06, frieze(WOOD)), beltCourse(11, 11, 1.2, 0.5, 0.12, WOOD));
  // Pendants under the three roofs (eaves 17, 13 and 9.6 wide).
  let y = 7.8;
  const pg = new THREE.CylinderGeometry(0.06, 0.12, 0.7, 6);
  [[17, 3.2, 3.4], [13, 2.8, 3], [9.6, 2.4, 0]].forEach(([w, rh, wh]) => {
    const n = Math.floor(w / 0.6);
    for (const a of FACES) for (let k = 0; k < n; k++) d.add(onFace(mesh(pg, WOOD, 0, y - 0.75, 0), a, w / 2 + 0.1, -w / 2 + (k + 0.5) * (w / n)));
    y += rh * 0.55 + wh;
  });
  // Horns on the walls either side of the door and on the other faces.
  const horn = new THREE.TorusGeometry(0.5, 0.06, 5, 12, Math.PI * 0.8);
  for (const a of FACES) for (const lat of a === 0 ? [-3.4, 3.4] : [-2.8, 0, 2.8]) for (const s of [-1, 1]) {
    const o = mesh(horn, HORN, s * 0.22, 5.4, 0.1);
    o.rotation.z = s > 0 ? -0.2 : Math.PI + 0.2 - Math.PI * 0.8;
    const h = new THREE.Group();
    h.add(o);
    d.add(onFace(h, a, 5.5, lat));
  }
  mergeByMaterial(d);
  f.add(d);
}

// The Hidimba Devi temple in the deodar wood above Manali: yaks in the clearing, and marigolds over
// the carved door.
export function addDetails(f, g) {
  architecture(f);
  f.add(yaks([[13, 16, -0.8], [-14, 18, 0.6]]));
  f.add(garland([-1.4, 5.1, 7.2], [1.4, 5.1, 7.2], { sag: 0.4, strands: 2 }));
}

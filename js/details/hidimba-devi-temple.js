import * as THREE from 'three';
import { M, mat, mesh, box, at, onFace, FACES, surface, photo } from '../helpers.js';
import { frieze, beltCourse, mergeByMaterial } from './components.js';
import { garland } from './realism.js';
import { yaks } from './animals.js';

// Hidimba Devi, finer detail. From photographs: the timber of the walls is carved in bands of
// scrolls and figures; a fringe of carved wooden pendants hangs from the eaves of each of the three
// roofs; and the walls are hung with the horns of ibex and deer, offered by villagers.
// The walls are built in the hill manner, courses of timber laid between the stone; the front is
// faced in carved deodar either side of the door and over it; small framed windows light the
// other three sides; a timber ridge runs down each hip of the three roofs; and the temple stands
// in a stone-flagged court, built against the rock it shelters. Dimensions follow
// js/monuments/hidimba-devi-temple.js: the stone walls 11 square from 1.2 to 7.2.
const CARVED = surface(mat('#6d5034', 0.85), 'frieze'), FLAGS = mat('#8f8b84', 0.95), ROCK = mat('#77746e', 0.95, 0, { flatShading: true });
const WOOD = photo(mat('#6d5034', 0.85), 'timber'), HORN = mat('#d8c9a6', 0.6);
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
  // Timber courses between the stone, and the carved front (the wall's face at z = 5.5).
  for (const yy of [2.5, 3.8, 5.1]) d.add(beltCourse(11, 11, yy, 0.28, 0.05, WOOD));
  for (const x of [-3.3, 3.3]) d.add(box(3.6, 4.5, 0.1, CARVED, x, 1.55, 5.56), box(3.9, 0.25, 0.2, WOOD, x, 6.05, 5.6));
  d.add(box(3, 1.3, 0.1, CARVED, 0, 4.75, 5.56));
  for (const a of [Math.PI / 2, Math.PI, -Math.PI / 2]) for (const lat of [-2.6, 2.6]) {
    d.add(onFace(box(1.1, 1.1, 0.14, WOOD, 0, 3.9, 0), a, 5.52, lat), onFace(box(0.6, 0.6, 0.06, M.recess, 0, 4.15, 0), a, 5.62, lat));
  }
  // The ridges down the hips of each roof.
  let ry = 7.8;
  [[17, 3.2, 3.4], [13, 2.8, 3], [9.6, 2.4, 0]].forEach(([w, rh, wh]) => {
    const apex = new THREE.Vector3(0, ry + rh, 0);
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
      const foot = new THREE.Vector3(sx * w / 2, ry, sz * w / 2), o = mesh(new THREE.BoxGeometry(0.3, 0.22, foot.distanceTo(apex)), WOOD);
      o.position.copy(foot).add(apex).multiplyScalar(0.5);
      o.position.y += 0.08;
      o.lookAt(apex.x, apex.y + 0.08, apex.z);
      d.add(o);
    }
    ry += rh * 0.55 + wh;
  });
  mergeByMaterial(d);
  f.add(d);
  // The flagged court and the rock behind the temple.
  // (Both go beside the framed group, so the home view stays on the temple.)
  const site = f.parent;
  site.add(box(26, 0.1, 30, FLAGS, 0, 0.2, 2));
  const rock = mesh(new THREE.IcosahedronGeometry(3.4, 1), ROCK, 2, 1.6, -9.5);
  rock.scale.set(1.6, 0.8, 1);
  site.add(rock, at(mesh(new THREE.IcosahedronGeometry(1.6, 1), ROCK), -6.5, 0.9, -8.6));
}

// The Hidimba Devi temple in the deodar wood above Manali: yaks in the clearing, and marigolds over
// the carved door.
export function addDetails(f, g) {
  architecture(f);
  f.add(yaks([[13, 16, -0.8], [-14, 18, 0.6]]));
  f.add(garland([-1.4, 5.1, 7.2], [1.4, 5.1, 7.2], { sag: 0.4, strands: 2 }));
}

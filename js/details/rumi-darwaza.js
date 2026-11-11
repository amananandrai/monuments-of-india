import * as THREE from 'three';
import { M, mat, box, cyl, at, guldasta } from '../helpers.js';
import { archRing, archSlab, rosette, merlons, mergeByMaterial } from './components.js';
import { trees, lampPosts, scatter, along } from './realism.js';

// Rumi Darwaza, finer detail. From photographs: the piers either side of the great arch are opened
// in stacked niches, each in a moulded ring; stucco rosettes are set either side of the arch's
// crown; rosettes fill the spandrels of the arcaded wings, which are crested with merlons.
// An octagonal turret stands at each corner of the gate, banded, with a small domed top above the
// springing; and ribs fan out across the hood from the screen to its scalloped rim, one to each
// bud. Dimensions follow js/monuments/rumi-darwaza.js: the gate's piers stand 4 to 8 either side of
// x = 0, faces at z = ±4.5, the springing at H = 10.
const LIME = mat('#e6d8b8', 0.85), LIME_DARK = mat('#cbb994', 0.85);
function architecture(f) {
  const d = new THREE.Group();
  for (const z of [4.5, -4.5]) for (const x of [-6, 6]) for (const y of [0.8, 5.4]) {
    const o = new THREE.Group();
    o.add(archSlab(1.7, 3.6, true, M.recess, 0.03), archRing(1.7, 3.6, true, 0.16, 0.1, LIME_DARK));
    o.position.set(x, y, z);
    if (z < 0) o.rotation.y = Math.PI;
    d.add(o);
  }
  for (const x of [-5.4, 5.4]) d.add(at(rosette(0.6, LIME_DARK, 10), x, 9.4, 4.52));
  for (const s of [-1, 1]) {
    // The wing's cells are 6 apart at x = ±(11 + 6k); a rosette over each pier between them.
    for (let k = 0; k < 3; k++) d.add(at(rosette(0.45, LIME_DARK, 8), s * (14 + 6 * k), 5.7, 2.52));
    d.add(at(merlons(25.6, 0.6, 0.8, 0.3, LIME, 0.6), s * 21, 7.6, 2.4));
  }
  // The corner turrets (the gate is 16 × 9: corners at x = ±8, z = ±4.5).
  for (const x of [-8, 8]) for (const z of [-4.5, 4.5]) {
    d.add(cyl(0.95, 1.1, 12.5, LIME, x, 0, z, 8), at(guldasta(2.4, 0.5, LIME), x, 12.5, z));
    for (const y of [3.4, 7, 10, 12.2]) d.add(cyl(1.22, 1.22, 0.3, LIME_DARK, x, y, z, 8));
  }
  // The hood's ribs, from the screen's ring (r about 4.4) out to the rim (6), one under each bud.
  for (let i = 1; i < 18; i++) {
    const a = Math.PI - (i / 18) * Math.PI, rib = box(0.16, 1.5, 0.1, LIME_DARK, 0, 0, 0);
    rib.position.set(Math.cos(a) * 5.2, 10 + Math.sin(a) * 5.2, 4.55);
    rib.rotation.z = a - Math.PI / 2;
    d.add(rib);
  }
  mergeByMaterial(d);
  f.add(d);
}

// The Rumi Darwaza at Lucknow, with the road still running through the gate: lawns either side with
// neem trees, and lamps.
export function addDetails(f, g) {
  architecture(f);
  g.add(trees(scatter(26, [-95, 95, -75, 75], { seed: 21, gap: 14, avoid: [[-36, 36, -8, 10], [-10, 10, -80, 80]] }), { kind: 'neem', seed: 21 }));
  g.add(lampPosts([...along(8, [-8.5, -75], [-8.5, 75]), ...along(8, [8.5, -75], [8.5, 75])]));
}

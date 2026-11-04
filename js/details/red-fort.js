import * as THREE from 'three';
import { M, box, at, onFace, FACES } from '../helpers.js';
import { archRing, archSlab, panel, frieze, jali, rosette, windowFrame, arcadeScreen, mergeByMaterial } from './components.js';
import { towerDetail, slitRow } from './forts.js';
import { trees, lampPosts, asiBoard, along } from './realism.js';

// The Red Fort, finer detail. From photographs of the Lahori Gate and the walls:
// - the walls have a string course half-way up and a row of loopholes under the merlons, and the
//   round bastions are banded and slit;
// - the gatehouse face is panelled either side of the iwan with blind arches outlined in white
//   marble, rosettes in the spandrels, and a screen of small arches along its top;
// - the octagonal towers either side open in an arched window on each face of their upper storey.
// Dimensions follow js/monuments/red-fort.js: walls 10 thick centred on z = 0, the gate at z = 2.
const Rd = M.red, Rl = M.redLight, Mb = M.marble;
function architecture(f) {
  const d = new THREE.Group();
  for (const [x0, x1] of [[-60, -16], [16, 60]]) {
    const c = (x0 + x1) / 2, len = x1 - x0;
    d.add(box(len, 0.5, 0.25, Rl, c, 9, 5.1), box(len, 0.35, 0.2, Rl, c, 3.2, 5.08));
    d.add(at(slitRow(len - 3, Math.round(len / 3), 13.8, 0.35, 1.2), c, 0, 5));
  }
  for (const x of [-60, 60]) d.add(at(towerDetail(9, 8, 20, Rd, Rl, { n: 12, courses: [0.3, 0.62] }), x, 0, 2));
  // The gatehouse face (z = 11), either side of the 13 m iwan and its frame.
  for (const x of [-12, 12]) for (const y of [1.5, 11.6]) {
    d.add(at(panel(6.4, 9.4, 0.32, Mb, frieze(Rd)), x, y, 11.01));
    d.add(at(archSlab(3.8, 7.2, true, M.recess, 0.05), x, y + 0.9, 11.04), at(archRing(3.8, 7.2, true, 0.3, 0.12, Mb), x, y + 0.9, 11.04));
  }
  for (const x of [-4.4, 4.4]) d.add(at(rosette(0.8, Mb, 10), x, 20.6, 11.1));
  d.add(at(arcadeScreen(31, 1.1, 22, 0.7, 0.8, 0.3, Rl), 0, 24, 10.9));
  for (const x of [-17.5, 17.5]) {
    const t = at(new THREE.Group(), x, 0, 9);
    for (let k = 0; k < 8; k++) t.add(onFace(at(windowFrame(1.3, 3.6, Mb), 0, 18.4, 0), ((k + 0.5) / 8) * Math.PI * 2, 4.04 * Math.cos(Math.PI / 8) + 0.02));
    d.add(t);
  }
  mergeByMaterial(d);
  f.add(d);
}


// The Red Fort, from Netaji Subhash Marg: the neem trees on the strip of lawn along the moat,
// lamps, and the ASI board.
export function addDetails(f, g) {
  architecture(f);
  g.add(trees(along(14, [-140, 18], [140, 18]).filter(([x]) => Math.abs(x) > 20), { kind: 'neem', seed: 16 }));
  g.add(lampPosts([...along(12, [-140, 25.5], [140, 25.5]), ...along(12, [-140, 46.5], [140, 46.5])]));
  g.add(asiBoard('Red Fort Complex', 22, 24, 0, { line2: 'WORLD HERITAGE SITE' }));
}

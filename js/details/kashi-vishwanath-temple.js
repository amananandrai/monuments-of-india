import * as THREE from 'three';
import { M, mat, box, at, onFace, rng } from '../helpers.js';
import { archSlab, archRing, pilasters, mouldings, merlons, jharokha, frieze, mergeByMaterial } from './components.js';
import { umbrellas, boats, along } from './realism.js';

// Kashi Vishwanath, finer detail. Dimensions follow js/monuments/kashi-vishwanath-temple.js: the
// Mandir Chowk on a podium 76 × 60, 8 high, centred on z = -30 (its front at z = 0, the steps
// 40 wide falling from it); arcaded ranges of Chunar sandstone round three sides of the chowk (9
// high on the podium) and along the plaza (7 high, their faces at x = ±21 from z = 11 to 81); the
// gate onto the ghats a block 34 × 12 × 8 centred on z = 84 with a great arch in its river face.
// The podium's faces are cut into blind arches over a moulded base; every range carries a parapet
// of merlons along its court side; and the gate is framed: a moulded ring and pilasters round its
// arch, a jharokha either side, a carved band and cornice, merlons along the top, and the same
// arch on its plaza face. Then the cane umbrellas on the ghats and boats on the river.
const CHUNAR = mat('#d9b48f', 0.85);
const SHADE = mat('#b8906a', 0.9);

// A blind arch aw × ah on a wall at z = 0, from y = 0, in a moulded ring.
const blind = (aw, ah) => new THREE.Group().add(archSlab(aw, ah, true, M.recess, 0.02), at(archRing(aw, ah, true, 0.16, 0.06, SHADE), 0, 0, 0.02));

function podium(d) {
  const p = at(new THREE.Group(), 0, 0, -30);
  p.add(mouldings(76, 60, [[0, 0.5, 0.25, SHADE], [0.5, 0.25, 0.12], [7.2, 0.4, 0.3, SHADE]], CHUNAR));
  // The front either side of the steps, and the two flanks.
  for (const s of [-1, 1]) {
    for (const x of [23, 28, 33]) p.add(onFace(at(blind(3, 5.4), 0, 1, 0), 0, 30, s * x));
    for (let k = 0; k < 11; k++) p.add(onFace(at(blind(3, 5.4), 0, 1, 0), s * Math.PI / 2, 38, -s * (-26 + k * 5.2)));
  }
  d.add(p);
}

// Merlons along the court-side edge of every range's roof.
function parapets(d) {
  const ch = 8;
  d.add(at(merlons(75, 0.7, 0.9, 0.3, CHUNAR), 0, ch + 9.6, -53.2));
  for (const s of [-1, 1]) {
    d.add(at(merlons(52, 0.7, 0.9, 0.3, CHUNAR), s * 31.2, ch + 9.6, -26.3).rotateY(Math.PI / 2));
    d.add(at(merlons(69, 0.7, 0.9, 0.3, CHUNAR), s * 21.2, 7.6, 46).rotateY(Math.PI / 2));
  }
}

function gate(d) {
  const G = at(new THREE.Group(), 0, 0, 84);
  G.add(mouldings(34, 8, [[0, 0.5, 0.25, SHADE], [10.2, 0.7, 0.06, frieze(CHUNAR)], [11.2, 0.5, 0.35, SHADE]], CHUNAR));
  for (const a of [0, Math.PI]) {
    G.add(onFace(at(archRing(10, 10, true, 0.45, 0.4, SHADE), 0, 0.4, 0), a, 4));
    for (const x of [-6.6, 6.6]) G.add(onFace(at(pilasters(0, 1, 0.7, 9.4, 0.18, CHUNAR), 0, 0.5, 0), a, 4, x));
    for (const x of [-10.4, 10.4]) G.add(onFace(at(jharokha(2.6, 3.2, CHUNAR, { trim: SHADE, roofM: SHADE }), 0, 5.6, 0), a, 4, x));
    for (const x of [-10.4, 10.4]) G.add(onFace(at(blind(2.2, 3.4), 0, 0.8, 0), a, 4, x));
    G.add(onFace(at(merlons(25, 0.9, 1.1, 0.4, CHUNAR), 0, 12, 0), a, 3.7));
  }
  // The arch on the plaza face, matching the river face's (js/monuments: archPanel on z = 88).
  G.add(onFace(at(archSlab(10, 10, true, M.recess, 0.3), 0, 0.4, 0), Math.PI, 4));
  d.add(G);
}

export function addDetails(f, g) {
  const d = new THREE.Group();
  podium(d);
  parapets(d);
  gate(d);
  f.add(mergeByMaterial(d));
  const R = rng(5);
  g.add(umbrellas([...along(9, [-52, 107], [52, 107]), ...along(6, [-40, 101], [40, 101])].map(([x, z], i) => [x + (i % 2) * 2, z]), { y: 9 - Math.round((107 - 90) / 3) }));
  const fleet = [];
  for (let i = 0; i < 26; i++) fleet.push([-280 + R() * 560, 124 + R() * 120, R() * 6.28]);
  g.add(boats(fleet, { y: 0.3, size: 1.7, canopy: false, colours: ['#2f5d9a', '#f2d23a', '#c2512a', '#3c8a5a', '#f4f1ea'] }));
  g.add(boats(along(6, [-50, 120], [50, 120]).map(([x, z], i) => [x, z, Math.PI / 2 + i * 0.1]), { y: 0.3, size: 1.5 }));
}

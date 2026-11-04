import * as THREE from 'three';
import { M, mat, box, cyl, at, onFace, curvedBand } from '../helpers.js';
import { archRing, archSlab, panel, frieze, jali, merlons, chhajja, rosette, windowFrame, mergeByMaterial } from './components.js';
import { towerDetail } from './forts.js';
import { trees, shrubs, lampPosts, asiBoard, fountains, along } from './realism.js';

// Agra Fort, finer detail. From photographs of the fort:
// - the red sandstone walls have a string course and a row of loopholes under the merlons, and the
//   round bastions are banded, with slits in rings;
// - the Amar Singh Gate's face is panelled either side of its great iwan with blind arches framed
//   in white marble, rosettes in the spandrels, and merlons along its top; its octagonal towers are
//   banded and slit;
// - the Khas Mahal's marble pavilions open in cusped arches with a carved dado below and a sloping
//   eave above; the octagonal Musamman Burj is screened with jali on every face under an eave;
// - the Diwan-i-Am's front is a row of cusped arches on its columns under a parapet.
// Dimensions follow js/monuments/agra-fort.js.
const MOAT = mat('#5f7a45', 0.95);
const Rd = M.red, Rl = M.redLight, Mb = M.marble;

function architecture(f) {
  const d = new THREE.Group(), R = 125;
  // The walls: a string course and loopholes along the outer face, either side of the gate.
  const arc = (k0, k1) => { const a = []; for (let k = k0; k <= k1; k++) { const t = (k / 60) * Math.PI; a.push([Math.cos(t) * R, Math.sin(t) * R, Math.cos(t), Math.sin(t)]); } return a; };
  for (const [k0, k1] of [[0, 42], [44, 60]]) {
    d.add(curvedBand(arc(k0, k1), 2.98, 3.45, 11.4, 12.1, Rl), curvedBand(arc(k0, k1), 2.98, 3.3, 19.2, 19.9, Rl));
    for (let k = k0; k < k1; k++) {
      const t = ((k + 0.5) / 60) * Math.PI;
      d.add(onFace(box(0.35, 1.1, 0.05, M.recess, 0, 16.6, 0), Math.atan2(Math.cos(t), Math.sin(t)), R + 3.01));
    }
  }
  for (let k = 1; k < 6; k++) {
    const t = (k / 6) * Math.PI;
    d.add(at(towerDetail(8, 7, 22, Rd, Rl, { n: 10, seg: 20 }), Math.cos(t) * (R + 2), 0, Math.sin(t) * (R + 2)));
  }
  // The Amar Singh Gate, in its own frame.
  const ta = Math.PI * 0.72, gate = new THREE.Group();
  gate.position.set(Math.cos(ta) * (R + 4), 0, Math.sin(ta) * (R + 4));
  gate.rotation.y = Math.PI / 2 - ta;
  for (const x of [-9, 9]) for (const y of [2.2, 12.6]) {
    gate.add(at(panel(5.6, 8.8, 0.32, Mb, frieze(Rd)), x, y, 8.01));
    gate.add(at(archSlab(3.4, 6.6, true, M.recess, 0.05), x, y + 0.9, 8.04), at(archRing(3.4, 6.6, true, 0.28, 0.12, Mb), x, y + 0.9, 8.04));
  }
  for (const x of [-3.3, 3.3]) gate.add(at(rosette(0.7, Mb, 10), x, 17.6, 8.1));
  gate.add(at(merlons(25.6, 0.9, 1.2, 0.5, Rd, 0.35), 0, 25, 7.9));
  for (const x of [-15, 15]) gate.add(at(towerDetail(5, 4.6, 28, Rd, Mb, { seg: 8, courses: [0.3, 0.6, 0.9] }), x, 0, 4));
  d.add(gate);
  // Khas Mahal: cusped arches across each pavilion's front, a carved dado, an eave over them.
  for (const [x, w] of [[-34, 14], [-10, 22], [14, 14]]) {
    const n = Math.round(w / 4.4), p = w / n;
    for (let k = 0; k < n; k++) {
      const cx = x - w / 2 + (k + 0.5) * p;
      if (Math.abs(cx - x) < 2) continue; // the central doorway the builder cuts
      d.add(at(windowFrame(p * 0.62, 4.6, Mb, { screen: jali(Mb) }), cx, 14.2, 11.01));
    }
    d.add(at(panel(w - 0.4, 1.0, 0.12, Mb, frieze(Mb)), x, 13.05, 11.01));
    d.add(at(chhajja(w + 0.8, 1.4, 0.5, 0.14, Mb), x, 19.9, 11));
  }
  // Musamman Burj: a screened window on each face of the octagon.
  const burj = at(new THREE.Group(), 44, 0, 6);
  for (let k = 0; k < 8; k++) burj.add(onFace(at(windowFrame(2.6, 7, Mb, { screen: jali(Mb) }), 0, 14, 0), ((k + 0.5) / 8) * Math.PI * 2, 7 * Math.cos(Math.PI / 8) + 0.01));
  d.add(burj);
  // Diwan-i-Am: a cusped arch between each pair of columns on its long front, and a parapet.
  for (let k = 0; k < 12; k++) {
    const x = -23 + k * 4;
    d.add(at(archRing(2.6, 7.4, true, 0.3, 0.2, M.lime, false), x, 1.2, 72));
  }
  d.add(at(merlons(53, 0.7, 0.9, 0.3, M.lime, 0.4), 0, 10.6, 73.6));
  mergeByMaterial(d);
  f.add(d);
}

// Agra Fort: the moat that still rings the land walls (dry and grassed, with a little water in its
// bed), the causeway over it to the Amar Singh Gate and the road up to it, lit by heritage lamps,
// and the Anguri Bagh, the formal garden of square beds and fountains below the Khas Mahal.
export function addDetails(f, g) {
  architecture(f);
  const R = 125, arc = [];
  for (let k = 0; k <= 60; k++) { const t = (k / 60) * Math.PI; arc.push([Math.cos(t) * R, Math.sin(t) * R, Math.cos(t), Math.sin(t)]); }
  g.add(curvedBand(arc, 12, 26, 0.02, 0.3, MOAT), curvedBand(arc, 17, 21, 0.04, 0.34, M.river));
  // The causeway across the moat to the gate, and the road beyond
  const ta = Math.PI * 0.72, c = Math.cos(ta), s = Math.sin(ta), ry = Math.PI / 2 - ta;
  g.add(at(box(9, 0.6, 30, M.path), c * 148, 0, s * 148).rotateY(ry));
  f.add(lampPosts(along(6, [c * 140 - s * 6, s * 140 + c * 6], [c * 175 - s * 6, s * 175 + c * 6]).concat(along(6, [c * 140 + s * 6, s * 140 - c * 6], [c * 175 + s * 6, s * 175 - c * 6]))));
  f.add(asiBoard('Agra Fort', c * 160 + s * 9, s * 160 - c * 9, ry + Math.PI));
  // Anguri Bagh: four lawns with clipped hedges round a marble fountain, below the Khas Mahal
  for (const x of [-1, 1]) for (const z of [-1, 1]) g.add(box(14, 0.3, 10, M.grass, -10 + x * 8.5, 0, 33 + z * 6.5));
  f.add(box(3, 0.5, 3, M.marble, -10, 0, 33), fountains([[-10, 33], [-10, 22], [-10, 44]], { y: 0.5, h: 1.6 }));
  f.add(shrubs([...along(10, [-27, 25], [-27, 41]), ...along(10, [7, 25], [7, 41])].map(([x, z]) => [x, z, 0.9]), { y: 0.3 }));
  // Shade trees in the inner courts
  f.add(trees([[-60, 40], [-75, 70], [60, 40], [72, 72], [-40, 95], [40, 95], [-90, 45], [90, 45]], { kind: 'neem', seed: 4 }));
  f.add(trees(along(6, [-30, 82], [30, 82]), { kind: 'ashoka', seed: 5 }));
}

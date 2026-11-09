import * as THREE from 'three';
import { mat, box, at, chhatri, onFace, FACES } from '../helpers.js';
import { frieze, beltCourse, pilasters, jharokha, windowFrame, chhajja, mergeByMaterial } from './components.js';
import { towerDetail } from './forts.js';
import { trees, shrubs, asiBoard, scatter } from './realism.js';
import { H, VS, KS, PP, RAMPOL, rimZ } from '../monuments/chittorgarh-fort.js';

// Chittorgarh, finer detail. From photographs of the Vijay Stambh: every storey is carved all
// over, with a frieze under its cornice and pilasters at its corners framing the arched niches, and
// balconies (jharokhas) on the upper storeys; the Kirti Stambh is carved the same way. The towers of
// the Ram Pol are banded and slit, and Padmini's palace has arched windows under an eave.
// Dimensions follow js/monuments/chittorgarh-fort.js: the plateau top at H, the places at VS, KS, PP
// and RAMPOL.
const STONE_ = mat('#c8b28c', 0.9), RUIN_ = mat('#a8916d', 0.95);
function architecture(f) {
  const d = new THREE.Group();
  // Vijay Stambh at VS: nine storeys 3.6 high from y = 3, w = 10 - 0.25 i.
  const vs = at(new THREE.Group(), VS[0], H, VS[1]);
  for (let i = 0; i < 9; i++) {
    const w = 10 - i * 0.25, y = 3 + i * 3.6;
    vs.add(beltCourse(w, w, y + 2.75, 0.45, 0.06, frieze(STONE_)));
    vs.add(beltCourse(w, w, y, 0.3, 0.1, RUIN_));
    for (const a of FACES) {
      vs.add(onFace(at(pilasters(w - 0.7, 2, 0.5, 2.7, 0.12, STONE_), 0, y + 0.02, 0), a, w / 2));
      if (i >= 5 && i % 2) for (const s of [-1, 1]) vs.add(onFace(at(jharokha(1.1, 1.5, STONE_, { d: 0.6, trim: RUIN_ }), 0, y + 0.9, 0), a, w / 2 + 0.02, s * (w * 0.3)));
    }
  }
  d.add(vs);
  // Kirti Stambh at KS: six storeys of 3.1 from y = 2, w = 6.2 - 0.3 i.
  const ks = at(new THREE.Group(), KS[0], H, KS[1]);
  for (let i = 0; i < 6; i++) {
    const w = 6.2 - i * 0.3, y = 2 + i * 3.1;
    ks.add(beltCourse(w, w, y + 2.3, 0.4, 0.05, frieze(STONE_)));
    for (const a of FACES) ks.add(onFace(at(windowFrame(0.9, 1.6, STONE_), 0, y + 0.4, 0), a, w / 2));
  }
  d.add(ks);
  // The Ram Pol's towers (fortGate towers r = 3 at x = ±9.35, z = 1.7 in the gate's frame).
  for (const s of [-1, 1]) d.add(at(towerDetail(3.24, 3, 12, STONE_, RUIN_, { n: 8, courses: [], slits: [0.3, 0.75] }), RAMPOL + s * 9.35, H, rimZ(RAMPOL) + 1.7));
  // Padmini's palace (10 × 6 × 8 at PP, from H + 0.6): windows on each face and an eave.
  const pp = at(new THREE.Group(), PP[0], H + 0.6, PP[1]);
  for (const a of FACES) {
    const long = Math.abs(Math.sin(a)) < 0.5, len = long ? 10 : 8, n = long ? 3 : 2;
    for (let k = 0; k < n; k++) pp.add(onFace(at(windowFrame(1.1, 2.4, STONE_, { shape: 'pointed' }), 0, 1.6, 0), a, (long ? 4 : 5) + 0.01, -len / 2 + (k + 0.5) * (len / n)));
    pp.add(onFace(at(chhajja(len + 0.6, 0.9, 0.35, 0.12, STONE_), 0, 5.7, 0), a, long ? 4 : 5));
  }
  d.add(pp);
  mergeByMaterial(d);
  f.add(d);
}

// Chittorgarh: the Kirti Stambh, the older Jain tower of fame, near the east end of the plateau;
// dry scrub and khejri trees over the plateau; and the ASI board.
const STONE = mat('#c8b28c', 0.9), RUIN = mat('#a8916d', 0.95);
export function addDetails(f, g) {
  architecture(f);
  const ks = KS;
  let y = H;
  f.add(box(9, 2, 9, STONE, ks[0], y, ks[1]));
  y += 2;
  for (let i = 0; i < 6; i++) { const w = 6.2 - i * 0.3; f.add(box(w, 3.1, w, STONE, ks[0], y, ks[1]), box(w + 1, 0.3, w + 1, RUIN, ks[0], y + 2.8, ks[1])); y += 3.1; }
  f.add(at(chhatri(2.4, 4.5, STONE), ks[0], y, ks[1]));
  const plateau = scatter(110, [-300, 300, -55, 55], { seed: 3, gap: 9 }).filter(([x, z]) => (x / 300) ** 4 + (z / 55) ** 4 < 0.8 && Math.hypot(x - VS[0], z - VS[1]) > 12 && Math.hypot(x - PP[0], z - PP[1]) > 26 && Math.hypot(x - KS[0], z - KS[1]) > 10 && !(x > -240 && x < -160 && z > -32 && z < 26) && Math.abs(x - RAMPOL) > 14);
  g.add(trees(plateau.slice(0, 44), { kind: 'mango', seed: 4, y: H, h: 7 }), shrubs(plateau.slice(44).map(([x, z]) => [x, z, 2]), { y: H, dry: true, seed: 5 }));
  g.add(asiBoard('Chittorgarh Fort', -96, 250, 0, { line2: 'HILL FORTS OF RAJASTHAN' }));
}

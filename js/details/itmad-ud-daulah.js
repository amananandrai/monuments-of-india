import * as THREE from 'three';
import { M, mat, box, cyl, at, onFace, FACES } from '../helpers.js';
import { chhajja, railing, panel, jali, bracketGeo, placeAll, alongFace, mergeByMaterial } from './components.js';
import { trees, shrubs, boats, asiBoard, fountains, scatter, along } from './realism.js';

// Itmad-ud-Daulah, finer detail. From photographs: the walls between the arches are inlaid with
// panels of coloured stone; a deep eave on brackets runs round the tomb under a pierced marble
// parapet; the octagonal corner towers are banded and inlaid; the upper pavilion is screened with
// jali on all four sides. Dimensions follow js/monuments/itmad-ud-daulah.js: base B = 3.5, the tomb
// 22 square and 8 high, towers r = 2 at the corners.
const INLAY_ = [mat('#b08560', 0.5), mat('#8a9c74', 0.5)];
function architecture(f) {
  const d = new THREE.Group(), B = 3.5, s = 11, Mb = M.marble, Sh = M.marbleShade;
  for (const a of FACES) {
    for (const lat of [-3, 3, -9.1, 9.1]) d.add(onFace(at(panel(1.5, 5.4, 0.16, Mb, INLAY_[Math.abs(lat) > 5 ? 1 : 0]), 0, B + 1, 0), a, s + 0.01, lat));
    d.add(onFace(at(chhajja(17.6, 1.3, 0.5, 0.12, Mb), 0, B + 8.05, 0), a, s));
    d.add(placeAll(bracketGeo(0.7, 1.0, 0.22), alongFace(a, s, 17, 9, B + 7.55), Sh));
    d.add(onFace(at(railing(17.4, 1.1, 0.22, Mb, 1.7), 0, B + 8.6, 0), a, s - 0.3));
  }
  for (const x of [-s, s]) for (const z of [-s, s]) {
    for (const y of [B + 4, B + 8.1]) d.add(cyl(2.12, 2.12, 0.3, Sh, x, y, z, 8));
    const t = at(new THREE.Group(), x, B, z);
    for (let k = 0; k < 8; k++) t.add(onFace(at(panel(0.9, 2.6, 0.1, Mb, INLAY_[k % 2]), 0, 0.8, 0), ((k + 0.5) / 8) * Math.PI * 2, 2.08 * Math.cos(Math.PI / 8) + 0.01));
    d.add(t);
  }
  // The upper pavilion (10 square, B + 8.6 to B + 13.1): screens on the three sides the builder
  // left plain.
  for (const a of [Math.PI / 2, Math.PI, -Math.PI / 2]) {
    d.add(onFace(box(6, 3, 0.04, M.recess, 0, B + 9.3), a, 5.02), onFace(box(5.96, 2.96, 0.06, jali(Mb), 0, B + 9.32), a, 5.09));
    d.add(onFace(at(panel(6.5, 3.5, 0.25, Sh, null), 0, B + 9.05, 0), a, 5.0));
  }
  mergeByMaterial(d);
  f.add(d);
}

// Itmad-ud-Daulah, the "Baby Taj" on the Yamuna: fountains in the four water channels, hedges and
// trees in the garden squares, and boats on the river behind.
export function addDetails(f, g) {
  architecture(f);
  const jets = [];
  for (const s of [-1, 1]) jets.push(...along(3, [0, 20 + s * 32], [0, 20 + s * 66]), ...along(3, [s * 32, 20], [s * 66, 20]));
  g.add(fountains(jets, { y: 0.35, h: 1.5 }));
  const sq = scatter(28, [-70, 70, -50, 92], { seed: 3, gap: 11 }).filter(([x, z]) => Math.abs(x) > 6 && Math.abs(z - 20) > 6 && (Math.abs(x) > 28 || Math.abs(z) > 30));
  g.add(trees(sq, { kind: 'neem', seed: 3 }), shrubs([...along(10, [-4.5, 50], [-4.5, 92]), ...along(10, [4.5, 50], [4.5, 92])].map(([x, z]) => [x, z, 0.9]), { seed: 4 }));
  g.add(boats([[-120, -120, 0.3], [60, -140, 1.9], [150, -100, 2.6]], { y: 0.3, size: 1.6 }));
  g.add(asiBoard("Itimad-ud-Daulah's Tomb", 8, 92, 0));
}

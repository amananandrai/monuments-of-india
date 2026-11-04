import * as THREE from 'three';
import { mat, box, at, onFace, barrelVault } from '../helpers.js';
import { jharokha, bracketGeo, placeAll, aroundCircle, railingRing, templeNiche, mergeByMaterial } from './components.js';
import { towerDetail } from './forts.js';
import { trees, shrubs, asiBoard, scatter } from './realism.js';

const SAND = mat('#c9b08a', 0.9), SAND_DARK = mat('#a68d68', 0.9);

// Gwalior Fort, finer detail. From photographs of the Man Mandir: below the bands of glazed tiles
// its front is hung with small domed jharokhas between the round towers; each tower is banded, and
// its cupola stands on a balcony carried by a ring of brackets with a pierced railing. The towers of
// the Hathi Pol are banded and slit. Dimensions follow js/monuments/gwalior-fort.js.
function architecture(p) {
  const d = new THREE.Group(), H = 36, z = 62, len = 120;
  for (let k = 0; k < 7; k++) {
    const x = -len / 2 + (k / 6) * len, t = at(new THREE.Group(), x, 0, z);
    t.add(at(towerDetail(4.6, 4.2, 22, SAND, SAND_DARK, { n: 8, courses: [0.3, 0.62], slits: [0.15, 0.46, 0.78] }), 0, H - 2, 0));
    t.add(placeAll(bracketGeo(1.0, 0.75, 0.35), aroundCircle(4.2, 14, H + 20), SAND_DARK));
    t.add(at(railingRing(4.7, 0.8, SAND), 0, H + 20.8, 0));
    d.add(t);
    if (k < 6) for (const u of [0.33, 0.67]) d.add(at(jharokha(2, 2.6, SAND, { d: 1, roof: 'dome', trim: SAND_DARK }), x + u * 20, H + 1.4, z + 0.02));
  }
  const ga = 1.04, hp = new THREE.Group();
  hp.position.set(147 * Math.cos(ga) * 0.985, H, 67 * Math.sin(ga) * 0.985);
  hp.rotation.y = Math.atan2(Math.cos(ga) / 147, Math.sin(ga) / 67);
  for (const s of [-1, 1]) hp.add(at(towerDetail(3.89, 3.6, 22, SAND, SAND_DARK, { n: 8, courses: [0.3, 0.75], slits: [0.15, 0.5, 0.85] }), s * 8.12, 0, 1.84));
  d.add(hp);
  p.add(mergeByMaterial(d));
}

// Gwalior Fort: the Teli ka Mandir, the tall 8th-century temple with a wagon-vaulted roof, on the
// plateau behind the Man Mandir; neem and scrub over the plateau; and the ASI board.
export function addDetails(p, g) {
  architecture(p);
  const H = 36, t = new THREE.Group();
  t.add(box(20, 3, 14, SAND_DARK), box(16, 20, 10, SAND, 0, 3), box(17, 1, 11, SAND_DARK, 0, 23));
  for (let k = 0; k < 4; k++) t.add(box(16 - k * 2, 2.6, 10 - k * 0.8, SAND, 0, 24 + k * 2.6));
  t.add(at(barrelVault(3.2, 9, SAND), 0, 34.4, 0), box(5, 6, 0.4, SAND_DARK, 0, 3, 5.2));
  g.add(at(t, -70, H, -18));
  const top = scatter(50, [-140, 140, -62, 62], { seed: 3, gap: 9 }).filter(([x, z]) => (x / 140) ** 2 + (z / 62) ** 2 < 0.85 && !(Math.abs(x) < 70 && z > 45) && Math.hypot(x + 70, z + 18) > 16);
  g.add(trees(top.slice(0, 22), { kind: 'neem', seed: 4, y: H }), shrubs(top.slice(22).map(([x, z]) => [x, z, 2.4]), { y: H, dry: true, seed: 5 }));
  g.add(asiBoard('Gwalior Fort', 70, 72, 0.6, { y: H }));
}

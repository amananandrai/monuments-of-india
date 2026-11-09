import * as THREE from 'three';
import { mat, mesh, box, at, hemi, onFace } from '../helpers.js';
import { jharokha, bracketGeo, placeAll, aroundCircle, railingRing, mergeByMaterial } from './components.js';
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
  // The wagon-vault crest (a shala, as on a South Indian gopuram): a solid half-cylinder along the
  // temple's length, its gable ends horseshoe arches round a carved face.
  const crest = mesh(new THREE.CylinderGeometry(3.4, 3.4, 9.6, 20, 1, false, 0, Math.PI).rotateZ(Math.PI / 2), SAND);
  t.add(at(crest, 0, 34.4, 0), box(5, 6, 0.4, SAND_DARK, 0, 3, 5.2));
  for (const sx of [-1, 1]) {
    const k = mesh(new THREE.TorusGeometry(3.5, 0.32, 6, 18, Math.PI * 1.3).rotateZ(-Math.PI * 0.15), SAND_DARK, sx * 4.85, 34.4, 0);
    k.rotation.y = Math.PI / 2;
    t.add(k);
  }
  g.add(at(t, -70, H, -18));
  // The Sas-Bahu temples: two Vishnu temples side by side, of which the halls stand, three storeys
  // of pillared galleries under stepped pyramid roofs, the larger and the smaller.
  for (const [x, z, s] of [[110, -24, 1], [136, -30, 0.7]]) {
    const sb = new THREE.Group();
    sb.add(box(26, 2, 26, SAND_DARK));
    for (let k = 0; k < 3; k++) {
      const w = 22 - k * 3, y = 2 + k * 5;
      sb.add(box(w - 4, 4.6, w - 4, SAND, 0, y), box(w + 0.6, 0.5, w + 0.6, SAND_DARK, 0, y + 4.6));
      for (const a of [0, Math.PI / 2, Math.PI, -Math.PI / 2]) for (let i = 0; i < 5; i++) sb.add(onFace(at(box(0.7, 4.6, 0.7, SAND), 0, y, 0), a, w / 2 - 0.6, -w / 2 + 1.2 + (i * (w - 2.4)) / 4));
    }
    for (let k = 0; k < 5; k++) sb.add(box(12 - k * 2, 1.4, 12 - k * 2, SAND, 0, 17 + k * 1.4));
    sb.add(at(hemi(1.4, SAND, 12), 0, 24, 0));
    sb.scale.setScalar(s);
    g.add(at(sb, x, H, z));
  }
  const top = scatter(80, [-240, 240, -62, 62], { seed: 3, gap: 9 }).filter(([x, z]) => (x / 240) ** 2 + (z / 62) ** 2 < 0.85 && !(Math.abs(x) < 80 && z > 45) && Math.hypot(x + 70, z + 18) > 16 && Math.hypot(x - 122, z + 26) > 28);
  g.add(trees(top.slice(0, 34), { kind: 'neem', seed: 4, y: H }), shrubs(top.slice(34).map(([x, z]) => [x, z, 2.4]), { y: H, dry: true, seed: 5 }));
  g.add(asiBoard('Gwalior Fort', 70, 72, 0.6, { y: H }));
}

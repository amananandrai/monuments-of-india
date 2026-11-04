import * as THREE from 'three';
import { mat, at, onFace, surface } from '../helpers.js';
import { templeNiche, idol, mouldings, mergeByMaterial } from './components.js';
import { trees, asiBoard, scatter, along } from './realism.js';

// Nalanda, finer detail. From photographs of Temple 3 (the Sariputta Stupa): its corner towers are
// faced with stucco niches holding images of the Buddha and Bodhisattvas, in two rows; and each of
// its brick terraces ends in a moulded cornice. Dimensions follow js/monuments/nalanda-mahavihara.js:
// the temple at (20, 0, 10), terraces 40 wide stepping in by 6 every 5 m, its towers 7 square at
// (±17, ±17).
const BRICK = surface(mat('#a5553b', 0.95), 'brick'), STUCCO = mat('#c9b79a', 0.9);
function architecture(f) {
  const d = new THREE.Group(), t = at(new THREE.Group(), 20, 0, 10);
  let w = 40;
  for (let i = 0; i < 5; i++) { t.add(mouldings(w, w, [[i * 5 + 4.4, 0.45, 0.2]], BRICK)); w -= 6; }
  for (const x of [-1, 1]) for (const z of [-1, 1]) for (const a of [Math.atan2(x, 0), Math.atan2(0, z)]) {
    const tw = at(new THREE.Group(), x * 17, 0, z * 17);
    for (const y of [1.2, 5]) for (const l of [-1.7, 1.7]) tw.add(onFace(at(templeNiche(1.2, 2.2, STUCCO, { figure: idol(1.9, STUCCO), crown: false }), 0, y, 0), a, 3.5, l));
    t.add(tw);
  }
  d.add(t);
  mergeByMaterial(d);
  f.add(d);
}

// The ruins of Nalanda: the trees of the site park between the monasteries and the great stupa, and
// the ASI board.
export function addDetails(f, g) {
  architecture(f);
  g.add(trees([...along(9, [-110, -95], [110, -95]), ...along(9, [-110, 95], [110, 95]), ...scatter(10, [60, 120, -80, 80], { seed: 5, gap: 14 })], { kind: 'neem', seed: 5 }));
  g.add(asiBoard('Nalanda Mahavihara', -34, 96, Math.PI / 2, { line2: 'WORLD HERITAGE SITE' }));
}

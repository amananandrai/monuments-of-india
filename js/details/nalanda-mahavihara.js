import * as THREE from 'three';
import { M, mat, box, cyl, at, onFace, surface, inst, unitBox, ring } from '../helpers.js';
import { templeNiche, idol, mouldings, mergeByMaterial } from './components.js';
import { trees, asiBoard, scatter, along } from './realism.js';

// Nalanda, finer detail. From photographs of Temple 3 (the Sariputta Stupa): its corner towers are
// faced with stucco niches holding images of the Buddha and Bodhisattvas, in two rows; and each of
// its brick terraces ends in a moulded cornice and is panelled in a row of niches between
// pilasters; the great stair runs between side walls; the towers step in towards their broken tops.
// Each monastery has its brick-lined well in the court, and steps up to its entrance; and a second, smaller temple mound stands south of Temple 3. Dimensions follow js/monuments/nalanda-mahavihara.js:
// the temple at (20, 0, 10), terraces 40 wide stepping in by 6 every 5 m, its towers 7 square at
// (±17, ±17).
const BRICK = surface(mat('#8c5d49', 0.95), 'brick'), STUCCO = mat('#c9b79a', 0.9);
function architecture(f) {
  const d = new THREE.Group(), t = at(new THREE.Group(), 20, 0, 10);
  let w = 40;
  for (let i = 0; i < 5; i++) { t.add(mouldings(w, w, [[i * 5 + 4.4, 0.45, 0.2]], BRICK)); w -= 6; }
  for (const x of [-1, 1]) for (const z of [-1, 1]) for (const a of [Math.atan2(x, 0), Math.atan2(0, z)]) {
    const tw = at(new THREE.Group(), x * 17, 0, z * 17);
    for (const y of [1.2, 5]) for (const l of [-1.7, 1.7]) tw.add(onFace(at(templeNiche(1.2, 2.2, STUCCO, { figure: idol(1.9, STUCCO), crown: false }), 0, y, 0), a, 3.5, l));
    t.add(tw);
  }
  // The terraces' faces: a niche between pilasters every 3.4 m, in a band under each cornice
  // (left out where the great stair meets the front).
  const niches = [], pil = [];
  let tw = 40;
  for (let i = 0; i < 5; i++) {
    const n = Math.floor(tw / 3.4), y = i * 5 + 1.3;
    for (const a of [0, Math.PI / 2, Math.PI, -Math.PI / 2]) for (let k = 0; k < n; k++) {
      const lat = -tw / 2 + (k + 0.5) * (tw / n);
      if (a === 0 && Math.abs(lat) < 6.5) continue;
      const px = 20 + Math.sin(a) * (tw / 2) + Math.cos(a) * lat, pz = 10 + Math.cos(a) * (tw / 2) - Math.sin(a) * lat;
      niches.push([px + Math.sin(a) * 0.02, y, pz + Math.cos(a) * 0.02, 1.3, 2.2, 0.06, a]);
      const ox = Math.cos(a) * (tw / n / 2), oz = -Math.sin(a) * (tw / n / 2);
      pil.push([px + ox + Math.sin(a) * 0.1, i * 5 + 0.6, pz + oz + Math.cos(a) * 0.1, 0.5, 3.6, 0.22, a]);
    }
    tw -= 6;
  }
  const nm = inst(unitBox(), niches, M.recess);
  nm.castShadow = false;
  f.add(nm, inst(unitBox(), pil, BRICK));
  // The stair's side walls, stepping down with it, and the towers' stepped tops.
  for (const sx of [-1, 1]) for (let k = 0; k < 4; k++) t.add(box(1.2, 24 - k * 6 + 1.2, 6.6, BRICK, sx * 5.6, 0, 22.2 + k * 6.6 + 1.1));
  for (const x of [-1, 1]) for (const z of [-1, 1]) t.add(box(7.4, 0.4, 7.4, BRICK, x * 17, 8.6, z * 17), box(5.6, 1.6, 5.6, BRICK, x * 17, 9, z * 17));
  d.add(t);
  // Temple 12, south of Temple 3: a lower brick mound in two terraces with a stair on its east.
  const t12 = at(new THREE.Group(), 34, 0, -72);
  t12.add(box(26, 4, 26, BRICK), box(26.5, 0.4, 26.5, BRICK, 0, 4, 0), box(18, 3.6, 18, BRICK, 0, 4.4, 0), box(18.5, 0.4, 18.5, BRICK, 0, 8, 0), box(9, 2.2, 9, BRICK, 0.6, 8.4, -0.4));
  for (let k = 0; k < 6; k++) t12.add(box(6, (k + 1) * 0.72, 1.2, BRICK, 0, 0, 13 + 7.2 - k * 1.2 - 0.6));
  for (const x of [-1, 1]) for (const z of [-1, 1]) t12.add(box(4, 5.4, 4, BRICK, x * 11.4, 0, z * 11.4));
  d.add(t12);
  // The monasteries (34 m square at x = -78, z = -66 + 44 i, on plinths 1.2 high): a well in each
  // court, steps to the entrance on the west side that faces the temples.
  for (let i = 0; i < 4; i++) {
    const v = at(new THREE.Group(), -78, 0, -66 + i * 44);
    const well = ring(1.3, 0.7, BRICK, 1.3, 16);
    well.position.set(5, well.position.y, 4);
    v.add(well, cyl(1.25, 1.25, 0.1, M.recess, 5, 1.32, 4, 16));
    // (Their top is 5 cm under the plinth's, so the two never share a plane.)
    for (let k = 0; k < 4; k++) v.add(box(0.9, 0.2875 * (4 - k), 5, BRICK, 19 + 0.45 + k * 0.9, 0, 0));
    d.add(v);
  }
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

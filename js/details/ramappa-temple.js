import * as THREE from 'three';
import { mat, at, onFace, starPrism } from '../helpers.js';
import { mouldings, frieze, templeNiche, idol, mergeByMaterial } from './components.js';
import { trees, shrubs, asiBoard, scatter } from './realism.js';

// Ramappa, finer detail. From photographs: the star-shaped platform is carved with a band of
// elephants and scrolls along its edge; the dolerite sanctum stands on moulded courses with images
// in niches on its outer faces; the hall's pillars are lathe-turned, with ringed bases and
// capitals (the bracket figures, madanikas, are carved figures in the builder). Dimensions follow js/monuments/ramappa-temple.js: platform B = 3,
// the sanctum 12 square at z = -10, the hall's pillars 3 apart.
const DOLERITE = mat('#4d4a47', 0.8);
function architecture(f) {
  const d = new THREE.Group(), B = 3;
  d.add(at(starPrism(20, 19.08, 16.55, 0.7, frieze(DOLERITE)), 0, 2.0, -2));
  const s = at(new THREE.Group(), 0, B, -10);
  s.add(mouldings(12, 12, [[0, 0.5, 0.25], [0.5, 0.4, 0.1, frieze(DOLERITE)], [6.2, 0.4, 0.12, frieze(DOLERITE)]], DOLERITE));
  for (const a of [Math.PI, Math.PI / 2, -Math.PI / 2]) s.add(onFace(at(templeNiche(1.5, 3, DOLERITE, { figure: idol(2.6, DOLERITE) }), 0, 1.4, 0), a, 6));
  d.add(s);
  for (let x = -7.5; x <= 7.5; x += 3) for (let z = -1; z <= 13; z += 3.5) for (const y of [B + 0.4, B + 2.5, B + 4.4]) d.add(new THREE.Mesh(new THREE.CylinderGeometry(0.58, 0.58, 0.3, 10), DOLERITE).translateX(x).translateY(y).translateZ(z));
  mergeByMaterial(d);
  f.add(d);
}

// The Ramappa temple at Palampet: trees and flower beds in the walled garden and round the wall,
// and the ASI board (it was made a World Heritage Site in 2021).
export function addDetails(f, g) {
  architecture(f);
  f.add(shrubs(scatter(16, [-36, 36, 18, 36], { seed: 5, gap: 5, avoid: [[-6, 6, 14, 38]] }).map(([x, z]) => [x, z, 0.95]), { flowers: '#7a3d52', seed: 5 }));
  g.add(trees([...scatter(20, [-52, 52, -52, 52], { seed: 6, gap: 12 }).filter(([x, z]) => Math.max(Math.abs(x), Math.abs(z)) > 43)], { kind: 'neem', seed: 6 }));
  g.add(asiBoard('Rudreswara (Ramappa) Temple', 6, 44, 0, { line2: 'WORLD HERITAGE SITE' }));
}

import * as THREE from 'three';
import { M, mat, box, cyl, at, onFace, surface } from '../helpers.js';
import { bracketGeo, placeAll, aroundCircle, mergeByMaterial, windowFrame } from './components.js';
import { trees, asiBoard, scatter, along } from './realism.js';

// The Qutub Minar, finer detail. From photographs and descriptions: under every balcony is a ring
// of stalactite (muqarnas) corbelling, here a deep ring of carved brackets; the first three storeys are girdled by bands of Quranic inscription carved in the red
// sandstone, between the moulded bands the builder makes; small arched doorways open onto each
// balcony. Dimensions follow js/monuments/qutub-minar.js.
const LETTERS = surface(mat('#b86b4f', 0.85), 'script');
function architecture(g) {
  const d = new THREE.Group();
  const tiers = [[7.15, 5.7, 29], [5.7, 4.6, 15], [4.6, 3.6, 11.5], [3.6, 2.95, 8], [2.95, 2.4, 8.5]];
  let y = 1.2;
  tiers.forEach(([rb, rt, h], i) => {
    const r = (t) => rb - (rb - rt) * t;
    if (i < 3) for (const t of [0.12, 0.45, 0.8]) d.add(cyl(r(t) * 1.085 + 0.03, r(t) * 1.085 + 0.03, 0.9, LETTERS, 0, y + h * t - 0.45, 0, 72));
    y += h;
    if (i < 4) {
      const m = i < 3 ? M.redLight : M.marble;
      d.add(placeAll(bracketGeo(1.3, 1.2, 0.32), aroundCircle(rt * 1.04, 36, y - 1.1), m));
      d.add(placeAll(bracketGeo(0.7, 0.7, 0.28), aroundCircle(rt * 1.04, 36, y - 2.3, Math.PI / 36), m));
      // A small doorway onto the balcony from the next storey.
      d.add(onFace(at(windowFrame(0.9, 2, m, { shape: 'pointed', frame: 0.14 }), 0, y + 0.1, 0), (i * 1.3) % (Math.PI * 2), tiers[i + 1][0] * 1.085 + 0.04));
    }
  });
  mergeByMaterial(d);
  g.add(d);
}

// The Qutub complex at Mehrauli: the lawns and paths round the minar, the Iron Pillar of the 4th
// century (7.2 m, and still unrusted) in the court of the Quwwat-ul-Islam mosque with the stumps of
// its colonnades, the great unfinished core of the Alai Minar, and the ASI board.
const IRON = mat('#3a332e', 0.45, 0.6), RUIN = mat('#9a6a4e', 0.95);
export function addDetails(f, g) {
  architecture(f);
  g.add(box(240, 0.15, 220, M.grass, 0, -0.15, 30), box(10, 0.1, 110, M.path, 0, 0, 70), box(110, 0.1, 8, M.path, -40, 0, 18));
  // The mosque court to the north-east, with the Iron Pillar in it
  const court = new THREE.Group(), cols = [];
  court.add(box(56, 0.4, 44, M.path));
  for (let x = -26; x <= 26; x += 4) for (const z of [-20, 20]) cols.push([x, z]);
  for (let z = -16; z <= 16; z += 4) for (const x of [-26, 26]) cols.push([x, z]);
  cols.forEach(([x, z], i) => court.add(cyl(0.5, 0.55, 3 + (i % 5) * 1.1, RUIN, x, 0.4, z, 8)));
  court.add(cyl(0.21, 0.22, 7.2, IRON, 0, 0.4, 0, 16), cyl(0.3, 0.24, 0.5, IRON, 0, 7.6, 0, 16), box(1.6, 0.5, 1.6, M.redLight, 0, 0.1, 0));
  for (const s of [-1, 1]) court.add(box(14, 0.6, 0.15, M.steel, 0, 0.4, s * 7), box(0.15, 0.6, 14, M.steel, s * 7, 0.4, 0));
  g.add(at(court, 46, 0, -36));
  // The Alai Minar: Alauddin Khalji's tower, abandoned at its first storey
  g.add(cyl(13, 14.5, 25, RUIN, -60, 0, -60, 40), box(30, 2, 30, RUIN, -60, 0, -60));
  g.add(trees([...along(6, [-12, 40], [-12, 120]), ...along(6, [12, 40], [12, 120]), ...scatter(14, [-110, 110, 60, 135], { seed: 3, gap: 16, avoid: [[-16, 16, 30, 140]] })], { kind: 'neem', seed: 3 }));
  g.add(asiBoard('Qutb Minar and its Monuments', 8, 122, 0, { line2: 'WORLD HERITAGE SITE' }));
}

import * as THREE from 'three';
import { M, mat, box, cyl, at } from '../helpers.js';
import { trees, people, asiBoard, scatter, along } from './realism.js';

// The Qutub complex at Mehrauli: the lawns and paths round the minar, the Iron Pillar of the 4th
// century (7.2 m, and still unrusted) in the court of the Quwwat-ul-Islam mosque with the stumps
// of its colonnades, the great unfinished core of the Alai Minar, visitors, and the ASI board.
const IRON = mat('#3a332e', 0.45, 0.6), RUIN = mat('#9a6a4e', 0.95);
export function addDetails(f, g) {
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
  g.add(people([...scatter(20, [-14, 14, -14, 14], { seed: 4 }).filter(([x, z]) => Math.max(Math.abs(x), Math.abs(z)) > 11), ...scatter(18, [-4, 4, 20, 120], { seed: 5 }), ...scatter(16, [24, 68, -54, -18], { seed: 6, avoid: [[42, 50, -40, -32]] })], { seed: 4, y: 0 }));
  g.add(asiBoard('Qutb Minar and its Monuments', 8, 122, 0, { line2: 'WORLD HERITAGE SITE' }));
}

import * as THREE from 'three';
import { M, mat, box, cyl, at, onFace, surface, inst, unitBox, rng } from '../helpers.js';
import { idol, mergeByMaterial } from './components.js';
import { trees, prayerFlags, asiBoard, scatter } from './realism.js';
import { deer } from './animals.js';

// The Dhamek Stupa, finer detail. From photographs: the stone drum is girdled by its famous band of
// carving (swastikas, geometric and floral scrolls) between the projecting faces; and each of the
// eight niches once held an image of the Buddha, here a standing figure in each. Dimensions follow
// The brick cylinder above is ringed by projecting courses and rows of the square holes that held
// the scaffolding; a paved path for walking round the stupa lies at its foot inside a low kerb;
// and the monasteries' foundations show the cells that lined their courts. Dimensions follow
// js/monuments/dhamek-stupa.js: the drum r = 14 from 1.2 to 12.2, the faces 1.4 proud at angles
// k π / 4 (their fronts at r 14.7, 5 wide, from y 2 to 11), their niches from y 6 to 8.6.
const BRICK_ = surface(mat('#9c6a4f', 0.95), 'brick'), RUIN_ = mat('#a5553b', 0.95), PAVE = mat('#c9bda6', 0.95);
const STONE = mat('#b8a88e', 0.9), BAND = surface(mat('#b7a48c', 0.9), 'frieze');
function architecture(f) {
  const d = new THREE.Group();
  d.add(cyl(14.05, 14.05, 2.6, BAND, 0, 5.4, 0, 64));
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * Math.PI * 2;
    d.add(onFace(at(idol(2.3, STONE), 0, 6.05, 0), a, 14.72));
    // The face's carving cut deeper: a moulded frame round the niche, a carved pilaster up each
    // edge of the face, a deep band of scrollwork at its head and a second register under the niche.
    for (const [w, h, x, y] of [[3.1, 0.3, 0, 5.7], [3.1, 0.35, 0, 8.6], [0.3, 2.9, -1.4, 5.7], [0.3, 2.9, 1.4, 5.7]]) d.add(onFace(box(w, h, 0.14, STONE, x, y, 0.07), a, 14.7));
    for (const s of [-1, 1]) d.add(onFace(box(0.5, 8.6, 0.2, BAND, s * 2.22, 2.2, 0.1), a, 14.7));
    d.add(onFace(box(4.9, 1.1, 0.22, BAND, 0, 9.7, 0.11), a, 14.7), onFace(box(3.9, 0.5, 0.12, BAND, 0, 4.7, 0.06), a, 14.7));
  }
  // The brick cylinder (r 13.4 at y 12.2 tapering to 12.2 at 43): projecting brick courses, and
  // rows of putlog holes between them, staggered row to row.
  const rAt = (y) => 13.4 - ((y - 12.2) / 31) * 1.2, holes = [];
  for (const y of [15, 21, 27, 33]) d.add(cyl(rAt(y) + 0.14, rAt(y) + 0.16, 0.35, BRICK_, 0, y, 0, 48));
  [17.5, 20, 23.5, 26, 29.5, 32, 35.5].forEach((y, i) => {
    // The cylinder has 40 flat sides: a hole at the middle of every other one, flush with its face.
    for (let k = i % 2; k < 40; k += 2) { const a = ((k + 0.5) / 40) * Math.PI * 2, r = rAt(y) * Math.cos(Math.PI / 40) + 0.005; holes.push([Math.sin(a) * r, y, Math.cos(a) * r, 0.28, 0.28, 0.03, a]); }
  });
  const hm = inst(unitBox(), holes, M.recess);
  hm.castShadow = false;
  f.add(hm);
  // The path round the stupa, paved in stone on a low kerbed base.
  d.add(cyl(22.5, 22.5, 0.3, STONE, 0, 0, 0, 64), cyl(22, 22, 0.06, PAVE, 0, 0.3, 0, 64));
  // The monasteries' foundations (six courts 22 m square): the cells along the inside of each wall.
  const R = rng(9), cells = [];
  for (let i = 0; i < 6; i++) {
    const cx = -70 + (i % 3) * 40, cz = 40 + Math.floor(i / 3) * 34;
    for (let k = -3; k <= 3; k++) for (const s of [-1, 1]) {
      cells.push([cx + k * 3, 0, cz + s * 8.6, 0.5, 0.5 + R() * 0.9, 3.4], [cx + s * 8.6, 0, cz + k * 3, 3.4, 0.5 + R() * 0.9, 0.5]);
    }
    cells.push([cx, 0, cz - 6.9, 16, 0.4 + R() * 0.5, 0.5], [cx, 0, cz + 6.9, 16, 0.4 + R() * 0.5, 0.5], [cx - 6.9, 0, cz, 0.5, 0.4 + R() * 0.5, 14], [cx + 6.9, 0, cz, 0.5, 0.4 + R() * 0.5, 14]);
  }
  f.parent.add(inst(unitBox(), cells, RUIN_));
  mergeByMaterial(d);
  f.add(d);
}

// The Dhamek Stupa at Sarnath, in the deer park (Isipatana) where the Buddha first taught: prayer
// flags strung from the stupa, the deer of the park, ashoka and bodhi trees, and the ASI board.
export function addDetails(f, g) {
  architecture(f);
  for (let k = 0; k < 6; k++) { const a = (k / 6) * Math.PI * 2; f.add(prayerFlags([Math.sin(a) * 12, 40, Math.cos(a) * 12], [Math.sin(a) * 34, 3, Math.cos(a) * 34], { sag: 2.5, size: 0.5 })); }
  g.add(trees(scatter(20, [-100, 100, -95, 95], { seed: 4, gap: 14, avoid: [[-36, 36, -36, 36], [-95, 5, 25, 95]] }), { kind: 'neem', seed: 4 }));
  g.add(trees([[40, -38], [-42, -40]], { kind: 'banyan', seed: 5, h: 14 }));
  g.add(deer(scatter(14, [40, 100, -90, 90], { seed: 6, gap: 4 }).map(([x, z], i) => [x, z, i * 2.3])));
  g.add(asiBoard('Dhamekh Stupa, Sarnath', 24, -40, Math.PI));
}

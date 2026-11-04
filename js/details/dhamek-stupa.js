import * as THREE from 'three';
import { mat, cyl, at, onFace, surface } from '../helpers.js';
import { idol, mergeByMaterial } from './components.js';
import { trees, prayerFlags, asiBoard, scatter } from './realism.js';
import { deer } from './animals.js';

// The Dhamek Stupa, finer detail. From photographs: the stone drum is girdled by its famous band of
// carving (swastikas, geometric and floral scrolls) between the projecting faces; and each of the
// eight niches once held an image of the Buddha, here a standing figure in each. Dimensions follow
// js/monuments/dhamek-stupa.js: the drum r = 14 from 1.2 to 12.2, the faces 1.4 proud at angles
// k π / 4, their niches from y 6 to 8.6.
const STONE = mat('#b8a88e', 0.9), BAND = surface(mat('#b7a48c', 0.9), 'frieze');
function architecture(f) {
  const d = new THREE.Group();
  d.add(cyl(14.05, 14.05, 2.6, BAND, 0, 5.4, 0, 64));
  for (let k = 0; k < 8; k++) d.add(onFace(at(idol(2.3, STONE), 0, 6.05, 0), (k / 8) * Math.PI * 2, 14.72));
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

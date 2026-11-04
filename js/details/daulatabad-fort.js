import * as THREE from 'three';
import { mat, box, at, onFace } from '../helpers.js';
import { bracketGeo, placeAll, aroundCircle, railingRing, windowFrame, mergeByMaterial } from './components.js';
import { towerDetail } from './forts.js';
import { trees, shrubs, asiBoard, scatter } from './realism.js';

// Daulatabad, finer detail. From photographs of the Chand Minar: each of its three balconies rests
// on a ring of carved brackets and is closed by a railing, and each stage opens in small arched
// windows; the glazed tile bands are kept from the builder. The gate's towers are banded and slit,
// and merlons crest the rings of wall up the hill. Dimensions follow js/monuments/daulatabad-fort.js.
const STONE = mat('#8e8172', 0.9), SAND = mat('#c9b48a', 0.85);
function architecture(f) {
  const d = new THREE.Group(), cm = at(new THREE.Group(), 40, 0, 96);
  let y = 2;
  [[3, 2.6, 12], [2.5, 2.1, 9], [2, 1.6, 7]].forEach(([r0, r1, h], i) => {
    for (let k = 0; k < 4; k++) {
      const a = ((k + 0.5) / 4) * Math.PI * 2 + i * 0.4, wy = y + h * 0.3, r = r0 + ((r1 - r0) * 0.45);
      cm.add(onFace(at(windowFrame(0.55, 1.5, STONE, { shape: 'pointed', frame: 0.1 }), 0, wy, 0), a, r + 0.02));
    }
    y += h;
    cm.add(placeAll(bracketGeo(0.9, r1 * 0.55, 0.25), aroundCircle(r1, 12, y - 0.7), STONE));
    cm.add(at(railingRing(r1 * 1.66, 0.9, STONE), 0, y, 0));
  });
  d.add(cm);
  // The gate's towers (r = 3.8, seg 16), in the gate's frame.
  const ga = 1.2, gate = new THREE.Group();
  gate.position.set(Math.cos(ga) * 130, 0, Math.sin(ga) * 130);
  gate.rotation.y = Math.PI / 2 - ga;
  for (const s of [-1, 1]) gate.add(at(towerDetail(4.1, 3.8, 11, STONE, STONE, { n: 8, courses: [], slits: [0.3, 0.72] }), s * (7 + 3.8 * 0.45), 0, 4 - 3.8 * 0.6));
  d.add(gate);
  mergeByMaterial(d);
  f.add(d);
}

// Daulatabad: scrub and thorn trees round the foot of the Devagiri hill and between the outer
// walls, and the ASI board.
export function addDetails(f, g) {
  architecture(f);
  const ring = scatter(70, [-125, 125, -125, 125], { seed: 3, gap: 8 }).filter(([x, z]) => { const r = Math.hypot(x, z); return r > 78 && r < 124 && Math.hypot(x - 40, z - 96) > 12; });
  g.add(trees(ring.slice(0, 30), { kind: 'mango', seed: 4, h: 7 }), shrubs(ring.slice(30).map(([x, z]) => [x, z, 2.2]), { dry: true, seed: 5 }));
  g.add(asiBoard('Daulatabad Fort', 52, 132, 0.6));
}

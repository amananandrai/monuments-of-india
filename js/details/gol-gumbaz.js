import * as THREE from 'three';
import { M, box, at, onFace, FACES } from '../helpers.js';
import { bracketGeo, placeAll, alongFace, windowFrame, merlonGeo, petalRing, mergeByMaterial } from './components.js';
import { trees, shrubs, asiBoard, along } from './realism.js';

// Gol Gumbaz, finer detail. From photographs: the great cornice near the top of the walls projects
// on rows of carved brackets; a parapet of merlons crowns the walls; each storey of the seven-storey
// corner towers opens in an arched window on every face; a lotus ring sits round the foot of the
// dome's finial. Dimensions follow js/monuments/gol-gumbaz.js: base b = 1.5, walls H = 27, s = 23.75.
function architecture(f) {
  const d = new THREE.Group(), b = 1.5, H = 27, s = 23.75, D = M.deccan, Dl = M.deccanLight, list = [];
  for (const a of FACES) {
    d.add(placeAll(bracketGeo(2.2, 1.45, 0.55), alongFace(a, s, 38, 18, b + H - 5.2), Dl));
    for (const p of alongFace(a, s - 0.4, 38, 26, b + H)) list.push(p);
  }
  d.add(placeAll(merlonGeo(1.1, 1.5, 0.5), list, D));
  for (const x of [-s, s]) for (const z of [-s, s]) {
    const t = at(new THREE.Group(), x, b, z);
    for (let i = 0; i < 7; i++) for (let k = 0; k < 8; k++) {
      const a = ((k + 0.5) / 8) * Math.PI * 2;
      if (Math.abs(Math.atan2(Math.sin(a - Math.atan2(x, z)), Math.cos(a - Math.atan2(x, z)))) > Math.PI * 0.55) continue;
      t.add(onFace(at(windowFrame(1.1, 2.6, Dl, { frame: 0.18 }), 0, i * 5 + 1, 0), a, 4.0 * Math.cos(Math.PI / 8) + 0.02));
    }
    d.add(t);
  }
  d.add(at(petalRing(1.6, 14, 2.2, 1.1, 0.55, Dl), 0, b + H + 2.6 + 21.6, 0));
  mergeByMaterial(d);
  f.add(d);
}

// The Gol Gumbaz at Vijayapura: lawns and neem trees in the garden round the platform, and the ASI
// board.
export function addDetails(f, g) {
  architecture(f);
  for (const [x, z, w, d] of [[-45, 0, 26, 110], [45, 0, 26, 110], [0, -45, 60, 26], [0, 45, 60, 26]]) g.add(box(w, 0.3, d, M.grass, x, 0, z));
  g.add(trees([...along(5, [-52, -48], [-52, 48]), ...along(5, [52, -48], [52, 48]), ...along(4, [-36, -54], [36, -54])], { kind: 'neem', seed: 3 }));
  g.add(shrubs([...along(8, [-34, 34], [-34, 56]), ...along(8, [34, 34], [34, 56])].map(([x, z]) => [x, z, 1.2]), { y: 0.3, seed: 4 }));
  g.add(asiBoard('Gol Gumbaz', 9, 56, 0));
}

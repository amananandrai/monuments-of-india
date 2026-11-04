import * as THREE from 'three';
import { mat, box, at } from '../helpers.js';
import { idol, frieze, bracketGeo, placeAll, mergeByMaterial } from './components.js';
import { trees, shrubs, asiBoard, along } from './realism.js';

// Rani ki Vav, finer detail. From photographs: every niche in the stepwell's side walls holds a
// sculpted figure (Vishnu's avatars, apsaras and nagakanyas among the 500 there); carved bands run
// between the tiers of niches; and the pillars of the pavilions spanning the trench carry bracket
// capitals under each beam. Dimensions follow js/monuments/rani-ki-vav.js: the trench 20 wide and 27
// deep, its walls at x = ±10, niches 3.2 apart in rows 4 apart from y = 3.
const SAND = mat('#c8a57c', 0.9), SAND_DARK = mat('#a3825d', 0.9);
function architecture(f) {
  const d = new THREE.Group(), D = 27, W = 20, L = 64, z0 = L / 2;
  for (let row = 0; row < 6; row++) {
    const y = 3 + row * 4;
    if (y > D - 3) continue;
    for (const s of [-1, 1]) {
      for (let k = 0; k < 18; k++) {
        const o = idol(2.1, SAND);
        o.position.set(s * (W / 2 - 0.32), y + 0.12, z0 - 3 - k * 3.2);
        o.rotation.y = -s * Math.PI / 2;
        d.add(o);
      }
      d.add(box(0.1, 0.6, L - 6, frieze(SAND), s * (W / 2 - 0.04), y + 2.8, z0 - 3 - 8.5 * 3.2 + 0));
    }
  }
  const br = [];
  for (const lv of [0.3, 0.55, 0.8]) {
    const z = z0 - lv * (L - 12), floor = D * (1 - lv);
    for (let y = floor + 4; y < D; y += 4) for (const x of [-8, -3, 3, 8]) for (const dz of [-3, 3]) for (const a of [0, Math.PI]) br.push([x, y, z + dz + (a ? -0.45 : 0.45), a]);
  }
  d.add(placeAll(bracketGeo(0.8, 0.6, 0.5), br, SAND_DARK));
  mergeByMaterial(d);
  f.add(d);
}

// Rani ki Vav at Patan: the lawns and neem trees round the well, and the ASI board.
export function addDetails(f, g) {
  architecture(f);
  const D = 27;
  g.add(trees([...along(7, [-40, -45], [-40, 45]), ...along(7, [40, -45], [40, 45])], { kind: 'neem', seed: 6, y: D }));
  g.add(shrubs([...along(10, [-22, -36], [-22, 36]), ...along(10, [22, -36], [22, 36])].map(([x, z]) => [x, z, 1]), { y: D, seed: 7 }));
  g.add(asiBoard('Rani-ki-Vav, Patan', 14, 44, 0, { y: D, line2: 'WORLD HERITAGE SITE' }));
}

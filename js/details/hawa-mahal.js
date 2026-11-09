import * as THREE from 'three';
import { M, box, at } from '../helpers.js';
import { bracketGeo, placeAll, frieze, petalRing, mergeByMaterial } from './components.js';
import { shrubs } from './realism.js';
import { FLOORS, CROWN } from '../monuments/hawa-mahal.js';

// The Hawa Mahal, finer detail. From photographs: each of the windows (jharokhas) of the screen
// projects on a pair of small carved brackets under its sill; the white lime bands along the
// storeys are carved; and a lotus crowns each of the domed kiosks at the top.
// Dimensions follow js/monuments/hawa-mahal.js: storeys [width, height], the front at z = 0.275.
function architecture(f) {
  const d = new THREE.Group(), floors = FLOORS, br = [];
  let y = 0;
  for (const [w, h] of floors) {
    const n = Math.max(3, Math.round(w / 1.5));
    for (let i = 0; i < n; i++) {
      const x = -w / 2 + (i + 0.5) * (w / n);
      for (const s of [-1, 1]) br.push([x + s * 0.24, y + h * 0.18, 0.275, 0]);
    }
    d.add(box(w + 0.32, 0.08, 0.04, frieze(M.lime), 0, y + h - 0.1, 1.02));
    y += h;
  }
  d.add(placeAll(bracketGeo(0.42, 0.3, 0.1), br, M.hawaLight));
  for (const [x, r] of [[0, 1.1], [-3.8, 0.9], [3.8, 0.9]]) d.add(at(petalRing(r * 0.2, 8, r * 0.35, r * 0.2, Math.PI - 0.6, M.hawaLight), x, y + (x ? CROWN.side + 0.88 : CROWN.mid + 1.08), -0.8));
  mergeByMaterial(d);
  f.add(d);
}

// The Hawa Mahal on Jaipur's Badi Chaupar road: flowering bougainvillea at either end of the
// pavement in front of the screen.
export function addDetails(f, g) {
  architecture(f);
  g.add(shrubs([[-26, 3.6, 1.2], [26, 3.6, 1.2]], { flowers: '#d0306f', y: 0.3 }));
}

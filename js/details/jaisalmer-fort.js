import * as THREE from 'three';
import { mat, cyl, at, photo } from '../helpers.js';
import { jharokha, merlonGeo, placeAll, aroundCircle, beltCourse, mergeByMaterial } from './components.js';
import { trees, scatter } from './realism.js';
import { camels as camelHerd } from './animals.js';
import { H, bastions, trikuta } from '../monuments/jaisalmer-fort.js';
import { detail } from '../detail.js';

// Jaisalmer, finer detail. Each of the 99 bastions has a moulded course below its crown and a ring
// of merlons on top; and the Raj Mahal's front over the Dussehra Chowk is hung with tiers of
// jharokhas under curved bangla roofs, as on the havelis of the golden city. Dimensions follow
// js/monuments/jaisalmer-fort.js: the bastions 5.5 in radius from H - 3, 16 m tall; the palace
// 56 × 26 × 22 at pal, its front at pal.z + 11.
const GOLD = photo(mat('#d9a85a', 0.85), 'rubble'), GOLD_DARK = photo(mat('#b8873f', 0.9), 'rubble');
function architecture(f, pal) {
  const d = new THREE.Group(), mg = merlonGeo(1.1, 1.3, 0.6), list = [];
  bastions().forEach(([x, z], k) => {
    const top = H - 3 + 16 + (k % 3) * 0.25;
    d.add(cyl(5.75, 5.75, 0.5, GOLD_DARK, x, H + 9, z, 12));
    for (const [px, py, pz, ry] of aroundCircle(4.9, 11, top, k * 0.3)) list.push([x + px, py, z + pz, ry]);
  });
  d.add(placeAll(mg, list, GOLD));
  // The palace front: tiers of jharokhas (five on desktops, three on phones), a course between each.
  const tiers = detail.low ? 3 : 5;
  for (let r = 0; r < tiers; r++) {
    for (let k = 0; k < 10; k++) d.add(at(jharokha(2.2, 2.8, GOLD, { d: 1.1, trim: GOLD_DARK }), pal.x - 24.3 + k * 5.4, H + 4 + r * 4.4, pal.z + 11.02));
    d.add(beltCourse(56, 22, H + 3 + r * 4.4, 0.35, 0.18, GOLD_DARK).translateX(pal.x).translateZ(pal.z));
  }
  mergeByMaterial(d);
  f.add(d);
}

// Jaisalmer, the golden fort of the Thar: camels in their saddle cloths on the sand below the hill,
// and khejri and kair trees dotting the desert round it.
export function addDetails(f, g, pal) {
  architecture(f, pal);
  g.add(camelHerd([[300, 300, -2.2], [306, 306, -2.0], [-340, 280, 1.1], [-334, 288, 1.3], [430, 60, -1.5], [-440, 40, 0.6]]));
  // (About 25 khejri, low and sparse: the Thar is not an orchard.)
  g.add(trees(scatter(60, [-700, 700, -560, 560], { seed: 3, gap: 30 }).filter(([x, z]) => trikuta(x, z) < 0.2).slice(0, 25), { kind: 'khejri', seed: 3, h: 5 }));
}

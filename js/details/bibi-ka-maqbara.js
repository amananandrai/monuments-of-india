import * as THREE from 'three';
import { M, mat, at, onFace, FACES, guldasta } from '../helpers.js';
import { archRing, petalRing, bracketGeo, placeAll, aroundCircle, mergeByMaterial } from './components.js';
import { iwan } from './mughal.js';
import { trees, lampPosts, asiBoard, fountains, scatter, along } from './realism.js';

// Bibi ka Maqbara, finer detail. Modelled on the Taj Mahal, and detailed the same way (in stucco
// over basalt rather than marble): two storeys of arched alcoves on every chamfer and either side of
// each great iwan, guldastas at the corners of the faces, a blind arcade round the drum, an inverted
// lotus on the dome, and rings of brackets under the minarets' balconies.
// Dimensions follow js/monuments/bibi-ka-maqbara.js: platform P = 5, the tomb's half-width s = 16,
// chamfers c = 5.5, walls H = 18 high; minarets 30 high, r = 1.8, at (±33, ±33).
const PLASTER = mat('#ebe4d6', 0.8);
function architecture(f) {
  const d = new THREE.Group(), P = 5, s = 16, c = 5.5, H = 18, Mb = M.marble, Sh = M.marbleShade;
  for (const a of FACES) {
    const ca = a + Math.PI / 4, cd = (s - c / 2) * Math.SQRT2;
    for (const [y, fill] of [[0.6, 'door'], [9.4, 'jali']]) {
      d.add(onFace(at(iwan(3.8, 6.4, { m: PLASTER, trim: Mb, shade: Sh, depth: 1, frame: 0.7, top: 0.6, fill }), 0, P + y, 0), ca, cd));
      for (const lat of [-8.6, 8.6]) d.add(onFace(at(iwan(2.4, 5.2, { m: PLASTER, trim: Mb, shade: Sh, depth: 0.7, frame: 0.35, top: 0.5, fill }), 0, P + y + 0.5, 0), a, s, lat));
    }
    for (const lat of [-(s - c), s - c]) d.add(onFace(at(guldasta(5, 0.4, PLASTER), 0, P + H + 0.6, 0), a, s - 0.4, lat));
  }
  for (let k = 0; k < 16; k++) d.add(onFace(at(archRing(1.9, 3, true, 0.16, 0.08, Mb), 0, P + H + 0.6, 0), (k / 16) * Math.PI * 2, 8.4));
  d.add(at(petalRing(1.3, 14, 1.9, 0.9, Math.PI - 0.55, Mb), 0, P + H + 4.4 + 8.8 * 1.82, 0));
  // Minaret balconies: helpers.minaret puts them at the top of each of three sections between
  // 0.04 h and 0.8 h, the shaft narrowing 14% over its height.
  for (const x of [-33, 33]) for (const z of [-33, 33]) {
    const m = at(new THREE.Group(), x, P, z);
    for (let i = 1; i <= 3; i++) {
      const y = 30 * 0.04 + ((30 * 0.8 - 30 * 0.04) * i) / 3, rt = 1.8 * (1 - 0.14 * i / 3);
      m.add(placeAll(bracketGeo(0.7, rt * 0.5, 0.18), aroundCircle(rt, 10, y - Math.max(0.3, 1.8 * 0.28)), PLASTER));
    }
    d.add(m);
  }
  mergeByMaterial(d);
  f.add(d);
}

// Bibi ka Maqbara at Aurangabad: fountains down the long water channel from the gateway, cypress
// rows either side of it, and shade trees in the lawns.
export function addDetails(f, g) {
  architecture(f);
  g.add(fountains(along(10, [0, 45], [0, 145]), { y: 0.4, h: 2 }));
  for (const x of [-9, 9]) g.add(trees(along(12, [x, 44], [x, 146]), { kind: 'cypress', seed: x > 0 ? 3 : 4, h: 8 }));
  g.add(trees(scatter(22, [-88, 88, -78, 175], { seed: 5, gap: 13, avoid: [[-42, 42, -42, 42], [-16, 16, 36, 165]] }), { kind: 'neem', seed: 5 }));
  g.add(lampPosts([...along(5, [-6, 60], [-6, 140]), ...along(5, [6, 60], [6, 140])]));
  g.add(asiBoard('Bibi ka Maqbara', 9, 170, 0));
}

import * as THREE from 'three';
import { M, at, cyl, onFace, FACES, guldasta } from '../helpers.js';
import { star, petalRing, merlons, mergeByMaterial } from './components.js';
import { iwan } from './mughal.js';
import { trees, asiBoard, fountains, scatter, along } from './realism.js';

// Humayun's Tomb, finer detail. From photographs and descriptions of the tomb:
// - each main face is a great iwan flanked by two storeys of smaller iwans, as on the chamfers, so
//   the facade reads as arches within arches;
// - six-pointed stars of white marble are inlaid in the red sandstone spandrels of the great iwans;
// - slender pinnacles (guldastas) stand at the corners of the chamfers along the roof line;
// - the drum is ringed by moulded bands, and an inverted lotus crowns the marble dome.
// Dimensions follow js/monuments/humayuns-tomb.js: plinth P = 6.5, the tomb's half-width s = 24,
// chamfers c = 8, walls H = 18 high.
function architecture(f) {
  const d = new THREE.Group(), P = 6.5, s = 24, c = 8, H = 18, Rd = M.red, Mb = M.marble;
  for (const a of FACES) {
    for (const lat of [-12.5, 12.5]) for (const [y, fill] of [[1, 'door'], [10, 'jali']]) {
      d.add(onFace(at(iwan(5, 7.5, { m: Rd, trim: Mb, shade: M.redLight, depth: 1.1, frame: 0.7, top: 0.45, fill }), 0, P + y, 0), a, s, lat));
    }
    for (const x of [-5.6, 5.6]) d.add(onFace(at(star(6, 0.9, Mb), 0, P + 17.9, 0), a, s + 2.42, x));
    d.add(onFace(at(merlons(2 * s - 2 * c - 0.6, 0.8, 1, 0.35, Rd, 0.35), 0, P + H + 0.6, 0), a, s - 0.4));
    for (const lat of [-(s - c), s - c]) d.add(onFace(at(guldasta(4, 0.45, Rd), 0, P + H + 0.6, 0), a, s - 0.5, lat));
  }
  d.add(cyl(12.7, 12.7, 0.45, Rd, 0, P + H + 0.4, 0, 48), cyl(12.75, 12.75, 0.3, Rd, 0, P + H + 2.6, 0, 48));
  d.add(at(petalRing(1.6, 14, 2.2, 1.0, Math.PI - 0.55, Mb), 0, P + H + 5 + 15.1, 0));
  mergeByMaterial(d);
  f.add(d);
}

// Humayun's Tomb: fountains along the water channels that quarter the charbagh, the tall palms and
// shade trees of its squares, and the ASI board.
export function addDetails(f, g) {
  architecture(f);
  const jets = [];
  for (const s of [-1, 1]) jets.push(...along(5, [0, s * 60], [0, s * 130]).map(([x, z]) => [x, z]), ...along(5, [s * 60, 0], [s * 130, 0]));
  g.add(fountains(jets, { y: 0.35, h: 1.8 }));
  const squares = scatter(48, [-136, 136, -136, 136], { seed: 3, gap: 12 }).filter(([x, z]) => Math.abs(x) > 8 && Math.abs(z) > 8 && (Math.abs(x) > 62 || Math.abs(z) > 62));
  g.add(trees(squares.slice(0, 24), { kind: 'palm', seed: 4 }), trees(squares.slice(24), { kind: 'neem', seed: 5 }));
  g.add(asiBoard("Humayun's Tomb", 8, 136, 0, { line2: 'WORLD HERITAGE SITE' }));
}

import * as THREE from 'three';
import { mat, box, at, photo } from '../helpers.js';
import { mergeByMaterial, dentils, gableRoof } from '../parts/components.js';
import { classicalDoor, balustrade, pediment } from '../parts/colonial.js';
import { addDetails, pier, banded, bayWindow } from '../details/knesseth-eliyahoo-synagogue.js';

// The synagogue's brick under lime plaster: white since the restoration of 2019, with the wall
// behind each window sunk as a panel of indigo blue; a low stone base; clay tiles on the roof.
export const BLUE = photo(mat('#2f4c8c', 0.82), 'plaster');
export const WHITE = photo(mat('#f3f1ec', 0.8), 'plaster');
export const BASE = photo(mat('#a29a8b', 0.9), 'blocks');
const TILE = mat('#8c4630', 0.82);

// The measures, shared with js/details/knesseth-eliyahoo-synagogue.js: the hall W wide and D deep,
// its walls H high to the top of the cornice; the pedimented west front faces +z at z = 0, its
// middle bay BW wide standing PR proud. The storeys: a banded ground floor up to G, then two upper
// floors from F1 and F2, each FH high between its band and the next.
export const P = { W: 22, D: 32, H: 15.4, BW: 12.4, PR: 0.8, G: 5.2, F1: 5.6, F2: 10.3, FH: 4.4 };

// One flank, len long, facing +z about x = 0: banded piers and arched windows on the ground floor,
// then two floors of windows in blue panels between panelled piers.
function flank(len, n) {
  const g = new THREE.Group(), { G, F1, F2, FH } = P, pitch = (len - 1) / n;
  for (let k = 0; k <= n; k++) {
    const x = -len / 2 + 0.5 + k * pitch;
    g.add(at(banded(1, G - 0.5, 0.25), x, 0.5, 0), at(pier(1, FH, 0.25), x, F1, 0), at(pier(1, FH, 0.25), x, F2, 0));
  }
  const w1 = bayWindow(1.5, 2.9, pitch - 1), wg = classicalDoor(1.5, 3.3, { m: WHITE, trim: WHITE, fill: 'glass', top: null, depth: 0.2, frame: 0.3 });
  for (let k = 0; k < n; k++) {
    const x = -len / 2 + 0.5 + (k + 0.5) * pitch;
    g.add(at(wg.clone(), x, 1, 0), at(w1.clone(), x, F1 + 0.9, 0), at(w1.clone(), x, F2 + 0.9, 0));
  }
  return g;
}

// Keneseth Eliyahoo Synagogue, Kala Ghoda, Mumbai, built in 1884 by Jacob Elias Sassoon to the
// designs of Gostling and Morris. From photographs: a Neoclassical hall of three storeys, white
// with indigo panels. Its west front is one broad bay between narrow ones: paired fluted piers
// carry a great pediment with a modillion cornice right across the middle bay at the roof, and
// under it a semicircular window of three stained-glass lights fills the two upper floors over
// the entrance porch. The ground floor is banded plaster; on the floors above, paired lights under
// a roundel sit in arched surrounds between panelled piers, down both long sides as well. There is
// no tower: a tiled roof runs back behind the pediment, with a parapet round the rest.
export function buildKnessethEliyahooSynagogue() {
  const g = new THREE.Group(), f = new THREE.Group(), d = new THREE.Group();
  g.add(f);
  const { W, D, H, BW, PR, G, F1, F2, FH } = P, z0 = -D / 2;
  // The stone base, the hall, and the middle bay of the front standing proud.
  d.add(box(W + 0.5, 0.5, D + 0.5, BASE, 0, 0, z0), box(BW + 0.4, 0.5, PR + 0.3, BASE, 0, 0, PR / 2 + 0.1));
  d.add(box(W, H - 0.5, D, WHITE, 0, 0.5, z0), box(BW, H - 0.5, PR, WHITE, 0, 0.5, PR / 2));
  // The band over the ground floor, the one between the upper floors, and the main cornice with
  // its dentils, all round and breaking forward round the middle bay.
  for (const [y, h, p] of [[G, 0.4, 0.3], [F2 - 0.3, 0.3, 0.22], [H - 0.7, 0.3, 0.3], [H - 0.4, 0.4, 0.55]]) {
    d.add(box(W + 2 * p, h, D + 2 * p, WHITE, 0, y, z0));
    // The band between the upper floors stops against the great window's panel.
    if (y !== F2 - 0.3) d.add(box(BW + 2 * p, h, PR + p, WHITE, 0, y, (PR + p) / 2));
    else for (const s of [-1, 1]) d.add(box(1.6 + p, h, PR + p, WHITE, s * (BW / 2 - 0.8 + p / 2), y, (PR + p) / 2));
  }
  for (const s of [-1, 1]) {
    d.add(at(dentils(D, 0.2, 0.22, 0.2, WHITE), s * (W / 2 + 0.3), H - 0.92, z0).rotateY(s * Math.PI / 2));
    d.add(at(dentils((W - BW) / 2, 0.2, 0.22, 0.2, WHITE), s * (W + BW) / 4, H - 0.92, 0.3));
  }
  d.add(at(dentils(BW, 0.2, 0.22, 0.2, WHITE), 0, H - 0.92, PR + 0.3));
  // The pediment over the middle bay, and the tiled roof running back behind it.
  d.add(at(pediment(BW + 1.1, 3.7, 1.3, WHITE, WHITE), 0, H + 0.45, PR + 0.5 - 1.3));
  d.add(at(gableRoof(BW + 0.6, D - 0.6, 3.5, TILE), 0, H, z0 - 0.3));
  // The parapet round the rest of the roof: balusters between piers.
  for (const s of [-1, 1]) {
    d.add(at(balustrade((W - BW) / 2 - 1.4, 1, WHITE), s * ((W + BW) / 4 + 0.35), H, -0.3));
    d.add(at(balustrade(D - 2, 1, WHITE), s * (W / 2 - 0.3), H, z0).rotateY(Math.PI / 2));
    for (const z of [-0.5, -D + 0.5]) d.add(box(1.2, 1.3, 1.2, WHITE, s * (W / 2 - 0.5), H, z), box(1.4, 0.2, 1.4, WHITE, s * (W / 2 - 0.5), H + 1.3, z));
  }
  // The front's narrow side bays: a banded ground floor, panelled piers and a window to each floor.
  const fr = new THREE.Group(), sw = (W - BW) / 2, w1 = bayWindow(1.5, 2.9, sw - 2);
  for (const s of [-1, 1]) {
    for (const x of [W / 2 - 0.5, BW / 2 + 0.5]) fr.add(at(banded(1, G - 0.5, 0.25), s * x, 0.5, 0), at(pier(1, FH, 0.25), s * x, F1, 0), at(pier(1, FH, 0.25), s * x, F2, 0));
    const x = s * (W + BW) / 4;
    fr.add(at(classicalDoor(1.5, 3.3, { m: WHITE, trim: WHITE, fill: 'glass', top: null, depth: 0.2, frame: 0.3 }), x, 1, 0));
    fr.add(at(w1.clone(), x, F1 + 0.9, 0), at(w1.clone(), x, F2 + 0.9, 0));
    // The middle bay's paired fluted piers, through both upper floors, on a banded ground floor.
    fr.add(at(banded(1.5, G - 0.5, 0.25), s * (BW / 2 - 0.75), 0.5, PR));
    for (const y of [F1, F2]) for (const px of [BW / 2 - 0.4, BW / 2 - 1.15]) fr.add(at(pier(0.66, FH, 0.25, true), s * px, y, PR));
  }
  d.add(fr);
  // The two long sides.
  for (const s of [-1, 1]) d.add(at(flank(D, 8), s * W / 2, 0, z0).rotateY(s * Math.PI / 2));
  f.add(mergeByMaterial(d));
  addDetails(f, g);
  // From across the street, the pedimented front and the side along the lane.
  return { group: g, focus: f, view: [0.55, 0.3, 1], zoom: 0.95 };
}

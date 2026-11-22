import * as THREE from 'three';
import { M, mat, at, onFace, box, cyl, sheet, starPrism, planBand } from '../helpers.js';
import { frieze, carved, jali, idol, mergeByMaterial } from '../parts/components.js';
import { figureFrieze } from '../parts/sculpture.js';
import { dravidaDress, dravidaVimana } from '../parts/temples.js';
import { trees, shrubs, asiBoard, lampPosts, along, scatter, benches } from '../parts/realism.js';
import { alongX } from '../monuments/hoysaleswara-temple.js';
import { detail } from '../detail.js';

// Halebidu's soapstone (chloritic schist), grey-green and darkening where it is sheltered.
export const SOAP = mat('#7f7c6c', 0.85);
export const SOAP_DARK = mat('#5f5d51', 0.88);

// J: the platform's height; WH: the walls' height above it. xs: the two shrines' axes; sz: their
// sanctums' centres; hz: the line of the joined halls. PROF: the halls' plan along x, as
// [x, half-depth] (steppedPlan): the two square halls, each with a bay on its front, joined by a
// narrower link.
export const DIMS = {
  J: 1.6, WH: 6.4, xs: [-13, 13], sz: -10.5, hz: 2,
  PROF: [[-23, 6], [-19.5, 8.5], [-6.5, 6], [-3, 4.5], [3, 6], [6.5, 8.5], [19.5, 6], [23, 0]],
};

// Hoysaleswara, finer detail. From photographs: the lower walls are wrapped in eight bands of
// carving running unbroken round every bay and star point: from the bottom, elephants, lions,
// scrolls, horsemen, scrolls again, scenes of the epics, makaras and geese (hamsas); over them a
// band of large images, some 240 gods and goddesses under canopies; and over that, on the halls,
// pierced stone screens up to the eave. The bands are drawn here as carved courses following the
// plan, the elephants and horsemen as figures in relief where the walls run straight.
function architecture(f) {
  const { J, xs, sz, hz, PROF } = DIMS, S = SOAP, d = new THREE.Group();
  const bands = [[0.05, 0.42, 0.16, frieze(S)], [0.5, 0.3, 0.12, frieze(SOAP_DARK)], [0.84, 0.3, 0.14, frieze(S)], [1.18, 0.28, 0.1, frieze(SOAP_DARK)], [1.5, 0.36, 0.08, frieze(S)], [1.9, 0.26, 0.12, frieze(SOAP_DARK)]];
  const hall = alongX(PROF, { cut: 0.9, notches: 3 }, hz);
  bands.forEach(([y, h, p, m], k) => d.add(planBand(hall, J + y + k * 0.002, h, p, m)));
  d.add(planBand(hall, J + 2.3, 1.8, 0.05, carved(S, 'reliefs')), planBand(hall, J + 4.15, 0.18, 0.12, SOAP_DARK));
  d.add(planBand(hall, J + 4.4, 1.6, 0.03, jali(S)));
  for (const x of xs) {
    bands.forEach(([y, h, p, m], k) => d.add(at(starPrism(16, 6.4 + p, 5.4 + p, h, m), x, J + y + k * 0.002 + 0.001, sz)));
    d.add(at(starPrism(16, 6.45, 5.45, 1.8, carved(S, 'reliefs')), x, J + 2.3, sz));
    // A band of images round each star, one on every outer point.
    const ring = at(new THREE.Group(), x, J + 4.3, sz);
    for (let k = 0; k < 16; k++) ring.add(onFace(idol(1.4, S), Math.PI / 2 - (k / 16) * Math.PI * 2, 6.42));
    d.add(ring);
  }
  f.add(mergeByMaterial(d));
  // Elephants and horsemen in relief along the long straight runs of the halls' fronts and backs.
  if (!detail.low) for (const [x0, x1, z, a] of [[-19, -7, hz + 8.5, 0], [7, 19, hz + 8.5, 0], [-2.7, 2.7, hz + 4.5, 0], [-2.7, 2.7, hz - 4.5, Math.PI]]) {
    for (const [y, kinds] of [[0.05, ['elephant']], [1.18, ['horse']]]) {
      const fr = at(figureFrieze(x1 - x0 - 3, y ? 0.28 : 0.42, SOAP, { pitch: y ? 0.45 : 0.55, kinds, back: SOAP_DARK, proud: 0.1 }), (x0 + x1) / 2, J + y, z + (a ? -0.17 : 0.17));
      fr.rotation.y = a;
      f.add(fr);
    }
  }
}

// Halebidu: the lawns of the temple's garden, the small Surya shrine behind the southern Nandi
// pavilion, the ASI museum of sculpture to the south, the great tank of Dorasamudra beyond the
// northern lawn, rain trees and palms, and the ASI board.
export function addDetails(f, g) {
  architecture(f);
  const { hz, xs } = DIMS;
  g.add(box(420, 0.2, 420, M.grass, 0, -0.25, 0), box(90, 0.05, 76, mat('#7d9757', 0.95), 0, -0.1, hz + 6));
  // Paths: round the platform, and from the gate on the east to the pavilions.
  g.add(box(64, 0.06, 44, M.path, 0, 0, hz - 2), box(6, 0.06, 40, M.path, 0, 0, hz + 50));
  for (const x of xs) g.add(box(5, 0.06, 14, M.path, x, 0, hz + 18));
  // The Surya shrine, a small Dravida shrine behind the southern pavilion.
  const s = at(new THREE.Group(), xs[1], 0, hz + 36);
  s.add(box(4.4, 4, 4.4, SOAP), at(dravidaDress(4.4, 4.4, 4, SOAP, { eaveM: SOAP_DARK }), 0, 0, 0), at(dravidaVimana(3.6, 1, 1.6, SOAP, SOAP_DARK, { capScale: 0.38 }), 0, 4.3, 0));
  g.add(s);
  // The site museum, a low building with a verandah, and its yard of sculpture.
  g.add(box(12, 4.5, 30, mat('#e8e0cf', 0.85), 78, 0, 10), box(14, 0.4, 32, mat('#8a3b2a', 0.8), 78, 4.5, 10));
  for (let k = 0; k < 8; k++) g.add(cyl(0.25, 0.25, 4.5, mat('#e8e0cf', 0.85), 71, 0, -3.5 + k * 3.9, 8));
  for (let k = 0; k < 10; k++) g.add(at(idol(1.6, SOAP_DARK), 64, 0.2, -4 + k * 3).rotateY(-Math.PI / 2));
  // The tank of Dorasamudra, north of the temple.
  g.add(sheet(220, 140, M.lake, -60, 0.05, -150), box(220, 0.6, 2, SOAP_DARK, -60, 0, -79));
  g.add(trees([...along(7, [-45, -40], [-45, 46]), ...along(7, [45, -40], [45, 30]), ...scatter(20, [-180, 180, 70, 200], { seed: 4, gap: 14 })], { kind: 'palm', seed: 5 }));
  g.add(trees([...scatter(detail.low ? 6 : 14, [-180, -60, -70, 70], { seed: 6, gap: 16 }), ...scatter(detail.low ? 6 : 14, [60, 180, -70, 30], { seed: 7, gap: 16 })], { kind: 'banyan', seed: 8 }));
  g.add(shrubs([...along(8, [-30, 26], [30, 26])], { size: 1, flowers: '#d9465a' }));
  g.add(benches([[-24, 44], [24, 44], [-24, 60], [24, 60]]));
  g.add(lampPosts([...along(4, [-4, hz + 34], [-4, hz + 68]), ...along(4, [4, hz + 34], [4, hz + 68])]));
  g.add(asiBoard('Hoysaleswara Temple, Halebidu', 8, hz + 60, -0.3, { line2: 'WORLD HERITAGE SITE' }));
}

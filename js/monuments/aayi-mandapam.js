import * as THREE from 'three';
import { mat, box, cyl, at, onFace, FACES, hemi, archWall } from '../helpers.js';
import { column, pediment } from '../parts/colonial.js';
import { addDetails } from '../details/aayi-mandapam.js';

// Aayi Mandapam, Bharathi Park, Puducherry: the white pavilion of about 1854 that marks the tank of
// Aayi, from photographs and descriptions. A square monument some 9 m across on a stepped plinth:
// each face opens in a round arch between pairs of Tuscan columns carrying a full entablature and a
// low pediment; over them an attic block steps in to a moulded cornice, and a small cupola on a
// drum crowns it. Lime plaster, painted white throughout. Faces the four ways; the park's main
// avenue meets it from the south (+z).
export const WHITE = mat('#f4f2ec', 0.75), SHADE = mat('#dcd7cc', 0.85), DARK = mat('#5b5650', 0.9);
export function buildAayiMandapam() {
  const g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  // The plinth: three steps up to a platform 11 m square and 1.2 m high.
  const P = 1.2, W = 8.4, BH = 6.6;
  for (let k = 0; k < 3; k++) f.add(box(13 - k * 0.8, 0.4, 13 - k * 0.8, k % 2 ? SHADE : WHITE, 0, k * 0.4, 0));
  // The pavilion: a square block cut through by an arch on each face, the two arches crossing in a
  // vault in the middle.
  const block = new THREE.Group();
  for (const a of FACES) block.add(onFace(at(archWall(W, BH, 1.4, 3.2, 4.6, false, WHITE), 0, 0, 0), a, W / 2 - 0.7));
  block.add(box(W - 2.6, 0.59, W - 2.6, SHADE, 0, BH - 0.6, 0));
  f.add(at(block, 0, P, 0));
  // Paired columns on each face, on pedestals, carrying an entablature that breaks forward over
  // them, and a pediment above the arch.
  const E = P + BH;
  for (const a of FACES) {
    const face = new THREE.Group();
    for (const s of [-1, 1]) for (const dx of [2.35, 3.35]) {
      face.add(box(0.85, 0.9, 0.85, SHADE, s * dx, 0, 0), at(column(0.3, BH - 0.9, WHITE), s * dx, 0.9, 0));
    }
    face.add(box(W + 1.6, 0.55, 1.3, WHITE, 0, BH, -0.05), box(W + 1.8, 0.18, 1.45, SHADE, 0, BH + 0.55, -0.05), box(W + 2, 0.35, 1.6, WHITE, 0, BH + 0.73, -0.05));
    face.add(at(pediment(4.6, 1.2, 0.8, WHITE, SHADE), 0, BH + 1.08, -0.3));
    f.add(onFace(at(face, 0, P, 0), a, W / 2 + 0.25));
  }
  // The attic: a block stepping in, a cornice, then a drum and a ribbed cupola with a lantern.
  const A = E + 1.08;
  f.add(box(W + 0.4, 1.6, W + 0.4, WHITE, 0, A, 0), box(W + 1, 0.3, W + 1, SHADE, 0, A + 1.6, 0), box(W - 0.6, 0.9, W - 0.6, WHITE, 0, A + 1.9, 0));
  f.add(box(W - 0.2, 0.22, W - 0.2, SHADE, 0, A + 2.8, 0));
  const D = A + 3.02;
  f.add(cyl(2.35, 2.5, 1.5, WHITE, 0, D, 0, 32), cyl(2.6, 2.6, 0.22, SHADE, 0, D + 1.5, 0, 32));
  const dome = at(hemi(2.45, WHITE, 32), 0, D + 1.72, 0);
  dome.scale.y = 0.8;
  f.add(dome, cyl(0.55, 0.65, 0.9, WHITE, 0, D + 3.6, 0, 16), cyl(0.75, 0.75, 0.15, SHADE, 0, D + 4.5, 0, 16), at(hemi(0.6, WHITE, 16), 0, D + 4.65, 0), cyl(0.04, 0.12, 0.9, DARK, 0, D + 5.2, 0, 8));
  addDetails(f, g, { P, W, BH, E, A, D });
  // From the south-east, down the avenue of the park.
  return { group: g, focus: f, view: [0.75, 0.22, 1], zoom: 1.35 };
}

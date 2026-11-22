import * as THREE from 'three';
import { M, mat, box, cyl, at, onFace, finial, chhatri } from '../helpers.js';
import { iwan, arcadeSkin, cellRow, pearDome } from '../parts/mughal.js';
import { mughalChhatri } from '../parts/components.js';
import { addDetails } from '../details/sheikh-chilli-tomb.js';

// The stones of Thanesar: white Makrana marble for the tomb, red sandstone for its terrace and the
// madrasa round the court below.
export const STONE = {
  marble: mat('#f1ede4', 0.45), shade: mat('#cfc6b6', 0.6), red: mat('#a9583c', 0.85), redLight: mat('#bd7153', 0.85),
};

// Sheikh Chilli's Tomb, Thanesar, c. 1650. From photographs: the tomb, an octagon of white marble
// about 12 m across, each face a framed arch, stands on a high terrace of red sandstone whose
// faces are arcaded; a tall drum carries the pear-shaped marble dome, with small marble chhatris
// on four of the eight corners of the roof. A walled court below holds the madrasa, its rooms
// opening in arches onto the court. The terrace faces south; here its stair is at +z.
export const T = 5.2, R = 6.2;
export function buildSheikhChilli() {
  const S = STONE, g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  // The terrace: 34 m square and T high, its four faces arcaded in red sandstone, a buff coping.
  const W = 34, cd = 1.1;
  f.add(box(W - 2 * cd, T, W - 2 * cd, S.red), box(W + 0.6, 0.45, W + 0.6, S.redLight, 0, T - 0.45, 0));
  for (const [a, lat] of [[0, 0], [Math.PI, 0], [Math.PI / 2, 0], [-Math.PI / 2, 0]]) {
    const len = a === 0 || a === Math.PI ? W : W - 2 * cd;
    f.add(onFace(arcadeSkin(len, T - 0.45, cellRow(9, 3.5, 0.5, 2.3, 3.6), cd, S.red, { trim: S.redLight, fill: a === 0 ? 'door' : 'none' }), a, W / 2 - cd, lat));
  }
  // An octagonal kiosk at each corner of the terrace.
  for (const x of [-1, 1]) for (const z of [-1, 1]) f.add(cyl(1.9, 2, 1.2, S.red, x * (W / 2 - 1.2), T, z * (W / 2 - 1.2), 8), at(mughalChhatri(1.7, 4.8, S.red, { domeM: S.marble }), x * (W / 2 - 1.2), T + 1.2, z * (W / 2 - 1.2)));
  // The tomb: a marble plinth, then the octagon (faces R from the centre), with an arch in each face.
  const B = T + 1, H = 8.2, oct = (r, h, m, y) => cyl(r, r, h, m, 0, y, 0, 8).rotateY(Math.PI / 8), k = 1 / Math.cos(Math.PI / 8);
  f.add(box(17, 1, 17, S.marble, 0, T), oct(R * k, H, S.marble, B), oct((R + 0.35) * k, 0.4, S.shade, B + H));
  const side = 2 * R * Math.tan(Math.PI / 8);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    f.add(onFace(at(iwan(side * 0.5, 6.2, { m: S.marble, trim: S.shade, shade: S.shade, depth: 0.5, frame: side * 0.2, top: 1.2, fill: i === 0 ? 'door' : 'jali', cells: false }), 0, B + 0.4, 0), a, R - 0.5));
  }
  // The drum and the dome.
  const Dy = B + H + 0.4, dr = 4.2;
  f.add(oct(dr * 1.02 * k, 3.4, S.marble, Dy), oct(dr * 1.1 * k, 0.35, S.shade, Dy + 3.4));
  f.add(at(pearDome(dr, S.marble), 0, Dy + 3.75, 0), at(finial(3.2, M.gold), 0, Dy + 3.75 + dr * 2.0, 0));
  // Chhatris on four corners of the roof, over the diagonal faces.
  for (let i = 0; i < 4; i++) {
    const a = Math.PI / 4 + (i * Math.PI) / 2, r = R - 0.9;
    f.add(at(chhatri(1.1, 3.4, S.marble), Math.sin(a) * r, Dy, Math.cos(a) * r));
  }
  addDetails(f, g, { T, R, B, H, W, Dy });
  // From the south-east, over the court below the terrace.
  return { group: g, focus: f, view: [0.8, 0.38, 1.15], zoom: 0.95 };
}

import * as THREE from 'three';
import { mat, box, cyl, hemi, hipRoof, at, onFace, finial } from '../helpers.js';
import { arcadeSkin, cellRow, iwan } from '../parts/mughal.js';
import { addDetails } from '../details/jahaz-mahal.js';

// Mandu's stone, laid in lime and plastered, weathered to a warm grey; the darker stone of the
// mouldings, and the dull red of the sandstone used for trim.
export const STONE = { wall: mat('#b8a88d', 0.9), shade: mat('#958670', 0.92), trim: mat('#a8735a', 0.88) };

// Jahaz Mahal, the Ship Palace at Mandu, late 15th century: a long, narrow block about 110 m by
// 15 m on the strip of land between Kapur Talao (+z here) and Munj Talao (-z). From photographs:
// the lower storey is a row of great pointed arches opening into three long halls; the entrance,
// in the middle of the east face, is a projecting porch under a domed kiosk. On the roof terrace
// stand open pavilions, the two at the ends each of three bays, a dome over the middle one and
// pyramid roofs over the bays beside it, with balconies jutting over the water. The north end of
// the terrace holds a pool and its winding channel.
export const L = 110, D = 15, H1 = 8.4;
export function buildJahazMahal() {
  const S = STONE, g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  // A plinth along the shore, and the lower storey: a block with an arcade 1.4 m deep on both long
  // faces, each bay a pointed arch onto the halls behind.
  const cd = 1.4, P = 1.2;
  f.add(box(L + 4, P, D + 3, S.shade, 0, 0, 0), box(L + 4.4, 0.25, D + 3.4, S.wall, 0, P - 0.25, 0));
  f.add(box(L - 2 * cd, H1, D - 2 * cd, S.wall, 0, P, 0), box(L + 0.6, 0.5, D + 0.6, S.shade, 0, P + H1, 0));
  const cells = cellRow(21, 5.1, 0.2, 3.4, 6.4);
  for (const a of [0, Math.PI]) f.add(onFace(at(arcadeSkin(L, H1, cells, cd, S.wall, { trim: S.shade, fill: 'room' }), 0, P, 0), a, D / 2 - cd));
  for (const a of [Math.PI / 2, -Math.PI / 2]) f.add(onFace(at(arcadeSkin(D - 2 * cd, H1, cellRow(2, 5.2, 0.2, 3.4, 6.4), cd, S.wall, { trim: S.shade, fill: 'door' }), 0, P, 0), a, L / 2 - cd));
  // The entrance porch on the east face, its arch framed in red stone, and the domed kiosk over it.
  const Y = P + H1 + 0.5;
  f.add(box(13, H1 + 1.6, 4.4, S.wall, 0, P, D / 2 + 2.2), box(13.6, 0.5, 5, S.shade, 0, P + H1 + 1.6, D / 2 + 2.2));
  f.add(at(iwan(5, 7.6, { m: S.wall, trim: S.trim, shade: S.shade, depth: 1.3, frame: 1.3, top: 0.9, cells: false }), 0, P, D / 2 + 4.4));
  const kz = D / 2 + 2.2, ky = P + H1 + 2.1;
  const k = at(new THREE.Group(), 0, ky, kz - 1.3);
  k.add(box(6, 3.6, 6, S.wall), box(7.6, 0.4, 7.6, S.shade, 0, 3.6, 0));
  for (const a of [0, Math.PI / 2, -Math.PI / 2, Math.PI]) k.add(onFace(arcadeSkin(6, 3.6, [[0, 0, 2.6, 3.2]], 0.5, S.wall, { trim: S.shade, fill: 'room' }), a, 3));
  k.add(cyl(3.1, 3.1, 0.9, S.wall, 0, 4, 0, 24), at(hemi(3.0, S.wall, 28), 0, 4.9, 0), at(finial(1.6, S.shade), 0, 7.8, 0));
  f.add(k);
  // The two end pavilions on the terrace: three bays across the building's width, the middle bay
  // under a dome, the others under stepped pyramid roofs.
  const pav = (x) => {
    const p = at(new THREE.Group(), x, Y, 0), ph = 5.2;
    p.add(box(12, ph, 9, S.wall, 0, 0, 0), box(13.8, 0.4, 10.8, S.shade, 0, ph, 0));
    for (const a of [0, Math.PI]) p.add(onFace(arcadeSkin(13, ph, cellRow(3, 4.2, 0, 3, 4.2), 0.5, S.wall, { trim: S.trim, fill: 'room' }), a, 4.5));
    for (const a of [Math.PI / 2, -Math.PI / 2]) p.add(onFace(arcadeSkin(9, ph, cellRow(2, 4.2, 0, 3, 4.2), 0.5, S.wall, { trim: S.trim, fill: 'room' }), a, 6));
    p.add(cyl(2.6, 2.6, 1.2, S.wall, 0, ph + 0.4, 0, 24), at(hemi(2.5, S.wall, 28), 0, ph + 1.6, 0), at(finial(1.4, S.shade), 0, ph + 4, 0));
    for (const s of [-1, 1]) p.add(at(hipRoof(4.2, 9, 2.2, S.shade), s * 4.4, ph + 0.4, 0));
    return p;
  };
  f.add(pav(-L / 2 + 7.5), pav(L / 2 - 7.5));
  // A smaller open hall a third of the way along each half, and a kiosk on the lake side.
  for (const x of [-26, 26]) {
    const h = at(new THREE.Group(), x, Y, -2);
    h.add(box(10, 4.2, 6, S.wall, 0, 0, 0), box(10.6, 0.4, 7.4, S.shade, 0, 4.2, 0));
    for (const a of [0, Math.PI]) h.add(onFace(arcadeSkin(10, 4.2, cellRow(3, 3.2, 0, 2.4, 3.4), 0.4, S.wall, { trim: S.trim, fill: 'room' }), a, 3));
    h.add(at(hipRoof(9, 6, 1.8, S.shade), 0, 4.6, 0));
    f.add(h);
  }
  addDetails(f, g, { L, D, H1, P, Y });
  // From the south-east across Kapur Talao, the palace long on the water.
  return { group: g, focus: f, view: [0.75, 0.24, 1.3], zoom: 0.72 };
}

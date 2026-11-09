import * as THREE from 'three';
import { M, mat, box, cyl, at, mesh, onionDome, hemi, ribbed, finial, chhatri, guldasta, hipRoof } from '../helpers.js';
import { arcadeSkin } from '../details/mughal.js';
import { classicalDoor, porch } from '../details/colonial.js';
import { rosette, merlons, mergeByMaterial } from '../details/components.js';
import { addDetails } from '../details/laxmi-vilas-palace.js';

// Red sandstone, cream stone, and the blue-grey trap stone that bands it.
const OCHRE = mat('#c2774f', 0.85);
const CREAM = mat('#eadfc6', 0.85);
const TRAP = mat('#55606e', 0.85);

// A range of the palace, w long, h high and d deep, its foot at y = 0: two storeys of arcades 1.6 m
// deep on its front, arched windows on its back, cream courses at the floor and the cornice over a
// band of trap stone, a trap plinth, stucco rosettes over the upper piers, merlons along the
// parapet and guldastas at the bays.
function wing(w, h, d) {
  const g = new THREE.Group(), fine = new THREE.Group(), dd = 1.6, n = Math.floor(w / 5), cells = [], back = [];
  for (let k = 0; k < n; k++) {
    const x = -w / 2 + (k + 0.5) * (w / n);
    cells.push([x, 0.6, 3, h * 0.36, 'room'], [x, h * 0.5 + 1, 3, h * 0.36, 'room']);
    back.push([x, 1.2, 2, h * 0.3, 'room'], [x, h * 0.5 + 1.4, 2, h * 0.3, 'jali']);
    if (k) fine.add(at(rosette(0.45, CREAM, 8), -w / 2 + k * (w / n), h * 0.93, d / 2 + 0.02));
  }
  g.add(box(w, h, d - 2 * dd, OCHRE), at(arcadeSkin(w, h, cells, dd, OCHRE, { trim: CREAM }), 0, 0, d / 2 - dd), at(arcadeSkin(w, h, back, dd, OCHRE, { trim: CREAM, fill: 'room' }), 0, 0, -d / 2 + dd).rotateY(Math.PI));
  g.add(box(w + 0.6, 0.7, d + 0.6, CREAM, 0, h * 0.5), box(w + 0.6, 0.9, d + 0.6, CREAM, 0, h), box(w + 0.4, 0.6, d + 0.4, TRAP, 0, h - 0.6), box(w + 0.5, 0.8, d + 0.5, TRAP, 0, 0));
  fine.add(at(merlons(w - 1, 0.6, 0.8, 0.3, OCHRE, 0.7), 0, h + 0.9, d / 2 - 0.4));
  for (let x = -w / 2; x <= w / 2 + 0.1; x += w / Math.max(2, Math.round(w / 25))) fine.add(at(guldasta(3.2, 0.4, CREAM), x, h + 0.9, d / 2 - 0.4));
  g.add(mergeByMaterial(fine));
  return g;
}

// A gable on a roof, w wide and h high, its face towards +z, standing on y = 0.
function gable(w, h, d, m) {
  const s = new THREE.Shape([[-w / 2, 0], [w / 2, 0], [0, h]].map(([x, y]) => new THREE.Vector2(x, y)));
  return mesh(new THREE.ExtrudeGeometry(s, { depth: d, bevelEnabled: false }).translate(0, 0, -d / 2), m);
}

// Laxmi Vilas, the Gaekwads' palace at Vadodara (1890): Indo-Saracenic, picturesque and
// deliberately asymmetric. From the west: the Durbar Hall under its great dome, the long west wing
// with a domed pavilion, the entrance block and clock tower (off the middle), the shorter and higher
// east wing with gabled dormers, and the tall tower at the east end under a pyramid roof. Two wings
// run back from the front round the courts behind. Positions shared with the details file.
export const DURBAR = [-114, 0], TOWER = [-6, 22], EAST = [84, 0];
export function buildLaxmiVilas() {
  const g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  g.add(box(400, 0.15, 300, M.grass, 0, 0, 40), box(14, 0.25, 150, M.path, -6, 0, 90));
  f.add(at(wing(86, 16, 26), -56, 0, 0), at(wing(40, 22, 34), -6, 0, 6), at(wing(56, 19, 24), 42, 0, 0));
  // Wings running back from the front, round the courts.
  f.add(at(wing(56, 14, 18), -86, 0, -40).rotateY(Math.PI / 2), at(wing(50, 14, 18), 54, 0, -36).rotateY(-Math.PI / 2));
  // The Durbar Hall at the west end: a tall block under a great ribbed dome on a drum.
  f.add(box(30, 24, 36, OCHRE, DURBAR[0], 0, DURBAR[1]), box(31, 1, 37, CREAM, DURBAR[0], 24, DURBAR[1]), box(30.6, 0.8, 36.6, TRAP, DURBAR[0], 0, DURBAR[1]));
  f.add(cyl(9.4, 9.4, 5, CREAM, DURBAR[0], 25, DURBAR[1], 32), at(ribbed(hemi(9.6, OCHRE, 32), 16, 0.06), DURBAR[0], 30, DURBAR[1]), at(finial(3.4), DURBAR[0], 39.4, DURBAR[1]));
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) f.add(at(chhatri(2, 6, CREAM), DURBAR[0] + sx * 12.5, 25, DURBAR[1] + sz * 15.5));
  // The domed pavilion on the west wing, and kiosks of different sizes along the roofs.
  f.add(cyl(4.6, 4.6, 4, CREAM, -60, 16.9, 4, 16), at(onionDome(5, OCHRE), -60, 20.9, 4), at(finial(2.4), -60, 29.8, 4));
  for (const [x, z, r, h] of [[-88, 8, 2.4, 7], [-36, 8, 2, 6], [24, 7, 2.6, 7.5], [60, 7, 2, 6]]) f.add(at(chhatri(r, h, CREAM), x, x > 14 ? 19.9 : 16.9, z));
  // The east wing's gabled dormers, in cream with trap bands.
  for (const x of [28, 44, 60]) f.add(at(gable(7, 5, 3, OCHRE), x, 19.9, 10.5), box(7.4, 0.4, 3.2, TRAP, x, 19.9, 10.5));
  // The east tower: taller than the clock tower, under a steep pyramid roof.
  f.add(box(18, 34, 18, OCHRE, EAST[0], 0, EAST[1]), box(18.8, 0.8, 18.8, CREAM, EAST[0], 19, EAST[1]), box(18.8, 1, 18.8, CREAM, EAST[0], 34, EAST[1]), box(18.6, 0.8, 18.6, TRAP, EAST[0], 0, EAST[1]));
  f.add(at(hipRoof(19, 19, 12, TRAP), EAST[0], 35, EAST[1]), at(finial(3), EAST[0], 46.6, EAST[1]));
  // The clock tower over the entrance block
  f.add(box(14, 44, 14, OCHRE, TOWER[0], 0, TOWER[1]), box(15, 1, 15, CREAM, TOWER[0], 30, TOWER[1]), box(15, 1, 15, CREAM, TOWER[0], 44, TOWER[1]));
  const face = cyl(3.2, 3.2, 0.4, CREAM, 0, 0, 0, 24);
  face.rotation.x = Math.PI / 2;
  face.position.set(TOWER[0], 37, TOWER[1] + 7.2);
  f.add(face, at(chhatri(5.5, 14, CREAM), TOWER[0], 45, TOWER[1]));
  // The entrance porch at the foot of the tower, over a pointed door
  const door = classicalDoor(3, 5, { m: OCHRE, trim: CREAM, shape: 'pointed', top: null, depth: 0.45 });
  f.add(at(porch(14, 7, 7, { m: OCHRE, trim: CREAM, colM: CREAM, cols: 4, r: 0.45, top: 'balustrade', door, stepsDown: 0.6 }), TOWER[0], 0.6, TOWER[1] + 7));
  f.add(box(16, 0.6, 7, CREAM, TOWER[0], 0, TOWER[1] + 10.5));
  addDetails(f, g);
  // Framed on the monument itself, closer than its grounds would set.
  return { group: g, focus: f, view: [0.45, 0.25, 1.25], zoom: 0.68 };
}

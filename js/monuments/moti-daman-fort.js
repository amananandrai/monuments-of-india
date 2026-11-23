import * as THREE from 'three';
import { mat, mesh, box, cyl, at, inst, unitBox, planPrism, photo, hipRoof, archWall, surface } from '../helpers.js';
import { arrowBastion } from '../parts/forts.js';
import { addDetails } from '../details/moti-daman-fort.js';

// Moti Daman Fort, from photographs (Wikimedia Commons: "Gateway of Moti Daman", "Daman MotiDaman
// Fort", "Daman Bom Jesus Church", "OLD AND NEW LIGHT HOUSES IN DAMAN, INDIA", "Fort of daman",
// "Upstairs to Moti Daman Fort") and descriptions. The Portuguese walled town of 1559–1581 on the
// south bank of the Damanganga: a ten-sided curtain of dark weathered stone about 10 m high with a
// cordon below its parapet, an arrowhead bastion at every angle, a moat on the landward sides, and
// two gates, the land gate on the south and the river gate on the north: each a tower of the same
// stone a little higher than the wall, its arch framed in dressed stone under the royal arms.
// Inside, a grid of quiet streets: the church of Bom Jesus (1603), a plain cream front under one
// steep gable with a carved stone portal and a wall of three bells beside it; the chapel of Our
// Lady of the Rosary; the ruined Dominican monastery; the government houses under tiled roofs; and
// at the north-west angle, over the river's mouth, the squat old lighthouse on its bastion with
// the banded modern tower behind it. The river is to the north (-z) and the sea to the west (-x);
// the home view looks from the south-east across the land gate.
export const STONE = photo(mat('#857a69', 0.95), 'rubble'), STONE_DARK = photo(mat('#6b6254', 0.95), 'rubble');
export const LIME = mat('#f1ede4', 0.85), TILE = mat('#a0503a', 0.8), YELLOW = mat('#e7c16d', 0.85);
export const CREAM = surface(mat('#f0e0b8', 0.85), 'carved'), DADO = surface(mat('#8c3a2c', 0.9), 'carved'), OLD_LIME = surface(mat('#c9c4b6', 0.95), 'carved');
const BLACK = mat('#26272a', 0.7), WHITE = mat('#f2f1ec', 0.7);
export const H = 10;
// The angles of the curtain, clockwise from the north-west.
export const PTS = [[-150, -60], [-110, -110], [-20, -118], [70, -112], [140, -80], [155, 0], [130, 85], [40, 112], [-60, 110], [-140, 60]];
// The gates: on the south wall (between angles 7 and 8) and the north wall (between 2 and 3).
export const GATES = [{ i: 7, t: 0.5 }, { i: 2, t: 0.5 }];

// The arrowhead bastion at angle i of the curtain.
export const bastionPlan = (i) => arrowBastion(PTS, i);
// Where a gate stands and which way it faces (away from the town's centre).
export function gatePose({ i, t }) {
  const [x0, z0] = PTS[i], [x1, z1] = PTS[(i + 1) % PTS.length], ry = Math.atan2(-(z1 - z0), x1 - x0);
  const x = x0 + (x1 - x0) * t, z = z0 + (z1 - z0) * t;
  return { x, z, rot: ry + ((Math.sin(ry) * x + Math.cos(ry) * z) > 0 ? 0 : Math.PI) };
}
// The modern lighthouse stands just inside the north-west curtain.
export const LIGHT = [-119, -86];

export function buildMotiDamanFort() {
  const g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  // The curtain walls, 6 m thick, split at the gates.
  const n = PTS.length, wall = [];
  PTS.forEach(([x0, z0], i) => {
    const [x1, z1] = PTS[(i + 1) % n], len = Math.hypot(x1 - x0, z1 - z0), ry = Math.atan2(-(z1 - z0), x1 - x0);
    const gate = GATES.find((q) => q.i === i), parts = gate ? [[0, gate.t - 7 / len], [gate.t + 7 / len, 1]] : [[0, 1]];
    for (const [t0, t1] of parts) {
      const tm = (t0 + t1) / 2;
      wall.push([x0 + (x1 - x0) * tm, 0, z0 + (z1 - z0) * tm, len * (t1 - t0), H, 6, ry]);
    }
  });
  f.add(inst(unitBox(), wall, STONE));
  // The bastions, a little higher than the curtain.
  for (let i = 0; i < n; i++) f.add(planPrism(bastionPlan(i), 0, H + 0.6, STONE_DARK));
  // The gate towers: a block through the wall, 1.6 m higher than it, with a round-arched passage
  // 4.4 m wide and 6 m to its crown. Their fronts are in the detail file.
  for (const q of GATES) {
    const gh = new THREE.Group(), { x, z, rot } = gatePose(q);
    gh.add(archWall(14.2, H + 1.6, 7, 4.4, 6, false, STONE));
    gh.position.set(x, 0, z);
    gh.rotation.y = rot;
    f.add(gh);
  }
  // Bom Jesus church: a nave under a tiled roof behind a tall front that ends in one steep gable,
  // washed cream above a red dado; on its left a stair block and a pier carrying the bell wall,
  // three arches stepping up towards the gable.
  const church = new THREE.Group(), cw = 16, cl = 42, ch = 11, front = new THREE.Shape();
  front.moveTo(-cw / 2 - 0.7, 0); front.lineTo(cw / 2 + 0.7, 0); front.lineTo(cw / 2 + 0.7, ch + 0.6); front.lineTo(0, 22.5); front.lineTo(-cw / 2 - 0.7, ch + 0.6); front.closePath();
  church.add(box(cw, ch, cl, CREAM, 0, 0, -cl / 2), at(hipRoof(cw + 1.2, cl + 0.6, 5.2, TILE), 0, ch, -cl / 2 - 0.4));
  church.add(mesh(new THREE.ExtrudeGeometry(front, { depth: 1.2, bevelEnabled: false }), CREAM, 0, 0, 0.4), box(cw + 1.5, 1.6, 1.3, DADO, 0, 0, 1));
  church.add(box(7, ch + 0.5, 5, CREAM, -12.1, 0, -3.5), box(5.5, 7, 4, CREAM, -11.5, 0, 0.6), box(5.6, 1.6, 4.1, DADO, -11.5, 0, 0.6));
  for (let k = 0; k < 3; k++) church.add(at(archWall(2.3, 3.6 + k, 1.2, 1.1, 2.6 + k * 0.8, false, CREAM), -14.4 + k * 2.3, ch + 0.5, -2));
  church.add(box(12, 1, 6, CREAM, 0, 0, -cl - 3), box(cw - 4, ch - 1, 8, CREAM, 0, 0, -cl - 4));
  f.add(at(church, -40, 0, 30));
  // The chapel of Our Lady of the Rosary, near the river gate.
  const chapel = new THREE.Group();
  chapel.add(box(9, 7, 20, LIME, 0, 0, -10), at(hipRoof(9.8, 20.6, 3.4, TILE), 0, 7, -10.3), box(10.5, 10, 1.4, LIME, 0, 0, 0.4), box(4, 2.4, 1.2, LIME, 0, 10, 0.4));
  f.add(at(chapel, 40, 0, -60).rotateY(Math.PI));
  // The old lighthouse: a squat round tower of weathered plaster on the bastion at the river's
  // mouth, two string courses round it and an iron railing on its flat top.
  const bp = bastionPlan(1), [ox, oz] = [(bp[1][0] + bp[2][0] + bp[3][0] + PTS[1][0]) / 4, (bp[1][1] + bp[2][1] + bp[3][1] + PTS[1][1]) / 4], oy = H + 0.6, old = new THREE.Group();
  old.add(cyl(2.7, 3.1, 8.4, OLD_LIME, 0, 0, 0, 24), cyl(3.3, 3.3, 0.3, OLD_LIME, 0, 0, 0, 24), cyl(3.15, 3.15, 0.3, OLD_LIME, 0, 3.4, 0, 24), cyl(3.0, 2.9, 0.35, OLD_LIME, 0, 6.6, 0, 24), cyl(2.95, 2.95, 0.3, OLD_LIME, 0, 8.1, 0, 24));
  old.add(mesh(new THREE.TorusGeometry(2.6, 0.04, 4, 24).rotateX(Math.PI / 2), BLACK, 0, 9.4, 0), mesh(new THREE.TorusGeometry(2.6, 0.03, 4, 24).rotateX(Math.PI / 2), BLACK, 0, 8.9, 0), cyl(0.25, 0.3, 0.5, DADO, 0, 8.4, 0, 8));
  for (let k = 0; k < 12; k++) old.add(cyl(0.03, 0.03, 1, BLACK, Math.cos(k * Math.PI / 6) * 2.6, 8.4, Math.sin(k * Math.PI / 6) * 2.6, 4));
  f.add(at(old, ox, oy, oz));
  // The modern lighthouse just inside the wall: a tapering tower in black and white bands, a
  // double gallery, a white lantern room and the radar on its roof.
  const lh = new THREE.Group(), bands = [[0, 3, BLACK], [3, 10, WHITE], [10, 16, BLACK], [16, 22, WHITE], [22, 24.2, BLACK]], rad = (y) => 3 - y * 0.03;
  for (const [y0, y1, m] of bands) lh.add(cyl(rad(y1), rad(y0), y1 - y0, m, 0, y0, 0, 24));
  lh.add(cyl(3.5, 2.6, 1.3, BLACK, 0, 24.2, 0, 24), cyl(3.1, 3.1, 0.9, BLACK, 0, 25.5, 0, 24), cyl(3.4, 3.4, 0.5, BLACK, 0, 26.4, 0, 24), cyl(3.3, 3.3, 1.3, WHITE, 0, 26.9, 0, 24));
  lh.add(cyl(1.5, 1.5, 2.2, mat('#2f3a40', 0.3, 0.4), 0, 28.2, 0, 16), cyl(0.3, 1.7, 0.8, WHITE, 0, 30.4, 0, 16), cyl(0.05, 0.05, 2.4, WHITE, 0, 31.2, 0, 6), box(2.2, 0.25, 0.3, WHITE, 0, 32.6, 0));
  lh.add(mesh(new THREE.TorusGeometry(3.25, 0.04, 4, 24).rotateX(Math.PI / 2), WHITE, 0, 29.2, 0));
  f.add(at(lh, LIGHT[0], 0, LIGHT[1]));
  // The ruined Dominican monastery: roofless stone walls cut by arches.
  const ruin = new THREE.Group();
  ruin.add(at(archWall(34, 11, 1.4, 5, 8, false, STONE_DARK), 0, 0, 0), at(archWall(34, 7, 1.2, 4, 6, false, STONE_DARK), 0, 0, -22));
  for (const s of [-1, 1]) ruin.add(at(archWall(23, 9 - (s + 1) * 1.5, 1.2, 4, 6, false, STONE_DARK), s * 16.4, 0, -11).rotateY(Math.PI / 2));
  f.add(at(ruin, -95, 0, -45));
  // The government houses round the square: two long two-storey blocks with arcaded verandahs.
  for (const [x, z, w, ry] of [[55, 40, 50, 0], [95, 2, 34, Math.PI / 2]]) {
    const b = new THREE.Group();
    b.add(box(w, 8.4, 14, YELLOW, 0, 0, 0), at(hipRoof(w + 1.6, 15.6, 3.6, TILE), 0, 8.4, 0), box(w + 0.4, 0.4, 14.4, LIME, 0, 4, 0));
    f.add(at(b, x, 0, z).rotateY(ry));
  }
  addDetails(f, g, { cw, cl, ch });
  // From the south-east, over the moat and the land gate.
  return { group: g, focus: f, view: [0.6, 0.38, 1], zoom: 0.5 };
}

import * as THREE from 'three';
import { mat, box, cyl, at, inst, unitBox, planPrism, photo, hipRoof, archWall } from '../helpers.js';
import { addDetails } from '../details/moti-daman-fort.js';

// Moti Daman Fort, from photographs and descriptions. The Portuguese walled town of 1559–1581 on
// the south bank of the Damanganga: a ten-sided curtain of dark weathered stone about 8 m high,
// with an arrowhead bastion at every angle, a moat on the landward sides, and two gates, the land
// gate on the south and the river gate on the north. Inside, a grid of quiet streets: the church
// of Bom Jesus (1603) with its carved portal, the chapel of Our Lady of the Rosary, the lighthouse,
// the ruined Dominican monastery, and the government houses under tiled roofs. The river is to the
// north (-z); the home view looks from the south-east across the land gate.
export const STONE = photo(mat('#857a69', 0.95), 'rubble'), STONE_DARK = photo(mat('#6b6254', 0.95), 'rubble');
export const LIME = mat('#f1ede4', 0.85), TILE = mat('#a0503a', 0.8), YELLOW = mat('#e7c16d', 0.85);
export const H = 8;
// The angles of the curtain, clockwise from the north-west.
export const PTS = [[-150, -60], [-110, -110], [-20, -118], [70, -112], [140, -80], [155, 0], [130, 85], [40, 112], [-60, 110], [-140, 60]];
// The gates: on the south wall (between angles 7 and 8) and the north wall (between 2 and 3).
export const GATES = [{ i: 7, t: 0.5 }, { i: 2, t: 0.5 }];

// The arrowhead bastion at angle i: two flanks running back to the curtain and two faces meeting
// at a salient pointing out along the angle's bisector.
export function bastionPlan(i) {
  const n = PTS.length, [vx, vz] = PTS[i], [px, pz] = PTS[(i + n - 1) % n], [qx, qz] = PTS[(i + 1) % n];
  const la = Math.hypot(px - vx, pz - vz), lb = Math.hypot(qx - vx, qz - vz);
  const ax = (px - vx) / la, az = (pz - vz) / la, bx = (qx - vx) / lb, bz = (qz - vz) / lb;
  let ox = -(ax + bx), oz = -(az + bz);
  const ol = Math.hypot(ox, oz);
  ox /= ol; oz /= ol;
  const F = 12, S = 9, P = 22;
  return [[vx + ax * F, vz + az * F], [vx + ax * F + ox * S, vz + az * F + oz * S], [vx + ox * P, vz + oz * P], [vx + bx * F + ox * S, vz + bz * F + oz * S], [vx + bx * F, vz + bz * F]];
}

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
  // The gatehouses: a block through the wall with a round-arched passage, faced in lime plaster
  // on the outer side, its front framed by pilasters and crowned with a pediment.
  for (const { i, t } of GATES) {
    const [x0, z0] = PTS[i], [x1, z1] = PTS[(i + 1) % n], ry = Math.atan2(-(z1 - z0), x1 - x0);
    const gh = new THREE.Group();
    gh.add(archWall(14.2, H + 2, 7, 4.6, 6.6, false, STONE));
    // The outer face (the gate faces away from the town's centre).
    const fr = new THREE.Group();
    fr.add(archWall(10, H + 3.4, 0.6, 4.6, 6.6, false, LIME));
    for (const s of [-1, 1]) fr.add(box(1.1, H + 3.4, 0.5, LIME, s * 4.3, 0, 0.45));
    fr.add(box(11, 0.6, 1.3, LIME, 0, H + 3.4, 0.2));
    gh.add(at(fr, 0, 0, 3.75));
    const mx = x0 + (x1 - x0) * t, mz = z0 + (z1 - z0) * t;
    gh.position.set(mx, 0, mz);
    gh.rotation.y = ry + ((Math.sin(ry) * mx + Math.cos(ry) * mz) > 0 ? 0 : Math.PI);
    f.add(gh);
  }
  // Bom Jesus church: a whitewashed nave under a tiled roof with a tall front gabled in scrolls.
  const church = new THREE.Group(), cw = 16, cl = 42, ch = 12;
  church.add(box(cw, ch, cl, LIME, 0, 0, -cl / 2), at(hipRoof(cw + 1.2, cl + 0.6, 5.2, TILE), 0, ch, -cl / 2 - 0.4));
  church.add(box(cw + 4, ch + 5, 2.2, LIME, 0, 0, 1), box(9, 4, 2.0, LIME, 0, ch + 5, 1), box(2, 3, 1.6, LIME, 0, ch + 9, 1));
  church.add(box(12, 1, 6, LIME, 0, 0, -cl - 3), box(cw - 4, ch - 1, 8, LIME, 0, 0, -cl - 4));
  f.add(at(church, -40, 0, 30));
  // The chapel of Our Lady of the Rosary, near the river gate.
  const chapel = new THREE.Group();
  chapel.add(box(9, 7, 20, LIME, 0, 0, -10), at(hipRoof(9.8, 20.6, 3.4, TILE), 0, 7, -10.3), box(10.5, 10, 1.4, LIME, 0, 0, 0.4), box(4, 2.4, 1.2, LIME, 0, 10, 0.4));
  f.add(at(chapel, 40, 0, -60).rotateY(Math.PI));
  // The lighthouse: a white round tower with a gallery and a dark lantern.
  f.add(cyl(2.6, 3.4, 18, LIME, 98, 0, -70, 24), cyl(3.6, 3.6, 0.5, STONE_DARK, 98, 18, -70, 24), cyl(2.1, 2.1, 2.6, mat('#2f3a40', 0.3, 0.4), 98, 18.5, -70, 16), cyl(0.2, 2.5, 1.8, mat('#2b2b2b', 0.6), 98, 21.1, -70, 16));
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
  return { group: g, focus: f, view: [0.65, 0.45, 1], zoom: 0.8 };
}

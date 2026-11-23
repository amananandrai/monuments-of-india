import * as THREE from 'three';
import { M, mat, mesh, box, cyl, at, inst, unitBox, photo, archPanel, ring, planSolid, doubleSided } from '../helpers.js';
import { mergeByMaterial } from '../parts/components.js';
import { pierced } from '../parts/mughal.js';
import { addDetails } from '../details/agrasen-ki-baoli.js';

// Agrasen ki Baoli, in the middle of New Delhi: a stepwell 60 m long and 15 m wide, rebuilt in
// its present form in the Tughlaq or Lodi period. From photographs: a long, straight flight of
// more than a hundred steps runs down from the south (+z) between walls of rough grey-brown
// rubble. The trench narrows as it deepens, in three tiers: the steps start the full width, and
// at each of two landings the walls step in, leaving a walk along either side. Each tier of each
// wall is a row of deep arched alcoves opening off its walk. At the foot the steps meet a tower the
// full depth of the well: a tall square chamber, domed inside, open to the steps through arches one
// above another, the topmost a shallow recess with a small window under a row of brackets. Behind
// it is the round well, its shaft joined to the chamber by openings at every level.
export const STONE = photo(mat('#8f8070', 0.94), 'rubble');
export const SHADE = photo(mat('#76695c', 0.95), 'rubble');
export const GROUND = mat('#7c8d52', 0.95);
// D: the depth. The trench is 2 A0 wide at the top, 2 A1 between the upper walks and 2 A2 at the
// bottom; the top tier's alcoves are AD deep in walls WT thick. The flight runs from z = Z0 at
// ground level down to Z1 and the floor on to the tower's face at ZE; the chamber is CH deep; the
// well, WR in radius (7 to 8 m across), is centred at z = WZ.
export const D = 12.5, A0 = 5.5, A1 = 3.9, A2 = 2.7, AD = 1.3, WT = 2, Z0 = 26, Z1 = -14, ZE = -22, CH = 5, WR = 3.7, WZ = ZE - CH - 0.6 - WR;

export function buildAgrasenKiBaoli() {
  const g = new THREE.Group(), f = new THREE.Group(), d = new THREE.Group();
  g.add(f);
  // The ground, cut by the trench with the chamber at its end, and by the well.
  const well = new THREE.Path(), X0 = A0 + AD;
  well.absarc(0, -WZ, WR, 0, Math.PI * 2, false);
  g.add(planSolid([[-500, -500], [500, -500], [500, 500], [-500, 500]], [[[-A2, ZE - CH], [-A2, ZE], [-X0, ZE], [-X0, Z0], [X0, Z0], [X0, ZE], [A2, ZE], [A2, ZE - CH]], well], D, GROUND, STONE));
  // The steps: 103 of them, 0.12 m high, with a landing at each third of the depth, where the
  // trench narrows.
  const steps = [], N = 103, rise = (D - 0.4) / N, tread = (Z0 - Z1 - 4.4) / (N - 2), Y1 = D - 35 * rise, Y2 = D - 69 * rise;
  let z = Z0;
  for (let k = 0; k < N; k++) {
    const h = D - (k + 1) * rise, t = k === 34 || k === 68 ? 2.2 : tread;
    steps.push([0, 0, z - t / 2, 2 * (h > Y1 + 0.01 ? A0 + 0.02 : h > Y2 + 0.01 ? A1 : A2), h, t]);
    z -= t;
  }
  // The height of the flight at z.
  const stepH = (zz) => { if (zz >= Z0) return D; for (const s of steps) if (zz >= s[2] - s[5] / 2) return s[4]; return 0.4; };
  d.add(inst(unitBox(), steps, STONE), box(2 * A2, 0.4, z - ZE, SHADE, 0, 0, (z + ZE) / 2), box(2 * A2 - 0.4, 0.1, 3, M.water, 0, 0.36, ZE + 2.2), box(2 * A2, 0.4, CH, SHADE, 0, 0, ZE - CH / 2), box(2 * A2 - 0.6, 0.1, CH - 0.6, M.water, 0, 0.36, ZE - CH / 2));
  // The walks: the masses the trench steps in by, and a paved top to each.
  const len = Z0 - ZE, zm = (Z0 + ZE) / 2;
  for (const s of [-1, 1]) {
    d.add(box(A0 - A1 - 0.8, Y1, len, STONE, s * (A0 + A1 + 0.8) / 2, 0, zm), box(A1 + 0.2 - A2, Y2, len, STONE, s * (A1 + 0.8 + A2 + 0.6) / 2, 0, zm));
    d.add(box(A0 - A1 + 0.12, 0.1, len, SHADE, s * (A0 + A1 - 0.12) / 2, Y1, zm), box(A1 - A2 + 0.12, 0.1, len, SHADE, s * (A1 + A2 - 0.12) / 2, Y2, zm));
  }
  // The alcoves, tier by tier: [the wall's face, its floor, its height, its thickness, the arch's
  // width and height, the pitch]. Where the steps climb past a tier, its alcoves' floors climb with
  // them, until there is no room left under the arch.
  const pigeon = [];
  for (const [x, y, h, t, aw, ah, pitch, sill] of [[A0, Y1, D - Y1, AD, 2, 3.1, 3.05, 0], [A1, Y2, Y1 - Y2, 0.8, 1.5, 2.6, 2.75, 0], [A2, 0, Y2, 0.6, 1.4, 2.5, 2.75, 0.75]]) {
    const cells = [];
    for (let zz = ZE + 1 + pitch / 2; zz < Z0 - 1; zz += pitch) {
      const up = Math.max(sill, stepH(zz + aw / 2 + 0.2) - y + 0.12);
      if (ah - up >= 0.7 * aw + 0.5) cells.push([zz - zm, up, aw, ah - up]);
    }
    for (const s of [-1, 1]) {
      const w = pierced(len, h, cells.map(([cx, ...c]) => [-s * cx, ...c]), t, STONE);
      w.rotation.y = -s * Math.PI / 2;
      d.add(at(w, s * (x + t), y, zm));
      // Small square holes in the piers between the alcoves.
      for (const [cx] of cells.slice(1)) pigeon.push([s * (x - 0.01), y + h - 1.1, zm + cx - pitch / 2, 0.05, 0.3, 0.3]);
    }
  }
  d.add(inst(unitBox(), pigeon, M.recess));
  // The tower at the foot: its face to the steps with three arches one over another, the top one
  // a shallow recess with a small window; the brackets of a lost eave along its head; the square
  // chamber behind, a shallow dome over it, and its openings onto the well.
  const fw = 2 * A2 + 1.2, top = [0, Y1 + 0.2, 3.6, 3.2];
  d.add(at(pierced(fw, D, [[0, 0.4, 3.4, 3.4], [0, Y2 + 0.2, 3, 3.2], top], 0.7, STONE), 0, 0, ZE));
  d.add(box(2 * A2, D - Y1, 0.3, SHADE, 0, Y1, ZE - 0.75), at(archPanel(0.8, 1.3, true, M.recess, 0.04), 0, Y1 + 1.5, ZE - 0.6));
  for (const y of [0.5, Y2 + 0.2]) d.add(at(archPanel(2, 2.7, true, M.recess, 0.04), 0, y, ZE - CH + 0.01));
  for (let k = -3; k <= 3; k++) d.add(box(0.26, 0.34, 0.5, SHADE, k * 0.95, D - 0.5, ZE + 0.95), box(0.26, 0.16, 0.22, SHADE, k * 0.95, D - 0.66, ZE + 0.81));
  const dome = mesh(new THREE.SphereGeometry(A2 * 1.42, 20, 6, 0, Math.PI * 2, 0, Math.PI / 4), doubleSided(SHADE), 0, D - 0.4 - A2 * 1.42, ZE - CH / 2);
  d.add(dome);
  // Doorways from the ends of the walks into the tower.
  for (const s of [-1, 1]) d.add(box(0.9, 1.9, 0.04, M.recess, s * (A0 + A1 + 0.8) / 2, Y1 + 0.1, ZE + 0.02), box(0.7, 1.7, 0.04, M.recess, s * (A2 + 0.3), Y2 + 0.1, ZE + 0.72));
  // The top of the walls, a little proud of the ground, as a kerb round the trench, and the roof
  // of the tower.
  for (const s of [-1, 1]) d.add(box(WT, 0.5, len + CH + 0.4, SHADE, s * (A0 + WT / 2), D, zm - CH / 2 - 0.2));
  d.add(box(2 * A0, 0.5, CH + 0.4, SHADE, 0, D, ZE - CH / 2 - 0.2 + 0.36));
  // The well: arched openings round its shaft in tiers, and water at its foot.
  const wellNiches = [], archGeo = archPanel(1.6, 2.6, true, M.recess, 0.06).geometry;
  for (let t = 0; t < 3; t++) for (let k = 0; k < 10; k++) {
    const a = (k / 10) * Math.PI * 2;
    wellNiches.push([Math.sin(a) * (WR - 0.01), D - 3.8 * (t + 1), WZ + Math.cos(a) * (WR - 0.01), 0.8, 0.9, 1, a + Math.PI]);
  }
  d.add(inst(archGeo, wellNiches, M.recess), cyl(WR, WR, 0.4, M.water, 0, 0.6, WZ, 32));
  const kerb = ring(WR + 0.5, 0.9, SHADE, D, 40);
  kerb.position.z = WZ;
  d.add(kerb);
  f.add(mergeByMaterial(d));
  addDetails(f, g, { D, HW: A0, WT, Z0, ZE, WZ, WR });
  // From the head of the steps, looking down the flight to the tower at its foot.
  return { group: g, focus: f, view: [0.16, 0.5, 1], zoom: 0.46, target: [0, 6, -4], minElevation: 0.3 };
}

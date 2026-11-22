import * as THREE from 'three';
import { M, mat, box, cyl, at, inst, unitBox, photo, archPanel, ring, planSolid } from '../helpers.js';
import { mergeByMaterial } from '../parts/components.js';
import { addDetails } from '../details/agrasen-ki-baoli.js';

// Agrasen ki Baoli, in the middle of New Delhi: a stepwell 60 m long and 15 m wide, rebuilt in
// its present form in the Tughlaq or Lodi period. From photographs: a long, straight flight of
// more than a hundred steps runs down from the north (+z) between walls of rough grey-brown
// stone, each wall cut into three tiers of arched niches over the steps. At the foot, the south
// wall rises the full depth, four tiers of arches with a tall arched opening in the middle onto
// the round well behind it, whose shaft is ringed with arched openings too.
export const STONE = photo(mat('#8f8070', 0.94), 'rubble');
export const SHADE = photo(mat('#76695c', 0.95), 'rubble');
export const GROUND = mat('#7c8d52', 0.95);
// D: the depth; the steps are 2 HW wide between the walls, which are WT thick; the flight runs
// from z = Z0 at ground level down to Z1; the well's centre at z = WZ.
export const D = 12.5, HW = 4, WT = 3.5, Z0 = 30, Z1 = -21, ZE = -30, WZ = -36.5, WR = 3.6;

export function buildAgrasenKiBaoli() {
  const g = new THREE.Group(), f = new THREE.Group(), d = new THREE.Group();
  g.add(f);
  // The ground, cut by the trench and the well.
  const well = new THREE.Path();
  well.absarc(0, -WZ, WR, 0, Math.PI * 2, false);
  g.add(planSolid([[-500, -500], [500, -500], [500, 500], [-500, 500]], [[[-HW, ZE], [-HW, Z0], [HW, Z0], [HW, ZE]], well], D, GROUND, STONE));
  // The side walls' top, a little proud of the ground, as a kerb round the trench.
  for (const s of [-1, 1]) d.add(box(WT, 0.5, Z0 - ZE + WT, SHADE, s * (HW + WT / 2), D, (Z0 + ZE) / 2 - WT / 2));
  d.add(box(2 * HW, 0.5, WT, SHADE, 0, D, ZE - WT / 2));
  // The steps: 103 of them, 0.12 m high and half a metre deep, with two landings.
  const steps = [], N = 103, rise = (D - 0.4) / N;
  let z = Z0;
  for (let k = 0; k < N; k++) {
    const h = D - (k + 1) * rise;
    const tread = k === 34 || k === 68 ? 2.2 : (Z0 - Z1 - 4.4) / (N - 2);
    steps.push([0, 0, z - tread / 2, 2 * HW, h, tread]);
    z -= tread;
  }
  d.add(inst(unitBox(), steps, STONE), box(2 * HW, 0.4, z - ZE, SHADE, 0, 0, (z + ZE) / 2));
  // The arched niches in three tiers along both walls, with a ledge under each tier.
  const ah = 2.6, aw = 1.6, pitch = 2.55, niches = [], ledges = [];
  const archGeo = archPanel(aw, ah, true, M.recess, 0.06).geometry;
  for (const s of [-1, 1]) {
    for (let t = 0; t < 3; t++) {
      const y = D - 3.6 * (t + 1) + 0.5;
      ledges.push([s * (HW - 0.12), y - 0.35, (Z0 + ZE) / 2, 0.24, 0.3, Z0 - ZE]);
      for (let k = 0; k * pitch < Z0 - ZE - 2; k++) {
        const zz = ZE + 1.6 + k * pitch;
        // Only where the steps leave the niche clear.
        const ground = zz > Z1 ? D - ((Z0 - zz) / (Z0 - Z1)) * D : 0;
        if (y < ground - 0.2) continue;
        niches.push([s * (HW - 0.01), y, zz, 1, 1, 1, -s * Math.PI / 2]);
      }
    }
  }
  // The end wall: four tiers of arches, and the tall opening onto the well in the middle.
  for (let t = 0; t < 4; t++) {
    const y = D - 3.1 * (t + 1) + 0.3;
    for (const x of [-2.6, 2.6]) niches.push([x, y, ZE + 0.01, 1, 1, 1, 0]);
    ledges.push([0, y - 0.35, ZE + 0.12, 2 * HW, 0.3, 0.24]);
  }
  d.add(inst(archGeo, niches, M.recess), inst(unitBox(), ledges, SHADE));
  d.add(at(archPanel(2.4, 8.5, true, mat('#2c2520', 0.95), 0.08), 0, 0.4, ZE + 0.005));
  // The well: arched openings round its shaft in tiers, and water at its foot.
  const wellNiches = [];
  for (let t = 0; t < 3; t++) for (let k = 0; k < 10; k++) {
    const a = (k / 10) * Math.PI * 2;
    wellNiches.push([Math.sin(a) * (WR - 0.01), D - 3.8 * (t + 1), WZ + Math.cos(a) * (WR - 0.01), 0.8, 0.9, 1, a + Math.PI]);
  }
  d.add(inst(archGeo, wellNiches, M.recess), cyl(WR, WR, 0.4, M.water, 0, 0.6, WZ, 32));
  const kerb = ring(WR + 0.5, 0.9, SHADE, D, 40);
  kerb.position.z = WZ;
  d.add(kerb, box(2 * HW, 0.1, 5, M.water, 0, 0.4, ZE + 2.5));
  f.add(mergeByMaterial(d));
  addDetails(f, g, { D, HW, WT, Z0, ZE, WZ });
  // From the head of the steps, looking down the flight to the arched end wall.
  return { group: g, focus: f, view: [0.28, 0.55, 0.8], zoom: 0.55, target: [0, 6, -4], minElevation: 0.3 };
}

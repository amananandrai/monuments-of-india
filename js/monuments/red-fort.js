import * as THREE from 'three';
import { M, box, cyl, at, chhatri, tricolour, inst, unitBox, mown } from '../helpers.js';
import { fortGate, rampart } from '../parts/forts.js';
import { mughalChhatri, arcadeScreen } from '../parts/components.js';
import { addDetails } from '../details/red-fort.js';

// The fort's outline, [x, z] round from the east end of the focus walls by the Lahori Gate.
export const RIVER = -540;
export const OUTLINE = [[60, 0], [150, 0], [290, -30], [440, -175], [450, -400], [320, RIVER], [-320, RIVER], [-450, -400], [-440, -175], [-290, -30], [-150, 0], [-60, 0]];
// The barbican Aurangzeb built before the Lahori Gate: its side walls at x = ±BX, its front at
// z = BZ, BH high; the gate through it is in its north side (-x).
export const BX = 45, BZ = 58, BH = 11;

export function buildRedFort() {
  const Rd = M.red, Rl = M.redLight, g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  // The great open ground before the fort, the lawns of the old moat either side of the barbican,
  // and Netaji Subhash Marg beyond.
  g.add(box(320, 0.2, 96, M.path, 0, 0, BZ + 58), box(320, 0.2, 22, M.asphalt, 0, 0, BZ + 118));
  for (const s of [-1, 1]) g.add(mown(box(110, 0.25, BZ + 4, M.grass, s * (BX + 62), 0, BZ / 2 + 5)));
  // Every length of wall, [x, y, z, len, h, t, ry]: the battlements are set on all of them at once.
  const segs = [];
  const wall = (x0, x1) => {
    f.add(box(x1 - x0, 18, 10, Rd, (x0 + x1) / 2, 0, 0));
    segs.push([(x0 + x1) / 2, 0, 0, x1 - x0, 18, 10, 0]);
  };
  const bastion = (x, t) => t.add(cyl(8, 9, 20, Rd, x, 0, 2, 24), cyl(8.4, 8.4, 0.8, Rl, x, 19.2, 2, 24), at(chhatri(4.5, 10, Rd, Rd), x, 20, 2));
  for (const s of [-1, 1]) {
    wall(s < 0 ? -60 : 16, s < 0 ? -16 : 60);
    bastion(s * 60, f);
  }
  // The rest of the circuit: the fort is an irregular octagon about 900 m by 540 m, its west front
  // (here the +z side, with the Lahori Gate) bending back at its ends, the river wall along the old
  // bank of the Yamuna (z = RIVER). Wall runs between the corners of OUTLINE, a round bastion at
  // each corner and every 120 m or so along the runs; the river wall is lower (built over the river).
  const runs = [], bas = [];
  for (let k = 1; k < OUTLINE.length; k++) {
    const [x0, z0] = OUTLINE[k - 1], [x1, z1] = OUTLINE[k], len = Math.hypot(x1 - x0, z1 - z0), river = z0 === RIVER && z1 === RIVER;
    runs.push([(x0 + x1) / 2, 0, (z0 + z1) / 2, len + 4, river ? 12 : 18, 10, Math.atan2(z0 - z1, x1 - x0)]);
    for (let t = 0; t < len - 30; t += len / Math.max(1, Math.round(len / 120))) if (t > 0 || k > 1) bas.push([x0 + ((x1 - x0) * t) / len, z0 + ((z1 - z0) * t) / len, river]);
  }
  g.add(inst(unitBox(), runs, Rd));
  for (const [x, z, river] of bas) g.add(cyl(8, 9, river ? 14 : 20, Rd, x, 0, z, 24), cyl(8.4, 8.4, 0.8, Rl, x, river ? 13.2 : 19.2, z, 24), at(chhatri(4.5, 10, Rd, Rd), x, river ? 14 : 20, z));
  g.add(rampart(runs.filter((r) => r[4] > 12), Rd, { trim: Rl, size: 1.35, centre: [0, RIVER / 2], kerb: false }));

  // The barbican: a walled court thrown forward of the gate, so the gate is entered round a
  // corner. Its front is a broad rampart filled with earth and turfed on top, between two
  // octagonal bastions that carry domed pavilions; its side walls run back to the fort wall.
  f.add(box(2 * BX, BH, 16, Rd, 0, 0, BZ - 8), mown(box(2 * BX - 6, 0.3, 11, M.grass, 0, BH, BZ - 9.5)));
  segs.push([0, 0, BZ - 2.5, 2 * BX, BH, 5, 0]);
  for (const s of [-1, 1]) {
    // The north side (-x) is in two lengths, either side of the barbican's own gate.
    for (const [z0, z1] of s < 0 ? [[5, 24], [40, BZ - 16]] : [[5, BZ - 16]]) {
      f.add(box(5, BH, z1 - z0, Rd, s * BX, 0, (z0 + z1) / 2));
      segs.push([s * BX, 0, (z0 + z1) / 2, z1 - z0, BH, 5, Math.PI / 2]);
    }
    f.add(cyl(6.6, 7.2, BH + 2.5, Rd, s * BX, 0, BZ - 1, 8), cyl(7, 7, 0.7, Rl, s * BX, BH + 1.8, BZ - 1, 8), at(mughalChhatri(4.6, 9.5, Rd, { domeM: Rd, crescent: false }), s * BX, BH + 2.5, BZ - 1));
  }
  const bg = at(fortGate(16, BH + 4, 7, 5, 8, { m: Rd, trim: M.marble, crest: false }), -BX, 0, 32);
  bg.rotation.y = -Math.PI / 2;
  f.add(bg, mown(box(2 * BX - 10, 0.25, BZ - 26, M.grass, 2, 0, (BZ - 16 + 12) / 2)));
  f.add(rampart(segs, Rd, { trim: Rl, size: 1.35, centre: [0, 20], kerb: false }));

  // Lahori Gate: a deep iwan under a half-dome, at whose back the gate passage runs through the
  // gatehouse, with guard niches and spiked doors; either side a half-octagonal tower carrying an
  // open pavilion; along the top, between two slender minarets, a screen of small arches under
  // seven little kiosks with white marble domes; and the flag.
  f.add(at(fortGate(32, 23, 18, 6.5, 11, { m: Rd, trim: M.marble, iwan: { w: 13, h: 22, depth: 4 }, crest: false }), 0, 0, 2));
  f.add(box(32.6, 1, 18.6, Rl, 0, 23, 2));
  for (const x of [-17.5, 17.5]) {
    f.add(cyl(4, 4.3, 26, Rd, x, 0, 9, 8));
    for (const y of [8, 16, 23]) f.add(cyl(4.6, 4.6, 0.5, Rl, x, y, 9, 8));
    f.add(cyl(4.5, 4.2, 1.6, Rd, x, 26, 9, 8), at(mughalChhatri(3.3, 8, Rd, { domeM: Rd, crescent: false }), x, 27.6, 9));
  }
  f.add(box(22, 3.4, 1.4, Rd, 0, 24, 9.4), at(arcadeScreen(22, 3.4, 7, 1.7, 2.3, 0.3, Rl), 0, 24, 10.12), box(22.6, 0.35, 1.9, Rl, 0, 27.4, 9.4));
  for (let k = -3; k <= 3; k++) f.add(at(chhatri(1.2, 3.8, Rd, M.marble), k * 3.1, 27.75, 9.4));
  for (const x of [-12.2, 12.2]) f.add(cyl(0.5, 0.7, 13.5, Rd, x, 24, 9.4, 10), cyl(0.85, 0.5, 0.5, Rl, x, 31.5, 9.4, 10), at(chhatri(0.8, 2.6, M.marble, M.marble), x, 37.5, 9.4));
  f.add(at(tricolour(15), 0, 24, 6));
  addDetails(f, g);
  // Hundreds of separate parts: merged into a few draw calls once built (js/batch.js).
  // The home view matches the best-known photograph: the barbican and the Lahori Gate rising
  // behind it, from the open ground to the west.
  return { group: g, focus: f, view: [0.07, 0.06, 1], zoom: 0.52, target: [0, 14, 30], batch: true };
}

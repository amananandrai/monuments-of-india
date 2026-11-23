import * as THREE from 'three';
import { M, mat, mesh, box, cyl, at, inst, unitBox, unitSpire, archPanel, photo, planSolid } from '../helpers.js';
import { carvedPillar } from '../parts/temples.js';
import { mergeByMaterial, frieze } from '../parts/components.js';
import { addDetails } from '../details/adalaj-stepwell.js';

// The Adalaj stepwell (Rudabai's vav), 1498–99: five storeys sunk into the ground, about 75 m
// from end to end. From photographs and plans: at the south end (+z) three flights, from the
// west, the south and the east, come down to a square landing one storey below ground, under a
// roof at ground level, open in the middle in an octagon on eight pillars, with a small room in
// each corner whose oriel window looks onto the landing. From it a
// stepped corridor runs north, down four more flights; across it at each landing stands a
// pillared gallery (kuta) of carved pillars and beams storey on storey up to the ground, open in
// the middle to the sky. At the north end the corridor meets an octagonal shaft ringed by
// galleries on every storey over a square stepped tank; beyond that, a round well. The side walls are
// plain ashlar banded with carving: flowers, elephants, scenes of village life and little niches.
export const STONE = photo(mat('#c7a87c', 0.9), 'sandstone');
export const SHADE = photo(mat('#a68960', 0.92), 'sandstone');
// The walls: plain coursed ashlar; the carving is in bands, niches and friezes (the detail file).
export const RELIEF = photo(mat('#c2a377', 0.9), 'sandstone');
export const GROUND = mat('#7f9150', 0.95);
// D: ground level; F: a storey; CW: half the corridor's width; the octagon's centre at z = OZ and
// its inner apothem OA. The round well at z = WZ.
export const F = 3.2, D = 5 * F, CW = 2.49, OZ = -24, OA = 6, WZ = -38;
// The landings along the corridor: [z where its flight down begins, its floor].
const KUTAS = [[23.2, 3 * F], [12.4, 2 * F], [1.6, F]];

// The octagon's corners round (0, OZ), apothem a, as [x, z] going round.
function octagon(a, cz = OZ) {
  const r = a / Math.cos(Math.PI / 8), pts = [];
  for (let k = 0; k < 8; k++) { const t = Math.PI / 8 + k * Math.PI / 4; pts.push([r * Math.cos(t), cz + r * Math.sin(t)]); }
  return pts;
}

export function buildAdalajStepwell() {
  const g = new THREE.Group(), f = new THREE.Group(), d = new THREE.Group();
  g.add(f);
  // The ground, cut through by the well: the entrance square, the corridor and the octagon as one
  // opening, and the round well as another.
  const oct = octagon(OA);
  const open = [[-CW, OZ + OA], [-CW, 28], [-10, 28], [-10, 46], [10, 46], [10, 28], [CW, 28], ...[1, 0, 7, 6, 5, 4, 3].map((k) => oct[k])];
  const wellHole = new THREE.Path();
  wellHole.absarc(0, -WZ, 2.8, 0, Math.PI * 2, false);
  g.add(planSolid([[-600, -600], [600, -600], [600, 600], [-600, 600]], [open, wellHole], D, GROUND, RELIEF));
  // An octagonal ring t thick between apothems a0 and a1 (or out to a plan of [x, z] points)
  // about (0, cz), for the galleries, the parapets and the pavilion's roof.
  const ringGeo = (a0, a1, t, cz = OZ) => {
    const toV = ([x, zz]) => new THREE.Vector2(x, -(zz - cz));
    const sh = new THREE.Shape((Array.isArray(a1) ? a1 : octagon(a1, cz)).map(toV));
    sh.holes.push(new THREE.Path(octagon(a0, cz).map(toV)));
    return new THREE.ExtrudeGeometry(sh, { depth: t, bevelEnabled: false }).rotateX(-Math.PI / 2);
  };
  // The miniature shrines on the corners of the parapets: [x, y, z].
  const shrines = [];
  // The entrance: the landing a storey down, and the three flights to it.
  const yL = D - F;
  d.add(box(12, yL, 14, STONE, 0, 0, 35));
  const N = 13, run = 4 / N;
  for (let k = 0; k < N; k++) {
    const h = D - (k + 1) * (F / (N + 1));
    for (const s of [-1, 1]) d.add(box(run, h, 12, STONE, s * (10 - (k + 0.5) * run), 0, 36));
    d.add(box(12, h, run, STONE, 0, 0, 46 - (k + 0.5) * run));
  }
  for (const s of [-1, 1]) d.add(box(4, D - 0.02, 2, STONE, s * 8, 0, 29), box(4, D - 0.02, 4, STONE, s * 8, 0, 44));
  // Over the landing, at ground level, a roof open in the middle in an octagon, on eight carved
  // pillars at the octagon's corners; a carved parapet round the opening with a miniature shrine
  // on each corner. In the four corners of the landing, between the stairs, are small rooms.
  const PZ = 35, PA = 3;
  for (const sx of [-1, 1]) for (const zr of [29.7, 40.3]) d.add(box(3.4, F - 0.4, 3.4, STONE, sx * 4.3, yL, zr));
  for (const [x, zz] of octagon(PA + 0.4, PZ)) { const p = carvedPillar(F - 0.4, STONE); p.scale.set(0.7, 1, 0.7); d.add(at(p, x, yL, zz)); }
  d.add(mesh(ringGeo(PA, [[-6, 28], [6, 28], [6, 42], [-6, 42]], 0.4, PZ), SHADE, 0, D - 0.4, PZ), mesh(ringGeo(PA, PA + 0.3, 0.75, PZ), frieze(STONE), 0, D, PZ));
  shrines.push(...octagon(PA + 0.15, PZ).map(([x, zz]) => [x, D + 0.75, zz]));
  // The corridor: four flights down, a landing with its gallery after each of the first three, and
  // the floor at the foot running on to the octagon.
  const FN = 16, frun = 4.8 / FN;
  let z = 28;
  for (let lv = 0; lv < 4; lv++) {
    const top = D - F * (lv + 1);
    for (let k = 0; k < FN; k++) d.add(box(2 * CW, top - (k + 1) * (F / FN), frun, STONE, 0, 0, z - (k + 0.5) * frun));
    z -= 4.8;
    if (lv < 3) { d.add(box(2 * CW, top - F, 6, STONE, 0, 0, z - 3)); z -= 6; }
  }
  d.add(box(2 * CW, 0.2, z - (OZ + OA) + 0.1, SHADE, 0, 0, (z + OZ + OA) / 2));
  // The galleries across the corridor: at each storey from the landing to the ground, two rows of
  // four pillars, beams across, and a walk along each wall, open in the middle.
  const piers = [];
  for (const [zk, y0] of KUTAS) {
    const zc = zk - 3;
    for (let y = y0; y < D - 0.1; y += F) {
      for (const x of [-1.95, -0.7, 0.7, 1.95]) for (const dz of [-2.3, 2.3]) piers.push([x, y, zc + dz]);
      d.add(box(2 * CW, 0.45, 0.7, SHADE, 0, y + F - 0.45, zc - 2.3), box(2 * CW, 0.45, 0.7, SHADE, 0, y + F - 0.45, zc + 2.3));
      for (const s of [-1, 1]) d.add(box(1.1, 0.35, 5.3, SHADE, s * (CW - 0.55), y + F - 0.45, zc), box(0.12, 0.5, 4.6, frieze(STONE), s * (CW - 1.16), y + F - 0.95, zc));
    }
    for (const dz of [-2.3, 2.3]) d.add(box(2 * CW + 0.8, 0.3, 1.2, STONE, 0, D, zc + dz));
    for (const sx of [-1, 1]) d.add(box(1.3, 0.3, 3.4, STONE, sx * (CW - 0.25), D, zc));
  }
  for (const [x, y, zz] of piers) { const p = carvedPillar(F - 0.45, STONE); p.scale.set(0.42, 1, 0.42); d.add(at(p, x, y, zz)); }
  // The octagon: a gallery round the shaft at every storey, on pillars at its corners, and the
  // water at its foot.
  // Each gallery has a parapet of carved panels on its inner edge, a miniature shrine on every corner.
  for (let k = 1; k <= 4; k++) {
    d.add(mesh(ringGeo(4.3, OA - 0.02, 0.4), SHADE, 0, k * F - 0.4, OZ), mesh(ringGeo(4.22, 4.4, 0.7), frieze(STONE), 0, k * F - 0.2, OZ));
    shrines.push(...octagon(4.31).map(([x, zz]) => [x, k * F + 0.5, zz]));
  }
  shrines.push(...octagon(OA + 0.95).map(([x, zz]) => [x, D + 0.7, zz]));
  d.add(mesh(ringGeo(OA + 0.02, OA + 1.6, 0.7), STONE, 0, D, OZ));
  const cr = 4.55 / Math.cos(Math.PI / 8);
  for (let k = 0; k < 4; k++) for (let c = 0; c < 8; c++) {
    const t = Math.PI / 8 + c * Math.PI / 4, p = carvedPillar(F - 0.4, STONE);
    p.scale.set(0.42, 1, 0.42);
    d.add(at(p, cr * Math.cos(t), k * F, OZ - cr * Math.sin(t)));
  }
  // At the shaft's foot a square tank, its sides stepping down to the water; an arch in the north
  // side leads through to the round well.
  for (let k = 0; k < 3; k++) {
    const a = 3.7 - k * 0.5, b = k ? a + 0.5 : OA + 0.5, y = 0.95 - k * 0.3;
    for (const s of [-1, 1]) d.add(box(2 * b, y, b - a, k % 2 ? SHADE : STONE, 0, 0, OZ + s * (a + b) / 2), box(b - a, y, 2 * a, k % 2 ? SHADE : STONE, s * (a + b) / 2, 0, OZ));
  }
  d.add(box(5.4, 0.1, 5.4, M.water, 0, 0.1, OZ), box(2 * CW, 0.55, 0.6, SHADE, 0, 0, OZ + OA + 0.3), at(archPanel(2.2, 3.4, true, M.recess, 0.05), 0, 0.95, OZ - OA + 0.01));
  d.add(inst(unitBox(), shrines.map(([x, y, zz]) => [x, y, zz, 0.42, 0.34, 0.42]), STONE), inst(unitSpire(), shrines.map(([x, y, zz]) => [x, y + 0.34, zz, 0.4, 0.5, 0.4]), SHADE));
  // The round well beyond, its kerb and the frame for the rope.
  d.add(cyl(2.8, 2.8, 0.4, M.water, 0, 2, WZ, 32), cyl(3.4, 3.4, 0.7, SHADE, 0, D, WZ, 32));
  for (const s of [-1, 1]) d.add(box(0.4, 2.4, 0.4, SHADE, s * 3, D + 0.7, WZ));
  d.add(box(6.4, 0.3, 0.4, SHADE, 0, D + 3.1, WZ));
  f.add(mergeByMaterial(d));
  addDetails(f, g, { D, F, CW, OZ, OA, WZ });
  // From above the entrance, looking down the length of the well to the octagon.
  return { group: g, focus: f, view: [0.3, 0.7, 0.75], zoom: 0.48, target: [0, 8, 4], minElevation: 0.35 };
}

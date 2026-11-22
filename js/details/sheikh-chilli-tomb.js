import * as THREE from 'three';
import { M, box, cyl, at, onFace, FACES, finial, sheet } from '../helpers.js';
import { chhajja, bracketGeo, placeAll, alongFace, railing, panel, merlons, mergeByMaterial, lotusDome } from '../parts/components.js';
import { iwan, arcadeSkin, cellRow } from '../parts/mughal.js';
import { steps } from '../parts/doorways.js';
import { trees, shrubs, lampPosts, benches, asiBoard, scatter, along, townHouses } from '../parts/realism.js';
import { STONE } from '../monuments/sheikh-chilli-tomb.js';

// Sheikh Chilli's Tomb, finer detail. From photographs: a marble eave on brackets runs round the
// octagon under a pierced parapet; inlaid panels fill the faces either side of each arch; a pierced
// railing edges the terrace. Below the terrace's south face lies the madrasa's court, closed on
// three sides by a range of arched rooms, with the smaller red sandstone tomb said to be of the
// saint's wife in it, a garden of lawns and paths, and the town of Thanesar beyond its walls.
// Dimensions follow js/monuments/sheikh-chilli-tomb.js: terrace W square and T high, the octagon's
// faces R from the centre, from B to B + H.
function architecture(f, { T, R, B, H, W }) {
  const S = STONE, d = new THREE.Group(), side = 2 * R * Math.tan(Math.PI / 8);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    d.add(onFace(at(chhajja(side + 0.5, 1.1, 0.45, 0.12, S.marble), 0, B + H - 0.3, 0), a, R));
    d.add(placeAll(bracketGeo(0.6, 0.9, 0.2), alongFace(a, R, side, 4, B + H - 0.75), S.shade));
    d.add(onFace(at(railing(side - 0.2, 0.9, 0.18, S.marble, 1.3), 0, B + H + 0.4, 0), a, R - 0.25));
    for (const lat of [-1, 1]) d.add(onFace(at(panel(side * 0.17, 5.2, 0.12, S.marble, S.shade), 0, B + 0.8, 0), a, R + 0.01, lat * side * 0.36));
  }
  // The railing round the terrace's edge, broken for the stair.
  for (const a of FACES) {
    if (a === 0) for (const s of [-1, 1]) d.add(onFace(at(railing(11.5, 0.9, 0.22, S.red, 1.6), 0, T, 0), a, W / 2 - 0.4, s * 9.5));
    else d.add(onFace(at(railing(W - 6, 0.9, 0.22, S.red, 1.6), 0, T, 0), a, W / 2 - 0.4));
  }
  // The stair up the middle of the south face, from the court.
  d.add(at(steps(5.5, T, 13, S.redLight), 0, 0, W / 2));
  f.add(mergeByMaterial(d));
}

// The madrasa's court before the terrace (z from W/2 to W/2 + 52), its ranges of rooms 5 m high
// arcaded towards the court, and the gate in the middle of its south range.
function court(g, { W }) {
  const S = STONE, c = new THREE.Group(), z0 = W / 2, z1 = W / 2 + 52, xw = 34, rh = 5, rd = 6;
  // East and west ranges, and the south range either side of the gate.
  for (const s of [-1, 1]) {
    const r = at(new THREE.Group(), s * (xw - rd / 2), 0, (z0 + z1) / 2);
    r.add(box(rd - 1, rh, z1 - z0, S.red, s * 0.5, 0, 0), box(rd + 0.3, 0.4, z1 - z0 + 0.3, S.redLight, 0, rh, 0));
    r.add(onFace(arcadeSkin(z1 - z0, rh, cellRow(13, 3.8, 0.4, 2.4, 3.8), 1, S.red, { trim: S.redLight }), -s * Math.PI / 2, rd / 2 - 1));
    r.add(at(merlons(z1 - z0, 0.6, 0.7, 0.3, S.red, 0.4), -s * (rd / 2 - 0.3), rh + 0.4, 0).rotateY(Math.PI / 2));
    c.add(r);
    const sr = at(new THREE.Group(), s * (xw / 2 + 3.5), 0, z1 - rd / 2);
    sr.add(box(xw - 9, rh, rd - 1, S.red, 0, 0, 0.5), box(xw - 8.7, 0.4, rd + 0.3, S.redLight, 0, rh, 0));
    sr.add(onFace(arcadeSkin(xw - 9, rh, cellRow(7, 3.8, 0.4, 2.4, 3.8), 1, S.red, { trim: S.redLight }), Math.PI, rd / 2 - 1));
    c.add(sr);
  }
  // The gate: a block with a great arch on either face.
  const gate = at(new THREE.Group(), 0, 0, z1 - rd / 2);
  gate.add(box(12, 9, rd, S.red), box(12.4, 0.5, rd + 0.4, S.redLight, 0, 9, 0));
  for (const a of [0, Math.PI]) gate.add(onFace(iwan(4, 6.8, { m: S.red, trim: S.marble, shade: S.redLight, depth: 0.9, frame: 1.2, top: 1.2, cells: false }), a, rd / 2));
  for (const s of [-1, 1]) gate.add(cyl(1, 1, 1.2, S.red, s * 5.4, 9.5, 0, 8), at(lotusDome(0.9, S.marble, { ribs: 12, petals: 12 }), s * 5.4, 10.7, 0));
  c.add(gate);
  // The smaller tomb, of red sandstone under a marble dome, on the west side of the court.
  const tz = z0 + 18, tx = -18, t = at(new THREE.Group(), tx, 0, tz);
  t.add(box(11, 0.9, 11, S.redLight), box(8, 6, 8, S.red, 0, 0.9), box(8.6, 0.4, 8.6, S.redLight, 0, 6.9));
  for (const a of FACES) t.add(onFace(at(iwan(2.4, 4.4, { m: S.red, trim: S.marble, shade: S.redLight, depth: 0.5, frame: 0.8, top: 0.6, fill: a === Math.PI / 2 ? 'door' : 'jali', cells: false }), 0, 0.9, 0), a, 4));
  t.add(cyl(3, 3, 1.6, S.red, 0, 7.3, 0, 16), at(lotusDome(3, S.marble, { ribs: 16, petals: 16 }), 0, 8.9, 0), at(finial(2.2), 0, 8.9 + 3 * 1.85, 0));
  c.add(t);
  g.add(mergeByMaterial(c));
  // The court's lawns, its cross of paths and a pool in the middle.
  const cz = (z0 + z1) / 2;
  g.add(box(2 * xw - 2 * rd, 0.12, z1 - z0 - rd, M.grass, 0, 0, cz - rd / 2));
  g.add(box(5.5, 0.18, z1 - z0 - rd, M.path, 0, 0, cz - rd / 2), box(2 * xw - 2 * rd, 0.18, 4, M.path, 0, 0, cz));
  g.add(box(9, 0.45, 9, S.redLight, 0, 0, cz), sheet(7.6, 7.6, M.water, 0, 0.42, cz));
  return { z1, cz, xw };
}

// Sheikh Chilli's Tomb in Thanesar: the terrace and the court of the madrasa, neem and mango trees
// in the court, and the low houses of the town round about.
export function addDetails(f, g, dims) {
  architecture(f, dims);
  const { z1, cz, xw } = court(g, dims);
  g.add(box(420, 0.1, 420, M.grass, 0, -0.02, 20));
  // The ground behind and beside the terrace: a lawn and paths.
  g.add(box(42, 0.12, 42, M.path, 0, 0, 0));
  g.add(trees([[-18, cz - 10], [20, cz + 8], [-22, cz + 14], [16, cz - 12], [-40, -10], [42, 8], [-38, 30], [44, -26], [0, -36], [-26, -34], [28, -36]], { kind: 'neem', seed: 11 }));
  g.add(trees([[-14, cz + 16], [12, cz + 16]], { kind: 'mango', seed: 12 }));
  g.add(shrubs([...along(8, [-4, cz - 22], [-4, cz - 4]), ...along(8, [4, cz - 22], [4, cz - 4]), ...along(8, [-4, cz + 4], [-4, cz + 20]), ...along(8, [4, cz + 4], [4, cz + 20])].map(([x, z]) => [x, z, 0.8]), { seed: 5 }));
  g.add(benches([[-6, cz - 14, Math.PI / 2], [6, cz + 12, -Math.PI / 2]]), lampPosts(along(4, [-4, z1 - 10], [-4, dims.W / 2 + 15])));
  g.add(asiBoard('Sheikh Chilli’s Tomb', 9, z1 + 6, 0));
  // Thanesar: houses round the walled precinct.
  const spots = scatter(70, [-200, 200, -170, 220], { seed: 7, gap: 14 }).filter(([x, z]) => Math.abs(x) > xw + 24 || z < -40 || z > z1 + 24);
  g.add(townHouses(spots.map(([x, z], i) => [x, z, 7 + (i % 3) * 1.5, 8 + (i % 2) * 2, 1 + (i % 3 === 0 ? 1 : 0), (i % 4) * Math.PI / 2]), { seed: 8, fine: false }));
  g.add(trees(scatter(30, [-200, 200, -170, 220], { seed: 9, gap: 20 }).filter(([x, z]) => Math.abs(x) > xw + 16 || z < -30 || z > z1 + 16), { kind: 'peepal', seed: 4 }));
}

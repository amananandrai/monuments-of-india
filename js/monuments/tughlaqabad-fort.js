import * as THREE from 'three';
import { M, mat, mesh, box, cyl, lathe, at, onFace, FACES, inst, photo, archWall, archPanel, rise, rng, planPrism } from '../helpers.js';
import { rampart, bastionCrowns, batteredGeo } from '../parts/forts.js';
import { archRing, archCurve, merlons, carved, jali, mergeByMaterial } from '../parts/components.js';
import { arcadeSkin, cellRow } from '../parts/mughal.js';
import { steps } from '../parts/doorways.js';
import { addDetails } from '../details/tughlaqabad-fort.js';

// The fort's grey rubble, laid in huge rough blocks; the red sandstone and white marble of the
// tomb.
export const RUBBLE = photo(mat('#7f786c', 0.95), 'rubble');
export const RUBBLE_D = photo(mat('#6c665b', 0.96), 'rubble');
export const RED = photo(mat('#a5573a', 0.85), 'blocks');
export const RED_D = mat('#84432f', 0.9);
export const MARBLE = mat('#eeeae1', 0.45);
export const LAWN = mat('#6f8f4a', 0.96);
export const SLATE = mat('#5a5e66', 0.7);

// A round bastion, tapering, open at neither end: 1 across at its foot, standing on y = 0.
let bastion = null;
const bastionGeo = () => bastion || (bastion = new THREE.CylinderGeometry(0.4, 0.5, 1, 20).translate(0, 0.5, 0));

// Tughlaqabad (1321–1325), Ghiyas-ud-din Tughlaq's city: some 6.5 km of battered rubble walls 10 to
// 15 m high, round bastions every 30 m or so, on a rocky outcrop; here the circuit is drawn smaller,
// an oblong A by B (half-sizes) round (0, CZ). South of it, across what was a lake, stands his tomb
// (1325): a square of red sandstone 18.9 m on a side with battered walls, under a white marble dome,
// 24.4 m high, inside a small fortified enclosure of five sides; a causeway on arches, about 200 m
// long, joins the enclosure to the fort's south gate. +z is south: the tomb's south face, the
// causeway running north (-z) to the walls.
export const A = 620, B = 330, CZ = -560, WH = 14, WT = 9;
export const outline = (t) => { const c = Math.cos(t), s = Math.sin(t); return [A * Math.sign(c) * Math.abs(c) ** 0.55, CZ + B * Math.sign(s) * Math.abs(s) ** 0.55]; };
export const GATE_Z = CZ + B, TS = 18.9, TH = 13, FL = 5.6;

// The fringe of lotus buds (spearheads) hanging from the inner edge of an arch aw wide and ah to its
// crown: a thin band whose inner edge is cut into teeth, t thick.
function fringe(aw, ah, d, t, m) {
  const r = aw / 2, o = archCurve(r, ah - rise(r, true), true, 24), n = o.length - 1, sh = new THREE.Shape();
  o.forEach((q, i) => (i ? sh.lineTo(q.x, q.y) : sh.moveTo(q.x, q.y)));
  for (let i = n; i >= 0; i--) {
    const a = o[Math.max(0, i - 1)], b = o[Math.min(n, i + 1)], tx = b.x - a.x, ty = b.y - a.y, l = Math.hypot(tx, ty), k = i % 2 ? d : d * 0.25;
    sh.lineTo(o[i].x + (ty / l) * k, Math.max(o[0].y, o[i].y - (tx / l) * k));
  }
  return mesh(new THREE.ExtrudeGeometry(sh, { depth: t, bevelEnabled: false }), m);
}

// The tomb. From photographs: red sandstone walls leaning in at about 75 degrees, belted by a broad
// band of white marble a little over half way up. On the north, east and south a doorway: a tall
// arch outlined in marble with a fringe of lotus buds, a marble lintel across it at the band, a
// marble lattice in the arch head and a smaller arched door below, between slender colonnettes;
// the west face, behind the mihrab, is closed. Above the band, inscribed marble panels and a marble
// slab over each arch; a cornice with a crest of red merlons; a low eight-sided drum faced in
// marble and slate; the marble dome, and on it an amalaka and a kalasha of red sandstone.
function tomb() {
  const g = new THREE.Group(), BAT = TS * 0.15, top = TS - 2 * BAT, wAt = (y) => TS - 2 * BAT * (y / TH);
  g.add(cyl(top * Math.SQRT1_2, TS * Math.SQRT1_2, TH, RED, 0, 0, 0, 4).rotateY(Math.PI / 4), box(TS + 0.8, 0.3, TS + 0.8, RED, 0, 0, 0));
  const BY = TH * 0.53, BH = 0.8, lean = Math.atan(BAT / TH), INSCR = carved(MARBLE, 'calligraphy');
  for (const [y, h] of [[BY, BH], [TH - 0.6, 0.3]]) { const w = wAt(y + h) + 0.14; g.add(box(w, h, w, MARBLE, 0, y, 0)); }
  for (const a of FACES) {
    const p = new THREE.Group(), AW = 4.2, AH = 9.7, open = a !== -Math.PI / 2;
    if (open) {
      // The arch's recess, the door in it, the lintel and the lattice.
      p.add(archPanel(AW, AH, true, RED_D, 0.06), at(archPanel(1.9, 4.6, true, M.recess, 0.05), 0, 0, 0.04), at(archRing(1.9, 4.6, true, 0.22, 0.08, RED), 0, 0, 0.05));
      p.add(box(AW - 0.1, BH, 0.14, MARBLE, 0, BY - 0.25, 0.07), box(2.6, 0.5, 0.1, INSCR, 0, 5.4, 0.08));
      p.add(at(archPanel(3.2, 1.75, true, M.recess, 0.04), 0, BY + BH - 0.2, 0.05), at(archPanel(3.2, 1.75, true, jali(MARBLE), 0.05), 0, BY + BH - 0.2, 0.09));
      p.add(at(archRing(AW, AH, true, 0.5, 0.14, MARBLE, false), 0, 0, 0.02), at(fringe(AW, AH, 0.32, 0.1, MARBLE), 0, 0, 0.08));
      for (const s of [-1, 1]) p.add(cyl(0.13, 0.15, AH - rise(AW / 2, true), RED, s * (AW / 2 + 0.22), 0, 0.16, 8), box(0.4, 0.25, 0.4, RED, s * (AW / 2 + 0.22), AH - rise(AW / 2, true), 0.16));
      // The marble lines of the frame, and the slab over the arch.
      for (const s of [-1, 1]) p.add(box(0.22, 10.25 - BY - BH, 0.08, MARBLE, s * 2.95, BY + BH - 0.2, 0.04));
      p.add(box(6.12, 0.22, 0.08, MARBLE, 0, 10.05, 0.04), box(3.4, 0.55, 0.08, INSCR, 0, 10.6, 0.04));
    }
    // The inscribed panels above the band: two either side of the arch, six on the closed face.
    for (const x of open ? [-5.55, -3.95, 3.95, 5.55] : [-5.55, -3.95, -1.6, 1.6, 3.95, 5.55]) p.add(box(1.15, 1.8, 0.07, MARBLE, x, BY + BH + 0.35, 0.035), box(0.62, 1.1, 0.1, INSCR, x, BY + BH + 0.6, 0.05));
    p.rotation.x = -lean;
    p.position.set(0, 0.3, TS / 2 - 0.3 * Math.tan(lean) + 0.04);
    g.add(new THREE.Group().add(p).rotateY(a));
    // The cornice and its merlons.
    g.add(onFace(at(merlons(top + 0.5, 0.62, 0.85, 0.3, RED, 0.22), 0, TH + 0.5, 0), a, top / 2 + 0.1));
  }
  g.add(box(top + 0.9, 0.5, top + 0.9, RED, 0, TH, 0));
  // The drum, the dome and its finial.
  const turn = Math.PI / 8;
  g.add(cyl(6.1, 6.2, 1.5, MARBLE, 0, TH + 0.5, 0, 8).rotateY(turn), cyl(6.25, 6.25, 0.22, SLATE, 0, TH + 1.1, 0, 8).rotateY(turn), cyl(6.35, 6.35, 0.25, MARBLE, 0, TH + 2.0, 0, 8).rotateY(turn));
  const dome = [];
  for (let k = 0; k <= 16; k++) { const t = (k / 16) * Math.PI / 2; dome.push([5.9 * Math.cos(t) * (1 + 0.04 * Math.sin(t * 2)), 6.6 * Math.sin(t)]); }
  g.add(at(lathe(dome, MARBLE, 40), 0, TH + 2.25, 0));
  g.add(at(lathe([[0.95, 0], [1.25, 0.15], [1.3, 0.4], [1.05, 0.6], [0.5, 0.7], [0.42, 0.9], [0.8, 1.25], [0.86, 1.6], [0.6, 2.0], [0.22, 2.2], [0.3, 2.4], [0.12, 2.55], [0, 2.95]], RED, 16), 0, TH + 8.75, 0));
  return g;
}

// The tomb's enclosure: five sides of battered rubble some 10 m high outside, with round bastions at
// the corners; inside, the ground is made up to FL, so the walls stand only a storey above the
// lawn, lined with arcaded cells under the wall walk. The gate is on the north, where the causeway
// comes in; the bastion at the north-west holds the tomb of Zafar Khan.
export const ENC = [[-34, 32], [34, 32], [44, -14], [0, -40], [-44, -14]];

export function buildTughlaqabadFort() {
  const g = new THREE.Group(), f = new THREE.Group(), R = rng(7);
  g.add(f);
  // The fort's circuit: lengths of battered wall round the outline, their heights broken where the
  // wall has fallen; a bastion every 32 m; a gap at the south gate.
  const segs = [], towers = [], N = 300;
  let run = 0;
  for (let k = 0; k < N; k++) {
    const [x0, z0] = outline((k / N) * Math.PI * 2), [x1, z1] = outline(((k + 1) / N) * Math.PI * 2), mx = (x0 + x1) / 2, mz = (z0 + z1) / 2, len = Math.hypot(x1 - x0, z1 - z0);
    run += len;
    if (Math.abs(mx) < 16 && mz > CZ) { run = 20; continue; }
    const h = WH * (R() < 0.12 ? 0.55 + 0.3 * R() : 0.92 + 0.12 * R());
    segs.push([mx, -0.5, mz, len + 0.6, h + 0.5, WT, Math.atan2(z0 - z1, x1 - x0)]);
    if (run > 32) { const dx = mx, dz = mz - CZ, l = Math.hypot(dx, dz); towers.push([mx + (dx / l) * 4, mz + (dz / l) * 4, 8.5, WH * (0.85 + 0.3 * R())]); run = 0; }
  }
  g.add(inst(batteredGeo(), segs, RUBBLE), inst(bastionGeo(), towers.map(([x, z, r, h]) => [x, -0.5, z, 2 * r, h + 0.5, 2 * r]), RUBBLE_D));
  g.add(rampart(segs.filter((s) => s[4] > WH * 0.85).map(([x, y, z, l, h, t, r]) => [x, y, z, l, h, t * 0.55, r]), RUBBLE, { size: 1.1, centre: [0, CZ], kerb: false, slits: false }));
  g.add(bastionCrowns(towers.filter((t) => t[3] > WH).map(([x, z, r, h]) => [x, h, z, r * 0.8]), RUBBLE, { size: 1.1 }));
  // Every third bastion keeps its upper storey: a narrower drum standing on the lower one.
  const upper = towers.filter((t, k) => k % 3 === 0 && t[3] > WH).map(([x, z, r, h]) => [x, h - 0.2, z, r * 1.25, 5.5, r * 1.25]);
  g.add(inst(bastionGeo(), upper, RUBBLE_D), bastionCrowns(upper.map(([x, y, z, d]) => [x, y + 5.5, z, d * 0.4]), RUBBLE, { size: 1.1 }));
  // The south gate: two great bastions flanking a deep arched passage.
  const gate = new THREE.Group();
  gate.add(at(archWall(26, 17, 14, 6, 10, true, RUBBLE), 0, 0, 0), box(26.4, 0.8, 14.4, RUBBLE_D, 0, 16.2, 0));
  for (const s of [-1, 1]) gate.add(cyl(8.5, 10.5, 19, RUBBLE_D, s * 16, 0, 2, 24));
  f.add(at(gate, 0, 0, GATE_Z));
  // The causeway: 27 arches on piers, about 200 m from the enclosure to the gate.
  const cw = new THREE.Group(), z0 = -45.5, z1 = GATE_Z + 8, n = 27, step = (z0 - z1) / n, CH = 4.2;
  // The road (js/details) cuts through it at z = -120.
  for (let k = 0; k < n; k++) { const z = z1 + (k + 0.5) * step; if (Math.abs(z + 120) > 9) cw.add(at(archWall(step, CH, 6, step * 0.6, 3.4, true, RUBBLE), 0, 0, z).rotateY(Math.PI / 2)); }
  for (const [a, b] of [[z1, -128.6], [-111.4, z0]]) {
    cw.add(box(7, 0.6, b - a, RUBBLE_D, 0, CH, (a + b) / 2));
    for (const s of [-1, 1]) cw.add(box(0.5, 1, b - a, RUBBLE, s * 3.25, CH + 0.6, (a + b) / 2));
  }
  f.add(mergeByMaterial(cw));
  // The enclosure: battered walls round the five sides, bastions at the corners (the north-western
  // one broader), and the made ground inside.
  const es = [], et = [], cells = new THREE.Group(), WE = 10;
  ENC.forEach(([xa, za], i) => {
    const [xb, zb] = ENC[(i + 1) % ENC.length], L = Math.hypot(xb - xa, zb - za), ux = (xb - xa) / L, uz = (zb - za) / L, ry = Math.atan2(za - zb, xb - xa);
    // The north sides leave the gate where the causeway arrives.
    const [t0, t1] = i === 3 ? [0, L - 4.4] : i === 2 ? [4.4, L] : [0, L], mx = xa + ux * (t0 + t1) / 2, mz = za + uz * (t0 + t1) / 2;
    es.push([mx, 0, mz, t1 - t0, WE, 4.5, ry]);
    if (i !== 3) et.push([xa, za, i === 4 ? 15 : 11]);
    // The cells along the inside: a row of arches under the wall walk, facing the tomb.
    const inx = -uz * Math.sign(-uz * -mx + ux * -mz), inz = ux * Math.sign(-uz * -mx + ux * -mz), len = t1 - t0 - (i === 3 || i === 4 ? 17 : 13), off = i === 3 ? -2.5 : i === 4 ? 2.5 : 0;
    const row = new THREE.Group();
    row.add(arcadeSkin(len, 3.3, cellRow(Math.floor(len / 3.4), 3.4, 0, 2, 2.6), 0.9, RUBBLE, { fill: 'room', ring: false }), box(len, 0.35, 2.4, RUBBLE_D, 0, 3.3, -0.5));
    cells.add(at(row, mx + ux * off + inx * 2.6, FL, mz + uz * off + inz * 2.6).rotateY(Math.atan2(inx, inz)));
  });
  f.add(inst(batteredGeo(), es, RUBBLE), inst(bastionGeo(), et.map(([x, z, d]) => [x, 0, z, d, WE + 1.5, d]), RUBBLE_D), mergeByMaterial(cells));
  f.add(rampart(es.map(([x, y, z, l, h, t, r]) => [x, y, z, l, h, t * 0.55, r]), RUBBLE, { size: 0.75, kerb: false, slits: false }), bastionCrowns(et.map(([x, z, d]) => [x, WE + 1.5, z, d * 0.4]), RUBBLE, { size: 0.75 }));
  f.add(planPrism(ENC, 0, FL, LAWN));
  // The gateway: a tall block of red sandstone, its arch outlined in marble over a door under a
  // lintel, merlons on top; a flight of steps climbs to it from the causeway.
  const tg = new THREE.Group(), GH = 7.2;
  tg.add(box(9, FL, 5, RED, 0, 0, 0), at(archWall(9, GH, 5, 2.6, 4.6, true, RED), 0, FL, 0), box(9.4, 0.4, 5.4, RED, 0, FL + GH, 0));
  for (const zs of [-1, 1]) {
    const fc = new THREE.Group();
    fc.add(at(archRing(2.6, 4.6, true, 0.3, 0.08, MARBLE, false), 0, 0, 0), box(3.0, 0.4, 0.3, MARBLE, 0, 2.75, -0.1), box(4.4, 0.18, 0.06, MARBLE, 0, 5.2, 0.03), at(merlons(8.6, 0.6, 0.8, 0.3, RED, 0.22), 0, GH + 0.4, -0.3));
    for (const s of [-1, 1]) fc.add(box(0.18, 5.2, 0.06, MARBLE, s * 2.11, 0, 0.03));
    tg.add(at(fc, 0, FL, zs * 2.5).rotateY(zs > 0 ? 0 : Math.PI));
  }
  tg.add(at(steps(4.5, FL - CH - 0.6, 5, RED, 0.5), 0, CH + 0.6, -2.5).rotateY(Math.PI));
  f.add(at(mergeByMaterial(tg), 0, 0, -40));
  // Zafar Khan's tomb in the north-western bastion: an eight-sided chamber of red sandstone under
  // a small marble dome, a marble slab inscribed over its door.
  const zk = new THREE.Group(), [zx, zz] = ENC[4], za = Math.atan2(-zx, -zz);
  zk.add(cyl(4.6, 4.8, 3.2, RED, 0, 0, 0, 8), cyl(4.9, 4.9, 0.3, MARBLE, 0, 3.2, 0, 8), cyl(4.2, 4.2, 0.7, RED, 0, 3.5, 0, 16));
  zk.add(at(lathe(Array.from({ length: 13 }, (_, k) => [3.9 * Math.cos((k / 12) * Math.PI / 2), 3.7 * Math.sin((k / 12) * Math.PI / 2)]), MARBLE, 32), 0, 4.2, 0));
  zk.add(at(lathe([[0.5, 0], [0.62, 0.15], [0.3, 0.35], [0.45, 0.7], [0.15, 1.0], [0, 1.3]], RED, 12), 0, 7.85, 0));
  for (let k = 0; k < 8; k += 2) zk.add(onFace(at(archPanel(1.2, 2.3, true, M.recess, 0.05), 0, 0.1, 0), k * Math.PI / 4 + Math.PI / 8, 4.36), onFace(box(1.6, 0.4, 0.08, carved(MARBLE, 'calligraphy'), 0, 2.55, 0), k * Math.PI / 4 + Math.PI / 8, 4.36));
  f.add(at(zk, zx + Math.sin(za) * 1.5, WE + 1.5 - 1.4, zz + Math.cos(za) * 1.5).rotateY(za - Math.PI / 8), at(tomb(), 0, FL, 0));
  addDetails(f, g, { A, B, CZ, GATE_Z, TS, TH, FL });
  // The focus is the tomb, its enclosure, the causeway and the gate; the circuit is in the setting.
  // From the south-east: the tomb in its enclosure, the causeway and the fort's walls behind.
  return { group: g, focus: f, view: [0.8, 0.3, 1], zoom: 0.46, target: [-25, 8, -75] };
}

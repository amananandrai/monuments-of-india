import * as THREE from 'three';
import { M, mat, box, cyl, lathe, at, FACES, inst, photo, archWall, archPanel, rng, planPrism } from '../helpers.js';
import { rampart, bastionCrowns } from '../parts/forts.js';
import { archRing, mergeByMaterial } from '../parts/components.js';
import { addDetails } from '../details/tughlaqabad-fort.js';

// The fort's grey rubble, laid in huge rough blocks; the red sandstone and white marble of the
// tomb.
export const RUBBLE = photo(mat('#7f786c', 0.95), 'rubble');
export const RUBBLE_D = photo(mat('#6c665b', 0.96), 'rubble');
export const RED = photo(mat('#a5573a', 0.85), 'blocks');
export const MARBLE = mat('#eeeae1', 0.45);

// A length of battered wall, 1 x 1 x 1 standing on y = 0: its top half as thick as its foot, both
// faces sloping in, as the walls of Tughlaqabad lean back from their footings.
let battered = null;
export function batteredGeo() {
  if (battered) return battered;
  const geo = new THREE.BoxGeometry(1, 1, 1).translate(0, 0.5, 0), p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) if (p.getY(i) > 0.5) p.setZ(i, p.getZ(i) * 0.55);
  geo.computeVertexNormals();
  return (battered = geo);
}
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
export const GATE_Z = CZ + B, TS = 18.9, TH = 13;

// The tomb: battered red walls with marble bands, a tall pointed arch on each face in a marble
// frame, a parapet of merlons, an octagonal drum and the marble dome with its finial.
function tomb() {
  const g = new THREE.Group(), BAT = TS * 0.15, top = TS - 2 * BAT, wAt = (y) => TS - 2 * BAT * (y / TH);
  g.add(cyl(top * Math.SQRT1_2, TS * Math.SQRT1_2, TH, RED, 0, 0, 0, 4).rotateY(Math.PI / 4));
  for (const [y, h] of [[0.6, 0.5], [TH - 0.75, 0.45]]) { const w = wAt(y) + 0.12; g.add(box(w, h, w, MARBLE, 0, y, 0)); }
  // The arches, leaning back with the walls.
  const lean = Math.atan(BAT / TH);
  for (const a of FACES) {
    const p = new THREE.Group();
    p.add(archPanel(5.2, 9.6, true, M.recess, 0.08), at(archRing(5.2, 9.6, true, 0.45, 0.12, MARBLE), 0, 0, 0.02));
    p.add(box(7.4, 0.35, 0.1, MARBLE, 0, 10.2, 0), box(0.35, 10.2, 0.1, MARBLE, -3.55, 0, 0), box(0.35, 10.2, 0.1, MARBLE, 3.55, 0, 0));
    p.rotation.x = -lean;
    p.position.z = TS / 2 - 1.6 * Math.tan(lean) + 0.05;
    p.position.y = 1.6;
    g.add(at(new THREE.Group().add(p), 0, 0, 0).rotateY(a));
  }
  g.add(box(top + 0.6, 1.3, top + 0.6, RED, 0, TH, 0));
  // The drum and the dome.
  g.add(cyl(5.9, 6.1, 2.2, MARBLE, 0, TH + 1.3, 0, 8).rotateY(Math.PI / 8), cyl(6.3, 6.3, 0.3, RED, 0, TH + 3.5, 0, 8).rotateY(Math.PI / 8));
  const dome = [];
  for (let k = 0; k <= 16; k++) { const t = (k / 16) * Math.PI / 2; dome.push([5.8 * Math.cos(t) * (1 + 0.04 * Math.sin(t * 2)), 6.2 * Math.sin(t)]); }
  g.add(at(lathe(dome, MARBLE, 40), 0, TH + 3.8, 0));
  g.add(at(lathe([[0.9, 0], [1.1, 0.25], [0.55, 0.7], [0.7, 1.1], [0.2, 1.5], [0.3, 1.8], [0.08, 2.6], [0, 2.8]], RED, 16), 0, TH + 9.9, 0));
  return g;
}

// The tomb's enclosure: five sides of battered rubble about 9 m high with round bastions at the
// corners, the gate on the north side where the causeway comes in.
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
  // The south gate: two great bastions flanking a deep arched passage.
  const gate = new THREE.Group();
  gate.add(at(archWall(26, 17, 14, 6, 10, true, RUBBLE), 0, 0, 0), box(26.4, 0.8, 14.4, RUBBLE_D, 0, 16.2, 0));
  for (const s of [-1, 1]) gate.add(cyl(8.5, 10.5, 19, RUBBLE_D, s * 16, 0, 2, 24));
  f.add(at(gate, 0, 0, GATE_Z));
  // The causeway: 27 arches on piers, about 200 m from the enclosure to the gate.
  const cw = new THREE.Group(), z0 = -40, z1 = GATE_Z + 8, n = 27, step = (z0 - z1) / n;
  // The road (js/details) cuts through it at z = -120.
  for (let k = 0; k < n; k++) { const z = z1 + (k + 0.5) * step; if (Math.abs(z + 120) > 9) cw.add(at(archWall(step, 6.5, 6, step * 0.6, 4.6, true, RUBBLE), 0, 0, z).rotateY(Math.PI / 2)); }
  for (const [a, b] of [[z1, -128.6], [-111.4, z0]]) {
    cw.add(box(7, 0.6, b - a, RUBBLE_D, 0, 6.5, (a + b) / 2));
    for (const s of [-1, 1]) cw.add(box(0.5, 1, b - a, RUBBLE, s * 3.25, 7.1, (a + b) / 2));
  }
  f.add(mergeByMaterial(cw));
  // The enclosure: battered walls round the five sides and bastions at the corners.
  const es = [], et = [];
  ENC.forEach(([xa, za], i) => {
    const [xb, zb] = ENC[(i + 1) % ENC.length];
    if (i === 3 || i === 2) {
      // The north sides: leave the gate where the causeway arrives.
      const L = Math.hypot(xb - xa, zb - za), ux = (xb - xa) / L, uz = (zb - za) / L, ry = Math.atan2(za - zb, xb - xa);
      for (const [t0, t1] of i === 3 ? [[0, L - 6]] : [[6, L]]) es.push([xa + ux * (t0 + t1) / 2, 0, za + uz * (t0 + t1) / 2, t1 - t0, 9, 4.5, ry]);
    } else es.push([(xa + xb) / 2, 0, (za + zb) / 2, Math.hypot(xb - xa, zb - za), 9, 4.5, Math.atan2(za - zb, xb - xa)]);
    et.push([xa, za]);
  });
  f.add(inst(batteredGeo(), es, RUBBLE), inst(bastionGeo(), et.map(([x, z]) => [x, 0, z, 11, 10.5, 11]), RUBBLE_D));
  f.add(rampart(es.map(([x, y, z, l, h, t, r]) => [x, y, z, l, h, t * 0.55, r]), RUBBLE, { size: 0.75, kerb: false, slits: false }), bastionCrowns(et.map(([x, z]) => [x, 10.5, z, 4.4]), RUBBLE, { size: 0.75 }));
  f.add(at(archWall(9, 8, 5, 3.4, 5.6, true, RED), 0, 0, -40));
  f.add(planPrism(ENC, 0, 0.4, mat('#9c9180', 0.95)), tomb());
  addDetails(f, g, { A, B, CZ, GATE_Z, TS, TH });
  // The focus is the tomb, its enclosure, the causeway and the gate; the circuit is in the setting.
  // From the south-east: the tomb in its enclosure, the causeway and the fort's walls behind.
  return { group: g, focus: f, view: [0.8, 0.32, 1], zoom: 0.62 };
}

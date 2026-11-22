import * as THREE from 'three';
import { M, mat, mesh, box, cyl, at, lathe, sheet, photo, surface } from '../helpers.js';
import { mergeByMaterial } from '../parts/components.js';
import { track } from '../parts/transport.js';
import { detail } from '../detail.js';
import { addDetails } from '../details/satish-dhawan-space-centre.js';

// The Second Launch Pad at Sriharikota (2005), with an LVM3 on it as for Chandrayaan-3: the rocket
// on its mobile launch pedestal over the jet deflector, the umbilical tower behind it, four
// lightning masts round the pad, and the Vehicle Assembly Building at the far end of the twin
// track the pedestal travels on (a kilometre off in fact; brought to 300 m here). East, and the
// sea, is +x; the viewer stands to the south (+z), the flame trench opening towards him.
export const DECK = 5;                 // the pad's deck over the ground, and the trench floor
export const MLP = 4.6, Y0 = DECK + MLP + 1;   // the pedestal's height; the foot of the rocket
export const UT = { z: -14.5, w: 9, h: 70 };    // the umbilical tower: its centre, width and height over the deck
export const MAST = 58, MAST_H = 120;  // the lightning masts: ±MAST each way, and their height
export const VAB = { x: -330, w: 46, d: 42, h: 84 };
export const WHITE = surface(mat('#f1f1ee', 0.45), 'none'), STEEL = mat('#8f9aa3', 0.55, 0.4), CONCRETE = photo(mat('#b4b0a6', 0.9), 'concrete');
const DARK = mat('#2b2d30', 0.6), NOZZLE = mat('#5b4a40', 0.6, 0.3), FAIRING = surface(mat('#e3e4e2', 0.4), 'none');
const RED = mat('#c23a2c', 0.6), SAND = mat('#d3c193', 0.95);

// Bars between pairs of points, [ax, ay, az, bx, by, bz, thickness], as instances of one box.
export function bars(list, m) {
  const im = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), m, list.length), o = new THREE.Object3D();
  list.forEach(([ax, ay, az, bx, by, bz, t], i) => {
    o.position.set((ax + bx) / 2, (ay + by) / 2, (az + bz) / 2);
    o.lookAt(bx, by, bz);
    o.scale.set(t, t, Math.hypot(bx - ax, by - ay, bz - az));
    o.updateMatrix();
    im.setMatrixAt(i, o.matrix);
  });
  im.castShadow = true;
  return im;
}
// A square lattice tower on y = 0: four legs from w0 apart at the foot to w1 at the head, h high in
// `bays`, with a girt round it at each bay and bracing on every face (`cross`: both diagonals;
// otherwise one, zigzag). Returns its bars in two lists, by bands of `band` bays, to be painted
// in two colours (aviation red and white) or one.
export function lattice(w0, w1, h, bays, t, { cross = false, band = 2 } = {}) {
  const lists = [[], []], W = (y) => (w0 + (w1 - w0) * (y / h)) / 2, C = [[-1, -1], [1, -1], [1, 1], [-1, 1]];
  for (let i = 0; i < bays; i++) {
    const y0 = (i / bays) * h, y1 = ((i + 1) / bays) * h, a = W(y0), b = W(y1), L = lists[Math.floor(i / band) % 2];
    C.forEach(([x, z], k) => {
      const [x2, z2] = C[(k + 1) % 4];
      L.push([x * a, y0, z * a, x * b, y1, z * b, t * 1.5], [x * b, y1, z * b, x2 * b, y1, z2 * b, t]);
      if (cross || (i + k) % 2) L.push([x * a, y0, z * a, x2 * b, y1, z2 * b, t]);
      if (cross || !((i + k) % 2)) L.push([x2 * a, y0, z2 * a, x * b, y1, z * b, t]);
    });
  }
  return lists;
}

// LVM3 (GSLV Mk III), 43.5 m, its foot at y = 0: the L110 liquid core and the C25 cryogenic stage
// over it, 4 m across; the 5 m ogive fairing; and the two S200 solid boosters, 3.2 m across and
// 25 m tall under their slanted nose cones, at ±x. The markings are in the detail file.
export function lvm3() {
  const g = new THREE.Group(), seg = detail.low ? 20 : 36;
  g.add(cyl(2, 2, 32.6, WHITE, 0, 0.4, 0, seg), cyl(2.03, 2.03, 0.9, DARK, 0, 20.4, 0, seg), cyl(2.03, 2.03, 0.25, DARK, 0, 31.2, 0, seg));
  for (const x of [-0.85, 0.85]) g.add(cyl(0.45, 0.8, 1.6, NOZZLE, 0, -1.2, x, 16));
  const og = [[2, 0], [2.5, 1.1], [2.5, 5.6]];
  for (let k = 1; k <= 10; k++) { const u = k / 10; og.push([2.5 * Math.cos(u * 1.42) ** 0.8 * (1 - 0.04 * u), 5.6 + 4.9 * Math.sin(u * 1.42) / Math.sin(1.42)]); }
  og.push([0, 10.55]);
  g.add(lathe(og, FAIRING, seg).translateY(32.95));
  for (const s of [-1, 1]) {
    const b = new THREE.Group();
    b.add(cyl(1.6, 1.6, 21.6, WHITE, 0, 0.6, 0, seg));
    for (const y of [0.6, 7.8, 15.0, 21.6]) b.add(cyl(1.64, 1.64, 0.35, y === 0.6 ? DARK : STEEL, 0, y, 0, seg));
    // The nose cone, slanted towards the core, and the nozzle canted away from it.
    const cone = new THREE.LatheGeometry([[1.6, 0], [1.5, 0.7], [0.5, 3.2], [0.15, 3.65], [0, 3.7]].map(([r, y]) => new THREE.Vector2(r, y)), seg), p = cone.attributes.position;
    for (let k = 0; k < p.count; k++) p.setX(k, p.getX(k) - s * 0.3 * p.getY(k));
    cone.computeVertexNormals();
    b.add(mesh(cone, WHITE, 0, 22.2, 0));
    const nz = cyl(0.8, 1.45, 2.4, NOZZLE, 0, -1.7, 0, 20);
    nz.rotation.z = -s * 0.1;
    b.add(nz);
    // Its attachments to the core.
    for (const y of [2.2, 19.5]) b.add(box(1.0, 0.3, 0.5, STEEL, -s * 1.7, y, 0));
    g.add(at(b, s * 3.75, 0, 0));
  }
  return g;
}

// The umbilical tower: a steel lattice 70 m high with a floor every 10 m, the lift shaft up its
// back, a lightning rod, and the arms that reach across to the stages and the fairing.
function umbilicalTower() {
  const g = new THREE.Group(), { w, h } = UT, [a, b] = lattice(w, w, h, 14, 0.42, { cross: true });
  g.add(bars([...a, ...b], STEEL));
  for (let y = 10; y <= h; y += 10) g.add(box(w + 1.4, 0.3, w + 1.4, STEEL, 0, y, 0));
  g.add(box(3.2, h + 4, 3.2, WHITE, 0, 0, -w / 2 + 2.2), box(w + 2, 3, w + 2, WHITE, 0, h + 0.3, 0), cyl(0.12, 0.3, 14, STEEL, 0, h + 3.3, 0, 8));
  // The service arms, as lattice boxes, each ending in a plate at the rocket's skin.
  const front = w / 2, reach = -UT.z - 2.2 - front;
  for (const [y, x] of [[Y0 - DECK + 14, -1.5], [Y0 - DECK + 26, 1.5], [Y0 - DECK + 35.5, 0]]) {
    const arm = new THREE.Group(), [p, q] = lattice(2.2, 2.2, reach, 3, 0.2, { cross: true });
    arm.add(bars([...p, ...q], STEEL), box(2.6, 0.2, 2.6, STEEL, 0, reach - 0.2, 0));
    arm.rotation.x = Math.PI / 2;
    g.add(at(arm, x, y, front));
  }
  return g;
}

export function buildSriharikota() {
  const g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  // The island: sand and scrub, the Bay of Bengal along its east shore.
  g.add(sheet(4000, 4000, M.sea, 0, 0.05, 0), box(1500, 0.2, 4000, SAND, -330, 0, 0), box(60, 0.12, 4000, mat('#e6d8b4', 0.95), 440, 0, 0));
  // The pad: a concrete deck round the mouth of the flame trench, which runs out to the south
  // between walls, and under the rocket the wedge of the jet deflector.
  const pad = new THREE.Group(), T = 7;
  pad.add(box(84, DECK, 34, CONCRETE, 0, 0.2, -25), box(42 - T, DECK, 50, CONCRETE, -(42 + T) / 2, 0.2, 17), box(42 - T, DECK, 50, CONCRETE, (42 + T) / 2, 0.2, 17));
  for (const s of [-1, 1]) pad.add(box(1.2, DECK * 0.8, 46, CONCRETE, s * (T + 0.6), 0.2, 65));
  pad.add(box(T * 2, 0.3, 112, DARK, 0, 0.2, 44));
  const wedge = box(T * 2, 0.8, 13, DARK, 0, 0, 0);
  wedge.rotation.x = 0.62;
  pad.add(at(wedge, 0, 2.4, -3.5));
  f.add(mergeByMaterial(pad));
  // The mobile launch pedestal: a steel box on its bogies, spanning the trench, with the two
  // tail service masts beside the core.
  const mlp = new THREE.Group();
  mlp.add(box(22, MLP - 1, 17, STEEL, 0, DECK + 1.2, 0), box(22.6, 0.25, 17.6, WHITE, 0, DECK + MLP + 0.2, 0));
  for (const x of [-9, 9]) for (const z of [-7, 7]) mlp.add(box(3.4, 1.2, 2.2, DARK, x, DECK + 0.2, z));
  for (const x of [-1, 1]) mlp.add(box(1.2, 5, 1.2, STEEL, x * 1.6, DECK + MLP + 0.45, -4.2), cyl(1.9, 1.9, 0.8, STEEL, x * 3.75, DECK + MLP + 0.45, 0, 20));
  mlp.add(cyl(2.3, 2.3, 0.8, STEEL, 0, DECK + MLP + 0.45, 0, 24));
  f.add(mergeByMaterial(mlp));
  f.add(at(lvm3(), 0, Y0 + 0.25, 0));
  f.add(at(umbilicalTower(), 0, DECK + 0.2, UT.z));
  // The four lightning masts, banded red and white, a rod at each head.
  const red = [], white = [], [r0, w0] = lattice(8.5, 1.4, MAST_H - 8, 28, 0.26, { band: 4 });
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    const mv = ([ax, ay, az, bx, by, bz, t]) => [ax + sx * MAST, ay + 0.2, az + sz * MAST, bx + sx * MAST, by + 0.2, bz + sz * MAST, t];
    red.push(...r0.map(mv));
    white.push(...w0.map(mv));
    f.add(cyl(0.08, 0.3, 8, STEEL, sx * MAST, MAST_H - 7.8, sz * MAST, 6), box(10.5, 0.6, 10.5, CONCRETE, sx * MAST, 0.2, sz * MAST));
  }
  f.add(bars(red, RED), bars(white, WHITE));
  // The track: twin lines on a causeway level with the deck, from the pad west to the assembly
  // building, which stands on the same level: a plain tall block, its door the height of the rocket.
  const L = -VAB.x - 42;
  g.add(box(L, DECK, 30, CONCRETE, -42 - L / 2, 0.2, 0));
  for (const z of [-7, 7]) g.add(at(track(L + 46, { ballast: false }), -19 - L / 2, DECK + 0.2, z));
  g.add(box(VAB.w + 30, DECK, VAB.d + 40, CONCRETE, VAB.x - VAB.w / 2, 0.2, 0), box(VAB.w, VAB.h, VAB.d, WHITE, VAB.x - VAB.w / 2, DECK + 0.2, 0));
  addDetails(f, g);
  return { group: g, focus: f, view: [0.32, 0.1, 1], zoom: 0.5, target: [0, 44, 0] };
}

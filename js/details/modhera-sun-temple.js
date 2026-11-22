import * as THREE from 'three';
import { M, mat, mesh, box, cyl, at, onFace, FACES, inst, aroundRect } from '../helpers.js';
import { mouldings, frieze, templeNiche, idol, cuspedArchGeo, bracketGeo, mergeByMaterial } from '../parts/components.js';
import { templeDoorway, steps } from '../parts/doorways.js';
import { figureRow, figureFrieze } from '../parts/sculpture.js';
import { trees, shrubs, asiBoard, lampPosts, scatter, along } from '../parts/realism.js';
import { detail } from '../detail.js';

// Modhera's golden-brown sandstone.
export const SAND = mat('#c99f63', 0.9);
export const SHADE = mat('#a57e49', 0.92);
// D: the height of the ground above the floor of the tank. KUND: the tank, centred on z = cz,
// HX by HZ in half, with N terraces each T wide and H high.
export const D = 8;
export const KUND = { cz: 35.5, HX: 27, HZ: 18.5, T: 3.4, H: 1.9, N: 4 };
export const PROF = (t) => 1 - 0.62 * Math.pow(t, 1.35);

// The plan of the Sabhamandapa: a square with each corner cut back in steps, so that it reads as
// a star, 15 m across its arms ([x, z] points, scaled by s).
export function starPlan(s = 1) {
  const q = [[2.6, 7.5], [2.6, 6.3], [4.4, 6.3], [4.4, 5.4], [5.4, 5.4], [5.4, 4.4], [6.3, 4.4], [6.3, 2.6], [7.5, 2.6]], pts = [];
  for (const [sx, szz, rev] of [[1, 1, false], [1, -1, true], [-1, -1, false], [-1, 1, true]]) for (const [x, z] of rev ? [...q].reverse() : q) pts.push([sx * x * s, szz * z * s]);
  return pts;
}

// A carved pillar of the Maru-Gurjara kind, h high: a moulded square base, an octagonal lower
// shaft, a round upper shaft girdled with carved bands, and a bracket capital. Returned as
// [geometry, material] pairs to be instanced.
function pillarParts(h) {
  const g = new THREE.Group(), S = SAND, r = 0.34;
  g.add(box(0.9, 0.3, 0.9, S), box(0.76, 0.3, 0.76, S, 0, 0.3, 0), cyl(r, r * 1.08, h * 0.38, S, 0, 0.6, 0, 8));
  g.add(cyl(r * 0.92, r * 0.92, h * 0.62 - 1.15, S, 0, 0.6 + h * 0.38, 0, 12));
  for (const t of [0.3, 0.5, 0.66, 0.8]) g.add(cyl(r * 1.22, r * 1.22, h * 0.055, frieze(S), 0, h * t, 0, 12));
  g.add(cyl(r * 1.5, r * 0.95, 0.3, S, 0, h - 0.55, 0, 12), box(0.95, 0.25, 0.95, S, 0, h - 0.25, 0));
  if (!detail.low) for (const a of FACES) g.add(onFace(mesh(bracketGeo(0.4, 0.45, 0.26), S, 0, h - 0.25, 0), a, 0.3));
  return mergeByMaterial(g).children.map((o) => [o.geometry, o.material]);
}

// The Sabhamandapa, after photographs: open on every side, a low seat wall with a sloping back
// running round the plinth between the four entrances; short pillars standing on the seat at
// every corner of the plan and tall ones within, eight of them in a ring under the dome; cusped
// garland arches (toranas) between the pillars of each entrance and round the ring. Dimensions
// follow js/monuments/modhera-sun-temple.js: the plinth 1.2 high on starPlan, beams at 5.4.
function sabha(f, sz) {
  const d = at(new THREE.Group(), 0, D, sz), S = SAND, Sd = SHADE, P = 1.2;
  const q = [[2.6, 7.5], [4.4, 6.3], [5.4, 5.4], [6.3, 4.4], [7.5, 2.6]], short = [], tall = [];
  for (const sx of [-1, 1]) for (const s2 of [-1, 1]) for (const [x, z] of q) short.push([sx * (x - 0.5), P + 1, s2 * (z - 0.5), 1, 1, 1, 0]);
  for (let k = 0; k < 8; k++) { const a = (k + 0.5) / 8 * Math.PI * 2; tall.push([Math.sin(a) * 3.5, P, Math.cos(a) * 3.5, 1, 1, 1, a]); }
  for (const a of FACES) for (const l of [-2.1, 2.1]) tall.push([Math.sin(a) * 5.2 + Math.cos(a) * l, P, Math.cos(a) * 5.2 - Math.sin(a) * l, 1, 1, 1, 0]);
  for (const [geo, m] of pillarParts(3.2)) d.add(inst(geo, short, m));
  for (const [geo, m] of pillarParts(4.2)) d.add(inst(geo, tall, m));
  // The seat wall: along every edge of the plan except the ends of the four arms.
  const seat = new THREE.Group(), pts = starPlan(1);
  pts.forEach(([x0, z0], i) => {
    const [x1, z1] = pts[(i + 1) % pts.length], len = Math.hypot(x1 - x0, z1 - z0);
    if (len > 5) return;
    const along = Math.abs(x1 - x0) > 0.01, mx = (x0 + x1) / 2, mz = (z0 + z1) / 2, ox = along ? 0 : -Math.sign(mx) * 0.3, oz = along ? -Math.sign(mz) * 0.3 : 0;
    seat.add(box(along ? len : 0.6, 1, along ? 0.6 : len, frieze(S), mx + ox, P, mz + oz));
    const back = box(along ? len : 0.14, 0.85, along ? 0.14 : len, Sd, mx + ox * 0.2, P + 1, mz + oz * 0.2);
    if (along) back.rotation.x = Math.sign(mz) * 0.3; else back.rotation.z = -Math.sign(mx) * 0.3;
    seat.add(back);
  });
  d.add(mergeByMaterial(seat));
  // The toranas: one across each entrance, one a bay within, and eight round the ring.
  const arches = new THREE.Group();
  for (const a of FACES) for (const [dist, w] of [[7.0, 4.2], [5.2, 4.2]]) arches.add(onFace(mesh(cuspedArchGeo(w - 0.6, 1.5, 0.22), S, 0, 5.4, 0), a, dist));
  for (let k = 0; k < 8; k++) arches.add(onFace(mesh(cuspedArchGeo(2.1, 1.2, 0.2), S, 0, 5.4, 0), (k / 8) * Math.PI * 2, 3.5 * Math.cos(Math.PI / 8)));
  d.add(mergeByMaterial(arches));
  f.add(d);
}

// The kirti torana: the two pillars left of the gateway arch at the head of the tank's steps, each
// on a moulded base, banded with carving, with the stub of the arch on its bracket capital.
function torana(f) {
  const d = new THREE.Group(), S = SAND, Sd = SHADE, z = KUND.cz - KUND.HZ - 2.2;
  for (const s of [-1, 1]) {
    const p = at(new THREE.Group(), s * 2.9, D, z);
    p.add(box(1.7, 0.5, 1.7, Sd), box(1.4, 0.9, 1.4, frieze(S), 0, 0.5, 0), box(1.15, 1.5, 1.15, S, 0, 1.4, 0), cyl(0.5, 0.56, 2.6, S, 0, 2.9, 0, 8));
    for (const y of [2.9, 3.9, 4.9]) p.add(cyl(0.64, 0.64, 0.3, frieze(S), 0, y, 0, 8));
    p.add(cyl(0.8, 0.5, 0.4, S, 0, 5.5, 0, 8), box(1.5, 0.35, 1.5, Sd, 0, 5.9, 0), box(1.1, 0.6, 1.1, frieze(S), 0, 6.25, 0), box(1.6, 0.3, 1.3, Sd, -s * 0.2, 6.85, 0));
    const stub = box(1.3, 0.3, 0.5, S, -s * 0.9, 5.3, 0);
    stub.rotation.z = -s * 0.6;
    p.add(stub);
    d.add(p);
  }
  f.add(mergeByMaterial(d));
}

// The Gudhamandapa and the shrine, after photographs: the base is a stack of mouldings with bands
// of elephants and figures; the wall carries one tall row of gods in niches (the twelve Adityas
// among them) and a smaller row above, between carved bands; the hall has a balconied window on
// each side and its door on the east behind a porch of two pillars. Dimensions follow
// js/monuments/modhera-sun-temple.js: the block 15 x 24 at z = -28, the base B and the wall WH.
function shrine(f, { B, hz, gz }) {
  const d = at(new THREE.Group(), 0, D, 0), S = SAND, Sd = SHADE;
  const base = [[0.15, 0.35, 0.12, S], [0.6, 0.4, 0.06, frieze(S)], [1.15, 0.3, 0.14, S], [B + 0.3, 0.25, 0.08, Sd], [B + 3.3, 0.25, 0.1, Sd], [B + 5.2, 0.5, 0.06, frieze(S)]];
  const up = (k) => base.map(([y, h, p, c]) => [y + k * 0.01, h, p + (y < B ? 0.45 : 0), c]);
  d.add(at(mouldings(15, 24, up(0), S), 0, 0, -28), at(mouldings(16.4, 6.2, up(1), S), 0, 0, hz), at(mouldings(15.4, 5.8, up(2), S), 0, 0, gz));
  // Windows of the hall, and images on the shrine's three outer faces.
  for (const s of [-1, 1]) {
    const w = onFace(at(new THREE.Group(), 0, B + 1.4, 0), s * Math.PI / 2, 8.22);
    w.position.z += hz;
    w.add(box(2.6, 2.4, 0.06, M.recess, 0, 0, 0.03), box(3.2, 0.3, 0.7, Sd, 0, -0.3, 0.35), box(3.2, 0.3, 0.8, Sd, 0, 2.4, 0.4));
    for (const x of [-1.3, 0, 1.3]) w.add(cyl(0.13, 0.15, 2.4, S, x, 0, 0.5, 8));
    d.add(w);
    const n = onFace(at(templeNiche(1.3, 2.6, S, { figure: idol(2.3, Sd) }), 0, B + 0.7, 0), s * Math.PI / 2, 7.72);
    n.position.z += gz;
    d.add(n);
  }
  d.add(at(templeNiche(1.3, 2.6, S, { figure: idol(2.3, Sd) }), 0, B + 0.7, -41.02).rotateY(Math.PI));
  // The east porch and door.
  d.add(box(6, B, 3, Sd, 0, 0, -14.5), at(steps(3.4, B, 6, Sd, 0.34), 0, 0, -13), at(templeDoorway(1.5, 3, { m: S }), 0, B, -15.98));
  for (const x of [-2.3, 2.3]) d.add(cyl(0.3, 0.34, 3.6, S, x, B, -13.6, 8), box(0.8, 0.3, 0.8, Sd, x, B + 3.6, -13.6));
  d.add(box(6.2, 0.4, 3, S, 0, B + 3.9, -14.5), box(6.8, 0.2, 3.5, Sd, 0, B + 4.3, -14.4));
  f.add(mergeByMaterial(d));
  // The figures: a tall row and a smaller one, round the whole block, clear of the windows, the
  // niches and the porch.
  const figs = [];
  for (const [y, h] of [[B + 0.65, 2.3], [B + 3.65, 1.4]]) for (const [w, dd, z0] of [[15.04, 24.04, -28]]) aroundRect(w, dd, 0.85).forEach(([x, z, ry]) => {
    const zz = z + z0;
    if (zz > -16.5 && Math.abs(x) < 3.4) return;
    if (Math.abs(Math.abs(x) - 7.52) < 0.1 && (Math.abs(zz - hz) < 3.4 || Math.abs(zz - gz) < 3.2)) return;
    if (zz < -39.5 && Math.abs(x) < 4.2) return;
    figs.push([x, D + y, zz, 0.6, h, 0.32, ry]);
  });
  f.add(figureRow(figs, SHADE, { poses: ['standing', 'dancer', 'standing', 'mirror', 'chauri', 'musician'] }));
  if (!detail.low) for (const s of [-1, 1]) for (const [cz, len] of [[-28, 5.2], [-16.5, 1.6], [-38.6, 2.6]]) {
    const e = onFace(at(figureFrieze(len, 0.5, S, { pitch: 0.7, kinds: ['elephant'], proud: 0.1 }), 0, D + 1.02, 0), s * Math.PI / 2, 7.98);
    e.position.z += cz;
    f.add(e);
  }
}

// The Sun Temple at Modhera: its lawns, the neem trees of the garden and the ASI board.
export function addDetails(f, g, dims) {
  sabha(f, dims.sz);
  torana(f);
  shrine(f, dims);
  const { cz, HX, HZ } = KUND;
  g.add(trees(scatter(34, [-105, 105, -90, 110], { seed: 6, gap: 13, avoid: [[-HX - 14, HX + 14, -60, cz + HZ + 12], [-20, 60, cz, 140]] }), { kind: 'neem', seed: 6, y: D }));
  g.add(trees([...along(5, [-38, -44], [-38, 8]), ...along(5, [38, -44], [38, 8])], { kind: 'ashoka', seed: 7, y: D }));
  g.add(shrubs([...along(9, [-20, -44], [-20, 10]), ...along(9, [20, -44], [20, 10])].map(([x, z]) => [x, z, 1]), { y: D, seed: 8 }));
  g.add(shrubs(scatter(12, [-HX - 12, HX + 12, cz + HZ + 8, cz + HZ + 14], { seed: 9, gap: 4 }).filter(([x]) => x < -14 || x > 44).map(([x, z]) => [x, z, 1.4]), { y: D, seed: 9, flowers: '#d0306f' }));
  g.add(lampPosts([...along(4, [-HX - 6, cz - HZ], [-HX - 6, cz + HZ]), ...along(4, [HX + 6, cz - HZ], [HX + 6, cz + HZ])], { y: D }));
  g.add(asiBoard('Sun Temple, Modhera', -HX - 9, cz + HZ + 8, 0, { y: D }));
}

import * as THREE from 'three';
import { M, mat, mesh, box, rng, inst, unitBox, unitCyl, surface, photo } from '../helpers.js';
import { mergeByMaterial } from '../parts/components.js';
import { trees, shrubs, scatter, along, copies } from '../parts/realism.js';
import { airliner, jetBridge } from '../parts/transport.js';
import { detail } from '../detail.js';

// Bengaluru Terminal 2, finer detail and setting. The ceiling: bamboo battens laid criss-cross in
// two layers under the whole roof, and long skylights across the top of it. Bamboo fins stand
// up the glass. Under the canopy hang the planters: bamboo "bells" with green spilling out of
// them, on rods of different lengths, and veils of creeper down the front of the hall. The
// departures road runs along the front on its deck, a ramp at each end; below it the arrivals kerb
// with brick-red garden walls. Before the terminal a garden with lily ponds, trees and flowering
// shrubs; behind it the forest belt with its own pond between the hall and the gates; and on the
// far side of the gates the apron, airliners on their stands.
const ROOF_Y = 27, DECK_Y = 8, GATES_Z = -185;
const BAMBOO = photo(mat('#b47c45', 0.7), 'timber'), BAMBOO_DARK = photo(mat('#8f5f33', 0.75), 'timber'), BATTEN = surface(mat('#c08a4f', 0.7), 'none');
const BRICK = surface(mat('#a6533a', 0.9), 'terracotta'), CONCRETE = photo(mat('#c4c0b6', 0.9), 'concrete'), SKY = surface(mat('#3f565c', 0.2, 0.5), 'none');
const GREEN = mat('#4f8a3c', 0.95, 0, { flatShading: true }), GREEN_DARK = mat('#3a6e33', 0.95, 0, { flatShading: true }), ROD = surface(mat('#5a5148', 0.6, 0.4), 'none');
const APRON = mat('#b3b1ab', 0.95), YELLOW = surface(mat('#e3b520', 0.7), 'none'), PAINT = surface(mat('#eeeae0', 0.7), 'none'), WHITE = surface(mat('#eef0f1', 0.4, 0.1), 'none');
const MAST = surface(mat('#8f979c', 0.6, 0.5), 'none'), GLASS_DARK = surface(mat('#2b3b40', 0.15, 0.6), 'none');

// Battens on both diagonals under a rectangle of ceiling [x0, x1, z0, z1] at height y: the lower
// layer one way, the upper the other, so they cross as a woven lattice.
function lattice(x0, x1, z0, z1, y, step) {
  const out = [], c = Math.SQRT1_2, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, hw = (x1 - x0) / 2, hd = (z1 - z0) / 2, reach = hw + hd;
  for (const s of [-1, 1]) for (let o = -reach; o <= reach; o += step) {
    // The line x - s z = o sqrt 2 (about the centre), cut to the rectangle:
    // x = (o + t) c, z = s (t - o) c: |x| <= hw gives t in [-hw/c - o, hw/c - o]; |z| <= hd gives t in [o - hd/c, o + hd/c].
    const t0 = Math.max(-hw / c - o, o - hd / c), t1 = Math.min(hw / c - o, o + hd / c);
    if (t1 - t0 < 3) continue;
    const t = (t0 + t1) / 2;
    out.push([cx + (o + t) * c, y - (s > 0 ? 0.3 : 0.52), cz + s * (t - o) * c, t1 - t0, 0.24, 0.16, -s * Math.PI / 4]);
  }
  return out;
}

function architecture(f) {
  const step = detail.low ? 5 : 2.5;
  const battens = [...lattice(-214, 214, -81, 99, ROOF_Y, step), ...lattice(-335, 335, GATES_Z - 26.5, GATES_Z + 26.5, 14, step)];
  const lm = inst(unitBox(), battens, BATTEN);
  lm.castShadow = false;
  f.add(lm);
  // Skylights across the roof, one over every second bay; bamboo fins up the glass on every front.
  const sky = [], fins = [];
  for (let x = -198; x <= 198.01; x += 36) sky.push([x, ROOF_Y + 3.08, 9, 5, 0.1, 150]);
  for (let x = -315; x <= 315.01; x += 30) sky.push([x, 15.98, GATES_Z, 4, 0.1, 30]);
  const fs = detail.low ? 6 : 3;
  for (let x = -189; x <= 189.01; x += fs) fins.push([x, DECK_Y, 55.2, 0.22, ROOF_Y - DECK_Y, 0.6], [x, DECK_Y, -70.2, 0.22, ROOF_Y - DECK_Y, 0.6]);
  for (let z = -67; z <= 52.01; z += fs) for (const s of [-1, 1]) fins.push([s * 190.2, DECK_Y, z, 0.6, ROOF_Y - DECK_Y, 0.22]);
  for (let x = -327; x <= 327.01; x += fs * 2) for (const s of [-1, 1]) fins.push([x, 5.5, GATES_Z + s * 19.2, 0.2, 8.5, 0.5]);
  const sk = inst(unitBox(), sky, SKY), fn = inst(unitBox(), fins, BAMBOO);
  sk.castShadow = fn.castShadow = false;
  f.add(sk, fn);
  // The doors off the departures kerb: timber portals, and a horizontal bamboo band over them.
  const d = new THREE.Group();
  for (let x = -144; x <= 144; x += 72) d.add(box(16, 4.6, 3, BAMBOO_DARK, x, DECK_Y, 56.4), box(14.6, 3.8, 3.1, GLASS_DARK, x, DECK_Y, 56.42));
  d.add(box(380, 0.7, 1.2, BAMBOO_DARK, 0, DECK_Y + 5.4, 55.6));
  f.add(mergeByMaterial(d));
}

// The planters under the canopy and the veils of creeper on the hall's front.
function hanging(f) {
  const R = rng(31), bell = new THREE.LatheGeometry([[0.12, 2.5], [0.45, 2.3], [0.95, 1.6], [1.3, 0.7], [1.42, 0]].map(([r, y]) => new THREE.Vector2(r, y)), detail.low ? 8 : 14);
  const clump = new THREE.IcosahedronGeometry(1, 1).scale(1.35, 0.8, 1.35).translate(0, -0.1, 0), trail = new THREE.ConeGeometry(0.95, 2.6, 7).rotateX(Math.PI).translate(0, -1.6, 0);
  const bells = [], rods = [], trails = [];
  // In every bay between the two rows of columns, a group of two to four bells at different drops.
  for (let x = -198; x <= 198.01; x += 18) {
    const n = 2 + Math.floor(R() * 3);
    for (let k = 0; k < n; k++) {
      const px = x + (R() - 0.5) * 9, pz = 66 + R() * 21, drop = 3 + R() * 8, s = 0.8 + R() * 0.7, y = ROOF_Y - 0.6 - drop;
      bells.push([px, y - 2.5 * s, pz, s, R() * 6.28]);
      rods.push([px, y, pz, 0.07, drop, 0.07]);
      if (R() < 0.6) trails.push([px, y - 2.5 * s, pz, s, R() * 6.28]);
    }
  }
  // Smaller ones out under the roof's edge and down both sides.
  for (let x = -207; x <= 207.01; x += 9) if (R() < 0.6) { const drop = 2 + R() * 4, s = 0.6 + R() * 0.4, y = ROOF_Y - 0.6 - drop; bells.push([x, y - 2.5 * s, 97 + R() * 1.5, s, 0]); rods.push([x, y, 97.5, 0.06, drop, 0.06]); }
  const shell = copies(bell, surface(mat('#a8733f', 0.75, 0, { side: THREE.DoubleSide }), 'none'), bells);
  f.add(shell, copies(clump, GREEN, bells), copies(trail, GREEN_DARK, trails), inst(unitCyl(5), rods, ROD));
  // Veils: curtains of creeper hung on the glass between the doors, and green walls on the brick below.
  const veils = [], walls = [];
  for (let x = -180; x <= 180.01; x += 12) {
    if (Math.abs(((x + 180) % 72) - 36) < 10) continue;
    const h = 7 + R() * 9;
    veils.push([x + (R() - 0.5) * 3, ROOF_Y - 0.8 - h, 57.3, 4 + R() * 3.5, h, 0.5]);
  }
  for (let x = -176; x <= 176.01; x += 32) walls.push([x, 0.6, 57.2, 14, 6.4, 0.5]);
  for (const s of [-1, 1]) for (let z = -52; z <= 40; z += 30) walls.push([s * 192.2, 0.6, z, 0.5, 6.4, 14]);
  f.add(inst(unitBox(), veils, GREEN), inst(unitBox(), walls, GREEN_DARK));
}

// The departures road on its deck along the front, a straight ramp falling away at each end; the
// arrivals road under it; brick-red walls round the kerbside gardens.
function roads(f, g) {
  const d = new THREE.Group(), z0 = 57.6, z1 = 96, zc = (z0 + z1) / 2, X = 250;
  d.add(box(2 * X, 1.1, z1 - z0, CONCRETE, 0, DECK_Y - 1.1, zc), box(2 * X, 0.05, 22, M.asphalt, 0, DECK_Y, zc + 2), box(2 * X, 0.9, 0.35, BRICK, 0, DECK_Y, z1 - 0.2));
  for (const s of [-1, 1]) {
    const len = 190, ramp = box(len, 1.1, 24, CONCRETE, 0, -0.55, 0), top = box(len, 0.05, 20, M.asphalt, 0, 0.56, 0), pivot = new THREE.Group();
    pivot.add(ramp, top);
    pivot.position.set(s * (X + len / 2 - 0.5), (DECK_Y - 0.55 + 0.1) / 2 + 0.1, zc + 2);
    pivot.rotation.z = -s * Math.atan2(DECK_Y - 0.6, len);
    d.add(pivot);
    for (let k = 0; k < 4; k++) d.add(box(26, 0.1 + (DECK_Y - 1.8) * (1 - (k + 0.5) / 4.6), 1.6, BRICK, s * (X + 12 + k * 40), 0.3, zc + 2));
  }
  f.add(mergeByMaterial(d));
  const posts = [];
  for (let x = -243; x <= 243.01; x += 18) for (const z of [62, 92]) posts.push([x, 0, z, 1.3, DECK_Y - 1.1, 1.3]);
  f.add(inst(unitCyl(10), posts, BRICK));
  g.add(box(760, 0.06, 20, M.asphalt, 0, 0.3, 80), box(760, 0.06, 12, M.asphalt, 0, 0.3, 112));
  // Garden walls of brick, low and long, stepping through the planting before the kerb.
  const w = new THREE.Group();
  for (const [x, z, len, h, turn] of [[-150, 128, 90, 1.6, 0], [-40, 136, 70, 1.1, 0.08], [70, 130, 80, 1.8, -0.05], [170, 140, 60, 1.2, 0.1], [-205, 170, 50, 1.4, 1.2], [205, 178, 60, 1.4, -1.2], [0, 190, 110, 0.9, 0]]) {
    const b = box(len, h, 0.9, BRICK, 0, 0.3, 0);
    b.position.x = x; b.position.z = z; b.rotation.y = turn;
    w.add(b);
  }
  g.add(mergeByMaterial(w));
}

// Liveries: IndiGo and Akasa Air (both have bases here), Air India and Air India Express.
const LIVERY = {
  ai: { tail: '#c8102e', body: '#f4f1ea', engine: '#c8102e' },
  indigo: { tail: '#101f6e', belly: '#101f6e', engine: '#101f6e' },
  akasa: { tail: '#ff6a13', engine: '#4b2c83' },
  aix: { tail: '#f0611a', engine: '#17a39b' },
};
function apron(f, g) {
  const z0 = GATES_Z - 20, masts = [], heads = [], leads = [];
  const stands = [[-300, 'narrow', 'indigo'], [-250, 'narrow', 'akasa'], [-200, 'narrow', 'indigo'], [-138, 'wide', 'ai'], [-76, 'narrow', 'aix'], [-26, 'narrow', 'indigo'], [36, 'wide', 'ai'], [98, 'narrow', 'akasa'], [148, 'narrow', 'indigo'], [198, 'narrow', 'ai'], [262, 'wide', 'ai'], [318, 'narrow', 'indigo']];
  for (const [x, size, key] of stands) {
    const wide = size === 'wide', L = wide ? 57 : 37.6, R = wide ? 2.9 : 1.98, nose = z0 - 13;
    const plane = airliner({ size, ...LIVERY[key] });
    plane.position.set(x, 0.3, nose - L / 2);
    plane.rotation.y = -Math.PI / 2;
    const door = [x + R + 1.6, nose - (wide ? 9 : 6)], root = [x + 15, z0 - 2.4], dx = door[0] - root[0], dz = door[1] - root[1];
    const br = jetBridge(Math.hypot(dx, dz) - 2.6, { h: wide ? 4.9 : 3.6 });
    br.position.set(root[0], 0.3, root[1]);
    br.rotation.y = Math.atan2(-dz, dx);
    f.add(plane, br, box(2.6, 4, 3, WHITE, root[0], wide ? 5 : 3.8, z0 - 0.6));
    leads.push([x, 0.31, nose - (L + 30) / 2 + 4, 0.3, 0.02, L + 30]);
    masts.push([x - 24, 0.3, z0 - 5, 0.5, 28, 0.5]);
    heads.push([x - 24, 28.3, z0 - 5, 3.4, 1.2, 0.5]);
  }
  leads.push([0, 0.31, z0 - 118, 900, 0.02, 0.35], [0, 0.31, z0 - 200, 1300, 0.02, 0.35]);
  const ld = inst(unitBox(), leads, YELLOW);
  ld.castShadow = false;
  g.add(ld, inst(unitCyl(8), masts, MAST), inst(unitBox(), heads, MAST));
  g.add(box(1700, 0.3, 760, APRON, 0, 0, z0 - 374));
  // The runway beyond, with its centre line and threshold bars.
  g.add(box(1700, 0.05, 60, M.asphalt, 0, 0.3, z0 - 560));
  const marks = [];
  for (let x = -800; x <= 800; x += 75) marks.push([x, 0.36, z0 - 560, 30, 0.02, 0.9]);
  const mk = inst(unitBox(), marks, PAINT);
  mk.castShadow = false;
  g.add(mk);
}

// A pond: an irregular round sheet of still water with a stone rim, lily pads on it.
function pond(g, x, z, rx, rz, seed) {
  const R = rng(seed), pts = [];
  for (let k = 0; k < 28; k++) { const a = (k / 28) * Math.PI * 2, r = 1 + 0.14 * Math.sin(a * 3 + seed) + 0.08 * Math.sin(a * 5 + seed * 2); pts.push(new THREE.Vector2(rx * r * Math.cos(a), rz * r * Math.sin(a))); }
  const water = mesh(new THREE.ShapeGeometry(new THREE.Shape(pts)).rotateX(-Math.PI / 2), M.lake, x, 0.42, z);
  const rim = mesh(new THREE.ShapeGeometry(new THREE.Shape(pts.map((p) => p.clone().multiplyScalar(1.05)))).rotateX(-Math.PI / 2), mat('#8d8676', 0.95), x, 0.36, z);
  water.castShadow = rim.castShadow = false;
  g.add(rim, water);
  const pads = [];
  for (let k = 0; k < (detail.low ? 14 : 40); k++) { const a = R() * 6.28, r = Math.sqrt(R()) * 0.8; pads.push([x + rx * r * Math.cos(a), 0.43, z + rz * r * Math.sin(a), 0.5 + R() * 0.6, 0.03, 0.5 + R() * 0.6]); }
  const p = inst(unitCyl(7), pads, GREEN);
  p.castShadow = false;
  g.add(p);
}

export function addDetails(f, g) {
  const R = rng(63), H = ([x, z], lo, hi) => [x, z, lo + R() * (hi - lo), 0.3];
  architecture(f);
  hanging(f);
  roads(f, g);
  apron(f, g);
  // The garden's ground, from the far end of the forecourt back to the gates.
  g.add(box(1500, 0.3, 780, M.grass, 0, 0, 185));
  // Ponds: three in the garden before the kerb, and a long one in the forest belt.
  pond(g, -95, 215, 62, 30, 2); pond(g, 70, 175, 44, 24, 5); pond(g, 150, 265, 50, 28, 9); pond(g, 0, -118, 70, 17, 4);
  const water = [[-165, -25, 180, 250], [18, 122, 146, 204], [92, 208, 232, 298]], belt = [-320, 320, -160, -76], links = [[-104, -86, -170, -60], [86, 104, -170, -60], [-78, 78, -138, -98]];
  // The forecourt garden: big rain trees and mango well back from the kerb, jamun and palms nearer
  // it, kept low enough and open enough that the canopy shows over them.
  const lawn = [-330, 330, 128, 420], road = [[-22, 22, 120, 600]];
  g.add(trees(scatter(detail.low ? 24 : 60, [-520, 520, 250, 540], { seed: 3, gap: 22, avoid: [...water, ...road] }).map((p) => H(p, 12, 17)), { kind: 'banyan', seed: 3 }));
  g.add(trees(scatter(detail.low ? 20 : 44, lawn, { seed: 5, gap: 17, avoid: [...water, ...road] }).map((p) => H(p, 7, 11)), { kind: 'mango', seed: 5 }));
  g.add(trees(scatter(detail.low ? 16 : 36, [-300, 300, 126, 260], { seed: 8, gap: 15, avoid: [...water, ...road] }).map((p) => H(p, 6, 9)), { kind: 'jamun', seed: 8 }));
  g.add(trees([...along(9, [-240, 124], [-30, 124]), ...along(9, [30, 124], [240, 124]), ...scatter(18, lawn, { seed: 13, gap: 20, avoid: [...water, ...road] })].map((p) => H(p, 9, 13)), { kind: 'palm', seed: 13 }));
  g.add(box(30, 0.06, 420, M.asphalt, 0, 0.3, 330));
  // The forest belt between the hall and the gates: tall and close, with palms through it.
  g.add(trees(scatter(detail.low ? 60 : 170, belt, { seed: 21, gap: 7, avoid: links }).map((p) => H(p, 11, 17)), { kind: 'jamun', seed: 21 }));
  g.add(trees(scatter(detail.low ? 36 : 100, belt, { seed: 22, gap: 8, avoid: links }).map((p) => H(p, 12, 18)), { kind: 'teak', seed: 22 }));
  g.add(trees(scatter(detail.low ? 14 : 34, belt, { seed: 24, gap: 12, avoid: links }).map((p) => H(p, 12, 16)), { kind: 'palm', seed: 24 }));
  // Trees at the hall's two ends and beyond the ramps.
  g.add(trees([...scatter(26, [-420, -232, -150, 110], { seed: 31, gap: 16 }), ...scatter(26, [232, 420, -150, 110], { seed: 32, gap: 16 })].map((p) => H(p, 9, 14)), { kind: 'neem', seed: 31 }));
  // Shrubs: flowering beds along the kerb walls and round the ponds, clipped green between.
  const beds = scatter(detail.low ? 50 : 130, [-300, 300, 124, 300], { seed: 41, gap: 5, avoid: [...water, ...road] });
  g.add(shrubs(beds.filter((_, k) => k % 3 === 0).map(([x, z]) => [x, z, 1 + R() * 0.8, 0.3]), { flowers: '#d0306f', seed: 41 }));
  g.add(shrubs(beds.filter((_, k) => k % 3 === 1).map(([x, z]) => [x, z, 1 + R() * 0.8, 0.3]), { flowers: '#e8a41c', seed: 42 }));
  g.add(shrubs(beds.filter((_, k) => k % 3 === 2).map(([x, z]) => [x, z, 1.2 + R(), 0.3]), { seed: 43 }));
  g.add(shrubs(scatter(detail.low ? 40 : 110, belt, { seed: 45, gap: 5, avoid: links }).map(([x, z]) => [x, z, 1.2 + R() * 1.2, 0.3]), { seed: 45 }));
  // Planters on the departures deck between the columns at the kerb's edge.
  const deck = [];
  for (let x = -198; x <= 198.01; x += 18) deck.push([x, 94, 1.1, DECK_Y], [x + 3.5, 94.4, 0.8, DECK_Y], [x - 3.5, 94.4, 0.8, DECK_Y]);
  g.add(shrubs(deck, { seed: 47 }));
  // The piers of the two bridges, in brick.
  const piers = [];
  for (const x of [-95, 95]) for (let z = -150; z <= -84; z += 22) piers.push([x, 0, z, 2, DECK_Y - 0.8, 2]);
  f.add(inst(unitBox(), piers, BRICK));
}

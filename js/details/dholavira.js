import * as THREE from 'three';
import { M, mat, mesh, box, cyl, at, inst, unitBox, unitCyl, surface, sheet } from '../helpers.js';
import { heightField, fbm, smooth } from '../parts/terrain.js';
import { trees, shrubs, asiBoard, scatter } from '../parts/realism.js';
import { mergeByMaterial } from '../parts/components.js';
import { STONE, STONE_DARK, DRESSED, houses, RES, LIFT, EAST_GATE } from '../monuments/dholavira.js';
import { detail } from '../detail.js';

const SALT = mat('#ece8dc', 0.9);
const BOARD = mat('#3a2e24', 0.9), SIGN = mat('#f1ece0', 0.6), BED = mat('#3b332a', 0.95);
// The banded limestone of the pillar members, polished; and the sun-dried brick of the tumuli.
const LIME = surface(mat('#a07c6b', 0.35), 'none'), MUDBRICK = surface(mat('#b79c74', 0.97), 'masonry');

// A pillar base of polished limestone, 1 across and 1 high before scaling: a spool, two flat
// discs joined by a concave waist, as they stand in the chambers of the gates.
const spoolGeo = () => new THREE.LatheGeometry([[0, 0], [0.5, 0], [0.5, 0.28], [0.36, 0.38], [0.33, 0.5], [0.36, 0.62], [0.5, 0.72], [0.5, 1], [0, 1]].map(([r, y]) => new THREE.Vector2(r, y)), 20);

// The signboard found fallen in the western chamber of the north gate: ten signs of the Indus
// script, each about 37 cm high, cut from gypsum and inlaid in a timber board some 3 m long.
// Drawn from the excavators' tracing (Wikimedia Commons, "The 'Ten Indus Scripts' discovered
// near the northern gateway of the Dholavira citadel"), from left to right: a spoked wheel; a
// box on a stem; a crossed lozenge on a stem; the wheel; a diamond; a cross; a single stroke; the
// wheel twice; and two triangles joined at their points. Shown standing, as a display.
function signboard() {
  const g = new THREE.Group(), s = 0.37, t = 0.09, z = 0.03;
  const bar = (o, x0, y0, x1, y1) => { const b = box(Math.hypot(x1 - x0, y1 - y0) + t * 0.5, t, 0.06, SIGN, 0, -t / 2, 0); b.position.set((x0 + x1) / 2, (y0 + y1) / 2, 0); b.rotation.z = Math.atan2(y1 - y0, x1 - x0); o.add(b); };
  const oval = (o, rx, ry, x = 0, y = 0, turn = 0) => { const r = mesh(new THREE.RingGeometry(1 - t / rx, 1, 24), SIGN, x, y, 0); r.scale.set(rx, ry, 1); r.rotation.z = turn; o.add(r); };
  const wheel = (o) => { oval(o, 0.4, 0.5); bar(o, 0, -0.46, 0, 0.46); bar(o, -0.32, -0.26, 0.32, 0.26); bar(o, -0.32, 0.26, 0.32, -0.26); };
  const signs = [
    wheel,
    (o) => { bar(o, -0.42, 0.45, 0.42, 0.45); bar(o, -0.42, 0.12, 0.42, 0.12); bar(o, -0.42, 0.12, -0.42, 0.45); bar(o, 0.42, 0.12, 0.42, 0.45); bar(o, 0, 0.12, 0, -0.5); },
    (o) => { oval(o, 0.4, 0.2, 0, 0.2, 0.5); bar(o, -0.4, 0.42, 0.4, -0.02); bar(o, -0.36, 0, 0.36, 0.4); bar(o, 0, 0.05, 0, -0.5); },
    wheel,
    (o) => { bar(o, 0, 0.5, 0.4, 0); bar(o, 0.4, 0, 0, -0.5); bar(o, 0, -0.5, -0.4, 0); bar(o, -0.4, 0, 0, 0.5); },
    (o) => { bar(o, -0.3, 0.5, 0.3, -0.5); bar(o, 0.3, 0.5, -0.3, -0.5); },
    (o) => bar(o, 0, 0.5, 0, -0.5),
    wheel, wheel,
    (o) => { bar(o, -0.45, 0.3, 0.45, -0.3); bar(o, -0.45, -0.3, 0.45, 0.3); bar(o, -0.45, 0.3, -0.45, -0.3); bar(o, 0.45, 0.3, 0.45, -0.3); },
  ];
  signs.forEach((draw, k) => { const o = at(new THREE.Group(), (k - 4.5) * 0.3, 0, z); o.scale.set(s * 0.72, s, 1); draw(o); g.add(o); });
  g.add(box(3.2, 0.62, 0.05, BOARD, 0, -0.31, 0));
  const stand = new THREE.Group();
  g.rotation.x = -0.3;
  stand.add(at(g, 0, 1.15, 0));
  for (const x of [-1.3, 1.3]) stand.add(box(0.08, 1, 0.08, BOARD, x, 0, -0.08));
  return mergeByMaterial(stand);
}

// Dholavira, finer detail and setting. From the excavation and photographs of the site: the
// chambers of the two gates carry the polished limestone bases of their pillars, spool-shaped on
// square slabs, and lengths of round column stand by the east gate; beside the north gate
// stands a copy of the great signboard; along the foot of the castle and the bailey the
// ceremonial ground has its stands, four broad steps for spectators, and the level field
// separates the castle from the middle town, whose houses stand to knee height on a grid of
// streets within its own wall; the lower town spreads over the east of the city. On the castle
// a second rampart stands within the first, and a great storm drain runs west across it and
// down into a tank in the bailey, where the round houses of the last settlers also stand. West
// of the city wall are the tumuli, low domes of mud brick, and the cemetery. Khadir Bet is a low
// island of dry scrub, and round it, to the horizon, the white salt of the Rann. Dimensions
// follow js/monuments/dholavira.js: the castle w by d, its platform at `top`, the north gate
// between x = ±8 at z = d / 2, the city between cx0..cx1 and cz0..cz1.
// f: the citadel; g: the site's own ground (both LIFT above the open land); land: the open land.
export function addDetails(f, g, land, { w, d, top, cx0, cx1, cz0, cz1, bx, R }) {
  const gz = d / 2, det = new THREE.Group();
  // The pillar bases: four in each chamber of the north gate, two in each of the east gate, each
  // on its slab; and two lengths of polished column standing at the east gate's inner end.
  const slabs = [], spools = [], ex = w / 2 - 6.5;
  for (const sx of [-1, 1]) for (let k = 0; k < 4; k++) {
    const x = sx * 5.25, z = gz - 15 + k * 4.2;
    slabs.push([x, top + 2.4, z, 1.2, 0.25, 1.2, 0]);
    spools.push([x, top + 2.65, z, 0.95, 0.5, 0.95, 0]);
  }
  for (const s of [-1, 1]) for (const k of [0, 1]) {
    slabs.push([ex - 2 + k * 5, top + 1.2, EAST_GATE.z + s * 4.25, 1.1, 0.25, 1.1, 0]);
    spools.push([ex - 2 + k * 5, top + 1.45, EAST_GATE.z + s * 4.25, 0.85, 0.45, 0.85, 0]);
  }
  det.add(inst(unitBox(), slabs, DRESSED), inst(spoolGeo(), spools, LIME));
  det.add(inst(unitCyl(16), [[ex - 12, top + 0.3, EAST_GATE.z - 3.4, 0.5, 1.5, 0.5, 0], [ex - 12, top + 0.3, EAST_GATE.z + 3.4, 0.5, 1.1, 0.5, 0]], LIME));
  // The signboard, beside the foot of the north gate's stair.
  det.add(at(signboard(), 7.5, 0, gz + 19));
  // The stands of the ceremonial ground: four steps, each 2 m deep, along the north foot of the
  // castle and the bailey, broken where the gate's stair comes down.
  const stands = [], sx0 = bx - 48, sx1 = w / 2 + 4;
  for (let k = 0; k < 4; k++) for (const [a, b] of [[sx0, -8.2], [8.2, sx1]]) stands.push([(a + b) / 2, 0, gz + 1 + k * 2, b - a, 2 - k * 0.5, 2, 0]);
  det.add(inst(unitBox(), stands, DRESSED));
  // The inner rampart: a second wall inside the first, the two with a walk between them, broken
  // at the gates and ragged along its top.
  const inner = [], ix = w / 2 - 14, iz = d / 2 - 14;
  const wall = (x0, z0, x1, z1) => {
    const len = Math.hypot(x1 - x0, z1 - z0), k = Math.round(len / 4), ry = Math.atan2(x1 - x0, z1 - z0);
    for (let i = 0; i < k; i++) {
      const u = (i + 0.5) / k, x = x0 + (x1 - x0) * u, z = z0 + (z1 - z0) * u;
      if (R() < 0.08 || (Math.abs(x) < 9 && z > 0) || (x > 0 && Math.abs(z - EAST_GATE.z) < 7)) continue;
      inner.push([x, top + 0.3, z, 2.6, 0.8 + R() * 1.5, len / k + 0.05, ry]);
    }
  };
  wall(-ix, -iz, ix, -iz); wall(-ix, iz, ix, iz); wall(-ix, -iz, -ix, iz); wall(ix, -iz, ix, iz);
  det.add(inst(unitBox(), inner, DRESSED));
  // The storm drain: a channel of slabs large enough to walk in, running west across the castle,
  // down the west face in a cascade and into the bailey's tank.
  const dz = -8, kerbs = [];
  for (const s of [-1, 1]) kerbs.push([-w / 4 + 4, top + 0.3, dz + s * 0.9, w / 2 - 6, 0.5, 0.5, 0], [10 + s * 0.9, top + 0.3, dz + 10, 0.5, 0.5, 20, 0]);
  for (let k = 0; k < 5; k++) kerbs.push([-w / 2 + 5.5 - k * 1.4, 5.5 + (top - 5.2) * (4 - k) / 5, dz, 1.4, (top - 5.2) / 5, 2.3, 0]);
  det.add(inst(unitBox(), kerbs, STONE_DARK), box(w / 2 - 6, 0.06, 1.3, BED, -w / 4 + 4, top + 0.3, dz), box(1.3, 0.06, 20, BED, 10, top + 0.3, dz + 10.6));
  const tx = -w / 2 - 12;
  for (const s of [-1, 1]) det.add(box(18, 0.9, 0.8, DRESSED, tx, 5.5, dz + s * 6), box(0.8, 0.9, 12.8, DRESSED, tx + s * 9, 5.5, dz));
  det.add(sheet(17.2, 11.2, M.river, tx, 5.5 + 0.45, dz));
  // The round houses on the bailey, built by the last people to live here: ring walls of rubble,
  // each with the stump of a stone post at its centre.
  for (const [x, z, r] of [[bx + 36, 24, 3.4], [bx + 30, 33, 2.8], [bx + 40, 34, 2.4]]) {
    det.add(mesh(new THREE.CylinderGeometry(r + 0.5, r + 0.6, 0.8, 20, 1, true), STONE, x, 5.9, z), mesh(new THREE.CylinderGeometry(r, r, 0.8, 20, 1, true).scale(-1, 1, 1), STONE_DARK, x, 5.9, z));
    det.add(mesh(new THREE.RingGeometry(r, r + 0.5, 20).rotateX(-Math.PI / 2), STONE, x, 6.3, z), cyl(0.25, 0.28, 0.7, LIME, x + 0.3, 5.5, z, 10));
  }
  f.add(mergeByMaterial(det));
  // The middle town, north of the ceremonial ground, inside its own wall; the lower town to the
  // east.
  const mz0 = gz + 58, mz1 = cz1 - 14;
  g.add(inst(unitBox(), houses(-120, 120, mz0, mz1, 0, R, 10), STONE));
  const mw = [];
  for (const z of [mz0 - 4, mz1 + 2]) for (let x = -126; x < 126; x += 6) if (R() > 0.1) mw.push([x + 3, 0, z, 6.05, 1.5 + R() * 1.4, 4, 0]);
  for (const x of [-128, 128]) for (let z = mz0 - 4; z < mz1; z += 6) if (R() > 0.1) mw.push([x, 0, z + 3, 4, 1.5 + R() * 1.4, 6.05, 0]);
  g.add(inst(unitBox(), mw, DRESSED));
  g.add(inst(unitBox(), houses(140, cx1 - 12, gz + 30, cz1 - 14, 0, R, 10), STONE));
  // Paths for visitors: up to the gate across the ground, and round to the east reservoir.
  g.add(box(4, 0.05, mz0 - gz - 24, M.path, 0, 0, (gz + 20 + mz0 - 4) / 2), box(86, 0.05, 4, M.path, 51, 0, gz + 30), box(4, 0.05, 40, M.path, 92, 0, gz + 10));
  g.add(asiBoard('Dholavira', -8, gz + 28, 0, { line2: 'WORLD HERITAGE SITE' }));
  // The tumuli, west of the city wall: low domes of mud brick, each inside a ring of stones; and
  // the cemetery beside them, graves lined with slabs.
  const tum = new THREE.Group(), graves = [];
  for (const [x, z, r, h] of [[cx0 - 62, 74, 16, 5], [cx0 - 70, 30, 9, 3.2], [cx0 - 40, 44, 5, 1.8]]) {
    const dome = mesh(new THREE.SphereGeometry(1, 32, 10, 0, Math.PI * 2, 0, Math.PI / 2), MUDBRICK, x, 0, z);
    dome.scale.set(r, h, r);
    tum.add(dome, mesh(new THREE.CylinderGeometry(r + 0.8, r + 1, 0.6, 32, 1, true), STONE, x, 0.3, z), mesh(new THREE.RingGeometry(r - 0.2, r + 0.8, 32).rotateX(-Math.PI / 2), STONE, x, 0.6, z));
  }
  for (let k = 0; k < 12; k++) {
    const x = cx0 - 32 - (k % 4) * 9 - R() * 3, z = -24 + Math.floor(k / 4) * 11 + R() * 3;
    graves.push([x, 0, z - 0.7, 2.8, 0.3, 0.25, 0], [x, 0, z + 0.7, 2.8, 0.3, 0.25, 0], [x - 1.4, 0, z, 0.25, 0.3, 1.65, 0], [x + 1.4, 0, z, 0.25, 0.3, 1.65, 0]);
  }
  g.add(tum, inst(unitBox(), graves, STONE));
  // Khadir Bet: low, scrubby hills rising round the city, falling at the island's edge to the
  // salt. The city's own ground stands LIFT above the open land; the land under it is cut away.
  const slab = (x, z, m = 0) => x > cx0 - 100 + m && x < cx1 + 40 - m && z > cz0 - 40 + m && z < cz1 + 40 - m;
  const landY = (x, z) => {
    const r = Math.hypot(x, (z - 60) * 1.15), inCity = smooth(370, 470, r);
    const hills = inCity * (10 + 45 * Math.max(0, fbm(x, z, { scale: 0.003, octaves: 4 }) + 0.3));
    if (slab(x, z, 10)) return LIFT - 12.5;
    return LIFT * smooth(1120, 720, r) - 0.7 + hills * smooth(1150, 780, r) - 0.6 * smooth(900, 1150, r);
  };
  land.add(heightField(2600, 2600, detail.low ? 120 : 180, landY, { cz: 60, cover: '#a99872', rock: ['#9b8a6b', '#8a7a5e', '#a69476'], band: 6, steep: 0.82 }));
  // The salt beyond the island, round the square of ground.
  for (const [x, z, sw, sd] of [[0, 60 - 2900, 9000, 3200], [0, 60 + 2900, 9000, 3200], [-2900, 60, 3200, 2600], [2900, 60, 3200, 2600]]) land.add(box(sw, 0.2, sd, SALT, x, 0.25, z));
  // Thorn scrub: babul, khejri and ber, on the island round the city, thinner inside its walls.
  const out = ([x, z]) => !slab(x, z, -8), onLand = ([x, z]) => [x, z, undefined, landY(x, z) - LIFT];
  g.add(trees(scatter(70, [-650, 650, -500, 700], { seed: 4, gap: 22 }).filter(out).map(onLand), { kind: 'babul', seed: 4 }));
  g.add(trees(scatter(40, [-650, 650, -500, 700], { seed: 7, gap: 24 }).filter(out).map(onLand), { kind: 'khejri', seed: 7 }));
  g.add(trees(scatter(14, [cx0 + 10, cx1 - 10, cz0 + 10, cz1 - 10], { seed: 9, gap: 30, avoid: [[-w / 2 - 110, w / 2 + 10, -d / 2 - 10, d / 2 + 30], ...RES.map(([x, z, rw, rl]) => [x - rw / 2 - 4, x + rw / 2 + 4, z - rl / 2 - 4, z + rl / 2 + 4]), [-130, 130, gz + 10, gz + 55]] }), { kind: 'ber', seed: 9 }));
  g.add(shrubs(scatter(120, [-500, 500, -400, 600], { seed: 12, gap: 8 }).filter(out).map(([x, z]) => [x, z, 1, landY(x, z) - LIFT]), { dry: true, size: 1 }));
  // The site museum and the rest house, south-east of the city.
  const mus = new THREE.Group();
  mus.add(box(26, 5.5, 12, mat('#d8c9a8', 0.9), 0, -1, 0), box(28, 0.4, 14, mat('#8d7a5c', 0.9), 0, 4.5, 0));
  mus.add(cyl(0.12, 0.12, 7, mat('#5b5b5b', 0.6), 16, -1, 0, 6));
  g.add(at(mus, cx1 + 64, 0, cz0 + 10));
}

import * as THREE from 'three';
import { M, mat, mesh, box, cyl, at, hemi, rng, inst, unitBox, TIBETAN, surface } from '../helpers.js';
import { mergeByMaterial } from '../parts/components.js';
import { rabsel, quarters, hall, maniWheels } from '../parts/tibetan.js';
import { tibetanDoor } from '../parts/doorways.js';
import { trees, prayerFlags, scatter } from '../parts/realism.js';
import { detail } from '../detail.js';
import { ground, BLOCKS, LEAN, PAD, PEAK, MUD, PARAPET } from '../monuments/leh-palace.js';

// Leh Palace, finer detail. From photographs of the south front:
// - the walls are nearly blank at the foot (stores and stables: a few slits) and open up storey by
//   storey, to rows of timber-framed windows under projecting lintels on the royal floors;
// - the central bay carries the great balconies, timber boxes of lattice lights two storeys deep,
//   with smaller window bays (rabsel) on the apartments either side and above;
// - the entrance is in the east wing, a timber porch on carved posts at the head of a ramp;
// - prayer flags fly from poles on every roof and in strings from the top.
// Dimensions follow js/monuments/leh-palace.js (BLOCKS; the rock shelf at PAD; storeys of 3 m).
const TIMBER = surface(mat('#6b4a30', 0.8), 'none'), TIMBER_DARK = surface(mat('#4a3020', 0.8), 'none'), PANE = surface(mat('#2a2622', 0.6), 'none'), LIME = surface(mat('#e9e2d2', 0.9), 'none');
const FLAGS = ['#9a2b22', '#2f5d8a', '#e2b22f', '#3f7d4f', '#f1ede4'].map((c) => surface(mat(c, 0.8, 0, { side: THREE.DoubleSide }), 'none'));

// Instances of a unit shape set on the battered walls: each place is a point on a wall, the way
// the wall faces and a size; the shape leans back with the wall.
function onWalls(geo, places, m) {
  const im = new THREE.InstancedMesh(geo, m, places.length), o = new THREE.Object3D(), TILT = Math.atan(LEAN);
  places.forEach(([x, y, z, a, sx, sy, sz], i) => {
    o.position.set(x, y, z);
    o.rotation.set(0, a, 0);
    o.rotateX(-TILT);
    o.scale.set(sx, sy, sz);
    o.updateMatrix();
    im.setMatrixAt(i, o.matrix);
  });
  im.castShadow = false;
  im.receiveShadow = true;
  return im;
}
// The point on face `a` of a block (0 the south front, ±π/2 the east and west, π the north), lat
// along the face and y up it.
function wallPoint([bx, bz, w, d, y0], a, lat, y) {
  const side = Math.abs(Math.sin(a)) > 0.5, dist = (side ? w : d) / 2 - LEAN * (y - y0);
  return [bx + Math.sin(a) * dist + Math.cos(a) * lat, y, bz + Math.cos(a) * dist - Math.sin(a) * lat];
}
// Is a point of a wall buried in another block?
const inside = (x, y, z, self) => BLOCKS.some((b) => b !== self && y < b[5] - 0.2 && y > b[4] && Math.abs(x - b[0]) < b[2] / 2 - LEAN * (y - b[4]) + 0.3 && Math.abs(z - b[1]) < b[3] / 2 - LEAN * (y - b[4]) + 0.3);

function windows(f) {
  const R = rng(9), panes = [], lintels = [], sills = [], jambs = [], beams = [], bays = new THREE.Group();
  for (const b of BLOCKS) {
    const [, , w, d, y0, y1] = b;
    for (const a of detail.low ? [0, Math.PI / 2, -Math.PI / 2] : [0, Math.PI / 2, -Math.PI / 2, Math.PI]) {
      const len = (Math.abs(Math.sin(a)) > 0.5 ? d : w), front = a === 0;
      for (let y = Math.max(y0, PAD) + 1.0; y < y1 - 1.9; y += 3) {
        const n = Math.round((y - PAD) / 3), run = len - 2 * LEAN * (y - y0) - 2.4;
        // Slits low down, small windows in the middle storeys, full windows on the royal floors.
        const [pitch, ww, wh] = n < 2 ? [7.5, 0.35, 0.9] : n < 5 ? [4.4, 0.75, 1.2] : [3.1, 1.0, 1.5], m = Math.max(1, Math.floor(run / pitch));
        for (let k = 0; k < m; k++) {
          const lat = -run / 2 + (k + 0.5) * (run / m), [x, , z] = wallPoint(b, a, lat, y);
          if (inside(x + Math.sin(a) * 0.4, y + 0.5, z + Math.cos(a) * 0.4, b) || (n < 5 && R() < 0.25)) continue;
          // A window bay in place of a window here and there on the upper floors of the south front.
          if (front && n >= 5 && b !== BLOCKS[3] && k % 3 === 1 && y < y1 - 3) { const r = at(rabsel(2.3, 1.9), x, y - 0.2, z - LEAN * 1.9); bays.add(r); continue; }
          panes.push([x, y, z, a, ww, wh, 0.08]);
          lintels.push([x, y + wh, z, a, ww + 0.7, 0.16, 0.34], [x, y + wh + 0.16, z, a, ww + 1.0, 0.12, 0.46]);
          if (n >= 2) { sills.push([x, y - 0.12, z, a, ww + 0.4, 0.12, 0.26]); jambs.push([x, y, z, a, ww + 0.24, wh, 0.05]); }
        }
      }
      // The ends of the roof beams under each parapet.
      if (!detail.low) { const run = len - 2 * LEAN * (y1 - y0), m = Math.floor(run / 0.7); for (let k = 0; k < m; k++) { const [x, , z] = wallPoint(b, a, -run / 2 + (k + 0.5) * (run / m), y1 - 0.3); beams.push([x, y1 - 0.3, z, a, 0.16, 0.16, 0.24]); } }
    }
  }
  const out = () => new THREE.BoxGeometry(1, 1, 1).translate(0, 0.5, 0.5);
  f.add(onWalls(out(), panes, PANE), onWalls(out(), lintels, TIMBER), onWalls(out(), sills, TIMBER), onWalls(out(), jambs, LIME), onWalls(out(), beams, TIMBER_DARK));
  mergeByMaterial(bays);
  f.add(bays);
}

// A great balcony: a timber box w wide and h high standing 1.3 m out from the wall at z = 0 on
// brackets, glazed in lattice lights between posts, under a roof of planks.
function balcony(w, h) {
  const g = new THREE.Group(), n = Math.round(w / 1.1);
  g.add(box(w, h, 1.3, TIMBER_DARK, 0, 0, 0.65), box(w + 0.4, 0.22, 1.6, TIMBER, 0, -0.22, 0.8), box(w + 0.7, 0.16, 1.9, TIMBER, 0, h, 0.95), box(w + 0.3, 0.14, 1.6, FLAGS[0], 0, h - 0.16, 0.8));
  for (let k = 0; k < n; k++) {
    const x = -w / 2 + (k + 0.5) * (w / n);
    g.add(box(w / n - 0.2, h * 0.5, 0.05, PANE, x, h * 0.36, 1.31), box(w / n - 0.2, h * 0.24, 0.05, TIMBER, x, h * 0.08, 1.31));
    if (!detail.low) g.add(box(0.05, h * 0.5, 0.05, TIMBER, x, h * 0.36, 1.34), box(w / n - 0.2, 0.05, 0.05, TIMBER, x, h * 0.6, 1.34));
  }
  for (let k = 0; k <= 4; k++) g.add(box(0.2, 0.6, 1.1, TIMBER, -w / 2 + 0.3 + k * ((w - 0.6) / 4), -0.8, 0.55));
  return g;
}

function architecture(f) {
  const d = new THREE.Group(), c = BLOCKS[3], zf = (y) => c[1] + c[3] / 2 - LEAN * (y - c[4]);
  // The central bay: two great balconies one over the other, and a smaller one under them.
  d.add(at(balcony(9, 2.3), c[0], 50.4, zf(52.7) - 0.05), at(balcony(9, 2.3), c[0], 47.2, zf(49.5) - 0.05), at(balcony(5, 2), c[0], 44.2, zf(46.2) - 0.05));
  // The top block: a long balcony across its south front, and one on the west.
  const t = BLOCKS[2];
  d.add(at(balcony(12, 2.1), t[0], 62.2, t[1] + t[3] / 2 - LEAN * 5.3 - 0.05));
  // The entrance: a timber porch on four posts before a painted door in the east wing, and the
  // ramp that climbs to it along the east side.
  const e = BLOCKS[5], xe = e[0] + e[2] / 2 - LEAN * (PAD + 3 - e[4]), porch = at(new THREE.Group(), xe, PAD, e[1] + 2);
  porch.rotation.y = Math.PI / 2;
  for (const x of [-2.2, -0.8, 0.8, 2.2]) porch.add(box(0.26, 3.4, 0.26, FLAGS[0], x, 0.5, 2.2));
  porch.add(box(6, 0.5, 3, MUD, 0, 0, 1.3), box(5.6, 0.3, 2.8, TIMBER, 0, 3.9, 1.4), box(6, 0.18, 3.2, TIMBER_DARK, 0, 4.2, 1.5), box(5.2, 0.4, 0.2, FLAGS[2], 0, 3.5, 2.3), at(tibetanDoor(1.8, 2.8), 0, 0.5, 0.3));
  d.add(porch);
  // Low parapet walls and stair cabins on the roofs.
  for (const [bx, bz, w, dp, y0, y1] of BLOCKS.slice(0, 3)) d.add(box(3, 2.2, 2.6, MUD, bx - w / 2 + LEAN * (y1 - y0) + 3.4, y1, bz - dp / 4), box(3.2, 0.3, 2.8, PARAPET, bx - w / 2 + LEAN * (y1 - y0) + 3.4, y1 + 2.2, bz - dp / 4));
  mergeByMaterial(d);
  f.add(d);
  // Flag poles on the roofs' corners, a banner down each, and strings of flags from the top.
  const poles = [], cloth = FLAGS.map(() => []), R = rng(4);
  for (const [bx, bz, w, dp, y0, y1] of BLOCKS) for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    if (R() < 0.35) continue;
    const x = bx + sx * (w / 2 - LEAN * (y1 - y0) - 0.5), z = bz + sz * (dp / 2 - LEAN * (y1 - y0) - 0.5), h = 2.6 + R() * 1.6;
    poles.push([x, y1 + 0.3, z, 0.07, h, 0.07]);
    cloth[Math.floor(R() * 5)].push([x + 0.2, y1 + 0.3 + h * 0.3, z, 0.36, h * 0.68, 0.02]);
  }
  f.add(inst(unitBox(), poles, TIMBER_DARK));
  cloth.forEach((l, i) => l.length && f.add(inst(unitBox(), l, FLAGS[i])));
  const top = BLOCKS[6];
  for (const [x, z] of [[-24, 12], [30, 10], [-18, -16], [28, -18]]) f.add(prayerFlags([top[0], top[5] + 2.5, top[1]], [x, x < 0 ? 53.6 : 53.6, z], { sag: 1.6, size: 0.45 }));
  f.add(cyl(0.06, 0.08, 2.6, TIMBER_DARK, top[0], top[5], top[1], 6));
}

// The old town at the foot of the ridge: flat-roofed houses of mud brick and whitewash, crowded
// up the slope below the palace.
function oldTown(g) {
  const R = rng(23), white = [], mud = [], all = [], want = detail.low ? 60 : 120;
  for (let tries = 0; tries < 1400 && all.length < want; tries++) {
    const x = -200 + R() * 380, z = 30 + R() * 135, w = 6 + R() * 6, d = 5.5 + R() * 3.5;
    if ((Math.abs(x + 2) < 58 && z < 40) || all.some(([ax, , az]) => Math.abs(ax - x) < 9.5 && Math.abs(az - z) < 8.5)) continue;
    const lo = Math.min(ground(x - w / 2, z + d / 2), ground(x + w / 2, z + d / 2)) - 0.4, hi = Math.max(ground(x - w / 2, z - d / 2), ground(x + w / 2, z - d / 2));
    if (lo > 30 || hi - lo > 4.5) continue;
    const b = [x, lo, z, w, 3.4 + Math.floor(R() * 1.7) * 2.8 + (hi - lo), d, (R() - 0.5) * 0.5];
    all.push(b);
    (R() < 0.55 ? white : mud).push(b);
  }
  g.add(inst(unitBox(), white, TIBETAN.white), inst(unitBox(), mud, MUD), inst(unitBox(), all.map(([x, y, z, w, h, d, ry]) => [x, y + h, z, w + 0.2, 0.4, d + 0.2, ry]), PARAPET));
  g.add(quarters(all, { cap: 0.4, seed: 5 }));
}

// Namgyal Tsemo on the peak: the white fort and, below it, the red temple of Maitreya, with the
// white gompa beside it; strings of flags from the fort down the ridge.
const WHITE = mat('#efece4', 0.85);
function chorten(s) {
  const g = new THREE.Group();
  g.add(box(3 * s, 1.2 * s, 3 * s, WHITE), box(2.4 * s, 0.8 * s, 2.4 * s, WHITE, 0, 1.2 * s), at(hemi(1.1 * s, WHITE, 16), 0, 2 * s, 0), cyl(0.25 * s, 0.4 * s, 1.6 * s, mat('#b8862a', 0.4, 0.6), 0, 3 * s, 0, 8));
  return g;
}
function tsemo(g) {
  const { x, y, z } = PEAK, d = new THREE.Group();
  d.add(at(hall(11, 12, 9, { floors: 3, cap: 0.9, y0: 2.4, awnings: false }), x + 2, y - 3, z - 2));
  d.add(at(hall(7, 8, 7, { floors: 2, cap: 0.7, y0: 2, awnings: false }), x - 8, y - 4, z + 3));
  d.add(at(hall(13, 9, 10, { floors: 2, wall: mat('#9a3a2a', 0.9), cap: 1, y0: 2, awnings: false }), x - 16, ground(x - 16, z + 22) - 2, z + 22));
  d.add(at(hall(9, 7, 8, { floors: 2, cap: 0.8, y0: 1.6, awnings: false }), x - 2, ground(x - 2, z + 26) - 2, z + 26));
  g.add(d);
  for (const [tx, tz] of [[x - 70, z + 60], [x - 40, z + 80], [x + 50, z + 50], [x - 80, z + 10]]) g.add(prayerFlags([x + 2, y + 12, z - 2], [tx, ground(tx, tz) + 3, tz], { sag: 6, size: 0.8 }));
}

export function addDetails(f, g) {
  windows(f);
  architecture(f);
  oldTown(g);
  tsemo(g);
  // Chortens on the slope below the palace and at the edge of the town, a wall of prayer wheels,
  // and the poplars and willows of the Leh oasis, with its fields.
  for (const [x, z, s] of [[-62, 40, 1.3], [-70, 46, 1], [58, 36, 1.2], [-150, 150, 1.6], [120, 160, 1.6]]) g.add(at(chorten(s), x, ground(x, z) - 0.3, z));
  g.add(at(maniWheels(18, { back: true }), -20, 0, 176));
  for (const [x, z, w, d, c] of [[-150, 250, 160, 90, '#7d9a55'], [60, 260, 180, 100, '#8aa35a'], [250, 200, 120, 120, '#7a9650'], [-300, 150, 100, 140, '#86a058']]) g.add(at(mesh(new THREE.PlaneGeometry(w, d).rotateX(-Math.PI / 2), mat(c, 0.95)), x, 0.04, z));
  g.add(trees(scatter(46, [-330, 320, 172, 330], { seed: 7, gap: 12 }), { kind: 'poplar', seed: 7, h: 13 }));
  g.add(trees(scatter(18, [-330, 320, 172, 330], { seed: 11, gap: 22 }), { kind: 'willow', seed: 11, h: 8 }));
}

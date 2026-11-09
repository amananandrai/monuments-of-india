import * as THREE from 'three';
import { M, mat, box, cyl, lathe, at, ribbed, inst, unitBox, surface } from '../helpers.js';
import { arcadeSkin } from '../details/mughal.js';
import { classicalDoor, porch, column, pediment } from '../details/colonial.js';
import { windowFrame } from '../details/components.js';
import { addDetails } from '../details/cooch-behar-palace.js';

const BRICK = surface(mat('#a9583f', 0.85), 'brick');
const WHITE = mat('#ece6da', 0.8);
const METAL = mat('#8a9097', 0.45, 0.5);

// Round-arched windows for a wall len long and h high: two storeys of them every 5 m.
function windowCells(len, h) {
  const n = Math.floor(len / 5), out = [];
  for (let k = 0; k < n; k++) { const x = -len / 2 + (k + 0.5) * (len / n); out.push([x, 1.4, 2.2, 4.6, 'room'], [x, h / 2 + 1.8, 2.2, 4.6, 'room']); }
  return out;
}
// A wing len long, h high and d deep (along x before turning), its foot at y = 0: brick with
// round-arched windows on both long faces, a white band between the floors and a white cornice.
function backWing(len, h, d) {
  const g = new THREE.Group(), dd = 1.4;
  g.add(box(len, h, d - 2 * dd, BRICK), box(len + 0.8, 0.8, d + 0.8, WHITE, 0, h), box(len + 0.6, 0.6, d + 0.6, WHITE, 0, h / 2));
  g.add(at(arcadeSkin(len, h, windowCells(len, h), dd, BRICK, { trim: WHITE, pointed: false, fill: 'room' }), 0, 0, d / 2 - dd));
  g.add(at(arcadeSkin(len, h, windowCells(len, h), dd, BRICK, { trim: WHITE, pointed: false, fill: 'room' }), 0, 0, -d / 2 + dd).rotateY(Math.PI));
  return g;
}

export function buildCoochBehar() {
  const g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  g.add(box(300, 0.15, 260, M.grass, 0, 0, 40), box(60, 0.5, 30, M.water, -70, 0, 80), box(10, 0.25, 120, M.path, 0, 0, 80));
  // Two storeys of round-arched arcades 1.6 m deep in brick, open onto verandahs, between white
  // pilasters and cornices
  const W = 120, D = 30, H = 18, dd = 1.6, pil = [], cells = [];
  f.add(box(W - 2 * dd, H, D - 2 * dd, BRICK), box(W + 1.2, 1.2, D + 1.2, WHITE, 0, H));
  // The back and the ends: two storeys of round-arched windows, 1.6 m deep, in the brick.
  f.add(at(arcadeSkin(W, H, windowCells(W, H), dd, BRICK, { trim: WHITE, pointed: false, fill: 'room' }), 0, 0, -D / 2 + dd).rotateY(Math.PI));
  for (const sx of [-1, 1]) f.add(at(arcadeSkin(D - 2 * dd, H, windowCells(D - 2 * dd, H), dd, BRICK, { trim: WHITE, pointed: false, fill: 'room' }), sx * (W / 2 - dd), 0, 0).rotateY(sx * Math.PI / 2));
  // Two wings run back from the ends round the court behind, windowed on both long faces.
  for (const sx of [-1, 1]) f.add(at(backWing(40, H - 2, 16), sx * 50, 0, -D / 2 - 20).rotateY(Math.PI / 2));
  // The band between the floors runs round the building but stops either side of the portico.
  for (const sx of [-1, 1]) f.add(box((W + 1) / 2 - 13.4, 1, D + 1, WHITE, sx * (13.4 + ((W + 1) / 2 - 13.4) / 2), H / 2));
  f.add(box(26.8, 1, D - 0.6, WHITE, 0, H / 2, -0.8));
  for (let k = 0; k <= 24; k++) for (const y of [0, H / 2 + 1]) {
    const x = -W / 2 + k * (W / 24), cx = x + W / 48;
    // The two middle bays of the ground floor are left clear for the main door.
    if (!(y === 0 && Math.abs(x) < 4)) pil.push([x, y, D / 2 + 0.3, 0.8, H / 2 - 1, 0.6]);
    if (k < 24 && !(y === 0 && Math.abs(cx) < 4)) cells.push([cx, y + 0.6, 3, 6, 'room']);
  }
  f.add(at(arcadeSkin(W, H, cells, dd, BRICK, { trim: WHITE, pointed: false }), 0, 0, D / 2 - dd));
  f.add(inst(unitBox(), pil, WHITE));
  // The projecting portico over the main door, and the tall dome over the Durbar Hall
  const door = classicalDoor(4, 8, { m: BRICK, trim: WHITE, depth: 0.5, frame: 0.7 });
  f.add(at(porch(26, 10, H + 3, { m: BRICK, trim: WHITE, colM: WHITE, cols: 6, paired: true, r: 0.9, top: 'pediment', door, stepsDown: 0.5, order: 'corinthian' }), 0, 0.5, D / 2));
  f.add(box(28, 0.5, 10, WHITE, 0, 0, D / 2 + 5));
  f.add(cyl(9, 9, 8, WHITE, 0, H + 1.2, 0, 32), cyl(9.6, 9.6, 0.8, BRICK, 0, H + 9.2, 0, 32));
  // Coupled Corinthian columns standing round the drum, under a ring of cornice, in the manner of
  // St Peter's, which the Durbar Hall's dome follows.
  for (let k = 0; k < 12; k++) for (const da of [-0.06, 0.06]) {
    const a = ((k + 0.5) / 12) * Math.PI * 2 + da;
    f.add(at(column(0.34, 7.6, WHITE, { order: 'corinthian' }), Math.sin(a) * 10.1, H + 1.2, Math.cos(a) * 10.1));
  }
  f.add(cyl(10.8, 10.8, 0.6, WHITE, 0, H + 8.8, 0, 36));
  // The end pavilions, standing forward of the front under their own pediments, with white quoins
  // and a round-headed window on each floor.
  for (const sx of [-1, 1]) {
    const px = sx * 52, pz = D / 2 + 1.5;
    f.add(box(15, H + 1.2, 3, BRICK, px, 0, pz), box(15.6, 1, 3.6, WHITE, px, H + 1.2, pz));
    for (const ex of [-7.2, 7.2]) for (let y = 0; y < H; y += 1.6) f.add(box(1.1, 0.8, 3.2, WHITE, px + ex, y, pz));
    f.add(at(pediment(15.6, 3.4, 3.6, WHITE, WHITE), px, H + 2.2, D / 2 - 0.3));
    for (const y of [1.2, H / 2 + 1.6]) f.add(at(windowFrame(2.4, 5.2, WHITE, { shape: 'round', back: M.recess, frame: 0.35 }), px, y, D / 2 + 3.02));
  }
  f.add(at(ribbed(lathe([[9, 0], [8.8, 4], [7.6, 9], [5, 13], [2, 15.4], [0, 16]], METAL, 32), 16, 0.04), 0, H + 10, 0));
  f.add(cyl(1.4, 1.8, 3, WHITE, 0, H + 25.6, 0, 12), cyl(0, 0.8, 2.4, METAL, 0, H + 28.6, 0, 8));
  addDetails(f, g);
  return { group: g, focus: f, view: [0.55, 0.28, 1.25] };
}

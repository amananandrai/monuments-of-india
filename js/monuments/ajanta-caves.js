import * as THREE from 'three';
import { M, mat, mesh, box, cyl, at, hemi, inst, unitBox, unitCyl, archWall, barrelVault, surface } from '../helpers.js';

const ROCK = mat('#7a6c5c', 0.95);
const ROCK_LIGHT = mat('#968672', 0.95);
const DARK = mat('#231d19', 0.9);
const FOREST = mat('#4f6a3a', 0.95);
const FRAME = surface(mat('#b7a48c', 0.85), 'frieze');

// Built in the cave's own frame: the mouth is at z = 0 on the cliff face, +z points out to the
// valley, and the hall runs back into the rock along -z from a floor at y = 0.

// A chaitya: horseshoe-arched facade, a nave between two colonnades, a ribbed barrel vault and the stupa.
function chaitya(w, h, d) {
  const g = new THREE.Group();
  g.add(at(archWall(w + 1.4, h, 1.1, w * 0.7, h * 0.9, false, ROCK_LIGHT), 0, 0, 0.55));
  g.add(box(w * 0.86, 0.35, d, ROCK, 0, 0, -d / 2));
  g.add(at(barrelVault(w * 0.42, d, ROCK_LIGHT), 0, h * 0.55, -d / 2));
  for (const s of [-1, 1]) {
    g.add(box(0.45, h * 0.7, d, ROCK, s * w * 0.4, 0, -d / 2));
    for (let k = 0; k < 6; k++) g.add(cyl(0.22, 0.26, h * 0.62, ROCK_LIGHT, s * w * 0.28, 0.35, -1.6 - k * (d / 7), 8));
  }
  g.add(cyl(1.5, 1.7, 3, ROCK_LIGHT, 0, 0.35, -d + 2.6, 20), at(hemi(1.5, ROCK_LIGHT, 20), 0, 3.35, -d + 2.6), box(0.9, 0.7, 0.9, ROCK_LIGHT, 0, 4.85, -d + 2.6));
  // The carved beam between the doorway and the great window above it.
  g.add(box(w * 0.66, 0.5, 0.3, FRAME, 0, h * 0.42, 0.55));
  return g;
}

// A vihara: a doorway in the front wall across the mouth (w wide), a hall W wide round a square
// colonnade, monks' cells along three walls and a shrine at the back.
function vihara(w, W, h, d) {
  const g = new THREE.Group(), dw = 3, dh = 3.6, t = 0.8, z = -t / 2 - 0.3;
  for (const s of [-1, 1]) g.add(box((w - dw) / 2, h, t, ROCK_LIGHT, s * (w + dw) / 4, 0, z));
  g.add(box(dw, h - dh, t, ROCK_LIGHT, 0, dh, z), box(dw + 1, 0.4, 0.2, FRAME, 0, dh + 0.2, 0.03));
  for (const x of [-1, 1]) for (const k of [-1, 0, 1]) g.add(cyl(0.3, 0.32, h, ROCK_LIGHT, x * W * 0.3, 0, -d / 2 + k * d * 0.3, 8));
  for (const k of [-1, 1]) g.add(cyl(0.3, 0.32, h, ROCK_LIGHT, k * W * 0.1, 0, -d / 2 - d * 0.3, 8), cyl(0.3, 0.32, h, ROCK_LIGHT, k * W * 0.1, 0, -d / 2 + d * 0.3, 8));
  for (const s of [-1, 1]) for (let k = 0; k < 4; k++) g.add(box(0.1, 2, 1.2, DARK, s * (W / 2 - 0.08), 0, -3.2 - k * (d - 5) / 3.5));
  for (const x of [-5, -2.8, 2.8, 5]) g.add(box(1.2, 2, 0.1, DARK, x, 0, -d + 0.08));
  g.add(box(2.6, 3.4, 0.1, DARK, 0, 0, -d + 0.08), box(1.4, 1.3, 1, ROCK_LIGHT, 0, 0, -d + 0.9), at(hemi(0.55, ROCK_LIGHT, 12), 0, 1.3, -d + 0.9));
  return g;
}

// Solid rock, 52 m deep like the cliff, round a hollow h tall and d deep with its floor at y: a mouth
// w wide that opens, 1.5 m in, into a hall W wide. A 1.2 m strip each side closes the seam with the cliff.
function rockAround(w, W, h, d, y, H) {
  const g = new THREE.Group(), e = W > w ? 1.5 : 0, side = 1.2, up = H - y - h;
  for (const s of [-1, 1]) g.add(box(side, H, 52, ROCK, s * (W / 2 + side / 2), 0, -26));
  if (e) {
    for (const s of [-1, 1]) g.add(box((W - w) / 2, H, e, ROCK, s * (w / 2 + (W - w) / 4), 0, -e / 2));
    g.add(box(w, y, e, ROCK, 0, 0, -e / 2), box(w, up, e, ROCK, 0, y + h, -e / 2));
  }
  const back = -e - (52 - e) / 2;
  g.add(box(W, y, 52 - e, ROCK, 0, 0, back), box(W, up, 52 - e, ROCK, 0, y + h, back), box(W, h, 52 - d, ROCK, 0, y, -d - (52 - d) / 2));
  return g;
}

// Three caves are cut as real halls you can look into from the river path: the chaityas 19 and 26
// (i = 18, 25) and the vihara 11 (i = 10). Sizes are [mouth width, hall width, height, depth].
const HALLS = { 10: ['vihara', 8, 16, 5, 16], 18: ['chaitya', 9, 9, 12, 22], 25: ['chaitya', 9, 9, 12, 22] };

// The horseshoe-shaped cliff above the Waghora river, with the caves cut in a row along it.
export function buildAjanta() {
  const g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  g.add(box(500, 0.2, 400, FOREST), box(18, 0.4, 260, M.river, 0, 0, 40));
  const R = 70, H = 40, a0 = -0.15 * Math.PI, a1 = 1.15 * Math.PI, N = 30;
  const cave = (i) => {
    const t = a0 + 0.06 + (i / (N - 1)) * (a1 - a0 - 0.12), x = Math.cos(t) * R, z = -Math.sin(t) * R * 0.8;
    const ry = Math.atan2(-x, -z);
    return { x, z, ry, ux: Math.sin(ry), uz: Math.cos(ry), y: 14 + Math.sin(i * 1.7) * 3 };
  };
  // Cliff boxes that would reach into a hall are trimmed to stop at its side; the hall brings its
  // own rock in between.
  const cuts = Object.entries(HALLS).map(([i, [, , W]]) => ({ ...cave(+i), W }));
  const cliff = [], top = [], caves = [], porch = [];
  for (let k = 0; k <= 80; k++) {
    const t = a0 + (k / 80) * (a1 - a0), x = Math.cos(t) * R, z = -Math.sin(t) * R * 0.8;
    const ry = Math.atan2(x, z);
    const ox = Math.sin(ry), oz = Math.cos(ry);
    top.push([x + ox * 30, H - 1, z + oz * 30, 10, 4, 60, ry]);
    const c = cuts.find((c) => Math.abs((x - c.x) * Math.cos(c.ry) - (z - c.z) * Math.sin(c.ry)) < c.W / 2 + 4.5 && Math.hypot(x - c.x, z - c.z) < 30);
    if (!c) { cliff.push([x + ox * 26, 0, z + oz * 26, 9, H, 52, ry]); continue; }
    // Along the hall's face: s is the box's offset sideways, back how far its face sits behind the hall's.
    const s = (x - c.x) * Math.cos(c.ry) - (z - c.z) * Math.sin(c.ry), back = -((x - c.x) * c.ux + (z - c.z) * c.uz);
    const from = c.W / 2 + 0.05, to = Math.abs(s) + 4.5, mid = Math.sign(s) * (from + to) / 2;
    if (to - from > 0.2) cliff.push([c.x + Math.cos(c.ry) * mid - c.ux * (back + 26), 0, c.z - Math.sin(c.ry) * mid - c.uz * (back + 26), to - from, H, 52, c.ry]);
  }
  g.add(inst(unitBox(), cliff, ROCK), inst(unitBox(), top, FOREST));
  // Thirty cave fronts: dark doorways with pillared verandahs, and the three halls
  for (let i = 0; i < N; i++) {
    const { x, z, ry, ux, uz, y } = cave(i), hall = HALLS[i];
    if (hall) {
      const [kind, w, W, h, d] = hall, o = new THREE.Group();
      o.add(rockAround(w, W, h, d, y, H), at(kind === 'chaitya' ? chaitya(w, h, d) : vihara(w, W, h, d), 0, y, 0));
      f.add(at(o, x, 0, z).rotateY(ry));
    } else caves.push([x + ux * 0.2, y, z + uz * 0.2, 8, 5, 1, ry]);
    if (!hall || hall[0] === 'vihara') for (let c = -3; c <= 3; c += 2) porch.push([x + ux * 1.4 + Math.cos(ry) * c, y, z + uz * 1.4 - Math.sin(ry) * c, 0.8, 5, 0.8]);
    f.add(at(box(10, 0.8, 4, ROCK_LIGHT), x + ux * 2, y - 0.8, z + uz * 2).rotateY(ry));
  }
  f.add(inst(unitBox(), caves, DARK), inst(unitCyl(8), porch, ROCK_LIGHT));
  return { group: g, focus: f, view: [0.15, 0.28, 1.2] };
}

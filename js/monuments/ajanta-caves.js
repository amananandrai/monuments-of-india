import * as THREE from 'three';
import { M, mat, mesh, box, cyl, at, hemi, lathe, inst, unitBox, unitCyl, archWall, barrelVault, surface, curvedBand } from '../helpers.js';
import { addDetails } from '../details/ajanta-caves.js';
import { heightField, rough, smooth } from '../details/terrain.js';
import { figure, figureFrieze } from '../details/sculpture.js';
import { detail } from '../detail.js';

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
  const ph = h * 0.62, sz = -d + 2.6;
  for (const s of [-1, 1]) {
    g.add(box(0.45, h * 0.7, d, ROCK, s * w * 0.4, 0, -d / 2));
    for (let k = 0; k < 6; k++) {
      const x = s * w * 0.28, z = -1.6 - k * (d / 7);
      if (detail.low) { g.add(cyl(0.22, 0.26, ph, ROCK_LIGHT, x, 0.35, z, 8)); continue; }
      // Carved pillars: a square base, a round shaft girdled by a band of carving, and a bulbous
      // cushion capital (amalaka) under a square abacus.
      g.add(box(0.62, 0.55, 0.62, ROCK_LIGHT, x, 0.35, z), cyl(0.22, 0.25, ph - 1.35, ROCK_LIGHT, x, 0.9, z, 14));
      g.add(cyl(0.27, 0.27, 0.5, FRAME, x, 0.35 + ph * 0.45, z, 14));
      g.add(at(lathe([[0.2, 0], [0.38, 0.18], [0.42, 0.34], [0.32, 0.5], [0.24, 0.56]], ROCK_LIGHT, 16), x, 0.35 + ph - 0.8, z), box(0.7, 0.24, 0.7, ROCK_LIGHT, x, 0.35 + ph - 0.24, z));
    }
  }
  g.add(cyl(1.5, 1.7, 3, ROCK_LIGHT, 0, 0.35, sz, 20), at(hemi(1.5, ROCK_LIGHT, 20), 0, 3.35, sz), box(0.9, 0.7, 0.9, ROCK_LIGHT, 0, 4.85, sz));
  if (!detail.low) {
    // On desktops (js/detail.js): the stone ribs of the vault, cut in imitation of timber; a band of
    // seated Buddhas along each side over the colonnade (the triforium); and on the stupa, a seated
    // Buddha in an arched niche on its front, as in Cave 26, and the stacked umbrellas over its
    // harmika.
    const vr = w * 0.42, vy = h * 0.55;
    for (let z = -1.3; z > -d + 0.8; z -= 1.3) g.add(mesh(new THREE.TorusGeometry(vr - 0.08, 0.1, 4, 20, Math.PI), ROCK_LIGHT, 0, vy, z));
    for (const s of [-1, 1]) {
      const fr = at(figureFrieze(d - 4, 1.1, ROCK_LIGHT, { pitch: 0.95, kinds: ['seated'] }), s * (w * 0.4 - 0.235), 0.35 + ph + 0.25, -d / 2 - 0.6);
      fr.rotation.y = -s * Math.PI / 2;
      g.add(fr);
    }
    g.add(at(figure(1.9, ROCK_LIGHT, 'seated'), 0, 0.55, sz + 1.62), box(1.5, 0.2, 0.35, ROCK_LIGHT, 0, 0.35, sz + 1.6));
    g.add(mesh(new THREE.TorusGeometry(0.85, 0.09, 4, 16, Math.PI), ROCK_LIGHT, 0, 2.0, sz + 1.72));
    for (const sx of [-1, 1]) g.add(box(0.14, 1.65, 0.14, ROCK_LIGHT, sx * 0.85, 0.35, sz + 1.72));
    g.add(cyl(0.07, 0.07, 2.2, ROCK_LIGHT, 0, 5.55, sz, 6));
    [[1.05, 5.75], [0.8, 6.35], [0.55, 6.95]].forEach(([r, y]) => g.add(cyl(r, r * 0.9, 0.16, ROCK_LIGHT, 0, y, sz, 20)));
  }
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
  g.add(box(2.6, 3.4, 0.1, DARK, 0, 0, -d + 0.08));
  // The shrine's Buddha, seated on a throne; on phones a simple block (js/detail.js).
  if (detail.low) g.add(box(1.4, 1.3, 1, ROCK_LIGHT, 0, 0, -d + 0.9), at(hemi(0.55, ROCK_LIGHT, 12), 0, 1.3, -d + 0.9));
  else g.add(box(1.8, 0.7, 1.1, ROCK_LIGHT, 0, 0, -d + 0.75), at(figure(2.3, ROCK_LIGHT, 'seated'), 0, 0.7, -d + 0.75));
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

// The other mouths are not all alike. Caves 9, 10 and 29 (i = 8, 9, 28) are chaityas too: a tall
// doorway under a horseshoe window, no verandah. The viharas' verandahs alternate between four
// pillars and six. caveFront(i): { chaitya: true } or { cols: the pillars' x across the mouth }.
export function caveFront(i) {
  if (i === 8 || i === 9 || i === 28) return { chaitya: true };
  return { cols: i % 2 ? [-3.75, -2.25, -0.75, 0.75, 2.25, 3.75] : [-3, -1, 1, 3] };
}

// How far (m) a point lies outside the open ground of the gorge: the horseshoe's floor inside the
// cliff (an ellipse 70 m by 56 m) and the valley the river leaves by. 0 or less is open ground.
export function openDistance(x, z) {
  const R = 70, dE = (Math.hypot(x / R, z / (0.8 * R)) - 1) * R;
  const dV = z > 0 ? Math.abs(x) - (R * 0.95 + 0.35 * z) : Infinity;
  return Math.min(dE, dV);
}

// The horseshoe-shaped cliff above the Waghora river, with the caves cut in a row along it.
export function buildAjanta() {
  const g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  const R = 70, H = 40, a0 = -0.15 * Math.PI, a1 = 1.15 * Math.PI, N = 30;
  // The gorge is cut into the Deccan plateau: the forested tableland runs on at the top of the cliff
  // on every side, and the Waghora leaves the horseshoe down a valley to the south (+z) whose sides
  // widen as they fall away. Inside the horseshoe and along the valley floor the ground is at 0.
  g.add(heightField(2400, 2400, 240, (x, z) => {
    const d = openDistance(x, z);
    if (d <= 0) return -0.3 + rough(x, z, 0.25, 0.6);
    // Rising to the cliff's top, then past the cliff's 60 m band of forest to that band's own top
    // (3 m above the rock), so the band does not stand up as a rim seen from the plateau.
    return H * smooth(0, 38, d) + 2.7 * smooth(34, 62, d) + rough(x, z, 1.6, 0.35) * smooth(62, 110, d);
  }, { cz: 200, cover: '#4f6a3a', rock: ['#7a6c5c', '#6e6254', '#857664'], band: 6, steep: 0.72 }));
  g.add(box(18, 0.4, 900, M.river, 0, 0, 380));
  const cave = (i) => {
    const t = a0 + 0.06 + (i / (N - 1)) * (a1 - a0 - 0.12), x = Math.cos(t) * R, z = -Math.sin(t) * R * 0.8;
    const ry = Math.atan2(-x, -z);
    return { x, z, ry, ux: Math.sin(ry), uz: Math.cos(ry), y: 14 + Math.sin(i * 1.7) * 3 };
  };
  // The cliff is one curved band of rock, 52 m deep, broken where a hall brings its own rock: each
  // run stops 0.6 m into the hall's side strip. The forest on top is one band over the whole arc,
  // set back 0.5 m from the face.
  const cuts = Object.entries(HALLS).map(([i, [, , W]]) => ({ ...cave(+i), half: W / 2 + 0.6 }));
  const arc = [];
  for (let k = 0; k <= 80; k++) {
    const t = a0 + (k / 80) * (a1 - a0), x = Math.cos(t) * R, z = -Math.sin(t) * R * 0.8, ry = Math.atan2(x, z);
    arc.push([x, z, Math.sin(ry), Math.cos(ry)]);
  }
  // Sideways offset of a point along a hall's face, or null when no hall is near.
  const offset = ([x, z]) => {
    const c = cuts.find((c) => Math.hypot(x - c.x, z - c.z) < 30);
    return c ? { c, s: (x - c.x) * Math.cos(c.ry) - (z - c.z) * Math.sin(c.ry) } : null;
  };
  const inside = (p) => { const o = offset(p); return !!o && Math.abs(o.s) < o.c.half; };
  const lerp = (p, q, u) => {
    const nx = p[2] + (q[2] - p[2]) * u, nz = p[3] + (q[3] - p[3]) * u, l = Math.hypot(nx, nz);
    return [p[0] + (q[0] - p[0]) * u, p[1] + (q[1] - p[1]) * u, nx / l, nz / l];
  };
  // Where the segment p → q crosses the side of the hall it enters or leaves.
  const edge = (p, q) => {
    const o = offset(inside(p) ? p : q), sp = offset(p).s, sq = offset(q).s, lim = Math.sign(inside(p) ? sq : sp) * o.c.half;
    return lerp(p, q, (lim - sp) / (sq - sp));
  };
  const runs = [];
  let run = inside(arc[0]) ? null : [arc[0]];
  for (let k = 1; k < arc.length; k++) {
    const p = arc[k - 1], q = arc[k];
    if (run && inside(q)) { run.push(edge(p, q)); runs.push(run); run = null; }
    else if (!run && !inside(q)) run = [edge(p, q), q];
    else if (run) run.push(q);
  }
  if (run) runs.push(run);
  for (const r of runs) if (r.length > 1) g.add(curvedBand(r, 0, 52, 0, H, ROCK));
  g.add(curvedBand(arc, 0.5, 60, H, H + 3, FOREST));
  const caves = [], porch = [];
  // Thirty cave fronts: dark doorways with pillared verandahs, and the three halls
  for (let i = 0; i < N; i++) {
    const { x, z, ry, ux, uz, y } = cave(i), hall = HALLS[i];
    if (hall) {
      const [kind, w, W, h, d] = hall, o = new THREE.Group();
      o.add(rockAround(w, W, h, d, y, H), at(kind === 'chaitya' ? chaitya(w, h, d) : vihara(w, W, h, d), 0, y, 0));
      f.add(at(o, x, 0, z).rotateY(ry));
    } else if (caveFront(i).chaitya) {
      // A chaitya's front: the doorway, and over it the dark horseshoe window into the vault.
      caves.push([x + ux * 0.2, y, z + uz * 0.2, 2.6, 4, 1, ry]);
      const win = mesh(new THREE.CircleGeometry(2.3, 20, -Math.PI * 0.15, Math.PI * 1.3), DARK, x + ux * 0.72, y + 6.6, z + uz * 0.72);
      win.rotation.y = ry;
      f.add(win);
    } else caves.push([x + ux * 0.2, y, z + uz * 0.2, 8, 5, 1, ry]);
    const cols = hall ? (hall[0] === 'vihara' ? [-3, -1, 1, 3] : []) : caveFront(i).cols || [];
    for (const c of cols) porch.push([x + ux * 1.4 + Math.cos(ry) * c, y, z + uz * 1.4 - Math.sin(ry) * c, 0.8, 5, 0.8]);
    f.add(at(box(10, 0.8, 4, ROCK_LIGHT), x + ux * 2, y - 0.8, z + uz * 2).rotateY(ry));
  }
  f.add(inst(unitBox(), caves, DARK), inst(unitCyl(8), porch, ROCK_LIGHT));
  addDetails(f, g);
  return { group: g, focus: f, view: [0.15, 0.28, 1.2] };
}

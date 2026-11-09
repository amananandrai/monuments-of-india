import * as THREE from 'three';
import { mat, mesh, box, cyl, at, surface, pidaRoof, bell, kalash } from '../helpers.js';
import { D, frieze, rosette, bracketGeo, chhajja } from './components.js';
import { guardian } from './figures.js';
import { elephant, lion, horse } from './animals.js';
import { statue } from './sculpture.js';

export { guardian };

// Doorways with depth. A door that reads needs a reveal running back from the wall, frames stepped
// one inside another, something at the back (door leaves, a dim room), a threshold and a way up,
// and shade from above. The walls of the models are solid boxes, so these parts stand proud of the
// wall: a frame `depth` deep gives the doorway its depth without cutting the wall. Every part faces
// +z with its back against the wall at z = 0 and its sill at y = 0.

const TIMBER = surface(mat('#6a4528', 0.62), 'none');
// Unlit, so the room behind a door reads the same in sun and in shade, and by day or night.
const GLOOM = new THREE.MeshBasicMaterial({ vertexColors: true });
const FLAME = new THREE.MeshBasicMaterial({ color: new THREE.Color(2.2, 1.25, 0.45) });

const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

// The dim room seen through an open door, painted on a panel w × h: a floor lit by the daylight
// coming in and fading into the room, side walls a little lighter than the far wall, and the warm
// glow of a lamp low in the middle (at lampV of the height, as bright as `glow`; 0 for none).
export function interior(w, h, lampV = 0.12, glow = 0.16) {
  const seg = (v, lo, hi) => Math.max(lo, Math.min(hi, Math.round(v * 2.5)));
  const geo = new THREE.PlaneGeometry(w, h, seg(w, 6, 12), seg(h, 8, 16)).translate(0, h / 2, 0);
  const p = geo.attributes.position, col = new Float32Array(p.count * 3);
  for (let i = 0; i < p.count; i++) {
    const u = p.getX(i) / (w / 2), v = p.getY(i) / h, au = Math.abs(u);
    // The far wall is the middle of the panel; the floor and side walls run out to its edges.
    const floor = smooth(0.32, 0, v + 0.25 * (1 - au)) * 0.11;
    const walls = smooth(0.45, 1, au) * 0.045;
    const lit = Math.exp(-((u / 0.38) ** 2 + ((v - lampV) / 0.16) ** 2)) * glow;
    const c = 0.012 + floor + walls + lit;
    col.set([c + lit * 0.25, c * 0.85 + lit * 0.05, c * 0.68], i * 3);
  }
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const o = mesh(geo, GLOOM);
  o.castShadow = false;
  return o;
}

// A small brass oil lamp with its flame, standing on y = 0.
export function lamp(s = 1) {
  const g = new THREE.Group();
  g.add(cyl(0.05 * s, 0.11 * s, 0.06 * s, D.brass), cyl(0.025 * s, 0.035 * s, 0.4 * s, D.brass, 0, 0.06 * s));
  g.add(cyl(0.13 * s, 0.05 * s, 0.06 * s, D.brass, 0, 0.46 * s));
  const f = mesh(new THREE.SphereGeometry(0.04 * s, 8, 6), FLAME, 0, 0.57 * s, 0);
  f.scale.y = 1.7;
  f.castShadow = false;
  g.add(f);
  return g;
}

// Two timber leaves filling an opening w × h, hinged at its sides and swung `open` radians towards
// +z (0 = shut), or towards -z if `inward`. Raised panels and rows of brass bosses on their outer
// faces, and with `spikes` the iron spikes of a fort gate, set against war elephants.
const IRON = mat('#3b3734', 0.5, 0.6);
export function doorLeaves(w, h, { open = 0, studs = true, m = TIMBER, inward = false, spikes = false } = {}) {
  const g = new THREE.Group(), lw = w / 2 - 0.015, t = Math.max(0.06, w * 0.03);
  for (const s of [-1, 1]) {
    const pivot = new THREE.Group(), leaf = new THREE.Group();
    leaf.add(box(lw, h, t, m, 0, 0, t / 2));
    for (const k of [0.08, 0.38, 0.68]) leaf.add(box(lw * 0.7, h * 0.24, 0.03, m, 0, h * k, t + 0.015));
    if (studs) {
      const sg = new THREE.SphereGeometry(Math.max(0.025, w * 0.014), 6, 4);
      for (let r = 0; r < 7; r++) for (const c of [-0.32, 0.32]) leaf.add(mesh(sg, D.brass, c * lw, h * (0.06 + r * 0.145), t + 0.02));
    }
    if (spikes) {
      const sp = new THREE.ConeGeometry(Math.max(0.05, w * 0.012), Math.max(0.3, w * 0.07), 6).rotateX(Math.PI / 2);
      const len = Math.max(0.3, w * 0.07);
      for (let r = 0; r < 4; r++) for (const c of [-0.3, 0, 0.3]) leaf.add(mesh(sp, IRON, c * lw, h * (0.3 + r * 0.1), t + 0.03 + len / 2));
    }
    leaf.position.x = -s * lw / 2;
    pivot.add(leaf);
    pivot.position.x = s * w / 2;
    pivot.rotation.y = (inward ? -s : s) * open;
    g.add(pivot);
  }
  return g;
}

// Steps down from a platform `rise` high at z = 0, running out towards +z: n treads `tread` deep.
export function steps(width, rise, n, m, tread = 0.42) {
  const g = new THREE.Group();
  for (let k = 0; k < n; k++) g.add(box(width, (rise * (n - k)) / (n + 1), tread, m, 0, 0, tread * (k + 0.5)));
  return g;
}

// A grand stair up to a plinth `rise` high whose front face is at z = 0, running out towards +z:
// n steps (about 0.2 m each) `width` wide, treads `tread` deep, split by a landing `landing` deep
// at half height (none when landing is 0), between side walls `cheek` above the line of the steps.
// Guardians, each pair scaled by `guardScale`: elephants or war horses on pedestals beside the
// foot (foot: 'elephant' or 'horse'), lions on the side walls at the landing (mid: 'lion') and
// standing figures on the plinth either side of the head (top: true); coarse: lighter beasts,
// where the budget is tight.
// Treads in m, side walls and pedestals in sh.
// userData.run is the length of the stair along z.
export function grandStair(rise, width, m, sh, {
  n = Math.max(3, Math.round(rise / 0.2)), tread = 0.36, landing = rise > 3 ? 2.4 : 0, cheek = 1,
  foot = null, mid = null, top = false, guardScale = 0.55, coarse = false,
} = {}) {
  const g = new THREE.Group(), W = width, h = rise / n, half = landing ? Math.round(n / 2) : 0;
  let z = 0;
  for (let k = 1; k < n; k++) {
    const d = k === half ? landing : tread;
    g.add(box(W, rise - k * h, d, m, 0, 0, z + d / 2));
    z += d;
  }
  const zE = z, z1 = half ? (half - 1) * tread : 0, z2 = z1 + landing, yL = rise - half * h + cheek;
  // The side walls, drawn in (z, y) and turned to run along z.
  const prof = [[-0.01, 0], [-0.01, rise + cheek], ...(half ? [[z1, yL], [z2, yL]] : []), [zE, cheek], [zE, 0]];
  const cg = new THREE.ExtrudeGeometry(new THREE.Shape(prof.map(([a, b]) => new THREE.Vector2(a, b))), { depth: 1.2, bevelEnabled: false }).rotateY(-Math.PI / 2);
  const gs = guardScale;
  for (const s of [-1, 1]) {
    g.add(mesh(cg, sh, s > 0 ? W / 2 + 1.19 : -W / 2 + 0.01, 0, 0));
    if (foot === 'elephant' || foot === 'horse') {
      const x = s * (W / 2 + 1.2 + 2.9 * gs), ez = zE - 3.45 * gs;
      let beast = elephant(m, gs, { coarse });
      if (foot === 'horse') { beast = horse(m, { coarse }); beast.scale.setScalar(gs * 0.95); }
      g.add(box(4.4 * gs, 1, 6.9 * gs, sh, x, 0, ez), at(beast, x, 1, ez));
    }
    if (mid === 'lion' && half) g.add(at(lion(gs, m), s * (W / 2 + 0.6), yL, (z1 + z2) / 2));
    if (top) g.add(at(statue(4.4 * gs, m), s * (W / 2 + 1.2 + 2.55 * gs), rise, -2.5 * gs));
  }
  g.userData.run = zE;
  return g;
}

// The frame of a post-and-lintel doorway round an opening w × h: `bands` nested bands (shakhas),
// each bw wide and standing further out than the one inside it, from d0 at the opening to `depth`
// at the outside, so the frame steps in towards the door. Alternate bands are carved.
export function doorFrame(w, h, { bands = 3, bw = 0.3, depth = 1.2, d0 = depth * 0.6, m, carve = frieze(m) } = {}) {
  const g = new THREE.Group();
  for (let k = 0; k < bands; k++) {
    const d = d0 + ((depth - d0) * k) / Math.max(1, bands - 1), bm = k % 2 ? carve : m;
    const x = w / 2 + k * bw + bw / 2, jh = h + k * bw;
    for (const s of [-1, 1]) g.add(box(bw, jh, d, bm, s * x, 0, d / 2));
    g.add(box(w + 2 * (k + 1) * bw, bw, d, bm, 0, jh, d / 2));
  }
  g.userData.outerW = w + 2 * bands * bw;
  g.userData.outerH = h + bands * bw;
  return g;
}

// A temple doorway on a wall face: a stepped frame, a figure block in the middle of the lintel, a
// hood above, timber leaves standing open with a dim sanctum and a lamp behind, a raised threshold
// and a half-moon stone, and guardians at the foot of the frame. Sized by the opening w × h.
export function templeDoorway(w, h, {
  m, bands = 3, bw = Math.min(0.42, Math.max(0.2, w * 0.17)), depth = null, guardians = true, guardianH = Math.min(1.8, h * 0.42),
  hood = true, open = 1.2, moon = true, leafM = TIMBER,
} = {}) {
  const g = new THREE.Group();
  const d0 = Math.max(0.55, (w / 2) * Math.sin(open) + 0.08), dep = Math.max(d0 + 0.15, depth || d0 + 0.45);
  const frame = doorFrame(w, h, { bands, bw, depth: dep, d0, m });
  const { outerW, outerH } = frame.userData;
  g.add(frame);
  // The lintel's figure block (lalatabimba) and a carved rosette on it.
  g.add(box(bw * 1.8, bw * 1.3, 0.12, m, 0, h + (bands - 1) * bw - bw * 0.15, dep));
  g.add(at(rosette(bw * 0.45, m, 8), 0, h + (bands - 0.5) * bw - 0.05, dep + 0.12));
  // Inside: the dim room, a lamp, the threshold, and the leaves standing open.
  g.add(at(interior(w * 0.999, h * 0.999), 0, 0, 0.012));
  g.add(at(lamp(Math.min(1.4, h / 3)), 0, 0.18, 0.28));
  g.add(box(w, 0.18, d0, m, 0, 0, d0 / 2));
  g.add(at(doorLeaves(w * 0.996, (h - 0.18) * 0.98, { open, m: leafM }), 0, 0.18, 0.02));
  // The half-moon stone (ardhachandra) in front of the threshold.
  if (moon) g.add(mesh(new THREE.CylinderGeometry(w * 0.62, w * 0.62, 0.1, 24, 1, false, -Math.PI / 2, Math.PI), m, 0, 0.05, dep));
  if (hood) {
    g.add(at(chhajja(outerW + 0.8, dep * 0.55 + 0.4, 0.32, 0.12, m), 0, outerH + 0.42, dep * 0.45));
    g.add(box(outerW + 0.3, 0.42, dep * 0.45 + 0.05, m, 0, outerH, (dep * 0.45) / 2));
  }
  if (guardians) for (const s of [-1, 1]) g.add(at(guardian(guardianH, m), s * (outerW / 2 + guardianH * 0.21), 0, guardianH * 0.17));
  g.userData = { outerW: outerW + (guardians ? guardianH * 0.84 : 0), outerH: outerH + (hood ? 0.55 : 0), depth: dep };
  return g;
}

// An open porch (mukhamandapa) in front of a wall at z = 0: two free columns at the front and two
// pilasters at the wall, beams, a slab with eaves on three sides, and a small stepped roof with a
// bell and kalash. pw wide, pd deep, columns ph high, standing on y = 0.
// finialM: the porch kalash's material (left undefined, kalash gilds it).
export function templePorch(pw, pd, ph, m, shade = m, finialM = undefined) {
  const g = new THREE.Group(), cx = pw / 2 - 0.45;
  for (const s of [-1, 1]) {
    for (const [z, free] of [[pd - 0.45, true], [0.3, false]]) {
      g.add(box(0.95, 0.55, free ? 0.95 : 0.6, shade, s * cx, 0, z));
      if (free) g.add(cyl(0.27, 0.31, ph - 1.1, m, s * cx, 0.55, z, 8).rotateY(Math.PI / 8));
      else g.add(box(0.6, ph - 1.1, 0.45, m, s * cx, 0.55, z));
      g.add(box(0.85, 0.3, free ? 0.85 : 0.55, shade, s * cx, ph - 0.55, z));
      g.add(box(0.75, 0.25, free ? 0.75 : 0.5, m, s * cx, ph - 0.25, z));
      // Bracket arms reaching out along the beam.
      for (const dir of [-1, 1]) {
        const b = mesh(bracketGeo(0.45, 0.55, 0.3), m, s * cx, ph - 0.25, z);
        b.rotation.y = (dir * Math.PI) / 2;
        g.add(b);
      }
    }
  }
  for (const s of [-1, 1]) g.add(box(0.7, 0.45, pd, shade, s * cx, ph, pd / 2));
  g.add(box(pw - 0.2, 0.45, 0.7, shade, 0, ph, pd - 0.45));
  g.add(box(pw + 0.6, 0.38, pd + 0.3, m, 0, ph + 0.45, (pd + 0.3) / 2));
  g.add(at(chhajja(pw + 1.4, 0.7, 0.3, 0.1, shade), 0, ph + 0.8, pd + 0.3));
  for (const s of [-1, 1]) {
    const c = chhajja(pd + 0.3, 0.7, 0.3, 0.1, shade);
    c.rotation.y = (s * Math.PI) / 2;
    c.position.set(s * (pw / 2 + 0.3), ph + 0.8, (pd + 0.3) / 2);
    g.add(c);
  }
  const roof = pidaRoof(Math.min(pw, pd + 2) * 0.8, Math.min(pw, pd + 2) * 0.42, 3, 0.42, m, shade);
  const ry = ph + 0.83;
  g.add(at(roof, 0, ry, pd / 2 + 0.15));
  g.add(at(bell(Math.min(pw, pd) * 0.14, m), 0, ry + roof.userData.top, pd / 2 + 0.15));
  g.add(at(kalash(Math.min(pw, pd) * 0.1, finialM), 0, ry + roof.userData.top + Math.min(pw, pd) * 0.14, pd / 2 + 0.15));
  return g;
}

// A Tibetan doorway on a whitewashed wall at z = 0: a dark frame, a lintel of red, blue and green
// bands with a row of painted block ends, a striped curtain (shambu) hanging over it, red leaves
// with gilt bosses standing a little open onto the dim hall, and a sill. w × h is the opening.
const T_RED = surface(mat('#9a2b22', 0.7), 'none'), T_DARK = surface(mat('#2a2220', 0.8), 'none');
const T_BLUE = surface(mat('#2f5d8a', 0.7), 'none'), T_GREEN = surface(mat('#3f7d4f', 0.7), 'none');
const T_GOLD = surface(mat('#d9a636', 0.55), 'none'), T_WHITE = surface(mat('#f1ede4', 0.8), 'none');
export function tibetanDoor(w, h) {
  const g = new THREE.Group(), f = Math.max(0.18, w * 0.11);
  g.add(at(interior(w, h, 0.12, 0.1), 0, 0, 0.012));
  g.add(at(doorLeaves(w * 0.996, h * 0.98, { open: 0.45, m: T_RED }), 0, 0, 0.02));
  for (const s of [-1, 1]) g.add(box(f, h + f, 0.14, T_DARK, s * (w + f) / 2, 0, 0.07));
  // The lintel: a red beam, a row of block ends in alternating colours, a blue band.
  const lw = w + 2 * f + 0.5;
  g.add(box(lw, 0.22, 0.3, T_RED, 0, h + f, 0.15));
  for (let k = 0, n = Math.round(lw / 0.26); k < n; k++) g.add(box(0.14, 0.14, 0.12, [T_GREEN, T_GOLD, T_BLUE][k % 3], -lw / 2 + (k + 0.5) * (lw / n), h + f + 0.24, 0.36));
  g.add(box(lw + 0.2, 0.18, 0.4, T_BLUE, 0, h + f + 0.4, 0.2));
  // The curtain hanging in pleated bands over the top of the door.
  [T_WHITE, T_RED, T_BLUE, T_GOLD].forEach((m, i) => g.add(box(lw - 0.1, 0.14, 0.04, m, 0, h + f - 0.12 - i * 0.14, 0.33)));
  g.add(box(w + 2 * f, 0.12, 0.4, T_DARK, 0, 0, 0.2));
  g.userData = { outerW: lw + 0.2, outerH: h + f + 0.58 };
  return g;
}

// A pillared portico before a Tibetan door: two red pillars with stepped capitals and bracket arms,
// beams painted in bands, a flat roof with a maroon parapet, and the door at the back. pw wide, pd
// deep, ph high, on y = 0, against a wall at z = 0. door: [w, h].
export function tibetanPortico(pw, pd, ph, door, { parapet = T_RED } = {}) {
  const g = new THREE.Group();
  g.add(tibetanDoor(door[0], door[1]));
  for (const s of [-1, 1]) {
    const x = s * (pw / 2 - 0.5), z = pd - 0.45;
    g.add(box(0.7, 0.3, 0.7, T_DARK, x, 0, z), box(0.42, ph - 1.1, 0.42, T_RED, x, 0.3, z));
    g.add(box(0.6, 0.18, 0.6, T_BLUE, x, ph - 0.8, z), box(0.75, 0.18, 0.75, T_GREEN, x, ph - 0.62, z));
    for (const dir of [-1, 1]) {
      const b = mesh(bracketGeo(0.4, 0.7, 0.36), T_RED, x, ph - 0.44, z);
      b.rotation.y = (dir * Math.PI) / 2;
      g.add(b);
    }
  }
  g.add(box(pw, 0.24, 0.5, T_RED, 0, ph - 0.44, pd - 0.45), box(pw + 0.2, 0.2, 0.55, T_GREEN, 0, ph - 0.2, pd - 0.45));
  for (const s of [-1, 1]) g.add(box(0.4, 0.4, pd, T_RED, s * (pw / 2 - 0.5), ph - 0.4, pd / 2));
  g.add(box(pw + 0.6, 0.3, pd + 0.3, T_WHITE, 0, ph, (pd + 0.3) / 2), box(pw + 0.7, 0.55, pd + 0.4, parapet, 0, ph + 0.3, (pd + 0.4) / 2));
  return g;
}

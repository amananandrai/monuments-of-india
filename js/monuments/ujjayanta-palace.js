import * as THREE from 'three';
import { M, V, mat, box, cyl, lathe, at, onFace, FACES, archWall, chhatri, finial, ribbed, bulbPoints } from '../helpers.js';
import { mergeByMaterial } from '../parts/components.js';
import { arcadeSkin } from '../parts/mughal.js';
import { addDetails } from '../details/ujjayanta-palace.js';

// Ujjayanta Palace, Agartala (Martin and Burn, 1899–1901), after photographs of its south front
// across the two lakes: a long white range of two storeys, both opening in round-arched verandahs;
// a central block standing forward behind an arched carriage porch and climbing in two more
// storeys to the great ribbed dome, 26 m up; and a pavilion at each end under a smaller dome.
// Everything faces +z; the front of the wings is at z = FZ. Shared with the detail file through UJ.
export const UJ = { W: 104, D: 16, FZ: 8, b: 1.2, F: 5.2, H: 10.4, CW: 22, CZ: 14, PX: 46, PW: 12, PZ: 11 };
export const WHITE = mat('#f3f1ea', 0.7), SHADE = mat('#dedad0', 0.8), DOME = mat('#d9dad6', 0.55, 0.15);

// The ribbed dome of the palace: a little taller than a hemisphere, drawn in to a point.
export function palaceDome(r) {
  const o = lathe([[1, 0], [1.03, 0.16], [0.98, 0.42], [0.84, 0.7], [0.58, 0.92], [0.26, 1.04], [0.07, 1.09], [0, 1.1]].map(([x, y]) => [x * r, y * r]), DOME, 40);
  return ribbed(o, 16, 0.035);
}
// A row of round arches on each floor of a face len wide: [x, sill, width, height, fill] cells.
function bays(len, n, { skip = () => false, low = 'room', aw = 2.5 } = {}) {
  const out = [];
  for (let k = 0; k < n; k++) {
    const x = -len / 2 + (k + 0.5) * (len / n);
    if (!skip(x)) out.push([x, 0.5, aw, 4.0, low], [x, UJ.F + 0.6, aw, 3.9, 'room']);
  }
  return out;
}

export function buildUjjayanta() {
  const g = new THREE.Group(), f = new THREE.Group(), { W, D, FZ, b, F, H, CW, CZ, PX, PW, PZ } = UJ;
  g.add(f);
  const bulbs = [];
  const line = (a, c, step = 1) => { const n = Math.max(1, Math.round(a.distanceTo(c) / step)); for (let i = 0; i <= n; i++) bulbs.push(a.clone().lerp(c, i / n)); };
  const domeLights = (cx, cy, cz, r) => { for (let m = 0; m < 16; m++) { const a = (m / 16) * Math.PI * 2; for (let t = 0; t <= 1; t += 0.125) { const pr = Math.cos(t * 1.45) * 1.02, py = Math.sin(t * 1.45) * 1.1; bulbs.push(V(cx + Math.cos(a) * pr * r, cy + py * r, cz + Math.sin(a) * pr * r)); } } };

  /* The plinth and the long range: verandahs 2.2 m deep behind the arches of both floors. */
  const dd = 2.2, top = b + H;
  f.add(box(W + 2, b, D + 2, SHADE, 0, 0, 0));
  f.add(box(W, H, D - dd - 0.6, WHITE, 0, b, -(dd - 0.6) / 2));
  const mid = (x) => Math.abs(x) < CW / 2 || Math.abs(Math.abs(x) - PX) < PW / 2;
  f.add(at(arcadeSkin(W, H, bays(W, 26, { skip: mid }), dd, WHITE, { trim: SHADE, pointed: false }), 0, b, FZ - dd));
  f.add(at(arcadeSkin(W, H, bays(W, 26, { low: 'shutters', aw: 2.0 }), 0.6, WHITE, { trim: SHADE, pointed: false, fill: 'room' }), 0, b, -D / 2 + 0.6).rotateY(Math.PI));
  f.add(box(W + 0.9, 0.6, D + 0.9, SHADE, 0, top, 0), box(W - 1, 0.25, D - 1, mat('#b9b4a8', 0.9), 0, top + 0.6, 0));
  line(V(-W / 2, top + 0.7, FZ + 0.4), V(W / 2, top + 0.7, FZ + 0.4));

  /* Two wings run back from the range round the court behind. */
  for (const s of [-1, 1]) {
    const w = new THREE.Group(), L = 34, wd = 13;
    w.add(box(L, H, wd - 1.2, WHITE, 0, b, 0), box(L + 0.6, 0.6, wd + 0.6, SHADE, 0, top, 0), box(L + 1, b, wd + 1, SHADE));
    for (const z of [-1, 1]) w.add(at(arcadeSkin(L, H, bays(L, 8, { low: 'shutters', aw: 2.0 }), 0.6, WHITE, { trim: SHADE, pointed: false, fill: 'room' }), 0, b, z * (wd / 2 - 0.6)).rotateY(z > 0 ? 0 : Math.PI));
    f.add(at(w, s * 40, 0, -D / 2 - L / 2).rotateY(Math.PI / 2));
  }

  /* The central block, forward of the range: three arches on each floor, the carriage porch before
     them, and above the roof the third and fourth storeys of the tower. */
  const c = new THREE.Group(), cd = CZ + D / 2;
  c.add(box(CW, H + 0.2, cd - 2.2, WHITE, 0, b, (CZ - 0.2 - D / 2) / 2));
  const cf = [[-7, 0.5, 3, 4.2, 'room'], [0, 0.5, 3.4, 4.4, 'door'], [7, 0.5, 3, 4.2, 'room']];
  for (const x of [-7.6, -3.8, 0, 3.8, 7.6]) cf.push([x, F + 0.6, 2.3, 3.9, 'room']);
  c.add(at(arcadeSkin(CW, H + 0.2, cf, 1.2, WHITE, { trim: SHADE, pointed: false }), 0, b, CZ - 1.2));
  c.add(box(CW + 0.9, 0.7, cd + 0.5, SHADE, 0, top + 0.2, CZ - cd / 2));
  // The third storey, 16 × 14, and the fourth, 11 square, each with arched windows on every face.
  const y3 = top + 0.9, y4 = y3 + 3.9, y5 = y4 + 3.4, tz = 5;
  const face = (w, h, n, aw, ah) => arcadeSkin(w, h, Array.from({ length: n }, (_, i) => [(i - (n - 1) / 2) * (w / n), 0.7, aw, ah, 'room']), 0.5, WHITE, { trim: SHADE, pointed: false });
  c.add(box(15, 3.9, 13, WHITE, 0, y3, tz), box(16.8, 0.5, 14.8, SHADE, 0, y4 - 0.1, tz));
  c.add(box(10, 3.4, 10, WHITE, 0, y4 + 0.4, tz), box(11.8, 0.5, 11.8, SHADE, 0, y5 + 0.1, tz));
  for (const a of FACES) {
    const side = Math.abs(Math.sin(a)) > 0.5;
    c.add(at(new THREE.Group().add(onFace(at(face(side ? 14 : 16, 3.8, side ? 3 : 5, 1.7, 2.6), 0, y3, 0), a, side ? 7.5 : 6.5)), 0, 0, tz));
    c.add(at(new THREE.Group().add(onFace(at(face(11, 3.3, 3, 1.6, 2.2), 0, y4 + 0.4, 0), a, 5)), 0, 0, tz));
  }
  // The drum, eight-sided, and the great dome with its finial.
  c.add(cyl(4.9, 5.1, 1.2, WHITE, 0, y5 + 0.6, tz, 8), cyl(5.3, 5.3, 0.3, SHADE, 0, y5 + 1.8, tz, 32));
  c.add(at(palaceDome(4.6), 0, y5 + 2.1, tz), cyl(0.3, 0.5, 0.5, DOME, 0, y5 + 2.1 + 5.0, tz, 10), at(finial(1.2, DOME), 0, y5 + 2.1 + 5.4, tz));
  // Domed kiosks on the corners of the third storey's roof.
  for (const x of [-6.9, 6.9]) for (const z of [-5.9, 5.9]) c.add(at(chhatri(0.85, 2.8, WHITE, DOME), x, y4 + 0.4, tz + z));
  f.add(mergeByMaterial(c));
  domeLights(0, y5 + 2.1, tz, 4.6);
  for (const x of [-CW / 2, CW / 2]) line(V(x, b, CZ + 0.3), V(x, top + 0.9, CZ + 0.3));
  line(V(-CW / 2, top + 0.95, CZ + 0.3), V(CW / 2, top + 0.95, CZ + 0.3));
  for (const x of [-8.4, 8.4]) line(V(x, y3, tz + 7.6), V(x, y4, tz + 7.6));
  line(V(-8.4, y4 + 0.45, tz + 7.5), V(8.4, y4 + 0.45, tz + 7.5));
  line(V(-5.9, y5 + 0.65, tz + 6), V(5.9, y5 + 0.65, tz + 6));

  /* The carriage porch: an arch on each of its three open sides, under a flat roof. */
  const p = new THREE.Group(), pw = 11, pd = 7.5, ph = 6.2;
  p.add(at(archWall(pw, ph, 1, 6, 5.2, false, WHITE), 0, 0, pd - 0.5));
  for (const s of [-1, 1]) p.add(at(archWall(pd - 1, ph, 1, 4.2, 5.0, false, WHITE), s * (pw / 2 - 0.5), 0, (pd - 1) / 2).rotateY(Math.PI / 2));
  p.add(box(pw + 0.8, 0.5, pd + 0.4, SHADE, 0, ph, pd / 2), box(pw + 2, 0.3, pd + 3, SHADE, 0, -0.3, pd / 2 + 0.5));
  f.add(at(p, 0, 0.45, CZ));

  /* The end pavilions: forward of the range, a storey higher, each under its own dome. */
  for (const s of [-1, 1]) {
    const e = new THREE.Group(), ed = PZ + D / 2, et = H + 1.6;
    e.add(box(PW, et, ed - 2, WHITE, 0, b, (PZ - D / 2) / 2));
    const cells = [];
    for (const x of [-3.7, 0, 3.7]) cells.push([x, 0.5, 2.4, 4.0, 'room'], [x, F + 0.6, 2.4, 3.9, 'room']);
    e.add(at(arcadeSkin(PW, et, cells, 1, WHITE, { trim: SHADE, pointed: false }), 0, b, PZ - 1));
    e.add(box(PW + 0.9, 0.6, ed + 0.6, SHADE, 0, b + et, PZ - ed / 2));
    const yd = b + et + 0.6, dz = 2;
    e.add(box(8, 1.2, 8, WHITE, 0, yd, dz), cyl(3.5, 3.7, 1.4, WHITE, 0, yd + 1.2, dz, 8), cyl(3.9, 3.9, 0.25, SHADE, 0, yd + 2.6, dz, 28));
    e.add(at(palaceDome(3.3), 0, yd + 2.85, dz), cyl(0.22, 0.36, 0.5, DOME, 0, yd + 2.85 + 3.6, dz, 8), at(finial(1.2, DOME), 0, yd + 2.85 + 4.0, dz));
    f.add(at(mergeByMaterial(e), s * PX, 0, 0));
    domeLights(s * PX, yd + 2.85, dz, 3.3);
    for (const x of [-PW / 2, PW / 2]) line(V(s * PX + x, b, PZ + 0.3), V(s * PX + x, yd, PZ + 0.3));
    line(V(s * PX - PW / 2, yd + 0.05, PZ + 0.4), V(s * PX + PW / 2, yd + 0.05, PZ + 0.4));
  }
  f.add(bulbPoints(bulbs));
  addDetails(f, g);
  // The home view: the south front from down the approach between the two lakes.
  return { group: g, focus: f, view: [0.03, 0.075, 1], zoom: 0.9 };
}

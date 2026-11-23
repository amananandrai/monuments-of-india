import * as THREE from 'three';
import { M, mat, mesh, box, cyl, at, onFace, hipRoof, inst, unitBox, FACES } from '../helpers.js';
import { mergeByMaterial, windowFrame, jali, louvredShutter, carved } from '../parts/components.js';
import { trees, shrubs, lampPosts, stalls, scatter, along, townHouses } from '../parts/realism.js';
import { detail } from '../detail.js';
import { P, LIME, TRIM, TILE, TEAL, EAVE } from '../monuments/paradesi-synagogue.js';

const DIAL = mat('#22262b', 0.6), NUM = mat('#e9e4d2', 0.6), IRON = mat('#2b2b2e', 0.6, 0.4), LEAD = mat('#6f7f78', 0.7), BRASS = mat('#9a7a3a', 0.4, 0.7);

// Figures h high built of seven strokes, for the year painted on the dials.
const SEG = { 0: 'abcdef', 1: 'bc', 6: 'afgedc', 7: 'abc' };
function digits(text, h, m) {
  const g = new THREE.Group(), w = h * 0.5, t = h * 0.14, S = { a: [0, h - t, w, t], g: [0, h / 2 - t / 2, w, t], d: [0, 0, w, t], f: [-w / 2 + t / 2, h / 2, t, h / 2], b: [w / 2 - t / 2, h / 2, t, h / 2], e: [-w / 2 + t / 2, 0, t, h / 2], c: [w / 2 - t / 2, 0, t, h / 2] };
  [...text].forEach((ch, k) => { for (const c of SEG[ch] || '') { const [x, y, sw, sh] = S[c]; g.add(box(sw, sh, 0.015, m, x + (k - (text.length - 1) / 2) * w * 1.5, y, 0)); } });
  return g;
}

// A dial of the clock of 1760: a square dark board 1.3 m across under a little hood on two
// corbels, the hours in a ring, two hands, and "17" and "60" painted in the bottom corners. The
// three dials are lettered differently: Roman numerals (thin strokes), Hebrew letters (square
// blocks) and Malayalam numerals (round loops).
function dial(kind) {
  const g = new THREE.Group(), s = 1.3, R = 0.5;
  g.add(box(s, s, 0.08, DIAL, 0, -s / 2, 0.04), box(s + 0.3, 0.07, 0.3, TEAL, 0, s / 2 + 0.03, 0.15));
  for (const x of [-0.4, 0.4]) g.add(box(0.1, 0.16, 0.14, TEAL, x, -s / 2 - 0.16, 0.07));
  g.add(mesh(new THREE.TorusGeometry(R + 0.09, 0.012, 4, 32), NUM, 0, 0, 0.085), mesh(new THREE.TorusGeometry(R - 0.14, 0.01, 4, 32), NUM, 0, 0, 0.085));
  for (let k = 0; k < 12; k++) {
    const a = k * Math.PI / 6, x = Math.sin(a) * (R - 0.03), y = Math.cos(a) * (R - 0.03);
    let o;
    if (kind === 'roman') { o = new THREE.Group(); const n = 1 + k % 3; for (let j = 0; j < n; j++) o.add(box(0.022, 0.15, 0.015, NUM, (j - (n - 1) / 2) * 0.045, -0.075, 0)); }
    else if (kind === 'hebrew') { o = new THREE.Group(); o.add(box(0.1, 0.03, 0.015, NUM, 0, 0.04, 0), box(0.03, 0.1, 0.015, NUM, 0.035, -0.06, 0)); }
    else o = mesh(new THREE.TorusGeometry(0.045, 0.014, 4, 10), NUM);
    o.position.set(x, y, 0.085); o.rotation.z = kind === 'roman' ? -a : 0;
    g.add(o);
  }
  for (const [len, a, w] of [[0.3, -1.1, 0.04], [0.45, 1.25, 0.028]]) { const h = box(w, len, 0.015, NUM, 0, 0, 0.1); h.geometry = h.geometry.clone().rotateZ(-a); g.add(h); }
  g.add(at(digits('17', 0.13, NUM), -s / 2 + 0.16, -s / 2 + 0.05, 0.085), at(digits('60', 0.13, NUM), s / 2 - 0.16, -s / 2 + 0.05, 0.085));
  return g;
}

// A wall lantern: a glazed iron box on a bracket, as hang either side of the synagogue's door.
export function lantern() {
  const g = new THREE.Group();
  g.add(box(0.05, 0.05, 0.4, IRON, 0, 0.5, 0.2), box(0.03, 0.14, 0.03, IRON, 0, 0.36, 0.36), box(0.26, 0.3, 0.26, mat('#e8dcae', 0.3, 0, { emissive: '#7a6a30' }), 0, 0.06, 0.36));
  g.add(box(0.3, 0.03, 0.3, IRON, 0, 0.04, 0.36), at(hipRoof(0.36, 0.36, 0.14, IRON), 0, 0.36, 0.36));
  return g;
}

// The clock tower's dress, on a group whose origin is the tower's foot. On the lane's face: a teal
// plank door under a hood at the foot, a wide lattice window above it, and the clock between two
// shuttered windows under the eaves; the Roman dial to the lane, the Malayalam dial to the palace
// (-x), the Hebrew dial to the synagogue (-z), the fourth face blank. Under the roof the rafter
// ends; on its peak the bell cupola: four timber posts round a balustrade and the bell, a flat
// wide-eaved cap, a ball finial and the iron vane with its scrolls and pennant.
export function towerDress(t) {
  const { T, TH } = P, cy = TH - 1.75, r = T / 2;
  const faces = [[0, 'roman'], [-Math.PI / 2, 'malayalam'], [Math.PI, 'hebrew']];
  for (const [a, kind] of faces) t.add(onFace(at(dial(kind), 0, cy, 0), a, r));
  // Shuttered windows either side of each dial, and on the blank face; each in a teal frame.
  const fr = windowFrame(0.75, 1.05, TEAL, { shape: 'flat', frame: 0.09 }), sh = louvredShutter(0.75, 1.05, TEAL, { out: 0.04 });
  for (const a of FACES) for (const x of [-1.75, 1.75]) t.add(onFace(at(fr.clone(), 0, cy - 0.55, 0), a, r + 0.01, x), onFace(at(sh.clone(), 0, cy - 0.55, 0), a, r + 0.01, x));
  // The lattice window and the door, on the lane.
  t.add(onFace(at(windowFrame(1.9, 1.05, TEAL, { shape: 'flat', screen: jali(TEAL), frame: 0.1 }), 0, 4.1, 0), 0, r + 0.07), box(2.5, 0.07, 0.3, TEAL, 0, 5.3, r + 0.2));
  t.add(box(1.15, 2, 0.08, TEAL, 0, 0.25, r + 0.13), box(0.03, 2, 0.02, EAVE, 0, 0.25, r + 0.21), box(1.5, 0.08, 0.28, TEAL, 0, 2.3, r + 0.24), box(1.6, 0.25, 0.6, LIME, 0, 0, r + 0.4), box(0.3, 0.05, 0.03, IRON, 0, 1.2, r + 0.22));
  // Rafter ends under the eaves, and the two iron stays that hang from them over the clock.
  const raf = [];
  for (const a of FACES) for (let k = -5; k <= 5; k++) raf.push([Math.sin(a) * (r + 0.6) + Math.cos(a) * k * 0.62, TH - 0.12, Math.cos(a) * (r + 0.6) - Math.sin(a) * k * 0.62, 0.09, 0.12, 1.2, a]);
  t.add(inst(unitBox(), raf, EAVE));
  for (const x of [-0.55, 0.55]) t.add(box(0.04, 0.55, 0.04, IRON, x, TH - 0.55, r + 0.12));
  // The cupola.
  const c = new THREE.Group(), y0 = TH + 0.16 + 1.9 * (1 - 1.7 / (T + 2.8)), cw = 1.5, ch = 1.75;
  c.add(box(cw + 0.3, 0.3, cw + 0.3, LEAD, 0, -0.25, 0), box(cw + 0.1, 0.08, cw + 0.1, TEAL, 0, 0.05, 0));
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) c.add(box(0.17, ch, 0.17, TEAL, sx * (cw / 2 - 0.085), 0.1, sz * (cw / 2 - 0.085)));
  for (const a of FACES) {
    c.add(onFace(box(cw - 0.34, 0.05, 0.07, TEAL, 0, 0.62, 0), a, cw / 2 - 0.09), onFace(box(cw - 0.34, 0.3, 0.1, TEAL, 0, ch - 0.22, 0), a, cw / 2 - 0.09));
    for (let k = -3; k <= 3; k++) c.add(onFace(box(0.04, 0.5, 0.04, NUM, 0, 0.12, 0), a, cw / 2 - 0.09, k * 0.15));
  }
  c.add(mesh(new THREE.CylinderGeometry(0.14, 0.3, 0.42, 12, 1, true), BRASS, 0, 1.0, 0), cyl(0.02, 0.02, 0.3, IRON, 0, 1.2, 0, 6));
  c.add(box(3.1, 0.12, 3.1, EAVE, 0, ch + 0.08, 0), at(hipRoof(3.2, 3.2, 0.45, LEAD), 0, ch + 0.2, 0));
  c.add(mesh(new THREE.SphereGeometry(0.13, 10, 8), LEAD, 0, ch + 0.72, 0), cyl(0.05, 0.09, 0.2, LEAD, 0, ch + 0.5, 0, 8), cyl(0.015, 0.02, 1.45, IRON, 0, ch + 0.8, 0, 6));
  for (const s of [-1, 1]) { const sc = mesh(new THREE.TorusGeometry(0.11, 0.012, 4, 14, Math.PI * 1.5), IRON, s * 0.12, ch + 1.2, 0); sc.rotation.z = s > 0 ? Math.PI : -Math.PI / 2; c.add(sc); }
  c.add(box(0.36, 0.014, 0.014, IRON, 0, ch + 1.33, 0), mesh(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0.16, 0), new THREE.Vector3(0.42, 0.1, 0), new THREE.Vector3(0, 0, 0)]), mat('#d8d4c4', 0.8, 0, { side: THREE.DoubleSide }), 0.02, ch + 2.06, 0));
  t.add(at(c, 0, y0, 0));
}

// Jew Town, Mattancherry, round the Paradesi Synagogue: Synagogue Lane, narrow and paved, running
// up to the clock tower between rows of two-storey houses, their fronts painted and their roofs
// tiled, most of them now antique and spice shops with stalls before them; a laterite wall round
// the synagogue's yard; the palms and mango trees of the yards behind; and to the west the wall
// of the Mattancherry Palace compound.
export function addDetails(f, g) {
  const { W, D, FZ, TX } = P, lx = TX;
  g.add(box(380, 0.06, 380, M.grass, 0, -0.06, 30));
  // The lane, paved in stone, and a cross street at its far end.
  g.add(box(9, 0.05, 130, M.path, lx, 0, FZ + 64), box(220, 0.05, 8, M.asphalt, 0, 0, FZ + 132));
  g.add(box(26, 0.04, 6, M.path, 0, 0, FZ + 2.6));
  // The synagogue's yard: a laterite wall round the back and sides, whitewashed, with a tiled
  // coping, and a gate in the side.
  const wl = new THREE.Group(), x0 = -W / 2 - 9, x1 = W / 2 + 9, z0 = -D / 2 - 8;
  wl.add(box(x1 - x0, 2.6, 0.5, LIME, (x0 + x1) / 2, 0, z0), box(x1 - x0 + 0.3, 0.16, 0.8, TILE, (x0 + x1) / 2, 2.6, z0));
  for (const x of [x0, x1]) wl.add(box(0.5, 2.6, FZ - 1 - z0, LIME, x, 0, (z0 + FZ - 1) / 2), box(0.8, 0.16, FZ - 1 - z0 + 0.3, TILE, x, 2.6, (z0 + FZ - 1) / 2));
  // A small gatehouse on the yard's east wall, under a tiled roof.
  wl.add(box(3, 3, 3, LIME, x1, 0, -2), at(hipRoof(4, 4, 1.4, TILE), x1, 3, -2));
  // The Hebrew inscription slab of 1344, from the older Kochangadi synagogue, set in the yard's
  // outer wall by the lane.
  wl.add(box(0.06, 0.7, 1, carved(M.granite, 'script'), x1 + 0.27, 1.1, FZ - 4));
  f.add(mergeByMaterial(wl));
  // The houses along the lane: on each side a row of narrow two-storey fronts, facing it.
  const R = (k) => ((Math.sin(k * 12.9898) * 43758.5453) % 1 + 1) % 1, left = [], right = [];
  for (let z = FZ + 16, k = 0; z < FZ + 126; k++) { const w = 7 + R(k) * 4; left.push([lx - 4.5 - 5.5, z + w / 2, w, 11, 2, Math.PI / 2]); z += w + 0.3; }
  for (let z = FZ + 18, k = 70; z < FZ + 126; k++) { const w = 7 + R(k) * 4; right.push([lx + 4.5 + 5.5, z + w / 2, w, 11, 2, -Math.PI / 2]); z += w + 0.3; }
  g.add(townHouses([...left, ...right], { seed: 4, roof: 'pitched', roofs: ['#8e4630', '#9a4a32', '#7d3e2a'], tanks: 0, paint: ['#f1e6c8', '#c7dbe0', '#e8c9a0', '#f4f1ea', '#d9e6c8', '#e7b9a8'] }));
  // Rows behind them, and the houses either side of the synagogue.
  g.add(townHouses([...Array(7)].map((_, k) => [lx - 24, FZ + 14 + k * 16, 14, 12, 2, -Math.PI / 2]).concat([...Array(7)].map((_, k) => [lx + 26, FZ + 14 + k * 16, 14, 12, 2, Math.PI / 2])), { seed: 8, roof: 'pitched', roofs: ['#8e4630', '#7d3e2a'], tanks: 0 }));
  g.add(townHouses([[x1 + 12, -4, 12, 14, 2, -Math.PI / 2], [x1 + 12, -20, 12, 12, 2, -Math.PI / 2]], { seed: 11, roof: 'pitched', roofs: ['#8e4630'], tanks: 0 }));
  // The Mattancherry Palace compound to the west: its laterite wall.
  g.add(box(0.7, 2.4, 70, TRIM, x0 - 16, 0, -6));
  // Stalls of the antique and spice shops along the lane.
  if (!detail.low) g.add(stalls([...along(6, [lx - 3.2, FZ + 22], [lx - 3.2, FZ + 78])].map(([x, z]) => [x, z, Math.PI / 2]).concat([...along(5, [lx + 3.2, FZ + 26], [lx + 3.2, FZ + 70])].map(([x, z]) => [x, z, -Math.PI / 2]))));
  g.add(lampPosts([...along(5, [lx - 3.9, FZ + 8], [lx - 3.9, FZ + 110])]));
  // Palms and mangoes in the yards; flowering shrubs in the synagogue's yard.
  g.add(trees([[x0 + 3, z0 + 4], [x1 - 3, z0 + 3], [x0 + 3, 4], [-40, -20], [-52, 8], [44, -30], [56, 18], [-36, 70], [48, 90]], { kind: 'palm', seed: 3 }));
  g.add(trees(scatter(18, [-170, 170, -150, 190], { seed: 6, gap: 14, avoid: [[-45, 50, -30, FZ + 140]] }), { kind: 'mango', seed: 6 }));
  g.add(shrubs([[x0 + 2, -6, 1.2], [x0 + 2, -12, 1], [x1 - 2, -14, 1.2], [x1 - 2, 8, 1]], { flowers: '#e05a7a', seed: 2 }));
}

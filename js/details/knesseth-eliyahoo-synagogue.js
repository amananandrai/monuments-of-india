import * as THREE from 'three';
import { M, mat, mesh, box, cyl, at } from '../helpers.js';
import { mergeByMaterial, frieze, jali, panel, bracketGeo, keystone } from '../parts/components.js';
import { classicalDoor, column, balustrade, head, headSlab } from '../parts/colonial.js';
import { urn } from '../parts/sculpture.js';
import { trees, lampPosts, along, townHouses, traffic } from '../parts/realism.js';
import { detail } from '../detail.js';
import { P, WHITE, BLUE, BASE } from '../monuments/knesseth-eliyahoo-synagogue.js';

const IRON = mat('#1f2326', 0.5, 0.6);
// Stained glass seen from the street by day: dark, with a little of its blue and ruby.
const STAINED = mat('#2b2f55', 0.25, 0.4);

// A pier of an upper floor, w wide and h tall, `proud` of a wall at z = 0: a base block, a moulded
// cap, and a shaft either sunk as a panel or, on the front's giant piers, fluted.
export function pier(w, h, proud, fluted = false) {
  const g = new THREE.Group();
  g.add(box(w, h, proud, WHITE, 0, 0, proud / 2), box(w + 0.14, 0.5, proud + 0.07, WHITE, 0, 0, (proud + 0.07) / 2), box(w + 0.18, 0.28, proud + 0.09, WHITE, 0, h - 0.28, (proud + 0.09) / 2));
  if (fluted) {
    const n = Math.round(w / 0.16);
    for (let k = 0; k < n; k++) g.add(box(0.07, h - 1.3, 0.05, WHITE, -w / 2 + (k + 0.5) * (w / n), 0.7, proud + 0.025));
  } else g.add(at(panel(w - 0.3, h - 1.3, 0.08, WHITE, null, 0.05), 0, 0.7, proud));
  return g;
}

// A pier of the ground floor: plaster banded in courses with a sunk joint between them.
export function banded(w, h, proud) {
  const g = new THREE.Group(), n = Math.round(h / 0.52), c = h / n;
  g.add(box(w - 0.08, h, proud - 0.05, WHITE, 0, 0, (proud - 0.05) / 2));
  for (let k = 0; k < n; k++) g.add(box(w, c - 0.09, proud, WHITE, 0, k * c + 0.045, proud / 2));
  return g;
}

// A window of the upper floors, its sill at y = 0, filling a bay bw wide: paired lights under a
// roundel in an arched white surround with a keystone, the wall round it sunk and painted indigo,
// and a carved panel under the sill.
export function bayWindow(w, h, bw) {
  const g = classicalDoor(w, h, { m: BLUE, trim: WHITE, fill: 'glass', top: null, depth: 0.2, frame: (bw - w) / 2, band: 0.28 });
  g.add(at(mesh(new THREE.TorusGeometry(w * 0.19, 0.045, 6, 18), WHITE), 0, h - w / 2 + w * 0.22, 0.07));
  g.add(at(panel(bw - 0.3, 0.6, 0.07, WHITE, frieze(WHITE), 0.05), 0, -0.85, 0));
  return mergeByMaterial(g);
}

// The great west window, its sill at y = 0 and its back on z = 0, w wide and h to its crown: three
// round-headed stained-glass lights with three roundels of tracery over them.
function tracery(w, h) {
  const r = w / 2, sp = h - r, sh = new THREE.Shape(), lw = w * 0.24, lx = w * 0.315, lh = sp + lw / 2 - 0.1;
  sh.moveTo(-r - 0.05, 0);
  head(r + 0.05, h + 0.05, 'round').pts.forEach((p) => sh.lineTo(p.x, p.y));
  sh.lineTo(r + 0.05, 0);
  sh.closePath();
  for (const cx of [-lx, 0, lx]) {
    const p = new THREE.Path();
    p.moveTo(cx - lw / 2, 0.15);
    head(lw / 2, lh, 'round').pts.forEach((q) => p.lineTo(cx + q.x, q.y));
    p.lineTo(cx + lw / 2, 0.15);
    p.closePath();
    sh.holes.push(p);
  }
  for (const [cx, cy, rr] of [[0, sp + r * 0.575, r * 0.275], [-r * 0.54, sp + r * 0.4, r * 0.155], [r * 0.54, sp + r * 0.4, r * 0.155]]) {
    const p = new THREE.Path();
    p.absarc(cx, cy, rr, 0, Math.PI * 2, true);
    sh.holes.push(p);
  }
  const g = new THREE.Group();
  g.add(mesh(new THREE.ExtrudeGeometry(sh, { depth: 0.12, bevelEnabled: false, curveSegments: 10 }), WHITE, 0, 0, 0.1));
  g.add(at(headSlab(w * 0.999, h * 0.999, 'round', STAINED, 0.03), 0, 0, 0.05));
  // Colonnettes between the lights.
  for (const s of [-1, 1]) g.add(cyl(0.08, 0.08, lh - lw / 2 - 0.15, WHITE, s * lx / 2, 0.15, 0.25, 8), box(0.24, 0.12, 0.2, WHITE, s * lx / 2, lh - lw / 2, 0.25));
  return g;
}

// The finer architecture of the west front. From photographs: the great window in its moulded
// arch on paired fluted Corinthian columns, a balustraded balconette before it on a bay of lattice
// panels; under that the entrance, a small pediment carried on large scroll brackets, with an urn
// either side; modillions under the pediment's raking cornices; and a second porch on the lane.
function architecture(f) {
  const { W, D, H, BW, PR, G, F1 } = P, d = new THREE.Group();
  // The great window: an indigo panel between the giant piers, the arch cut through it.
  const gw = 5.4, gh = 5, sill = 7.9, cw = BW - 3.2;
  d.add(at(classicalDoor(gw, gh, { m: BLUE, trim: WHITE, fill: 'room', top: null, depth: 0.4, frame: (cw - gw) / 2, band: 0.42, sill: false, keystone: false }), 0, sill, PR));
  d.add(at(tracery(gw, gh), 0, sill, PR));
  d.add(at(mesh(new THREE.TorusGeometry(gw / 2 + 0.42, 0.09, 6, 28, Math.PI), WHITE), 0, sill + gh - gw / 2, PR + 0.46));
  d.add(at(keystone(0.45, 0.8, 0.22, WHITE, 0.2), 0, sill + gh - 0.05, PR + 0.4));
  for (const s of [-1, 1]) {
    for (const x of [gw / 2 + 0.45, gw / 2 + 1]) d.add(at(column(0.2, gh - gw / 2, WHITE, { order: 'corinthian' }), s * x, sill, PR + 0.68));
    d.add(box(1.3, 0.26, 0.6, WHITE, s * (gw / 2 + 0.72), sill + gh - gw / 2, PR + 0.6));
    d.add(box(1.25, 0.3, 0.75, WHITE, s * (gw / 2 + 0.72), sill - 0.3, PR + 0.5));
  }
  // The bay of lattice panels under it, and the balconette on its head.
  d.add(box(gw + 0.4, sill - F1 - 0.2, 0.5, WHITE, 0, F1, PR + 0.25));
  for (const x of [-1.9, 0, 1.9]) d.add(at(panel(1.7, sill - F1 - 0.7, 0.1, WHITE, jali(WHITE), 0.06), x, F1 + 0.2, PR + 0.5));
  d.add(box(gw + 0.8, 0.22, 1.2, WHITE, 0, sill - 0.22, PR + 0.6), at(balustrade(gw + 0.5, 0.85, WHITE), 0, sill, PR + 1.05));
  for (const s of [-1, 1]) {
    d.add(at(balustrade(0.9, 0.85, WHITE), s * (gw / 2 + 0.25), sill, PR + 0.6).rotateY(Math.PI / 2), box(0.3, 0.95, 0.3, WHITE, s * (gw / 2 + 0.25), sill, PR + 1.05));
    d.add(mesh(bracketGeo(0.9, 0.6, 0.3), WHITE, s * 2.3, sill - 0.22, PR + 0.5));
  }
  // The entrance: the door under a small pediment on scroll brackets; an urn on a pier either side;
  // an arched window in each flank of the bay.
  const porchDoor = () => classicalDoor(2.1, 3.3, { m: WHITE, trim: WHITE, fill: 'door', top: 'pediment', depth: 0.7, frame: 0.55, stepsDown: 0.5 });
  const scroll = (s, y) => mesh(bracketGeo(1.5, 0.75, 0.4), WHITE, s * 1.3, y, 0.7);
  const west = new THREE.Group(), north = new THREE.Group();
  for (const p of [west, north]) {
    p.add(at(porchDoor(), 0, 0.5, 0));
    for (const s of [-1, 1]) p.add(scroll(s, 4.3), box(0.6, 4, 0.6, WHITE, s * 2.2, 0.5, 0.4), box(0.76, 0.16, 0.76, WHITE, s * 2.2, 4.5, 0.4), at(urn(0.9, WHITE), s * 2.2, 4.66, 0.4));
  }
  d.add(at(west, 0, 0, PR), at(north, W / 2, 0, -D / 2 + (D - 1) / 16 * 3).rotateY(Math.PI / 2));
  for (const s of [-1, 1]) d.add(at(classicalDoor(1.1, 2.9, { m: WHITE, trim: WHITE, fill: 'glass', top: null, depth: 0.2, frame: 0.25 }), s * 3.9, 1.2, PR));
  // Modillions under the raking cornices of the pediment, and a roundel in its tympanum.
  const pw = BW + 1.1, ph = 3.7, a = Math.atan2(ph, pw / 2), n = 13;
  for (const s of [-1, 1]) for (let k = 1; k < n; k++) {
    const t = k / n, m = box(0.22, 0.2, 0.3, WHITE, 0, -0.1, 0);
    m.position.set(s * (pw / 2 - 0.5) * (1 - t), H + 0.45 + (ph - 0.62) * t, PR + 0.42);
    m.rotation.z = -s * a;
    d.add(m);
  }
  d.add(at(mesh(new THREE.TorusGeometry(0.6, 0.09, 6, 24), WHITE), 0, H + 1.5, PR + 0.4));
  void G;
  f.add(mergeByMaterial(d));
}

// The synagogue's corner in Kala Ghoda: a narrow forecourt behind iron railings on a low stone
// wall, with a gate in the middle; the pavement and V. B. Gandhi Marg before it, shaded by old
// rain trees; a lane down its north side, where the second porch opens; and the four- and
// five-storey buildings of the Fort district pressed round it and facing it across the road.
export function addDetails(f, g) {
  architecture(f);
  const { W, D } = P, zs = 5.5, lane = 8;
  g.add(box(320, 0.06, 320, M.grass, 0, -0.06, 0));
  // The forecourt, the lane, the pavements and the road.
  g.add(box(W, 0.08, 4.4, M.path, 0, 0, 2.2), box(lane, 0.07, D + 10, M.path, W / 2 + lane / 2 + 0.2, 0, -D / 2 - 0.6));
  g.add(box(300, 0.12, 3.2, M.path, 0, 0, zs - 0.9), box(300, 0.05, 12, M.asphalt, 0, 0, zs + 6.7), box(300, 0.12, 3.2, M.path, 0, 0, zs + 14.3));
  // The railings on their wall, and the gate piers.
  const r = new THREE.Group(), zr = 4.5;
  for (const s of [-1, 1]) {
    const len = W / 2 - 2.2, cx = s * (2.2 + len / 2);
    r.add(box(len, 0.6, 0.4, BASE, cx, 0, zr), box(len, 0.08, 0.08, IRON, cx, 1.75, zr));
    for (let k = 0; k <= Math.floor(len / 0.18); k++) r.add(cyl(0.018, 0.018, 1.3, IRON, cx - len / 2 + k * 0.18, 0.6, zr, 5));
    r.add(box(0.9, 2.4, 0.9, WHITE, s * 1.8, 0, zr));
  }
  f.add(mergeByMaterial(r));
  // The neighbours either side and behind: tall stone and plastered blocks, built to the line.
  g.add(townHouses([[-W / 2 - 8.2, -D / 2 + 1, 16, D + 6, 5, 0], [W / 2 + 7.2 + lane, -D / 2 + 1, 14, D + 6, 4, 0], [-W / 2 - 24.4, -D / 2 + 1, 16, D + 6, 4, 0], [W / 2 + 22.4 + lane, -D / 2 + 1, 16, D + 6, 5, 0], [0, -D - 12, 24, 14, 5, Math.PI]], { seed: 7, tanks: 0.3, paint: ['#e5d6b8', '#d8c7a6', '#efe6d4', '#c9b79a'] }));
  // Across the road.
  g.add(townHouses([...Array(8)].map((_, k) => [-70 + k * 20, zs + 28, 18, 18, 3 + (k % 2), Math.PI]), { seed: 9, tanks: 0.3, paint: ['#e5d6b8', '#efe6d4', '#c9b79a', '#d7b98f'] }));
  // Rain trees along the road, cars parked and passing, and lamps.
  g.add(trees([...along(6, [-60, zs - 1.6], [60, zs - 1.6]), ...along(6, [-55, zs + 15], [65, zs + 15])].filter(([x]) => x < -9 || x > 26), { kind: 'tamarind', seed: 4 }));
  if (!detail.low) g.add(traffic([[zs + 3.6, 1], [zs + 9.8, -1]], -140, 140, { y: 0.05, seed: 5, gap: 18, taxis: 0.35, buses: 0.08, trucks: 0 }));
  g.add(lampPosts([...along(5, [-50, zs + 0.3], [50, zs + 0.3])].filter(([x]) => Math.abs(x) > 4)));
}

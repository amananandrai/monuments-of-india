import * as THREE from 'three';
import { M, box, cyl, at, chhatri, onionDome, hemi, finial, aroundRect } from '../helpers.js';
import { iwan, arcadeSkin } from '../details/mughal.js';
import { jali, chhajja, bracketGeo, placeAll } from '../details/components.js';
import { addDetails } from '../details/buland-darwaza.js';

export function buildBulandDarwaza() {
  const Rd = M.red, Rl = M.redLight, Mb = M.marble, g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  g.add(box(260, 0.2, 340, M.path, 0, 0, -50));
  // The high platform and its broad flight of steps
  const P = 13;
  f.add(box(70, P, 30, Rd, 0, 0, -4));
  for (let k = 0; k < 10; k++) f.add(box(48 - k * 0.8, P - k * 1.3, 3, Rl, 0, 0, 12.5 + k * 3));
  // The gate: a great iwan 6 m deep under its half-dome, outlined in white marble, with the
  // doorway and a screened window at its back; flanked by angled wings
  f.add(box(42, 38, 14, Rd, 0, P, -5), box(43, 1, 21, Mb, 0, P + 38, -2));
  for (const s of [-1, 1]) f.add(box(5.5, 38, 6, Rd, s * 18.25, P, 5));
  f.add(box(31, 3, 6, Rd, 0, P + 35, 5));
  f.add(at(iwan(26, 32, { m: Rd, trim: Mb, shade: Rl, depth: 6, frame: 2.5, top: 3, door: [6, 8.5], rosettes: true }), 0, P, 2));
  for (const s of [-1, 1]) {
    const w = box(12, 30, 14, Rd, 0, P, 0);
    w.position.set(s * 24.5, P + 15, 1);
    w.rotation.y = -s * Math.PI / 5;
    f.add(w);
    for (const y of [P + 2, P + 15]) f.add(at(iwan(4, 8, { m: Rd, trim: Mb, shade: Rl, depth: 0.8, frame: 0.5, top: 0.6, fill: 'jali', band: false }), s * 24.5 + s * 2.6, y, 6.6).rotateY(-s * Math.PI / 5));
    f.add(cyl(1.7, 1.7, 41, Rd, s * 21, P, 8.2, 8), at(onionDome(1.8, Mb), s * 21, P + 41, 8.2));
  }
  // Rows of kiosks along the top
  for (let k = 0; k < 13; k++) f.add(at(chhatri(1.25, 4.2, Rd, Mb), -18 + k * 3, P + 39, 6.5));
  for (const x of [-13, 0, 13]) f.add(at(chhatri(3, 8, Rd, Mb), x, P + 39, -5));
  // Behind the gate, on the ridge top, the Jama Masjid it opens into: a court ringed by cloisters,
  // the prayer hall on the west, the Badshahi Darwaza on the east, and in the court Salim Chishti's
  // white marble tomb and Islam Khan's red one.
  f.add(jamaMasjid(P));
  addDetails(f, g);
  return { group: g, focus: f, view: [0.5, 0.25, 1.25] };
}

// The court is about 120 m square inside its cloisters (z from -18 to -138, x from -60 to 60);
// the Buland Darwaza stands in the middle of its south side. West here is -x.
function jamaMasjid(P) {
  const Rd = M.red, Rl = M.redLight, Mb = M.marble, g = new THREE.Group();
  const X0 = -60, X1 = 60, Z0 = -18, Z1 = -138, cx = 0, cz = (Z0 + Z1) / 2;
  // The ridge top the mosque stands on, level with the gate's platform.
  g.add(box(164, P, 140, Rl, -6, 0, cz), box(X1 - X0, 0.2, Z0 - Z1, M.redLight, cx, P, cz));
  // A cloister range: its back wall outward, an arcade of pointed arches opening on the court.
  const cloister = (len, gap = 0) => {
    const r = new THREE.Group(), cells = [], n = Math.floor(len / 5);
    for (let k = 0; k < n; k++) { const x = -len / 2 + (k + 0.5) * (len / n); if (Math.abs(x) > gap / 2 + 2) cells.push([x, 0.4, 3.2, 5.4]); }
    r.add(box(len, 7.5, 7, Rd, 0, 0, -3.5), box(len + 0.6, 0.5, 8, Mb, 0, 7.5, -3.6));
    r.add(at(arcadeSkin(len, 7.5, cells, 0.8, Rd, { trim: Mb, fill: 'room' }), 0, 0, 0));
    return r;
  };
  // The south range runs from the gate's back to each corner.
  for (const s of [-1, 1]) g.add(at(cloister(33), s * 43.5, P, Z0 - 0.8).rotateY(Math.PI));
  g.add(at(cloister(X1 - X0, 22), cx, P, Z1 + 0.8));
  g.add(at(cloister(Z0 - Z1, 20), X1 - 0.8, P, cz).rotateY(-Math.PI / 2));
  // The Badshahi Darwaza: the emperor's own gate, in the east range.
  const bd = new THREE.Group();
  bd.add(box(18, 15, 12, Rd, 0, 0, 0), box(18.6, 0.6, 12.6, Mb, 0, 15, 0), at(iwan(8, 11, { m: Rd, trim: Mb, shade: Rl, depth: 1.6, frame: 1.2, top: 1.2 }), 0, 0, 4.4));
  for (const x of [-6.5, 6.5]) bd.add(at(chhatri(1.4, 4.4, Rd, Mb), x, 15.6, -4));
  g.add(at(bd, X1 + 2, P, cz).rotateY(-Math.PI / 2));
  // The prayer hall on the west: a long range of arches about the great iwan, under three domes.
  const hx = X0 - 11, hl = Z0 - Z1;
  g.add(box(22, 15, hl, Rd, hx, P, cz), box(22.6, 0.6, hl + 0.6, Mb, hx, P + 15, cz));
  const cells = [];
  for (let k = 0; k < 18; k++) { const z = -hl / 2 + (k + 0.5) * (hl / 18); if (Math.abs(z) > 10) cells.push([z, 0.5, 3.6, 8]); }
  g.add(at(arcadeSkin(hl, 15, cells, 1.2, Rd, { trim: Mb, fill: 'room' }), X0 + 0.6, P, cz).rotateY(Math.PI / 2));
  g.add(at(box(20, 26, 4, Rd, 0, 0, 0), X0 + 1.2, P, cz).rotateY(Math.PI / 2), at(iwan(12, 21, { m: Rd, trim: Mb, shade: Rl, depth: 2.6, frame: 2, top: 2.4 }), X0 + 0.6, P, cz).rotateY(Math.PI / 2));
  for (const [z, r] of [[0, 9], [-36, 6.5], [36, 6.5]]) {
    g.add(cyl(r * 0.95, r * 0.95, 2.6, Rd, hx, P + 15.6, cz + z, 32), at(hemi(r, Mb, 32), hx, P + 18.2, cz + z), at(finial(r * 0.5), hx, P + 18.2 + r, cz + z));
  }
  for (const z of [-48, -24, 24, 48]) g.add(at(chhatri(1.6, 5, Rd, Mb), hx + 9, P + 15.6, cz + z));
  // Salim Chishti's tomb: white marble, ringed by a pierced screen, its eaves on serpentine
  // brackets, under a low dome. North of the court's middle, facing the gate.
  const sc = new THREE.Group(), W = 14;
  sc.add(box(W + 6, 1.2, W + 6, Mb), box(W, 7, W, jali(Mb), 0, 1.2, 0), box(W - 4, 7.4, W - 4, Mb, 0, 1.2, 0));
  sc.add(box(W + 0.6, 0.6, W + 0.6, Mb, 0, 8.2, 0));
  for (const [a, b] of [[0, 1], [Math.PI / 2, 1], [Math.PI, 1], [-Math.PI / 2, 1]]) {
    const e = chhajja(W + 3, 1.8, 0.7, 0.14, Mb);
    e.position.set(Math.sin(a) * (W / 2 + 0.2), 8.1, Math.cos(a) * (W / 2 + 0.2));
    e.rotation.y = a;
    sc.add(e);
  }
  sc.add(placeAll(bracketGeo(1.6, 1.4, 0.3), aroundRect(W, W, 1.75).map(([x, z, ry]) => [x, 7.9, z, ry]), Mb));
  sc.add(cyl(3.6, 3.6, 1.6, Mb, 0, 8.8, 0, 32), at(hemi(3.8, Mb, 32), 0, 10.4, 0), at(finial(2), 0, 14.2, 0));
  g.add(at(sc, -6, P, -96));
  // Islam Khan's tomb beside it, in red sandstone, its dome ringed by small kiosks.
  const ik = new THREE.Group();
  ik.add(box(18, 1, 18, Rl), box(14, 10, 14, Rd, 0, 1, 0), box(14.6, 0.6, 14.6, Mb, 0, 11, 0));
  ik.add(cyl(5.4, 5.4, 2.4, Rd, 0, 11.6, 0, 24), at(hemi(5.6, Rl, 24), 0, 14, 0), at(finial(2.4), 0, 19.6, 0));
  for (const [x, z] of aroundRect(13, 13, 2.6).map(([x, z]) => [x, z])) ik.add(at(chhatri(0.55, 2.2, Rd, Mb), x, 11.6, z));
  g.add(at(ik, 22, P, -112));
  return g;
}

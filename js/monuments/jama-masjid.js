import * as THREE from 'three';
import { M, box, cyl, at, onionDome, finial, chhatri, minaret, latheStripes, ONION } from '../helpers.js';
import { iwan, arcadeSkin } from '../details/mughal.js';
import { addDetails } from '../details/jama-masjid.js';
import { detail } from '../detail.js';

// The three cloisters on the platform (its top at P), as open galleries: [length, centre along
// the side, the side's turn]. The east one runs across the front (z = 47 to 55), the north and south
// ones down the sides (x = ±47 to ±55) from the prayer hall to the east cloister. Arches 3.2 wide and
// 5.4 high every 5 m, none where a gate stands (it fills the gallery there), and on desktops a blind
// niche on the inner face of the outer wall opposite each.
function cloisters(P) {
  const Rd = M.red, Mb = M.marble, g = new THREE.Group(), D = 8, H = 7, OUT = 2.2, ARC = 1.2;
  const run = (len, inGate, ry) => {
    const side = new THREE.Group(), cells = [], niches = [];
    for (let t = -len / 2 + 2.5; t < len / 2 - 1; t += 5) {
      if (inGate(t)) continue;
      cells.push([t, 0.4, 3.2, 5.4]);
      niches.push([t, 0.6, 2.6, 4.4]);
    }
    // In the side's own frame: the court is towards +z, the arcade's face at z = 0.
    side.add(box(len, H - 0.8, OUT, Rd, 0, 0, -D + OUT / 2), box(len, 0.8, D, Rd, 0, H - 0.8, -D / 2));
    side.add(at(arcadeSkin(len, H - 0.8, cells, ARC, Rd, { trim: Mb, fill: 'none' }), 0, 0, -ARC));
    side.add(box(len + 0.4, 0.5, D + 0.4, Mb, 0, H, -D / 2));
    if (!detail.low) side.add(at(arcadeSkin(len, H - 0.8, niches, 0.4, Rd, { trim: Mb, fill: 'room', ring: false }), 0, 0, -D + OUT));
    side.rotation.y = ry;
    return side;
  };
  // East: along x at z = 47, facing the court (-z); the corners belong to the side cloisters.
  g.add(at(run(93.9, (t) => Math.abs(t) < 12, Math.PI), 0, P, 47));
  // North and south: along z at x = ±47, facing the court; from the prayer hall (z = -51) to z = 55.
  // Turned a quarter, the side's t runs to world z = 2 - t (west) or 2 + t (east); the gates stand
  // at z = ±9.
  for (const s of [-1, 1]) g.add(at(run(106, (t) => Math.abs(2 - s * t) < 9, s * Math.PI / 2), -s * 47, P, 2));
  // The open ends of the side galleries by the prayer hall are closed by an end wall.
  for (const s of [-1, 1]) g.add(box(D, H, 1, Rd, s * 51, P, -50.5));
  return g;
}

export function buildJamaMasjid() {
  const Rd = M.red, Mb = M.marble, g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  g.add(box(200, 0.2, 200, M.path));
  const P = 6;
  f.add(box(110, P, 110, Rd), box(96, 0.2, 96, M.redLight, 0, P, 6));
  // Cloisters on three sides, with gateways east, north and south: each an open gallery 8 deep,
  // an arcade of pointed arches towards the court (its face at 47 from the centre), a walk behind it,
  // and the solid outer wall, under a flat roof with a marble cornice.
  f.add(cloisters(P));
  const gate = (big) => {
    const w = big ? 24 : 18, h = big ? 18 : 15, gr = new THREE.Group();
    gr.add(box(w, h, 14, Rd), box(w + 0.4, 0.6, 14.4, Mb, 0, h - 0.6), at(iwan(w * 0.42, h * 0.75, { m: Rd, trim: Mb, shade: M.redLight, depth: 1.8, frame: w * 0.08, top: h * 0.1 }), 0, 0, 7));
    for (const x of [-w / 2 + 2, w / 2 - 2]) gr.add(at(chhatri(1.8, 5.5, Rd, Mb), x, h, 5));
    gr.add(at(onionDome(3.2, Mb), 0, h, 0));
    return gr;
  };
  f.add(at(gate(true), 0, P, 51));
  // A broad flight of steps down from each gate: the east one widest, onto the bazaar; the north and
  // south ones onto the streets.
  for (let k = 0; k < 6; k++) f.add(box(34 - k * 2, P - k, 3, Rd, 0, 0, 59.5 + k * 3));
  for (const s of [-1, 1]) for (let k = 0; k < 6; k++) f.add(box(3, P - k, 26 - k * 2, Rd, s * (59.5 + k * 3), 0, 0));
  for (const s of [-1, 1]) f.add(at(gate(false), s * 51, P, 0).rotateY(s * Math.PI / 2));
  // Prayer hall with eleven arches, three striped marble domes and two minarets
  const hz = -40;
  // Its front: the great marble iwan, and five open arches either side, 1.4 m deep.
  const cd = 1.4;
  f.add(box(80, 14, 24 - cd, Rd, 0, P, hz - cd / 2), box(80.4, 0.6, 24.4, Mb, 0, P + 13.4, hz));
  f.add(at(iwan(12, 17, { m: Mb, trim: Mb, shade: M.marbleShade, depth: 2.4 + cd, frame: 3, top: 3 }), 0, P, hz + 12 - cd));
  for (const s of [-1, 1]) {
    const cells = [0, 1, 2, 3, 4].map((k) => [s * (14 + k * 5.6) - s * 24.5, 0.5, 4.4, 8.5]);
    f.add(at(arcadeSkin(31, 13.4, cells, cd, Rd, { trim: Mb, fill: 'room' }), s * 24.5, P, hz + 12 - cd));
  }
  [[-18, 7], [0, 9.5], [18, 7]].forEach(([x, r]) => {
    f.add(cyl(r * 0.92, r * 0.92, 3, Mb, x, P + 14, hz - 2, 32));
    // Black marble inlaid in vertical stripes from the base of each dome to its apex.
    const stripes = latheStripes(ONION.map(([a, b]) => [a * r, b * r]), 20, 0.16, M.stoneDark, 2, 0.06);
    f.add(at(onionDome(r, Mb), x, P + 17, hz - 2), at(stripes, x, P + 17, hz - 2), at(finial(r * 0.6), x, P + 17 + r * 1.78, hz - 2));
  });
  // The minarets are striped lengthwise with white marble over the red sandstone, one stripe on
  // each of the shaft's 16 arrises.
  for (const s of [-1, 1]) f.add(at(minaret(34, 2.2, Rd, { capM: Mb }), s * 40, P, hz + 12), at(latheStripes([[2.2, 34 * 0.04], [2.2 * 0.86, 34 * 0.8]], 16, 0.22, Mb, 1, 0.05), s * 40, P, hz + 12));
  f.add(box(16, 0.6, 12, Mb, 0, P, 8), box(14, 0.7, 10, M.water, 0, P, 8));
  for (const x of [-51, 51]) f.add(at(chhatri(3, 8, Rd, Mb), x, P + 7.5, 51));
  addDetails(f, g);
  return { group: g, focus: f, view: [0.65, 0.42, 1.2] };
}

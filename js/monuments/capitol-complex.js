import * as THREE from 'three';
import { M, mat, mesh, box, cyl, lathe, at, inst, unitBox, doubleSided, photo } from '../helpers.js';
import { addDetails } from '../details/capitol-complex.js';

const CONCRETE = photo(mat('#b3aea4', 0.95), 'concrete');
const CONCRETE_DARK = photo(mat('#8f8a80', 0.95), 'concrete');
const PYLONS = [mat('#3d8a4f', 0.7), mat('#e2b22f', 0.7), mat('#c2402f', 0.7)];

function palaceOfAssembly() {
  const g = new THREE.Group();
  g.add(box(64, 16, 64, CONCRETE), box(64.6, 1, 64.6, CONCRETE_DARK, 0, 16));
  // Portico: blade piers carrying an upturned, gutter-shaped roof
  const s = new THREE.Shape();
  s.moveTo(-30, 0); s.lineTo(30, 0); s.lineTo(34, 7); s.quadraticCurveTo(0, -1, -34, 7); s.closePath();
  const roof = new THREE.ExtrudeGeometry(s, { depth: 12, bevelEnabled: false, curveSegments: 16 });
  roof.translate(0, 0, -6);
  g.add(mesh(roof, CONCRETE, 0, 17, 38));
  // Eight thin blade piers, set edge-on to the front, carry the trough.
  const cols = [];
  for (let k = 0; k < 8; k++) cols.push([-26.25 + k * 7.5, 0, 38, 0.7, 17, 10]);
  g.add(inst(unitBox(), cols, CONCRETE));
  // On the roof, after photographs: the great hyperboloid tower over the assembly chamber, as tall
  // again as the building and cut off at a slant; beside it the steep pyramid that lights the
  // council chamber; and between them the slab of the lift tower, from whose head a footbridge
  // crosses to the tower's rim.
  g.add(at(lathe(TOWER, CONCRETE, 48), 6, 17, -4));
  g.add(at(mesh(new THREE.ConeGeometry(10.5, 15, 4).rotateY(Math.PI / 4).translate(0, 7.5, 0), CONCRETE), -19, 17, 2));
  g.add(box(2.6, 17, 6.5, CONCRETE, -8.6, 17, -1));
  return g;
}
// The Secretariat, 254 m long: its fronts a deep brise-soleil of light concrete over dark glazing.
// Along most of the length the egg-crate is a close grid of storey-high cells; the ministers' block
// at the middle breaks it with double-height loggias; two ramp towers stand out from the front, their
// sides slotted where the ramps zig-zag up inside; and on the roof stand the sculpted forms of the
// terrace.
function secretariat() {
  const g = new THREE.Group(), fins = [], slabs = [], L = 254, H = 42, D = 18;
  g.add(box(L, H, D - 2, mat('#3e4246', 0.4, 0.2)), box(L + 0.4, 1.2, D + 2.6, CONCRETE, 0, H));
  for (const s of [-1, 1]) {
    for (let x = -L / 2; x <= L / 2 + 0.01; x += 3.2) {
      const mid = Math.abs(x) < 22;
      if (mid && Math.round(x / 3.2) % 2) continue;
      fins.push([x, 0, s * (D / 2 + 0.4), 0.35, H, 2.6]);
    }
    for (let y = 0; y < H; y += 3.5) {
      slabs.push([-(L / 2 + 22) / 2, y, s * (D / 2 + 0.4), L / 2 - 22, 0.3, 2.6], [(L / 2 + 22) / 2, y, s * (D / 2 + 0.4), L / 2 - 22, 0.3, 2.6]);
      if (Math.round(y / 3.5) % 2 === 0) slabs.push([0, y, s * (D / 2 + 0.4), 44, 0.45, 2.6]);
    }
  }
  g.add(inst(unitBox(), fins, CONCRETE), inst(unitBox(), slabs, CONCRETE));
  for (const x of [-70, 58]) {
    g.add(box(12, H + 4, 10, CONCRETE, x, 0, D / 2 + 5));
    for (let y = 3; y < H; y += 7) for (const sx of [-1, 1]) g.add(box(0.2, 1.4, 7, mat('#3e4246', 0.4, 0.2), x + sx * 6.02, y + (sx > 0 ? 3.5 : 0), D / 2 + 5));
  }
  g.add(at(mesh(new THREE.CylinderGeometry(5, 7, 5, 24, 1, true, 0, Math.PI), doubleSided(CONCRETE)), -30, H + 1.2, 0), box(16, 3.6, 6, CONCRETE, 40, H + 1.2, -2));
  return g;
}
// The High Court (its front towards +z here): two blocks of courtrooms, a long one and a short one,
// under one great parasol of a roof whose underside is a row of vaults and whose ends turn up; and
// between the blocks the open portico, as high as the building, in which stand three giant slabs
// painted green, yellow and red.
export const COURT = { long: [-50, 4], short: [30, 50], h: 18, d: 30 };
function highCourt() {
  const g = new THREE.Group(), { long, short, h, d } = COURT;
  for (const [x0, x1] of [long, short]) g.add(box(x1 - x0, h, d, CONCRETE, (x0 + x1) / 2, 0, 0));
  // The parasol: piers through the blocks carry cross walls, the vaults between them, and the slab.
  const walls = [];
  for (let x = -49; x <= 49; x += 9.8) walls.push([x, h, 0, 0.9, 7, d + 4]);
  g.add(inst(unitBox(), walls, CONCRETE));
  for (let x = -44.1; x < 49; x += 9.8) g.add(at(mesh(new THREE.CylinderGeometry(4.9, 4.9, d + 4, 16, 1, true, Math.PI / 2, Math.PI).rotateX(Math.PI / 2), doubleSided(CONCRETE)), x, h + 2.1, 0));
  g.add(box(104, 1.2, d + 8, CONCRETE, 0, h + 7, 0));
  for (const s of [-1, 1]) { const lip = box(8, 1.2, d + 8, CONCRETE, s * 55, h + 7.9, 0); lip.rotation.z = s * 0.28; g.add(lip); }
  PYLONS.forEach((m, i) => g.add(box(2.6, h + 5.6, 12, m, 26 - i * 9, 0, 6)));
  g.add(box(100, 0.4, 20, M.water, 0, 0, 34));
  return g;
}
// The Open Hand, after photographs: a hand of dark metal sheet that is also a bird, its four
// fingers upright and its thumb stretched out like a head, turning in the wind on a tall shaft;
// the shaft rises through a frame of raw concrete that stands in a sunken court.
function openHand() {
  const g = new THREE.Group(), s = new THREE.Shape(), IRON = mat('#3b3431', 0.5, 0.55);
  const pts = [[0, 0], [3.5, 0.6], [5.8, 2.6], [7.4, 4.6], [6.2, 5.4], [3.6, 4.9], [2.6, 5.6], [2.6, 8.6], [1.6, 9], [1.5, 7.2], [1.2, 9.2], [0.2, 9.3], [0.1, 7.3], [-0.2, 9.2], [-1.2, 9.1], [-1.3, 7.1], [-1.6, 8.6], [-2.6, 8.2], [-2.9, 5.6], [-4.6, 5.9], [-5.2, 4.8], [-3.8, 2.4], [-1.6, 0.4]];
  pts.forEach(([x, y], i) => (i ? s.lineTo(x, y) : s.moveTo(x, y)));
  s.closePath();
  g.add(cyl(0.45, 0.45, 16.5, IRON, 0, 0, 0, 10), mesh(new THREE.ExtrudeGeometry(s, { depth: 0.5, bevelEnabled: false }).translate(0, 0, -0.25), IRON, 0, 16.5, 0));
  for (const sx of [-1, 1]) g.add(box(1.1, 9.5, 6.5, CONCRETE, sx * 4.6, 0, 0));
  g.add(box(10.3, 1.1, 6.5, CONCRETE, 0, 9.5, 0), box(10.3, 9.5, 0.6, CONCRETE, 0, 0, -2.95));
  // The low walls of the court round it.
  for (const [w, dd, x, z] of [[26, 0.6, 0, -12], [26, 0.6, 0, 12], [0.6, 24, -13, 0], [0.6, 24, 13, 0]]) g.add(box(w, 1.6, dd, CONCRETE, x, 0, z));
  return g;
}

export const HC = 330;
// The Assembly tower's profile, [radius, height above the roof].
export const TOWER = [[13, 0], [10.2, 7], [9.2, 13], [9.8, 19], [11.6, 25]];

export function buildCapitolComplex() {
  const g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  g.add(box(480, 0.28, 560, CONCRETE_DARK, 0, 0, 130), box(500, 0.15, 580, M.grass, 0, -0.1, 130));
  // The High Court faces the Assembly from the far end of the esplanade, some 330 m off; it stands
  // outside the framed group, so the home view is of the Assembly and the Secretariat.
  f.add(at(secretariat(), -105, 0, -125), at(palaceOfAssembly(), 0, 0, 0));
  g.add(at(highCourt().rotateY(Math.PI), 60, 0, HC));
  g.add(at(openHand().rotateY(0.5), -150, 0, 150));
  addDetails(f, g);
  // The home view: the Assembly's portico across its pool, the Secretariat behind.
  return { group: g, focus: f, view: [0.5, 0.11, 1.1], zoom: 0.3, target: [-4, 15, 14] };
}

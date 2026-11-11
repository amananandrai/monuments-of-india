import * as THREE from 'three';
import { M, mat, mesh, box, cyl, lathe, at, inst, unitBox, unitCyl, doubleSided } from '../helpers.js';
import { addDetails } from '../details/capitol-complex.js';

const CONCRETE = mat('#b3aea4', 0.95);
const CONCRETE_DARK = mat('#8f8a80', 0.95);
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
  // The hyperboloid tower over the assembly chamber, cut off at a slant, with its pyramid skylight
  g.add(at(lathe([[11, 0], [8.4, 6], [7.6, 11], [8.2, 16], [9.6, 20]], CONCRETE, 40), 6, 16, -4));
  g.add(at(mesh(new THREE.ConeGeometry(7, 6, 4).rotateY(Math.PI / 4).translate(0, 3, 0), CONCRETE_DARK), -16, 17, 12));
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
function highCourt() {
  const g = new THREE.Group();
  g.add(box(90, 18, 30, CONCRETE));
  const arches = [];
  for (let x = -42; x <= 42; x += 7) arches.push([x, 18, 0, 1, 6, 32]);
  g.add(inst(unitBox(), arches, CONCRETE), box(100, 2, 36, CONCRETE, 0, 24));
  PYLONS.forEach((m, i) => g.add(box(3, 26, 6, m, -8 + i * 8, 0, 18)));
  g.add(box(100, 0.4, 20, M.water, 0, 0, 34));
  return g;
}
function openHand() {
  const g = new THREE.Group(), s = new THREE.Shape();
  s.moveTo(-3, 0); s.lineTo(3, 0); s.lineTo(5.5, 5); s.lineTo(6.5, 9); s.lineTo(4, 8.5); s.lineTo(3, 12); s.lineTo(1.5, 12.5);
  s.lineTo(0.5, 9); s.lineTo(-0.5, 12.8); s.lineTo(-2, 12.4); s.lineTo(-2.6, 8.6); s.lineTo(-5.5, 9.6); s.lineTo(-6.4, 8.4); s.lineTo(-4.4, 4); s.closePath();
  g.add(cyl(0.6, 0.6, 14, CONCRETE_DARK, 0, 0, 0, 10), mesh(new THREE.ExtrudeGeometry(s, { depth: 0.6, bevelEnabled: false }), mat('#9aa3a8', 0.4, 0.6), 0, 14, 0));
  return g;
}

export const HC = 330;

export function buildCapitolComplex() {
  const g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  g.add(box(480, 0.28, 560, CONCRETE_DARK, 0, 0, 130), box(500, 0.15, 580, M.grass, 0, -0.1, 130));
  // The High Court faces the Assembly from the far end of the esplanade, some 330 m off; it stands
  // outside the framed group, so the home view is of the Assembly and the Secretariat.
  f.add(at(secretariat(), -105, 0, -125), at(palaceOfAssembly(), 0, 0, 0));
  g.add(at(highCourt().rotateY(Math.PI), 60, 0, HC));
  g.add(at(openHand(), -150, 0, 120));
  addDetails(f, g);
  return { group: g, focus: f, view: [0.9, 0.42, 1.1], zoom: 0.72 };
}

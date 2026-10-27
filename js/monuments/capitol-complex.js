import * as THREE from 'three';
import { M, mat, mesh, box, cyl, lathe, at, inst, unitBox, unitCyl } from '../helpers.js';

const CONCRETE = mat('#b3aea4', 0.95);
const CONCRETE_DARK = mat('#8f8a80', 0.95);
const PYLONS = [mat('#3d8a4f', 0.7), mat('#e2b22f', 0.7), mat('#c2402f', 0.7)];

function palaceOfAssembly() {
  const g = new THREE.Group();
  g.add(box(64, 16, 64, CONCRETE), box(64.6, 1, 64.6, CONCRETE_DARK, 0, 16));
  // Portico: pilotis carrying an upturned, gutter-shaped roof
  const s = new THREE.Shape();
  s.moveTo(-30, 0); s.lineTo(30, 0); s.lineTo(34, 7); s.quadraticCurveTo(0, -1, -34, 7); s.closePath();
  const roof = new THREE.ExtrudeGeometry(s, { depth: 12, bevelEnabled: false, curveSegments: 16 });
  roof.translate(0, 0, -6);
  g.add(mesh(roof, CONCRETE, 0, 17, 38));
  const cols = [];
  for (let x = -26; x <= 26; x += 8.6) cols.push([x, 0, 40, 1.2, 17, 1.2]);
  g.add(inst(unitBox(), cols, CONCRETE));
  // The hyperboloid tower over the assembly chamber, cut off at a slant, with its pyramid skylight
  g.add(at(lathe([[11, 0], [8.4, 6], [7.6, 11], [8.2, 16], [9.6, 20]], CONCRETE, 40), 6, 16, -4));
  g.add(at(mesh(new THREE.ConeGeometry(7, 6, 4).rotateY(Math.PI / 4).translate(0, 3, 0), CONCRETE_DARK), -16, 17, 12));
  return g;
}
function secretariat() {
  const g = new THREE.Group(), fins = [];
  g.add(box(254, 42, 18, CONCRETE));
  for (let x = -125; x <= 125; x += 3.2) fins.push([x, 2, 9.2, 0.4, 38, 1.4]);
  for (let y = 4; y < 42; y += 4.6) g.add(box(254.4, 0.5, 19.6, CONCRETE_DARK, 0, y));
  g.add(inst(unitBox(), fins, CONCRETE_DARK));
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

export function buildCapitolComplex() {
  const g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  g.add(box(480, 0.3, 380, CONCRETE_DARK, 0, 0, 40), box(500, 0.15, 400, M.grass, 0, -0.1, 40));
  f.add(at(secretariat(), -60, 0, -90), at(palaceOfAssembly(), 0, 0, 0), at(highCourt().rotateY(Math.PI), 60, 0, 180));
  g.add(at(openHand(), -150, 0, 120));
  return { group: g, focus: f, view: [0.9, 0.42, 1.1] };
}

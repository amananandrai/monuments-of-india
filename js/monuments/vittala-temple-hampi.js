import * as THREE from 'three';
import { mat, mesh, box, cyl, at, rng, pidaRoof, wheel, elephant, inst, unitCyl, surface } from '../helpers.js';

const GRANITE = mat('#a58d6e', 0.9);
const GRANITE_DARK = mat('#7d6a53', 0.9);
const BRICK = surface(mat('#a86b4b', 0.9), 'brick');
const BOULDER = mat('#9c7b5c', 0.95, 0, { flatShading: true });

function pillaredHall(w, d, h, step) {
  const g = new THREE.Group(), cols = [];
  g.add(box(w, 2.6, d, GRANITE_DARK));
  for (let x = -w / 2 + 1.5; x <= w / 2 - 1.4; x += step) for (let z = -d / 2 + 1.5; z <= d / 2 - 1.4; z += step) cols.push([x, 2.6, z, 1.3, h, 1.3]);
  g.add(inst(unitCyl(10), cols, GRANITE));
  g.add(box(w + 1.6, 0.9, d + 1.6, GRANITE_DARK, 0, 2.6 + h), box(w, 0.8, d, GRANITE, 0, 3.5 + h));
  return g;
}

export function buildVittala() {
  const g = new THREE.Group(), f = new THREE.Group(), R = rng(21);
  g.add(f);
  // Hampi's boulder-strewn landscape
  for (let i = 0; i < 16; i++) {
    const a = R() * Math.PI * 2, d = 95 + R() * 60, r = 6 + R() * 12;
    const b = mesh(new THREE.IcosahedronGeometry(r, 1), BOULDER, Math.cos(a) * d, r * 0.55, Math.sin(a) * d);
    b.scale.y = 0.75;
    g.add(b);
  }
  g.add(box(110, 0.25, 160, mat('#b9a17c', 0.95)));
  for (const s of [-1, 1]) f.add(box(104, 4.5, 2.5, GRANITE, 0, 0, s * 76), box(2.5, 4.5, 150, GRANITE, s * 52, 0, 0));
  // Ruined brick gopuram over the east gate
  f.add(box(18, 9, 12, GRANITE, 0, 0, 76), box(15, 4, 10, BRICK, 0, 9, 76), box(12, 3.5, 8, BRICK, -0.6, 13, 76), box(7, 2.4, 6, BRICK, 1.2, 16.5, 76));
  // The shrine and its pillared halls
  f.add(at(pillaredHall(34, 28, 6, 3.2), 0, 0, -6));
  f.add(box(16, 9, 16, GRANITE, 0, 0, -28), at(pidaRoof(15, 6, 4, 0.9, GRANITE, GRANITE_DARK), 0, 9, -28));
  f.add(at(pillaredHall(20, 20, 5, 3.4), -30, 0, 28), at(pillaredHall(18, 18, 5, 3.4), 30, 0, -40));
  // The stone chariot (Garuda shrine) with its wheels, drawn by two elephants
  const ch = new THREE.Group();
  ch.add(box(6, 3.6, 9, GRANITE), box(6.6, 0.6, 9.6, GRANITE_DARK, 0, 3.6));
  for (const x of [-3.3, 3.3]) for (const z of [-2.8, 2.8]) {
    const w = wheel(1.45, GRANITE_DARK);
    w.position.set(x, 1.5, z);
    w.rotation.y = Math.PI / 2;
    ch.add(w);
  }
  ch.add(box(4.6, 4.2, 6, GRANITE, 0, 4.2), at(pidaRoof(5.2, 2.6, 3, 0.6, GRANITE, GRANITE_DARK), 0, 8.4, 0));
  for (const x of [-1.8, 1.8]) ch.add(at(elephant(GRANITE, 0.75), x, 0, 7));
  f.add(at(ch, 0, 0, 30));
  return { group: g, focus: f, view: [0.95, 0.45, 1.1] };
}

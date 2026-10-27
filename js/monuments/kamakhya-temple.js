import * as THREE from 'three';
import { M, mat, mesh, box, cyl, lathe, at, ribbed, kalash, hipRoof, FACES, onFace } from '../helpers.js';

const STONE = mat('#a08766', 0.9);
const STONE_DARK = mat('#7c6a52', 0.9);
const HILL = mat('#5f7d45', 0.95, 0, { flatShading: true });

// The Nilachal-style "beehive" dome over a cross-shaped base.
function beehive(r, m) {
  const g = new THREE.Group();
  g.add(box(r * 2.2, r * 0.9, r * 1.4, m), box(r * 1.4, r * 0.9, r * 2.2, m));
  const d = ribbed(lathe([[1, 0], [1.06, 0.38], [0.97, 0.82], [0.74, 1.18], [0.42, 1.46], [0.12, 1.58], [0, 1.6]].map(([a, b]) => [a * r, b * r]), m, 32), 16, 0.07);
  g.add(at(d, 0, r * 0.9, 0));
  for (const t of [0.3, 0.62, 0.95]) g.add(cyl(r * (1.08 - t * 0.45), r * (1.08 - t * 0.45), r * 0.05, STONE_DARK, 0, r * (0.9 + t * 1.2), 0, 32));
  g.add(at(kalash(r * 0.45), 0, r * 2.5, 0));
  return g;
}
// The Assamese curved two-sloped roof of the halls.
function dochala(w, d, h, m) {
  const s = new THREE.Shape();
  s.moveTo(-w / 2, 0); s.quadraticCurveTo(-w * 0.15, h * 0.55, 0, h); s.quadraticCurveTo(w * 0.15, h * 0.55, w / 2, 0); s.closePath();
  const geo = new THREE.ExtrudeGeometry(s, { depth: d, bevelEnabled: false, curveSegments: 10 });
  geo.translate(0, 0, -d / 2);
  return mesh(geo, m);
}

export function buildKamakhya() {
  const g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  // Nilachal Hill, with the temple on its levelled top
  g.add(mesh(new THREE.CylinderGeometry(60, 150, 40, 18, 3), HILL, 0, 19.5, 0));
  const T = 40;
  f.add(box(70, 1, 80, M.path, 0, T - 0.5, 0));
  f.add(box(22, 2.5, 22, STONE_DARK, 0, T, -14), at(beehive(9, STONE), 0, T + 2.5, -14));
  for (const a of FACES) {
    const s = onFace(at(beehive(3, STONE), 0, T + 2.5, 0), a, 11.5);
    s.position.z += -14;
    f.add(s);
  }
  // Calantapa (antechamber) and the Natmandir hall with curved roofs
  f.add(box(12, 7, 10, STONE, 0, T, 2), at(dochala(14, 11, 6, STONE), 0, T + 7, 2));
  f.add(box(16, 6, 20, STONE, 0, T, 18), at(dochala(18, 21, 7, STONE_DARK), 0, T + 6, 18));
  f.add(box(14, 5, 12, mat('#d9d1c2', 0.9), 0, T, 34), at(hipRoof(15, 13, 4, mat('#a3463a', 0.8)), 0, T + 5, 34));
  // Shrines of the Mahavidyas round the hilltop
  for (let k = 0; k < 7; k++) {
    const a = Math.PI * 0.15 + (k / 6) * Math.PI * 1.7, x = Math.cos(a) * 30, z = Math.sin(a) * 33;
    f.add(at(beehive(2.6, STONE), x, T, z));
  }
  return { group: g, focus: f, view: [0.85, 0.45, 1.15] };
}

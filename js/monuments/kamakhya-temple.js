import * as THREE from 'three';
import { M, mat, mesh, box, cyl, lathe, at, ribbed, kalash, hipRoof, FACES, onFace, sheet } from '../helpers.js';
import { heightField, fbm, smooth } from '../details/terrain.js';
import { detail } from '../detail.js';
import { templeDoorway } from '../details/doorways.js';
import { mergeByMaterial } from '../details/components.js';
import { addDetails } from '../details/kamakhya-temple.js';

const STONE = mat('#a08766', 0.9);
const STONE_DARK = mat('#7c6a52', 0.9);

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

// Nilachal's height at (x, z): level at 40 m over the temple's court (about 56 m round), falling in
// forested slopes to the plain about 160 m out, the outline wandering and the slopes rough; the foot
// sinks under the plain. Read by the trees in js/details/kamakhya-temple.js.
export function nilachal(x, z) {
  const T = 40, r = Math.hypot(x, z) + 14 * fbm(x, z, { scale: 0.008, octaves: 2 }) * smooth(56, 80, Math.hypot(x, z)), u = Math.min(1, Math.max(0, (r - 56) / 110));
  let y = T * (1 - u * u * (3 - 2 * u));
  y += smooth(0.5, 5, y) * (1 - smooth(T - 4, T - 0.4, y)) * 3 * fbm(x, z, { scale: 0.03, octaves: 3 });
  return y - 0.4 * (1 - smooth(0, 3, y));
}

export function buildKamakhya() {
  const g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  // Nilachal Hill, with the temple on its levelled top; the Brahmaputra below it to the north.
  g.add(heightField(380, 380, detail.low ? 110 : 160, nilachal, { rock: ['#6f6655', '#7c725f'], cover: '#4f6e3a', steep: 0.8, band: 9 }));
  // The river starts beyond the hill's foot, with a sand bank along it.
  g.add(box(3000, 0.12, 60, mat('#c2b08a', 0.95), 0, 0, -220), sheet(3000, 900, M.river, 0, 0.3, -700));
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
  const HALL = mat('#d9d1c2', 0.9);
  f.add(box(14, 5, 12, HALL, 0, T, 34), at(hipRoof(15, 13, 4, mat('#a3463a', 0.8)), 0, T + 5, 34));
  // The doorway at the front, and doors on either side of the Natmandir
  const doors = new THREE.Group();
  doors.add(at(templeDoorway(1.5, 2.8, { m: HALL, guardians: false }), 0, T, 40));
  for (const s of [-1, 1]) doors.add(at(templeDoorway(1.6, 3.2, { m: STONE, guardians: false }), s * 8, T, 18).rotateY(s * Math.PI / 2));
  f.add(mergeByMaterial(doors));
  // Shrines of the Mahavidyas round the hilltop
  for (let k = 0; k < 7; k++) {
    const a = Math.PI * 0.15 + (k / 6) * Math.PI * 1.7, x = Math.cos(a) * 30, z = Math.sin(a) * 33;
    f.add(at(beehive(2.6, STONE), x, T, z));
  }
  addDetails(f, g);
  return { group: g, focus: f, view: [0.85, 0.45, 1.15] };
}

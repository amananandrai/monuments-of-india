import * as THREE from 'three';
import { M, mat, box, at, rng, inst, unitBox, aroundRect } from '../helpers.js';

const BRICK = mat('#a5553b', 0.95);
const BRICK_DARK = mat('#844230', 0.95);

// A ruined monastery: a square of monks' cells round a courtyard, walls broken to uneven heights.
function vihara(size, R) {
  const g = new THREE.Group(), cells = [];
  aroundRect(size, size, 3.4).forEach(([x, z, ry]) => cells.push([x, 1.2, z, 3.6, 2 + R() * 3.5, 3.6, ry]));
  aroundRect(size - 8, size - 8, 3.4).forEach(([x, z, ry]) => cells.push([x, 1.2, z, 3.6, 0.6 + R() * 1.6, 0.9, ry]));
  g.add(box(size + 4, 1.2, size + 4, BRICK_DARK), inst(unitBox(), cells, BRICK), box(size - 10, 1.3, size - 10, M.grass, 0, 0, 0));
  g.add(box(4, 3, 4, BRICK, 0, 1.2, -size / 2 + 8));
  return g;
}

export function buildNalanda() {
  const g = new THREE.Group(), f = new THREE.Group(), R = rng(23);
  g.add(f);
  g.add(box(260, 0.15, 200, M.grass), box(8, 0.2, 200, M.path, -40, 0, 0));
  // The row of monasteries along the east side
  for (let i = 0; i < 4; i++) f.add(at(vihara(34, R), -78, 0, -66 + i * 44));
  // Temple 3, the Sariputta Stupa: stepped brick terraces, a great stair and corner towers
  const t = new THREE.Group();
  let y = 0, w = 40;
  for (let i = 0; i < 5; i++) {
    t.add(box(w, 5, w, i % 2 ? BRICK_DARK : BRICK, 0, y));
    y += 5;
    w -= 6;
  }
  for (const x of [-1, 1]) for (const z of [-1, 1]) t.add(box(7, 9 + R() * 4, 7, BRICK, x * 17, 0, z * 17));
  for (let k = 0; k < 12; k++) t.add(box(10, (k + 1) * 2, 2.2, BRICK, 0, 0, 20 + 26 - k * 2.2));
  t.add(box(8, 3.4, 8, BRICK, -1, y, 0), box(4, 2, 5, BRICK_DARK, 1.5, y + 3.4, 1));
  f.add(at(t, 20, 0, 10));
  // Votive stupas round the temple
  for (let i = 0; i < 10; i++) f.add(box(3.4, 1.5 + R() * 3, 3.4, BRICK, 20 + (R() - 0.5) * 70, 0, -30 + R() * 16));
  return { group: g, focus: f, view: [0.85, 0.5, 1.15] };
}

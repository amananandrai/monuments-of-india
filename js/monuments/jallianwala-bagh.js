import * as THREE from 'three';
import { M, mat, mesh, box, cyl, at, rng, ring, inst, unitBox, surface } from '../helpers.js';
import { townHouses } from '../details/realism.js';
import { addDetails } from '../details/jallianwala-bagh.js';

const RED = mat('#a5473a', 0.85);
const BRICK = surface(mat('#8c5a45', 0.95), 'brick');

// The flame-shaped memorial, h metres tall. The outline was drawn for a 30 m shaft; k keeps that
// silhouette when h is the real 30 ft (about 9.1 m).
function flame(h, m) {
  const k = h / 30, s = new THREE.Shape();
  s.moveTo(-4 * k, 0);
  s.bezierCurveTo(-5.5 * k, h * 0.35, -1.5 * k, h * 0.55, -2.4 * k, h * 0.8);
  s.bezierCurveTo(-2.8 * k, h * 0.9, -0.4 * k, h * 0.95, 0, h);
  s.bezierCurveTo(1.4 * k, h * 0.86, 3.2 * k, h * 0.7, 2.6 * k, h * 0.5);
  s.bezierCurveTo(2.2 * k, h * 0.32, 5.2 * k, h * 0.2, 4 * k, 0);
  s.closePath();
  const geo = new THREE.ExtrudeGeometry(s, { depth: 3 * k, bevelEnabled: true, bevelSize: 0.6 * k, bevelThickness: 0.6 * k, curveSegments: 16 });
  geo.translate(0, 0, -1.5 * k);
  const g = new THREE.Group();
  g.add(mesh(geo, m), mesh(geo.clone(), m).rotateY(Math.PI / 2));
  return g;
}

export function buildJallianwala() {
  const g = new THREE.Group(), f = new THREE.Group(), R = rng(107);
  g.add(f);
  g.add(box(260, 0.2, 260, M.path));
  // The walled garden is about 6.5 acres (180 × 150 m), a rectangle closed by houses, with one
  // narrow lane in from the south.
  const W = 180, D = 150, lane = 3.2;
  f.add(box(W, 6, 2, BRICK, 0, 0, -D / 2), box(2, 6, D, BRICK, -W / 2, 0, 0), box(2, 6, D, BRICK, W / 2, 0, 0));
  const sw = (W - lane) / 2;
  f.add(box(sw, 6, 2, BRICK, -(lane + sw) / 2, 0, D / 2), box(sw, 6, 2, BRICK, (lane + sw) / 2, 0, D / 2));
  f.add(box(1.1, 5, 22, BRICK, -lane / 2, 0, D / 2 + 11), box(1.1, 5, 22, BRICK, lane / 2, 0, D / 2 + 11));
  f.add(box(lane - 0.3, 0.15, 24, M.path, 0, 0, D / 2 + 10));
  const houses = [], row = (n, x0, z0, x1, z1, ry) => {
    for (let i = 0; i < n; i++) {
      const t = (i + 0.5) / n;
      houses.push([x0 + (x1 - x0) * t, z0 + (z1 - z0) * t, 9 + R() * 5, 8 + R() * 4, 2 + Math.floor(R() * 3), ry]);
    }
  };
  row(16, -W / 2 + 6, -D / 2 - 12, W / 2 - 6, -D / 2 - 12, 0);
  row(16, -W / 2 + 6, D / 2 + 28, W / 2 - 6, D / 2 + 28, Math.PI);
  row(12, -W / 2 - 12, -D / 2 + 8, -W / 2 - 12, D / 2 - 8, Math.PI / 2);
  row(12, W / 2 + 12, -D / 2 + 8, W / 2 + 12, D / 2 - 8, -Math.PI / 2);
  // The old houses of Amritsar that close the garden in, their backs to it.
  g.add(townHouses(houses, { seed: 31, paint: ['#b8a58a', '#c9a77e', '#a98f72', '#d2b48c', '#e0cfb0'] }));
  f.add(box(W - 10, 0.2, D - 10, M.grass));
  // The memorial is 30 ft (9.1 m): a low red base and the flame on it. Reflecting pool, the
  // Martyrs' Well, and a bullet-marked wall.
  f.add(box(14, 0.5, 14, mat('#d9cbb2', 0.85), 0, 0.15, -6), box(11, 0.45, 11, M.water, 0, 0.2, -6), box(4.2, 1.3, 4.2, RED, 0, 0.4, -6), at(flame(7.8, RED), 0, 1.7, -6));
  const well = ring(3.6, 1.6, mat('#d9cbb2', 0.85), 0, 20);
  well.position.x = -36;
  well.position.z = 20;
  f.add(cyl(3.2, 3.2, 0.4, M.recess, -36, 0, 20, 20), well);
  f.add(box(16, 4, 1.2, BRICK, 40, 0, 26));
  addDetails(f, g);
  return { group: g, focus: f, view: [0.6, 0.32, 1.2] };
}

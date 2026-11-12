import * as THREE from 'three';
import { M, mat, mesh, box, cyl, at, rng, ring, inst, unitBox, surface } from '../helpers.js';
import { townHouses } from '../details/realism.js';
import { addDetails } from '../details/jallianwala-bagh.js';

const RED = mat('#a5473a', 0.85);
const BRICK = surface(mat('#8c5a45', 0.95), 'brick');

// The flame-shaped memorial: a tapering shaft whose outline flickers like a flame. The outline was
// drawn for a 30 m shaft; its width scales with the height so a shorter flame keeps its shape.
function flame(h, m) {
  const s = new THREE.Shape(), k = h / 30;
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
  g.add(box(340, 0.2, 280, M.path));
  // The walled garden, closed in by houses, with the single narrow lane in. The Bagh is about
  // 6.5 to 7 acres (2.6 to 2.8 ha), a roughly rectangular plot: 200 × 135 m is 2.7 ha.
  const W = 200, D = 135;
  for (const s of [-1, 1]) f.add(box(W, 6, 2, BRICK, 0, 0, s * D / 2), box(2, 6, D, BRICK, s * W / 2, 0, 0));
  // Houses in rows along the four walls, backs to the garden, leaving the gap for the lane.
  const houses = [], off = 12, pitch = 15;
  const row = (n, x0, z0, x1, z1, ry) => {
    for (let i = 0; i < n; i++) {
      const t = (i + 0.5) / n, x = x0 + (x1 - x0) * t, z = z0 + (z1 - z0) * t;
      if (z0 === z1 && z0 > 0 && Math.abs(x) < 10) continue;
      houses.push([x, z, 10 + R() * 4, 10 + R() * 6, 2 + Math.floor(R() * 3), ry]);
    }
  };
  const nx = Math.round((W + 2 * off) / pitch), nz = Math.round(D / pitch);
  row(nx, -W / 2 - off, D / 2 + off, W / 2 + off, D / 2 + off, Math.PI);
  row(nx, -W / 2 - off, -D / 2 - off, W / 2 + off, -D / 2 - off, 0);
  row(nz, W / 2 + off, -D / 2, W / 2 + off, D / 2, -Math.PI / 2);
  row(nz, -W / 2 - off, -D / 2, -W / 2 - off, D / 2, Math.PI / 2);
  // The old houses of Amritsar that close the garden in, their backs to it.
  g.add(townHouses(houses, { seed: 31, paint: ['#b8a58a', '#c9a77e', '#a98f72', '#d2b48c', '#e0cfb0'] }));
  f.add(box(W - 10, 0.2, D - 10, M.grass), box(5, 0.3, 30, M.path, 0, 0, D / 2 + 7));
  // The memorial on the lawn (its top at y = 0.2), the Martyrs' Well, and a bullet-marked wall
  f.add(box(10, 1.6, 10, RED, 0, 0.2, -6), at(flame(9.1, RED), 0, 1.8, -6));
  // Four stone lanterns flank the pylon, on the lawn a few metres out from its corners.
  for (const [x, z] of [[-10, -16], [10, -16], [-10, 4], [10, 4]]) f.add(box(1.4, 2.6, 1.4, mat('#d9cbb2', 0.85), x, 0, z), box(1.8, 0.4, 1.8, mat('#d9cbb2', 0.85), x, 2.6, z));
  const well = ring(3.6, 1.6, mat('#d9cbb2', 0.85), 0, 20);
  well.position.x = -36;
  well.position.z = 20;
  f.add(cyl(3.2, 3.2, 0.4, M.recess, -36, 0, 20, 20), well);
  f.add(box(16, 4, 1.2, BRICK, 40, 0, 26));
  addDetails(f, g);
  // The home view matches the best-known photograph: the garden and its memorial within the houses.
  return { group: g, focus: f, view: [0.5, 0.3, 1], zoom: 0.55 };
}

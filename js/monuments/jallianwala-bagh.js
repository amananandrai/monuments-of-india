import * as THREE from 'three';
import { M, mat, mesh, box, cyl, at, rng, ring, inst, unitBox } from '../helpers.js';

const RED = mat('#a5473a', 0.85);
const BRICK = mat('#8c5a45', 0.95);

// The flame-shaped memorial: a tapering shaft whose outline flickers like a flame.
function flame(h, m) {
  const s = new THREE.Shape();
  s.moveTo(-4, 0);
  s.bezierCurveTo(-5.5, h * 0.35, -1.5, h * 0.55, -2.4, h * 0.8);
  s.bezierCurveTo(-2.8, h * 0.9, -0.4, h * 0.95, 0, h);
  s.bezierCurveTo(1.4, h * 0.86, 3.2, h * 0.7, 2.6, h * 0.5);
  s.bezierCurveTo(2.2, h * 0.32, 5.2, h * 0.2, 4, 0);
  s.closePath();
  const geo = new THREE.ExtrudeGeometry(s, { depth: 3, bevelEnabled: true, bevelSize: 0.6, bevelThickness: 0.6, curveSegments: 16 });
  geo.translate(0, 0, -1.5);
  const g = new THREE.Group();
  g.add(mesh(geo, m), mesh(geo.clone(), m).rotateY(Math.PI / 2));
  return g;
}

export function buildJallianwala() {
  const g = new THREE.Group(), f = new THREE.Group(), R = rng(107);
  g.add(f);
  g.add(box(260, 0.2, 260, M.path));
  // The walled garden, closed in by houses, with the single narrow lane in
  const W = 120, D = 90;
  for (const s of [-1, 1]) f.add(box(W, 6, 2, BRICK, 0, 0, s * D / 2), box(2, 6, D, BRICK, s * W / 2, 0, 0));
  const houses = [];
  for (let i = 0; i < 40; i++) {
    const a = (i / 40) * Math.PI * 2, x = Math.cos(a) * (W / 2 + 12), z = Math.sin(a) * (D / 2 + 12);
    houses.push([x, 0, z, 10 + R() * 6, 8 + R() * 8, 10 + R() * 6]);
  }
  g.add(inst(unitBox(), houses, mat('#b8a58a', 0.9)));
  f.add(box(110, 0.2, 80, M.grass), box(5, 0.3, 30, M.path, 0, 0, 52));
  // The memorial with its reflecting pool, the Martyrs' Well, and a bullet-marked wall
  f.add(box(28, 0.6, 28, mat('#d9cbb2', 0.85), 0, 0.2, -6), box(24, 0.7, 24, M.water, 0, 0.2, -6), box(10, 1.6, 10, RED, 0, 0.8, -6), at(flame(30, RED), 0, 2.4, -6));
  const well = ring(3.6, 1.6, mat('#d9cbb2', 0.85), 0, 20);
  well.position.x = -36;
  well.position.z = 20;
  f.add(cyl(3.2, 3.2, 0.4, M.recess, -36, 0, 20, 20), well);
  f.add(box(16, 4, 1.2, BRICK, 40, 0, 26));
  return { group: g, focus: f, view: [0.6, 0.32, 1.2] };
}

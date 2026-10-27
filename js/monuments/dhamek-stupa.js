import * as THREE from 'three';
import { M, mat, mesh, box, cyl, at, rng, inst, unitBox, onFace, surface } from '../helpers.js';

const STONE = mat('#b8a88e', 0.9);
const BRICK = surface(mat('#9c6a4f', 0.95), 'brick');
const RUIN = mat('#a5553b', 0.95);

export function buildDhamek() {
  const g = new THREE.Group(), f = new THREE.Group(), R = rng(53);
  g.add(f);
  g.add(box(220, 0.15, 200, M.grass));
  // Brick foundations of the monasteries round the deer park
  const walls = [];
  for (let i = 0; i < 6; i++) {
    const cx = -70 + (i % 3) * 40, cz = 40 + Math.floor(i / 3) * 34, s = 22;
    for (const [x, z, w, d] of [[0, -s / 2, s, 1.6], [0, s / 2, s, 1.6], [-s / 2, 0, 1.6, s], [s / 2, 0, 1.6, s]]) walls.push([cx + x, 0, cz + z, w, 0.8 + R() * 1.6, d]);
  }
  g.add(inst(unitBox(), walls, RUIN));
  // The stupa: a carved stone drum with eight projecting faces, and the brick cylinder above it
  f.add(cyl(15, 15.5, 1.2, STONE, 0, 0, 0, 48), cyl(14, 14, 11, STONE, 0, 1.2, 0, 48));
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * Math.PI * 2;
    f.add(onFace(box(5, 9, 1.4, STONE, 0, 2), a, 14), onFace(box(2.4, 2.6, 0.3, M.recess, 0, 6), a, 14.75));
  }
  for (const y of [4, 8.6]) f.add(cyl(14.4, 14.4, 1.1, mat('#a39376', 0.85), 0, y, 0, 48));
  const top = mesh(new THREE.CylinderGeometry(12.2, 13.4, 31, 40, 6), BRICK, 0, 12.2 + 15.5, 0);
  const p = top.geometry.attributes.position;
  for (let i = 0; i < p.count; i++) if (p.getY(i) > 15) p.setY(i, 15 + Math.sin(p.getX(i) * 0.6) * 1.2 + Math.cos(p.getZ(i) * 0.5));
  top.geometry.computeVertexNormals();
  f.add(top);
  return { group: g, focus: f, view: [0.8, 0.3, 1.2] };
}

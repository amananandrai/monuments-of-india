import * as THREE from 'three';
import { M, mat, mesh, box, cyl, at, inst, unitBox } from '../helpers.js';

const LATERITE = mat('#9b5b3f', 0.95);
const LATERITE_DARK = mat('#7d4530', 0.95);
const WHITE = mat('#eeeae2', 0.8);

export function buildFortAguada() {
  const g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  // The headland at the mouth of the Mandovi, with the Arabian Sea beyond
  g.add(box(1200, 0.4, 1200, M.water, 0, -0.1, 0));
  const head = mesh(new THREE.CylinderGeometry(110, 150, 24, 14).translate(0, 12, 0), mat('#6c7d48', 0.95, 0, { flatShading: true }));
  head.scale.z = 0.7;
  g.add(head, box(120, 0.4, 30, mat('#dcc9a3', 0.95), 60, 0, 120));
  const H = 24;
  // Low, thick laterite walls with angled bastions
  const pts = [[-50, -34], [40, -40], [60, -4], [44, 34], [-30, 40], [-60, 6]], wall = [];
  pts.forEach(([x0, z0], i) => {
    const [x1, z1] = pts[(i + 1) % pts.length], len = Math.hypot(x1 - x0, z1 - z0);
    wall.push([(x0 + x1) / 2, H, (z0 + z1) / 2, len, 7, 5, Math.atan2(-(z1 - z0), x1 - x0)]);
    f.add(box(10, 8, 10, LATERITE_DARK, x0, H, z0).rotateY(Math.PI / 4));
  });
  f.add(inst(unitBox(), wall, LATERITE));
  f.add(box(40, 0.6, 30, LATERITE_DARK, -4, H, 0), box(26, 3, 18, LATERITE, -4, H, 0));
  // The four-storey lighthouse of 1864
  f.add(cyl(3.2, 4, 14, WHITE, 18, H, 10, 20), cyl(4.6, 4.6, 0.6, LATERITE_DARK, 18, H + 14, 10, 20), cyl(2.4, 2.4, 3, mat('#9fc6d8', 0.2, 0.2), 18, H + 14.6, 10, 16), cyl(0, 2.8, 2, mat('#c3463a', 0.7), 18, H + 17.6, 10, 16));
  return { group: g, focus: f, view: [0.6, 0.35, 1.2] };
}

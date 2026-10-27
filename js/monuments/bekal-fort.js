import * as THREE from 'three';
import { M, mat, mesh, box, cyl, at, inst, unitBox } from '../helpers.js';

const LATERITE = mat('#8f4e36', 0.95);
const LATERITE_DARK = mat('#6e3a27', 0.95);

// A keyhole-shaped fort on a headland, with the sea on three sides.
export function buildBekal() {
  const g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  g.add(box(1200, 0.4, 1200, M.water, 0, -0.1, 0), box(400, 0.4, 60, mat('#e2cfa5', 0.95), 0, 0, 120), box(400, 0.3, 200, mat('#5b7d43', 0.95), 0, 0, 250));
  const head = mesh(new THREE.CylinderGeometry(80, 100, 8, 20).translate(0, 4, 0), mat('#5b7d43', 0.95, 0, { flatShading: true }));
  g.add(head, box(80, 8, 80, mat('#5b7d43', 0.95), 0, 0, 90));
  // Outline: a great circle on the sea side and a tapering neck towards the land
  const H = 8, wall = [], R = 70;
  for (let k = 0; k < 64; k++) {
    const a = (k / 64) * Math.PI * 2;
    if (Math.sin(a) < -0.72) continue;
    wall.push([Math.cos(a) * R, H, -Math.sin(a) * R, 7.4, 7, 3, a + Math.PI / 2]);
  }
  for (const s of [-1, 1]) {
    const x0 = s * R * 0.69, z0 = R * 0.72, x1 = s * 16, z1 = 120, len = Math.hypot(x1 - x0, z1 - z0);
    wall.push([(x0 + x1) / 2, H, (z0 + z1) / 2, len, 7, 3, Math.atan2(-(z1 - z0), x1 - x0)]);
  }
  f.add(inst(unitBox(), wall, LATERITE));
  for (let k = 0; k < 8; k++) {
    const a = (k / 7) * Math.PI;
    f.add(cyl(4, 4.6, 9, LATERITE, Math.cos(a) * R, H, -Math.sin(a) * R, 14));
  }
  // Zigzag entrance at the neck, and the tall round observation tower in the middle
  f.add(box(14, 9, 8, LATERITE_DARK, -6, H, 120), box(14, 9, 8, LATERITE_DARK, 6, H, 128));
  f.add(cyl(7, 8, 18, LATERITE, 0, H, 0, 20), cyl(8, 8, 1, LATERITE_DARK, 0, H + 18, 0, 20), box(10, 1.2, 1.2, LATERITE_DARK, 0, H + 6, 9));
  return { group: g, focus: f, view: [0.5, 0.5, 1.15] };
}

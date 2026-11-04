import * as THREE from 'three';
import { M, mat, mesh, box, cyl, at, inst, unitBox, sheet, ellipseWall } from '../helpers.js';
import { fortGate } from '../details/forts.js';
import { addDetails } from '../details/bekal-fort.js';

const LATERITE = mat('#8f4e36', 0.95);
const LATERITE_DARK = mat('#6e3a27', 0.95);

// A keyhole-shaped fort on a headland, with the sea on three sides.
export function buildBekal() {
  const g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  g.add(sheet(1200, 1200, M.sea, 0, 0.2, 0), box(400, 0.4, 60, mat('#e2cfa5', 0.95), 0, 0, 120), box(400, 0.3, 200, mat('#5b7d43', 0.95), 0, 0, 250));
  const head = mesh(new THREE.CylinderGeometry(80, 100, 8, 20).translate(0, 4, 0), mat('#5b7d43', 0.95, 0, { flatShading: true }));
  g.add(head, box(80, 8, 80, mat('#5b7d43', 0.95), 0, 0, 90));
  // Outline: a great circle on the sea side and a tapering neck towards the land
  const H = 8, wall = [], R = 70;
  f.add(ellipseWall(R, -R, 5.445, 10.26, 3, H, H + 7, LATERITE));
  for (const s of [-1, 1]) {
    const x0 = s * R * 0.69, z0 = R * 0.72, x1 = s * 16, z1 = 120, len = Math.hypot(x1 - x0, z1 - z0);
    // 3 cm lower than the round wall they meet, so the two tops never share a plane
    wall.push([(x0 + x1) / 2, H, (z0 + z1) / 2, len, 6.97, 3, Math.atan2(-(z1 - z0), x1 - x0)]);
  }
  f.add(inst(unitBox(), wall, LATERITE));
  for (let k = 0; k < 8; k++) {
    const a = (k / 7) * Math.PI;
    f.add(cyl(4, 4.6, 9, LATERITE, Math.cos(a) * R, H, -Math.sin(a) * R, 14));
  }
  // The gate at the neck, walls joining it to the neck's sides, and inside it a baffle wall that
  // turns the way in into a zigzag; then the tall round observation tower in the middle
  f.add(at(fortGate(14, 10, 8, 4, 7, { m: LATERITE, trim: LATERITE_DARK, towers: { r: 3, h: 11, cap: 'merlons', seg: 14 } }), 0, H, 122));
  for (const s of [-1, 1]) f.add(box(9.5, 6.9, 3, LATERITE, s * 11.5, H, 120));
  f.add(box(16, 7, 3, LATERITE_DARK, -4, H, 106));
  f.add(cyl(7, 8, 18, LATERITE, 0, H, 0, 20), cyl(8, 8, 1, LATERITE_DARK, 0, H + 18, 0, 20), box(10, 1.2, 1.2, LATERITE_DARK, 0, H + 6, 9));
  addDetails(f, g);
  return { group: g, focus: f, view: [0.5, 0.5, 1.15] };
}

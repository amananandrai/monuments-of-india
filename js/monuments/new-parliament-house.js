import * as THREE from 'three';
import { M, mesh, box, cyl, group, at, onFace, FACES, archPanel, inst, unitBox } from '../helpers.js';

export function buildNewParliament() {
  const Rd = M.red, Bf = M.buff, g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  g.add(cyl(130, 130, 0.15, M.grass, 0, 0, 0, 64));
  // Triangular plan with chamfered corners; built from world (x, z) points
  const R = 74, c = 20, V3 = [0, 1, 2].map((i) => { const a = Math.PI / 2 + (i * 2 * Math.PI) / 3; return [Math.cos(a) * R, Math.sin(a) * R]; });
  const poly = [];
  V3.forEach((v, i) => {
    const p = V3[(i + 2) % 3], n = V3[(i + 1) % 3];
    const to = (q) => { const dx = q[0] - v[0], dz = q[1] - v[1], l = Math.hypot(dx, dz); return [v[0] + (dx / l) * c, v[1] + (dz / l) * c]; };
    poly.push(to(p), to(n));
  });
  const prism = (scale, h, m, y) => {
    const sh = new THREE.Shape();
    poly.forEach(([x, z], i) => (i ? sh.lineTo(x * scale, -z * scale) : sh.moveTo(x * scale, -z * scale)));
    sh.closePath();
    const geo = new THREE.ExtrudeGeometry(sh, { depth: h, bevelEnabled: false });
    geo.rotateX(-Math.PI / 2);
    return mesh(geo, m, 0, y, 0);
  };
  f.add(prism(1.04, 1.5, Rd, 0), prism(1, 6, Rd, 1.5), prism(0.98, 15, Bf, 7.5), prism(1.0, 1.2, Rd, 22.5), prism(0.95, 0.3, M.cream, 23.7));
  // Vertical stone fins around the upper storeys
  const fins = [];
  poly.forEach(([x0, z0], i) => {
    const [x1, z1] = poly[(i + 1) % poly.length], len = Math.hypot(x1 - x0, z1 - z0), n = Math.floor(len / 2.6);
    const nx = (z1 - z0) / len, nz = -(x1 - x0) / len, ry = Math.atan2(x1 - x0, z1 - z0) + Math.PI / 2;
    for (let k = 1; k < n; k++) {
      const t = k / n;
      fins.push([x0 + (x1 - x0) * t + nx * 0.5, 7.5, z0 + (z1 - z0) * t + nz * 0.5, 1.2, 15, 0.8, ry]);
    }
  });
  f.add(inst(unitBox(), fins, Bf));
  // Ceremonial entrances at the three corners
  V3.forEach(([x, z]) => {
    const a = Math.atan2(x, z), d = Math.hypot(x, z) - c * 0.866 + 3;
    f.add(onFace(group(box(18, 18, 6, Bf, 0, 1.5), box(19, 1.2, 7, Rd, 0, 19.5), at(archPanel(8, 13, false, M.recess, 0.3), 0, 1.5, 3)), a, d));
  });
  // Constitution Hall at the centre, crowned by the bronze National Emblem
  const hall = cyl(20, 20, 5, Bf, 0, 23.7, 0, 3);
  hall.rotation.y = Math.PI / 6;
  f.add(hall, box(4, 2, 4, Bf, 0, 28.7, 0), cyl(2.4, 3, 1.4, M.bronze, 0, 30.7, 0, 16), cyl(2.7, 2.7, 0.9, M.bronze, 0, 32.1, 0, 16));
  for (const a of FACES) f.add(onFace(group(box(1.4, 2.4, 2.4, M.bronze, 0, 33), at(mesh(new THREE.SphereGeometry(0.9, 12, 10), M.bronze), 0, 35.6, 0.3)), a, 1.1));
  return { group: g, focus: f, view: [0.85, 0.4, 1.2] };
}

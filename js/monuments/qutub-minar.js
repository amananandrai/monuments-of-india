import * as THREE from 'three';
import { M, mesh, box, cyl, ring, group, at, chhatri } from '../helpers.js';

export function buildQutub() {
  const g = new THREE.Group();
  g.add(box(26, 1.2, 26, M.redLight));
  const tiers = [[7.15, 5.7, 29, M.red, 0], [5.7, 4.6, 15, M.red, 1], [4.6, 3.6, 11.5, M.red, 2], [3.6, 2.95, 8, M.marble, 3], [2.95, 2.4, 8.5, M.marble, 4]];
  let y = 1.2;
  for (const [rb, rt, h, m, i] of tiers) {
    const geo = new THREE.CylinderGeometry(rt, rb, h, 144, 6);
    const pos = geo.attributes.position;
    for (let k = 0; k < pos.count; k++) {
      const x = pos.getX(k), z = pos.getZ(k);
      if (Math.hypot(x, z) < 0.01) continue;
      const a = Math.atan2(z, x);
      let f;
      if (i === 0) f = 1 + 0.07 * Math.abs(Math.cos(a * 12));           // alternating round and angular flutes
      else if (i === 1) f = 1 + 0.06 * Math.abs(Math.cos(a * 12));
      else if (i === 2) { const t = ((a / Math.PI) * 12) % 2; f = 1 + 0.08 * (1 - Math.abs((t < 0 ? t + 2 : t) - 1)); } // star flutes
      else f = 1 + 0.025 * Math.abs(Math.cos(a * 16));
      pos.setX(k, x * f); pos.setZ(k, z * f);
    }
    geo.computeVertexNormals();
    g.add(mesh(geo, m, 0, y + h / 2, 0));
    if (i < 3) for (const t of [0.28, 0.62]) g.add(cyl(rb - (rb - rt) * t + 0.35, rb - (rb - rt) * t + 0.35, 0.7, M.redLight, 0, y + h * t, 0, 48));
    if (i === 3) g.add(cyl(rt * 1.07, rb * 1.07, 1.2, M.red, 0, y + h * 0.45, 0, 48));
    y += h;
    if (i < 4) {
      g.add(cyl(rt + 1.4, rt + 0.3, 1.1, i < 3 ? M.redLight : M.marble, 0, y - 1.1, 0, 48));
      g.add(ring(rt + 1.4, 0.8, i < 3 ? M.red : M.marbleShade, y, 48));
    }
  }
  g.add(at(chhatri(2.1, 5, M.red, M.marble), 0, y, 0));
  return { group: g };
}

import * as THREE from 'three';
import { M, mesh, box, cyl, ring, group, at, chhatri } from '../helpers.js';
import { addDetails } from '../details/qutub-minar.js';

// Storey radii at base and top, and heights (m). Base slab 1.2 m + 71.3 m of shaft = 72.5 m.
export const TIERS = (() => {
  const hs = [28.7, 14.9, 11.4, 7.9, 8.4], total = hs.reduce((a, b) => a + b, 0), R0 = 7.16, R1 = 1.375;
  let acc = 0;
  return hs.map((h) => { const rb = R0 - (R0 - R1) * acc / total; acc += h; return [rb, R0 - (R0 - R1) * acc / total, h]; });
})();

export function buildQutub() {
  const g = new THREE.Group();
  g.add(box(26, 1.2, 26, M.redLight));
  // 72.5 m from the ground, tapering evenly from 14.32 m across at the base to 2.75 m at the top.
  const tiers = TIERS.map(([rb, rt, h], i) => [rb, rt, h, i < 3 ? M.red : M.marble, i]);
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
  // The top today is a plain parapet. Major Smith's cupola of 1828 was taken down in 1848 and set
  // on the lawn to the south-east, where it stands as "Smith's Folly".
  g.add(cyl(TIERS[4][1] + 0.35, TIERS[4][1] + 0.35, 0.5, M.marbleShade, 0, y, 0, 32), ring(TIERS[4][1] + 0.3, 0.9, M.marble, y + 0.5, 32));
  g.add(at(chhatri(2.1, 5, M.red, M.marble), 34, 0.9, 30), box(6, 0.9, 6, M.redLight, 34, 0, 30));
  // The minar is what the camera frames; the court, the ruins and the lawns are its setting.
  const f = new THREE.Group();
  f.add(...g.children);
  g.add(f);
  addDetails(f, g);
  return { group: g, focus: f, view: [0.9, 0.3, 1.25] };
}

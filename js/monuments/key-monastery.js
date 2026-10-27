import * as THREE from 'three';
import { M, mat, mesh, box, cyl, at, rng, hipRoof, TIBETAN, inst, unitBox } from '../helpers.js';

const SCREE = mat('#9d8b78', 0.95, 0, { flatShading: true });
const PEAK = mat('#86796d', 0.95, 0, { flatShading: true });
const SNOW = mat('#f4f6f8', 0.8, 0, { flatShading: true });

// A cluster of whitewashed buildings stacked round a conical hill in the Spiti valley.
export function buildKeyMonastery() {
  const g = new THREE.Group(), f = new THREE.Group(), R = rng(67);
  g.add(f);
  g.add(box(500, 0.2, 500, mat('#a89377', 0.95)), box(24, 0.4, 500, M.river, -140, 0, 0));
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2, d = 300 + R() * 80, h = 160 + R() * 120, x = Math.cos(a) * d, z = Math.sin(a) * d;
    g.add(mesh(new THREE.ConeGeometry(h * 0.9, h, 7).translate(0, h / 2, 0), PEAK, x, 0, z), mesh(new THREE.ConeGeometry(h * 0.22, h * 0.25, 7).translate(0, h * 0.875, 0), SNOW, x, 0, z));
  }
  const H = 40;
  f.add(mesh(new THREE.ConeGeometry(48, H, 10).translate(0, H / 2, 0), SCREE));
  const blocks = [];
  for (let tier = 0; tier < 6; tier++) {
    const y = 14 + tier * 4.2, r = 48 * (1 - y / H) + 1, n = Math.max(3, Math.round(r * 1.1));
    for (let k = 0; k < n; k++) {
      const a = (k / n) * Math.PI * 2 + tier * 0.3;
      blocks.push([Math.cos(a) * r, y - 2, Math.sin(a) * r, 5 + R() * 3, 5 + R() * 2.5, 5 + R() * 2, -a]);
    }
  }
  f.add(inst(unitBox(), blocks, TIBETAN.white), inst(unitBox(), blocks.map(([x, y, z, w, h, d, ry]) => [x, y + h, z, w + 0.3, 0.6, d + 0.3, ry]), TIBETAN.maroon));
  f.add(box(10, 6, 10, TIBETAN.white, 0, H - 4, 0), box(10.3, 0.7, 10.3, TIBETAN.maroon, 0, H + 2, 0), at(hipRoof(11, 11, 3, M.gild), 0, H + 2.7, 0), cyl(0.3, 0.7, 2, M.gild, 0, H + 5.6, 0, 8));
  return { group: g, focus: f, view: [0.6, 0.32, 1.25] };
}

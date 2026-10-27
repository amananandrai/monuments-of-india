import * as THREE from 'three';
import { M, mat, mesh, box, at, rng, hipRoof, tibetanBlock, TIBETAN, inst, unitBox } from '../helpers.js';

const ROCK = mat('#a08b6d', 0.95, 0, { flatShading: true });
const PEAK = mat('#8e8172', 0.95, 0, { flatShading: true });
const SNOW = mat('#f4f6f8', 0.8, 0, { flatShading: true });
const OCHRE = mat('#b8562f', 0.85);

// Buildings stacked up a rocky hill, twelve storeys from foot to summit, like the Potala in Lhasa.
export function buildThiksey() {
  const g = new THREE.Group(), f = new THREE.Group(), R = rng(61);
  g.add(f);
  g.add(box(400, 0.2, 400, mat('#b49e7c', 0.95)), box(30, 0.4, 400, M.river, 120, 0, 0));
  for (let i = 0; i < 7; i++) {
    const a = -Math.PI * 0.9 + i * 0.3, d = 380 + R() * 100, h = 200 + R() * 140, x = Math.cos(a) * d, z = Math.sin(a) * d;
    g.add(mesh(new THREE.ConeGeometry(h * 0.8, h, 7).translate(0, h / 2, 0), PEAK, x, 0, z), mesh(new THREE.ConeGeometry(h * 0.24, h * 0.3, 7).translate(0, h * 0.85, 0), SNOW, x, 0, z));
  }
  const H = 48;
  f.add(mesh(new THREE.ConeGeometry(62, H, 10).translate(0, H / 2, 0), ROCK));
  const blocks = [];
  for (let tier = 0; tier < 7; tier++) {
    const y = tier * 6, r = 56 * (1 - y / H) - 4, n = Math.max(3, Math.round(r / 4.5));
    for (let k = 0; k < n; k++) {
      const a = Math.PI * 0.15 + (k / n) * Math.PI * 0.7 + R() * 0.08;
      blocks.push([Math.cos(a) * r, y, Math.sin(a) * r, 6 + R() * 3, 6 + R() * 2, 7, -a + Math.PI / 2]);
    }
  }
  f.add(inst(unitBox(), blocks, TIBETAN.white), inst(unitBox(), blocks.map(([x, y, z, w, h, d, ry]) => [x, y + h, z, w + 0.3, 0.7, d + 0.3, ry]), TIBETAN.maroon));
  // Summit: the main assembly hall and the red Maitreya temple
  f.add(at(tibetanBlock(18, 9, 14, 2, OCHRE), -4, H - 6, 0), at(hipRoof(20, 16, 3, M.gild), -4, H + 3, 0));
  f.add(at(tibetanBlock(12, 7, 10, 2), 10, H - 8, 6));
  return { group: g, focus: f, view: [0.25, 0.3, 1.25] };
}

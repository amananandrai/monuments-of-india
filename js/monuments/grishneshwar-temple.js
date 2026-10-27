import * as THREE from 'three';
import { M, mat, box, at, nagaraTemple, inst, unitBox, aroundRect } from '../helpers.js';

const RED = mat('#8c4a3a', 0.85);
const SHADE = mat('#6e392d', 0.9);

export function buildGrishneshwar() {
  const g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  g.add(box(140, 0.2, 140, M.path));
  for (const s of [-1, 1]) f.add(box(70, 4, 2, mat('#a39079', 0.9), 0, 0, s * 40), box(2, 4, 80, mat('#a39079', 0.9), s * 35, 0, 0));
  // Red basalt temple with a five-tiered spire
  const t = nagaraTemple({ w: 11, h: 17, m: RED, shade: SHADE, plinth: 2, urus: 4, uruScale: 0.45, halls: [[16, 8, 4]], prof: (k) => 1 - 0.55 * Math.floor(k * 5) / 5 - 0.08 * k });
  f.add(at(t, 0, 0, -12));
  // Carved friezes of the ten avatars round the walls of the hall
  const figs = [];
  aroundRect(16.3, 16.3, 1.4).forEach(([x, z, ry]) => figs.push([x, 4, z - 12 + 6.3 + 8, 0.7, 2.6, 0.3, ry]));
  f.add(inst(unitBox(), figs, SHADE));
  return { group: g, focus: f, view: [0.85, 0.36, 1.15] };
}

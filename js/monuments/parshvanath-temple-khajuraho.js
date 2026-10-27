import * as THREE from 'three';
import { M, box, at, nagaraTemple, inst, unitBox, aroundRect } from '../helpers.js';

export function buildParshvanath() {
  const S = M.khaj, Sd = M.khajShade, g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  g.add(box(100, 0.2, 100, M.grass));
  // High platform, then the temple with its spire, minor spires and bands of sculpture
  f.add(box(26, 3, 40, Sd, 0, 0, 4));
  f.add(at(nagaraTemple({ w: 11, h: 15, m: S, shade: Sd, plinth: 1, urus: 4, uruScale: 0.55, halls: [[12, 6, 4], [9, 5, 3]], prof: (t) => 1 - 0.66 * Math.pow(t, 1.3) }), 0, 3, -8));
  const figs = [];
  for (const y of [5.2, 7.4]) aroundRect(13, 13, 1.2).forEach(([x, z, ry]) => figs.push([x, y, z - 8, 0.6, 1.6, 0.3, ry]));
  f.add(inst(unitBox(), figs, Sd));
  return { group: g, focus: f, view: [1.0, 0.35, 0.9] };
}

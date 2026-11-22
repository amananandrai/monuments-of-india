import * as THREE from 'three';
import { M, box, at, inst, unitBox } from '../helpers.js';
import { mergeByMaterial, frieze, templeNiche, idol } from '../parts/components.js';
import { trees, shrubs, scatter, along, lampPosts, benches, stalls } from '../parts/realism.js';
import { detail } from '../detail.js';
import { STONE, SHADE } from '../monuments/adalaj-stepwell.js';

// Adalaj, finer detail and setting. Carved bands run along the corridor's walls at the level of
// every gallery floor, with little shrines (niches) between them; a low stone parapet edges the
// openings at ground level; round the well a garden of lawns and paths shaded by neem, banyan and
// tamarind, with stalls by the gate in the village of Adalaj. Dimensions follow
// js/monuments/adalaj-stepwell.js.
export function addDetails(f, g, { D, F, CW, OZ, OA }) {
  const d = new THREE.Group();
  // Carved bands along the corridor's walls, a storey apart, and niches between them.
  for (const s of [-1, 1]) {
    for (let k = 1; k < 5; k++) d.add(box(0.06, 0.55, 45, frieze(STONE), s * (CW - 0.03), k * F - 1.05, 5));
    if (!detail.low) for (let z = -14; z <= 26; z += 3.6) for (let k = 1; k < 5; k++) {
      if (k * F > D - 0.5) continue;
      const n = at(templeNiche(0.6, 1.1, STONE, { figure: idol(0.9, SHADE), crown: false }), 0, k * F - 2.7, 0);
      n.rotation.y = -s * Math.PI / 2;
      n.position.set(s * (CW - 0.01), k * F - 2.7, z);
      d.add(n);
    }
  }
  // The parapet round the openings at ground level.
  const par = [];
  for (const s of [-1, 1]) {
    par.push([s * (CW + 0.25), D, 5, 0.5, 0.7, 46]);
    par.push([s * 10.25, D, 37, 0.5, 0.7, 18.5]);
    par.push([s * (CW + 4), D, 28.25, 7.5, 0.7, 0.5]);
  }
  par.push([0, D, 46.25, 21, 0.7, 0.5]);
  d.add(inst(unitBox(), par, SHADE));
  f.add(mergeByMaterial(d));
  // Paths round the well and out to the gate on the south.
  g.add(box(4, 0.04, 60, M.path, 0, D, 76), box(30, 0.04, 3, M.path, 0, D, 50));
  for (const s of [-1, 1]) g.add(box(3, 0.04, 90, M.path, s * 14, D, 4));
  g.add(lampPosts([...along(5, [-4, 54], [-4, 100]), ...along(5, [4, 54], [4, 100])], { y: D }), benches([[-14, -10], [14, -10], [-14, 20], [14, 20]], { y: D }));
  g.add(stalls([[-12, 96, Math.PI / 2], [-12, 88, Math.PI / 2], [12, 96, -Math.PI / 2], [12, 88, -Math.PI / 2]], { y: D }));
  // Trees: a banyan and tamarinds near the well, neem round the garden.
  const keep = [[-17, 17, -46, 56], [-8, 8, 56, 110]];
  g.add(trees([[-34, -40], [42, 10]], { kind: 'banyan', seed: 3, y: D }));
  g.add(trees([[-26, 30], [26, 44], [-24, -6], [26, -32]], { kind: 'tamarind', seed: 5, y: D }));
  g.add(trees(scatter(detail.low ? 18 : 34, [-120, 120, -120, 130], { seed: 7, gap: 14, avoid: keep }), { kind: 'neem', seed: 7, y: D }));
  g.add(shrubs(scatter(50, [-60, 60, -70, 80], { seed: 4, gap: 5, avoid: keep }).map(([x, z]) => [x, z, 1]), { seed: 4, y: D, flowers: '#d9487a' }));
}

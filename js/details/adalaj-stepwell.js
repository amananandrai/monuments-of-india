import * as THREE from 'three';
import { M, box, at, inst, unitBox, kalash } from '../helpers.js';
import { mergeByMaterial, frieze, templeNiche, jharokha } from '../parts/components.js';
import { figureFrieze } from '../parts/sculpture.js';
import { trees, shrubs, scatter, along, lampPosts, benches, stalls } from '../parts/realism.js';
import { detail } from '../detail.js';
import { STONE, SHADE } from '../monuments/adalaj-stepwell.js';

// Adalaj, finer detail and setting. From photographs: carved bands run along the corridor's walls
// at the level of every gallery floor, with niches between them, each holding a carved water pot
// (kalash) where a Hindu well would have an image; along the top storey runs a band of small
// elephants, and under it a frieze of the village scenes the well is known for (women churning
// buttermilk, dancers, musicians, a king on his seat). The four corner rooms of the entrance
// pavilion each put out an oriel balcony (jharokha) on heavy carved brackets over the landing.
// Either side of the octagonal shaft a narrow stair winds down from the ground to its galleries.
// In the garden to the east lie the graves of the six masons.
// A low stone parapet edges the openings at ground level; round the well a garden of lawns and
// paths shaded by neem, banyan and tamarind, with stalls by the gate in the village of Adalaj.
// Dimensions follow js/monuments/adalaj-stepwell.js.
export function addDetails(f, g, { D, F, CW, OZ, OA }) {
  const d = new THREE.Group();
  // Carved bands along the corridor's walls, a storey apart, and niches between them.
  for (const s of [-1, 1]) {
    for (let k = 1; k < 5; k++) d.add(box(0.06, 0.55, 45, frieze(STONE), s * (CW - 0.03), k * F - 1.05, 5));
    if (!detail.low) for (let z = -14; z <= 26; z += 3.6) for (let k = 1; k < 5; k++) {
      if (k * F > D - 0.5) continue;
      const n = templeNiche(0.6, 1.1, STONE, { figure: at(kalash(0.75, SHADE), 0, 0, 0.1), crown: false });
      n.rotation.y = -s * Math.PI / 2;
      n.position.set(s * (CW - 0.01), k * F - 2.7, z);
      d.add(n);
    }
    // The elephants along the top storey, and the village scenes below them.
    if (!detail.low) for (const [y, h, kinds, pitch] of [[D - 0.62, 0.3, ['elephant'], 0.62], [D - F + 0.35, 0.5, ['standing', 'dancer', 'seated', 'dancer', 'standing', 'seated'], 0.5]]) {
      const fr = figureFrieze(44, h, STONE, { kinds, pitch, proud: 0.07 });
      fr.rotation.y = -s * Math.PI / 2;
      f.add(at(fr, s * (CW - 0.04), y, 5.5));
    }
    // The oriels of the corner rooms, and the stairs beside the octagon: a kerbed opening and the
    // first steps of each going down into the dark.
    for (const z of [29.7, 40.3]) {
      const j = jharokha(1.7, 1.5, STONE, { d: 0.8, roof: 'flat', trim: SHADE });
      j.rotation.y = -s * Math.PI / 2;
      d.add(at(j, s * 2.6, D - F + 1.0, z));
    }
    const sx = s * (OA + 3.4);
    d.add(box(2.6, 0.5, 0.3, SHADE, sx, D, OZ + 1.15), box(2.6, 0.5, 0.3, SHADE, sx, D, OZ - 1.15), box(0.3, 0.5, 2, SHADE, sx + s * 1.15, D, OZ), box(2, 0.04, 2, M.recess, sx, D - 0.9, OZ));
    for (let k = 0; k < 3; k++) d.add(box(0.5, 0.25, 2, STONE, sx - s * (0.75 - k * 0.5), D - 0.25 * (k + 1), OZ));
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
  // The graves of the six masons who built the well, in a row in the garden to its east: stepped
  // stone cenotaphs, a small whitewashed lamp pillar at their head.
  for (let k = 0; k < 6; k++) for (let j = 0; j < 4; j++) d.add(box(2.6 - j * 0.22, 0.2, 1.5 - j * 0.22, j % 2 ? SHADE : STONE, 24, D + j * 0.2, 14 + k * 2.1));
  d.add(box(0.6, 1.5, 0.6, M.marble, 24, D, 11.8), box(0.75, 0.3, 0.75, SHADE, 24, D + 1.5, 11.8));
  f.add(mergeByMaterial(d));
  // Paths round the well and out to the gate on the south.
  g.add(box(4, 0.04, 60, M.path, 0, D, 76), box(30, 0.04, 3, M.path, 0, D, 50));
  for (const s of [-1, 1]) g.add(box(3, 0.04, 90, M.path, s * 14, D, 4));
  g.add(lampPosts([...along(5, [-4, 54], [-4, 100]), ...along(5, [4, 54], [4, 100])], { y: D }), benches([[-14, -10], [14, -10], [-14, 20], [14, 20]], { y: D }));
  g.add(stalls([[-12, 96, Math.PI / 2], [-12, 88, Math.PI / 2], [12, 96, -Math.PI / 2], [12, 88, -Math.PI / 2]], { y: D }));
  // Trees: a banyan and tamarinds near the well, neem round the garden.
  const keep = [[-17, 17, -46, 56], [-8, 8, 56, 110], [17, 30, 8, 30]];
  g.add(trees([[-34, -40], [42, 10]], { kind: 'banyan', seed: 3, y: D }));
  g.add(trees([[-26, 30], [30, 44], [-24, -6], [26, -32]], { kind: 'tamarind', seed: 5, y: D }));
  g.add(trees(scatter(detail.low ? 18 : 34, [-120, 120, -120, 130], { seed: 7, gap: 14, avoid: keep }), { kind: 'neem', seed: 7, y: D }));
  g.add(shrubs(scatter(50, [-60, 60, -70, 80], { seed: 4, gap: 5, avoid: keep }).map(([x, z]) => [x, z, 1]), { seed: 4, y: D, flowers: '#d9487a' }));
}

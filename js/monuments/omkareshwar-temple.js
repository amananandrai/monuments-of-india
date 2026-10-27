import * as THREE from 'three';
import { M, mat, mesh, box, at, rng, nagaraTemple, inst, unitBox } from '../helpers.js';

const WHITE = mat('#efe9de', 0.85);
const SHADE = mat('#cdbfa6', 0.9);
const HILL = mat('#6b7f4c', 0.95, 0, { flatShading: true });

export function buildOmkareshwar() {
  const g = new THREE.Group(), f = new THREE.Group(), R = rng(41);
  g.add(f);
  // The Narmada, with Mandhata island rising from it
  g.add(box(700, 0.4, 500, M.water, 0, -0.1, 0));
  const island = mesh(new THREE.CylinderGeometry(70, 110, 34, 12, 2), HILL, 0, 16.5, -70);
  island.scale.z = 0.7;
  g.add(island);
  // Ghats stepping down to the water, with the town on the slope above
  for (let k = 0; k < 8; k++) f.add(box(80, 1 + k * 0.9, 2.4, SHADE, 0, 0, 22 - k * 2.4));
  f.add(box(90, 8, 50, SHADE, 0, 0, -12));
  const houses = [];
  for (let i = 0; i < 26; i++) houses.push([(R() - 0.5) * 120, 8 + R() * 14, -40 - R() * 30, 6 + R() * 5, 4 + R() * 4, 6 + R() * 4, R()]);
  g.add(inst(unitBox(), houses, mat('#e7d9bd', 0.9)));
  f.add(at(nagaraTemple({ w: 11, h: 20, m: WHITE, shade: SHADE, plinth: 2, urus: 4, halls: [[13, 7, 4]] }), 0, 8, -18));
  return { group: g, focus: f, view: [0.6, 0.3, 1.25] };
}

import * as THREE from 'three';
import { M, mat, mesh, box, at, rng, onionDome, finial, guldasta, inst, unitCyl, aroundRect } from '../helpers.js';

const WHITE = mat('#efebe2', 0.8);
const GRANITE = mat('#3e3b39', 0.7);
const CYPRESS = mat('#2f4a2e', 0.95, 0, { flatShading: true });

export function buildTipuGumbaz() {
  const g = new THREE.Group(), f = new THREE.Group(), R = rng(103);
  g.add(f);
  g.add(box(180, 0.15, 180, M.grass), box(8, 0.25, 80, M.path, 0, 0, 45));
  // Avenue of cypress trees
  const trees = [];
  for (let k = 0; k < 10; k++) for (const s of [-1, 1]) trees.push([s * 10, 0, 20 + k * 7, 3.4, 12 + R() * 3, 3.4]);
  g.add(inst(new THREE.ConeGeometry(0.5, 1, 8).translate(0, 0.5, 0), trees, CYPRESS));
  // Plinth, the colonnade of dark granite pillars, the white tomb and its onion dome
  f.add(box(34, 2, 34, WHITE), box(30.8, 0.8, 30.8, WHITE, 0, 12));
  const cols = [];
  aroundRect(28, 28, 3.1).forEach(([x, z]) => cols.push([x, 2, z, 1, 10, 1]));
  f.add(inst(unitCyl(10), cols, GRANITE), box(20, 10, 20, WHITE, 0, 2));
  for (const x of [-14, 14]) for (const z of [-14, 14]) f.add(at(guldasta(6, 0.7, WHITE), x, 12.8, z));
  f.add(at(onionDome(9, WHITE), 0, 12.8, 0), at(finial(4), 0, 12.8 + 16, 0));
  return { group: g, focus: f, view: [0.6, 0.3, 1.25] };
}

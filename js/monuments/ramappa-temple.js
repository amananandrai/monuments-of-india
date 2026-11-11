import * as THREE from 'three';
import { M, mat, box, at, group, starPrism, pidaRoof, kalash, inst, unitCyl, surface, photo } from '../helpers.js';
import { templeDoorway, steps } from '../details/doorways.js';
import { mergeByMaterial } from '../details/components.js';
import { nandi } from '../details/animals.js';
import { figure, instances, kutaGeo } from '../details/sculpture.js';
import { addDetails } from '../details/ramappa-temple.js';

const DOLERITE = photo(mat('#4d4a47', 0.8), 'blocks');
const SAND = mat('#b49a7c', 0.9);
const BRICK = surface(mat('#c99878', 0.95), 'brick');

export function buildRamappa() {
  const g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  g.add(box(110, 0.2, 110, M.grass));
  for (const s of [-1, 1]) f.add(box(80, 2.4, 1.6, SAND, 0, 0, s * 40), box(1.6, 2.4, 80, SAND, s * 40, 0, 0));
  // Star-shaped platform (upapitha)
  f.add(at(starPrism(20, 22, 19, 1.6, SAND), 0, 0, -2), at(starPrism(20, 19, 16.5, 1.4, DOLERITE), 0, 1.6, -2));
  const B = 3;
  // Mandapa: dark dolerite pillars, a broad eave, and bracket figures (madanikas) at the corners
  const cols = [];
  for (let x = -7.5; x <= 7.5; x += 3) for (let z = -1; z <= 13; z += 3.5) cols.push([x, B, z, 1, 5, 1]);
  f.add(box(18, 0.6, 18, DOLERITE, 0, B - 0.6, 6), inst(unitCyl(8), cols, DOLERITE));
  f.add(box(22, 0.7, 22, DOLERITE, 0, B + 5, 6), box(18, 1.2, 18, SAND, 0, B + 5.7, 6));
  // The madanikas: on every outer pillar a dancing figure of polished black stone springs from the
  // shaft as a bracket, leaning out under the eave.
  const BLACK = mat('#262422', 0.32), mad = new THREE.Group();
  cols.forEach(([x, , z]) => {
    const out = Math.abs(x) > 7 ? [Math.sign(x), 0] : z < 0 || z > 12 ? [0, z < 0 ? -1 : 1] : null;
    if (!out) return;
    const o = figure(2.3, BLACK, 'dancer');
    o.position.set(x + out[0] * 0.55, B + 2.5, z + out[1] * 0.55);
    o.rotation.y = Math.atan2(out[0], out[1]);
    o.rotateX(0.5);
    mad.add(o);
  });
  f.add(mergeByMaterial(mad));
  // The sanctum's doorway with its door guardians, and steps up to the hall
  f.add(mergeByMaterial(group(at(templeDoorway(1.7, 3.6, { m: DOLERITE, bands: 4 }), 0, B, -4), at(steps(5, B, 7, SAND), 0, 0, 15))));
  // Sanctum on its dark base, under the light-brick tower
  f.add(box(12, 7, 12, DOLERITE, 0, B, -10), box(13, 0.6, 13, SAND, 0, B + 7, -10));
  // The tower is of the famous light bricks, porous enough to float, pale and rough; a miniature
  // shrine (kuta) stands at each corner and the middle of each face on every storey's ledge.
  const tower = pidaRoof(12, 4.5, 7, 1.1, BRICK, mat('#a7735a', 0.95));
  f.add(at(tower, 0, B + 7.6, -10), at(kalash(2.2, SAND), 0, B + 7.6 + tower.userData.top, -10));
  const ku = [];
  for (let i = 0; i < 6; i++) {
    const w = 12 + (4.5 - 12) * (i / 6), y = B + 7.6 + i * 1.1 * 1.55 + 1.1, e = w / 2 - 0.3;
    for (const [px, pz] of [[-e, -e], [e, -e], [-e, e], [e, e], [0, e], [0, -e], [e, 0], [-e, 0]]) ku.push([px, y, pz - 10, 0.48, 0.48, 0.48, Math.atan2(px, pz)]);
  }
  f.add(instances(kutaGeo(), ku, BRICK));
  // Nandi pavilion facing the shrine
  f.add(box(8, 1.2, 8, DOLERITE, 0, 0, 30), at(nandi(mat('#2f2d2b', 0.55), 0.95), 0, 1.2, 30).rotateY(Math.PI));
  addDetails(f, g);
  return { group: g, focus: f, view: [0.95, 0.45, 1.15] };
}

import * as THREE from 'three';
import { M, mat, box, cyl, at, lathe, rng, inst, unitBox, surface, sheet } from '../helpers.js';
import { ashokanPillar } from '../parts/animals.js';
import { addDetails } from '../details/ashokan-pillar-vaishali.js';

// The Chunar sandstone of the Mauryan pillars, polished to a sheen that has outlasted 2,200
// years; and the brick of the stupa and the tank.
export const POLISH = surface(mat('#c4ab83', 0.32), 'none');
export const BRICK = surface(mat('#9a644c', 0.95), 'terracotta');
export const BRICK_DARK = surface(mat('#7d503d', 0.95), 'terracotta');

// The Ashokan pillar at Kolhua, Vaishali, c. 250 BCE. From photographs and the ASI's account: a
// monolith of polished sandstone standing about 11 m above today's ground (more lies buried), its
// shaft stouter than the other Mauryan pillars and plain, without an edict; a bell capital of
// inverted lotus petals; a square abacus; and on it a single lion, seated, facing north. Beside it
// to the north stands the Ananda stupa, a brick mound on a round drum, and to the south the
// Ramkund, a brick-lined tank. The pillar faces +z (north): the lion looks over the stupa.
export const H = { shaft: 7.4, r0: 0.66, r1: 0.52 };

export function buildAshokanPillarVaishali() {
  const g = new THREE.Group(), f = new THREE.Group(), R = rng(7);
  g.add(f);
  f.add(ashokanPillar(POLISH, H));
  // The low brick platform round the pillar's foot, and the railing that keeps visitors back.
  f.add(box(4.4, 0.35, 4.4, BRICK, 0, 0, 0));
  const rails = [];
  for (const [x, z, w, d] of [[0, 3.2, 6.6, 0.05], [0, -3.2, 6.6, 0.05], [3.3, 0, 0.05, 6.4], [-3.3, 0, 0.05, 6.4]]) for (const y of [0.45, 0.95]) rails.push([x, y, z, w, 0.05, d, 0]);
  for (let k = 0; k < 20; k++) { const t = (k / 20) * 4, s = t % 1 * 6.6 - 3.3, side = Math.floor(t); rails.push([side === 0 ? s : side === 1 ? 3.3 : side === 2 ? -s : -3.3, 0, side === 0 ? 3.2 : side === 1 ? s : side === 2 ? -3.2 : -s, 0.06, 1.05, 0.06, 0]); }
  f.add(inst(unitBox(), rails, mat('#3b3f3a', 0.6, 0.4)));
  // The Ananda stupa, north of the pillar: a brick drum 20 m across with its terrace and a
  // ruined, grassed dome.
  const sz = 24, st = new THREE.Group();
  st.add(cyl(11.6, 11.8, 0.8, BRICK_DARK, 0, 0, 0, 48), cyl(10, 10.2, 2, BRICK, 0, 0.8, 0, 48));
  st.add(at(lathe([[9.6, 0], [9.1, 0.9], [7.8, 1.9], [5.6, 2.7], [2.8, 3.1], [0, 3.2]], surface(mat('#7c7a4c', 0.97), 'ground'), 40), 0, 2.8, 0));
  st.add(at(lathe([[9.95, 0], [9.6, 0.7], [9.3, 1.0]], BRICK_DARK, 48), 0, 2.8, 0));
  f.add(at(st, 0, 0, sz));
  // Steps up the stupa's south side, and a brick path from the pillar to them.
  for (let k = 0; k < 6; k++) f.add(box(3, 0.47 * (k + 1), 0.5, BRICK, 0, 0, sz - 12.9 + k * 0.5));
  // The Ramkund, south of the pillar: a tank lined with brick, stepped down on all four sides.
  const tz = -34, tw = 46, tl = 30, n = 6, tank = [];
  for (let k = 0; k < n; k++) {
    const w = tw - k * 1.6, l = tl - k * 1.6, y = -(k + 1) * 0.45, t = 0.8;
    tank.push([0, y, -l / 2 + t / 2, w, 0.45, t, 0], [0, y, l / 2 - t / 2, w, 0.45, t, 0], [-w / 2 + t / 2, y, 0, t, 0.45, l - 2 * t, 0], [w / 2 - t / 2, y, 0, t, 0.45, l - 2 * t, 0]);
  }
  const tg = new THREE.Group();
  tg.add(inst(unitBox(), tank, BRICK), box(tw - n * 1.6, 0.3, tl - n * 1.6, mat('#4d4a3a', 0.95), 0, -n * 0.45 - 0.3, 0), sheet(tw - n * 1.6, tl - n * 1.6, M.lake, 0, -n * 0.45 + 1, 0));
  g.add(at(tg, 0, 0, tz));
  addDetails(f, g, { sz, tz, tw, tl, R });
  // From the west, the lion in profile against the sky, the stupa behind it to the left.
  return { group: g, focus: f, view: [-1, 0.2, -0.45], zoom: 0.9 };
}

import * as THREE from 'three';
import { M, mat, box, cyl, at, lathe, rng, inst, unitBox, surface, sheet, ribbed } from '../helpers.js';
import { lion } from '../parts/animals.js';
import { addDetails } from '../details/ashokan-pillar-vaishali.js';

// The Chunar sandstone of the Mauryan pillars, polished to a sheen that has outlasted 2,200
// years; and the brick of the stupa and the tank.
export const POLISH = surface(mat('#c4ab83', 0.32), 'none');
export const BRICK = surface(mat('#9a644c', 0.95), 'terracotta');
export const BRICK_DARK = surface(mat('#7d503d', 0.95), 'terracotta');

// The Ashokan pillar at Kolhua, Vaishali, c. 250 BCE. From photographs and the ASI's account: a
// monolith of polished sandstone standing about 12 m above today's ground (more lies buried), its
// shaft stouter than the other Mauryan pillars, some nine diameters high, and plain, without an
// edict; a small bell capital of inverted lotus petals under a cable moulding; a plain square
// abacus; and on it a single lion, seated, facing north. A few metres north of it stands the
// Ananda stupa, a low dome of brick 20 m across and 4.6 m high on a stepped base; votive stupas
// crowd round the pillar's foot; and close on the south lies the Markat-hrad (Ramkund), a
// brick-lined tank. The pillar faces +z (north): the lion looks at the stupa; east is -x.
export const H = { shaft: 9.3, r0: 0.6, r1: 0.5 };
// The site's ground stands LIFT above the open land, so that the tank lies in it.
export const LIFT = 3.8;

function pillar(m, { shaft, r0, r1 }) {
  const g = new THREE.Group(), y0 = shaft;
  g.add(cyl(r1, r0, shaft, m, 0, 0, 0, 40));
  // The bell, ribbed by its petals, with a cable necking below and a cushion above; the abacus.
  g.add(at(ribbed(lathe([[r1 * 1.0, 0], [r1 * 1.2, 0.05], [r1 * 1.42, 0.2], [r1 * 1.36, 0.42], [r1 * 1.12, 0.62], [r1 * 0.92, 0.74], [r1 * 0.98, 0.82], [r1 * 0.9, 0.86]], m, 72), 24, 0.05), 0, y0 + 0.1, 0));
  g.add(cyl(r1 * 1.1, r1 * 1.1, 0.12, m, 0, y0, 0, 32), box(1.3, 0.3, 1.3, m, 0, y0 + 0.96, 0));
  // The lion, seated on its haunches, mane in curls.
  const l = lion(1, m).children[1], lg = new THREE.Group().add(l);
  l.position.set(0, -0.45, 0.2);
  lg.scale.setScalar(0.8);
  lg.position.y = y0 + 1.26;
  g.add(lg);
  // The patch of Gupta-period shell characters cut into the shaft, a man's height up.
  const cut = mat('#8f7a5c', 0.6), R = rng(3);
  for (let k = 0; k < 14; k++) { const a = -0.45 + (k % 7) * 0.15, y = 1.6 + Math.floor(k / 7) * 0.22, r = r0 - (r0 - r1) * (y / shaft) + 0.002; g.add(at(box(0.07 + R() * 0.05, 0.03, 0.012, cut, 0, 0, 0), Math.sin(a + 1.2) * r, y + R() * 0.08, Math.cos(a + 1.2) * r).rotateY(a + 1.2).rotateZ(R() * 1.6 - 0.8)); }
  return g;
}

export function buildAshokanPillarVaishali() {
  const g = new THREE.Group(), f = new THREE.Group(), R = rng(7);
  g.add(at(f, 0, LIFT, 0));
  f.add(pillar(POLISH, H));
  // The iron railing that keeps visitors back from the pillar's foot.
  const rails = [], q = 2.2;
  for (const [x, z, w, d] of [[0, q, 2 * q, 0.05], [0, -q, 2 * q, 0.05], [q, 0, 0.05, 2 * q], [-q, 0, 0.05, 2 * q]]) for (const y of [0.45, 0.95]) rails.push([x, y, z, w, 0.05, d, 0]);
  for (let k = 0; k < 16; k++) { const t = (k / 16) * 4, s = t % 1 * 2 * q - q, side = Math.floor(t); rails.push([side === 0 ? s : side === 1 ? q : side === 2 ? -s : -q, 0, side === 0 ? q : side === 1 ? s : side === 2 ? -q : -s, 0.06, 1.05, 0.06, 0]); }
  f.add(inst(unitBox(), rails, mat('#3b3f3a', 0.6, 0.4)));
  // The Ananda stupa, north of the pillar: a low dome of brick on two stepped courses.
  const sz = 18, st = new THREE.Group();
  st.add(cyl(11.2, 11.4, 0.5, BRICK_DARK, 0, 0, 0, 48), cyl(10.5, 10.6, 0.5, BRICK, 0, 0.5, 0, 48));
  st.add(at(lathe([[10, 0], [9.7, 0.8], [8.9, 1.7], [7.4, 2.6], [5.2, 3.3], [2.6, 3.62], [0, 3.7]], BRICK, 48), 0, 1, 0));
  f.add(at(st, 0, 0, sz));
  // The Markat-hrad, south of the pillar: a tank 65 m by 35 m lined with brick, stepped down in
  // seven tiers on all four sides.
  const tz = -30, tw = 65, tl = 35, n = 7, tank = [];
  for (let k = 0; k < n; k++) {
    const w = tw - k * 1.6, l = tl - k * 1.6, y = -(k + 1) * 0.45, t = 0.8;
    tank.push([0, y, -l / 2 + t / 2, w, 0.45, t, 0], [0, y, l / 2 - t / 2, w, 0.45, t, 0], [-w / 2 + t / 2, y, 0, t, 0.45, l - 2 * t, 0], [w / 2 - t / 2, y, 0, t, 0.45, l - 2 * t, 0]);
  }
  const tg = new THREE.Group();
  tg.add(inst(unitBox(), tank, BRICK), box(tw - n * 1.6, 0.3, tl - n * 1.6, mat('#4d4a3a', 0.95), 0, -n * 0.45 - 0.3, 0), sheet(tw - n * 1.6 + 6, tl - n * 1.6 + 6, M.lake, 0, -n * 0.45 + 1.25, 0));
  g.add(at(tg, -8, LIFT, tz));
  addDetails(f, g, { sz, tz, tx: -8, tw, tl, n, R });
  // From the south-west, the lion in profile against the sky, the stupa behind it to the left.
  return { group: g, focus: f, view: [1, 0.2, -0.5], zoom: 0.72 };
}

import * as THREE from 'three';
import { M, mat, box, at, inst, unitCyl, aroundRect, kalash, flag, rng } from '../helpers.js';
import { nagaraTemple, bhumijaRows } from '../details/temples.js';
import { instances, miniSpireGeo } from '../details/sculpture.js';
import { townHouses } from '../details/realism.js';
import { addDetails } from '../details/mahakaleshwar-temple.js';

const STONE = mat('#e6d6b8', 0.85);
const SHADE = mat('#b98f5f', 0.9);
const SPIRE = mat('#eadcc0', 0.8);

export function buildMahakaleshwar() {
  const g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  g.add(box(150, 0.2, 150, M.path), box(70, 0.4, 20, M.water, -20, 0, -62));
  // Courtyard colonnade, and the Koti Teerth tank beside the temple
  const cols = [];
  aroundRect(90, 100, 3).forEach(([x, z]) => cols.push([x, 0, z, 0.8, 5, 0.8]));
  f.add(inst(unitCyl(8), cols, SHADE));
  for (const s of [-1, 1]) f.add(box(92, 0.8, 4, SHADE, 0, 5, s * 50), box(4, 0.8, 102, SHADE, s * 45, 5, 0));
  f.add(box(26, 1, 22, SHADE, -28, 0, -14), box(22, 1.1, 18, M.water, -28, 0, -14));
  // The temple in three storeys, one shrine above another: Mahakaleshwar at the bottom, Omkareshwar
  // above it and Nagchandreshwar at the top, each storey with a balcony round it. Over them rises the
  // tall Bhumija spire, crowned by a gilded kalash and the flag.
  const crown = new THREE.Group().add(kalash(2.6, M.gold), at(flag(4, M.saffron), 0, 2.6, 0));
  const prof = (t) => 1 - 0.6 * Math.pow(t, 1.45);
  const t = nagaraTemple({ w: 12, h: 26, m: STONE, shade: SHADE, spireM: SPIRE, plinth: 2, urus: 0, halls: [[14, 8, 5], [12, 7, 4]], crown, prof, sanctumStoreys: 3 });
  f.add(at(t, 10, 0, -20));
  f.add(at(instances(miniSpireGeo(), bhumijaRows(12, 26, prof), SPIRE), 10, t.userData.sy, -20));
  // The old town of Ujjain hems the temple in: houses three and four storeys high along the
  // streets outside the courtyard, an opening left for the approach.
  const R = rng(5), hs = [];
  const row = (x0, x1, fixed, axis, ry, d) => { for (let x = x0; x < x1;) { const w = 6 + R() * 5; if (Math.abs(x + w / 2) > 10 || axis !== 'x' || fixed < 0) hs.push(axis === 'x' ? [x + w / 2, fixed, w - 0.4, d, 2 + Math.floor(R() * 3), ry] : [fixed, x + w / 2, w - 0.4, d, 2 + Math.floor(R() * 3), ry]); x += w; } };
  row(-74, 70, 67, 'x', Math.PI, 12);
  row(18, 70, -67, 'x', 0, 12);
  for (const s of [-1, 1]) row(-50, 52, s * 63, 'z', -s * Math.PI / 2, 14);
  g.add(townHouses(hs, { seed: 5 }));
  addDetails(f, g);
  return { group: g, focus: f, view: [0.85, 0.42, 1.15] };
}

import * as THREE from 'three';
import { M, mat, at, onFace, aroundRect, FACES } from '../helpers.js';
import { jharokha, merlons, beltCourse, bracketGeo, placeAll, chhajja, mergeByMaterial } from './components.js';
import { towerDetail, slitRow } from './forts.js';
import { trees, shrubs, lampPosts, scatter, along } from './realism.js';
import { ridgeY } from '../monuments/amber-fort.js';
import { rideElephant } from './animals.js';

// Amber Fort: painted elephants in their howdahs on the ramp up from the lake to the Suraj Pol, the
// saffron beds of the Kesar Kyari garden, scrub and dhok trees on the Aravalli slopes, and lamps
// along the lake road.
const HIDE = mat('#7d726a', 0.9);
const SAND = mat('#d9b77e', 0.9), SAND_DARK = mat('#b8925a', 0.9);

// Amber Fort, finer detail. From photographs of the fort:
// - the ramparts carry a string course and a row of loopholes, and the round bastions are banded;
// - the palace fronts over the Jaleb Chowk are hung with jharokhas, oriel windows on brackets with
//   pierced panels and curved bangla roofs, between the arched recesses, under a crest of merlons;
// - jharokhas either side of the arch of the Ganesh Pol;
// - in the Diwan-i-Aam, carved brackets spring from the tops of the columns under a deep eave.
// Dimensions follow js/monuments/amber-fort.js.
function architecture(f) {
  const d = new THREE.Group();
  for (const [x0, x1, z, y] of [[-80, 80, 36, 10], [-70, 70, -8, 22]]) {
    d.add(beltCourse(x1 - x0, 3, y + 3.2, 0.35, 0.2, SAND_DARK).translateX((x0 + x1) / 2).translateZ(z));
    d.add(at(slitRow(x1 - x0 - 4, Math.round((x1 - x0) / 4), y + 4.6, 0.3, 1), (x0 + x1) / 2, 0, z + 1.5));
    for (const x of [x0, x1, (x0 + x1) / 2]) d.add(at(towerDetail(4.5, 4, 10, SAND, SAND_DARK, { n: 8, seg: 16, courses: [0.4] }), x, y, z));
  }
  // The palace blocks: [w, h, d, x, y, z] as built.
  for (const [w, h, dd, x, y, z] of [[40, 12, 22, -36, 34, -66], [36, 10, 20, 32, 34, -64], [30, 14, 22, 0, 34, -78]]) {
    const n = Math.max(2, Math.floor(w / 4));
    for (let k = 0; k < n; k += 2) d.add(at(jharokha(1.8, 2.4, SAND, { d: 0.9, trim: SAND_DARK }), x - w / 2 + (k + 0.5) * (w / n), y + 1.3, z + dd / 2 + 0.02));
    d.add(at(merlons(w, 0.7, 0.9, 0.35, SAND, 0.35), x, y + h + 0.6, z + dd / 2 + 0.1));
  }
  for (const x of [-5.6, 5.6]) d.add(at(jharokha(1.8, 2.4, SAND, { d: 0.9, trim: SAND_DARK }), x, 39.5, -51.98));
  // Diwan-i-Aam: brackets from each column top, outward, and an eave round the roof slab.
  const br = [];
  for (const [x, z, a] of aroundRect(24, 14, 3)) { const o = a + Math.PI; br.push([x + 22 + Math.sin(o) * 0.5, 29, z - 26 + Math.cos(o) * 0.5, o]); }
  d.add(placeAll(bracketGeo(1.1, 0.8, 0.5), br, SAND_DARK));
  const hall = at(new THREE.Group(), 22, 0, -26);
  for (const a of FACES) {
    const long = Math.abs(Math.sin(a)) < 0.5;
    hall.add(onFace(at(chhajja(long ? 26.4 : 16.4, 1.4, 0.5, 0.15, M.marble), 0, 30, 0), a, long ? 8 : 13));
  }
  d.add(hall);
  mergeByMaterial(d);
  f.add(d);
}

export function addDetails(f, g) {
  architecture(f);
  [[-18, 37.5, '#b3262e'], [-31, 37.5, '#1f5f8b'], [-44, 37.5, '#2f7a3f']].forEach(([x, z, c]) => {
    const e = rideElephant(HIDE, 0.95, { cloth: c });
    e.position.set(x, 0, z);
    e.rotation.y = -Math.PI / 2;
    f.add(e);
  });
  // (The Kesar Kyari's beds are the low grass squares on the island, in the builder.)
  // Scrub on the hillsides either side of the fort
  for (const [x0, x1, z0, z1, y] of [[-100, -84, -34, 34, 10], [84, 100, -34, 34, 10], [-85, -72, -70, -12, 22], [72, 85, -70, -12, 22], [-75, -52, -104, -58, 34], [52, 75, -104, -58, 34]]) {
    const spots = scatter(6, [x0, x1, z0, z1], { seed: x0 * 3 + y, gap: 5 });
    g.add(trees(spots, { kind: 'dhok', seed: y, y, h: 5 }), shrubs(spots.map(([x, z]) => [x + 2.5, z - 2, 2]), { y, dry: true, seed: y + 1 }));
  }
  g.add(lampPosts(along(8, [-75, 39.5], [75, 39.5])));
  // Dry scrub scattered up the ridge to the crest, each bush set on the ground where it stands.
  const scrub = scatter(260, [-560, 560, -460, 30], { seed: 21, gap: 14, avoid: [[-104, 104, -110, 40]] })
    .map(([x, z]) => [x, z, 2.6, ridgeY(x, z) - 0.4]).filter(([, , , y]) => y > 1);
  g.add(shrubs(scrub, { dry: true, seed: 22 }));
}

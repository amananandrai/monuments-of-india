import * as THREE from 'three';
import { M, mat, box, at, onFace, FACES, photo } from '../helpers.js';
import { chhajja, petalRing, rosette, templeNiche, windowFrame, merlons, mergeByMaterial } from './components.js';
import { trees, shrubs, lampPosts, scatter, along, cityAround } from './realism.js';

// Kirti Mandir, finer detail. From photographs: a sloping eave runs round the memorial hall above
// its arcade; rosettes fill the spandrels; its domes rise from cups of lotus petals; and the central
// tower's base has a niche on each face. Arched windows light the hall's sides and back, a low
// parapet of merlons runs round its roof, and the birthplace house has timber-framed windows on
// its side walls as on its front.
// Dimensions follow js/monuments/kirti-mandir.js: the hall 36 × 20.6 and 9 high on a 1 m base,
// its arcade front at z = 11; the tower block 9 square at (0, 10.8, -2).
const WOOD = photo(mat('#5a3a24', 0.8), 'timber');
const CREAM = mat('#ecd9bd', 0.85), SHADE = mat('#c9ad87', 0.9);
function architecture(f) {
  const d = new THREE.Group();
  for (const a of FACES) {
    const long = Math.abs(Math.sin(a)) < 0.5;
    d.add(onFace(at(chhajja((long ? 36 : 20.6) + 1.2, 1.1, 0.4, 0.12, SHADE), 0, 9.9, 0), a, long ? 11 : 18));
  }
  for (let k = -3; k < 3; k++) d.add(at(rosette(0.45, SHADE, 8), k * 4.8 + 2.4, 7.6, 11.02));
  for (const x of [-14, 14]) d.add(at(petalRing(2.8, 14, 1.6, 1.0, 0.55, CREAM), x, 10.8, 0));
  const t = at(new THREE.Group(), 0, 10.8, -2);
  for (const a of FACES) t.add(onFace(at(templeNiche(1.4, 2.6, CREAM), 0, 1.2, 0), a, 4.5));
  d.add(t);
  // The hall's sides (x = ±18, 20.6 long, centred on z = -0.7) and back (z = -11): arched windows.
  const hall = at(new THREE.Group(), 0, 1, -0.7);
  for (const [a, len, dist] of [[Math.PI / 2, 20.6, 18], [-Math.PI / 2, 20.6, 18], [Math.PI, 36, 10.3]]) {
    const n = Math.round(len / 5);
    for (let k = 0; k < n; k++) hall.add(onFace(at(windowFrame(1.8, 4.6, SHADE), 0, 1.6, 0), a, dist + 0.01, -len / 2 + (k + 0.5) * (len / n)));
  }
  d.add(hall);
  for (const a of FACES) { const long = Math.abs(Math.sin(a)) < 0.5; d.add(onFace(at(merlons((long ? 37 : 23) - 1, 0.5, 0.7, 0.25, CREAM, 0.5), 0, 10.8, 0), a, (long ? 11.5 : 18.5) - 0.3)); }
  // The birthplace house (16 × 13 at (-31, -1), floors at 0, 3.8 and 7.4): windows on its sides.
  const hv = at(new THREE.Group(), -31, 0, -1);
  for (const a of [Math.PI / 2, -Math.PI / 2]) for (const y of [0.9, 4.1, 7.7]) for (const lat of [-3.4, 0, 3.4]) {
    hv.add(onFace(box(1.3, 1.9, 0.2, WOOD, 0, y, 0), a, 8.02, lat), onFace(box(1.0, 1.6, 0.08, M.recess, 0, y + 0.15, 0), a, 8.13, lat));
  }
  d.add(hv);
  mergeByMaterial(d);
  f.add(d);
}

// Kirti Mandir at Porbandar, by Gandhi's birthplace: the lawn's hedges and flower beds, lamps, and
// neem trees along the street.
export function addDetails(f, g) {
  architecture(f);
  g.add(shrubs([...along(8, [-28, 27], [-28, 53]), ...along(8, [28, 27], [28, 53])].map(([x, z]) => [x, z, 1]), { seed: 3 }));
  g.add(shrubs(scatter(10, [-24, 24, 30, 52], { seed: 4, gap: 4, avoid: [[-6, 6, 14, 60]] }).map(([x, z]) => [x, z, 1.4]), { flowers: '#f08a1c', seed: 4 }));
  g.add(trees([...along(6, [-62, 58], [62, 58]), ...along(4, [-62, -50], [62, -50])], { kind: 'neem', seed: 5 }));
  g.add(lampPosts(along(4, [-4, 18], [-4, 54]).concat(along(4, [4, 18], [4, 54]))));
  // Porbandar's old town round the memorial: houses two to four storeys high, with the street
  // before it left open.
  g.add(cityAround([-66, 66, -56, 64], { rows: 2, gap: 4, storeys: [2, 4], seed: 99, keep: [[-400, 400, 60, 400]], paint: ['#e9d9b8', '#d6c7a6', '#efe2c4', '#cfd8d4', '#e7b9b0', '#f1e6cf'] }));
}

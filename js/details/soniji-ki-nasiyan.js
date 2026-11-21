import * as THREE from 'three';
import { mat, mesh, box, at, onFace } from '../helpers.js';
import { archRing, pilasters, panel, frieze, bracketGeo, placeAll, columnTrim, cuspedArchGeo, mergeByMaterial, beltCourse } from '../parts/components.js';
import { manastambha } from '../parts/temples.js';
import { trees, lampPosts, along } from '../parts/realism.js';

// Soniji ki Nasiyan, finer detail. From photographs of the street front at Ajmer: the red
// sandstone is carved everywhere, the storeys divided into bays by pilasters, a carved band under
// each cornice carried on brackets, every arch in a moulded frame, and the open upper gallery of
// the Swarna Nagari hall arched between its columns in the cusped Rajput manner. Before them stands
// a manastambha. Dimensions follow js/monuments/soniji-ki-nasiyan.js: the temple front centred on
// x = -24, 34 wide, its face at z = 12, storeys 7 and 6 high on a plinth of 1.2; the hall from
// x = 0 to 40, 24 deep, its face also at z = 12, its gallery columns every 3.8 m from x = 1.
const RED = mat('#a94a3c', 0.85);
const RED_LIGHT = mat('#c26a5a', 0.85);

function temple(d) {
  const x0 = -24, W = 34, z = 12, P = 1.2, F1 = 7, y2 = P + F1 + 0.5, F2 = 6;
  // Pilasters between the bays on both storeys, stopping under the carved band.
  for (const k of [-15.5, -9, -3.4, 3.4, 9, 15.5]) {
    d.add(at(pilasters(0, 1, 0.6, F1 - 1.1, 0.15, RED_LIGHT), x0 + k, P + 0.05, z));
    d.add(at(pilasters(0, 1, 0.5, F2 - 1.0, 0.13, RED_LIGHT), x0 + k, y2 + 0.05, z));
  }
  // The carved band under each cornice, on brackets.
  for (const y of [P + F1, y2 + F2]) {
    d.add(box(W - 0.1, 0.7, 0.06, frieze(RED), x0, y - 0.95, z + 0.005));
    d.add(placeAll(bracketGeo(0.6, 0.45, 0.25), Array.from({ length: 20 }, (_, i) => [x0 - W / 2 + 0.85 + i * (W - 1.7) / 19, y, z]), RED_LIGHT));
  }
  // A moulded frame round each arched panel, and a carved frame round the doorway.
  for (const k of [-12, -6, 6, 12]) d.add(at(archRing(3, 4.6, true, 0.22, 0.32, RED_LIGHT), x0 + k, P + 0.6, z));
  d.add(at(panel(5.8, 6.4, 0.42, RED_LIGHT, null, 0.12), x0, P + 0.01, z));
  // The plinth's mouldings.
  d.add(at(beltCourse(W + 2, 22, 0.35, 0.3, 0.1, RED_LIGHT), x0, 0, 2));
}

function hall(d) {
  const z = 12;
  // Below: pilasters between the arched panels, a moulded frame round each, the carved band.
  for (let k = 0; k <= 6; k++) d.add(at(pilasters(0, 1, 0.6, 5.9, 0.15, RED_LIGHT), k === 0 ? 0.4 : k === 6 ? 39.6 : -1 + k * 7, 0.1, z));
  for (let k = 0; k < 6; k++) d.add(onFace(at(archRing(3.6, 5, true, 0.22, 0.32, RED_LIGHT), 0, 0.6, 0), 0, z, 2.5 + k * 7));
  d.add(box(39.8, 0.7, 0.06, frieze(RED), 20, 6.15, z + 0.005));
  // The upper gallery: bases and capitals on its columns, and a cusped arch between each pair.
  const cols = [];
  for (let k = 0; k <= 10; k++) cols.push([1 + k * 3.8, 7.6, 11.4, 0.6, 7, 0.6]);
  d.add(columnTrim(cols, RED, { capM: RED_LIGHT }));
  const geo = cuspedArchGeo(3.2, 1.7, 0.3);
  for (let k = 0; k < 10; k++) d.add(mesh(geo, RED_LIGHT, 2.9 + k * 3.8, 14.6, 11.4));
}

// Soniji ki Nasiyan at Ajmer: neem trees along the street outside the red sandstone temple and the
// Swarna Nagari hall with its gilded city, and lamps.
export function addDetails(f, g) {
  const d = new THREE.Group();
  temple(d);
  hall(d);
  f.add(mergeByMaterial(d));
  // The manastambha before the gap between the temple and the hall, its pavilion holding four
  // seated images.
  f.add(at(manastambha(13, RED_LIGHT, { images: true }), -3.5, 0, 22));
  g.add(trees([...along(9, [-65, 55], [65, 55]), ...along(5, [-65, -55], [65, -55])], { kind: 'neem', seed: 4 }));
  g.add(lampPosts(along(8, [-60, 50], [60, 50])));
}

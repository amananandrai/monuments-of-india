import * as THREE from 'three';
import { M, mat, mesh, box, cyl, at, inst, unitBox } from '../helpers.js';
import { heightField, fbm, smooth } from '../parts/terrain.js';
import { trees, shrubs, asiBoard, scatter, along, benches } from '../parts/realism.js';
import { mergeByMaterial } from '../parts/components.js';
import { BRICK, BRICK_DARK, MUD, DOCK, ACRO, TOWN, BEAD, STREET, LIFT } from '../monuments/lothal.js';
import { detail } from '../detail.js';

const ANCHOR = mat('#8e8577', 0.9), WALL = mat('#e4dccb', 0.9), ROOF = mat('#9b8466', 0.9), SOOT = mat('#2e2620', 0.95), LANE = mat('#b8a47c', 0.97);

// A bathroom of the acropolis: a floor of fired brick s square, sloping to a drain, between thin
// walls on three sides, open towards the lane (+x).
function bath(s) {
  const g = new THREE.Group();
  g.add(box(s, 0.22, s, BRICK, 0, 0, 0), box(0.3, 0.7, s + 0.3, BRICK_DARK, -s / 2, 0, 0));
  for (const k of [-1, 1]) g.add(box(s, 0.5 + 0.2 * (k > 0), 0.3, BRICK_DARK, 0, 0, k * s / 2));
  g.add(box(0.9, 0.2, 0.35, BRICK_DARK, s / 2 + 0.45, 0, s * 0.3));
  return g;
}

// A brick-lined well: a ring of wedge-shaped bricks r in radius standing h above the ground, and
// the dark of its shaft.
function well(r, h) {
  const g = new THREE.Group(), ring = new THREE.CylinderGeometry(r + 0.4, r + 0.45, h, 24, 1, true), inner = new THREE.CylinderGeometry(r, r, h, 24, 1, true).scale(-1, 1, 1);
  g.add(mesh(ring, BRICK, 0, h / 2, 0), mesh(inner, BRICK_DARK, 0, h / 2, 0), mesh(new THREE.RingGeometry(r, r + 0.4, 24).rotateX(-Math.PI / 2), BRICK, 0, h, 0), mesh(new THREE.CircleGeometry(r, 24).rotateX(-Math.PI / 2), SOOT, 0, 0.06, 0));
  return g;
}

// The bead-makers' kiln: round, of two chambers one over the other, the lower sunk for the fire
// and the upper for the stones, joined by four flues; a stoke-hole opens at one side.
function kiln() {
  const g = new THREE.Group();
  g.add(mesh(new THREE.CylinderGeometry(2.3, 2.5, 1.1, 24, 1, true), BRICK_DARK, 0, 0.55, 0), mesh(new THREE.RingGeometry(1.75, 2.3, 24).rotateX(-Math.PI / 2), BRICK, 0, 1.1, 0));
  g.add(mesh(new THREE.CylinderGeometry(1.75, 1.75, 0.5, 24, 1, true).scale(-1, 1, 1), BRICK_DARK, 0, 0.85, 0), cyl(1.75, 1.75, 0.6, BRICK, 0, 0, 0, 24));
  for (let k = 0; k < 4; k++) { const a = Math.PI / 4 + k * Math.PI / 2; g.add(cyl(0.22, 0.22, 0.03, SOOT, Math.cos(a) * 1, 0.6, Math.sin(a) * 1, 10)); }
  g.add(cyl(0.3, 0.3, 0.03, SOOT, 0, 0.6, 0, 10), box(0.8, 0.6, 0.06, SOOT, 0, 0.1, 2.46), box(2.2, 0.5, 0.35, BRICK_DARK, -1.3, 0, 3.6), box(2.2, 0.5, 0.35, BRICK_DARK, 1.3, 0, 3.6), box(0.35, 0.5, 1.3, BRICK_DARK, -2.2, 0, 3), box(0.35, 0.5, 1.3, BRICK_DARK, 2.2, 0, 3));
  return g;
}

// The bead factory: eleven rooms and a store round a central court, and a guardroom by the door;
// the low walls of fired brick. The court is 9 by 8 m; four rooms stand along each long side and
// two at each end.
function beadFactory(R) {
  const list = [], t = 0.5, w = (x, z, sx, sz) => list.push([x, 0, z, sx, 0.45 + R() * 0.5, sz, 0]);
  for (const z of [-8, -4, 4, 8]) w(0, z, 17.5, t);
  for (const x of [-8.5, 8.5]) { w(x, 0, t, 16); w(x * 0.53, 0, t, 8); w(x * 0.76, 0, 4, t); }
  for (const x of [-4.25, 0, 4.25]) for (const z of [-6, 6]) w(x, z, t, 4);
  w(10.2, 6.5, 3.4, t); w(10.2, 3.5, 3.4, t); w(11.9, 5, t, 3.5);
  return inst(unitBox(), list, BRICK);
}

// Lothal, finer detail and setting. From the excavation, the plan and photographs of the site:
// on the acropolis a row of bathrooms, each a brick floor between thin walls, emptying into a
// drain of fired brick that runs along the platform and out over its edge to the dock, with the
// main sewer running south from it; the well of radial bricks, 2.4 m across, beside them; the
// stone anchors found along the wharf; the bead factory in the west of the lower town, rooms
// round a court, and its round kiln; the main street of the bazaar; the cemetery outside the
// wall to the north-west, its graves lined with brick; and the channels from the dock's inlets.
// The plain round it is flat, grazed and planted with neem and babul; the site museum, a low
// building in a garden, stands to the south-west. Dimensions follow js/monuments/lothal.js.
// f: the town; g: the site's own ground (both LIFT above the open land); land: the open land.
export function addDetails(f, g, land, { R }) {
  const { l, w, z: dz } = DOCK, A = ACRO, zw = dz - w / 2, d = new THREE.Group();
  // The baths: a row along the north of the platform, their floors a step above it; the drain
  // behind them, its outfall over the platform's edge and across the wharf to the dock.
  const bx = A.x1 - 13, dx = A.x1 - 9.6, list = [];
  for (let k = 0; k < 9; k++) d.add(at(bath(2.6), bx, A.h, -66 + k * 5.2));
  // Drains: channels of fired brick, two low kerbs and a dark bed between them.
  const drain = (x0, z0, x1, z1, y) => {
    const along = Math.abs(z1 - z0) > Math.abs(x1 - x0), len = Math.abs(along ? z1 - z0 : x1 - x0), cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
    for (const s of [-1, 1]) list.push(along ? [cx + s * 0.4, y, cz, 0.3, 0.3, len, 0] : [cx, y, cz + s * 0.4, len, 0.3, 0.3, 0]);
    d.add(box(along ? 0.5 : len, 0.08, along ? len : 0.5, SOOT, cx, y, cz));
  };
  drain(dx, -70, dx, A.z1, A.h); drain(dx, A.z1 + 0.5, dx, zw - 9, 0); drain(dx, zw - 9, dx, zw, 1.2);
  drain(A.x0, -40, bx - 4, -40, A.h); drain(A.x0 - 62, -40, A.x0 - 0.5, -40, 0);
  d.add(box(1.1, A.h + 0.3, 1.2, BRICK_DARK, dx, 0, A.z1 + 0.6), box(1.2, A.h + 0.3, 1.1, BRICK_DARK, A.x0 - 0.6, 0, -40));
  d.add(inst(unitBox(), list, BRICK_DARK));
  // The ruler's house, the largest on the platform, with its own bath and the drain from it.
  const rh = [];
  for (const [x, z, sx, sz] of [[-34, -52, 7, 0.6], [-34, -45.4, 7, 0.6], [-37.5, -48.7, 0.6, 7.2], [-30.5, -48.7, 0.6, 7.2], [-34, -48.7, 0.5, 6.6]]) rh.push([x, A.h, z, sx, 1.3 + R() * 0.6, sz, 0]);
  d.add(inst(unitBox(), rh, BRICK), box(1.4, 0.25, 1.4, BRICK, -32.2, A.h, -50.4));
  // The well, east of the baths; and the second, at the south end of the dock.
  d.add(at(well(1.2, 0.9), A.x1 - 22, A.h, 8), at(well(1, 0.6), -l / 2 - 6, 0, zw + 4));
  // Stone anchors along the wharf: pierced blocks laid out where they were found.
  const an = [];
  for (let k = 0; k < 14; k++) an.push([-l / 2 + 12 + k * 14 + R() * 4, 1.2, zw - 6 + R() * 3, 0.5, 0.35, 0.4, R() * 3]);
  d.add(inst(unitBox(), an, ANCHOR));
  // The bead factory on the western quarter's platform, and its kiln a little north of it.
  d.add(at(beadFactory(R), BEAD[0], 1.2, BEAD[1]).rotateY(Math.PI / 2), at(kiln(), 22, 0, -152).rotateY(-Math.PI / 2));
  // The main street of the bazaar, and the cross street along the acropolis's north side.
  const S = STREET;
  d.add(box(S.x1 - S.x0, 0.06, S.w, LANE, (S.x0 + S.x1) / 2, 0, S.z), box(8, 0.06, TOWN.z1 - 6 - S.z, LANE, -0.5, 0, (TOWN.z1 - 6 + S.z) / 2));
  f.add(mergeByMaterial(d));
  // The cemetery, outside the wall to the north-west: graves lined with mud brick, lying north
  // to south.
  const graves = [];
  for (let k = 0; k < 14; k++) {
    const x = 88 + (k % 5) * 7 + R() * 2, z = TOWN.z0 - 22 - Math.floor(k / 5) * 6 - R() * 1.5;
    graves.push([x, 0, z - 0.75, 2.6, 0.25, 0.25, 0], [x, 0, z + 0.75, 2.6, 0.25, 0.25, 0], [x - 1.3, 0, z, 0.25, 0.25, 1.75, 0], [x + 1.3, 0, z, 0.25, 0.25, 1.75, 0]);
  }
  g.add(inst(unitBox(), graves, MUD));
  // The plain: flat, the site standing a little above it on its own silt (and LIFT above the
  // open land), falling away gently on every side.
  land.add(heightField(3000, 3000, detail.low ? 100 : 150, (x, z) => (Math.abs(x) < 480 && z > -400 && z < 480 ? -3 : LIFT * smooth(1100, 620, Math.hypot(x, z)) - 0.75 + 3 * fbm(x, z, { scale: 0.002, octaves: 3 }) * smooth(600, 1000, Math.hypot(x, z))), { cover: '#ab9a70', rock: ['#a1916c'], steep: 0.6 }));
  // Paths, the board and benches for visitors: from the museum to the entrance in the south wall,
  // and along the wharf.
  const gz = TOWN.gate;
  g.add(box(70, 0.05, 3, M.path, TOWN.x0 - 38, 0, gz), box(3, 0.05, 60, M.path, TOWN.x0 - 72, 0, gz - 30), box(3, 0.05, zw - 12 - gz, M.path, TOWN.x0 - 12, 0, (zw - 12 + gz) / 2));
  g.add(asiBoard('Lothal', TOWN.x0 - 14, gz + 6, -Math.PI / 2, { line2: 'EXCAVATED SITE' }));
  g.add(benches([[TOWN.x0 - 14, gz - 12, -Math.PI / 2], [TOWN.x0 - 14, gz + 22, -Math.PI / 2]]));
  // The site museum, south-west of the town, in its garden.
  const mus = new THREE.Group();
  mus.add(box(34, 5, 16, WALL, 0, 0, 0), box(36, 0.5, 18, ROOF, 0, 5, 0), box(10, 3.5, 4, WALL, 0, 0, 9.5), box(11, 0.35, 5, ROOF, 0, 3.5, 9.5));
  g.add(at(mus, TOWN.x0 - 74, 0, gz - 78));
  g.add(trees(along(6, [TOWN.x0 - 100, gz - 50], [TOWN.x0 - 48, gz - 50]), { kind: 'ashoka', seed: 3 }));
  // Neem round the site, babul and khejri out on the plain; scrub between.
  const away = ([x, z]) => !(x > TOWN.x0 - 110 && x < l / 2 + 96 && z > TOWN.z0 - 50 && z < dz + w / 2 + 96);
  g.add(trees(scatter(34, [-380, 380, -330, 300], { seed: 5, gap: 24 }).filter(away), { kind: 'neem', seed: 5 }));
  g.add(trees(scatter(40, [-470, 470, -400, 470], { seed: 8, gap: 30 }).filter(away), { kind: 'babul', seed: 8 }));
  g.add(trees(scatter(16, [-470, 470, -400, 470], { seed: 11, gap: 40 }).filter(away), { kind: 'khejri', seed: 11 }));
  g.add(shrubs(scatter(90, [-420, 420, -380, 330], { seed: 13, gap: 7 }).filter(away), { dry: true }));
}

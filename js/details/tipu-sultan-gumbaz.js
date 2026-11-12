import * as THREE from 'three';
import { M, mat, box, cyl, at, onFace, FACES, aroundRect, guldasta, archWall, hemi, inst, unitBox } from '../helpers.js';
import { chhajja, railing, petalRing, windowFrame, archRing, jali, merlons, beltCourse, mergeByMaterial } from './components.js';
import { doorLeaves, interior } from './doorways.js';
import { shrubs, lampPosts, asiBoard, scatter, along } from './realism.js';

// Tipu Sultan's Gumbaz, finer detail. From photographs: the polished black granite pillars of the
// verandah stand on moulded bases under square capitals, with a cusped arch between each pair;
// a deep eave runs round the roof under a balustrade; the tomb's walls open in a door (its famous
// ivory-inlaid leaves) and screened windows; the dome rises from a cup of lotus petals.
// Steps climb the plinth on all four sides; the Masjid-e-Aksa stands west of the tomb, three
// arches between two minarets; the graves of Tipu's family and officers lie in rows on a low
// platform to the east; and a gateway closes the far end of the cypress avenue.
// Dimensions follow js/monuments/tipu-sultan-gumbaz.js.
const WHITE = mat('#efebe2', 0.8), GRANITE = mat('#3e3b39', 0.7), IVORY = mat('#6b4a33', 0.6);
function architecture(f) {
  const d = new THREE.Group(), pts = aroundRect(28, 28, 3.1);
  for (const [x, z] of pts) d.add(box(1.4, 0.5, 1.4, GRANITE, x, 2, z), box(1.4, 0.45, 1.4, GRANITE, x, 11.55, z));
  // A cusped arch between neighbouring pillars along each side (pillars 3.1 apart from -14).
  for (const a of FACES) for (let k = 0; k < 9; k++) {
    const lat = -14 + 1.55 + k * 3.1;
    if (lat > 13.5) continue;
    d.add(onFace(at(archRing(2.05, 9.4, true, 0.18, 0.2, WHITE, false), 0, 2, 0), a, 14 - 0.1, lat));
  }
  for (const a of FACES) {
    d.add(onFace(at(chhajja(31.6, 1.4, 0.55, 0.14, WHITE), 0, 12.8, 0), a, 15.4));
    d.add(onFace(at(railing(30, 1, 0.24, WHITE, 2), 0, 12.8, 0), a, 15.1));
    if (a === 0) continue;
    for (const lat of [-5, 5]) d.add(onFace(at(windowFrame(1.6, 3.2, WHITE, { screen: jali(WHITE) }), 0, 4.6, 0), a, 10, lat));
  }
  // The door on the front (+z) face, its dark leaves standing open.
  d.add(at(interior(2.58, 4.38, 0.15, 0.1), 0, 2, 10.04), at(windowFrame(2.6, 4.4, WHITE, { shape: 'flat', back: M.recess }), 0, 2, 10));
  d.add(at(doorLeaves(2.6, 4.3, { open: 1.2, m: IVORY }), 0, 2.02, 10.1));
  d.add(at(petalRing(7.6, 24, 3.2, 2, 0.6, WHITE), 0, 12.8, 0));
  // The plinth (34 square, 2 high): a moulding under its edge, and four steps up each side.
  d.add(beltCourse(34, 34, 1.5, 0.35, 0.15, WHITE));
  for (const a of FACES) for (let k = 0; k < 4; k++) d.add(onFace(box(8, 0.48 * (4 - k), 0.6, WHITE, 0, 0, 0), a, 17.3 + k * 0.6));
  mergeByMaterial(d);
  f.add(d);
  // Beside the tomb, outside the framed group so the home view stays on it.
  const s = new THREE.Group();
  // Masjid-e-Aksa at (-40, 0): 20 × 7 × 11 on a low plinth, facing the tomb.
  const mq = at(new THREE.Group(), -40, 0, 0);
  mq.rotation.y = Math.PI / 2;
  mq.add(box(24, 0.8, 15, WHITE), box(20, 7, 11, WHITE, 0, 0.8, -1), box(20.6, 0.5, 11.6, WHITE, 0, 7.8, -1));
  for (let k = -1; k <= 1; k++) mq.add(at(windowFrame(3, 5, WHITE), k * 5.4, 1, 4.51));
  mq.add(at(merlons(19.4, 0.5, 0.7, 0.25, WHITE, 0.6), 0, 8.3, 4.2));
  // Windows on its other three sides, so none is a bare wall.
  const body = at(new THREE.Group(), 0, 0.8, -1);
  for (const [ang, len, dist] of [[Math.PI, 20, 5.5], [Math.PI / 2, 11, 10], [-Math.PI / 2, 11, 10]]) {
    const n = Math.round(len / 5.5);
    for (let k = 0; k < n; k++) body.add(onFace(at(windowFrame(1.6, 3.4, WHITE, { screen: jali(WHITE) }), 0, 1.6, 0), ang, dist + 0.01, -len / 2 + (k + 0.5) * (len / n)));
  }
  mq.add(body);
  for (const x of [-11, 11]) mq.add(at(guldasta(15, 0.75, WHITE), x, 0.8, 4.5));
  s.add(mq);
  // The graves, east of the tomb: a platform 16 × 22 with three rows of plain cenotaphs.
  const graves = [];
  for (let i = 0; i < 3; i++) for (let j = 0; j < 6; j++) graves.push([36 + i * 4.4, 0.6, -9 + j * 3.6, 1, 0.7, 2.2]);
  s.add(box(16, 0.5, 23, WHITE, 40.4, 0.1, 0), inst(unitBox(), graves, WHITE), inst(unitBox(), graves.map(([x, y, z]) => [x, y + 0.7, z, 0.6, 0.3, 1.8]), GRANITE));
  // The gateway at the end of the avenue (z = 94): an arch through a block 16 × 9 × 6.
  s.add(at(archWall(16, 9, 6, 4.4, 6.6, true, WHITE), 0, 0, 94), box(16.6, 0.5, 6.6, WHITE, 0, 9, 94), at(merlons(15.4, 0.5, 0.7, 0.25, WHITE, 0.6), 0, 9.5, 96.7));
  for (const x of [-8, 8]) s.add(at(guldasta(11.5, 0.6, WHITE), x, 0, 97));
  f.parent.add(mergeByMaterial(s));
}

// The Gumbaz at Srirangapatna, Tipu Sultan's mausoleum: flower beds along the cypress avenue,
// lamps, and the ASI board.
export function addDetails(f, g) {
  architecture(f);
  // A few flowering bushes by the gate, and a handful of shrubs on the lawn.
  g.add(shrubs([[-6.5, 80], [6.5, 80], [-6.5, 86], [6.5, 86]].map(([x, z]) => [x, z, 1.3]), { flowers: '#d0306f', seed: 3 }));
  g.add(shrubs(scatter(30, [-80, 80, -80, 80], { seed: 4, gap: 8, avoid: [[-22, 22, -22, 22], [-14, 14, 15, 90]] }).slice(0, 6).map(([x, z]) => [x, z, 2.2]), { seed: 4 }));
  g.add(lampPosts([...along(5, [-13, 25], [-13, 80]), ...along(5, [13, 25], [13, 80])]));
  g.add(asiBoard('Gumbaz, Srirangapatna', 8, 86, 0));
}

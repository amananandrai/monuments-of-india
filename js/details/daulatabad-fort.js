import * as THREE from 'three';
import { M, mat, box, cyl, at, onFace, hemi, finial, archWall, inst, unitBox, unitCyl, surface } from '../helpers.js';
import { bracketGeo, placeAll, aroundCircle, railingRing, windowFrame, mergeByMaterial } from './components.js';
import { towerDetail, rampart, bastionCrowns } from './forts.js';
import { arcadeSkin, cellRow } from './mughal.js';
import { trees, shrubs, asiBoard, scatter } from './realism.js';

// Daulatabad, finer detail. From photographs of the Chand Minar: each of its three balconies rests
// on a ring of carved brackets and is closed by a railing, and each stage opens in small arched
// windows; the glazed tile bands are kept from the builder. The gate's towers are banded and slit,
// and merlons crest the rings of wall up the hill. The outer wall on the plain is crested with
// merlons between round bastions; a narrow bridge crosses the moat to the mouth of the tunnel cut
// in the scarp, the only way up; inside the outer wall stand the Bharat Mata temple (the old Jami
// Masjid: a court before a prayer hall on rows of pillars) and the ruined Chini Mahal, once faced
// in blue tiles; and the white Baradari stands on the hill below the summit.
// Dimensions follow js/monuments/daulatabad-fort.js.
const WHITE = mat('#e4ddd0', 0.85), TILE_ = surface(mat('#3f78a8', 0.5), 'none');
const STONE = mat('#8e8172', 0.9), SAND = mat('#c9b48a', 0.85);
function architecture(f) {
  const ga = 1.2;
  const d = new THREE.Group(), cm = at(new THREE.Group(), 40, 0, 96);
  let y = 2;
  [[3, 2.6, 12], [2.5, 2.1, 9], [2, 1.6, 7]].forEach(([r0, r1, h], i) => {
    for (let k = 0; k < 4; k++) {
      const a = ((k + 0.5) / 4) * Math.PI * 2 + i * 0.4, wy = y + h * 0.3, r = r0 + ((r1 - r0) * 0.45);
      cm.add(onFace(at(windowFrame(0.55, 1.5, STONE, { shape: 'pointed', frame: 0.1 }), 0, wy, 0), a, r + 0.02));
    }
    y += h;
    cm.add(placeAll(bracketGeo(0.9, r1 * 0.55, 0.25), aroundCircle(r1, 12, y - 0.7), STONE));
    cm.add(at(railingRing(r1 * 1.66, 0.9, STONE), 0, y, 0));
  });
  d.add(cm);
  // The gate's towers (r = 3.8, seg 16), in the gate's frame.
  const gate = new THREE.Group();
  gate.position.set(Math.cos(ga) * 130, 0, Math.sin(ga) * 130);
  gate.rotation.y = Math.PI / 2 - ga;
  for (const s of [-1, 1]) gate.add(at(towerDetail(4.1, 3.8, 11, STONE, STONE, { n: 8, courses: [], slits: [0.3, 0.72] }), s * (7 + 3.8 * 0.45), 0, 4 - 3.8 * 0.6));
  d.add(gate);
  // The outer wall (r = 130, 2.6 thick, 7 high, open at the gate at angle 1.2): battlements, and a
  // round bastion every 36 degrees or so, crowned.
  const wallSegs = [], towers = [], N = 150;
  for (let k = 0; k < N; k++) {
    const a = ga + ((k + 0.5) / N) * Math.PI * 2;
    if (Math.abs(Math.atan2(Math.sin(a - ga), Math.cos(a - ga))) < 0.08) continue;
    wallSegs.push([Math.cos(a) * 130, 0, Math.sin(a) * 130, (Math.PI * 2 * 130) / N + 0.1, 7, 2.6, Math.atan2(-Math.cos(a), -Math.sin(a))]);
  }
  for (let k = 1; k < 10; k++) { const a = ga + (k / 10) * Math.PI * 2; towers.push([Math.cos(a) * 131.5, 0, Math.sin(a) * 131.5, 9, 9.5, 9]); }
  const site = f.parent;
  site.add(rampart(wallSegs, STONE, { size: 0.8, kerb: false }), inst(unitCyl(14), towers, STONE), bastionCrowns(towers.map(([x, , z]) => [x, 9.5, z, 4.5]), STONE, { size: 0.8, seg: 14 }));
  // The bridge over the moat and the tunnel's mouth in the scarp, on the side towards the gate.
  const way = new THREE.Group();
  way.rotation.y = Math.PI / 2 - ga;
  way.add(box(3.4, 0.6, 16, STONE, 0, 1.6, 68), box(3.4, 1.6, 1.2, STONE, 0, 0, 62), box(3.4, 1.6, 1.2, STONE, 0, 0, 74));
  for (const s of [-1, 1]) way.add(box(0.3, 0.8, 16, STONE, s * 1.55, 2.2, 68));
  way.add(box(3, 3.4, 0.3, M.recess, 0, 2.2, 60.2), box(4.2, 0.6, 0.8, STONE, 0, 5.6, 60.4), box(0.6, 3.4, 0.8, STONE, -1.8, 2.2, 60.4), box(0.6, 3.4, 0.8, STONE, 1.8, 2.2, 60.4));
  d.add(way);
  // The Bharat Mata temple at (-6, 104): a walled court 34 × 30 and, across its west end, the
  // prayer hall open to the court in a row of arches, on rows of plain pillars, under a flat roof.
  const bm = at(new THREE.Group(), -6, 0, 104);
  for (const s of [-1, 1]) bm.add(box(34, 4, 0.8, STONE, 0, 0, s * 15), box(0.8, 4, 30, STONE, 17 * (s > 0 ? 1 : -1), 0, 0));
  bm.add(box(10, 6, 29.2, STONE, -11.6, 0, 0), box(10.6, 0.5, 29.8, STONE, -11.6, 6, 0));
  const hall = arcadeSkin(29.2, 6, cellRow(7, 4, 0.2, 2.8, 4.4), 1, STONE, { fill: 'room' });
  hall.position.set(-6.6, 0, 0);
  hall.rotation.y = Math.PI / 2;
  bm.add(hall, cyl(1.6, 1.6, 0.8, STONE, -11.6, 6.5, 0, 16), at(hemi(1.5, STONE, 16), -11.6, 7.3, 0));
  bm.add(at(archWall(6, 6.5, 1.6, 2.6, 4.4, true, STONE), 17, 0, 0).rotateY(Math.PI / 2));
  d.add(bm);
  // The Chini Mahal at (-58, 86): a roofless two-storey range, patches of its blue tiles left.
  const cm2 = at(new THREE.Group(), -58, 0, 86);
  cm2.rotation.y = 0.6;
  cm2.add(at(archWall(22, 9, 1, 2.4, 3.6, true, STONE), 0, 0, 4), box(22, 6.5, 1, STONE, 0, 0, -4), box(1, 7.5, 8, STONE, -10.5, 0, 0), box(1, 5, 8, STONE, 10.5, 0, 0));
  for (const x of [-7, 7]) cm2.add(box(2, 2.6, 0.06, M.recess, x, 5, 4.52), box(2, 3, 0.06, M.recess, x, 0.6, 4.52));
  for (const [x, y, w] of [[-4, 6.6, 3], [3.5, 7, 2.2], [8, 4.2, 1.6]]) cm2.add(box(w, 0.9, 0.06, TILE_, x, y, 4.53));
  d.add(cm2);
  // The Baradari, on the hill below the summit: a white pavilion of arches under a parapet.
  const bd = at(new THREE.Group(), -10, 67, 12);
  bd.rotation.y = 0.5;
  bd.add(box(13, 6, 9, STONE, 0, -6, 0), box(12, 5, 8, WHITE, 0, 0, 0), box(12.5, 0.5, 8.5, WHITE, 0, 5, 0));
  for (const a of [0, Math.PI]) for (let k = -1; k <= 1; k++) bd.add(onFace(box(2.2, 3.4, 0.08, M.recess, 0, 0.5, 0), a, 4.02, k * 3.6));
  for (const a of [Math.PI / 2, -Math.PI / 2]) bd.add(onFace(box(2.2, 3.4, 0.08, M.recess, 0, 0.5, 0), a, 6.02, 0));
  d.add(bd);
  mergeByMaterial(d);
  f.add(d);
}

// Daulatabad: scrub and thorn trees round the foot of the Devagiri hill and between the outer
// walls, and the ASI board.
export function addDetails(f, g) {
  architecture(f);
  const ring = scatter(70, [-125, 125, -125, 125], { seed: 3, gap: 8 }).filter(([x, z]) => { const r = Math.hypot(x, z); return r > 78 && r < 124 && Math.hypot(x - 40, z - 96) > 12 && Math.hypot(x + 6, z - 104) > 26 && Math.hypot(x + 58, z - 86) > 16 && Math.hypot(x - 28, z - 72) > 10; });
  g.add(trees(ring.slice(0, 30), { kind: 'mango', seed: 4, h: 7 }), shrubs(ring.slice(30).map(([x, z]) => [x, z, 2.2]), { dry: true, seed: 5 }));
  g.add(asiBoard('Daulatabad Fort', 52, 132, 0.6));
}

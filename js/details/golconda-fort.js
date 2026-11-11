import * as THREE from 'three';
import { M, mat, box, cyl, at, onFace, hemi, finial, guldasta, archWall, inst, unitBox } from '../helpers.js';
import { archRing, rosette, chhajja, arcadeScreen, mergeByMaterial } from './components.js';
import { towerDetail, rampart, bastionCrowns } from './forts.js';
import { RINGS, ringPoint, hillRadius, hillY, hillSurface } from '../monuments/golconda-fort.js';
import { trees, shrubs, lampPosts, asiBoard, scatter, along } from './realism.js';

// Golconda, finer detail. The granite bastions on every ring of wall are banded and slit, as are
// the towers of the Fateh Darwaza, whose face carries carved medallions in its spandrels; the Bala
// Hissar pavilion's arches are framed in moulded rings under a sloping eave and an arcaded parapet.
// Every bastion is crowned with merlons, as is the stretch of the outer wall beside the gate. The
// long stair climbs from the Fateh Darwaza to the Bala Hissar, through a small gate in each ring
// of wall; and half-way up stands the mosque of Taramati, three arches between two minarets.
// Dimensions follow js/monuments/golconda-fort.js.
const GRANITE = mat('#9a917f', 0.9), TRIM = mat('#b5ac98', 0.9), PAV = mat('#d9d1c0', 0.85);
function architecture(f) {
  const d = new THREE.Group(), H = 60;
  for (const q of RINGS) {
    for (let k = 0; k < 8; k++) { const [x, y, z] = ringPoint(q, (k / 8) * Math.PI * 2 + 0.2); d.add(at(towerDetail(4.6, 4, 10, GRANITE, TRIM, { n: 7, courses: [0.55], slits: [0.3, 0.75] }), x, y - 1, z)); }
  }
  for (const a of [Math.PI / 2 + 0.55, Math.PI / 2 - 0.55]) d.add(at(towerDetail(5, 4.4, 12, GRANITE, TRIM, { n: 8 }), Math.cos(a) * 120, 0, Math.sin(a) * 120));
  for (const s of [-1, 1]) {
    d.add(at(towerDetail(3.67, 3.4, 16, GRANITE, TRIM, { n: 7, courses: [], slits: [0.3, 0.7] }), s * 10.53, 0, 121.96));
    d.add(at(rosette(0.9, TRIM, 12), s * 5.6, 11.2, 124.05));
  }
  // The Bala Hissar pavilion: 20 × 9 × 12 from y = H - 3.
  for (const a of [0, Math.PI]) {
    for (let k = -1; k <= 1; k++) d.add(onFace(at(archRing(4, 6, true, 0.3, 0.1, PAV), 0, H - 2.4, 0), a, 6.26, k * 6));
    d.add(onFace(at(chhajja(20.6, 1.2, 0.45, 0.14, PAV), 0, H + 5.9, 0), a, 6));
    d.add(onFace(at(arcadeScreen(20, 1, 14, 0.7, 0.7, 0.25, PAV), 0, H + 6, 0), a, 5.85));
  }
  for (const a of [Math.PI / 2, -Math.PI / 2]) d.add(onFace(at(chhajja(12.6, 1.2, 0.45, 0.14, PAV), 0, H + 5.9, 0), a, 10));
  // Crowns on the bastions of the three rings and beside the gate, and battlements on the outer
  // wall's two stretches (r = 120, 2.6 thick, 9 high).
  const crowns = [];
  for (const q of RINGS) for (let k = 0; k < 8; k++) { const [x, y, z] = ringPoint(q, (k / 8) * Math.PI * 2 + 0.2); crowns.push([x, y + 9, z, 4]); }
  for (const a of [Math.PI / 2 + 0.55, Math.PI / 2 - 0.55]) crowns.push([Math.cos(a) * 120, 12, Math.sin(a) * 120, 4.4]);
  const segs = [];
  for (const [a0, a1] of [[Math.PI / 2 + 0.07, Math.PI / 2 + 0.55], [Math.PI / 2 - 0.55, Math.PI / 2 - 0.07]]) for (let k = 0; k < 14; k++) {
    const a = a0 + ((k + 0.5) / 14) * (a1 - a0);
    segs.push([Math.cos(a) * 120, 0, Math.sin(a) * 120, (Math.abs(a1 - a0) * 120) / 14 + 0.1, 9, 2.6, Math.atan2(-Math.cos(a), -Math.sin(a))]);
  }
  f.add(bastionCrowns(crowns, GRANITE, { trim: TRIM, size: 0.8, seg: 14 }), rampart(segs, GRANITE, { trim: TRIM, size: 0.8, kerb: false }));
  // The stair from the gate to the summit, straight up the south face (x = 0): stone treads
  // bedded in the rock, and a small gate where it passes each ring of wall.
  const treads = [];
  for (let z = 104; z > 9; z -= 1.3) treads.push([0, hillSurface(0, z) - 0.7, z, 3.6, 1.1, 1.5]);
  f.add(inst(unitBox(), treads, TRIM));
  for (const q of RINGS) {
    const [, y, z] = ringPoint(q, Math.PI / 2);
    d.add(at(archWall(7, 7.5, 3.4, 3, 5, true, GRANITE), 0, y - 0.5, z), box(7.4, 0.5, 3.8, TRIM, 0, y + 7, z));
  }
  // Taramati's mosque, on a terrace beside the stair half-way up.
  const [mx, my, mz] = ringPoint(0.42, Math.PI / 2 - 0.22), mq = at(new THREE.Group(), mx, my, mz);
  mq.rotation.y = -0.2;
  mq.add(box(13, 4, 9, GRANITE, 0, -3.5, 0), box(11, 5, 6, PAV, 0, 0.5, 0), box(11.5, 0.4, 6.5, PAV, 0, 5.5, 0));
  for (let k = -1; k <= 1; k++) mq.add(box(2, 3.4, 0.08, M.recess, k * 3.3, 0.9, 3.03), at(archRing(2, 3.4, true, 0.18, 0.08, PAV), k * 3.3, 0.9, 3.03));
  for (const x of [-5.6, 5.6]) mq.add(at(guldasta(8.5, 0.45, PAV), x, 0.5, 3));
  d.add(mq);
  mergeByMaterial(d);
  f.add(d);
}

// Golconda: babul and neem trees on the plain round the hill and scrub among its boulders, lamps
// along the road in (for the evening sound-and-light show), and the ASI board.
export function addDetails(f, g) {
  architecture(f);
  const plain = scatter(40, [-240, 240, -240, 240], { seed: 3, gap: 16 }).filter(([x, z]) => Math.hypot(x, z) > 125);
  g.add(trees(plain, { kind: 'neem', seed: 3 }));
  const slope = scatter(60, [-120, 120, -120, 120], { seed: 4, gap: 6 }).filter(([x, z]) => { const q = Math.hypot(x, z) / hillRadius(Math.atan2(z, x)); return q > 0.32 && q < 0.86 && !RINGS.some((w) => Math.abs(q - w) < 0.06); });
  // Each bush sits on the slope of the hill.
  g.add(shrubs(slope.map(([x, z]) => [x, z, 2.2, hillSurface(x, z) - 0.3]), { dry: true, seed: 5 }));
  g.add(lampPosts([...along(6, [-7, 128], [-7, 200]), ...along(6, [7, 128], [7, 200])]));
  g.add(asiBoard('Golconda Fort', 14, 150, 0));
}

import * as THREE from 'three';
import { M, mat, box, mesh, at, onFace, curvedBand, photo, hipRoof, kalash, surface } from '../helpers.js';
import { mergeByMaterial } from './components.js';
import { towerDetail, rampart, bastionCrowns } from './forts.js';
import { trees, shrubs, boats, asiBoard, scatter } from './realism.js';

// Bekal Fort, finer detail. The laterite walls are pierced with loopholes at three levels (the fort
// is known for them: the lowest for the nearest targets, the highest for the furthest), with a
// string course along the round wall; the bastions and the observation tower are banded and slit.
// Merlons crest the round wall, the neck walls and the bastions; and the broad ramp by which guns
// were hauled up climbs the observation tower from the landward side. Cannon stand on the
// sea-facing bastions; the vaulted magazine lies south-west of the tower; a paved way leads from the
// gate; and outside the gate stands the small Mukhyaprana temple under its copper roofs.
// Dimensions follow js/monuments/bekal-fort.js: the round wall R = 70, 3 thick, from H = 8 to 15.
const LATERITE = photo(mat('#8f4e36', 0.95), 'laterite'), LATERITE_DARK = photo(mat('#6e3a27', 0.95), 'laterite');
function architecture(f) {
  const d = new THREE.Group(), R = 70, H = 8, from = 5.445, to = 10.26, pts = [];
  for (let k = 0; k <= 120; k++) { const a = from + ((to - from) * k) / 120; pts.push([Math.cos(a) * R, -Math.sin(a) * R, Math.cos(a), -Math.sin(a)]); }
  d.add(curvedBand(pts, 1.48, 1.75, H + 4.1, H + 4.45, LATERITE_DARK));
  for (let k = 0; k < 60; k++) {
    const a = from + ((to - from) * (k + 0.5)) / 60, ang = Math.atan2(Math.cos(a), -Math.sin(a));
    for (const [y, w, h] of [[H + 1.2, 0.5, 0.4], [H + 2.8, 0.3, 0.8], [H + 5.4, 0.3, 0.9]]) {
      if (y < H + 2 && k % 2) continue;
      d.add(onFace(box(w, h, 0.05, M.recess, 0, y, 0), ang, R + 1.51));
    }
  }
  for (let k = 0; k < 8; k++) {
    const a = (k / 7) * Math.PI;
    d.add(at(towerDetail(4.6, 4, 9, LATERITE, LATERITE_DARK, { n: 7, courses: [0.5] }), Math.cos(a) * R, H, -Math.sin(a) * R));
  }
  d.add(at(towerDetail(8, 7, 18, LATERITE, LATERITE_DARK, { n: 10, courses: [0.33, 0.66], slits: [0.15, 0.5, 0.82] }), 0, H, 0));
  for (const s of [-1, 1]) d.add(at(towerDetail(3.24, 3, 11, LATERITE, LATERITE_DARK, { n: 6, courses: [], slits: [0.3, 0.75] }), s * 8.35, H, 124.2));
  // Battlements: the round wall as a run of short lengths, and the two straight walls of the neck
  // (these with slits and a course of their own).
  const arc = [];
  for (let k = 0; k < 90; k++) {
    const a = from + ((to - from) * (k + 0.5)) / 90;
    arc.push([Math.cos(a) * R, H, -Math.sin(a) * R, ((to - from) * R) / 90 + 0.1, 7, 3, Math.atan2(Math.cos(a), -Math.sin(a))]);
  }
  const neck = [-1, 1].map((s) => { const x0 = s * R * 0.69, z0 = R * 0.72, x1 = s * 16, z1 = 120; return [(x0 + x1) / 2, H, (z0 + z1) / 2, Math.hypot(x1 - x0, z1 - z0), 6.97, 3, Math.atan2(-(z1 - z0), x1 - x0)]; });
  f.add(rampart(arc, LATERITE, { size: 0.8, course: false, slits: false, kerb: false }), rampart(neck, LATERITE, { trim: LATERITE_DARK, size: 0.8, centre: [0, 95], kerb: false, boxes: 3 }));
  f.add(bastionCrowns(Array.from({ length: 8 }, (_, k) => { const a = (k / 7) * Math.PI; return [Math.cos(a) * R, H + 9, -Math.sin(a) * R, 4]; }), LATERITE, { trim: LATERITE_DARK, size: 0.8, seg: 14 }));
  f.add(bastionCrowns([[0, H + 19, 0, 8]], LATERITE, { trim: LATERITE_DARK, size: 0.9, seg: 20 }));
  // The ramp up the observation tower: a straight incline from the ground 44 m off, with a low
  // parapet on each side.
  const sh = new THREE.Shape();
  sh.moveTo(0, 0); sh.lineTo(38, 0); sh.lineTo(0, 18); sh.closePath();
  const ramp = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: 5, bevelEnabled: false }).translate(0, 0, -2.5).rotateY(-Math.PI / 2), LATERITE);
  ramp.position.set(0, H, 6.5);
  ramp.castShadow = ramp.receiveShadow = true;
  d.add(ramp);
  for (const s of [-1, 1]) {
    const rail = box(0.5, 0.9, 42.2, LATERITE_DARK, s * 2.25, 0, 0);
    rail.position.set(s * 2.25, H + 9.4, 6.5 + 19);
    rail.rotation.x = Math.atan2(18, 38);
    d.add(rail);
  }
  // Cannon on the sea-facing bastions (their tops at H + 9), each on a timber carriage, its muzzle
  // in an embrasure looking out to sea.
  for (let k = 1; k < 7; k++) {
    const a = (k / 7) * Math.PI, x = Math.cos(a) * R, z = -Math.sin(a) * R, c = cannon();
    c.position.set(x, H + 9, z);
    c.rotation.y = Math.atan2(x, z);
    d.add(c);
  }
  // The magazine, where the powder was kept: a low vaulted store of laterite, half sunk, with a
  // narrow door and a ventilation slit, south-west of the tower.
  const mag = at(new THREE.Group(), -26, H, -24);
  mag.rotation.y = 0.5;
  const vault = mesh(new THREE.CylinderGeometry(3.4, 3.4, 12, 16, 1, false, 0, Math.PI).rotateZ(Math.PI / 2).rotateY(Math.PI / 2), LATERITE_DARK);
  vault.position.y = 2.2;
  mag.add(box(7, 2.2, 12, LATERITE), vault, box(1.1, 1.8, 0.1, M.recess, 0, 0.1, 6.02), box(0.3, 0.8, 0.1, M.recess, 0, 2.6, -6.02));
  d.add(mag);
  // A paved way from the gate to the foot of the tower's ramp.
  d.add(box(5, 0.12, 70, LATERITE_DARK, 0, H, 70));
  mergeByMaterial(d);
  f.add(d);
  // The Mukhyaprana (Hanuman) temple by the way in, outside the gate: a small Kerala shrine on a
  // laterite base, its walls whitewashed, under a two-tiered roof of copper sheet.
  const t = at(new THREE.Group(), 30, H, 128);
  t.rotation.y = -Math.PI / 2;
  t.add(box(9, 1, 9, LATERITE), box(6.4, 3.4, 6.4, mat('#efe9dd', 0.85), 0, 1), box(1.3, 2.3, 0.1, M.recess, 0, 1, 3.22));
  t.add(at(hipRoof(9.2, 9.2, 2.2, COPPER), 0, 4.4, 0), box(4.2, 1.2, 4.2, mat('#efe9dd', 0.85), 0, 5.6), at(hipRoof(5.6, 5.6, 1.8, COPPER), 0, 6.8, 0), at(kalash(0.6), 0, 8.5, 0));
  f.add(t);
}

// A cannon on its carriage, its muzzle towards +z.
const IRON = mat('#2e2d2b', 0.5, 0.6), WOOD = mat('#5a3a24', 0.8);
const COPPER = surface(mat('#b0773f', 0.45, 0.4), 'copper');
function cannon() {
  const g = new THREE.Group();
  g.add(box(1.0, 0.5, 2.0, WOOD, 0, 0.25, 0));
  for (const s of [-1, 1]) g.add(at(mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.16, 12).rotateZ(Math.PI / 2), WOOD), s * 0.6, 0.42, 0.55), at(mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.16, 12).rotateZ(Math.PI / 2), WOOD), s * 0.6, 0.42, -0.6));
  g.add(at(mesh(new THREE.CylinderGeometry(0.2, 0.3, 2.8, 12).rotateX(Math.PI / 2), IRON), 0, 1.0, 0.5), at(mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.2, 12).rotateX(Math.PI / 2), IRON), 0, 1.0, 1.85));
  return g;
}

// Bekal Fort: coconut palms along the shore and on the headland, fishing boats drawn up on the
// beach below the walls and more out at sea, and grass and scrub inside the walls.
export function addDetails(f, g) {
  architecture(f);
  const shore = scatter(40, [-190, 190, 135, 330], { seed: 3, gap: 7, avoid: [[-30, 30, 125, 170]] });
  g.add(trees(shore, { kind: 'palm', seed: 3, y: 0.3 }));
  g.add(trees(scatter(14, [-60, 60, -60, 60], { seed: 4, gap: 10 }).filter(([x, z]) => Math.hypot(x, z) > 14 && Math.hypot(x, z) < 62), { kind: 'palm', seed: 4, y: 8 }));
  g.add(shrubs(scatter(30, [-60, 60, -60, 60], { seed: 5, gap: 5 }).filter(([x, z]) => Math.hypot(x, z) > 12 && Math.hypot(x, z) < 64).map(([x, z]) => [x, z, 2]), { y: 8, seed: 5 }));
  g.add(boats([[-120, 104, 0.3], [-108, 102, 0.1], [95, 104, -0.2], [118, 106, 0.4]], { y: 0.4, size: 1.6 }));
  g.add(boats([[-220, -160, 1.2], [180, -240, 2.1], [260, 40, 0.4], [-300, 60, 2.8], [60, -320, 1.7]], { y: 0.2, size: 2 }));
  g.add(asiBoard('Bekal Fort', 26, 150, 0));
}

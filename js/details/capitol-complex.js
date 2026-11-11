import * as THREE from 'three';
import { mat, at, M, box, cyl, surface, photo } from '../helpers.js';
import { mergeByMaterial } from './components.js';
import { HC } from '../monuments/capitol-complex.js';
import { trees, along } from './realism.js';

// The Capitol Complex, finer detail. From photographs of Le Corbusier's buildings: the great pivoting
// door of the Palace of Assembly, enamelled in Le Corbusier's own design in squares of bright colour;
// the Assembly's side walls screened by a deep egg-crate brise-soleil; and the High Court's front
// shaded by a grid of concrete fins and shelves; the Assembly's glazed front behind its portico and
// the slanted lid of its tower; the Secretariat's joints, blank ends and roof; the Tower of Shadows
// and the Geometric Hill on the esplanade, and the esplanade's paving joints. Dimensions follow js/monuments/capitol-complex.js:
// the Assembly 64 square and 16 high at the origin; the High Court 90 × 18 × 30, turned to face
// south at (60, 0, HC).
const CONCRETE = photo(mat('#b3aea4', 0.95), 'concrete'), CONCRETE_DARK = photo(mat('#8f8a80', 0.95), 'concrete');
const GLASS = surface(mat('#3e4246', 0.4, 0.2), 'none'), JOINT = surface(mat('#77736b', 0.95), 'none');
const ENAMEL = ['#d23a2a', '#f2c230', '#2f5d9a', '#3d8a4f', '#f1ede4', '#1f1f22'].map((c) => mat(c, 0.35));
function architecture(f, g) {
  const d = new THREE.Group();
  // The enamelled door, 8 m square, on the Assembly's front under the portico.
  for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) d.add(new THREE.Mesh(new THREE.BoxGeometry(1.96, 1.96, 0.12), ENAMEL[(i * 3 + j * 2) % ENAMEL.length]).translateX(-3 + i * 2).translateY(1 + j * 2).translateZ(32.06));
  // Egg-crate screens on the Assembly's two sides.
  for (const s of [-1, 1]) {
    for (let k = 0; k <= 20; k++) d.add(new THREE.Mesh(new THREE.BoxGeometry(1.4, 15, 0.3), CONCRETE_DARK).translateX(s * 32.7).translateY(8).translateZ(-30 + k * 3));
    for (let y = 2; y < 16; y += 3.2) d.add(new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.3, 60.3), CONCRETE_DARK).translateX(s * 32.7).translateY(y));
  }
  const hc = at(new THREE.Group(), 60, 0, HC);
  hc.rotation.y = Math.PI;
  for (let k = 0; k <= 30; k++) hc.add(new THREE.Mesh(new THREE.BoxGeometry(0.3, 17.6, 1.6), CONCRETE_DARK).translateX(-44 + k * (88 / 30)).translateY(8.8).translateZ(15.8));
  for (const y of [4.5, 9, 13.5]) hc.add(new THREE.Mesh(new THREE.BoxGeometry(88.3, 0.3, 1.6), CONCRETE_DARK).translateY(y).translateZ(15.8));
  g.add(mergeByMaterial(hc));

  // The Assembly's back, screened like its sides.
  for (let k = 0; k <= 20; k++) d.add(new THREE.Mesh(new THREE.BoxGeometry(0.3, 15, 1.4), CONCRETE_DARK).translateX(-30 + k * 3).translateY(8).translateZ(-32.7));
  for (let y = 2; y < 16; y += 3.2) d.add(new THREE.Mesh(new THREE.BoxGeometry(60.3, 0.3, 1.4), CONCRETE_DARK).translateY(y).translateZ(-32.7));
  // Its front, behind the portico: three floors of square windows set deep in the concrete, either
  // side of the enamelled door.
  for (let i = 0; i < 16; i++) for (let j = 0; j < 3; j++) {
    const x = -30 + i * 4;
    if (Math.abs(x) < 6 && j < 2) continue;
    d.add(box(2.6, 2.6, 0.08, GLASS, x, 2 + j * 4.6, 32.05), box(3, 0.25, 0.5, CONCRETE_DARK, x, 4.6 + j * 4.6, 32.25), box(0.2, 2.6, 0.12, CONCRETE_DARK, x, 2 + j * 4.6, 32.08));
  }
  // The tower over the chamber is cut off at a slant: its lid tilts towards the sun, and carries
  // the sculpted forms of Le Corbusier's roofscape (a crescent and a small upright slab). A
  // footbridge runs from it to the pyramid over the council chamber.
  const lid = at(new THREE.Group(), 6, 36.2, -4);
  lid.rotation.z = -0.16;
  lid.add(cyl(9.9, 9.9, 0.5, CONCRETE_DARK, 0, 0, 0, 40), box(1, 3.4, 4, CONCRETE, -3, 0.5, 1));
  const horn = new THREE.Mesh(new THREE.TorusGeometry(2.6, 0.45, 8, 20, Math.PI), CONCRETE);
  horn.position.set(3, 0.5, -1);
  horn.rotation.y = 0.6;
  lid.add(horn);
  d.add(lid, box(14, 0.6, 1.6, CONCRETE_DARK, -8, 20.4, 4).rotateY(-0.63), box(14, 1, 0.15, CONCRETE, -8, 21, 4.75).rotateY(-0.63));
  // Board marks: the shuttering's lifts show as lines round the tower.
  for (const [y, r] of [[4, 9.3], [8, 8.05], [12, 7.75], [16, 8.25]]) d.add(cyl(r + 0.06, r + 0.06, 0.12, CONCRETE_DARK, 6, 16 + y, -4, 40));

  // The Secretariat (at -105, -125; 254 long, 42 high, 18 deep): it is six blocks in a row, parted
  // by expansion joints that show as full-height piers; its ends are blank concrete with a column
  // of small openings; and the ramp towers are lit by small square windows scattered up their fronts.
  const sec = at(new THREE.Group(), -105, 0, -125);
  for (const x of [-85, -43, 43, 85]) sec.add(box(1.1, 43.2, 21.6, CONCRETE, x, 0, 0));
  for (const sx of [-1, 1]) {
    sec.add(box(0.7, 43.2, 21.2, CONCRETE, sx * 127.2, 0, 0));
    for (let y = 3; y < 40; y += 3.5) sec.add(box(0.1, 1.2, 1.2, GLASS, sx * 127.58, y, (Math.round(y / 3.5) % 2 ? 3 : -3)));
  }
  for (const x of [-70, 58]) for (let k = 0; k < 12; k++) sec.add(box(0.9, 0.9, 0.1, GLASS, x - 3.6 + (k % 3) * 3.6 + (Math.floor(k / 3) % 2) * 1.2, 4 + Math.floor(k / 3) * 10.5 + (k % 3) * 1.6, 19.02));
  // On its roof: the long canteen block and the stair heads.
  sec.add(box(40, 3.2, 8, CONCRETE, -80, 43.2, 0), box(41, 0.4, 9.4, CONCRETE_DARK, -80, 46.4, 0), box(6, 4.4, 6, CONCRETE, 96, 43.2, 2), box(6, 4.4, 6, CONCRETE, 10, 43.2, -2));
  d.add(sec);

  // The Tower of Shadows, between the Assembly and the High Court: an open pavilion 15.5 m square,
  // three of its sides screens of concrete blades and shelves that shade it all day, the north open.
  const tos = at(new THREE.Group(), 70, 0.28, 190);
  for (const [a, open] of [[0, false], [Math.PI / 2, false], [-Math.PI / 2, false], [Math.PI, true]]) {
    const side = new THREE.Group();
    side.rotation.y = a;
    for (const x of [-7.4, 7.4]) side.add(box(0.7, 15, 0.7, CONCRETE, x, 0, 7.4));
    if (!open) {
      for (let k = 1; k < 8; k++) side.add(box(0.18, 14, 1.6, CONCRETE, -7.4 + k * 1.85, 0.5, 7.2));
      for (const y of [3.6, 7.2, 10.8]) side.add(box(14.8, 0.2, 1.6, CONCRETE, 0, y, 7.2));
    }
    tos.add(side);
  }
  tos.add(box(15.6, 0.5, 15.6, CONCRETE, 0, 14.6, 0), box(9, 0.4, 9, CONCRETE_DARK, 0, 9.2, 0), box(17, 0.3, 17, CONCRETE_DARK, 0, -0.1, 0));
  g.add(mergeByMaterial(tos));
  // The Geometric Hill beside it: a grassed mound with a concrete face.
  g.add(cyl(16, 30, 6, M.grass, -30, 0.28, 215, 40), box(20, 5.6, 0.6, CONCRETE, -30, 0.28, 198).rotateX(-0.5));

  // The esplanade is laid in great concrete bays; their joints run across it both ways.
  const joints = new THREE.Group();
  for (let x = -224; x <= 224; x += 16) joints.add(box(0.14, 0.03, 558, JOINT, x, 0.28, 130));
  for (let z = -144; z <= 404; z += 16) joints.add(box(478, 0.03, 0.14, JOINT, 0, 0.281, z));
  joints.traverse((o) => { o.castShadow = false; });
  g.add(mergeByMaterial(joints));

  mergeByMaterial(d);
  f.add(d);
}

// Le Corbusier's Capitol Complex at Chandigarh: the shallow reflecting pools in front of the Palace
// of Assembly, and the rows of trees planted along the edges of the great concrete esplanade.
export function addDetails(f, g) {
  architecture(f, g);
  g.add(box(70, 0.35, 14, M.water, 0, 0, 62), box(14, 0.35, 40, M.water, 60, 0, HC - 60));
  g.add(trees([...along(14, [-230, HC + 70], [230, HC + 70]), ...along(14, [-230, -140], [-230, HC + 50]), ...along(14, [230, -140], [230, HC + 50])], { kind: 'mango', seed: 5 }));
}

import * as THREE from 'three';
import { mat, mesh, box, at, onFace, photo, doubleSided } from '../helpers.js';
import { mergeByMaterial, gableRoof } from '../parts/components.js';
import { classicalDoor, oculus } from '../parts/colonial.js';
import { addDetails } from '../details/st-francis-church-kochi.js';

// St Francis's walls of laterite under lime plaster, washed white; the grey of its cornices and
// trim; the clay tiles of its roof, and the teak of its doors.
export const LIME = photo(mat('#f1ede4', 0.86), 'plaster');
export const TRIM = mat('#c9c4b8', 0.85);
export const TILE = mat('#8c4530', 0.82);
export const TEAK = photo(mat('#5a3a24', 0.7), 'timber');

// The church's measures, shared with js/details/st-francis-church-kochi.js: the nave W wide and
// L long, its walls H high, under a roof RH high; the front's face at z = FZ.
export const P = { W: 15, L: 40, H: 8.6, RH: 5.4, FZ: 20 };

// St Francis Church, Fort Kochi, built by the Portuguese in 1503 and rebuilt in stone about 1516.
// From photographs: a long whitewashed nave under a tiled gable roof, with round-arched windows
// between buttresses down its sides; a lower chancel at the east end; and the front, facing the
// street, a tall screen wall that climbs in steps to a small bell turret of three arched openings,
// each step finished by a cornice, with a stepped pinnacle on either side. A low porch with a
// round arch shelters the door. The front faces +z.
export function buildStFrancisChurchKochi() {
  const g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  const { W, L, H, RH, FZ } = P, z0 = FZ - L / 2;
  // The plinth, the nave and its roof; the chancel behind.
  f.add(box(W + 1.4, 0.5, L + 1.4, TRIM, 0, 0, z0));
  f.add(box(W, H, L, LIME, 0, 0.5, z0), box(W + 0.5, 0.45, L + 0.3, TRIM, 0, 0.5 + H - 0.45, z0 - 0.15));
  f.add(at(gableRoof(W + 2.2, L + 0.6, RH, doubleSided(TILE)), 0, 0.5 + H, z0 - 0.3));
  const cz = z0 - L / 2 - 4.5;
  f.add(box(10, H - 2, 9, LIME, 0, 0.5, cz), box(10.4, 0.4, 9.4, TRIM, 0, 0.5 + H - 2.4, cz));
  f.add(at(gableRoof(12, 9.8, 3.8, doubleSided(TILE)), 0, 0.5 + H - 2, cz));
  // Buttresses down the sides, and a round-arched window between each pair.
  const side = new THREE.Group(), win = classicalDoor(1.5, 3.2, { m: LIME, trim: TRIM, fill: 'glass', top: null, depth: 0.25, frame: 0.3, keystone: false });
  for (const s of [-1, 1]) {
    for (let k = 0; k <= 8; k++) side.add(box(0.8, H - 1.2, 1, LIME, s * (W / 2 + 0.4), 0.5, z0 - L / 2 + 0.6 + k * (L - 1.2) / 8));
    for (let k = 0; k < 8; k++) {
      const z = z0 - L / 2 + 0.6 + (k + 0.5) * (L - 1.2) / 8;
      side.add(at(win.clone(), s * (W / 2 + 0.01), 3.2, z).rotateY(s * Math.PI / 2));
    }
  }
  f.add(mergeByMaterial(side));
  // The front: a screen wall stepping up in four stages, each under a cornice.
  const fr = new THREE.Group(), T = 1, steps = [[W + 1.2, 0, 9.6], [12.4, 9.6, 12.4], [8.6, 12.4, 14.8], [4.6, 14.8, 17.6]];
  for (const [w, y0, y1] of steps) {
    fr.add(box(w, y1 - y0, T, LIME, 0, 0.5 + y0, FZ));
    fr.add(box(w + 0.5, 0.35, T + 0.4, TRIM, 0, 0.5 + y1 - 0.02, FZ));
  }
  // A band at mid-height of the lowest stage, and pilasters at its corners.
  fr.add(box(W + 1.5, 0.3, T + 0.3, TRIM, 0, 0.5 + 4.8, FZ));
  for (const x of [-1, 1]) fr.add(box(0.9, 9.6, T + 0.24, LIME, x * (W / 2 + 0.15), 0.5, FZ));
  // The stepped pinnacles: on the outer corner of each stage a small pier rising over its cornice,
  // capped by a ball.
  for (const [w, , y1] of steps.slice(0, 3)) for (const s of [-1, 1]) {
    fr.add(box(0.7, 1.3, 0.7, LIME, s * (w / 2 - 0.35), 0.5 + y1 + 0.3, FZ));
    fr.add(box(0.9, 0.2, 0.9, TRIM, s * (w / 2 - 0.35), 0.5 + y1 + 1.6, FZ));
    const ball = mesh(new THREE.SphereGeometry(0.28, 10, 6), TRIM, s * (w / 2 - 0.35), 0.5 + y1 + 2.08, FZ);
    fr.add(ball);
  }
  // A cross on the turret.
  fr.add(box(0.22, 1.6, 0.22, TRIM, 0, 0.5 + 17.95, FZ), box(0.9, 0.22, 0.22, TRIM, 0, 0.5 + 18.95, FZ));
  f.add(mergeByMaterial(fr));
  // The windows of the front: two round-arched windows either side of the door, three over it,
  // a round window in the second stage and the three openings of the bell turret.
  const fw = new THREE.Group(), front = (o, y, x) => fw.add(onFace(at(o, 0, 0.5 + y, 0), 0, FZ + T / 2, x));
  const fwin = classicalDoor(1.3, 2.6, { m: LIME, trim: TRIM, fill: 'glass', top: null, depth: 0.2, frame: 0.28, keystone: false });
  for (const x of [-4.6, 4.6]) front(fwin.clone(), 1.6, x);
  for (const x of [-3.2, 0, 3.2]) front(fwin.clone(), 6, x);
  front(oculus(0.8, { m: LIME, trim: TRIM, frame: 0.25 }), 11, 0);
  const bell = classicalDoor(0.8, 1.6, { m: LIME, trim: TRIM, fill: 'room', top: null, depth: 0.3, frame: 0.18, keystone: false });
  for (const x of [-1.25, 0, 1.25]) front(bell.clone(), 15.4, x);
  f.add(mergeByMaterial(fw));
  // The porch before the door: a vaulted box with a round arch, under a little tiled gable.
  const po = new THREE.Group(), pz = FZ + T / 2;
  po.add(box(5.4, 0.3, 4.2, TRIM, 0, 0.5, pz + 2.1));
  for (const s of [-1, 1]) po.add(box(1, 4.4, 4, LIME, s * 2.2, 0.8, pz + 2));
  po.add(box(5.4, 1.4, 4, LIME, 0, 5.2 - 0.01, pz + 2), box(5.8, 0.3, 4.3, TRIM, 0, 6.58, pz + 2.1));
  po.add(at(gableRoof(6.2, 4.4, 1.6, doubleSided(TILE)), 0, 6.88, pz + 2.2));
  po.add(onFace(at(classicalDoor(3.4, 4.4, { m: LIME, trim: TRIM, fill: 'room', top: null, depth: 0.3, frame: 0.6, keystone: true }), 0, 0.8, 0), 0, pz + 4.02));
  po.add(onFace(at(classicalDoor(2, 3.6, { m: LIME, trim: TRIM, leafM: TEAK, top: null, depth: 0.3, frame: 0.3 }), 0, 0.5, 0), 0, pz + 0.01));
  f.add(mergeByMaterial(po));
  addDetails(f, g);
  // From the south-west, across the church's green, the front catching the light.
  return { group: g, focus: f, view: [0.75, 0.3, 1], zoom: 0.95 };
}

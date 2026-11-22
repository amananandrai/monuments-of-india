import * as THREE from 'three';
import { mat, mesh, box, cyl, at, onFace, hipRoof, photo, FACES } from '../helpers.js';
import { mergeByMaterial, windowFrame, jali } from '../parts/components.js';
import { classicalDoor } from '../parts/colonial.js';
import { addDetails } from '../details/paradesi-synagogue.js';

// The synagogue's walls of laterite under lime, washed white; the blue-grey of its trim; the
// clay tiles of its roofs; teak for its shutters and doors.
export const LIME = photo(mat('#f2efe6', 0.86), 'plaster');
export const TRIM = mat('#8da3b3', 0.8);
export const TILE = mat('#8c4630', 0.82);
export const TEAK = photo(mat('#5d3c25', 0.7), 'timber');
const DIAL = mat('#f7f4ea', 0.6), HAND = mat('#1d1d1f', 0.6);

// The measures, shared with js/details/paradesi-synagogue.js: the sanctuary W × D, its walls H
// high; the entrance block before it, to z = FZ; the clock tower T square at (TX, TZ).
export const P = { W: 11, D: 20, H: 7, FZ: 17, T: 4.2, TX: 7.3, TZ: 14.8 };

// A clock face d across standing proud of a wall's face at z = 0: a white dial in a dark ring, its
// twelve marks and two hands.
function clockFace(d) {
  const g = new THREE.Group(), r = d / 2;
  const ringM = cyl(r + 0.1, r + 0.1, 0.08, TRIM, 0, 0, 0, 28); ringM.rotation.x = Math.PI / 2; ringM.position.z = 0.04;
  const dial = cyl(r, r, 0.06, DIAL, 0, 0, 0, 28); dial.rotation.x = Math.PI / 2; dial.position.z = 0.1;
  g.add(ringM, dial);
  for (let k = 0; k < 12; k++) { const a = (k / 12) * Math.PI * 2, m = box(0.05, 0.14, 0.02, HAND, Math.sin(a) * r * 0.82, Math.cos(a) * r * 0.82 - 0.07, 0.14); m.rotation.z = -a; g.add(m); }
  const h1 = box(0.06, r * 0.5, 0.02, HAND, 0, 0, 0.15); h1.rotation.z = -0.9; const h2 = box(0.05, r * 0.75, 0.02, HAND, 0, 0, 0.16); h2.rotation.z = 2.4;
  g.add(h1, h2);
  return g;
}

// The Paradesi Synagogue, Jew Town, Kochi, 1568. From photographs: a whitewashed sanctuary under a
// steep hipped roof of clay tiles, lit by tall windows with blue-grey frames; before it a lower
// entrance block with its own tiled roof; and at its corner on Synagogue Lane the clock tower of
// 1760, about 14 m high: a plain white shaft, a stage with a clock on each face, an open belfry and
// a tiled pyramid roof with a small finial. The lane runs up to the tower from +z.
export function buildParadesiSynagogue() {
  const g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  const { W, D, H, FZ, T, TX, TZ } = P, bz = FZ - 6;
  // The plinth; the sanctuary, its cornice and its roof.
  f.add(box(W + 1, 0.5, D + 1, TRIM, 0, 0, 0));
  f.add(box(W, H, D, LIME, 0, 0.5, 0), box(W + 0.5, 0.35, D + 0.5, TRIM, 0, 0.5 + H - 0.35, 0));
  f.add(at(hipRoof(W + 2.6, D + 2.6, 3.8, TILE), 0, 0.5 + H, 0));
  // The entrance block before it: a wider, lower range of two storeys.
  f.add(box(W + 5, 5.4, 12, LIME, -1.5, 0.3, bz), box(W + 5.5, 0.3, 12.5, TRIM, -1.5, 5.4, bz));
  f.add(at(hipRoof(W + 7.4, 14.4, 2.4, TILE), -1.5, 5.7, bz));
  // The clock tower, at the corner on the lane.
  const t = new THREE.Group(), y1 = 6.2, y2 = 9.4, y3 = 11.2;
  t.add(box(T + 0.6, 0.6, T + 0.6, TRIM, 0, 0, 0), box(T, y1, T, LIME, 0, 0.5, 0), box(T + 0.4, 0.3, T + 0.4, TRIM, 0, y1 + 0.2, 0));
  t.add(box(T - 0.3, y2 - y1 - 0.5, T - 0.3, LIME, 0, y1 + 0.5, 0), box(T + 0.3, 0.3, T + 0.3, TRIM, 0, y2, 0));
  // The belfry: four piers and a beam round an open stage, the bell hanging in it.
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) t.add(box(0.6, y3 - y2 - 0.3, 0.6, LIME, sx * (T / 2 - 0.45), y2 + 0.3, sz * (T / 2 - 0.45)));
  t.add(box(T - 0.2, 0.3, T - 0.2, TRIM, 0, y3 - 0.3, 0), box(T - 0.6, 0.1, T - 0.6, TRIM, 0, y2 + 0.28, 0));
  t.add(mesh(new THREE.CylinderGeometry(0.22, 0.42, 0.6, 14, 1, true), mat('#9a7a3a', 0.4, 0.7), 0, y3 - 0.7, 0));
  t.add(at(hipRoof(T + 1.4, T + 1.4, 2, TILE), 0, y3, 0), at(cyl(0.04, 0.12, 0.7, TRIM, 0, 0, 0, 8), 0, y3 + 1.95, 0));
  for (const a of FACES) t.add(onFace(at(clockFace(1.5), 0, y1 + 1.75, 0), a, T / 2 - 0.15));
  // Small arched windows down the shaft, on the lane's face.
  const tw = classicalDoor(0.6, 1.2, { m: LIME, trim: TRIM, fill: 'glass', top: null, depth: 0.15, frame: 0.15, keystone: false });
  for (const a of [0, Math.PI / 2]) for (const y of [1.6, 4]) t.add(onFace(at(tw.clone(), 0, y, 0), a, T / 2 + 0.01));
  f.add(at(mergeByMaterial(t), TX, 0, TZ));
  // Tall windows down the sanctuary's sides, in blue-grey frames under lattice transoms.
  const win = windowFrame(1.3, 3.2, TRIM, { shape: 'flat', screen: jali(TRIM), frame: 0.22 }), ws = new THREE.Group();
  for (const s of [-1, 1]) for (let k = 0; k < 4; k++) ws.add(onFace(at(win.clone(), 0, 2.4, 0), s * Math.PI / 2, W / 2 + 0.01, -7.5 + k * 3.8 - (s < 0 ? 0 : 0)));
  for (const lat of [-3, 3]) ws.add(onFace(at(win.clone(), 0, 2.4, 0), Math.PI, D / 2 + 0.01, lat));
  // The entrance block's windows on both storeys, and its door on the lane.
  const sw = windowFrame(1, 1.4, TRIM, { shape: 'flat', screen: jali(TEAK), frame: 0.18 });
  for (const x of [-6.5, -3, 0.5]) for (const y of [1.2, 3.5]) ws.add(onFace(at(sw.clone(), 0, y, 0), 0, bz + 6.01, x));
  for (const z of [-3, 0, 3]) for (const y of [1.2, 3.5]) ws.add(onFace(at(sw.clone(), 0, y, 0), -Math.PI / 2, W / 2 + 4.01, bz + z));
  ws.add(onFace(at(classicalDoor(1.6, 2.6, { m: LIME, trim: TRIM, leafM: TEAK, shape: 'flat', top: 'cornice', depth: 0.25, frame: 0.25 }), 0, 0.3, 0), 0, bz + 6.01, 3.6));
  f.add(mergeByMaterial(ws));
  addDetails(f, g);
  // From up the lane, the clock tower at its end.
  return { group: g, focus: f, view: [0.45, 0.42, 1], zoom: 0.75 };
}

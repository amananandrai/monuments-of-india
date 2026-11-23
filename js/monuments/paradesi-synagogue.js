import * as THREE from 'three';
import { mat, box, at, onFace, hipRoof, photo } from '../helpers.js';
import { mergeByMaterial, windowFrame, jali, louvredShutter } from '../parts/components.js';
import { classicalDoor } from '../parts/colonial.js';
import { addDetails, towerDress, lantern } from '../details/paradesi-synagogue.js';

// The synagogue's walls of laterite under lime, washed white; the blue-grey of its plinths; the
// clay tiles of its roofs; teak for its doors; the blue-green paint of its shutters and lattices;
// the dark timber of its eaves; the red oxide of the dado along the lane.
export const LIME = photo(mat('#f2efe6', 0.86), 'plaster');
export const TRIM = mat('#8da3b3', 0.8);
export const TILE = mat('#8c4630', 0.82);
export const TEAK = photo(mat('#5d3c25', 0.7), 'timber');
export const TEAL = mat('#4f8d96', 0.7);
export const EAVE = mat('#3a2c22', 0.85);
export const OXIDE = mat('#7d2f26', 0.85);

// The measures, shared with js/details/paradesi-synagogue.js: the sanctuary W × D, its walls H
// high; the entrance block before it, to z = FZ; the clock tower T square at (TX, TZ), its walls
// TH high to the eaves.
export const P = { W: 11, D: 20, H: 7, FZ: 17, T: 6, TX: 6.5, TZ: 14, TH: 9 };

// The Paradesi Synagogue, Jew Town, Kochi, 1568. From photographs: a whitewashed sanctuary under a
// steep hipped roof of clay tiles, lit by tall windows with blue-green shutters; before it a lower
// entrance block with its own tiled roof; and closing Synagogue Lane the clock tower of 1760, 45 ft
// high: a broad white shaft stepping in twice, the clock storey directly under a tiled hip roof on
// deep timber eaves, and on the roof's peak a small timber bell cupola under its own flat cap, with
// a ball finial and a wrought-iron vane. The lane runs up to the tower from +z.
export function buildParadesiSynagogue() {
  const g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  const { W, D, H, FZ, T, TX, TZ, TH } = P, bz = FZ - 6;
  // The plinth; the sanctuary, its cornice and its roof.
  f.add(box(W + 1, 0.5, D + 1, TRIM, 0, 0, 0));
  f.add(box(W, H, D, LIME, 0, 0.5, 0), box(W + 2.2, 0.14, D + 2.2, EAVE, 0, 0.5 + H - 0.1, 0));
  f.add(at(hipRoof(W + 2.6, D + 2.6, 3.2, TILE), 0, 0.5 + H, 0));
  // The entrance block before it: a wider, lower range of two storeys.
  f.add(box(W + 5, 5, 12, LIME, -1.5, 0.3, bz), box(W + 7, 0.14, 14, EAVE, -1.5, 5.2, bz));
  f.add(at(hipRoof(W + 7.4, 14.4, 2.1, TILE), -1.5, 5.3, bz));
  // The clock tower closing the lane: the shaft in three stages, each a hand's breadth narrower,
  // and the hip roof over the clock storey. Its dials, windows and cupola are in the detail file.
  const t = new THREE.Group();
  t.add(box(T + 0.5, 0.25, T + 0.5, LIME, 0, 0, 0), box(T + 0.24, 3.4, T + 0.24, LIME, 0, 0, 0), box(T + 0.12, 2.4, T + 0.12, LIME, 0, 3.4, 0), box(T, TH - 5.8, T, LIME, 0, 5.8, 0));
  t.add(box(T + 2.5, 0.16, T + 2.5, EAVE, 0, TH, 0), at(hipRoof(T + 2.8, T + 2.8, 1.9, TILE), 0, TH + 0.16, 0));
  towerDress(t);
  f.add(at(mergeByMaterial(t), TX, 0, TZ));
  // Tall windows down the sanctuary's sides, in blue-grey frames under lattice transoms.
  const win = windowFrame(1.3, 3.2, TEAL, { shape: 'flat', screen: jali(TEAL), frame: 0.16 }), ws = new THREE.Group();
  for (const s of [-1, 1]) for (let k = 0; k < 4; k++) ws.add(onFace(at(win.clone(), 0, 2.4, 0), s * Math.PI / 2, W / 2 + 0.01, -7.5 + k * 3.8 - (s < 0 ? 0 : 0)));
  for (const lat of [-3, 3]) ws.add(onFace(at(win.clone(), 0, 2.4, 0), Math.PI, D / 2 + 0.01, lat));
  // The entrance block's windows on both storeys, shuttered below and latticed above; its door on
  // the lane, beside the tower, with a lantern on a bracket either side; and the red-oxide dado.
  const sw = windowFrame(1, 1.4, TEAL, { shape: 'flat', screen: jali(TEAL), frame: 0.12 }), sh = louvredShutter(1, 1.4, TEAL);
  const wins = (a, dist, lat) => { ws.add(onFace(at(sw.clone(), 0, 3.3, 0), a, dist, lat), onFace(at(sw.clone(), 0, 1.3, 0), a, dist, lat), onFace(at(sh.clone(), 0, 1.3, 0), a, dist, lat)); };
  for (const x of [-7.6, -4.8, 1.4]) wins(0, bz + 6.01, x);
  for (const z of [-3.6, -1.2]) wins(Math.PI / 2, 6.51, -(bz + z));
  for (const z of [-3.6, 0, 3.6]) wins(-Math.PI / 2, 9.51, bz + z);
  ws.add(onFace(at(classicalDoor(1.5, 2.5, { m: LIME, trim: LIME, leafM: TEAK, shape: 'flat', top: 'cornice', depth: 0.25, frame: 0.2 }), 0, 0.3, 0), 0, bz + 6.01, -1.7));
  ws.add(box(TX - T / 2 + 9.5, 1.1, 0.06, OXIDE, (TX - T / 2 - 9.5) / 2, 0.3, bz + 6.03), box(0.06, 1.1, 6, OXIDE, 6.53, 0.3, bz - 3));
  for (const s of [-1, 1]) ws.add(at(lantern(), -1.7 + s * 1.45, 2.3, bz + 6.02));
  f.add(mergeByMaterial(ws));
  addDetails(f, g);
  // From up the lane, the clock tower at its end.
  return { group: g, focus: f, view: [0.22, 0.2, 1], zoom: 0.6 };
}

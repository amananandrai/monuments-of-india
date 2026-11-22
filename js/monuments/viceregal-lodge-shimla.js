import * as THREE from 'three';
import { M, mat, photo, mesh, box, cyl, at, inst, unitBox } from '../helpers.js';
import { mergeByMaterial, merlons } from '../parts/components.js';
import { classicalDoor } from '../parts/colonial.js';
import { addDetails } from '../details/viceregal-lodge-shimla.js';

// The Lodge's light blue-grey stone, quarried near Shimla and laid in rough-faced courses; dressed
// grey for its window surrounds, quoins and bands; and its roofs of grey-blue slate.
export const STONE = photo(mat('#9b9d96', 0.9), 'blocks');
export const DRESSED = mat('#b8b9b1', 0.85);
export const SLATE = mat('#565c63', 0.75);

// The building's measures, shared with js/details/viceregal-lodge-shimla.js. From photographs: a
// long main block, L by D, three storeys (FL each) to its eaves at EH under steep slate roofs, with
// gabled bays standing forward on its entrance front (here +z); the tower rises at TX beside the
// entrance to TH, crenellated, a turret at one corner; a kitchen and service wing runs back from
// the east end, lower, on the falling ground.
export const P = { L: 74, D: 22, FL: 4.6, EH: 13.8, RH: 7.5, TX: 6, TW: 11, TH: 30 };

// A pitched roof len long along x over a span d deep, h high: a triangular prism.
export function pitched(len, d, h, m) {
  const s = new THREE.Shape([new THREE.Vector2(-d / 2, 0), new THREE.Vector2(d / 2, 0), new THREE.Vector2(0, h)]);
  return mesh(new THREE.ExtrudeGeometry(s, { depth: len, bevelEnabled: false }).rotateY(Math.PI / 2).translate(-len / 2, 0, 0), m);
}

// A gable wall, w wide and h high, t thick, facing +z: a triangle of stone.
function gableWall(w, h, t, m) {
  const s = new THREE.Shape([new THREE.Vector2(-w / 2, 0), new THREE.Vector2(w / 2, 0), new THREE.Vector2(0, h)]);
  return mesh(new THREE.ExtrudeGeometry(s, { depth: t, bevelEnabled: false }).translate(0, 0, -t), m);
}

// Mullioned windows: on a face along x at z (facing s = ±1), `n` across `len` round cx, on each
// storey from `from`; dark glass, a stone frame and a mullion. Returns [glass, frames] for inst.
function windows(cx, len, n, z, s, floors, out, { w = 1.8, h = 2.4, from = 0 } = {}) {
  for (let fl = from; fl < floors; fl++) for (let k = 0; k < n; k++) {
    const x = cx - len / 2 + (k + 0.5) * (len / n), y = 1.4 + fl * P.FL;
    out.glass.push([x, y, z + s * 0.03, w, h, 0.08]);
    out.frame.push([x, y - 0.25, z + s * 0.12, w + 0.5, 0.25, 0.3], [x, y + h, z + s * 0.12, w + 0.5, 0.3, 0.3], [x, y, z + s * 0.1, 0.16, h, 0.2]);
  }
}

export function buildViceregalLodgeShimla() {
  const g = new THREE.Group(), f = new THREE.Group(), d = new THREE.Group();
  g.add(f);
  const { L, D, FL, EH, RH, TX, TW, TH } = P, fz = D / 2, win = { glass: [], frame: [] };
  // A plinth on the levelled hilltop, and the main block under its ridge roof.
  d.add(box(L + 4, 1, D + 4, DRESSED, 0, 0, 0));
  d.add(box(L, EH, D, STONE, 0, 1, 0));
  for (const y of [1 + FL, 1 + 2 * FL]) d.add(box(L + 0.3, 0.3, D + 0.3, DRESSED, 0, y, 0));
  d.add(box(L + 0.8, 0.5, D + 0.8, DRESSED, 0, 1 + EH, 0), at(pitched(L + 1, D + 1.6, RH, SLATE), 0, 1.5 + EH, 0));
  for (const s of [-1, 1]) d.add(at(gableWall(D, RH - 0.3, 0.6, STONE), s * (L / 2 + 0.25), 1.5 + EH, 0).rotateY(s * Math.PI / 2));
  windows(-20, 30, 7, fz, 1, 3, win); windows(26, 18, 4, fz, 1, 3, win);
  windows(0, L - 6, 15, -fz, -1, 3, win);
  // Gabled bays standing forward on the entrance front, each with a tall gable over its windows.
  for (const [x, w] of [[-28, 10], [-12, 8], [22, 10], [34, 6]]) {
    d.add(box(w, EH + 1.6, 3.4, STONE, x, 1, fz + 1.7), box(w + 0.4, 0.4, 3.8, DRESSED, x, 1 + EH + 1.2, fz + 1.9));
    d.add(at(gableWall(w + 0.4, 5.4, 0.5, STONE), x, 2.6 + EH, fz + 3.4), at(pitched(4.6, w + 1.2, 5.6, SLATE), x, 2.6 + EH, fz + 0.9).rotateY(Math.PI / 2));
    d.add(box(0.8, 1.2, 0.8, DRESSED, x, 7.9 + EH, fz + 3.1));
    windows(x, w - 2, Math.max(1, Math.round(w / 3.4)), fz + 3.4, 1, 3, win, { w: 1.6 });
  }
  // The tower beside the entrance: four storeys more, a crenellated parapet on corbels, and an
  // octagonal turret at its south-west corner rising higher still under a slate spire.
  const tz = fz + 1.5;
  d.add(box(TW, TH - 1, TW, STONE, TX, 1, tz), box(TW + 1, 0.6, TW + 1, DRESSED, TX, TH - 1, tz), box(TW + 0.8, 1.4, TW + 0.8, STONE, TX, TH - 0.4, tz));
  for (const [a, x, z] of [[0, 0, TW / 2 + 0.4], [Math.PI, 0, -TW / 2 - 0.4], [Math.PI / 2, TW / 2 + 0.4, 0], [-Math.PI / 2, -TW / 2 - 0.4, 0]]) d.add(at(merlons(TW + 0.8, 0.9, 1.1, 0.5, STONE, 0.5), TX + x, TH + 1, tz + z).rotateY(a));
  for (let k = 2; k < 6; k++) { const y = 1.4 + k * FL; win.glass.push([TX, y, tz + TW / 2 + 0.03, 1.6, 2.6, 0.08]); win.frame.push([TX, y - 0.25, tz + TW / 2 + 0.12, 2.1, 0.25, 0.3], [TX, y + 2.6, tz + TW / 2 + 0.12, 2.1, 0.3, 0.3]); }
  const ox = TX - TW / 2, oz = tz + TW / 2;
  d.add(cyl(1.9, 1.9, TH + 4, STONE, ox, 1, oz, 8), cyl(2.2, 2.2, 0.5, DRESSED, ox, TH + 5, oz, 8));
  d.add(at(new THREE.Mesh(new THREE.ConeGeometry(2.2, 5.5, 8), SLATE), ox, TH + 8.25, oz), cyl(0.06, 0.06, 4, M.steel, ox, TH + 11, oz, 6));
  // The porch before the entrance at the tower's foot: a stone porte-cochère of round arches,
  // crenellated.
  const pz = tz + TW / 2;
  d.add(box(10, 6, 0.8, STONE, TX, 1, pz + 8.8), box(0.9, 6, 9.6, STONE, TX - 4.55, 1, pz + 4.4), box(0.9, 6, 9.6, STONE, TX + 4.55, 1, pz + 4.4));
  d.add(box(10.8, 1, 10, STONE, TX, 7, pz + 4.6), at(merlons(10.8, 0.8, 0.9, 0.4, STONE, 0.4), TX, 8, pz + 9.4));
  d.add(at(classicalDoor(3, 4.4, { m: STONE, trim: DRESSED, fill: 'room', top: null, depth: 0.3 }), TX, 1, pz + 9.21));
  d.add(at(classicalDoor(2.4, 3.8, { m: STONE, trim: DRESSED, top: null, depth: 0.3 }), TX, 1, pz + 0.01));
  // Tall chimney stacks along the ridge.
  for (const x of [-32, -18, -4, 14, 30]) d.add(box(1.6, 5.5, 1, DRESSED, x, EH + 4, 0), box(2, 0.4, 1.4, DRESSED, x, EH + 9.5, 0));
  // The service wing running back from the east end, a storey lower, on its own ridge.
  const sx = L / 2 - 8, sz = -fz - 17;
  d.add(box(14, EH - FL, 34, STONE, sx, 1, sz), box(14.6, 0.4, 34.6, DRESSED, sx, 1 + EH - FL, sz));
  d.add(at(pitched(34.6, 15, 5.5, SLATE), sx, 1.4 + EH - FL, sz).rotateY(Math.PI / 2), at(gableWall(14, 5.2, 0.5, STONE), sx, 1.4 + EH - FL, sz - 17.2).rotateY(Math.PI));
  for (const s of [-1, 1]) for (let fl = 0; fl < 2; fl++) for (let k = 0; k < 6; k++) {
    const z = sz - 14 + k * 5.6, y = 1.4 + fl * FL, x = sx + s * 7.03;
    win.glass.push([x, y, z, 0.08, 2.2, 1.6]);
  }
  f.add(mergeByMaterial(d), inst(unitBox(), win.glass, M.recess), inst(unitBox(), win.frame, DRESSED));
  addDetails(f, g);
  // From the south-east, over the lawn, the tower and the gables of the entrance front.
  return { group: g, focus: f, view: [0.6, 0.25, 1], zoom: 0.9 };
}

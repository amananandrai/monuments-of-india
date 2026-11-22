import * as THREE from 'three';
import { M, box, cyl, at, archPanel } from '../helpers.js';
import { arcadeSkin, cellRow } from '../parts/mughal.js';
import { merlons, mergeByMaterial } from '../parts/components.js';
import { addDetails, STONE, SHADE, treeJali } from '../details/sidi-saiyyed-mosque.js';

// The Sidi Saiyyed Mosque, Ahmedabad, 1572–73. From photographs: a small prayer hall of yellow
// sandstone, about 22 m long, 11 m deep and 9 m high under a flat roof. Its east front is open in
// five pointed arches between two octagonal turrets left unfinished just over the roof. Its west
// wall is pierced by arched windows high up, filled with stone lattices (jalis): the two either side
// of the middle are the famous ones, a tree whose branches curl into palm fronds and a tangle of
// intertwined branches. The side walls have jali windows too. The model is turned so the west wall,
// the face everyone photographs from the street, looks towards +z; the open front faces -z.
export const L = 22, D = 11, H = 9, P = 1.1;

export function buildSidiSaiyyedMosque() {
  const g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  const S = STONE, Sd = SHADE, d = new THREE.Group();
  d.add(box(L + 4, P, D + 4, Sd, 0, 0, 0), box(L + 4.4, 0.25, D + 4.4, S, 0, P - 0.2, 0));
  // The west wall (+z): five bays, a window high in each but the middle one, which is walled up.
  const wt = 1.2, wins = cellRow(5, L / 5, 3.4, 3.5, 3.7);
  d.add(at(arcadeSkin(L, H, wins.filter((c, k) => k !== 2), wt, S, { trim: Sd, fill: 'none', pointed: true }), 0, P, D / 2 - wt));
  // The side walls, each with two jali windows.
  for (const s of [-1, 1]) {
    const w = at(arcadeSkin(D - 2 * wt, H, cellRow(2, 4, 3.6, 2.6, 3.2), wt, S, { trim: Sd, fill: 'jali' }), s * (L / 2 - wt), P, 0);
    w.rotation.y = s * Math.PI / 2;
    d.add(w);
  }
  // The east front (-z): five open pointed arches.
  d.add(at(arcadeSkin(L, H, cellRow(5, L / 5, 0, 3.2, 6.4), wt, S, { trim: Sd, fill: 'none' }), 0, P, -D / 2 + wt).rotateY(Math.PI));
  // Inside: the dim hall, its back face of the arcades closed by a dark lining, and a row of
  // pillars down the middle under the roof.
  d.add(box(L - 2 * wt, 0.1, D - 2 * wt, Sd, 0, P, 0));
  for (let k = 0; k < 4; k++) d.add(box(0.7, H - 0.1, 0.7, S, -L / 2 + L / 5 * (k + 1), P, 0));
  // The roof: a slab with a moulded edge and a low parapet.
  d.add(box(L + 0.5, 0.7, D + 0.5, S, 0, P + H, 0), box(L + 0.9, 0.25, D + 0.9, Sd, 0, P + H - 0.25, 0));
  for (const s of [-1, 1]) d.add(at(merlons(L, 0.5, 0.7, 0.3, S, 0.3), 0, P + H + 0.7, s * (D / 2 + 0.05)));
  // The two turrets at the front corners, octagonal and buttressed, never finished.
  for (const x of [-L / 2 - 0.6, L / 2 + 0.6]) {
    d.add(cyl(1.4, 1.5, H + 2.6, S, x, P, -D / 2 - 0.3, 8));
    for (const y of [2.2, 5, 7.8]) d.add(cyl(1.62, 1.62, 0.35, Sd, x, P + y, -D / 2 - 0.3, 8));
  }
  f.add(mergeByMaterial(d));
  // The two great jalis, either side of the middle bay, in the west wall's windows.
  for (const [k, kind] of [[1, 'tree'], [3, 'branches']]) {
    const [cx, sill, aw, ah] = wins[k];
    f.add(at(treeJali(aw * 0.99, ah * 0.99, kind), cx, P + sill, D / 2 - wt + 0.35));
  }
  // The hall is dim inside: from the street the lattices show dark behind.
  for (const k of [0, 1, 3, 4]) { const [cx, sill, aw, ah] = wins[k]; f.add(at(archPanel(aw + 0.3, ah + 0.25, true, M.recess, 0.05), cx, P + sill - 0.1, D / 2 - wt - 0.07)); }
  // The other windows of the west wall: geometric jalis.
  for (const k of [0, 4]) {
    const [cx, sill, aw, ah] = wins[k];
    f.add(at(treeJali(aw * 0.99, ah * 0.99, 'lattice'), cx, P + sill, D / 2 - wt + 0.35));
  }
  addDetails(f, g, { L, D, H, P });
  // From the street to the west, the jali windows full on.
  return { group: g, focus: f, view: [0.3, 0.16, 1], zoom: 0.62, target: [0, 6, 0] };
}

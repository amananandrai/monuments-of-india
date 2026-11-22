import * as THREE from 'three';
import { mat, mesh, box, at, inst, unitBox, surface, photo } from '../helpers.js';
import { mergeByMaterial } from '../parts/components.js';
import { detail } from '../detail.js';
import { addDetails } from '../details/bengaluru-airport-t2.js';

// Terminal 2 at Bengaluru (SOM, 2022), the "terminal in a garden". The kerb faces +z. A long, low
// hall 380 m wide stands on a brick-red ground floor under one flat roof 27 m up that reaches 45 m
// forward over the elevated departures road; its ceiling and its slender columns, four canes to a
// cluster, are clad in engineered bamboo. Behind the hall a belt of forest 90 m deep lies between
// it and the long gates building, which two glazed bridges cross to reach. The lattice of the
// ceiling, the hanging planters, the gardens, ponds and aircraft are in
// js/details/bengaluru-airport-t2.js.
export const ROOF_Y = 27, DECK_Y = 8, HALL = [190, -70, 55], GATES_Z = -185;
const BAMBOO = photo(mat('#b47c45', 0.7), 'timber'), BAMBOO_DARK = photo(mat('#8f5f33', 0.75), 'timber');
const ROOF = surface(mat('#d9d8d2', 0.7), 'none'), GLASS = surface(mat('#6d8f96', 0.12, 0.6), 'none'), GLASS_DARK = surface(mat('#2b3b40', 0.15, 0.6), 'none');
const BRICK = surface(mat('#a6533a', 0.9), 'terracotta');

// A cluster column `h` high: four bamboo-clad canes standing close and leaning apart towards the
// ceiling, tied by collars. One geometry, to instance.
export function clusterGeo(h) {
  const g = new THREE.Group(), seg = detail.low ? 6 : 10;
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    const pts = [[0.7, 0], [0.7, h * 0.5], [1.15, h * 0.78], [2.5, h]].map(([r, y]) => new THREE.Vector3(sx * r, y, sz * r));
    g.add(mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), detail.low ? 6 : 12, 0.3, seg, false), BAMBOO));
  }
  for (const t of [0.12, 0.32, 0.52]) g.add(box(1.9, 0.22, 1.9, BAMBOO, 0, h * t, 0));
  g.add(box(2.4, 0.5, 2.4, BAMBOO, 0, 0, 0));
  mergeByMaterial(g);
  return g.children[0].geometry;
}

// The gates building: 660 m long behind the forest belt, the same roof and bamboo ceiling over a
// glazed upper floor and a brick-red ground floor.
function gates() {
  const g = new THREE.Group(), L = 660, W = 40;
  g.add(box(L, 5.5, W, BRICK, 0, 0, 0), box(L + 0.6, 1.6, W + 0.6, GLASS_DARK, 0, 2.2, 0), box(L - 2, 8.5, W - 2, GLASS, 0, 5.5, 0));
  g.add(box(L + 12, 0.5, W + 14, BAMBOO, 0, 14, 0), box(L + 13, 1.5, W + 15, ROOF, 0, 14.5, 0));
  return g;
}

export function buildBengaluruT2() {
  const g = new THREE.Group(), f = new THREE.Group(), [hw, z0, z1] = HALL, zc = (z0 + z1) / 2, d = z1 - z0;
  g.add(f);
  // The hall: the brick-red arrivals floor, and the glazed hall over it from the departures level.
  f.add(box(2 * hw + 4, DECK_Y, d + 4, BRICK, 0, 0, zc), box(2 * hw + 4.6, 2.6, d + 4.6, GLASS_DARK, 0, 2.6, zc), box(2 * hw, ROOF_Y - DECK_Y - 0.5, d, GLASS, 0, DECK_Y, zc));
  // The roof: a bamboo ceiling under a pale deck with a deeper fascia set back from the edge.
  f.add(box(430, 0.5, 182, BAMBOO, 0, ROOF_Y, 9), box(432, 0.9, 184, ROOF, 0, ROOF_Y + 0.5, 9), box(412, 1.7, 164, ROOF, 0, ROOF_Y + 1.4, 9));
  // Cluster columns: two rows across the front on the departures deck (at the kerb's outer edge and
  // before the glass), and a row down each side from the ground.
  const tall = [], side = [];
  for (let x = -207; x <= 207.01; x += 18) tall.push([x, DECK_Y, 93, 1, 1, 1], [x, DECK_Y, 60, 1, 1, 1]);
  for (let z = -66; z <= 42; z += 18) for (const s of [-1, 1]) side.push([s * 205, 0, z, 1, 1, 1]);
  f.add(inst(clusterGeo(ROOF_Y - DECK_Y), tall, BAMBOO), inst(clusterGeo(ROOF_Y), side, BAMBOO));
  // The gates building and the two bridges to it over the forest belt.
  f.add(at(mergeByMaterial(gates()), 0, 0, GATES_Z));
  for (const x of [-95, 95]) f.add(box(13, 5.5, 97, GLASS, x, DECK_Y, -117), box(15, 0.5, 99, BAMBOO_DARK, x, DECK_Y + 5.5, -117), box(15.5, 0.5, 99.5, ROOF, x, DECK_Y + 6, -117), box(13.4, 0.8, 97, BAMBOO_DARK, x, DECK_Y - 0.8, -117));
  addDetails(f, g);
  // The home view: from the gardens before the kerb, the bamboo ceiling and its hanging green.
  return { group: g, focus: f, view: [0.5, 0.05, 1], zoom: 0.085, target: [15, 13, 80], batch: true };
}

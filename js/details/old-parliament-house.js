import * as THREE from 'three';
import { M, mat, box, cyl, at, inst, unitBox, unitCyl, tube, kalash } from '../helpers.js';
import {
  jali, archSlab, archRing, bracketGeo, placeAll, aroundCircle, chhajjaRing, railingRing, chhajja,
  arcadeScreen, mergeByMaterial,
} from './components.js';
import { trees, shrubs, people, lampPosts, vehicles, around } from './realism.js';

// Old Parliament House (Samvidhan Sadan), finer detail (Lutyens and Baker, 1921–27). From
// photographs and descriptions (Wikipedia, the Lok Sabha's Parliament House Estate booklet):
// - the 144 cream sandstone columns of the first-floor verandah, each 8.23 m high, given moulded
//   bases on square plinths and capitals with an abacus, and a pierced balustrade between them;
// - the deep sloping eave (chhajja) that shades the colonnade, on a bracket over every column;
// - a red sandstone jali along the roof in place of the plain parapet;
// - the red ground storey: each window screened with jali between a sill and a lintel, pilasters
//   between the windows and a moulded string course on top;
// - the entrance porches: steps, an arched doorway, paired columns, an eave and a parapet;
// - the Central Hall's drum ringed with screened windows, ribs on its shallow dome and a finial;
//   clerestory windows along the three chambers;
// - the sandstone railing (jali) round the estate, with gate piers.
// Dimensions follow js/monuments/old-parliament-house.js: ground storey to r = 85, columns on
// r = 84.4 from y = 10.8 to 19.8, entablature to r = 86.2 up to y = 21.4.

const CREAM = mat('#d8bf98', 0.82); // the carved cream sandstone
const N = 144;

export function addOldParliamentDetails(f, g) {
  const d = new THREE.Group(), Rd = M.red, Bf = M.buff;
  // Column bases, plinths and capitals, as instances.
  const at144 = (r, y, sx, sy, phase = 0) => aroundCircle(r, N, y, phase).map(([x, yy, z, a]) => [x, yy, z, sx, sy, sx, a]);
  f.add(inst(unitBox(), at144(84.4, 10.8, 1.95, 0.35), CREAM));
  f.add(inst(unitCyl(16), at144(84.4, 11.15, 1.85, 0.45), CREAM));
  f.add(inst(unitCyl(16), at144(84.4, 18.9, 1.7, 0.4), CREAM));
  f.add(inst(unitBox(), at144(84.4, 19.3, 2.0, 0.5), CREAM));
  // The balustrade between the columns, and the eave on its brackets.
  d.add(at(railingRing(84.4, 0.9, CREAM), 0, 10.8, 0));
  d.add(chhajjaRing(86.15, 88.4, 21.35, 0.7, 0.18, CREAM, 288));
  d.add(placeAll(bracketGeo(0.8, 1.6, 0.35), aroundCircle(86.2, N, 20.55), CREAM));
  // The roof jali.
  d.add(at(railingRing(85.6, 1.5, Rd), 0, 21.4, 0));
  // The ground storey: screened windows with sills and lintels, pilasters, a string course.
  const win = aroundCircle(85.2, 72, 0);
  d.add(placeAll(new THREE.BoxGeometry(2.3, 3.8, 0.08).translate(0, 5.5, 0.04), win, jali(M.redLight)));
  d.add(placeAll(new THREE.BoxGeometry(3.0, 0.28, 0.45).translate(0, 3.36, 0.1), win, M.redLight));
  d.add(placeAll(new THREE.BoxGeometry(3.0, 0.5, 0.35).translate(0, 7.6, 0.05), win, M.redLight));
  d.add(placeAll(new THREE.BoxGeometry(1.1, 7.2, 0.3).translate(0, 5.9, 0.05), aroundCircle(85.0, 72, 0, Math.PI / 72), Rd));
  d.add(cyl(85.4, 85.4, 0.3, M.redLight, 0, 9.55, 0, 192));
  // The Central Hall: screened windows round the drum, ribs on the dome and a finial.
  for (const [x, y, z, a] of aroundCircle(18, 24, 21.6)) {
    const w = archSlab(1.6, 3.4, false, M.recess, 0.06), s = archSlab(1.6, 3.4, false, jali(Bf), 0.06), r = archRing(1.6, 3.4, false, 0.18, 0.08, CREAM);
    for (const [o, off] of [[w, -0.03], [s, 0.03], [r, 0.0]]) {
      o.position.set(x + Math.sin(a) * off, y, z + Math.cos(a) * off);
      o.rotation.y = a;
      d.add(o);
    }
  }
  for (let k = 0; k < 16; k++) {
    const a = (k / 16) * Math.PI * 2, pts = [];
    for (let i = 0; i <= 12; i++) {
      const t = (i / 12) * (Math.PI / 2) * 0.93, r = 18.05 * Math.cos(t);
      pts.push([Math.sin(a) * r, 28 + 18.05 * 0.45 * Math.sin(t), Math.cos(a) * r]);
    }
    d.add(tube(pts, 0.22, CREAM, 24, 5));
  }
  d.add(cyl(1.6, 2.2, 0.8, CREAM, 0, 35.9, 0, 24), at(kalash(2.2, CREAM), 0, 36.6, 0));
  // Clerestory windows along the three chambers.
  for (let k = 0; k < 3; k++) {
    const c = new THREE.Group();
    for (const sx of [-1, 1]) for (let i = 0; i < 9; i++) c.add(box(0.1, 1.9, 2.4, M.recess, sx * 15.03, 21.6, 26 + i * 4.75));
    for (const z of [22.98, 67.02]) for (let i = 0; i < 6; i++) c.add(box(2.4, 1.9, 0.1, M.recess, -11.9 + i * 4.75, 21.6, z));
    d.add(c.rotateY((k * 2 * Math.PI) / 3 + Math.PI / 3));
  }
  // The entrance porches.
  for (let k = 0; k < 6; k++) d.add(porch().rotateY((k * Math.PI) / 3));
  f.add(mergeByMaterial(d));

  // The railing round the estate, with gate piers, outside the building's focus.
  const e = new THREE.Group(), R = 122;
  e.add(railingRing(R, 1.5, M.redLight));
  for (const [x, y, z, a] of aroundCircle(R, 24, 0, Math.PI / 24)) {
    const p = new THREE.Group();
    p.add(box(1.8, 2.4, 1.8, Rd), box(2.1, 0.3, 2.1, M.redLight, 0, 2.4), at(kalash(1.1, M.redLight), 0, 2.7, 0));
    p.position.set(x, y, z);
    p.rotation.y = a;
    e.add(p);
  }
  g.add(mergeByMaterial(e));
}

// One entrance porch, on the +z side of the building (the base model's porch block spans
// x = ±10, z = 84.5 to 93.5, y = 2 to 15).
function porch() {
  const g = new THREE.Group(), z = 93.5;
  // Steps down from the porch floor (y = 2, out to z = 96), 0.5 m risers.
  for (let k = 0; k < 4; k++) g.add(box(14, 2 - k * 0.5, 0.8, M.redLight, 0, 0, 96.4 + k * 0.8));
  g.add(at(archSlab(5.2, 7.6, false, M.recess, 0.06), 0, 2, z), at(archRing(5.2, 7.6, false, 0.45, 0.16, CREAM), 0, 2, z));
  g.add(at(archSlab(3.4, 2.2, false, M.recess, 0.04), 0, 10.4, z), at(archSlab(3.4, 2.2, false, jali(M.buff), 0.06), 0, 10.4, z + 0.04));
  for (const x of [-7.6, -5.4, 5.4, 7.6]) {
    g.add(box(1.5, 0.4, 1.5, CREAM, x, 2, z + 1.0), cyl(0.55, 0.6, 10.2, M.buff, x, 2.4, z + 1.0, 16));
    g.add(box(1.5, 0.45, 1.5, CREAM, x, 12.6, z + 1.0));
  }
  g.add(box(18, 1.2, 2.4, M.buff, 0, 13.05, z + 0.9));
  g.add(at(chhajja(21, 1.6, 0.7, 0.18, CREAM), 0, 15, z));
  g.add(at(arcadeScreen(20, 1.3, 14, 0.85, 0.85, 0.25, M.red), 0, 16, z - 0.4));
  return g;
}

// Samvidhan Sadan, the old Parliament House: the lawns round the circular colonnade with their
// hedges and trees, lamps, the white cars of members at the gates, and visitors.
export function addDetails(f, g) {
  g.add(trees(around(28, 122, 0, 0, 0.07), { kind: 'neem', seed: 3 }), shrubs(around(60, 96).map(([x, z]) => [x, z, 1.4]), { seed: 4 }));
  g.add(lampPosts(around(16, 104, 0, 0, 0.2)));
  g.add(vehicles(around(8, 112, 0, 0, 0.6).map(([x, z]) => [x, 0, z, Math.atan2(x, z) + Math.PI / 2]), { paints: ['#f2f2f2', '#f2f2f2', '#1d1d1d'], busShare: 0, seed: 5 }));
  g.add(people(around(40, 92, 0, 0, 0.03).map(([x, z], i) => [x * (1 + (i % 3) * 0.03), z * (1 + (i % 3) * 0.03)]), { seed: 6 }));
}

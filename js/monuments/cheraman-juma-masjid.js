import * as THREE from 'three';
import { M, mat, mesh, box, cyl, at, onFace, kalash, photo, strut, doubleSided, V as vec, FACES } from '../helpers.js';
import { mergeByMaterial, windowFrame, frieze } from '../parts/components.js';
import { keralaGable } from '../parts/temples.js';
import { interior, doorLeaves, steps } from '../parts/doorways.js';
import { addDetails } from '../details/cheraman-juma-masjid.js';

// Cheraman's walls of laterite under lime plaster, washed white; teak for its doors, window bars,
// eave struts and gable boards; the clay tiles of its roofs and the brass of its finials and lamp.
export const LIME = photo(mat('#f3efe6', 0.86), 'plaster');
export const LATERITE = M.laterite;
export const TEAK = photo(mat('#6a4326', 0.7), 'timber');
export const TILE = mat('#8e4630', 0.82);
export const BRASS = mat('#c99a3a', 0.35, 0.8);

// The mosque's measures, shared with js/details/cheraman-juma-masjid.js: the hall W across its
// front and D deep on a plinth B high, its walls H high; the upper storey U × V, UH high above the
// lower roof, standing ZO behind the hall's middle; the wing NW × ND on the north; the front
// (east) faces +z and north is +x.
export const P = { W: 13, D: 22, B: 0.9, H: 3, U: 8.6, V: 13, UH: 2.9, ZO: -0.5, NW: 7, ND: 11 };

// A tiled roof over w × d, h high, its ridge running along z from a behind the west eave to b
// short of the east one: hipped at both ends, steeply where a or b is small.
export function ridgeRoof(w, d, h, a, b, m) {
  const A = [-w / 2, 0, -d / 2], B = [w / 2, 0, -d / 2], C = [w / 2, 0, d / 2], E = [-w / 2, 0, d / 2], R0 = [0, h, -d / 2 + a], R1 = [0, h, d / 2 - b];
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute([A, R0, B, B, R0, R1, B, R1, C, C, R1, E, E, R1, R0, E, R0, A].flat(), 3));
  geo.computeVertexNormals();
  return mesh(geo, doubleSided(m));
}

// The hanging lamp of a Kerala hall (thookkuvilakku): tiers of brass dishes on a stem, hung by a
// chain `drop` long from y = 0.
export function hangingLamp(drop, s = 1) {
  const g = new THREE.Group();
  g.add(cyl(0.012 * s, 0.012 * s, drop, BRASS, 0, -drop, 0, 5), cyl(0.03 * s, 0.07 * s, 0.22 * s, BRASS, 0, -drop - 0.2 * s, 0, 8));
  g.add(cyl(0.2 * s, 0.07 * s, 0.07 * s, BRASS, 0, -drop - 0.27 * s, 0, 12), cyl(0.05 * s, 0.05 * s, 0.22 * s, BRASS, 0, -drop - 0.5 * s, 0, 8));
  g.add(cyl(0.34 * s, 0.12 * s, 0.09 * s, BRASS, 0, -drop - 0.59 * s, 0, 14), cyl(0.36 * s, 0.34 * s, 0.03 * s, BRASS, 0, -drop - 0.5 * s, 0, 14), cyl(0.02 * s, 0.1 * s, 0.14 * s, BRASS, 0, -drop - 0.73 * s, 0, 8));
  return g;
}

// Cheraman Juma Masjid, Methala, Kodungallur: by tradition founded in 629, the oldest mosque in
// India, given back its old Kerala form in a restoration finished in 2022. From photographs of the
// restored building: a long, low whitewashed hall with teak doors and barred windows under a broad
// hipped roof of clay tiles; rising through that roof the old core's upper storey, whitewashed too,
// with small round-headed windows and timber struts under a steep tiled roof, hipped to the west
// and ending to the east in a tall carved gable (mukhappu) with brass finials on the ridge. A
// small gabled porch in the middle of the east front shelters the door, through which the hall's
// hanging brass lamp is seen; a lower wing under its own tiled roof runs along the north side.
export function buildCheramanJumaMasjid() {
  const g = new THREE.Group(), f = new THREE.Group(), d = new THREE.Group();
  g.add(f);
  const { W, D, B, H, U, V, UH, ZO, NW, ND } = P, y1 = B + H, y2 = y1 + 2.5 + UH;
  // The plinth, the hall and its wall plate; the wing on the north.
  d.add(box(W + 0.7, B, D + 0.7, LIME), box(W, H, D, LIME, 0, B, 0), box(W + 0.3, 0.25, D + 0.3, TEAK, 0, y1 - 0.25, 0));
  const wx = W / 2 + NW / 2, wz = D / 2 - ND / 2 - 0.6;
  d.add(box(NW + 0.4, B, ND + 0.7, LIME, wx, 0, wz), box(NW, H - 0.3, ND, LIME, wx, B, wz), box(NW + 0.3, 0.2, ND + 0.3, TEAK, wx, y1 - 0.5, wz));
  // The lower roofs: the hall's, and the wing's leaning against it.
  d.add(at(ridgeRoof(W + 3.2, D + 3.2, 5.4, 12, 12, TILE), 0, y1, 0), at(ridgeRoof(ND + 2.6, 2 * NW + 5, 2.5, 6, 6, TILE), wx - NW / 2, y1 - 0.3, wz).rotateY(Math.PI / 2));
  // The upper storey rising through the roof, and its steep roof: hipped to the west, and to the
  // east a short hip under the carved gable.
  d.add(box(U, 2.5 + UH, V, LIME, 0, y1, ZO), box(U + 0.3, 0.25, V + 0.3, TEAK, 0, y2 - 0.25, ZO));
  d.add(at(ridgeRoof(U + 2.6, V + 2.6, 3.9, 5.6, 2.4, TILE), 0, y2, ZO));
  d.add(at(keralaGable(6.4, 2.9, 3, TILE, TEAK), 0, y2 + 0.85, ZO + V / 2 - 0.25));
  for (const z of [-3.2, 0.4, 3.6]) d.add(at(kalash(0.3, BRASS), 0, y2 + 3.85, ZO + z));
  // Round-headed windows in the upper walls, dark vents under the eave, and the teak struts that
  // carry it.
  const ups = (a) => (Math.abs(Math.sin(a)) > 0.5 ? [V, U / 2, 5] : [U, V / 2, a ? 3 : 2]);
  for (const a of FACES) {
    const [len, dist, n] = ups(a), side = new THREE.Group();
    for (let k = 0; k < n; k++) {
      const l = -len / 2 + (k + 0.5) * len / n;
      side.add(at(windowFrame(0.55, 1.2, LIME, { shape: 'round', frame: 0.08 }), l, y1 + 3.1, 0.01), box(0.3, 0.3, 0.04, M.recess, l, y2 - 0.9, 0.02));
    }
    for (let k = 0; k <= n; k++) {
      const l = -len / 2 + 0.25 + k * (len - 0.5) / n;
      side.add(strut(vec(l, y2 - 1.5, 0.02), vec(l, y2 - 0.3, 1.15), 0.09, TEAK));
    }
    d.add(onFace(side, a, dist));
    side.position.z += ZO;
  }
  // The hall's doors and windows: plank doors of teak in plain frames, and square windows barred
  // with turned teak; the same along the wing.
  const door = (w = 1.3, h = 2.1) => { const o = new THREE.Group(); o.add(box(w + 0.3, h + 0.15, 0.08, TEAK, 0, 0, 0.04), box(w, h, 0.1, frieze(TEAK), 0, 0, 0.06), box(0.03, h, 0.12, M.recess, 0, 0, 0.06)); return o; };
  const win = () => { const o = new THREE.Group(); o.add(box(1.25, 1.25, 0.06, TEAK, 0, 0, 0.03), box(1.05, 1.05, 0.08, M.recess, 0, 0.1, 0.04)); for (let k = -2; k <= 2; k++) o.add(box(0.05, 1.05, 0.1, TEAK, k * 0.19, 0.1, 0.05)); return o; };
  const put = (o, a, dist, l, y, zc = 0) => { const p = onFace(o, a, dist + 0.01, l); p.position.y = y; p.position.z += zc; d.add(p); };
  for (const l of [-4.4, 4.4]) put(win(), 0, D / 2, l, B + 0.9);
  for (const l of [-4.2, 0, 4.2]) put(door(), Math.PI, D / 2, l, B);
  for (const s of [-1, 1]) for (let k = 0; k < 6; k++) {
    const l = -D / 2 + (k + 0.5) * D / 6;
    if (s > 0 && -l > D / 2 - ND - 1.4) continue;
    put(k % 2 ? win() : door(), s * Math.PI / 2, W / 2, l, B + (k % 2 ? 0.9 : 0));
  }
  put(door(1.4, 2.1), 0, ND / 2, wx - 0.6, B, wz); put(win(), 0, ND / 2, wx + 2, B + 0.9, wz);
  for (const l of [-3.5, 0, 3.5]) put(win(), Math.PI / 2, wx + NW / 2, l, B + 0.9, wz);
  // The porch: two short walls under a gabled roof with a carved front, steps up between low
  // cheek walls, the door standing open on the hall and the brass lamp hanging inside it.
  const pz = D / 2;
  for (const s of [-1, 1]) d.add(box(0.35, H, 2, LIME, s * 1.75, B, pz + 1), box(0.5, B + 0.5, 1.6, LIME, s * 1.7, 0, pz + 2.8));
  d.add(box(4.2, B, 2.4, LIME, 0, 0, pz + 1.2), at(steps(2.9, B, 3, LIME, 0.4), 0, 0, pz + 2.4));
  d.add(box(3.85, 0.3, 2, TEAK, 0, y1 - 0.3, pz + 1), at(ridgeRoof(5.2, 6, 2.2, 3, 0.02, TILE), 0, y1, pz + 0.4), at(keralaGable(4.2, 1.75, 1.6, TILE, TEAK), 0, y1 + 0.3, pz + 2.9));
  d.add(at(interior(1.7, 2.3, 0.45, 0.3), 0, B, pz + 0.02), box(2.1, 0.18, 0.12, TEAK, 0, B + 2.3, pz + 0.06), at(doorLeaves(1.7, 2.3, { open: 1.35, m: TEAK, studs: false }), 0, B, pz + 0.04));
  for (const s of [-1, 1]) d.add(box(0.18, 2.48, 0.12, TEAK, s * 0.94, B, pz + 0.06));
  d.add(at(hangingLamp(0.9, 1.1), 0, y1 - 0.3, pz + 0.75));
  f.add(mergeByMaterial(d));
  addDetails(f, g);
  // From the north-east, across the paved court: the porch, the gable above it and the wing.
  return { group: g, focus: f, view: [0.45, 0.24, 1], zoom: 0.62 };
}

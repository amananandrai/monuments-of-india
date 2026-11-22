import * as THREE from 'three';
import { M, mat, box, at, onFace, hipRoof, kalash, photo, FACES } from '../helpers.js';
import { mergeByMaterial, windowFrame, jali } from '../parts/components.js';
import { keralaGable } from '../parts/temples.js';
import { classicalDoor } from '../parts/colonial.js';
import { addDetails } from '../details/cheraman-juma-masjid.js';

// Cheraman's walls of laterite under lime plaster, washed white, on a base of bare laterite; teak
// for its upper storey, posts and lattices; the clay tiles of its roofs and the brass of its finials.
export const LIME = photo(mat('#f3efe6', 0.86), 'plaster');
export const LATERITE = M.laterite;
export const TEAK = photo(mat('#5a3a24', 0.7), 'timber');
export const TILE = mat('#8e4630', 0.82);
const BRASS = mat('#c99a3a', 0.35, 0.8);

// The mosque's measures, shared with js/details/cheraman-juma-masjid.js: the hall W × D on a
// plinth B high, its walls H high; the timber upper storey U × V, UH high; the front (east) faces +z.
export const P = { W: 24, D: 16, B: 1, H: 4.6, U: 17, V: 9.5, UH: 3.4 };

// Cheraman Juma Masjid, Methala, Kodungallur: by tradition founded in 629, the oldest mosque in
// India, rebuilt in its old Kerala form in a restoration finished in 2022. From photographs: a hall
// of whitewashed laterite on a moulded laterite base, under a broad first roof of clay tiles; above
// it a timber upper storey screened by lattices, under a second, steeper tiled roof with a carved
// gable (mukhappu) to the front and back, brass finials on its ridge; and an open porch of teak
// posts before the east door. Its form is that of a Kerala temple, its prayer hall facing west.
export function buildCheramanJumaMasjid() {
  const g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  const { W, D, B, H, U, V, UH } = P, y1 = B + H;
  // The base, the hall and the wall plate.
  f.add(box(W + 1.6, B, D + 1.6, LATERITE), box(W + 0.6, 0.25, D + 0.6, LATERITE, 0, B, 0));
  f.add(box(W, H, D, LIME, 0, B, 0), box(W + 0.4, 0.35, D + 0.4, TEAK, 0, y1 - 0.35, 0));
  // The first roof, and the timber upper storey rising through it.
  f.add(at(hipRoof(W + 4.4, D + 4.4, 3.2, TILE), 0, y1, 0));
  f.add(box(U, UH + 1.6, V, TEAK, 0, y1 + 0.6, 0), box(U + 0.4, 0.3, V + 0.4, TEAK, 0, y1 + 2.2 + UH - 0.3, 0));
  // The second roof, steeper, with its ridge running north–south across the front.
  const y2 = y1 + 2.2 + UH, r2 = hipRoof(U + 3.6, V + 3.6, 4.2, TILE);
  f.add(at(r2, 0, y2, 0));
  // Brass finials on the ridge.
  for (const x of [-3, 0, 3]) f.add(at(kalash(0.36, BRASS), x, y2 + 4.2 - 0.12 + (x ? -0.05 : 0), 0));
  // The carved gables, front and back, set into the upper roof's slopes.
  for (const a of [0, Math.PI]) {
    const gb = keralaGable(6.4, 2.6, 4.4, TILE, TEAK);
    gb.position.set(0, y2 + 1.1, Math.cos(a) * 5.1);
    gb.rotation.y = a;
    f.add(gb);
  }
  // Lattice screens all round the upper storey, between teak posts.
  const up = new THREE.Group(), lat = windowFrame(1.6, 1.8, TEAK, { shape: 'flat', screen: jali(TEAK), frame: 0.16 });
  for (const a of FACES) {
    const along = Math.abs(Math.sin(a)) > 0.5 ? V : U, dist = (Math.abs(Math.sin(a)) > 0.5 ? U : V) / 2, n = Math.floor(along / 2.3);
    for (let k = 0; k < n; k++) up.add(onFace(at(lat.clone(), 0, y1 + 2.3, 0), a, dist + 0.01, -along / 2 + (k + 0.5) * along / n));
  }
  f.add(mergeByMaterial(up));
  // Windows of the hall: tall openings barred with teak, in plain frames, round all four sides.
  const ws = new THREE.Group(), win = windowFrame(1.2, 2.2, TEAK, { shape: 'flat', screen: jali(TEAK), frame: 0.2 });
  for (const a of FACES) {
    const along = Math.abs(Math.sin(a)) > 0.5 ? D : W, dist = (Math.abs(Math.sin(a)) > 0.5 ? W : D) / 2, n = Math.floor(along / 3.4);
    for (let k = 0; k < n; k++) {
      const l = -along / 2 + (k + 0.5) * along / n;
      if (a === 0 && Math.abs(l) < 3.5) continue;
      ws.add(onFace(at(win.clone(), 0, B + 1.1, 0), a, dist + 0.01, l));
    }
  }
  ws.add(onFace(at(classicalDoor(2, 3, { m: LIME, trim: TEAK, leafM: TEAK, shape: 'flat', top: null, depth: 0.3, frame: 0.3 }), 0, B + 0.25, 0), 0, D / 2 + 0.01));
  f.add(mergeByMaterial(ws));
  // The porch: a laterite floor, four teak posts on stone bases, a beam and a tiled roof.
  const po = new THREE.Group(), pz = D / 2 + 3;
  po.add(box(9, B, 6, LATERITE, 0, 0, pz));
  for (const x of [-3.6, -1.2, 1.2, 3.6]) po.add(box(0.5, 0.4, 0.5, LATERITE, x, B, pz + 2.4), box(0.3, 3.2, 0.3, TEAK, x, B + 0.4, pz + 2.4));
  po.add(box(8.4, 0.35, 0.4, TEAK, 0, B + 3.6, pz + 2.4), box(0.3, 0.35, 5.8, TEAK, -3.6, B + 3.6, pz - 0.2), box(0.3, 0.35, 5.8, TEAK, 3.6, B + 3.6, pz - 0.2));
  po.add(at(hipRoof(10.4, 7.4, 2.4, TILE), 0, B + 3.95, pz));
  po.add(at(kalash(0.25, BRASS), 0, B + 3.95 + 2.3, pz));
  po.add(at(keralaGable(4, 1.7, 2.4, TILE, TEAK), 0, B + 4.5, pz + 2.95));
  f.add(po);
  addDetails(f, g);
  // From the north-east, across the yard, the porch and its gable to the front.
  return { group: g, focus: f, view: [0.7, 0.36, 1], zoom: 0.9 };
}

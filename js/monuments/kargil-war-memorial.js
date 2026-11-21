import * as THREE from 'three';
import { M, mat, mesh, box, cyl, at, surface, mown, chhatri, tricolour } from '../helpers.js';
import { mountainRing } from '../parts/terrain.js';
import { addDetails } from '../details/kargil-war-memorial.js';

// The Kargil War Memorial at Dras, after photographs. Everything the army built here is washed the
// same salmon pink; the names of the fallen are on plates of polished brass.
//
// The plan (metres; the memorial's terrace is centred on the origin and the gate is towards +z):
// - the terrace, 46 × 30 and 1 m high, reached by steps at the front between two inscribed pylons;
// - on it the Amar Jawan Jyoti: a stepped plinth with the verse on its face and the flame in a gilt
//   urn, and behind the flame the tapering "OP VIJAY" pylon under a domed kiosk, between four
//   columns that carry lanterns, two tall and two short;
// - across the back the Wall of Heroes, straight, faced with the brass plates, and behind its
//   middle the 30 m staff with the great tricolour;
// - a paved court before the steps, and from it the Vijaypath, a straight road 150 m long between
//   lawns, to the gate.
// Tololing rises directly behind the wall.
// Painted smooth, so the surface is plain: no block joints, no wall photograph.
export const PINK = surface(mat('#f0aa98', 0.8), 'carved'), PINK_DEEP = surface(mat('#dd8f7d', 0.8), 'carved');
export const PAVE = surface(mat('#b56a5c', 0.9), 'paving');
const BRASS = surface(mat('#dcb244', 0.3, 0.55), 'script');
const FLAME = mat('#ff8c2e', 0.4, 0, { emissive: '#ff6a00', emissiveIntensity: 2.4 });
// The terrace's top, the court's, and where the Vijaypath starts and ends (the gate).
export const T = 1.2, PATH = [38, 190];

// A column carrying a lantern: a moulded base, a round shaft swelling to a capital, and on it a
// small domed kiosk.
function lanternColumn(h) {
  const g = new THREE.Group();
  g.add(box(1.1, 0.5, 1.1, PINK), box(0.85, 0.25, 0.85, PINK_DEEP, 0, 0.5, 0), cyl(0.3, 0.36, h - 1.15, PINK, 0, 0.75, 0, 14));
  g.add(cyl(0.48, 0.3, 0.3, PINK_DEEP, 0, h - 0.4, 0, 14), box(1.0, 0.1, 1.0, PINK, 0, h - 0.1, 0));
  g.add(at(chhatri(0.5, 1.5, PINK, PINK_DEEP), 0, h, 0));
  return g;
}
// A square block tapering upward, w0 wide at its foot and w1 at its top.
const taper = (w0, w1, h, m) => mesh(new THREE.CylinderGeometry(w1 / Math.SQRT2, w0 / Math.SQRT2, h, 4).rotateY(Math.PI / 4).translate(0, h / 2, 0), m);

export function buildKargilMemorial() {
  const g = new THREE.Group(), f = new THREE.Group();
  g.add(f);
  g.add(box(600, 0.2, 600, mat('#9d8f78', 0.95)));
  // Tololing and the mountains around Dras (js/parts/terrain.js): bare brown-grey ridges ringing
  // the valley, highest behind the memorial, snow on their crests.
  g.add(mountainRing({ inner: 420, outer: 720, h: 330, vary: 110, aspect: 1.1, cz: -60, snow: 300, rock: ['#7f766a', '#8f8578', '#766d62'], cover: '#9d8f78', steep: 0.82 }));

  // The terrace and its steps.
  f.add(box(46, T - 0.2, 30, PINK, 0, 0.2, -1));
  for (let k = 0; k < 5; k++) f.add(box(12, 0.2 * (k + 1), 0.5, PINK, 0, 0.2, 14.25 + 0.5 * (4 - k)));
  // Lawns on the terrace either side of the way to the flame.
  for (const s of [-1, 1]) f.add(mown(box(14, 0.06, 20, M.grass, s * 14.5, T, 1)));
  // The pylons at the head of the steps, each under a lantern.
  for (const s of [-1, 1]) {
    f.add(at(taper(3.4, 2.8, 4.4, PINK), s * 8, T, 12.4), box(3.2, 0.3, 1.6, PINK_DEEP, s * 8, T + 4.4, 12.4), at(chhatri(0.7, 1.9, PINK, PINK_DEEP), s * 8, T + 4.7, 12.4));
  }

  // The Amar Jawan Jyoti: two steps, the block with the verse, the urn and its flame.
  f.add(box(10, 0.5, 8, PINK, 0, T, -3), box(7.6, 0.55, 5.6, PINK, 0, T + 0.5, -3.4), box(5.4, 1.3, 2.4, PINK, 0, T + 1.05, -2.2));
  const top = T + 2.35;
  f.add(cyl(0.42, 0.36, 0.75, M.gild, 0, top, -1.8, 20), cyl(0.46, 0.46, 0.06, M.gild, 0, top + 0.75, -1.8, 20));
  f.add(mesh(new THREE.ConeGeometry(0.2, 0.7, 10).translate(0, 0.35, 0), FLAME, 0, top + 0.8, -1.8));
  // The pylon behind the flame, lettered OP VIJAY, under its kiosk.
  f.add(at(taper(2.5, 1.7, 6.2, PINK), 0, T + 1.05, -4.6), box(2.1, 0.3, 2.1, PINK_DEEP, 0, T + 7.25, -4.6), at(chhatri(0.85, 2.3, PINK, PINK_DEEP), 0, T + 7.55, -4.6));
  // The four columns round it.
  for (const s of [-1, 1]) f.add(at(lanternColumn(6.4), s * 5.8, T, -1.4), at(lanternColumn(4.6), s * 3.9, T, -5.9));

  // The Wall of Heroes: the pink wall, its brass plates, and a pier under a lantern at each end.
  f.add(box(38, 3.4, 0.9, PINK, 0, T, -14.2), box(38.4, 0.25, 1.2, PINK_DEEP, 0, T + 3.4, -14.2));
  f.add(box(35, 2.5, 0.06, BRASS, 0, T + 0.55, -13.72));
  for (const s of [-1, 1]) f.add(box(1.6, 4.4, 1.6, PINK, s * 19.8, T, -14.2), at(chhatri(0.7, 1.9, PINK, PINK_DEEP), s * 19.8, T + 4.4, -14.2));
  // The great tricolour, 11.4 m long on a 30 m staff, behind the middle of the wall.
  f.add(at(tricolour(30, 11.4), 0, 0.2, -18.5));

  // The paved court, the Vijaypath and its lawns: outside the focus, so the home view frames the
  // memorial itself.
  g.add(box(72, 0.14, 22, PAVE, 0, 0.2, 27));
  g.add(box(7, 0.12, PATH[1] - PATH[0], M.asphalt, 0, 0.2, (PATH[0] + PATH[1]) / 2));
  for (const s of [-1, 1]) g.add(mown(box(26, 0.1, PATH[1] - PATH[0] - 8, M.grass, s * 17.5, 0.2, (PATH[0] + PATH[1]) / 2 - 2)));
  addDetails(f, g);
  return { group: g, focus: f, view: [0.22, 0.2, 1.25], zoom: 0.58, target: [0, 7.5, -4], fog: 30 };
}

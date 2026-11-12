import * as THREE from 'three';
import { M, mat, box, cyl, at, onFace, FACES, lathe, surface, tricolour, hemi, finial, chhatri, inst, unitBox, unitCyl } from '../helpers.js';
import { chhajja, bracketGeo, placeAll, alongFace, windowFrame, railing, jali, aroundCircle, petalRing, star, mouldings, frieze, panel, dentils, columnTrim, mergeByMaterial } from './components.js';
import { instances, elephantGeo } from './sculpture.js';
import { trees, lampPosts, along } from './realism.js';
import { COPPER } from '../monuments/rashtrapati-bhavan.js';

const GALLERY = surface(mat('#3a322c', 0.9), 'none');

// Rashtrapati Bhavan, finer detail. From photographs and descriptions of Lutyens' design:
// - the Delhi Order on the portico columns: a moulded base and a capital hung with bells at its
//   corners;
// - deep chhajjas (sloping eaves) on brackets along the cream upper storey and over the portico;
// - rows of windows in the cream storey and the red base below it, with pierced stone screens
//   (jalis) in the upper ones;
// - the railing band round the foot of the dome, posts and rails as at the Sanchi stupa;
// - a pierced parapet along the roof;
// - the same windows, eaves and parapets on the two forward wings, the colonnaded loggias between
//   them and the portico, and the doorways behind the portico's columns;
// - the dome's drum with its pilasters, lights and cornice, and the seams of the copper dome.
// Dimensions follow js/monuments/rashtrapati-bhavan.js: the red base 196 × 64 and 10 high, the cream
// storey 186 × 58 above it to 22.
function architecture(f) {
  const d = new THREE.Group(), Rd = M.red, Cr = M.cream, Bf = M.buff;
  for (let k = 0; k < 12; k++) {
    const x = -27.5 + k * 5;
    d.add(box(3, 0.6, 3, Cr, x, 10, 38), cyl(1.6, 1.35, 1.0, Bf, x, 21.38, 38, 16), box(3.0, 0.6, 3.0, Bf, x, 22.38, 38));
    for (const [bx, bz] of [[-1.25, -1.25], [1.25, -1.25], [-1.25, 1.25], [1.25, 1.25]]) d.add(cyl(0.12, 0.35, 0.8, Bf, x + bx, 21.6, 38 + bz, 8));
  }
  for (const a of FACES) {
    const long = Math.abs(Math.sin(a)) < 0.5, len = long ? 186 : 58, dist = (long ? 58 : 186) / 2;
    d.add(onFace(at(chhajja(len + 1.4, 2.2, 0.8, 0.18, Bf), 0, 21.5, 0), a, dist));
    d.add(placeAll(bracketGeo(1.2, 2.0, 0.4), alongFace(a, dist, len - 2, Math.round(len / 4), 21.4), Bf));
    d.add(onFace(at(railing(len - 1, 1.3, 0.3, Cr, 3, jali(Cr)), 0, 22.6, 0), a, dist - 0.6));
    const n = Math.floor(len / 6);
    for (let k = 0; k < n; k++) {
      const lat = -len / 2 + (k + 0.5) * (len / n);
      if (a === 0 && Math.abs(lat) < 36) continue;
      d.add(onFace(at(windowFrame(2, 4.2, Cr, { shape: 'flat', screen: jali(Cr) }), 0, 13.6, 0), a, dist + 0.01, lat));
      d.add(onFace(at(windowFrame(1.6, 3, Rd, { shape: 'flat' }), 0, 3.6, 0), a, dist + 5.01 - (long ? 2 : 0), lat));
    }
  }
  d.add(at(chhajja(66, 2, 0.8, 0.18, Bf), 0, 23, 41));

  // The wings that reach forward either side of the forecourt (cream storey 34 × 28 at x = ±80,
  // z = 44, on a red base 36 × 30): windows, eaves, brackets and a pierced parapet on their three
  // open faces, as on the main range.
  for (const s of [-1, 1]) {
    const wing = at(new THREE.Group(), s * 80, 0, 44);
    for (const a of [0, Math.PI / 2, -Math.PI / 2]) {
      const long = a === 0, len = long ? 34 : 28, dist = (long ? 28 : 34) / 2;
      wing.add(onFace(at(chhajja(len + 1.4, 2.2, 0.8, 0.18, Bf), 0, 21.9, 0), a, dist));
      wing.add(placeAll(bracketGeo(1.2, 2.0, 0.4), alongFace(a, dist, len - 2, Math.round(len / 4), 21.8), Bf));
      wing.add(onFace(at(railing(len - 1, 1.3, 0.3, Cr, 3, jali(Cr)), 0, 23, 0), a, dist - 0.6));
      const n = Math.floor(len / 6);
      for (let k = 0; k < n; k++) {
        const lat = -len / 2 + (k + 0.5) * (len / n);
        wing.add(onFace(at(windowFrame(2, 4.2, Cr, { shape: 'flat', screen: jali(Cr) }), 0, 13.6, 0), a, dist + 0.01, lat));
        wing.add(onFace(at(windowFrame(1.6, 3, Rd, { shape: 'flat' }), 0, 3.6, 0), a, dist + 1.01, lat));
      }
    }
    d.add(wing);
  }
  // The loggias of the east front: between the portico and each wing the cream storey stands back
  // behind a colonnade of the Delhi Order, a dark gallery behind it, under the same deep eave.
  const shafts = [], bases = [], caps = [];
  for (const s of [-1, 1]) {
    d.add(box(25, 9.6, 0.1, GALLERY, s * 48.5, 10.8, 29.06));
    for (let k = 0; k < 7; k++) {
      const x = s * (37.5 + k * 3.7);
      shafts.push([x, 10.5, 30.6, 0.95, 9.4, 0.95]);
      bases.push([x, 10, 30.6, 1.5, 0.5, 1.5]);
      caps.push([x, 19.9, 30.6, 1.6, 0.6, 1.6]);
    }
    d.add(box(25.6, 0.9, 1.7, Cr, s * 48.5, 20.5, 30.6), box(25.6, 0.5, 1.2, Bf, s * 48.5, 10, 31.2));
  }
  d.add(inst(unitCyl(14), shafts, Cr), inst(unitBox(), bases, Cr), inst(unitBox(), caps, Bf));
  // Behind the portico's columns: five tall doorways into the Durbar Hall, the middle one the
  // tallest, with square lights over them.
  for (let k = -2; k <= 2; k++) {
    const h = k === 0 ? 8 : 6.4;
    d.add(at(windowFrame(k === 0 ? 3.4 : 2.6, h, Cr, { shape: 'flat' }), k * 10, 10 + h / 2 + 0.1, 29.02), at(windowFrame(1.8, 1.8, Cr, { shape: 'flat' }), k * 10, 19.6, 29.02));
  }

  // The dome's drum (r = 15, y 22.6 to 27.6): a stepped square podium under it, pilasters round it
  // with dark recessed lights between them, and a moulded cornice under the red railing band. Above
  // the band the copper dome springs from a low attic ring, and carries raised seams from the
  // crown to its foot.
  d.add(box(44, 0.6, 44, Bf, 0, 22.6, 0), box(38, 0.6, 38, Bf, 0, 23.2, 0));
  d.add(placeAll(new THREE.BoxGeometry(1.1, 3.8, 0.4), aroundCircle(15.1, 24, 25.7), Cr));
  d.add(placeAll(new THREE.BoxGeometry(1.5, 2.2, 0.12), aroundCircle(15.0, 24, 25.9, Math.PI / 24), M.recess));
  d.add(cyl(15.5, 15.3, 0.4, Bf, 0, 27.3, 0, 72), cyl(14.9, 14.9, 1.1, Cr, 0, 29, 0, 72), cyl(15.1, 15.1, 0.25, Bf, 0, 30, 0, 72));
  const seam = new THREE.TorusGeometry(14.56, 0.09, 5, 40, Math.PI / 2 - 0.12);
  for (let k = 0; k < 32; k++) { const r = new THREE.Mesh(seam, COPPER); r.position.y = 29; r.rotation.y = (k / 32) * Math.PI * 2; d.add(r); }
  d.add(cyl(2.4, 2.9, 0.5, COPPER, 0, 43.0, 0, 24));

  // The railing band round the dome's foot (r = 15.6, y 27.6 to 29): posts and two rails.
  d.add(placeAll(new THREE.BoxGeometry(0.4, 1.3, 0.3), aroundCircle(15.65, 72, 28.3), Rd));
  for (const y of [27.9, 28.6]) d.add(cyl(15.75, 15.75, 0.22, Rd, 0, y, 0, 72));
  mergeByMaterial(d);
  f.add(d);
}

// The sculpture and finer parts, after photographs: the Jaipur Column's bronze lotus and the glass
// star of India on its top, and an inscribed and carved base; the shallow stone basins of Lutyens'
// roof fountains; stone elephants either side of the great stair; and dentils under the cornice of
// the portico. Dimensions follow js/monuments/rashtrapati-bhavan.js: the Jaipur Column at z = 120
// (base 7 square and 6 high, the shaft to 36, a bronze ball at 37.2).
const STAR = mat('#d8eef5', 0.08, 0.2, { transparent: true, opacity: 0.85 });
function sculpture(f, g) {
  const d = new THREE.Group(), Rd = M.red, Cr = M.cream, Bf = M.buff;
  const jc = at(new THREE.Group(), 0, 0, 120);
  jc.add(at(petalRing(1.25, 12, 1.6, 0.9, 0.5, M.bronze), 0, 36, 0));
  for (const ry of [0, Math.PI / 2]) jc.add(at(star(6, 1.3, STAR, 0.12), 0, 43.4, -0.06).rotateY(ry));
  jc.add(mouldings(7, 7, [[0, 0.6, 0.3, Bf], [4.6, 0.8, 0.06, frieze(Rd)], [5.6, 0.4, 0.3, Bf]], Rd));
  for (const a of FACES) jc.add(onFace(at(panel(4.4, 2.6, 0.2, Bf, LETTERS), 0, 1.4, 0), a, 3.5));
  g.add(mergeByMaterial(jc));
  for (const [x, z] of [[-70, -20], [70, -20], [-70, 20], [70, 20]]) {
    d.add(at(lathe([[0, 0], [3.2, 0], [3.6, 0.5], [3.4, 0.7], [0, 0.6]], Bf, 32), x, 22.6, z), cyl(3.15, 3.15, 0.05, M.water, x, 23.25, z, 32));
  }
  d.add(at(dentils(64, 0.25, 0.35, 0.4, Bf), 0, 25.05, 41));
  mergeByMaterial(d);
  f.add(d);
  f.add(instances(elephantGeo(), [[-33, 2, 46, 3.4, 3.8, 4.4, 0], [33, 2, 46, 3.4, 3.8, 4.4, 0]], M.cream));
  for (const x of [-33, 33]) f.add(box(5, 2, 6, Rd, x, 0, 46));
}
const LETTERS = surface(mat('#cfae86', 0.8), 'script');


// Herbert Baker's Secretariat (1912–27): the North and South Blocks either side of the avenue
// beyond the forecourt, in the same red and cream Dholpur stone. Each is a long range two storeys
// over a red base, with a domed tower at its middle, a colonnaded loggia facing the avenue,
// pavilions projecting at its ends with chhatris on them, and rows of windows. s = -1 for the North
// Block (west of the axis here), +1 for the South; the inner face stands at x = ±48.
function secretariat(s) {
  const g = new THREE.Group(), Rd = M.red, Cr = M.cream, Bf = M.buff;
  const X = s * 66, Z0 = 220, Z1 = 360, ZC = (Z0 + Z1) / 2, L = Z1 - Z0;
  g.add(box(36, 8, L, Rd, X, 0, ZC), box(34, 12, L - 2, Cr, X, 8, ZC), box(37, 0.9, L + 1, Bf, X, 20, ZC));
  // The end pavilions, stepping out toward the avenue, each with a chhatri.
  for (const z of [Z0 + 12, Z1 - 12]) {
    g.add(box(10, 8, 24, Rd, s * 44, 0, z), box(9, 13, 22, Cr, s * 44.5, 8, z), box(10.5, 0.9, 25, Bf, s * 44.5, 21, z));
    g.add(at(chhatri(3, 8, Cr), s * 44.5, 21.9, z));
  }
  // The loggia on the avenue side: cream columns between the pavilions, under a deep eave.
  const cols = [];
  for (let z = Z0 + 30; z <= Z1 - 30; z += 4) cols.push([s * 47.2, 8, z, 1.1, 12, 1.1]);
  g.add(inst(unitCyl(12), cols, Cr), columnTrim(cols, Cr, { capM: Bf }), box(2.4, 0.6, L - 54, Bf, s * 47.6, 19.6, ZC));
  // Windows: deep reveals in the cream storeys and smaller ones in the red base, on both long faces.
  const win = [];
  for (const side of [-1, 1]) {
    const x = X + side * 18.02, xc = X + side * 17.02;
    for (let z = Z0 + 4; z < Z1 - 3; z += 5) {
      if (side === -s && Math.abs(z - Z0 - 12) > 13 && Math.abs(z - Z1 + 12) > 13) continue; // behind the loggia
      win.push([x, 2.4, z, 0.2, 3, 1.8], [xc, 10.2, z, 0.2, 3.6, 1.8], [xc, 15.4, z, 0.2, 3.2, 1.8]);
    }
  }
  g.add(inst(unitBox(), win, M.recess));
  // The domed tower at the middle: a square base, a drum with a red railing band like the one on
  // Rashtrapati Bhavan's dome, the dome and its finial, and chhatris at the corners of the base.
  g.add(box(24, 7, 24, Cr, X, 20.9, ZC), box(25, 0.8, 25, Bf, X, 27.9, ZC));
  g.add(cyl(8.5, 8.5, 4.5, Cr, X, 28.7, ZC, 40), cyl(8.9, 8.9, 1, Rd, X, 33.2, ZC, 40));
  g.add(at(hemi(8.2, Cr, 40), X, 34.2, ZC), cyl(0.9, 1.3, 1.6, Cr, X, 42.2, ZC, 12), at(finial(3.2), X, 43.8, ZC));
  for (const dx of [-10, 10]) for (const dz of [-10, 10]) g.add(at(chhatri(1.6, 5, Cr), X + dx, 28.7, ZC + dz));
  return g;
}

// Rashtrapati Bhavan: the tricolour on the dome, lamps and trees along the avenue to the Jaipur
// Column, and the two Secretariat blocks flanking the avenue beyond it.
export function addDetails(f, g) {
  architecture(f);
  sculpture(f, g);
  f.add(at(tricolour(10), 0, 45.6, 0));
  g.add(trees([...along(8, [-38, 70], [-38, 200]), ...along(8, [38, 70], [38, 200])], { kind: 'jamun', seed: 5 }));
  g.add(lampPosts([...along(8, [-20, 70], [-20, 200]), ...along(8, [20, 70], [20, 200])]));
  g.add(box(240, 0.2, 170, M.path, 0, 0, 295), mergeByMaterial(new THREE.Group().add(secretariat(-1), secretariat(1))));
  g.add(lampPosts([...along(10, [-20, 215], [-20, 370]), ...along(10, [20, 215], [20, 370])]));
}

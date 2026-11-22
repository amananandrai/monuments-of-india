import * as THREE from 'three';
import { M, mat, box, cyl, lathe, at, onFace, FACES, clothGeometry, onionDome, ribbed, kalash, surface } from '../helpers.js';
import { petalRing } from './components.js';
import { arcadeSkin, cellRow } from './mughal.js';

// Parts of the gurdwaras (Hazur Sahib, Patna Sahib, Keshgarh Sahib, Bangla Sahib, Hemkund Sahib):
// the ribbed dome in its lotus cup under a gilt umbrella, the Nishan Sahib, storeys of arcaded
// faces, and the rows of small gilt domes along their parapets. Every part faces +z and stands on
// y = 0, as in the rest of the kit.

// The gilded copper of their domes, lit warmly so it reads as gold in its own shade, as at
// the Golden Temple.
export const GILT = surface(mat('#e3b54a', 0.35, 0.6, { emissive: '#4a3306' }), 'giltsheet');
export const SAFFRON = mat('#f08a1c', 0.8, 0, { side: 2 });
const GOLD = mat('#e3b54a', 0.3, 0.85);

// A gurdwara's dome: a ring of lotus petals round its foot, the ribbed onion, a kalash, and on top
// the gilt umbrella (chhatra) on a short rod. Stands on y = 0; userData.top is its height.
export function sikhDome(r, m, { finialM = GOLD, petals = true, ribs = 16 } = {}) {
  const g = new THREE.Group();
  g.add(at(lathe([[r * 0.7, 0], [r * 1.08, r * 0.14], [r * 1.12, r * 0.24], [r * 0.9, r * 0.28], [0, r * 0.28]], m, 32), 0, 0, 0));
  if (petals) g.add(at(petalRing(r * 0.98, 16, r * 0.42, r * 0.26, 0.9, m, Math.max(0.05, r * 0.05)), 0, r * 0.24, 0));
  g.add(at(ribbed(onionDome(r, m), ribs, 0.06), 0, r * 0.26, 0));
  const ky = r * 0.26 + r * 1.8;
  g.add(at(kalash(r * 0.5, finialM), 0, ky, 0));
  const ry = ky + r * 0.5 * 1.1;
  g.add(cyl(r * 0.025, r * 0.03, r * 0.55, finialM, 0, ry, 0, 8));
  g.add(at(lathe([[0.01, 0], [r * 0.34, -r * 0.1], [r * 0.34, -r * 0.13], [0.01, -r * 0.02]], finialM, 16), 0, ry + r * 0.55, 0));
  g.add(cyl(0, r * 0.03, r * 0.12, finialM, 0, ry + r * 0.55, 0, 8));
  g.userData.top = ry + r * 0.67;
  return g;
}

// The Nishan Sahib: a tall pole sheathed in saffron cloth, a gilt cap, the saffron pennant and the
// khanda over it. On a marble plinth.
export function nishanSahib(h, { y = 0 } = {}) {
  const g = new THREE.Group();
  g.add(box(1.4, 0.8, 1.4, M.marble, 0, y, 0), cyl(0.16 + h * 0.004, 0.22 + h * 0.006, h, SAFFRON, 0, y + 0.8, 0, 10), cyl(0, 0.2, 1.2, GOLD, 0, y + h + 0.8, 0, 10));
  const cl = new THREE.Mesh(clothGeometry(h * 0.2, h * 0.09, { taper: 0.85 }), SAFFRON);
  cl.position.set(0, y + h + 0.6, 0.25);
  cl.rotation.y = -Math.PI / 2;
  g.add(cl, box(0.08, 0.9, 0.9, GOLD, 0, y + h + 1.9, 0));
  return g;
}

// A storey of arcaded faces: a core block and on each face an arcade skin dp deep (doors, rooms or
// screens), the faces meeting at the corners. w square, h high, n arches a face.
export function arcadeStorey(w, h, n, m, { trim = m, fill = 'room', dp = 0.8, sill = 0.4, aw = null, ah = null, centre = null } = {}) {
  const g = new THREE.Group(), pitch = w / n, a = aw ?? pitch * 0.62, hh = ah ?? h * 0.72;
  g.add(box(w - 2 * dp, h, w - 2 * dp, m));
  FACES.forEach((ang, k) => {
    const len = k % 2 ? w - 2 * dp : w, cells = cellRow(n, pitch, sill, a, hh).map((c) => (centre && Math.abs(c[0]) < 0.01 ? [...c, centre] : c));
    g.add(onFace(arcadeSkin(len, h, cells.filter((c) => Math.abs(c[0]) + a / 2 < len / 2), dp, m, { trim, fill }), ang, w / 2 - dp));
  });
  return g;
}

// A row of small gilt domes on short drums along a parapet, round a square of side w.
export function parapetDomes(w, y, n, m, r = 0.4) {
  const g = new THREE.Group();
  for (const a of FACES) for (let k = 0; k < n; k++) {
    const d = onFace(new THREE.Group(), a, w / 2 - r, (k - (n - 1) / 2) * ((w - 2 * r) / (n - 1)));
    d.add(cyl(r, r, r * 1.2, m, 0, y, 0, 10), at(ribbed(onionDome(r * 1.05, m, { crown: false, neck: false }), 8, 0.05), 0, y + r * 1.2, 0));
    g.add(d);
  }
  return g;
}

// A storey on a rectangle w × d: a core block with an arcade skin dp deep on each face, as many
// arches to a face as fit at pitch; front ('door', 'jali'…) fills the middle arch of the +z face.
export function rectStorey(w, d, h, pitch, m, { trim = m, fill = 'room', dp = 0.8, sill = 0.4, ah = h * 0.72, front = null } = {}) {
  const g = new THREE.Group();
  g.add(box(w - 2 * dp, h, d - 2 * dp, m));
  for (const [ang, len, dist] of [[0, w, d / 2 - dp], [Math.PI, w, d / 2 - dp], [Math.PI / 2, d - 2 * dp, w / 2 - dp], [-Math.PI / 2, d - 2 * dp, w / 2 - dp]]) {
    const n = Math.max(1, Math.floor(len / pitch)), p = len / n, aw = p * 0.6;
    const cells = cellRow(n, p, sill, aw, ah).map((c) => (ang === 0 && front && Math.abs(c[0]) < p / 2 ? [...c, front] : c));
    g.add(onFace(arcadeSkin(len, h, cells, dp, m, { trim, fill }), ang, dist));
  }
  return g;
}

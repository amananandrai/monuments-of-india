import * as THREE from 'three';
import { M, mat, box, cyl, lathe, at, onFace, FACES, clothGeometry, onionDome, ribbed, kalash, chhatri, sheet, surface } from '../helpers.js';
import { panel, frieze, jharokha, chhajja, mergeByMaterial, petalRing } from '../parts/components.js';
import { arcadeSkin, cellRow } from '../parts/mughal.js';
import { trees, lampPosts, cityAround, scatter } from '../parts/realism.js';
import { detail } from '../detail.js';

// Parts shared by the gurdwaras (Hazur Sahib, Patna Sahib, Keshgarh Sahib, Bangla Sahib, Hemkund
// Sahib). The gilded copper of their domes, lit warmly so it reads as gold in its own shade, as at
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

// Hazur Sahib, finer detail. From photographs: a gilded band with embossed panels runs above the
// marble arches; a bay window under a curved roof juts from the middle of each face of the gilded
// upper storey; lotus rosettes of gilt copper sit in the spandrels. Dimensions follow
// js/monuments/takht-sri-hazur-sahib.js: the plinth P high, the marble storey 20 m square and H1
// high, the gilded storey 16.4 m square and H2 high.
function architecture(f, { P, H1, H2 }) {
  const d = new THREE.Group();
  for (const a of FACES) {
    d.add(onFace(at(panel(19.6, 1, 0.12, GILT, frieze(GILT)), 0, P + H1 - 1.3, 0), a, 10.01));
    d.add(onFace(at(jharokha(2.6, 3, GILT, { d: 1.1 }), 0, P + H1 + 1.1, 0), a, 8.21));
    d.add(onFace(at(chhajja(20.6, 1.3, 0.5, 0.18, M.marble), 0, P + H1, 0), a, 10));
  }
  f.add(mergeByMaterial(d));
}

// The courtyard round the shrine: ranges of white buildings, two and three storeys of arches, on
// every side, with the gateway in the front (+z) range; the marble court; and beyond, the town of
// Nanded and the Godavari to the north (-z).
export function addDetails(f, g, dims) {
  architecture(f, dims);
  const C = 52;
  const face = (len, x, z, ry, h = 10) => {
    const n = Math.floor(len / 5.2), cells = [];
    for (let k = 0; k < n; k++) { const cx = -len / 2 + (k + 0.5) * (len / n); cells.push([cx, 0.6, 3, 4, 'room'], [cx, 5.6, 2.6, 3.2, 'jali']); }
    const r = new THREE.Group();
    r.add(box(len, h, 8, M.lime, 0, 0, -4.8), arcadeSkin(len, h, cells, 0.8, M.lime, { trim: M.marble }), box(len, 0.5, 1.4, M.marble, 0, h, 0.2));
    if (!detail.low) for (let k = 0; k < Math.floor(len / 22); k++) r.add(at(chhatri(1.1, 3.4, M.marble, GILT), -len / 2 + 11 + k * 22, h + 0.5, 0));
    g.add(at(mergeByMaterial(r), x, 0, z).rotateY(ry));
  };
  face(2 * C, 0, -C, 0);
  face(2 * C - 1.6, C, 0, -Math.PI / 2);
  face(2 * C - 1.6, -C, 0, Math.PI / 2);
  for (const s of [-1, 1]) face(C - 10, s * (C + 10) / 2, C, Math.PI);
  // The gateway in the front range: a tall arch under a gilt dome between two kiosks.
  const gate = new THREE.Group();
  gate.add(box(20, 14, 12, M.lime, 0, 0, 0), box(21, 0.6, 13, M.marble, 0, 14, 0));
  gate.add(onFace(at(arcadeSkin(20, 14, [[0, 0, 6, 11, 'door']], 1, M.lime, { trim: GILT }), 0, 0, 0), Math.PI, 5));
  gate.add(onFace(at(arcadeSkin(20, 14, [[0, 0, 6, 11, 'door']], 1, M.lime, { trim: GILT }), 0, 0, 0), 0, 5));
  gate.add(cyl(3.2, 3.2, 2, M.lime, 0, 14.6, 0, 24), at(sikhDome(3.2, GILT), 0, 16.6, 0));
  for (const x of [-8, 8]) gate.add(at(chhatri(1.4, 4.2, M.marble, GILT), x, 14.6, -4));
  g.add(at(mergeByMaterial(gate), 0, 0, C));
  // The court: marble paving, its paths in a darker stone, and lamps round the shrine.
  g.add(box(2 * C, 0.3, 2 * C, M.marble, 0, 0, 0), box(4, 0.04, C - 14, M.marbleShade, 0, 0.3, (C + 14) / 2));
  const lamps = [];
  for (let t = -32; t <= 32; t += 16) lamps.push([t, -26], [t, 26], [-26, t], [26, t]);
  g.add(lampPosts(lamps, { y: 0.3, h: 4.4 }));
  for (const z of [-14, -8]) g.add(at(nishanSahib(30), -22, 0.3, z));
  // Outside: lawns and trees, the town round about, and the Godavari to the north.
  g.add(box(700, 0.2, 700, M.grass, 0, -0.2, 0));
  g.add(trees(scatter(26, [-120, 120, -120, 120], { seed: 4, gap: 14, avoid: [[-62, 62, -62, 62]] }), { kind: 'neem', seed: 4 }));
  g.add(cityAround([-78, 78, -78, 100], { rows: detail.low ? 1 : 2, every: detail.low ? 2 : 1, fine: false, gap: 10, seed: 23, keep: [[-14, 14, 70, 400], [-400, 400, -400, -140]] }));
  g.add(sheet(1200, 160, M.river, 0, -0.05, -230), box(1200, 0.4, 20, M.bank, 0, -0.4, -145));
}

import * as THREE from 'three';
import { M, mesh, box, cyl, at, onFace, FACES, hemi, onionDome, finial, mat } from '../helpers.js';
import { archRing, archSlab, panel, frieze, rosette, windowFrame, arcadeScreen, mergeByMaterial, mughalChhatri, chhajja, merlons } from './components.js';
import { iwan, arcadeSkin, cellRow } from './mughal.js';
import { towerDetail, slitRow } from './forts.js';
import { trees, lampPosts, asiBoard, along } from './realism.js';
import { RIVER, OUTLINE } from '../monuments/red-fort.js';

// The Red Fort, finer detail. From photographs of the Lahori Gate and the walls:
// - the walls have a string course half-way up and a row of loopholes under the merlons, and the
//   round bastions are banded and slit;
// - the gatehouse face is panelled either side of the iwan with blind arches outlined in white
//   marble, rosettes in the spandrels, and a screen of small arches along its top;
// - the octagonal towers either side open in an arched window on each face of their upper storey.
// Dimensions follow js/monuments/red-fort.js: walls 10 thick centred on z = 0, the gate at z = 2.
const Rd = M.red, Rl = M.redLight, Mb = M.marble;
function architecture(f) {
  const d = new THREE.Group();
  for (const [x0, x1] of [[-60, -16], [16, 60]]) {
    const c = (x0 + x1) / 2, len = x1 - x0;
    d.add(box(len, 0.5, 0.25, Rl, c, 9, 5.1), box(len, 0.35, 0.2, Rl, c, 3.2, 5.08));
    d.add(at(slitRow(len - 3, Math.round(len / 3), 13.8, 0.35, 1.2), c, 0, 5));
  }
  for (const x of [-60, 60]) d.add(at(towerDetail(9, 8, 20, Rd, Rl, { n: 12, courses: [0.3, 0.62] }), x, 0, 2));
  // The gatehouse face (z = 11), either side of the 13 m iwan and its frame.
  for (const x of [-12, 12]) for (const y of [1.5, 11.6]) {
    d.add(at(panel(6.4, 9.4, 0.32, Mb, frieze(Rd)), x, y, 11.01));
    d.add(at(archSlab(3.8, 7.2, true, M.recess, 0.05), x, y + 0.9, 11.04), at(archRing(3.8, 7.2, true, 0.3, 0.12, Mb), x, y + 0.9, 11.04));
  }
  for (const x of [-4.4, 4.4]) d.add(at(rosette(0.8, Mb, 10), x, 20.6, 11.1));
  d.add(at(arcadeScreen(31, 1.1, 22, 0.7, 0.8, 0.3, Rl), 0, 24, 10.9));
  for (const x of [-17.5, 17.5]) {
    const t = at(new THREE.Group(), x, 0, 9);
    for (let k = 0; k < 8; k++) t.add(onFace(at(windowFrame(1.3, 3.6, Mb), 0, 18.4, 0), ((k + 0.5) / 8) * Math.PI * 2, 4.04 * Math.cos(Math.PI / 8) + 0.02));
    d.add(t);
  }
  mergeByMaterial(d);
  f.add(d);
}


// A pavilion w × d × h on its plinth, opening on every side in a row of arches onto its dim hall,
// under a deep eave and a parapet, with a chhatri on each corner if `kiosks`. Its front faces +z.
function pavilion(w, d, h, m, { arch = 3.4, kiosks = true, trim = Mb, plinth = 1.2, plinthM = m } = {}) {
  const g = new THREE.Group(), dp = 1.2, row = (len) => { const n = Math.max(1, Math.floor(len / (arch + 1.2))); return cellRow(n, len / n, 0, arch, h * 0.72); };
  g.add(box(w + 3, plinth, d + 3, plinthM), box(w - 2 * dp, h, d - 2 * dp, m, 0, plinth));
  for (const a of FACES) {
    const len = a === 0 || a === Math.PI ? w : d - 2 * dp;
    g.add(onFace(at(arcadeSkin(len, h, row(len - 1), dp, m, { trim, fill: 'room' }), 0, plinth, 0), a, (a === 0 || a === Math.PI ? d : w) / 2 - dp));
    g.add(onFace(at(chhajja(len + 0.6, 1.1, 0.6, 0.2, m), 0, plinth + h - 0.1, 0), a, (a === 0 || a === Math.PI ? d : w) / 2));
    g.add(onFace(at(merlons(len - 0.6, 0.55, 0.7, 0.25, m, 0.3), 0, plinth + h + 0.45, 0), a, (a === 0 || a === Math.PI ? d : w) / 2 - 0.2));
  }
  g.add(box(w, 0.45, d, m, 0, plinth + h));
  if (kiosks) for (const sx of [-1, 1]) for (const sz of [-1, 1]) g.add(at(mughalChhatri(1.5, 5, m, { domeM: M.gild, crescent: false }), sx * (w / 2 - 1.4), plinth + h + 0.45, sz * (d / 2 - 1.4)));
  return mergeByMaterial(g);
}

// Inside the walls, from the Lahori Gate east to the river: the Naubat Khana (the drum house) over
// the inner gate; the red sandstone Diwan-i-Aam, its throne alcove of white marble at the back; then
// along the old river wall, the white marble palaces: the Diwan-i-Khas with its four gilded kiosks,
// the Rang Mahal, the Khas Mahal with the octagonal Musamman Burj leaning out over the wall, the
// Mumtaz Mahal, and in the north the Hayat Bakhsh Bagh and the three bulbous domes of the Moti
// Masjid; the Chhatta Chowk bazaar just inside the gate. Lawns between, and the Yamuna's old bed
// beyond (now a green belt and the ring road).
function insideWalls(g) {
  const d = new THREE.Group(), RW = RIVER;
  // The ground inside: lawns, and the paved way from the Lahori Gate to the Diwan-i-Aam.
  // The lawn follows the octagon (shrunk 6 m inside the walls), as a thin slab.
  const lawn = new THREE.Shape(OUTLINE.map(([x, z]) => new THREE.Vector2(x * 0.985, -(z * 0.985 - 6))));
  d.add(mesh(new THREE.ExtrudeGeometry(lawn, { depth: 0.3, bevelEnabled: false }).rotateX(-Math.PI / 2), M.grass), box(16, 0.35, 270, M.path, 0, 0, -142));
  // Chhatta Chowk: the covered bazaar just inside the gate, two storeys of shop arches facing each
  // other across its street under a vaulted roof with an octagonal court at its middle.
  for (const s of [-1, 1]) {
    const len = 74, cells = [];
    for (let k = 0; k < 18; k++) { const t = -len / 2 + (k + 0.5) * (len / 18); if (Math.abs(t) > 5) cells.push([t, 0.4, 2.6, 3.6, 'room'], [t, 5, 2.2, 2.8, 'jali']); }
    const r = new THREE.Group();
    r.add(box(len, 9, 6, Rd, 0, 0, -3 - 1.2), at(arcadeSkin(len, 9, cells, 1.2, Rd, { trim: Rl }), 0, 0, -1.2), box(len + 0.4, 0.6, 8, Rl, 0, 9, -3.6));
    d.add(at(r, s * 8, 0, -52).rotateY(s > 0 ? -Math.PI / 2 : Math.PI / 2));
  }
  d.add(box(8.4, 0.6, 74, Rl, 0, 11, -52), cyl(6, 6, 0.8, Rl, 0, 11.6, -52, 8));
  // Naubat Khana, the drum house over the inner gate.
  d.add(box(30, 13, 11, Rd, 0, 0, -160), box(31, 0.8, 12, Rl, 0, 13, -160));
  d.add(onFace(at(iwan(5, 8, { m: Rd, trim: Mb, shade: Rl, depth: 1.2, frame: 1, top: 1.2, fill: 'room' }), 0, 0, -160), 0, 5.5));
  for (const x of [-10, 10]) d.add(onFace(at(windowFrame(2, 3, Mb), 0, 8, -160), 0, 5.5, x));
  // Diwan-i-Aam, in its court.
  d.add(at(pavilion(54, 22, 10, Rd, { arch: 4.2, kiosks: false, trim: Rl }), 0, 0, -280));
  d.add(at(mughalChhatri(2.2, 7, Rd, { crescent: false }), -26, 11.6, -270), at(mughalChhatri(2.2, 7, Rd, { crescent: false }), 26, 11.6, -270));
  // The river wall's terrace, and the white marble palaces on it.
  d.add(box(620, 9, 16, Rd, 0, 0, RW + 13), box(622, 0.6, 17, Rl, 0, 9, RW + 13), box(620, 0.4, 30, M.path, 0, 0, RW + 36));
  const P = (o, x, z = RW + 15) => d.add(at(o, x, 9.6, z));
  P(pavilion(30, 20, 8.5, Mb, { arch: 3.6 }), -60);
  P(pavilion(50, 18, 7, Mb, { arch: 3.2, kiosks: false }), 0);
  P(pavilion(26, 15, 7, Mb, { arch: 3 }), 48);
  P(pavilion(22, 13, 6.5, Mb, { arch: 2.8, kiosks: false }), 92);
  P(pavilion(26, 16, 7, Mb, { arch: 3 }), -140);
  // Musamman Burj: an octagonal tower over the river wall, with a gilded dome.
  d.add(cyl(5.4, 6, 17.6, Rd, 48, 0, RW - 6, 8), cyl(5, 5, 6, Mb, 48, 17.6, RW - 6, 8));
  d.add(at(hemi(4.6, M.gild, 24), 48, 23.6, RW - 6), at(finial(3), 48, 28, RW - 6));
  // Hayat Bakhsh Bagh, the garden to the north of the palaces, with its pavilions and channels.
  d.add(box(120, 0.4, 120, M.grass, -220, 0, RW + 100), box(4, 0.5, 120, M.water, -220, 0, RW + 100), box(120, 0.5, 4, M.water, -220, 0, RW + 100));
  for (const x of [-280, -160]) d.add(at(pavilion(14, 10, 6, Mb, { arch: 2.6, kiosks: false }), x, 0, RW + 100));
  // Moti Masjid: a walled marble mosque with three bulbous domes.
  const mm = at(new THREE.Group(), -120, 0, RW + 70);
  mm.add(box(30, 6, 26, Rd), box(22, 7, 12, Mb, 0, 0, -5), box(22.6, 0.5, 12.6, Mb, 0, 7, -5));
  mm.add(onFace(at(arcadeSkin(22, 6.4, cellRow(3, 6.4, 0, 4, 5.4), 1, Mb, { fill: 'room' }), 0, 0, 0), 0, 1));
  for (const x of [-6.5, 0, 6.5]) mm.add(cyl(2.4, 2.4, 1.2, Mb, x, 7.5, -5, 24), at(onionDome(x ? 2.4 : 2.9, Mb), x, 8.7, -5), at(finial(2, M.gild), x, 8.7 + (x ? 4.4 : 5.4), -5));
  d.add(mm);
  // The old river bed beyond the wall (now a green belt and the ring road).
  d.add(box(1000, 0.2, 80, M.grass, 0, 0, RW - 48));
  g.add(mergeByMaterial(d));
}

// The Red Fort, from Netaji Subhash Marg: the neem trees on the strip of lawn along the moat,
// lamps, and the ASI board.
export function addDetails(f, g) {
  architecture(f);
  insideWalls(g);
  g.add(trees(along(14, [-140, 18], [140, 18]).filter(([x]) => Math.abs(x) > 20), { kind: 'neem', seed: 16 }));
  g.add(lampPosts([...along(12, [-140, 25.5], [140, 25.5]), ...along(12, [-140, 46.5], [140, 46.5])]));
  g.add(asiBoard('Red Fort Complex', 22, 24, 0, { line2: 'WORLD HERITAGE SITE' }));
}

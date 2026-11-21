import * as THREE from 'three';
import { M, mesh, box, cyl, at, onFace, FACES, hemi, onionDome, finial, mat, surface, ribbed } from '../helpers.js';
import { archRing, archSlab, panel, frieze, rosette, windowFrame, mergeByMaterial, mughalChhatri, chhajja, merlons, jharokha, chadar, banglaRoof } from '../parts/components.js';
import { iwan, arcadeSkin, cellRow } from '../parts/mughal.js';
import { towerDetail, slitRow, fortGate } from '../parts/forts.js';
import { elephant } from '../parts/animals.js';
import { trees, lampPosts, asiBoard, along } from '../parts/realism.js';
import { detail } from '../detail.js';
import { RIVER, OUTLINE, BZ } from '../monuments/red-fort.js';

// The Red Fort, finer detail. From photographs of the Lahori Gate and the walls:
// - the walls have a string course half-way up and a row of loopholes under the merlons, and the
//   round bastions are banded and slit;
// - the gatehouse face is panelled either side of the iwan with blind arches outlined in white
//   marble, rosettes in the spandrels, and a screen of small arches along its top;
// - the octagonal towers either side open in an arched window on each face of their upper storey.
// Dimensions follow js/monuments/red-fort.js: walls 10 thick centred on z = 0, the gate at z = 2.
const Rd = M.red, Rl = M.redLight, Mb = M.marble, GILT_SHEET = surface(mat('#d9a93a', 0.32, 0.8), 'giltsheet'), ELEPHANT = mat('#2b2a2c', 0.6);
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
  for (const x of [-17.5, 17.5]) {
    const t = at(new THREE.Group(), x, 0, 9);
    for (let k = 0; k < 8; k++) t.add(onFace(at(windowFrame(1.3, 3.6, Mb), 0, 18.4, 0), ((k + 0.5) / 8) * Math.PI * 2, 4.04 * Math.cos(Math.PI / 8) + 0.02));
    d.add(t);
  }
  mergeByMaterial(d);
  f.add(d);
}


// A kiosk for phones: a drum and a dome, without columns.
const chhatriLow = (r, h) => new THREE.Group().add(cyl(r * 0.9, r * 0.9, h * 0.45, Rd, 0, 0, 0, 8), at(hemi(r, Rd, 12), 0, h * 0.45, 0));

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
  const d = new THREE.Group(), RW = RIVER, low = detail.low;
  // The ground inside: lawns, and the paved way from the Lahori Gate to the Diwan-i-Aam.
  // The lawn follows the octagon (shrunk 6 m inside the walls), as a thin slab.
  const lawn = new THREE.Shape(OUTLINE.map(([x, z]) => new THREE.Vector2(x * 0.985, -(z * 0.985 - 6))));
  d.add(mesh(new THREE.ExtrudeGeometry(lawn, { depth: 0.3, bevelEnabled: false }).rotateX(-Math.PI / 2), M.grass), box(16, 0.35, 270, M.path, 0, 0, -142));
  // Chhatta Chowk: the covered bazaar just inside the gate, two storeys of shop arches facing each
  // other across its street under a vaulted roof with an octagonal court at its middle.
  for (const s of [-1, 1]) {
    const len = 74, cells = [];
    for (let k = 0; k < 18; k++) { const t = -len / 2 + (k + 0.5) * (len / 18); if (Math.abs(t) > 5) { cells.push([t, 0.4, 2.6, 3.6, 'room']); if (!low) cells.push([t, 5, 2.2, 2.8, 'jali']); } }
    const r = new THREE.Group();
    r.add(box(len, 9, 6, Rd, 0, 0, -3 - 1.2), at(arcadeSkin(len, 9, cells, 1.2, Rd, { trim: Rl }), 0, 0, -1.2), box(len + 0.4, 0.6, 8, Rl, 0, 9, -3.6));
    d.add(at(r, s * 8, 0, -52).rotateY(s > 0 ? -Math.PI / 2 : Math.PI / 2));
  }
  d.add(box(8.4, 0.6, 74, Rl, 0, 11, -52), cyl(6, 6, 0.8, Rl, 0, 11.6, -52, 8));
  // Naubat Khana, the drum house over the inner gate: three storeys of red sandstone, the gate
  // arch below between two tiers of niches, the musicians' gallery above opening in five cusped
  // arches, a deep eave, a white parapet, and a kiosk on each front corner.
  const nk = at(new THREE.Group(), 0, 0, -160);
  nk.add(box(25, 15, 12, Rd), box(26, 1.3, 13, Mb, 0, 15, 0), box(26.4, 0.25, 13.4, Rl, 0, 16.3, 0));
  for (const a of low ? [0] : [0, Math.PI]) {
    nk.add(onFace(iwan(5.4, 8, { m: Rd, trim: Mb, shade: Rl, depth: 1.2, frame: 0.9, top: 0.6, fill: 'room' }), a, 6));
    nk.add(onFace(at(arcadeSkin(19, 4.6, cellRow(5, 3.6, 0.3, 2.6, 3.6).map((c) => [...c, 'jali']), 0.6, Rd, { trim: Mb }), 0, 9.6, 0), a, 5.4), onFace(at(chhajja(25.6, 1.4, 0.7, 0.2, Rd), 0, 14.7, 0), a, 6));
    for (const x of [-9.3, 9.3]) for (const y of [1.2, 5]) nk.add(onFace(at(archSlab(1.9, 2.9, true, M.recess, 0.05), 0, y, 0), a, 6.02, x), onFace(at(archRing(1.9, 2.9, true, 0.18, 0.08, Mb), 0, y, 0), a, 6.02, x));
  }
  for (const x of [-11, 11]) nk.add(at(mughalChhatri(1.5, 4.6, Rd, { domeM: Mb, crescent: false }), x, 16.3, 4.4));
  d.add(nk);
  // Diwan-i-Aam, in its court.
  d.add(at(pavilion(54, 22, 10, Rd, { arch: 4.2, kiosks: false, trim: Rl }), 0, 0, -280));
  d.add(box(54.6, 1.1, 22.6, Mb, 0, 11.65, -280));
  d.add(at(mughalChhatri(2.2, 7, Rd, { domeM: Mb, crescent: false }), -25.5, 12.75, -270.5), at(mughalChhatri(2.2, 7, Rd, { domeM: Mb, crescent: false }), 25.5, 12.75, -270.5));
  // The emperor's throne canopy against the back wall, in white marble under a curved roof.
  if (!low) d.add(at(jharokha(4, 4.4, Mb, { d: 2.2, trim: Mb }), 0, 3.4, -288.6));
  // The river wall's terrace, and the white marble palaces on it.
  d.add(box(620, 9, 16, Rd, 0, 0, RW + 13), box(622, 0.6, 17, Rl, 0, 9, RW + 13), box(620, 0.4, 30, M.path, 0, 0, RW + 36));
  const P = (o, x, z = RW + 15) => d.add(at(o, x, 9.6, z));
  // From the north (-x): the Shah Burj with its marble pavilion under a curved roof; the little
  // Hira Mahal; the Hammam, a plain low block under three shallow domes; the Diwan-i-Khas with a
  // kiosk on each corner; the Khas Mahal; the long low Rang Mahal behind its lotus pool; and the
  // Mumtaz Mahal.
  P(low ? box(14, 6.7, 10, Mb) : pavilion(14, 10, 5.5, Mb, { arch: 2.4, kiosks: false }), -250);
  d.add(at(banglaRoof(15, 6, 2.4, Mb), -250, 9.6 + 7.2, RW + 15), cyl(7, 7.6, 15, Rd, -300, 0, RW + 4, 8), cyl(6, 6, 4.5, Mb, -300, 15, RW + 4, 8), at(hemi(5.6, Mb, 24), -300, 19.5, RW + 4), at(finial(3), -300, 25, RW + 4));
  P(low ? box(11, 6.2, 8, Mb) : pavilion(11, 8, 5, Mb, { arch: 2.4, kiosks: false }), -196);
  P(box(34, 6.5, 18, Mb), -140);
  for (const x of [-10, 0, 10]) { const dm = at(hemi(x ? 3.2 : 4, Mb, 20), -140 + x, 16.1, RW + 15); dm.scale.y = 0.55; d.add(dm); }
  P(pavilion(30, 20, 8.5, Mb, { arch: 3.6 }), -84, RW + 15.7);
  P(pavilion(26, 15, 7, Mb, { arch: 3 }), -34);
  P(pavilion(50, 18, 6.5, Mb, { arch: 3.4, kiosks: false }), 24);
  for (const x of [-22, 22]) d.add(at(mughalChhatri(1.5, 4.6, Mb, { crescent: false }), 24 + x, 9.6 + 8.2, RW + 22));
  // The lotus pool before the Rang Mahal, fed by the Stream of Paradise that ran through the palaces.
  d.add(box(26, 0.5, 26, Mb, 24, 0, RW + 52), box(22, 0.56, 22, M.water, 24, 0, RW + 52), box(6, 0.9, 6, Mb, 24, 0, RW + 52), box(420, 0.45, 1.6, M.water, -70, 0, RW + 34));
  P(low ? box(24, 7.7, 14, Mb) : pavilion(24, 14, 6.5, Mb, { arch: 3, kiosks: false }), 84);
  // Musamman Burj: an octagonal tower over the river wall, with a gilded dome.
  d.add(cyl(5.4, 6, 17.6, Rd, -34, 0, RW - 6, 8), cyl(5, 5, 6, Mb, -34, 17.6, RW - 6, 8));
  d.add(at(hemi(4.6, M.gild, 24), -34, 23.6, RW - 6), at(finial(3), -34, 28, RW - 6));
  // The Jharokha-i-Darshan: the balcony on the tower's river face where the emperor showed himself
  // each morning, in marble under a curved roof of gilded copper.
  const jd = onFace(at(jharokha(2.2, 2.4, Mb, { d: 1.1, trim: Mb, roofM: GILT_SHEET }), 0, 18.6, 0), Math.PI - Math.PI / 8, 4.62);
  jd.position.x += -34;
  jd.position.z += RW - 6;
  d.add(jd);
  // Hayat Bakhsh Bagh, the garden to the north of the palaces, with its pavilions and channels.
  d.add(box(120, 0.4, 120, M.grass, -220, 0, RW + 100), box(4, 0.5, 120, M.water, -220, 0, RW + 100), box(120, 0.5, 4, M.water, -220, 0, RW + 100));
  // The Sawan and Bhadon pavilions at the ends of the cross channel pour their water into it down
  // carved cascades (chadars).
  for (const s of [-1, 1]) { const c = at(chadar(3.4, 4.5, 1.2), -220 + s * 51.4, 0.5, RW + 100); c.rotation.y = s > 0 ? -Math.PI / 2 : Math.PI / 2; d.add(c); }
  for (const x of [-280, -160]) d.add(at(pavilion(14, 10, 6, Mb, { arch: 2.6, kiosks: false }), x, 0, RW + 100));
  // The Zafar Mahal, the last emperor's red pavilion, standing in the tank at the garden's middle.
  d.add(box(46, 0.5, 46, Rd, -220, 0, RW + 100), box(42, 0.56, 42, M.water, -220, 0, RW + 100), at(low ? box(13, 6.6, 13, Rd) : pavilion(13, 13, 5, Rd, { arch: 2.6, kiosks: false, trim: Rl, plinth: 1.6 }), -220, 0, RW + 100));
  // Moti Masjid, Aurangzeb's private mosque: high white walls crowned with merlons and a slender
  // pinnacle at each corner, and over the prayer hall three bulbous domes, ribbed, the middle one
  // the largest.
  const mm = at(new THREE.Group(), -120, 0, RW + 70);
  mm.add(box(15, 9, 22, Mb), box(15.4, 0.4, 22.4, Mb, 0, 9, 0));
  for (const a of FACES) {
    const len = a === 0 || a === Math.PI ? 15 : 22;
    mm.add(onFace(at(merlons(len - 0.4, 0.8, 1.0, 0.25, Mb, 0.3), 0, 9.4, 0), a, (len === 15 ? 22 : 15) / 2 - 0.15));
  }
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) mm.add(cyl(0.3, 0.38, 13, Mb, sx * 7.5, 0, sz * 11, 8), at(onionDome(0.5, Mb), sx * 7.5, 13, sz * 11));
  mm.add(onFace(at(archSlab(2.2, 3.6, true, M.recess, 0.05), 0, 0.6, 0), Math.PI / 2, 7.52), onFace(at(archRing(2.2, 3.6, true, 0.2, 0.1, Mb), 0, 0.6, 0), Math.PI / 2, 7.52));
  for (const z of [-6.4, 0, 6.4]) { const r = z ? 2.5 : 3.1; mm.add(cyl(r * 0.9, r * 0.9, 1.3, Mb, -2.5, 9.4, z, 24), at(ribbed(onionDome(r, Mb), 16, 0.06), -2.5, 10.7, z), at(finial(2.2, M.gild), -2.5, 10.7 + r * 1.8, z)); }
  d.add(mm);
  // The barracks the British army built after 1857 across the palace gardens: long three-storey
  // ranges of arcaded verandahs.
  for (const [x, z, ry] of [[-200, -250, 0], [-200, -330, 0], [-330, -290, Math.PI / 2]]) {
    const bk = at(new THREE.Group(), x, 0, z), cells = cellRow(16, 5.4, 0, 3.2, 3.6);
    bk.rotation.y = ry;
    bk.add(box(88, 15, 15, M.buff), box(89, 0.6, 16.6, Rl, 0, 15, 0), box(90, 1.2, 18, Rd, 0, 15.6, 0));
    // On phones the verandahs are dark bands, without their arches.
    for (const a of [0, Math.PI]) for (const y of [0.4, 5.3, 10.2]) bk.add(low ? onFace(box(86, 3.4, 0.06, M.recess, 0, y + 0.4, 0), a, 7.53) : onFace(at(arcadeSkin(87, 4.7, cells, 1.4, M.buff, { trim: Rl, fill: 'room', pointed: false }), 0, y, 0), a, 7.5 - 1.4 + 0.02));
    d.add(bk);
  }
  // The Delhi Gate in the south wall, like the Lahori Gate and with a barbican of its own; between
  // the two stand the stone elephants Lord Curzon set up.
  const dg = at(new THREE.Group(), 446, 0, -288);
  dg.rotation.y = Math.PI / 2 - 0.045;
  // On phones the gate is a plain block with its arch drawn on it.
  if (low) dg.add(box(28, 22, 16, Rd, 0, 0, 2), at(archSlab(12, 20, true, M.recess, 0.05), 0, 0, 10.02));
  else dg.add(at(fortGate(28, 22, 16, 6, 10, { m: Rd, trim: Mb, iwan: { w: 12, h: 20, depth: 3.5 }, crest: false }), 0, 0, 2));
  for (const x of [-15.5, 15.5]) dg.add(cyl(3.8, 4.1, 24, Rd, x, 0, 8, 8), at(low ? chhatriLow(3, 7.5) : mughalChhatri(3, 7.5, Rd, { domeM: Rd, crescent: false }), x, 24, 8));
  if (!low) for (let k = -3; k <= 3; k++) dg.add(at(mughalChhatri(1.1, 3.6, Rd, { domeM: Mb, crescent: false }), k * 3, 22.4, 9));
  dg.add(box(5, 10, 44, Rd, -34, 0, 30), box(5, 10, 44, Rd, 34, 0, 30), box(73, 10, 5, Rd, 0, 0, 52));
  for (const sx of [-1, 1]) dg.add(cyl(6, 6.6, 12.5, Rd, sx * 34, 0, 52, 8), at(low ? chhatriLow(4, 8.5) : mughalChhatri(4, 8.5, Rd, { domeM: Rd, crescent: false }), sx * 34, 12.5, 52), ...(low ? [] : [at(elephant(ELEPHANT, 1, { coarse: true }), sx * 9, 0, 16).rotateY(sx * -0.5)]));
  d.add(dg);
  // The old river bed beyond the wall (now a green belt and the ring road).
  d.add(box(1000, 0.2, 80, M.grass, 0, 0, RW - 48));
  g.add(mergeByMaterial(d));
}

// The Red Fort, from Netaji Subhash Marg: the neem trees on the strip of lawn along the moat,
// lamps, and the ASI board.
export function addDetails(f, g) {
  architecture(f);
  insideWalls(g);
  g.add(trees([...along(6, [-150, 30], [-62, 30]), ...along(6, [62, 30], [150, 30])], { kind: 'neem', seed: 16 }));
  g.add(lampPosts([...along(12, [-140, BZ + 104], [140, BZ + 104]), ...along(12, [-140, BZ + 132], [140, BZ + 132])]));
  g.add(asiBoard('Red Fort Complex', -70, BZ + 14, 0, { line2: 'WORLD HERITAGE SITE' }));
}

import * as THREE from 'three';
import { M, mat, box, cyl, at, onFace, FACES, chhatri, sheet, surface, inst, unitBox, rng } from '../helpers.js';
import { panel, frieze, rosette, mergeByMaterial } from '../parts/components.js';
import { arcadeSkin } from '../parts/mughal.js';
import { GILT, sikhDome, nishanSahib } from '../parts/sikh.js';
import { trees, lampPosts, cityAround, scatter } from '../parts/realism.js';
import { detail } from '../detail.js';

// The dark lettering cut in the terrace's marble panels.
const INK = surface(mat('#f1ede4', 0.5), 'script');

// A line of raised Gurmukhi len long and h high on a wall at z = 0, its foot at y = 0: the headline
// the letters hang from, and under it the letters as blocks of uneven width in words.
function gurmukhi(len, h, m, seed = 7) {
  const R = rng(seed), list = [[0, h * 0.86, 0, len, h * 0.14, 0.05]];
  for (let x = -len / 2 + 0.05; x < len / 2 - h * 0.5;) {
    const w = h * (0.35 + R() * 0.3);
    list.push([x + w / 2, R() < 0.25 ? -h * 0.15 : 0, 0, w, h, 0.04]);
    x += w + h * (R() < 0.2 ? 0.5 : 0.14);
  }
  return inst(unitBox(), list, m);
}

// Hazur Sahib, finer detail. From photographs: the only gilding on the marble front is lettering
// and plaques: a line of gilt Gurmukhi across the wall above the windows, a long gilt plaque over
// the middle doorway with small ones either side of the doors, and gilt panels in the windows.
// The balustrade's solid panels are inscribed in dark letters (Satnam at one corner, Waheguru at
// the other, a verse in the middle). Carved panels fill the wall under the windows and bays, and
// rosettes sit in the spandrels of the blind arches. Dimensions follow
// js/monuments/takht-sri-hazur-sahib.js: the plinth P high, the block W1 square, its registers Ha
// and Hb high, the doors bx apart and the end bays at ex.
function architecture(f, { P, W1, Ha, Hb, bx, ex }) {
  const d = new THREE.Group(), z = W1 / 2 + 0.02, T = P + Ha + Hb + 0.35;
  d.add(at(gurmukhi(12.5, 0.42, GILT), 0, P + Ha + Hb - 1.15, z));
  d.add(box(3, 0.5, 0.08, GILT, 0, P + 4.7, z), box(1.6, 0.3, 0.08, GILT, 0, P + 5.3, z));
  for (const x of [-bx * 1.5, -bx / 2, bx / 2, bx * 1.5]) d.add(box(0.42, 0.75, 0.06, GILT, x, P + 3.6, z));
  for (const x of [-bx, 0, bx]) d.add(box(1.5, 1.5, 0.05, GILT, x, P + Ha + 1.75, W1 / 2 - 0.3));
  for (const a of FACES) {
    for (const x of [-bx, 0, bx]) d.add(onFace(at(panel(2.3, 0.8, 0.1, M.marbleShade, frieze(M.marble)), 0, P + Ha + 0.4, 0), a, W1 / 2 + 0.01, x));
    for (const s of [-1, 1]) {
      d.add(onFace(at(rosette(0.32, M.marbleShade), 0, P + 4.9, 0), a, W1 / 2 + 0.01, s * ex), onFace(at(panel(3.4, 0.8, 0.1, M.marbleShade, frieze(M.marble)), 0, P + 5.5, 0), a, W1 / 2 + 0.01, s * ex));
      if (!detail.low) d.add(onFace(box(2.6, 0.5, 0.03, INK, 0, T + 0.4, 0), a, W1 / 2 + 0.11, s * (W1 - 3.4) / 2));
    }
    d.add(onFace(box(2.6, 0.7, 0.03, INK, 0, T + 0.3, 0), a, W1 / 2 + 0.11));
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
  // The two Nishan Sahibs, wrapped in saffron, flanking the front and standing higher than the dome.
  for (const x of [-12.5, 12.5]) g.add(at(nishanSahib(33), x, 0.3, 15));
  // Outside: lawns and trees, the town round about, and the Godavari to the north.
  g.add(box(700, 0.2, 700, M.grass, 0, -0.2, 0));
  g.add(trees(scatter(26, [-120, 120, -120, 120], { seed: 4, gap: 14, avoid: [[-62, 62, -62, 62]] }), { kind: 'neem', seed: 4 }));
  g.add(cityAround([-78, 78, -78, 100], { rows: detail.low ? 1 : 2, every: detail.low ? 2 : 1, fine: false, gap: 10, seed: 23, keep: [[-14, 14, 70, 400], [-400, 400, -400, -140]] }));
  g.add(sheet(1200, 160, M.river, 0, -0.05, -230), box(1200, 0.4, 20, M.bank, 0, -0.4, -145));
}

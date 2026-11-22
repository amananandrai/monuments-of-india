import * as THREE from 'three';
import { M, box, cyl, at, onFace, FACES, chhatri, sheet } from '../helpers.js';
import { panel, frieze, jharokha, chhajja, mergeByMaterial } from '../parts/components.js';
import { arcadeSkin } from '../parts/mughal.js';
import { GILT, sikhDome, nishanSahib } from '../parts/sikh.js';
import { trees, lampPosts, cityAround, scatter } from '../parts/realism.js';
import { detail } from '../detail.js';

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

import * as THREE from 'three';
import { M, mat, cyl, at, onFace, FACES, pidaRoof, sheet } from '../helpers.js';
import { chhajja, mouldings, templeNiche, pilasters, mergeByMaterial } from './components.js';
import { figureFrieze, haraRow, kuta, figure, instances, kuduGeo } from './sculpture.js';
import { trees, asiBoard, scatter } from './realism.js';
import { detail } from '../detail.js';

// Vittala, Hampi, finer detail. The halls' pillars are carved in the builder (clustered "musical"
// pillars, and yali pillars along the outer rows of the main hall and the Kalyana Mandapa). From
// photographs, this adds:
// - on each hall's plinth, mouldings and a frieze of horses led by grooms, elephants and dancers;
// - a deep curved eave round each hall and, over it, a parapet of miniature shrines (kutas at the
//   corners, barrel-roofed shalas between);
// - on the sanctum, pot-pilasters (kumbha-panjaras) and niches with images on its three outer
//   faces, and a kuta on each corner of every storey of its tower, which ends in a domed stupi;
// - on the stone chariot (the Garuda shrine), friezes round its base, pilasters and an image on
//   each face of its shrine, and miniature shrines on its roof;
// - on the brick storeys of the ruined east gopuram, pilasters with stucco figures in niches
//   between them and a row of kudus along each cornice; and niches with door-keepers either side
//   of the passage through its granite base.
// Dimensions follow js/monuments/vittala-temple-hampi.js.
const GRANITE = mat('#a58d6e', 0.9), GRANITE_DARK = mat('#7d6a53', 0.9);
const STUCCO = mat('#cdb79a', 0.9);
function architecture(f) {
  const d = new THREE.Group();
  for (const [w, dd, h, cx, cz] of [[34, 28, 6, 0, -6], [20, 20, 5, -30, 28], [18, 18, 5, 30, -40]]) {
    const hall = at(new THREE.Group(), cx, 0, cz);
    hall.add(mouldings(w, dd, [[0, 0.35, 0.2, GRANITE], [2.2, 0.35, 0.2, GRANITE]], GRANITE));
    for (const a of FACES) {
      const long = Math.abs(Math.sin(a)) < 0.5, len = long ? w : dd, dist = (long ? dd : w) / 2;
      hall.add(onFace(at(figureFrieze(len - 0.6, 1.2, GRANITE, { pitch: detail.low ? 3 : 1.5, kinds: ['horse', 'standing', 'elephant', 'dancer'] }), 0, 0.6, 0), a, dist));
      hall.add(onFace(at(chhajja(len + 2.4, 1.6, 0.9, 0.15, GRANITE_DARK), 0, 2.6 + h + 0.4, 0), a, dist + 0.8));
      hall.add(onFace(at(haraRow(len - 0.6, detail.low ? 1.4 : 1.0, GRANITE), 0, 4.3 + h, 0), a, dist - 0.75));
    }
    d.add(hall);
  }
  // The sanctum (16 square, 9 high at z = -28; its front against the hall).
  const sn = at(new THREE.Group(), 0, 0, -28);
  sn.add(mouldings(16, 16, [[0, 0.5, 0.3, GRANITE_DARK], [0.5, 0.4, 0.15], [8.3, 0.5, 0.35, GRANITE_DARK]], GRANITE));
  for (const a of [Math.PI, Math.PI / 2, -Math.PI / 2]) {
    sn.add(onFace(at(pilasters(14.6, 6, 0.55, 7.2, 0.16, GRANITE), 0, 0.95, 0), a, 8));
    for (const l of [-4.4, 0, 4.4]) sn.add(onFace(at(templeNiche(1.5, 3.2, GRANITE, { figure: figure(2.8, GRANITE, l ? 'standing' : 'seated') }), 0, 2.4, 0), a, 8, l));
    // Pots at the foot of the pilasters (the kumbha of the kumbha-panjara).
    for (let k = 0; k < 6; k++) sn.add(onFace(cyl(0.32, 0.22, 0.6, GRANITE, 0, 0.95, 0.2, 8), a, 8, -7.3 + k * (14.6 / 5)));
  }
  const roof = pidaRoof(15, 6, 4, 0.9, GRANITE, GRANITE_DARK);
  for (let k = 0; k < 4; k++) {
    const w = 15 + (6 - 15) * (k / 3), y = 9 + k * 0.9 * 1.55 + 0.9;
    for (const x of [-1, 1]) for (const z of [-1, 1]) sn.add(at(kuta(0.9, GRANITE), x * (w / 2 - 0.45), y, z * (w / 2 - 0.45)));
  }
  const ty = 9 + roof.userData.top;
  sn.add(cyl(2.2, 2.4, 1, GRANITE, 0, ty, 0, 8), at(kuta(4.4, GRANITE), 0, ty + 1, 0));
  d.add(sn);
  // The stone chariot at z = 30: base 6 × 3.6 × 9, its shrine 4.6 × 4.2 × 6 from y 4.2.
  const ch = at(new THREE.Group(), 0, 0, 30);
  for (const a of FACES) {
    const long = Math.abs(Math.sin(a)) > 0.5, len = long ? 9 : 6, dist = long ? 3 : 4.5;
    ch.add(onFace(at(figureFrieze(len - 0.4, 0.8, GRANITE, { pitch: detail.low ? 1.6 : 0.95, kinds: ['horse', 'dancer', 'elephant', 'standing'] }), 0, 0.32, 0), a, dist));
    ch.add(onFace(at(figureFrieze(len - 0.4, 0.6, GRANITE, { pitch: detail.low ? 1.2 : 0.7, kinds: ['standing', 'dancer'] }), 0, 2.5, 0), a, dist));
    const sl = long ? 6 : 4.6, sd = long ? 2.3 : 3;
    ch.add(onFace(at(pilasters(sl - 0.5, 4, 0.35, 3.8, 0.12, GRANITE), 0, 4.25, 0), a, sd));
    ch.add(onFace(at(templeNiche(1, 2.3, GRANITE, { figure: figure(2, GRANITE, 'standing') }), 0, 5, 0), a, sd));
  }
  for (const x of [-1, 1]) for (const z of [-1, 1]) ch.add(at(kuta(0.6, GRANITE), x * 2.3, 8.4 + 0.6, z * 2.75));
  d.add(ch);
  // The east gopuram at z = 76: its brick storeys [w, h, d, x, y] and the granite base 18 × 9 × 12.
  const gp = at(new THREE.Group(), 0, 0, 76), kd = [];
  for (const [w, h, dd, x, y] of [[15, 4, 10, 0, 9], [12, 3.5, 8, -0.6, 13], [7, 2.4, 6, 1.2, 16.5]]) for (const s of [-1, 1]) {
    const face = at(new THREE.Group(), x, y, s * (dd / 2));
    face.rotation.y = s > 0 ? 0 : Math.PI;
    const n = Math.max(2, Math.floor(w / 2.4));
    face.add(pilasters(w - 0.6, n + 1, 0.35, h * 0.8, 0.14, STUCCO));
    for (let k = 0; k < n; k++) face.add(at(templeNiche(0.9, h * 0.5, STUCCO, { figure: figure(h * 0.45, STUCCO, k % 2 ? 'dancer' : 'standing'), crown: false }), -(w - 0.6) / 2 + (k + 0.5) * ((w - 0.6) / n), h * 0.12, 0));
    gp.add(face);
    for (let k = 0; k < Math.floor(w / 1.4); k++) kd.push([x - w / 2 + (k + 0.5) * (w / Math.floor(w / 1.4)), y + h - 0.45, s * (dd / 2 + 0.06), 1, 1, 1, s > 0 ? 0 : Math.PI]);
  }
  for (const s of [-1, 1]) for (const xs of [-1, 1]) {
    const nch = at(templeNiche(1.4, 3.4, GRANITE, { figure: figure(3, GRANITE, 'standing') }), xs * 5.4, 1.2, s * 6);
    nch.rotation.y = s > 0 ? 0 : Math.PI;
    gp.add(nch);
  }
  d.add(gp);
  mergeByMaterial(d);
  f.add(d, instances(kuduGeo(), kd.map(([x, y, z, a, b, c, r]) => [x, y, z + 76, a, b, c, r]), STUCCO));
}

// The Vittala temple at Hampi: the Tungabhadra beyond the boulders, coconut palms on its bank, and the ASI
// board.
export function addDetails(f, g) {
  architecture(f);
  // The Tungabhadra, north of the compound (which ends at z = -76), running on east and west,
  // and the palms along its near bank. It lies on the land beside the framed group.
  g.add(sheet(900, 70, M.river, 0, 0.14, -165));
  g.add(trees(scatter(14, [-150, 150, -126, -108], { seed: 4, gap: 12 }), { kind: 'palm', seed: 4 }));
  g.add(asiBoard('Vittala Temple, Hampi', 10, 90, 0, { line2: 'WORLD HERITAGE SITE' }));
}

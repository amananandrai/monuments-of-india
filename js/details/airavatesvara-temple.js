import * as THREE from 'three';
import { M, mat, at, onFace, FACES, box } from '../helpers.js';
import { templeNiche, idol, mergeByMaterial } from '../parts/components.js';
import { figureFrieze, kuduGeo, instances } from '../parts/sculpture.js';
import { trees, shrubs, asiBoard, lampPosts, along, scatter } from '../parts/realism.js';
import { enclosure } from '../monuments/airavatesvara-temple.js';
import { detail } from '../detail.js';

// Darasuram's granite, warm and pale; the gopuram's stone in its courses.
export const GRANITE = mat('#b09a7c', 0.9);
export const SHADE = mat('#857259', 0.92);
export const GOPURAM_STONE = ['#a8916f', '#988263', '#b8a180', '#9f8968'];

// B: the sanctum's moulded base; VW, VH: its width and height (to the eave), at z = vz; the closed
// hall at mz; the chariot hall aw × ad on a platform AB high, pillars AH, at az; the enclosure EW
// wide running back ED from its gopuram at ez.
export const DIMS = { B: 1.2, VW: 12, VH: 7, vz: -18, mz: -0.5, az: 13, aw: 13, ad: 14, AB: 2.4, AH: 4, ez: 50, EW: 62, ED: 92 };

// Airavatesvara, finer detail. From photographs:
// - the storeys of the vimana are lined with kudus along their cornices, over the miniature
//   shrines the builder sets on their edges;
// - in the sanctum's walls, deities in niches (devakoshtas): Dakshinamurti on the south,
//   Lingodbhava on the west, Brahma on the north; and on the closed hall more niches between
//   the pilasters;
// - round the chariot hall's platform, bands of tiny carved panels: dancers, musicians and
//   elephants, a few centimetres tall, which made the temple famous.
function architecture(f) {
  const { B, VW, VH, vz, mz, az, aw, ad, AB } = DIMS, d = new THREE.Group(), kudus = [];
  let y = VH + 0.35;
  for (let i = 0; i < 4; i++) {
    const tw = (VW - 1.2) * (1 - (0.5 * i) / 5), n = Math.floor((tw * 0.6) / 1.1), ky = y + 2.25 * 0.86;
    for (const a of FACES) for (let k = 0; k < n; k++) {
      const lat = -tw * 0.3 + (k + 0.5) * ((tw * 0.6) / n), ca = Math.cos(a), sa = Math.sin(a), dist = (tw + 0.8) / 2 + 0.05;
      kudus.push([sa * dist + ca * lat, ky, vz + ca * dist - sa * lat, 0.7, 0.7, 0.7, a]);
    }
    y += 2.25;
  }
  d.add(instances(kuduGeo(), kudus, GRANITE));
  for (const a of [Math.PI, Math.PI / 2, -Math.PI / 2]) for (const lat of [-3.6, 0, 3.6]) {
    const o = onFace(at(templeNiche(lat ? 1 : 1.4, lat ? 2.4 : 3, GRANITE, { figure: idol(lat ? 2.1 : 2.6, GRANITE) }), 0, B + 0.6, 0), a, VW / 2 + 0.14, lat);
    o.position.z += vz;
    d.add(o);
  }
  for (const s of [-1, 1]) for (const lat of [-3.5, 0, 3.5]) {
    const o = onFace(at(templeNiche(1, 2.4, GRANITE, { figure: idol(2.1, GRANITE), crown: false }), 0, B + 0.6, 0), s * Math.PI / 2, 7.14, lat);
    o.position.z += mz;
    d.add(o);
  }
  f.add(mergeByMaterial(d));
  // The friezes of the chariot hall's platform, on its front and its two sides.
  for (const a of [0, Math.PI / 2, -Math.PI / 2]) {
    const long = Math.abs(Math.sin(a)) > 0.5, len = long ? ad - 0.6 : aw - 0.6, dist = long ? aw / 2 : ad / 2;
    for (const [yy, h, kinds] of [[0.35, 0.5, ['dancer', 'standing', 'elephant']], [AB - 0.95, 0.45, ['dancer', 'standing']]]) {
      const fr = onFace(at(figureFrieze(len, h, GRANITE, { pitch: detail.low ? 1.1 : 0.55, kinds, proud: 0.06 }), 0, yy, 0), a, dist);
      fr.position.z += az;
      f.add(fr);
    }
  }
}

// The temple in Darasuram: the cloistered court, lawn inside the wall, coconut palms outside it
// and the village's lanes, lamp posts on the path to the gopuram and the ASI board.
export function addDetails(f, g) {
  architecture(f);
  enclosure(g);
  const { ez, EW, ED } = DIMS;
  g.add(box(EW - 2, 0.1, ED - 2, mat('#7b9655', 0.95), 0, -0.1, ez - ED / 2));
  // Paved paths: the axis from the gate to the chariot hall, and round the temple.
  g.add(box(6, 0.06, ez - 21, M.path, 0, 0, (ez + 21) / 2), box(26, 0.06, 56, M.path, 0, 0, -6));
  g.add(box(300, 0.2, 300, M.grass, 0, -0.25, 0), box(10, 0.06, 60, M.path, 0, 0, ez + 30));
  g.add(trees([...along(10, [-42, -42], [-42, 48]), ...along(10, [42, -42], [42, 48]), ...scatter(20, [-110, 110, -100, -50], { seed: 3, gap: 10 })], { kind: 'palm', seed: 5 }));
  g.add(trees([...scatter(detail.low ? 6 : 12, [-110, -45, -40, 120], { seed: 6, gap: 12 }), ...scatter(detail.low ? 6 : 12, [45, 110, -40, 120], { seed: 8, gap: 12 })], { kind: 'neem', seed: 7 }));
  g.add(lampPosts([...along(4, [-6, ez + 8], [-6, ez + 50]), ...along(4, [6, ez + 8], [6, ez + 50])]));
  g.add(shrubs([...along(6, [-20, 30], [-20, 45]), ...along(6, [20, 30], [20, 45])], { size: 1 }));
  g.add(asiBoard('Airavatesvara Temple, Darasuram', 9, ez + 14, -0.3, { line2: 'WORLD HERITAGE SITE' }));
}

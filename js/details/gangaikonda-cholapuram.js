import * as THREE from 'three';
import { M, mat, at, onFace, FACES, box, cyl } from '../helpers.js';
import { templeNiche, idol, mergeByMaterial } from '../parts/components.js';
import { figureFrieze, kuduGeo, instances } from '../parts/sculpture.js';
import { dravidaVimana, dravidaDress } from '../parts/temples.js';
import { nandi, lion } from '../parts/animals.js';
import { trees, shrubs, asiBoard, lampPosts, along, scatter, townHouses } from '../parts/realism.js';
import { enclosure } from '../monuments/gangaikonda-cholapuram.js';
import { detail } from '../detail.js';

// Gangaikonda Cholapuram's granite, a pale honey grey, darker in its mouldings.
export const GRANITE = mat('#b4a084', 0.9);
export const SHADE = mat('#88765e', 0.92);

// VW: the sanctum's base, square, at z = vz; H1, H2: its two storeys of walls. The vestibule aw × al
// at az; the great hall mw × ml, MH high, at mz. The court runs x = ±ex, from z = ez0 to ez1 (its
// gate); the Nandi at nz.
export const DIMS = { VW: 30.5, H1: 9.5, H2: 6.5, vz: -15, aw: 18, al: 19.8, az: 10.15, mw: 26, ml: 53.3, mz: 46.7, MH: 9, ex: 49, ez0: -58, ez1: 112, nz: 90 };

// Gangaikonda Cholapuram, finer detail. From photographs:
// - the two storeys of the sanctum's walls hold deities in niches between the pilasters, among
//   them the famous Chandesanugrahamurti (Shiva garlanding his devotee) beside the north door,
//   Nataraja, Ardhanarishvara and Saraswati; here as images in niches, five a face in each storey;
// - the upper storeys of the vimana are lined with kudus, the horseshoe dormers, along their cornices;
// - bands of carving, dancers and musicians, run round the base of the hall and the vestibule.
function architecture(f) {
  const { VW, H1, H2, vz, az, aw, al, mz, mw, ml } = DIMS, d = new THREE.Group(), kudus = [];
  for (const a of FACES) for (const lat of [-11, -5.5, 0, 5.5, 11]) {
    if (a === 0) continue;
    for (const [y, dist, h] of [[1.6, VW / 2 + 0.14, 4.2], [H1 + 0.6, (VW - 1.6) / 2 + 0.14, 3.6]]) {
      const o = onFace(at(templeNiche(lat ? 1.3 : 1.7, h, GRANITE, { figure: idol(h * 0.85, GRANITE) }), 0, y, 0), a, dist, lat * (y > H1 ? 0.95 : 1));
      o.position.z += vz;
      d.add(o);
    }
  }
  // Niches on the vestibule's and the hall's long walls.
  for (const s of [-1, 1]) {
    for (const lat of [-6.5, 6.5]) { const o = onFace(at(templeNiche(1.2, 3.4, GRANITE, { figure: idol(2.9, GRANITE) }), 0, 1.6, 0), s * Math.PI / 2, aw / 2 + 0.14, lat); o.position.z += az; d.add(o); }
    for (let k = -4; k <= 4; k++) { const o = onFace(at(templeNiche(1, 2.8, GRANITE, { figure: idol(2.4, GRANITE), crown: false }), 0, 1.5, 0), s * Math.PI / 2, mw / 2 + 0.14, k * 5.6); o.position.z += mz; d.add(o); }
  }
  // Kudus on the vimana's storeys: their widths follow the builder's curve.
  const tiers = 7, th = 3.9, w0 = VW - 1.6 - 2.6, w1 = 8.6;
  let y = H1 + H2 + 0.4;
  for (let i = 0; i < tiers - 1; i++) {
    const t = i / (tiers - 1), tw = w1 + (w0 - w1) * Math.pow(1 - t, 1.45), n = Math.floor((tw * 0.6) / 1.3), ky = y + th * 0.86;
    for (const a of FACES) for (let k = 0; k < n; k++) {
      const lat = -tw * 0.3 + (k + 0.5) * ((tw * 0.6) / n), ca = Math.cos(a), sa = Math.sin(a), dist = (tw + 0.9) / 2 + 0.05;
      kudus.push([sa * dist + ca * lat, ky, vz + ca * dist - sa * lat, 0.85, 0.85, 0.85, a]);
    }
    y += th;
  }
  d.add(instances(kuduGeo(), kudus, GRANITE));
  f.add(mergeByMaterial(d));
  // Friezes round the base of the hall and the vestibule, either side of the hall's front steps.
  const fz = (len, kinds) => figureFrieze(len, 0.5, GRANITE, { pitch: detail.low ? 1.2 : 0.6, kinds, proud: 0.06 });
  for (const s of [-1, 1]) {
    const fr = onFace(at(fz(ml - 1, ['dancer', 'standing', 'elephant']), 0, 0.5, 0), s * Math.PI / 2, mw / 2 + 0.36);
    fr.position.z += mz;
    f.add(fr, at(fz(7.5, ['dancer', 'standing']), s * 8.5, 0.5, mz + ml / 2 + 0.36));
  }
  for (const s of [-1, 1]) { const fr = onFace(at(figureFrieze(al - 8, 0.5, GRANITE, { pitch: detail.low ? 1.2 : 0.6, kinds: ['dancer', 'standing'], proud: 0.06 }), 0, 0.5, 0), s * Math.PI / 2, aw / 2 + 0.36, s * 5.5); fr.position.z += az; f.add(fr); }
}

// The smaller shrines in the court: Chandikeshvara's to the north of the vimana, the goddess's
// (Durga, Periyanayaki) to the north-west, and a small shrine to the south.
function shrines(g) {
  const s = new THREE.Group();
  for (const [x, z, w, tiers] of [[-24, -4, 6, 1], [-34, -38, 8, 2], [30, -34, 6.5, 1]]) {
    s.add(box(w, 5, w, GRANITE, x, 0, z), at(dravidaDress(w, w, 5, GRANITE, { eaveM: SHADE }), x, 0, z));
    s.add(at(dravidaVimana(w - 0.8, tiers, 1.9, GRANITE, SHADE, { taper: 0.4, capScale: 0.36, kalashScale: 0.5 }), x, 5.3, z));
  }
  g.add(s);
}

// The temple in its court near Jayankondam: lawns inside the wall, the great Nandi on the axis, the
// lion well (Simha-kinaru) to the south-east with its stone lion, palms and neem round the court,
// the village beyond, lamps on the path from the gate and the ASI board.
export function addDetails(f, g) {
  architecture(f);
  enclosure(g);
  shrines(g);
  const { ex, ez0, ez1, nz } = DIMS;
  g.add(box(ex * 2 - 2, 0.1, ez1 - ez0 - 2, mat('#7d9757', 0.95), 0, -0.1, (ez0 + ez1) / 2));
  g.add(box(500, 0.2, 500, M.grass, 0, -0.25, 20));
  // Paths: the axis from the gate to the hall's steps, and the paved round the temple.
  g.add(box(7, 0.06, ez1 - 75, M.path, 0, 0, (ez1 + 75) / 2), box(42, 0.06, 106, M.path, 0, 0, 20));
  g.add(box(10, 0.06, 80, M.path, 0, 0, ez1 + 40));
  // The great Nandi, of plastered brick, on its platform facing the sanctum.
  g.add(box(9, 1.6, 12, SHADE, 0, 0, nz), box(8, 0.3, 11, GRANITE, 0, 1.6, nz));
  g.add(at(nandi(mat('#d8d0c0', 0.8), 1.35), 0, 1.9, nz).rotateY(Math.PI));
  // The lion well: a round stone kerb, the lion seated before its steps.
  g.add(cyl(3.2, 3.4, 1, SHADE, 34, 0, 72), cyl(2.6, 2.6, 0.05, M.water, 34, 0.95, 72, 24));
  g.add(at(lion(1.6, GRANITE), 34, 0, 64).rotateY(Math.PI));
  g.add(trees([...along(9, [-ex + 6, ez0 + 8], [-ex + 6, ez1 - 10]), ...along(9, [ex - 6, ez0 + 8], [ex - 6, ez1 - 10])], { kind: 'palm', seed: 4 }));
  g.add(trees([...scatter(detail.low ? 8 : 16, [-200, -60, -120, 180], { seed: 5, gap: 14 }), ...scatter(detail.low ? 8 : 16, [60, 200, -120, 180], { seed: 6, gap: 14 })], { kind: 'neem', seed: 6 }));
  g.add(trees(scatter(detail.low ? 10 : 22, [-200, 200, -200, -70], { seed: 7, gap: 12 }), { kind: 'palm', seed: 8 }));
  g.add(shrubs([...along(8, [-8, ez1 - 30], [-8, ez1 - 4]), ...along(8, [8, ez1 - 30], [8, ez1 - 4])], { size: 1 }));
  g.add(lampPosts([...along(4, [-7, ez1 + 10], [-7, ez1 + 70]), ...along(4, [7, ez1 + 10], [7, ez1 + 70])]));
  if (!detail.low) g.add(townHouses([...scatter(26, [-170, -70, 130, 230], { seed: 9, gap: 16 }), ...scatter(26, [70, 170, 130, 230], { seed: 10, gap: 16 })].map(([x, z], k) => [x, z, 7 + (k % 3), 9, 1 + (k % 2)]), { seed: 3, roof: 'pitched', roofs: ['#9a4a32', '#8a3f2c', '#a65a3c'], tanks: 0.2 }));
  g.add(asiBoard('Brihadisvara Temple, Gangaikonda Cholapuram', 11, ez1 + 16, -0.3, { line2: 'WORLD HERITAGE SITE' }));
}
